/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var fs = require("fs");

exports.appendExtension = function(path, extension) {
    if (extension.substr(0, 1) != ".")
        extension = "." + extension;

    if (path.substr(-extension.length, extension.length) != extension)
        path += extension;

    return path;
}

exports.appendSlash = function(path) {
    if (path.substr(-1, 1) != "/")
        path += "/";

    return path;
}

exports.isDirectory = function(path)
{
    var isDirectory = false;

    try
    {
        if (fs.lstatSync(path).isDirectory())
            isDirectory = true;
    }
    catch (err) { }

    return isDirectory;
}

exports.isFile = function(path)
{
    var isFile = false;

    try
    {
        if (fs.lstatSync(path).isFile())
            isFile = true;
    }
    catch (err) { }

    return isFile;
}
