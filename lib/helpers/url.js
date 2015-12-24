var app = require("../index");

var _ = require("lodash");

exports.getUrl = function(routeName, params, fullUrl) {
    var route = app.Router.getRoute(routeName);

    if (!_.isObject(params))
        params = {};

    if (!route)
        throw "There is no route named \"" + routeName + "\"";
    else
    {
        route = route.route;

        var regex = /(:[a-zA-Z]+)/g;
        var routeParams = _(route.match(regex))
            .map(function(param) {
                return param.replace(":", "")
            })
            .object([])
            .mapValues(function(value, key) {
                return (params[key] ? params[key] : "");
            })
            .value()
        ;

        _.each(routeParams, function(value, key) {
            route = route.replace(":" + key, value);
        });

        route = route.replace("?", "", "g");

        // remove trailing slash
        if (route.length > 1 && route.charAt(route.length - 1) == "/")
            route = route.substr(0, route.length - 1);

        if (fullUrl)
            route = app.getOptions()["baseDomain"] + route;
    }

    return route;
}
