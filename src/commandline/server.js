var wrench = require( "wrench" );
var pth = require( "path" );
var msg = require( "../utils" ).message;
var fs = require("fs");

module.exports.createServer = function( path ) {
  if( !pth.existsSync( pth.join( path ) ) ) {
    msg(" The directory: " + pth.join( path ) + " does not exist.  Please create this directory and run again." );
    process.exit(1);
    return;
  }
  wrench.copyDirSyncRecursive(pth.join( __dirname, "..", "server" ), pth.join( path, "appcloud-server" ) );
  msg( "  The App Cloud web server is now located at " + pth.join( path, "appcloud-server" ) + "." );
  msg( "  To start the server cd into appcloud-server and then run 'npm install'." );
  msg( "  After the node modules have installed run 'node app.js', to start the server." );
}