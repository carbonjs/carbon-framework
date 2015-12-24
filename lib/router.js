var app = require("./index");

var _ = require("lodash");

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
}

app.express.locals._router = app.express.locals._router || router;

module.exports = router;
