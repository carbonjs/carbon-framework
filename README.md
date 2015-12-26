# CarbonJS / `carbon-framework`
CarbonJS is a modular MVC framework for NodeJS based on Zend Framework which uses ExpressJS in the background. It truly is modular framework which means each module can have it's own controllers, views, layouts, routes, navigation, forms, models, configuration and more. Each module can function as a separate entity or as a part of a larger system. The best of all is that modules are plug-and-play so you can easily copy modules that you already have in one project to another project without any configuration whatsoever.

Imagine you have an `auth` module in one project and within that module you have modules `local` (login/signup via username/email address and password), `facebook` (connect to your auth system through Facebook) and `twitter` (connect to your auth system through Twitter). Now imagine that each of these modules are already fully functional. When in your next project you want to have an authorization system all you have to do is simply copy module from your previous project. You don't want Twitter authorization? No problem, simply remove `twitter` module from your new project.

Running a website with CarbonJS is even easier: just set some basic parameters such as hostname and port, domains used etd. and you're ready to rock.

## Getting started
### Installation
```
npm install carbon-framework [--save]
```

### Project structure
Even though CarbonJS is a use-as-you-wish framework it requires that you follow some very basic rules when it comes to structuring your project. This is bare minimum that is required to run your project:

```
Project root
├─ library
   └─ helpers
├─ modules
└─ views
   ├─ helpers
   ├─ layouts
   └─ scripts
```

* `library` - Keep all your code related to your application organized under one directory.
* `library/helpers` - Contains application-level helpers which will be available through your application. For example, here you can put parts of code that will be reused all the time such as a helper to render header or footer of your application.
* `views/helper` - Contains view templates of your helpers (if needed).
* `views/layout` - Contains view layouts for your application.
* `views/scripts` - Contains view templates of the application-level pages such as 404 or 500 errors.
* `modules` - This is a special root directory for all of your modules.

One of the best things regarding CarbonJS is you can nest as much modules as you need. Take a look at the following sample project structure:

```
Project root
└─ modules
   ├─ admin
   │  └─ modules
   │     ├─ category
   │     │  ├─ config
   │     │  ├─ controllers
   │     │  ├─ forms
   │     │  └─ views
   │     ├─ products
   │     │  ├─ config
   │     │  ├─ controllers
   │     │  ├─ forms
   │     │  └─ views
   │     └─ users
   │        ├─ config
   │        ├─ controllers
   │        ├─ forms
   │        └─ views
   ├─ auth
   │  └─ modules
   │     ├─ facebook
   │     │  ├─ config
   │     │  └─ controllers
   │     ├─ local
   │     │  ├─ config
   │     │  ├─ controllers
   │     │  ├─ forms
   │     │  └─ views
   │     └─ twitter
   │        ├─ config
   │        └─ controllers
   └─ default
      ├─ config
      ├─ controllers
      ├─ forms
      └─ views
```

As already said each module can have its own set of modules, configs, forms etc. This allows you to create truly modular web applications and makes reusing modules in another project easier than ever.

### Bootstraping
In your main application file include `carbon-framework`, set some startup options and execute `run` function which is the single entry point to the framework and which takes over all the hard work for you.

```js
var app = require("carbon-framework");

app.run({
	baseDomain: "http://localhost:1234",
	server: {
		port: 1234
	}
}, function() {
	console.log("Server is now running on port " + app.server.address().port + ".");
});

module.exports = exports = app;
```

### Configuration
There are few options you can configure before your execute your application and which you set by pass them to the `run` function. These options include

* `baseDomain` [`String`] - Base domain for your application which is used by the router to generate full URLs to your resources.
* `express` [`Object`] - Since CarbonJS is based on ExpressJS you can manually pass options to the ExpressJS framework.
* `overrides`
  * `absoluteRequire` [`Boolean`] - Overrides the `require` function which is used to load modules in such way that you can load Node.js modules from any CarbonJS module regardless of the depth the CarbonJS module (for example it allows you to simply load Node.js module `var Users = require("/models/db/users")`).
* `paths`
  * `base` [`String`] - Base path to your application; usually you don't need touch this.
  * `library` [`String`] - Path to the library directory (defaults to `library`)
* `server`
  * `hostname` [`String`] - Defaults to `localhost`
  * `port` [`Integer`] - Defaults to `80`
* `session` [`Object`] - CarbonJS uses `express-session` for session handling and here you can pass options to it.

### Custom initialization
CarbonJS gives you ability to run any code during the bootstraping of your application which is executed only once during this process. Here you can put things like setting up database connection or ACL or anything else. You can define functions through `inits` object provided by CarbonJS.

```js
var app = require("carbon-framework");

app.inits = {
	initDatabase: function() {
		// code to init database goes here
	},
	setSomethingForEachRequest: function() {
		app.use(function(req, res, next) { // CarbonJS extends ExpressJS's `use` function
			// code to do something goes here
			
			next();
		});
	}
};

app.run();
```

### Hooks
Hooks are special events that occur during the lifetime of your application and they give you a way to execute custom code when they happen. Currently there are 2 types of hooks in CarbonJS: `errors` and `preAction`.

The `errors` hook occur when there is an error in your application and currently it recognizes 2 errors: `notFound` (error 404 when route can't be found) and `serverError` (error 500 when there is a problem with your application). This allows you to handle errors gracefully like displaying custom templates or sending an email to the administrator of your application.

The `preAction` hook allows you to specify one or more functions which will be executed before each action. For example here you can put the logic which checks whether current user is allowed to access currently routed action or not.

```js
var app = require("carbon-framework");

app.hooks = {
	errors: {
		notFound: function(req, res, next) {
			// handle 404 error
		},
		serverError: function(err, req, res, next) {
			// handle 500 error
		}
	},
	preAction: {
		checkAcl: function(req, res, next) {
			// Access control logic goes here
		}
	}
};

app.run();
```

### Controllers
Controllers in CarbonJS have easy-to-follow structure which helps you organize application logic. They're nothing more than Node.js modules with specific structure as below:

```js
module.exports = function() {
	return {
		indexAction: {
			init: function(req, res) {
				// this code gets execute regardless of the method and it's optional (you don't need to use it 
				// if it's not necessary)
				// this is good place to define page title or some other code not bound to specific method
			},
			delete: function(req, res) {
				// code for DELETE HTTP method goes; it's optional
			},
			get: function(req, res) {
				// code for GET HTTP method goes; it's optional
			},
			post: function(req, res) {
				// code for POST HTTP method goes; it's optional
			},
			put: function(req, res) {
				// code for PUT HTTP method goes; it's optional
			}
		}
	}
}
```

Controller in CarbonJS needs to return an object which is nothing more than a list of actions defined for that controller. Under each action you need to define one or more HTTP method which will be executed by your application. There is a special `init` case which is not an HTTP method but it will be executed before any HTTP method.

To render specific view script all you have to do is:

```js
	...
	indexAction: {
		get: function(req, res) {
			res.render("scripts/index", {
				some: "data"
			});
		}
	}
	...
```
