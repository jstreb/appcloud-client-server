var wrench = require('wrench');
var path = require('path');
var fs = require('fs');
var sys = require('util');
var request = require('request');
var AdmZip = require('adm-zip');
// var md = require('node-markdown').Markdown;
var marked = require('marked');


function getNameFromPath( pth ) {
  var name;
  dirs = pth.split( path.sep );
  return dirs[ dirs.length - 2 ];
}

function isDemoApp( pth ) {
  var name = pth.split( "manifest.json" )[0];
  return fs.existsSync( path.join( global.baseDir, "public", name, ".demo.txt" ) );
}

function getDemos( res ) {
    
  var ws = request('https://github.com/BrightcoveOS/App-Cloud-Demos/zipball/master').pipe(fs.createWriteStream('test.zip') );
   
  ws.on( "close", function() {
    var originalDirs = fs.readdirSync( "public" );
    var dirsAfterExtract;
    var zip = new AdmZip("test.zip");
    var dir;
    var found;
    
    zip.extractAllTo( path.join( "public" ), true );
    fs.unlinkSync( "test.zip" );
    dirsAfterExtract = fs.readdirSync( "public" );
    
    //Need to get the name of the directory that was just created from the zip being extracted.
    for( var i=0; i<dirsAfterExtract.length; i++ ) {
      found = false;
      for( var j=0; j<originalDirs.length; j++ ) {
        if( dirsAfterExtract[i] == originalDirs[j] ) {
          found = true;
          break;
        }
       
      }
      
      if( !found ) {
        dir = dirsAfterExtract[i];
        break;
      }
    }
    
    //Move any directory up one directory as these are working apps.
    var apps = fs.readdirSync( path.join( "public", dir ) );
    for( i = 0; i < apps.length; i++ ) {
      if( fs.statSync( path.join( "public", dir, apps[i] ) ).isDirectory() ) {
        fs.renameSync( path.join( "public", dir, apps[i] ), path.join( "public", apps[i] ) );
        fs.writeFileSync( path.join( "public", apps[i], ".demo.txt" ), "true", "utf8" )
      }
    }
    wrench.rmdirSyncRecursive( path.join( "public", dir ) );
    res.send( { status: "success" } );
    
  });
}

exports.index = function(req, res) {
  var listOfApps = wrench.readdirSyncRecursive( path.join( global.baseDir, 'public') );
  var apps = [];
  var demosDownloaded = false;
  
  for( var i=0, len=listOfApps.length; i<len; i++) {
    if( listOfApps[i].indexOf( "manifest.json" ) > -1 ) {
      apps.push( 
        { 
          name: getNameFromPath( listOfApps[i] ),
          demo: isDemoApp( listOfApps[i] )
        } );
    }
    
    if( listOfApps[i].indexOf( ".demo.txt" ) > -1 ) {
      demosDownloaded = true;
    }
  }

  res.render(
    'index', 
    { 
      title: 'App Cloud',
      apps: apps,
      demosDownloaded: demosDownloaded
    }
  );
};

exports.scan = function( req, res ) {
  var app = req.params.app;
  var manifestURL = "http://" + req.headers.host + "/" + app + "/manifest.json";
  var url = "https://chart.googleapis.com/chart?cht=qr&choe=UTF-8&chs=274x274&chld=L|0&chl=" + manifestURL;
  var manifestFile = fs.readFileSync( path.join( global.baseDir, "public", app, "manifest.json" ), "utf-8" );
  try {
    var manifest = JSON.parse( manifestFile );

    res.render(
      "scan",
      {
        title: "App Cloud",
        app: app,
        manifestPath: manifestURL,
        qrCodeImage: url,
        views: manifest.views
      }
    );
  } catch( e ) {
    res.render( "error", { title: "App Cloud Error Page"} );
  }
};

exports.getDemos = function( req, res ) {
  getDemos( res );
}

exports.getDemoDetails = function( req, res ) {
  var html;
  var markdown;
  
  if( fs.existsSync( path.join( global.baseDir, "public", req.params.name, "README.md" ) ) ) {
    markdown = fs.readFileSync( path.join( global.baseDir, "public", req.params.name, "README.md" ), "utf8" );
    html = marked( markdown );
    res.send( 
      { 
        status: "success",
        html: html 
      }
    );
    return;
  }
  
  res.send( { status: "error" } );
}