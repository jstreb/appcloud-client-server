#! /usr/bin/env node

var pth = require( "path" );
var program = require("commander");
var server = require("./src/commandline/server" );
var app = require("./src/commandline/app");
var msg = require("./src/utils" ).message;
var views;
var SDK_VERSION = "1.10.2";

function list( val ) {
  return val.split( "," );
}

program
  .version('0.0.1')
  .option( '-s, --create-server', 'Create the app cloud web server.' )
  .option( '-a, --create-app', 'Create a new app' )
  .option( '-n, --app-name [appName]', 'The name of the application')
  .option( '-v, --views [views]', 'A list of views to auto-generate', list, ["view1", "view2"] )
  .option( '-P, --server-path [path]', 'The path of where the server exists or where to create the server.  If the App Cloud Server is in the current directory, this is not necessary.', process.cwd() )
  .option( '-p, --app-path [path]', 'The path to put the generated application.  This should only be set if you wish to put the application somewhere other then within the packaged web server.')
  .option( '-k, --sdk-version', 'The version of the App Cloud SDK.' )
  .parse(process.argv);

if( program.sdkVersion ) {
  msg( SDK_VERSION );
}

if( program.createServer ) {
  server.createServer( program.serverPath );
}

if( program.createApp ) {
  var appPath = program.appPath;
  
  //Make sure there is an app name.
  if( !program.appName ) {
    msg( "You must provide a name for this application.  Below is an example of a valid command to generate an application." );
    msg( "app-cloud --create-app --app-name My App Name --views example1 example2" );
  }
  
  //If there is not an override path check to see if the appcloud-server exists at the server path.  
  if( !appPath ) {
    if( pth.existsSync( pth.join( program.serverPath, "appcloud-server", "public" ) ) ){
      appPath = pth.join( program.serverPath, "appcloud-server", "public" );
    } else {
      msg( "Warning no app-path flag was set and the appcloud-server does not exists in the current directory.  Creating the application in the current directory.")
      msg( "If this is not the desired behavior either change directories to where the appcloud-server exists, pass in the appcloud server path via the --server-path flag or if you want to set your own path use the --app-path flag.")
      appPath = program.serverPath;
    }
  }
  app.createApplication( program.appName, program.views, appPath );
}

console.log( "" );