var changeCase = require("change-case");
var fs = require("fs");
var path = require("path");

var filesystem = require("./utils/helpers/filesystem");

var basePath = filesystem.appendSlash(__dirname) + "helpers";

fs.readdirSync(basePath).forEach(function(name) {
    var helperPath = path.basename(filesystem.appendSlash(basePath) + name, ".js");
    var helper = require(filesystem.appendSlash(basePath) + name);

    exports[changeCase.pascalCase(helperPath)] = helper;
});
