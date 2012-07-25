var fs = require('fs');
var sys = require('util');
var wrench = require('wrench');
var path = require('path');

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

var args = process.argv;
var appName;
var views = [];
var OOTBViews = [];
var appPath;
var customPath = false;

args.splice( 0, 2 );

if( showHelpInfo() ) {
  return;
}

setPath();

if( !customPath ) {
  var p = path.join( "..", "appcloud-server" );

  if( !path.existsSync( p ) ) {
    copyServerFilesIntoPlace();
  }
  appPath = path.join( "..", "appcloud-server", "public" );
}

getAppName();

if( !appName ) {
  return;
}

getViews();

if( views.length === 0 && OOTBViews.length === 0 ) {
  return;
}

createDirectoryStructure();

copySDKFilesToTemplate();

generateManifestFile();

generateViewFiles();

generateJavaScriptFiles();

generateStylesheetFiles();

generateMarkupFiles();

generateLocaleFiles();

copyIcons();

handleOOTBViews();

if( customPath ) {
  console.log( "Finished!  Your application is located at " + appPath + "." );
} else {
  console.log( "Finished!  Your application is located at ../appcloud-server/public.  To start the server simply run 'node ../appcloud-server/app.js'. " );
}

function showHelpInfo() {
  for( var i=0, len=args.length; i<len; i++ ) {
    if( args[i] === "-h" || args[i] === "--help" || args[i] === "-help" ) {
      console.log( "Welcome to the Brightcove App Cloud scaffolding script.  Below are the following options that can be passed to the script." );
      console.log( "" );
      console.log( "  Example: node scaffold.js -name appname -views blog news videos photos" );
      console.log( "" );
      console.log( "  -help" );
      console.log( "    Provides you with a listing of the possible commands." );
      console.log( "" );
      console.log( "  -name" );
      console.log( "    Takes in one parameter which will be the name of your template/app.  You can always change this in the future.  For example if I wanted to name my template 'test' I would run ./scaffold -name test.  Note the -name cannot have a space in it." );
      console.log( "" );
      console.log( "  -views" );
      console.log( "    Takes in a list of views that you want to create for this template/app.  A view corresponds to a section in your app denoted by the tabbar in iOS or options menu in Android.  To use the sample template as a reference we have 'blog', 'news', 'videos' and 'photos' views.  To create this you would run node scaffold.js -name test -views blog news videos photos.  Note that views generated from the scaffold script cannot have spaces in them." );
      console.log( "    To use one any of the out of the box views included with the SDK you can do so by passing the bc:videos, bc:news, bc:blog or bc:photos as a name of the view.");
      console.log( "  -path" );
      console.log( "    If you would prefer to use your own web server then this will not generate the node web server and simply place the generated template in the directory you specify.")
      return true;
    }
  }
  return false; 
}

function setPath() {
  var pathFound = false;
  for( var i=0, len=args.length; i<len; i++ ) {
    if( pathFound && args[i].substring( 0, 1 ) !== "-" ) {
      appPath = args[i];
      customPath = true;
        if( !path.existsSync( path.join( appPath ) ) ) {
          console.log( "The " + appPath + " does not exist.  Please provide the path to a directory that already exists." );
          process.exit(1);
        }
      return;
    } else if( pathFound && args[i].substring( 0, 1 ) === "-" ) {
      console.error( "The path cannot being with - ");
      return;
    }
    
    if( args[i] === "-path" ) {
      pathFound = true;
    }
  }
}

function getAppName() {
  var appNameFound = false;
  for( var i=0, len=args.length; i<len; i++ ) {
    if( appNameFound && args[i].substring( 0, 1 ) !== "-" ) {
      appName = args[i];
      return;
    } else if( appNameFound && args[i].substring( 0, 1 ) === "-" ) {
      console.error( "The app name cannot begin with a - ");
      return;
    }
    
    if( args[i] === "-name" ) {
      appNameFound = true;
    }
  }
  
  if( appName === undefined ) {
    console.error( "You must provide an name in the format of -name myname.  (Spaces are not accepted)  Example: node scaffold.js -name appname -views blog news videos photos" );
  }
}

function getViews() {
  var viewsFound = false;
  for( var i=0, len=args.length; i<len; i++ ) {
    if( viewsFound && args[i].substring( 0, 1 ) !== "-" ) {
      //Check to see if this an OOTB view.
      if( VALID_OOTB_VIEWS[args[i]] !== undefined ) {
        OOTBViews.push( VALID_OOTB_VIEWS[args[i]] );
      } else {
        views.push( args[i] );
      }
    } else if( viewsFound && args[i].substring( 0, 1 ) === "-" && views.length === 0 ) {
      console.error( "A view name cannot begin with a - ");
      return;
    } else if( viewsFound && args[i].substring( 0, 1 ) === "-" ) {
      return;
    }
    
    if( args[i] === "-views" ) {
      viewsFound  = true;
    }
  }

  if( views.length === 0 && OOTBViews.length === 0 ) {
    console.error( "You must provide at least one view name by passing the following argument to the script: -views firstviewname secondviewname.  Example: node scaffold.js -name appname -views blog news videos photos" );
  }
}

function createDirectoryStructure() {
  if(  path.existsSync( path.join( appPath, appName ) ) ) {
    console.log( "The " + appName + " application already exists.  Please choose a new app name." );
    process.exit(1);
  }
  console.log( "Creating directories..." );
  fs.mkdirSync( path.join( appPath, appName ) );
  fs.mkdirSync( path.join( appPath,  appName, "html" ) );
  fs.mkdirSync( path.join( appPath,  appName, "javascripts" ) );
  fs.mkdirSync( path.join( appPath,  appName, "javascripts", "lib" ) );
  fs.mkdirSync( path.join( appPath,  appName, "javascripts", "views" ) );
  fs.mkdirSync( path.join( appPath,  appName, "stylesheets" ) );
  fs.mkdirSync( path.join( appPath,  appName, "images" ) );
  fs.mkdirSync( path.join( appPath,  appName, "images", "icons" ) );
  fs.mkdirSync( path.join( appPath,  appName, "txt" ) );
  fs.mkdirSync( path.join( appPath,  appName, "txt", "markup" ) );
  fs.mkdirSync( path.join( appPath,  appName, "txt", "locales" ) );
}

function copySDKFilesToTemplate() {
  console.log( "Copying in SDK files" );
  copy( path.join( "..", "brightcove-app-cloud-%VERSION%.js" ), path.join( appPath, appName, "javascripts", "lib", "brightcove-app-cloud-%VERSION%.js") );
  copy( path.join( "..", "themes", "ocean", "theme-%VERSION%.css"), path.join( appPath, appName, "stylesheets", "theme-%VERSION%.css") );
}

function generateManifestFile() {
  var view;
  var sampleManifest;
  var OOTBView;
  var manifest = {
      "name": appName,
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
  
  for( var i=0; i<views.length; i++ ) {
    view = {
      "navigationTitle": "" + views[i] + "",
      "navigationIcon": "images/icons/" + views[i] + ".png",
      "uri": "./html/" + views[i] + ".html",
      "locales": "./txt/locales/en.txt",
      "markup": "./txt/markup/" + views[i] + ".txt"
    };
    manifest.views.push( view );
  }
  
  for( var i=0; i<OOTBViews.length; i++ ) {
    sampleManifest = sampleManifest || getSampleManifest();
    OOTBView = getViewFromManifest( OOTBViews[i].title, sampleManifest );
    view = {
      "navigationTitle": "" + OOTBViews[i].title + "",
      "navigationIcon": "images/icons/" + OOTBViews[i].title + ".png",
      "uri": "./html/" + OOTBViews[i].title + ".html",
      "locales": "./txt/" + OOTBViews[i].assetfiles[0] + "/locales/en.txt",
      "markup": "./txt/" + OOTBViews[i].assetfiles[0] + "/markup/" + OOTBViews[i].assetfiles[0] + ".txt"
    };
    
    if( OOTBView.data !== undefined ) {
      view.data = OOTBView.data;
    }
    
    if( OOTBView.styles !== undefined ) {
      view.styles = OOTBView.styles;
    }
    
    if( OOTBView.settings !== undefined ) {
      view.settings = OOTBView.settings;
    }
    
    manifest.views.push( view );
  }
  fs.writeFileSync( path.join( appPath, appName, "manifest.json" ), JSON.stringify( manifest, null, 4) );
}

function generateViewFiles() {
  var htmlTemplate = fs.readFileSync( path.join( ".templates", "template.html") ),
      update;
  
  for( var i=0; i<views.length; i++ ) {
    update = htmlTemplate.toString().replace( /\${title}/g, views[i] );
    fs.writeFileSync( path.join( appPath, appName, "html", views[i] + ".html" ), update );
  }
}

function generateJavaScriptFiles() {
  var htmlTemplate = fs.readFileSync( path.join( ".templates", "view.tmpl.js" ) ),
      update;
  
  for( var i=0; i<views.length; i++ ) {
    update = htmlTemplate.toString().replace( /\${title}/g, views[i] );
    fs.writeFileSync( path.join( appPath, appName, "javascripts", "views", views[i] + ".js" ), update );
  }
}

function generateStylesheetFiles() {
  for( var i=0; i<views.length; i++ ) {
    copy( path.join( ".templates", "", "style.tmpl.css" ), path.join( appPath, appName, "stylesheets", views[i] + ".css") );
  }
}

function generateMarkupFiles() {
  var htmlTemplate = fs.readFileSync( path.join( ".templates", "markup.tmpl.txt" ) ),
      update;
  
  for( var i=0; i<views.length; i++ ) {
    update = htmlTemplate.toString().replace( /\${title}/g, views[i] );
    fs.writeFileSync( path.join( appPath, appName, "txt", "markup", views[i] + ".txt" ), update );
  }
}

function generateLocaleFiles() {
  //Lame that there isn't a simply copy function on the file system.
  copy( path.join( ".templates", "locale.tmpl.txt" ), path.join( appPath, appName, "txt", "locales", "en.txt" ) );
}

function copyIcons() {
  for( var i=0; i<views.length; i++ ) {
    copy( path.join( ".templates", "home.png"), path.join( appPath, appName, "images", "icons", views[i] + ".png" ) );
    copy( path.join( ".templates", "home@2x.png"), path.join( appPath, appName, "images", "icons", views[i] + "@2x.png" ) );
  }
}

function handleOOTBViews() {
  for( var i=0; i<OOTBViews.length; i++ ) {
    //copy in the html file, but I also need to change the directory paths.
    var srcFile= fs.readFileSync( path.join( __dirname, "..", "samples", "en", "sample-template", OOTBViews[i].title + ".html"), "utf8" );
    srcFile = srcFile.replace( /"\.\//g, '"../' );
    srcFile = srcFile.replace( "javascripts/brightcove", "javascripts/lib/brightcove" );
    for( var j=0; j<OOTBViews[i].assetfiles.length; j++ ) {
      srcFile = srcFile.replace( "javascripts/" + OOTBViews[i].assetfiles[j], "javascripts/views/" + OOTBViews[i].assetfiles[j] );
      //Copy in the JS file
      copy( path.join( __dirname, "..", "samples", "en", "sample-template", "javascripts", OOTBViews[i].assetfiles[j] + ".js"), path.join( appPath, appName, "javascripts", "views", OOTBViews[i].assetfiles[j] + ".js") );
      //Copy in the CSS file
      copy( path.join( __dirname, "..", "samples", "en", "sample-template", "stylesheets", OOTBViews[i].assetfiles[j] + ".css"), path.join( appPath, appName, "stylesheets", OOTBViews[i].assetfiles[j] + ".css") );
    }
    
    fs.writeFileSync( path.join( appPath, appName, "html", OOTBViews[i].title + ".html"), srcFile );
    
    //Copy in the icon file
    copy( path.join( __dirname, "..", "samples", "en", "sample-template", "images", "icons", OOTBViews[i].icon + ".png"), path.join( appPath, appName, "images", "icons", OOTBViews[i].title + ".png") );
    copy( path.join( __dirname, "..", "samples", "en", "sample-template", "images", "icons", OOTBViews[i].icon + "@2x.png"), path.join( appPath, appName, "images", "icons", OOTBViews[i].title + "@2x.png") );
    
    //Create txt directories and copy in markup / locale files
    fs.mkdirSync( path.join( appPath, appName, "txt", OOTBViews[i].assetfiles[0]) );
    fs.mkdirSync( path.join( appPath, appName, "txt", OOTBViews[i].assetfiles[0], "markup" ) );
    fs.mkdirSync( path.join( appPath, appName, "txt", OOTBViews[i].assetfiles[0], "locales" ) );
    copy( path.join( __dirname, "..", "samples", "en", "sample-template", "txt", OOTBViews[i].assetfiles[0], "markup", OOTBViews[i].assetfiles[0] + ".txt" ), path.join( appPath, appName, "txt", OOTBViews[i].assetfiles[0], "markup", OOTBViews[i].assetfiles[0] + ".txt") );
    copy( path.join( __dirname, "..", "samples", "en", "sample-template", "txt", OOTBViews[i].assetfiles[0], "locales", "en.txt" ), path.join( appPath, appName, "txt", OOTBViews[i].assetfiles[0], "locales", "en.txt") );
  }
}

//Utility functions
function copy( src, destination ) {
  var srcFile= fs.readFileSync( src );
  fs.writeFileSync( destination, srcFile );
}

function getSampleManifest() {
  var srcFile= fs.readFileSync( path.join( __dirname, "..", "samples", "en", "sample-template", "manifest.json"), "utf8" );
  return JSON.parse( srcFile );
}

function getViewFromManifest( title, manifest ) {
  for( var i=0; i<manifest.views.length; i++ ) {
    if( manifest.views[i].navigationTitle.toLowerCase() === title.toLowerCase() ) {
      return manifest.views[i];
    }
  }
}