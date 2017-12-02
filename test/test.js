var chai = require("chai");
var request = require("supertest");

var expect = chai.expect;

describe("Framework", function() {
    this.timeout(5000);

    var app, appConfig;

    beforeEach(function() {
        delete require.cache[require.resolve("../index")]
        app = require("../index");

        appConfig = {
            paths: {
                base: process.cwd() + "/test"
            }
        };
    });

    describe("Basics", function() {
        it("should start a server instance by default", function(done) {
            app.run(appConfig, function() {
                done();
            });
        });
    });

    describe("Hooks", function() {
        it("should return custom 404 page", function(done) {
            app.hooks = {
                errors: {
                    notFound: function(req, res, next) {
                        res.status(404).send("Page not found");
                    }
                }
            };

            app.run(appConfig);

            request(app.server)
                .get("/missing")
                .expect(404, "Page not found", done)
            ;
        });

        it("should return custom 500 page", function(done) {
            app.hooks = {
                errors: {
                    serverError: function(err, req, res, next) {
                        res.status(500).send("Server error");
                    }
                }
            };

            app.run(appConfig);

            request(app.server)
                .get("/return-500")
                .expect(500, "Server error", done)
            ;
        });
    });

    describe("Routing", function() {
        it("should return 200 for a known route", function(done) {
            app.run(appConfig);

            request(app.server)
                .get("/blog")
                .expect("Blog page", done)
            ;
        });

        it("should return 404 for unknown route", function(done) {
            app.run(appConfig);

            request(app.server)
                .get("/")
                .expect(404, done)
            ;
        });
    });
});
