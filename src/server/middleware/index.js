var os = require('os');
var ifaces = os.networkInterfaces();

//Taken from http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
function getNetworkIP() {
  var network;
  for (var n in ifaces) {
    network = ifaces[n];
    for( var i=0; i<network.length; i++ ) {
      if( network[i].family === "IPv4" && network[i].address !== "127.0.0.1" ) {
        return network[i].address;
      }
    }
  }
  return null;
};

module.exports.requiresIP = function( req, res, next ) {
  //If we are on localhost then redirect to the local IP address
  if( req.headers["host"].indexOf( "localhost" ) > -1 ) {
    var ip = getNetworkIP();
    if( ip !== null ) {
      res.redirect( "http://" + req.headers["host"].replace( "localhost", ip ) );
      return;
    }
  } 
  next();
};