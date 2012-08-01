var fs = require('fs');

module.exports.message = function( msg ) {
  console.log( "" );
  console.log( " " + msg );
};

module.exports.copy = function( src, destination ) {
  var srcFile= fs.readFileSync( src );
  fs.writeFileSync( destination, srcFile );
};