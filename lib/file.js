/**
 * @Author: Amir Ahmetovic <choxnox>
 * @License: MIT
 */

var _ = require("lodash");

module.exports = function(app) {
    var file = {
        handleUpload: function(req, res, callback) {
            var os = require("os");
            var multer = require("multer");
            var upload = multer({ dest: os.tmpdir() });

            if (_.isFunction(callback))
            {
                upload.any()(req, res, function(err) {
                    callback(err);
                });
            }
            else
                return upload.any();
        }
    };

    return file;
};
