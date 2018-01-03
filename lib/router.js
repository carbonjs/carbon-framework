/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var _ = require("lodash");

module.exports = function(app) {
    var router = {
        _routes: {},
        addRoutes: function(routes) {
            app.express.locals._router._routes = _.extend({}, app.express.locals._router._routes, routes);
        },
        getRoute: function(routeName) {
            return app.express.locals._router._routes[routeName];
        },
        getRoutes: function() {
            return app.express.locals._router._routes;
        }
    };

    app.express.locals._router = app.express.locals._router || router;

    return router;
};
