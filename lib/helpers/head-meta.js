/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var jade = require("jade");
var _ = require("lodash");

module.exports = function(req, res) {
	var helper = this;

	helper._meta = helper._meta || [];

	return function headMeta() {
		return {
			appendMeta: function(options) {
				if (arguments.length == 2)
				{
					options = {
						name: arguments[0],
						content: arguments[1]
					};
				}

				helper._meta.push(options);

				return this;
			},
			toString: function() {
				if (helper._meta.length)
				{
					var jadeString = _.reduce(helper._meta, function(string, link) {
						var params = _.map(link, function(value, key) {
							return key + "=\"" + value + "\"";
						}).join(",");

						return string + "meta(" + params + ")\r";
					}, "");

					return jade.render(jadeString);
				}
				else
					return "";
			}
		}
	};
};
