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
  .version('0.0.1')
  .option( '-c, --create-server', 'Create the app cloud web server.' )
  .option( '-n, --app-name [appName]', 'The name of the application you would like to create.')
  .option( '-v, --views [views]', 'A list of views to auto-generate as a comma seperated list.', list, ["view1", "view2"] )
  .option( '-P, --server-path [path]', 'The path of where the server exists or where to create the server.  If the App Cloud Server is in the current directory, this is not necessary.', process.cwd() )
  .option( '-p, --app-path [path]', 'The path to put the generated application.  This should only be set if you wish to put the application somewhere other then within the packaged web server.')
  .option( '-k, --sdk-version', 'The version of the App Cloud SDK.' )
  .parse(process.argv);

//Set the path to this script to write storage files to a known dir.
global.pathOfExecutable = module.filename.split( "appcloud.js" )[0];

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
    var serverPathFile = pth.join( global.pathOfExecutable, "serverPath.json" );
    if( fs.existsSync( serverPathFile ) ) {
      appPath = pth.join( JSON.parse( fs.readFileSync( serverPathFile, "utf8" ) ).serverPath, "public" );
    } else {
      msg( "Warning no app-path flag was set and it appears as though you have not created the web server yet.  Creating the application in the current directory.")
      msg( "If this is not the desired behavior either create the web server with the command 'appcloud -c'.")
      appPath = program.serverPath;
    }
  }
  app.createApplication( program.appName, program.views, appPath );
}