Overview
======================

The App Cloud module provides two key services.  The first is that provides a command line interface to allow developers to quickly generate new App Cloud apps.  (Scaffolding)  Additionally, the command line interface also includes a command to generate code a for a [express](http://expressjs.com/) web server.  The web server provides a central place
to organize your apps, create new apps and view / download demos.

Installation
======================

* If not already installed, install version 0.8.* of node.js.
* Simply run `npm install appcloud`.

Usage
======================

To see the options available to you run `appcloud -h`, which will print:

  Usage: appcloud [options]

   Options:

     -h, --help                output usage information
     -V, --version             output the version number
     -c, --create-server       Create the app cloud web server.
     -s, --start-server        Start the app cloud web server.
     -a, --create-app          Create a new app
     -n, --app-name [appName]  The name of the application
     -v, --views [views]       A list of views to auto-generate
     -P, --server-path [path]  The path of where the server exists or where to create the server.  If the App Cloud Server is in the current directory, this is not necessary.
     -p, --app-path [path]     The path to put the generated application.  This should only be set if you wish to put the application somewhere other then within the packaged web server.
     -k, --sdk-version         The version of the App Cloud SDK.
     
The typical flow for getting started is to simply run `appcloud -c`, to generate the appcloud packaged web server.  (A lightweight [express](http://expressjs.com/) web server).  After that if you `cd appcloud` and then run `node app.js`, you will start the appcloud web server.  When you first start the server it will look like:

![App Cloud Web Server](http://f.cl.ly/items/180I1o3H210F2W1d1l1H/Screen%20Shot%202012-07-27%20at%2012.55.31%20PM.png)

You then have the option to either create applications using the command line with `appcloud -a -n name -v foo,bar` or using the UI to create a new application.  After creating an app, you can then click the app to be taken a to page that presents you with a QR code for the application.  Using the App Cloud Workshop application, can be installed from either the iOS App Store or the Android Marketplace, scan the QR code.  The screen with the QR code should look like this:

![App Cloud Web Server](http://f.cl.ly/items/1P1g3i3S0I2u2C173Q22/Screen%20Shot%202012-07-27%20at%201.03.09%20PM.png)