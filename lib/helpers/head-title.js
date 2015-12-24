var jade = require("jade");
var _ = require("lodash");

module.exports = function(req, res) {
	var helper = this;

	helper._prefix = helper._prefix || "";
	helper._title = helper._title || "";
	helper._suffix = helper._suffix || "";
	helper._separator = helper._separator || "";

	return function headTitle() {
		return {
			setPrefix: function(prefix) {
				helper._prefix = prefix;

				return this;
			},
			setSeparator: function(separator) {
				helper._separator = separator;

				return this;
			},
			setSuffix: function(suffix) {
				helper._suffix = suffix;

				return this;
			},
			setTitle: function(title) {
				helper._title = title;

				return this;
			},
			toString: function() {
				var title = (helper._prefix.length ? (helper._prefix +  " " + helper._separator + " ") : "") +
							helper._title +
							(helper._suffix.length ? (" " + helper._separator + " " + helper._suffix) : "");

				if (title.length)
				{
					var jadeString = "title " + title + "\r";

					return jade.render(jadeString);
				}
				else
					return "";
			}
		}
	};
};
