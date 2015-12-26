# CarbonJS / `carbon-framework`
CarbonJS is a modular MVC framework for NodeJS based on Zend Framework which uses ExpressJS in the background. It truly is modular framework which means each module can have it's own controllers, views, layouts, routes, navigation, forms, models, configuration and more. Each module can function as a separate entity or as a part of a larger system. The best of all is that modules are plug-and-play so you can easily copy modules that you already have in one project to another project without any configuration whatsoever.

Imagine you have an `auth` module in one project and within that module you have modules `local` (login/signup via username/email address and password), `facebook` (connect to your auth system through Facebook) and `twitter` (connect to your auth system through Twitter). Now imagine that each of these modules are already fully functional. When in your next project you want to have an authorization system all you have to do is simply copy module from your previous project. You don't want Twitter authorization? No problem, simply remove `twitter` module from your new project.

Running a website with CarbonJS is even easier: just set some basic parameters such as hostname and port, domains used etd. and you're ready to rock.

## Getting started
### Installation
```
npm install carbon-framework [--save]
```

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
	console.log("Timelinity is running on port " + app.server.address().port + ".");
});

module.exports = exports = app;
```

## Project structure
Even though CarbonJS is a use-as-you-wish framework it requires that you follow some very basic rules when it comes to structuring your project.

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
