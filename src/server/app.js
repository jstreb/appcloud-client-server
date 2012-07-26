/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , helpers = require('./helpers')

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

// Middleware
function requireIP( req, res, next ) {
  
  //If we are on localhost then redirect to the local IP address
  if( req.headers["host"].indexOf( "localhost" ) > -1 ) {
    var ip = helpers.getNetworkIP();
    if( ip !== null ) {
      res.redirect( "http://" + req.headers["host"].replace( "localhost", ip ) );
      return;
    }
  } 
  next();
}

// Routes

app.get('/', requireIP, routes.index);

app.get('/scan/:app', requireIP, routes.scan );

app.get('/demos', routes.getDemos );

app.get('/demo/details/:name', routes.getDemoDetails );

app.get('/app/newview', routes.newViewPartial );

app.post('/app', routes.newApp );

app.listen(3773, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
