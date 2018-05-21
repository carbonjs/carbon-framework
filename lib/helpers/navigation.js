/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */



var app = require("../index");

var async = require("async");
var jade = require("jade");
var _ = require("lodash");

var url = require("./url");

module.exports = function(req, res) {
    return function(name, options, callback) {
        var nav = app.Navigation.getNavigation(name);

        if (_.isFunction(options))
            callback = options;

        var defaultOptions = {
            acl: null,
            roleId: null
        };

        options = _.extend({}, defaultOptions, options);

        if (name && nav)
        {
    		var spacing = "\t";
    		var level = -1;

            var func = [
                function(callback) {
                    callback(null, "ul(class='" + (nav.class || "navigation") + "')\r", level, true);
                }
            ];

            var drawItem = function(level, item) {
                var jadeString = "";

                if (item.label)
    			{
                    jadeString += spacing.repeat(level) + "li" + (item.route && req.currentRoute ? (item.route == req.currentRoute.name && _.isEqual(item.params, req.currentRoute.params) ? "(class='active')" : "") : "") +"\r";

                    item.attribs = _.extend({ href: "" }, item.attribs);

                    if (item.route)
                    {
                        item.params = _.extend({}, item.params);
                        item.attribs.href = url.getUrl(item.route, item.params);
                    }

                    var attribString = _.map(item.attribs, function(value, key) {
                        return key + "='" + value + "'";
                    }).join(", ");

                    jadeString += spacing.repeat(level) + spacing + (item.attribs.href ? "a" : "span") + "(" + attribString + ")";

    				jadeString += " " + item.label + "\r";
    			}

                return jadeString;
            };

            var drawGroup = function(level) {
                return level > 0 ? spacing.repeat(level) + spacing + "ul\r" : "";
            }

            var processNavigation = function(level, item) {
                level += 2;

                if (item.label)
                {
                    func.push(function(nav, prevLevel, prevAllowed, callback) {
                        if (level > prevLevel && !prevAllowed)
                        {
                            callback(null, nav, prevLevel, prevAllowed);
                        }
                        else
                        {
                            if (options.acl && options.roleId && item.resource && item.privilege)
                            {
                                options.acl.isAllowed(options.roleId, item.resource, item.privilege, function(err, allowed) {
                                    if (allowed)
                                        nav += drawItem(level, item);

                                    callback(null, nav, level, allowed);
                                });
                            }
                            else
                            {
                                nav += drawItem(level, item);

                                callback(null, nav, level, true);
                            }
                        }
                    });
                }

                if (item.children)
                {
                    func.push(function(nav, prevLevel, prevAllowed, callback) {
                        if (options.acl && options.roleId && item.resource && item.privilege)
                        {
                            options.acl.isAllowed(options.roleId, item.resource, item.privilege, function(err, allowed) {
                                if (allowed)
                                    nav += drawGroup(level);

                                callback(null, nav, level, allowed);
                            });
                        }
                        else
                        {
                            nav += drawGroup(level);

                            callback(null, nav, level, true);
                        }
                    });

                    _.each(item.children, function(child) {
                        processNavigation(level, child);
                    });
                }

                level -= 2;
            };

            processNavigation(level, nav);

            async.waterfall(func, function(err, jadeString) {
                callback(null, jade.render(jadeString));
            });
        }
    }
};
