/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , request = require('request')
  , spawn = require('child_process').spawn;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  global.baseDir = __dirname;
});

app.configure('development', function(){
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
routes( app );

//Check the version of appcloud npm to see if we should update.
request( "https://raw.github.com/jstreb/appcloud-client-server/master/package.json", function(err, res, body) {
  var remoteVersion;
  var localVersion;
  var appcloud;
  
  if( err ) {
    console.log( "Error getting package.json from github: " + err );
    return;
  }
  
  try {
    remoteVersion = JSON.parse( body ).version;
    appcloud = spawn('appcloud', ['-V']);
    
    appcloud.stdout.on('data', function(data) {
      localVersion = data.toString().split("\n")[0];
      global.newVersionAvailable = (remoteVersion != localVersion);
    });
  } catch( e ) {
    console.log( "ERROR getting the local and remote versions of npm: " + e );
  }

  
});

app.listen(3773, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
