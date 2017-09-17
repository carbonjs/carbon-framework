var async = require("async");
var changeCase = require("change-case");
var fs = require("fs");
var _ = require("lodash");

var app = {
   hooks: {},
   init: {}
};

var _app = {};
var _options = {};

var _utils = {
    filesystem: require("./utils/helpers/filesystem")
};

function createApplication() {
    app.express = require("express")();

    return app;
}

app.address = function() {
    return app.express.address();
};

app.getOptions = function() {
    return _options;
};

app.run = function(options, callback) {
    var defaults = {
        baseDomain: "localhost",
        bodyParsers: {
            json: true,
            urlencoded: true
        },
        express: { },
        overrides: {
            absoluteRequire: false
        },
        paths: {
            base: process.cwd(),
            library: _utils.filesystem.appendSlash(process.cwd()) + "library"
        },
        server: {
            hostname: "localhost",
            port: 80
        },
        session: null,
        static: {
            path: "/public"
        }
    };

    _options = _.defaultsDeep(options, defaults);

    if (process.argv.indexOf("cli") > -1)
    {
        _app.initNode();
        _app.initAbsoluteRequire();
        _app.initBootstraps();

        var args = process.argv.slice(process.argv.indexOf("cli") + 1);

        switch (args.length)
        {
            case 3:
                var modules = args[0];
                var controller = args[1];
                var action = args[2];

                modules = modules.split(":");
                modules = _.map(modules, function(module) {
                    return "/modules/" + module;
                });

                controller = "/controllers/" + controller;
                action += "Action";

                var path = modules.join("") + controller;
                controller = require(process.cwd() + path);

                controller()[action].cli();

                break;
        }
    }
    else
    {
        app.server = app.express.listen(_options.server.port, _options.server.hostname, function() {
            _.each(_app, function(func) {
                func();
            });

            if (_.isFunction(callback))
                callback();
        });
    }
};

_app.initNode = function() {
    process.env.NODE_PATH = _options.paths.base;
};

_app.initExpressJS = function() {
    var expr = require("express");

    var bodyParser = require("body-parser");
    var session = require("express-session");
    var cookieParser = require("cookie-parser");

    app.express.set("views", [
        _options.paths.base + "/views"
    ]);

    _.each(_options.express, function(value, name) {
        app.express.set(name, value);
    });

    if (_options.bodyParsers)
    {
        if (_options.bodyParsers.json)
            app.express.use(bodyParser.json());

        if (_options.bodyParsers.urlencoded)
            app.express.use(bodyParser.urlencoded({ extended: true }));
    }

    if (_options.static && _options.static.path)
        app.express.use(expr.static(_options.paths.base + "/public"));

    app.express.use(cookieParser());

    if (_.isObject(_options.session))
        app.express.use(session(_options.session));

    app.express.locals.basedir = _options.paths.base + "/views";
};

_app.initAbsoluteRequire = function() {
    if (_options.overrides.absoluteRequire)
    {
        var Module = require("module");

        Module.prototype._require = Module.prototype.require;

        Module.prototype.require = function(path) {
            var nodePath = _options.paths.base;

            if (path.substr(0, nodePath.length) != nodePath && path.charAt(0) == "/")
                return this._require(nodePath + path);
            else
                return this._require(path);
        };
    }
};

_app.initInternals = function() {
    /*app.get = function() {
        app.express.get.apply(app.express, arguments);
    }*/

    app.set = function() {
        app.express.set.apply(app.express, arguments);
    };

    app.use = function() {
        app.express.use.apply(app.express, arguments);
    };
};

_app.initExternals = function() {
    app.File = require("./file")(app);
    app.Helper = require("./helpers");
    app.Navigation = require("./navigation")(app);
    app.Router = require("./router")(app);
};

_app.initExtenders = function() {
    var basePath = _options.paths.library + "/extenders";

    if (_utils.filesystem.isDirectory(basePath))
    {
        fs.readdirSync(basePath).forEach(function(name) {
            var modulePath = basePath + "/" + name;
            require(modulePath).init();
        });
    }
};

_app.initHelpers = function() {
    app.use(function(req, res, next) {
        res.viewPaths = res.viewPaths || app.express.get("views");

        var globalHelpers = _utils.filesystem.appendSlash(__dirname)  + "helpers";
        var libraryHelpers = _utils.filesystem.appendSlash(_options.paths.library)  + "helpers";

        if (_utils.filesystem.isDirectory(globalHelpers))
            _utils.loadHelpers(globalHelpers, req, res);

        if (_utils.filesystem.isDirectory(libraryHelpers))
            _utils.loadHelpers(libraryHelpers, req, res);

        next();
    });
};

_app.initHelperFunctions = function() {
    app.use(function(req, res, next) {
        req.getCurrentUrl = function(fullUrl) {
            var url = require("url");

            if (fullUrl)
            {
                return url.format({
                    protocol: req.protocol,
                    host: req.get("host"),
                    pathname: req.originalUrl
                });
            }
            else
                return req.originalUrl;
        };

        next();
    });
};

_app.initHelperAccess = function() {
    app.use(function(req, res, next) {
        res.locals.helper = function(name) {
            if (!_.isFunction(res._helpers[name]))
                throw "Helper \"" + name + "\" is not defined";
            else
            {
                var helper = res._helpers[name](req, res);
                var args = Array.prototype.slice.call(arguments, 1);

                if (!helper)
                    throw "Helper \"" + name + "\" is not defined";
                else
                {
                    if (helper.name)
                        return helper.apply(this, args);
                    else
                    {
                        res._helpers.data = res._helpers.data || {
                            counts: {
                                processed: 0,
                                total: 0
                            },
                            ids: {},
                            queue: {}
                        };

                        var data = res._helpers.data;
                        data.counts.total++;

                        var index = data.counts.total;
                        var placeholder = "{{" + name + "-" + index + "}}";

                        data.ids[res.viewName] = data.ids[res.viewName] || [];
                        data.ids[res.viewName].push(placeholder);

                        data.queue[res.viewName] = data.queue[res.viewName] || [];
                        data.queue[res.viewName].push({
                            helper: helper,
                            params: args
                        });

                        return placeholder;
                    }
                }
            }
        };

        res.helper = function() {
            return res.locals.helper.apply(res.locals, arguments);
        };

        next();
    });
};

_app.overrideRender = function() {
    app.use(function(req, res, next) {
        var _render = res.render;

        res.render = function(view, options, fn) {
            if (typeof options == "function")
            {
                fn = options;
                options = {};
            }

            fn = fn || function(err, str) {
                if (err)
                    return req.next(err);

                res.send(str);
            };

            res.viewName = view;

            var viewPaths = _.map(res.viewPaths, function(path) {
                return _utils.filesystem.appendExtension(_utils.filesystem.appendSlash(path) + view, "jade");
            });

            view = _.find(viewPaths, function(path) {
                return (_utils.filesystem.isFile(path));
            });

            var processHelpers = function(html, callback) {
                if (res._helpers.data)
                {
                    var helpersQueue = res._helpers.data.queue[res.viewName];
                    var helpersIds = res._helpers.data.ids[res.viewName];

                    if (helpersQueue && helpersQueue.length)
                    {
                        var queue = _.map(helpersQueue, function(helper) {
                            return function(callback) {
                                if (helper.params.length)
                                {
                                    var args = helper.params;
                                    args.push(callback);

                                    helper.helper.apply(this, args);
                                }
                                else
                                    helper.helper.call(this, callback);
                            };
                        });

                        async
                            .parallel(
                                queue,
                                function(err, results) {
                                    if (err)
                                        throw err;
                                    else
                                    {
                                        for (var i = 0; i < results.length; i++)
                                        {
                                            html = html.replace(helpersIds[i], results[i]);
                                        }

                                        callback(null, html);
                                    }
                                }
                            )
                        ;
                    }
                    else
                        callback(null, html);
                }
                else
                    callback(null, html);
            };

            _render.call(this, view, options, function(err, html) {
                if (err)
                    fn(err, null);
                else
                {
                    async
                        .waterfall([
                            function(callback) {
                                processHelpers(html, function(err, html) {
                                    if (err)
                                        throw err;
                                    else
                                        callback(null, html);
                                });
                            }
                        ], function(err, html) {
                            if (err)
                                throw err;
                            else
                                fn(null, html);
                        })
                    ;
                }
            });
        };

        next();
    });
};

_app.initModules = function() {
    var modulesPath = _options.paths.base + "/modules/";
    var skipDirectories = ["config", "forms", "helpers", "views"];

    var initControllers = function(path) {
        fs.readdirSync(path).forEach(function(name) {
            var modPath = path + (path.slice(-1) != "/" ? "/" : "") + name;

            var modulePath = require("path");

            var relPath = modPath.replace(modulesPath, "");
            relPath = relPath.replace("/modules", "");
            relPath = relPath.replace("/controllers", "");
            relPath = relPath.replace("/" + name, "");
            relPath = relPath.replace("/", ":");
            relPath += ":" + (modulePath.basename(modPath, modulePath.extname(modPath)));

            try
            {
                var mod = require(modPath);
                mod.resourceId = relPath;
            }
            catch (err)
            {
                console.log("bootstrap::initModules", err, modPath);
            }
        });
    };

    var traverseModules = function(path) {
        var modulesExists = false;
        var modulePath, config;

        if (_utils.filesystem.isFile(path + "/config/navigation.js"))
        {
            config = require(path + "/config/navigation.js");

            app.Navigation.addNavigation(config);
        }

        if (_utils.filesystem.isFile(path + "/config/routes.js"))
        {
            config = require(path + "/config/routes.js");

            app.Router.addRoutes(config);
        }

        if (_utils.filesystem.isDirectory(path + "/modules"))
            traverseModules(path + "/modules");
        else
        {
            if (_utils.filesystem.isDirectory(path + "/controllers"))
                initControllers(path + "/controllers");
            else
            {
                fs.readdirSync(path).forEach(function(name) {
                    var modPath = _utils.filesystem.appendSlash(path) + name;

                    if (skipDirectories.indexOf(name.toLowerCase()) > -1)
                        return;

                    if (_utils.filesystem.isDirectory(modPath))
                        traverseModules(modPath);
                });
            }
        }
    };

    traverseModules(_options.paths.base);
};

_app.initBootstraps = function() {
    _.each(app.inits, function(func) {
        func.apply();
    });
};

_app.initRoutes = function() {
    var routes = _.filter(app.Router.getRoutes(), function(route) {
        return (!_.isUndefined(route.module));
    });

    routes = _.pickBy(app.Router.getRoutes(), function(route) {
        return (!_.isUndefined(route.module));
    });

    var traversedControllers = [];

    _.forEach(routes, function(route, routeName) {
        var modulePath = _options.paths.base + "/" + _.map(route.module.split(":"), function(module) {
            return "modules/" + module;
        }).join("/");

        var controllerPath = modulePath + "/controllers/" + route.controller;

        if (traversedControllers.indexOf(controllerPath) == -1)
            traversedControllers.push(controllerPath);

            var controller = require(controllerPath);
            var controllerBody = controller();
            var resourceId = controller.resourceId;
            var actionName = changeCase.camelCase(route.action) + "Action";

            if (controllerBody[actionName])
            {
                var setupRoute = function(req, res, next) {
                    var routeName = _.findKey(app.Router.getRoutes(), function(route) {
                        return (route.route == req.route.path);
                    });

                    req.currentRoute = app.Router.getRoute(routeName);

                    if (req.currentRoute)
                    {
                        req.currentRoute.name = routeName;
                        req.currentRoute.params = req.params;
                    }

                    next();
                };

                /**
                 * Setup helper paths based on current request
                 */
                var initHelperPaths = function(req, res, next) {
                    var helperPath = modulePath + "/helpers";

                    if (_utils.filesystem.isFile(modulePath))
                        helperPath = helperPath.replace("/" + name, "");

                    var helpersPath = [_options.paths.base + "/helpers"];

                    var helpers = helpersPath.slice();

                    var regex = /(\/modules\/\w+)/g;
                    var parts = helperPath.match(/(\/modules\/[a-zA-Z0-9-_.]+)/g);
                    var path = helperPath.replace(/(\/modules\/[a-zA-Z0-9-_.]+)+/g, "%placeholder%");

                    for (var i = 1; i <= parts.length; i++)
                    {
                        var part = parts.slice(0, i).join("");
                        helpers.unshift(path.replace("%placeholder%", part));
                    }

                    for (i = 0; i < helpers.length; i++)
                    {
                        if (_utils.filesystem.isDirectory(helpers[i]))
                            _utils.loadHelpers(helpers[i], req, res);
                    }

                    next();
                };

                /**
                 * Setup view paths based on current request
                 */
                var initViewPaths = function(req, res, next) {
                    var viewPath = modulePath + "/views";

                    if (_utils.filesystem.isFile(modulePath))
                        viewPath = viewPath.replace("/" + name, "");

                    if (_utils.filesystem.isDirectory(viewPath))
                    {
                        var views = app.express.get("views").slice();

                        var regex = /(\/modules\/\w+)/g;
                        var parts = viewPath.match(/(\/modules\/[a-zA-Z0-9-_.]+)/g);
                        var path = viewPath.replace(/(\/modules\/[a-zA-Z0-9-_.]+)+/g, "%placeholder%");

                        for (var i = 1; i <= parts.length; i++)
                        {
                            var part = parts.slice(0, i).join("");
                            views.unshift(path.replace("%placeholder%", part));
                        }

                        res.viewPaths = views;
                    }

                    next();
                };

                var initFunction = controllerBody[actionName].init;
                var initAction = null;

                if (_.isFunction(initFunction))
                {
                    delete controllerBody[actionName].init;

                    initAction = function(req, res, next) {
                        if (initFunction.length == 2)
                        {
                            initFunction(req, res);
                            next();
                        }
                        else
                            initFunction(req, res, next);
                    };
                }

                _.each(controllerBody[actionName], function(action, method) {
                    var args = [route.route, setupRoute, initViewPaths, initHelperPaths];

                    _.each(app.hooks.preAction, function(preAction) {
                        args.push(preAction);
                    });

                    if (initAction)
                        args.push(initAction);

                    args.push(action);

                    app.express[method].apply(app.express, args);
                });
            //}
        }
    });
};

_app.initErrors = function() {
    if (app.hooks.errors)
    {
        if (app.hooks.errors.serverError && _.isFunction(app.hooks.errors.serverError))
            app.use(app.hooks.errors.serverError);

        if (app.hooks.errors.notFound && _.isFunction(app.hooks.errors.notFound))
            app.use(app.hooks.errors.notFound);
    }
};

_utils.loadHelpers = function(path, req, res) {
    var helpers = {};

    fs.readdirSync(path).forEach(function(name, index, names) {
        var newPath = _utils.filesystem.appendSlash(path) + name;

        try
        {
            var helper = require(newPath);

            if (!_.isFunction(helper))
            {
                var _helper = helper;

                helper = function(req, res) {
                    return function _() {
                        return _helper;
                    };
                };
            }

            helpers[changeCase.camelCase(name.replace(".js", ""))] = helper;
        }
        catch (err)
        {
            throw err;
        }

        if (index == names.length - 1)
        {
            if (!_.isUndefined(res._helpers))
                helpers = _.defaults(res._helpers, helpers);

            if (res)
                res._helpers = helpers;
        }
    });

    return helpers;
};

exports = module.exports = createApplication;
