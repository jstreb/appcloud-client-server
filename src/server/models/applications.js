var wrench = require('wrench');
var path = require('path');
var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var exec = require('child_process').exec;

var GITHUB_ADDRESS = 'https://github.com/BrightcoveOS/App-Cloud-Demos/zipball/master';

module.exports.getDemos = function() {
  var listOfApps = wrench.readdirSyncRecursive( path.join( global.baseDir, 'public') );
  var apps = [];
  var name;
  
  for( var i=0; i<listOfApps.length; i++) {
    if( listOfApps[i].indexOf( "manifest.json" ) > -1 ) {
      name = getNameFromPath( listOfApps[i] );
      if( isDemoApp( listOfApps[i] ) ) {
        apps.push(
          {
            name: name,
            demo: true,
            readme: path.join( global.baseDir, "public", name, "README.md" )
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
  exec( 'appcloud -a -n ' + data.appName + ' -v ' + data.viewNames.join() + ' -p ' + path.join( __dirname, "..", "public" ), cb );
}

function isDemoApp( pth ) {
  var name = pth.split( "manifest.json" )[0];
  return path.existsSync( path.join( global.baseDir, "public", name, ".demo.txt" ) );
}

function getNameFromPath( pth ) {
  var name;
  dirs = pth.split( path.sep );
  return dirs[ dirs.length - 2 ];
}