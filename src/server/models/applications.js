var wrench = require('wrench');
var path = require('path');
var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var exec = require('child_process').exec;
var npp = require('node-properties-parser');

var GITHUB_ADDRESS = 'https://github.com/BrightcoveOS/App-Cloud-Demos/zipball/master';
var localProperties;

module.exports.getDemos = function() {
  var listOfApps = wrench.readdirSyncRecursive( path.join( global.baseDir, 'public') );
  var apps = [];
  var name;
  var icon;
  
  for( var i=0; i<listOfApps.length; i++) {
    if( listOfApps[i].indexOf( "manifest.json" ) > -1 ) {
      name = getNameFromPath( listOfApps[i] );
      if( isDemoApp( listOfApps[i] ) ) {
        apps.push(
          {
            name: name,
            demo: true,
            readme: path.join( global.baseDir, "public", name, "README.md" ),
            icon: getPathToIcon( path.join( global.baseDir, 'public', name, "manifest.json" ), name )
          }
        );
      }
    }
  }
  return apps;
};

module.exports.getUsers = function() {
  var listOfApps = wrench.readdirSyncRecursive( path.join( global.baseDir, 'public') );
  var apps = [];
  
  for( var i=0; i<listOfApps.length; i++) {
    if( listOfApps[i].indexOf( "manifest.json" ) > -1 ) {
      if( !isDemoApp( listOfApps[i] ) ) {
        apps.push(
          {
            name: getNameFromPath( listOfApps[i] ),
            demo: false,
            readme: ""
          }
        );
      }
    }
  }
  return apps;
};

module.exports.downloadDemos = function( cb ) {
  var ws = request( GITHUB_ADDRESS ).pipe( fs.createWriteStream('test.zip') );
   
  ws.on( "close", function() {
    var originalDirs = fs.readdirSync( "public" );
    var zip = new AdmZip("test.zip");
    var dirsAfterExtract;
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
    cb();
  });
};

module.exports.getReadmeByAppName = function( name ) {
  if( fs.existsSync( path.join( global.baseDir, "public", name, "README.md" ) ) ) {
    return fs.readFileSync( path.join( global.baseDir, "public", name, "README.md" ), "utf8" );
  }
  
  return null;
};

module.exports.createApp = function( data, cb ) {
  var cmd = 'appcloud -n ' + data.appName.replace(/ /g, "_") + ' -v ' + data.viewNames.join() + ' -p ' + path.join( __dirname, "..", "public" );
  
  for( var i=0, len = data.viewNames.length; i<len; i++) {
    data.viewNames[i] = data.viewNames[i].replace(/ /g, "_");
  }
  
  //Check to see if there is a local properties file that specifies the path to the SDK.
  if( !localProperties && fs.existsSync( path.join( __dirname, "..", "local.properties" ) ) ) {
    localProperties = npp.readSync( path.join( __dirname, "local.properties" ) );
  }
    
  if( localProperties && localProperties["pathToJavaScriptSDK"] ) {
    cmd += " -j " + props["pathToJavaScriptSDK"];
  }
    
  if( localProperties && localProperties["pathToStylesheetSDK"] ) {
    cmd += " -s " + props["pathToStylesheet"];
  }
  
  exec( cmd, cb );
}

function isDemoApp( pth ) {

  var name = pth.split( "manifest.json" )[0];
  var pth;
  if( name.indexOf( path.join( global.baseDir, "public" ) ) > -1 ) {
    pth = path.join( name, ".demo.txt" );
  } else {
    pth = path.join( global.baseDir, "public", name, ".demo.txt" );
  }

  return path.existsSync( pth );
}

function getNameFromPath( pth ) {
  var name;
  dirs = pth.split( path.sep );
  return dirs[ dirs.length - 2 ];
}

function getPathToIcon( manifestPath ) {
  var manifest = JSON.parse( fs.readFileSync( manifestPath ) );
  var pubManifest;
  var pathToPubManifest;
  
  if( typeof manifest.publishConfig === "object" ) {
    try {
      return manifest.publishConfig.android.images.icon;
    } catch( e ) {
      console.log( e );
      return null;
    }
  }
  
  if( typeof manifest.publishConfig === "string" ) {
    try {
      pathToPubManifest = path.join( manifestPath.split( 'manifest.json')[0], manifest.publishConfig );
      pubManifest = JSON.parse( fs.readFileSync( pathToPubManifest ) );
      
      return normalizePath( pathToPubManifest, pubManifest.android.images.icon );
    } catch( e ) {
      console.log( e );
      return null;
    }
    
  }
  
  return null;
}

function normalizePath( pathToPubManifest, iconPath ) {
  var arr = pathToPubManifest.split( path.sep );
  arr.pop();
  pathToPubManifest = arr.join( "/" );
  
  //Need to make sure the seperator is '/' for the web, even on window.
  arr = iconPath.split( path.sep );
  iconPath = "/" + arr.join( "/" );
  //var d = pathToPubManifest.split( "public" )[1];
  return pathToPubManifest.split( "public" )[1] + iconPath;
}