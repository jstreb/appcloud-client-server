var request = require("request");

module.exports.get = function( req, res ) {
  request.get(req.params.url, function (error, response, body) {
    handleResponse(res, error, response, body);
  });
};

module.exports.post = function( req, res ) {
  var opts = {
    url: req.params.url,
    headers: req.headers,
    body: JSON.stringify(req.body)
  };

  request.post(opts, function (error, response, body) {
    handleResponse(res, error, response, body);
  });
};

function handleResponse(res, error, response, body) {
  if( error ) {
    res.send( { status: "error" } );
    return;
  }
  
  if ( response.statusCode == 200 ) {
    res.send( body );
  } else {
    res.send( 
      { 
        status: "error",
        response: response.statusCode
      }
    );
  }
}