/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var _ = require("lodash");

module.exports = function(app) {
    var navigation = {
        addNavigation: function(navigation) {
            app.express.locals._navigation._navigation = _.extend({}, app.express.locals._navigation._navigation, navigation);
        },
        getNavigation: function(name) {
            return app.express.locals._navigation._navigation[name];
        }
    };

    app.express.locals._navigation = app.express.locals._navigation || navigation;

    return navigation;
};
