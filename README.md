Overview
======================

The App Cloud module provides two key services.  The first is that provides a command line interface to allow developers to quickly generate new App Cloud apps.  (Scaffolding)  Additionally, the command line interface also includes a command to generate code an [express](http://expressjs.com/) web server.  The web server provides a central place
to organize your apps, create new apps and view / download demos.

Installation
======================

* If not already installed, install version 0.8.* of node.js.
* Simply run `sudo npm install -g appcloud`.  (The -g makes this globally available command.)

Usage
======================

To see the options available to you run `appcloud -h`, which will print:

  Usage: appcloud [options]

   Options:

   -h, --help                      output usage information
   -V, --version                   output the version number
   -c, --create-server             Create the app cloud web server.
   -n, --app-name [appName]        The name of the application you would like to create.
   -v, --views [views]             A list of views to auto-generate as a comma seperated list.
   -P, --server-path [path]        The path of where the server exists or where to create the server.  If the App Cloud Server is in the current directory, this is not necessary.
   -p, --app-path [path]           The path to put the generated application.  This should only be set if you wish to put the application somewhere other then within the packaged web server.
   -k, --sdk-version               The version of the App Cloud SDK.
   -j --path-to-javascript [path]  The path to the SDKs JavaScript file on disk to use.  This should be used if you want to use a version of the JavaScript SDK that has not yet been released.
   -s --path-to-stylesheet [path]  The path to the SDKs Stylesheet file on disk to use.  This should be used if you want to use a version of the CSS SDK other then has not yet been released.
     
The typical flow for getting started is to simply run `appcloud -c`, to generate the appcloud packaged web server.  (A lightweight [express](http://expressjs.com/) web server).  After that do `cd appcloud-server` and then run `npm install`, to install the necessary packages for the web server.  Once that completes run `node app.js`, which will start the appcloud web server.  When you first start the server it will look like:

![App Cloud Web Server](http://f.cl.ly/items/180I1o3H210F2W1d1l1H/Screen%20Shot%202012-07-27%20at%2012.55.31%20PM.png)

You then have the option to either create applications using the command line with `appcloud -n name -v foo,bar` or using the UI to create a new application.  After creating an app, you can then click the app to be taken a to page that presents you with a QR code for the application.  Using the App Cloud Workshop application, can be installed from either the iOS App Store or the Android Marketplace, scan the QR code.  The screen with the QR code should look like this:

![App Cloud Web Server](http://f.cl.ly/items/1P1g3i3S0I2u2C173Q22/Screen%20Shot%202012-07-27%20at%201.03.09%20PM.png)


Where are my apps?
===================

Any apps that you generate via the package web server will be created a directory called 'my-applications'.  This directory lives within the appcloud-server folder that was created by the `appcloud -c` command.  If you would like to move your applications to a different directory you can to do so and simply create symlink to point to the current `my-applications` directory.

`ln -s your_new_source_dir path_to_appcloud-server/my-applications`

Using a local version of the SDK
===================

If you are actively working on the [app-cloud-sdk](https://github.com/jstreb/app-cloud-sdk) then you may want to create applications and use your local versions.  To do this you will need to create a `local.properties` file and specify where on system the SDK files.  This local.properties file should go inside the `appcloud-server` directory.  Below is an example local.properties file.

    pathToJavaScriptSDK=/path/to/the/sdk/brightcove-app-cloud-1.11.js
    pathToStylesheetSDK=/path/to/the/sdk/brightcove-app-cloud-1.11.css
