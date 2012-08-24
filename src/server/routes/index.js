var controllers = require('../controllers')
var apps = controllers.Apps;
var requiresIP = require('../middleware').requiresIP; 

module.exports = function( server ) {
  //Apps routes
  server.get( "/", requiresIP, apps.index );
  server.get( "/app", requiresIP, apps.index );
  server.get( "/app/_newview", apps._newView );
  server.get( "/app/demos", apps.demos );
  server.get( "/scan/:type/:name", requiresIP, apps.show );
  server.get( "/app/demo/details/:name", apps.demoDetails );
  server.post( "/app", apps.create );
};