var os = require('os');
var ifaces = os.networkInterfaces();

//Taken from http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
exports.getNetworkIP = function() {
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