module.exports = function() {
    return {
        blogAction: {
            get: function(req, res) {
                res.send("Blog page");
            }
        },
        return500Action: {
            get: function(req, res) {
                nonExistingFunction();
            }
        }
    }
};
