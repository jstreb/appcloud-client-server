var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var msg = require('../utils').message;
var copy = require('../utils').copy;

var _name;
var _views;
var _path;
var VALID_OOTB_VIEWS = { 
  "bc:news": {
    title: "news",
    assetfiles: [
      "blog-with-divider",
      "blog"
      ],
    icon: "news"
  },
  "bc:blog": {
    title: "blog",
    assetfiles: ["blog"],
    icon: "news"
  },
  "bc:photos": {
    title: "photos",
    assetfiles: ["photogallery"],
    icon: "photos"
  },
  "bc:videos": {
    title: "videos",
    assetfiles: ["videos"],
    icon: "videos"
  }
};

module.exports.createApplication = function( name, views, pth ) {
  _name = name;
  _views= views;
  _path = pth;
  
  if( path.existsSync( path.join( path, name ) ) ) {
    msg( "The " + name + " application already exists.  Please choose a new app name." );
    process.exit(1);
  }
  
  createDirectoryStructure();
  copyInSDKFiles();
  generateManifestFile();
  generateViewFiles();
  generateJavaScriptFiles();
  generateStylesheetFiles();
  generateMarkupFiles();
  generateLocaleFiles();
  copyIcons();
};

function createDirectoryStructure() {
  msg( "Creating directories..." );
  fs.mkdirSync( path.join( _path, _name ) );
  fs.mkdirSync( path.join( _path,  _name, "html" ) );
  fs.mkdirSync( path.join( _path,  _name, "javascripts" ) );
  fs.mkdirSync( path.join( _path,  _name, "javascripts", "lib" ) );
  fs.mkdirSync( path.join( _path,  _name, "javascripts", "views" ) );
  fs.mkdirSync( path.join( _path,  _name, "stylesheets" ) );
  fs.mkdirSync( path.join( _path,  _name, "images" ) );
  fs.mkdirSync( path.join( _path,  _name, "images", "icons" ) );
  fs.mkdirSync( path.join( _path,  _name, "txt" ) );
  fs.mkdirSync( path.join( _path,  _name, "txt", "markup" ) );
  fs.mkdirSync( path.join( _path,  _name, "txt", "locales" ) );
}

function copyInSDKFiles() {
  msg( "Copying in SDK files..." );
  copy( path.join( __dirname, "..", "sdk", "brightcove-app-cloud.js" ), path.join( _path, _name, "javascripts", "lib", "brightcove-app-cloud.js") );
  copy( path.join( __dirname, "..", "sdk", "theme.css"), path.join( _path, _name, "stylesheets", "theme.css") );
}

function generateManifestFile() {
  msg( "Generating the manifest.json file..." );
  var view;
  var sampleManifest;
  var OOTBView;
  var manifest = {
      "name": _name,
      "description": "Please provide a description for this template.",
      "version": "1.0",
      "devices": [
          "iPhone",
          "Android"
      ],
      "platformConfig": {
          "android": {
              "nativeNavigation": true
          },
          "iOS": {
              "nativeNavigation": true
          }
      }
    };
  
  manifest.views = [];
  
  for( var i=0; i<_views.length; i++ ) {
    view = {
      "navigationTitle": "" + _views[i] + "",
      "navigationIcon": "images/icons/" + _views[i] + ".png",
      "uri": "./html/" + _views[i] + ".html",
      "locales": "./txt/locales/en.txt",
      "markup": "./txt/markup/" + _views[i] + ".txt"
    };
    manifest.views.push( view );
  }
  
  // for( var i=0; i<OOTBViews.length; i++ ) {
  //     sampleManifest = sampleManifest || getSampleManifest();
  //     OOTBView = getViewFromManifest( OOTBViews[i].title, sampleManifest );
  //     view = {
  //       "navigationTitle": "" + OOTBViews[i].title + "",
  //       "navigationIcon": "images/icons/" + OOTBViews[i].title + ".png",
  //       "uri": "./html/" + OOTBViews[i].title + ".html",
  //       "locales": "./txt/" + OOTBViews[i].assetfiles[0] + "/locales/en.txt",
  //       "markup": "./txt/" + OOTBViews[i].assetfiles[0] + "/markup/" + OOTBViews[i].assetfiles[0] + ".txt"
  //     };
  //     
  //     if( OOTBView.data !== undefined ) {
  //       view.data = OOTBView.data;
  //     }
  //     
  //     if( OOTBView.styles !== undefined ) {
  //       view.styles = OOTBView.styles;
  //     }
  //     
  //     if( OOTBView.settings !== undefined ) {
  //       view.settings = OOTBView.settings;
  //     }
  //     
  //     manifest.views.push( view );
  //   }
  fs.writeFileSync( path.join( _path, _name, "manifest.json" ), JSON.stringify( manifest, null, 4) );
}

function generateViewFiles() {
  msg( "Generating the HTML files for application..." );
  var htmlTemplate = fs.readFileSync( path.join( __dirname, "..", "application", "templates", "template.html") ),
      update;
  
  for( var i=0; i<_views.length; i++ ) {
    update = htmlTemplate.toString().replace( /\${title}/g, _views[i] );
    fs.writeFileSync( path.join( _path, _name, "html", _views[i] + ".html" ), update );
  }
}

function generateJavaScriptFiles() {
  msg( "Generating the JavaScripts files for application..." );
  var jsTemplate = fs.readFileSync( path.join( __dirname, "..", "application", "templates", "view.tmpl.js" ) ),
      update;
  
  for( var i=0; i<_views.length; i++ ) {
    update = jsTemplate.toString().replace( /\${title}/g, _views[i] );
    fs.writeFileSync( path.join( _path, _name, "javascripts", "views", _views[i] + ".js" ), update );
  }
}

function generateStylesheetFiles() {
  msg( "Generating the Stylesheets files for application..." );
  for( var i=0; i<_views.length; i++ ) {
    copy( path.join( __dirname, "..", "application", "templates", "style.tmpl.css" ), path.join( _path, _name, "stylesheets", _views[i] + ".css") );
  }
}

function generateMarkupFiles() {
  msg( "Generating the Markup files for application..." );
  var htmlTemplate = fs.readFileSync( path.join( __dirname, "..", "application", "templates", "markup.tmpl.txt" ) ),
      update;
  
  for( var i=0; i<_views.length; i++ ) {
    update = htmlTemplate.toString().replace( /\${title}/g, _views[i] );
    fs.writeFileSync( path.join( _path, _name, "txt", "markup", _views[i] + ".txt" ), update );
  }
}

function generateLocaleFiles() {
  msg( "Generating the locale files for application..." );
  copy( path.join( __dirname, "..", "application", "templates", "locale.tmpl.txt" ), path.join( _path, _name, "txt", "locales", "en.txt" ) );
}

function copyIcons() {
   msg( "Generating the icon images for application..." );
  for( var i=0; i<_views.length; i++ ) {
    copy( path.join( __dirname, "..", "application", "templates", "home.png"), path.join( _path, _name, "images", "icons", _views[i] + ".png" ) );
    copy( path.join( __dirname, "..", "application", "templates", "home@2x.png"), path.join( _path, _name, "images", "icons", _views[i] + "@2x.png" ) );
  }
}