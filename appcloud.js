#! /usr/bin/env node

var pth = require( "path" );
var spawn = require( "child_process" ).spawn;
var fs = require("fs");

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
  .version('0.0.4')
  .option( '-c, --create-server', 'Create the app cloud web server.' )
  .option( '-n, --app-name [appName]', 'The name of the application you would like to create.')
  .option( '-v, --views [views]', 'A list of views to auto-generate as a comma seperated list.', list, ["view1", "view2"] )
  .option( '-P, --server-path [path]', 'The path of where the server exists or where to create the server.  If the App Cloud Server is in the current directory, this is not necessary.', process.cwd() )
  .option( '-p, --app-path [path]', 'The path to put the generated application.  This should only be set if you wish to put the application somewhere other then within the packaged web server.')
  .option( '-k, --sdk-version', 'The version of the App Cloud SDK.' )
  .parse(process.argv);

if( process.argv.length === 2 ) {
  console.log( program.helpInformation())
}

if( program.sdkVersion ) {
  msg( SDK_VERSION );
}

if( program.createServer ) {
  server.createServer( program.serverPath );
}

if( program.appName ) {
  var appPath = program.appPath;
  var savedServerPath;
  
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