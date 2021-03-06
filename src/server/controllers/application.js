var path = require('path');
var fs = require('fs');
var marked = require('marked');
var Application = require('../models/').Application;

module.exports.index = function(req, res) {
  try {
    var apps = Application.getUsers();
    var demos = Application.getDemos();
    var mod = apps.length % 4;
    var numOfPlaceHolders = 0;

    if( apps.length === 0 || mod > 0 ) {
      numOfPlaceHolders = 4 - mod;
      for( var i=0; i<numOfPlaceHolders; i++ ) {
        apps.push( { name: "" } );
      }
    }
    res.render(
      'index', 
      { 
        title: 'App Cloud',
        apps: apps,
        demos: demos
      }
    );
  } catch( e ) {
    res.render( "error", { title: "App Cloud Error Page", error: e } );
  }
};

module.exports.show = function( req, res ) {
  var app = req.params.name;
  var type = ( req.params.type === "app" ) ? "my-applications" : "demos";
  var manifestURL = "http://" + req.headers.host + "/" + type + "/" + app + "/manifest.json";
  var url = "https://chart.googleapis.com/chart?cht=qr&choe=UTF-8&chs=274x274&chld=L|0&chl=" + manifestURL;
  var manifestFile = fs.readFileSync( path.join( global.baseDir, "public", type, app, "manifest.json" ), "utf-8" );
  try {
    var manifest = JSON.parse( manifestFile );

    res.render(
      "scan",
      {
        title: "App Cloud",
        app: app,
        manifestPath: manifestURL,
        qrCodeImage: url,
        views: manifest.views,
        type: type
      }
    );
  } catch( e ) {
    res.render( "error", { title: "App Cloud Error Page", error: e } );
  }
};

module.exports.demos = function( req, res ) {
  Application.downloadDemos( function() {
    res.send( { status: "success" } );
  });
};

module.exports.demoDetails = function( req, res ) {
  var html;
  var markdown = Application.getReadmeByAppName( req.params.name );
  
  if( markdown ) {
    html = marked( markdown );
    res.send( { status: "success", html: html } );
    return;
  }
  
  res.send( { status: "error" } );
};

module.exports._newView = function( req, res ) {
  res.render( 'partials/app/_viewname', { layout: false } );
};

module.exports.create = function( req, res ) {
  var data = req.body;
  Application.createApp( data, function() {
    res.send( { "status": "success" } );
  });
};