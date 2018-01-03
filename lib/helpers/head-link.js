/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var jade = require("jade");
var _ = require("lodash");

module.exports = function(req, res) {
	var helper = this;

	helper._links = helper._links || [];
	helper._stylesheets = helper._stylesheets || [];

	return function headLink() {
		return {
			appendStylesheet: function(path) {
				if (helper._stylesheets.indexOf(path) < 0)
					helper._stylesheets.push(path);

				return this;
			},
			setShortcutIcon: function(path) {
				var shortcutIcon = _.find(helper._links, { rel: "shortcut icon" });

				if (shortcutIcon)
					shortcutIcon["href"] = path;
				else
				{
					shortcutIcon = {
						rel: "shortcut icon",
						href: path
					};

					helper._links.push(shortcutIcon);
				}

				return this;
			},
			toString: function() {
				var stylesheets = _.map(helper._stylesheets, function(stylesheet) {
					return {
						rel: "stylesheet",
						href: stylesheet
					}
				});

				var links = _.union(helper._links, stylesheets);

				if (links.length)
				{
					var jadeString = _.reduce(links, function(string, link) {
						return string + "link(rel='" + link.rel + "', href='" + link.href + "')\r";
					}, "");

					return jade.render(jadeString);
				}
				else
					return "";
			}
		}
	};
};
