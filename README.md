# CarbonJS Framework / `carbon-framework` <a id="intro"></a>
CarbonJS is a modular MVC framework for NodeJS based on Zend Framework which uses ExpressJS in the background. It truly is modular framework which means each module can have it's own controllers, views, layouts, routes, navigation, forms, models, configuration and more. Each module can function as a separate entity or as a part of a larger system. The best of all is that modules are plug-and-play so you can easily copy modules that you already have in one project to another project without any configuration whatsoever.

Imagine you have an `auth` module in one project and within that module you have modules `local` (login/signup via username/email address and password), `facebook` (connect to your auth system through Facebook) and `twitter` (connect to your auth system through Twitter). Now imagine that each of these modules are already fully functional. When in your next project you want to have an authorization system all you have to do is simply copy module from your previous project. You don't want Twitter authorization? No problem, simply remove `twitter` module from your new project.

Running a website with CarbonJS is even easier: just set some basic parameters such as hostname and port, domains used etd. and you're ready to rock.

## Getting started <a id="getting-started"></a>
### Installation <a id="installation"></a>
```
npm install carbon-framework [--save]
```

### Project structure <a id="project-structure"></a>
Even though CarbonJS is a use-as-you-wish framework it requires that you follow some very basic rules when it comes to structuring your project. This is bare minimum that is required to run your project:

```
Project root
├─ library
   └─ helpers
├─ modules
├─ public
└─ views
   ├─ helpers
   ├─ layouts
   └─ scripts
```

* `library` - Keep all your code related to your application organized under one directory.
* `library/helpers` - Contains application-level helpers which will be available through your application. For example, here you can put parts of code that will be reused all the time such as a helper to render header or footer of your application.
* `public` - Contains all files which need to be accessible from the client side (e.g. images, CSS & JS files etc.)
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

### Bootstrapping <a id="bootstrapping"></a>
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

### Configuration <a id="configuration"></a>
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

### Custom initialization <a id="custom-init"></a>
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

### Hooks <a id="hooks"></a>
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

### Controllers <a id="controllers"></a>
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

### Routing <a id="routing"></a>
CarbonJS has it's own router which does the job of matching specific routes to the appropriate controller-action. Usually you don't need to access the router directly but you can:

```js
var app = require("carbon-framework");
var router = app.Router;
```

To make the CarbonJS framework do as much work for you as possible, routes can be defined in a configuration file from where they'll be passed to the router. File name must be `routes.js` and it must reside inside `config` folder either in the root directory of your project or inside CarbonJS modules. The structure for this file is:

```js
module.exports = {
	"auth-login": {
        route: "/login",
        module: "auth:local",
        controller: "login",
        action: "login",
        sitemap: {
            priority: 0.9,
            frequency: "daily"
        }
	},
	"auth-logout": {
        route: "/logout",
        module: "auth:local",
        controller: "login",
        action: "logout"
    }
}
```

As you can see we've defined two routes: 
* `auth-login` which responds to the `/login` URL and which executes `login` action from the `login` controller found under modules `auth/login`.
* `auth-logout` which responds to the `/logout` URL and which executes `logout` action from the `login` controller found under modules `auth/login`.

### Helpers <a id="helpers"></a>
CarbonJS comes with few handy helpers which help you get started fast but you can also write your own. Helpers are accessible in both controllers and views. What they do is help you organize parts of code which you'd repeat over and over again or parts of code for which you'd like to separate certain logic.

#### HeadLink helper <a id="headlink-helper"></a>
The `HeadLink` helper is used when you want to add `link` HTML element to your view layouts or scripts. Usually during the bootstraping of your application you'll define appropriate CSS stylesheet files that will style your application or maybe add a favicon.

```js
var app = require("carbon-framework");

app.inits = {
	initMyStylesheets: function() {
		app.use(function(req, res, next) {
			res
				.helper("headLink")
				.setShortcutIcon("/favicon.png")
				.appendStylesheet("/assets/css/style.css")
				.appendStylesheet("//www.external.com/styles/style1.css")
			;
		});
	}
}
```

You can also modify `HeadLink` from within controllers which will make changes to the view only for that action:

```js
	...
	indexAction: {
		init: function(req, res) {
			res.helper("headLink").appendStylesheet("/assets/css/index.css");
		},
		get: function(req, res) {
			res.helper("headLink").appendStylesheet("/assets/css/index-get.css");

			res.render("scripts/index", {
				some: "data"
			});
		}
	}
	...
```

To output `HeadLink` to your view layouts and/or scripts all you have to do is call `HeadLink` helper from the view template:

```Jade
doctype html
	html
		head
			!= helper("headLink")
		body
			...
```

#### HeadMeta helper <a id="headmeta-helper"></a>
The `HeadMeta` helper is used when you want to add `meta` HTML element to your view layouts or scripts.

```js
var app = require("carbon-framework");

app.inits = {
	initMyMeta: function() {
		app.use(function(req, res, next) {
			res
				.helper("headMeta")
				.appendMeta({
					charset: "utf-8"
				})
				.appendMeta({
					"http-equiv": "X-UA-Compatible",
					content: "IE=edge"
				})
				.appendMeta("viewport", "width=device-width, initial-scale=1")
			;
		});
	}
}
```

You can also modify `HeadMeta` from within controllers which will make changes to the view only for that action:

```js
	...
	indexAction: {
		init: function(req, res) {
			res.helper("headMeta").appendMeta({ property: "og:title", content: "My page title" });
		},
		get: function(req, res) {
			res.helper("headMeta").appendMeta({ property: "og:description", content: "My description" });

			res.render("scripts/index", {
				some: "data"
			});
		}
	}
	...
```

To output `HeadMeta` to your view layouts and/or scripts all you have to do is call `HeadMeta` helper from the view template:

```Jade
doctype html
	html
		head
			!= helper("headMeta")
		body
			...
```

#### HeadScript helper <a id="headscript-helper"></a>
The `HeadScript` helper is used when you want to add `script` HTML element to your view layouts or scripts.

```js
var app = require("carbon-framework");

app.inits = {
	initMyScripts: function() {
		app.use(function(req, res, next) {
			res
				.helper("headScript")
				.appendScript("/assets/js/script.js")
				.appendScript("//www.external.com/scripts/script.js")
			;
		});
	}
}
```

You can also modify `HeadScript` from within controllers which will make changes to the view only for that action:

```js
	...
	indexAction: {
		init: function(req, res) {
			res.helper("headScript").appendScript("/assets/js/index.js");
		},
		get: function(req, res) {
			res.helper("headScript").appendScript("/assets/js/index-get.js");

			res.render("scripts/index", {
				some: "data"
			});
		}
	}
	...
```

To output `HeadScript` to your view layouts and/or scripts all you have to do is call `HeadScript` helper from the view template:

```Jade
doctype html
	html
		head
			!= helper("headScript")
		body
			...
```

#### HeadTitle helper <a id="headtitle-helper"></a>
The `HeadTitle` helper is used when you want to add `title` HTML element to your view layouts or scripts.

```js
var app = require("carbon-framework");

app.inits = {
	initMyTitle: function() {
		app.use(function(req, res, next) {
			res
				.helper("headTitle")
				.setPrefix("Look")
				.setSuffix("My Awesome Website")
				.setSeparator("-")
			;
		});
	}
}
```

You can also modify `HeadTitle` from within controllers which will make changes to the view only for that action:

```js
	...
	indexAction: {
		init: function(req, res) {
			res.helper("headTitle").setTitle("My page title");
		}
	}
	...
```

To output `HeadTitle` to your view layouts and/or scripts all you have to do is call `HeadTitle` helper from the view template:

```Jade
doctype html
	html
		head
			!= helper("headTitle")
		body
			...
```

#### Navigation helper <a id="navigation-helper"></a>
The `Navigation` helper is there to help you make client-side navigation which you can reuse over and over again without having to manually write HTML to all script where you need it. To make it work you must put all module-relevant navigation inside `navigation.js` which needs to be placed in the module's `config` directory. The structure for this file is:

```js
	module.exports = {
		"my navigation": {
			class: "navbar",
			children: [
				{
					label: "Categories",
					uri: "#",
					children: [
						{
							label: "Category 1",
							uri: "/categories/1",
						},
						{
							label: "Category 2",
							uri: "/categories/2",
						}
					]
				},
				{
					label: "Login",
					class: "login-class",
					route: "auth-login",
				}
			]
		}
	}
```

As you can see this file consists of an object which we'll reference inside the view by its name `my navigation`. Then we define all menu item under this menu. You can either use `uri` to directly specify URL or `route` which specifies route name that is added to the `Router` previously.

To output this navigation to your view layouts and/or scripts all you have to do is call `Navigation` helper from the view template:

```Jade
doctype html
	html
		head
			!= helper("navigation", "my navigation")
		body
			...
```

This will generate the following HTML output:

```HTML
<ul class="navbar">
	<li>
		<a href="#">Categories</a>
		<ul>
			<li>
				<a href="/categories/1">Category 1</a>
			</li>
			<li>
				<a href="/categories/2">Category 2</a>
			</li>
		</ul>
	</li>
	<li>
		<a class="login-class" href="/login">Login</a>
	</li>
</ul>
```

#### Url helper <a id="url-helper"></a>
The `Url` helper is used when you want to generate a working URL from the route added to the `Router`. It can be called either through `response` or directly from the CarbonJS. It's a special helper which is a collecton of functions to help you handle routes. The main function is `getUrl` with the prototype: `exports.getUrl = function(routeName, params, fullUrl)`.

As you can see it accepts 3 parameters of which the last 2 are optional:
* `routeName` [`String`] - Name of the route added to the `Router`.
* `params` [`Object`] - An object which sets parameters to the route if it has them.
* `fullUrl` [`Boolean`] - Set to `true` if you want to generate URL with a domain name (the one you specify in the `baseDomain` option before your bootstrap your application).

You can generate URL from within the view like this:
```Jade
!= helper("url").getUrl("auth-login")
```

or

```Jade
a(href=(helper("url").getUrl("auth-login")))
```

You can also generate URL from any other part of your application like this:

```js
var app = require("carbon-framework");

var fullLoginUrl = app.Helper.Url.getUrl("auth-login", {}, true);
```

## Who is using it <a id="who-is-using-it"></a>
The CarbonJS is running one of our web applications: [Timelinity](https://www.timelinity.com)

## Contributing <a id="contributing"></a>
If you're willing to contribute to this project feel free to report issues, send pull request, write tests or simply contact me - [Amir Ahmetovic](https://github.com/choxnox)
