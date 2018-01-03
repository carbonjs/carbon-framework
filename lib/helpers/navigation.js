/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

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
