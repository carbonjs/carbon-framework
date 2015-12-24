var app = require("../index");

var jade = require("jade");
var _ = require("lodash");

var url = require("./url");

module.exports = function(req, res) {
    return function navigation(name) {
        var nav = app.Navigation.getNavigation(name);

        if (name && nav)
        {
    		var jadeString = "ul(class='" + (nav.class || "navigation") + "')\r";
    		var spacing = "\t";
    		var level = -3;

    		var processNavigation = function(item) {
    			level+=2;

    			if (item.label)
    			{
                    jadeString += spacing.repeat(level) + "li" + (item.route && req.currentRoute ? (item.route == req.currentRoute.name ? "(class='active')" : "") : "") +"\r";

                    if (item.route)
                        item.uri = url.getUrl(item.route);

                    var params = {
                        href: item.uri ? item.uri : undefined,
                        class: item.class ? item.class : undefined
                    };

                    params = _.omit(params, function(value, key) {
                        return (_.isUndefined(value));
                    });

                    var paramString = _.map(params, function(value, key) {
                        return key + "='" + value + "'";
                    }).join(", ");

                    jadeString += spacing.repeat(level) + spacing + (item.uri ? "a" : "span") + "(" + paramString + ")";

    				jadeString += " " + item.label + "\r";
    			}

    			if (item.children)
    			{
    				jadeString += level > 0 ? spacing.repeat(level) + spacing + "ul\r" : "";

    				_.each(item.children, function(child) {
    					processNavigation(child);
    				});
    			}

    			level-=2;
    		};

    		processNavigation(nav);

    		return jade.render(jadeString);
        }
    }
};
