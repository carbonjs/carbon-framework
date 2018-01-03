/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var jade = require("jade");
var _ = require("lodash");

module.exports = function(req, res) {
	var helper = this;

	helper._scripts = helper._scripts || [];

	return function headScript() {
		return {
			appendScript: function(path) {
				if (helper._scripts.indexOf(path) < 0)
					helper._scripts.push(path);

				return this;
			},
			toString: function() {
				if (helper._scripts.length)
				{
					var jadeString = _.reduce(helper._scripts, function(string, script) {
						return string + "script(src='" + script + "')\r";
					}, "");

					return jade.render(jadeString);
				}
				else
					return "";
			}
		}
	};
};
