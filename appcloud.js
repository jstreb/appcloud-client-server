#! /usr/bin/env node

var program = require("commander");
var server = require("./src/commandline/server" );
var app = require("./src/commandline/app");
var views;

function list( val ) {
  return val.split( "," );
}

program
  .version('0.0.1')
  .option( '-s, --create-server', 'Create the app cloud web server.' )
  .option( '-a, --creaet-app', 'Create a new app' )
  .option( '-n, --name', 'The name of the application')
  .option( '-v, --views [views]', 'A list of views to auto-generate', list )
  .option( '-p, --path [path]', 'The path to place the generated files.  This applies to both the server and the app.', "." )
  .parse(process.argv);



if( program.createServer ) {
  server.createServer( program.path );
}