/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
 
/*global bc:true atob:false*/
/*jshint indent:2, browser: true, white: false devel:true undef:false*/
/**
 * A videosView is a view that presents a collection of playlists.  The view will show an initial screen of the list of playlists and then
 * allow the user to drill down into the list of videos and finally the details for a particular video.  Once on the video detail page, the user can then 
 * play the video.  To play videos from your account, set up a new content feed for your videos and also change the embed code to use an HTML5 player from your Video Cloud account.
 *
 * Read <a href="http://docs.brightcove.com/en/app-cloud-beta/creating-and-managing-feeds" target="_blank">Creating and manageing feeds</a>.  <b>CORE</b> users you must 
 * setup "Default Playlists" when you create Video Cloud Connectors.
 *
 * Using an HTML5 player from your account.
 *
 * 1.  Navigate to the Publishing module in the Video Cloud Studio for the account that corresponds to the Media API token you used to create the content feed.
 * 2.  Choose a single title video player that is enabled for HTML5 and then click "get code" and choose <b>Player URL</b>
 * 3.  Open the manifest.json file and paste the playerURL into the playerURL setting under the videos view.
 * 4.  Change the ID of "contentConnector" in the manifest.json under the videos view.
 *
 * @class A videosView is a view that presents a collection of playlists.  The view will show an initial screen of the list of playlists and then
  * allow the user to drill down into the list of videos and finally the details for a particular video.  Once on the video detail page, the user can then 
  * play the video.
 * @constructor
 * @param {HTMLElement} element The containing element on the page that the view should be displayed in.
 * @param ignore
 * { @list Styles: playlistTitleColor, videoTitleColor, detailDescriptionColor, videoDescriptionColor, cellBackgroundColor }
 * @return  A new videosView instance.
 */
var videosView = ( function( $, undefined) {
  var _transitioningToDetailPage = false,
      _indexOfCurrentPlaylist,
      _settings,
      _brightcovePlayerCompatible,
      _defaults = { "element": "body" },
      _embedCode,
      DEFAULT_PLAYER_URL = ( "%PLAYER_URL%".indexOf( "%" ) > -1 ) ? "http://link.brightcove.com/services/player/bcpid835199013001?bckey=AQ~~,AAAAwnfEsvk~,KAoXD_LRPPB5swx0MfLg05G8agjxyQ1V" : "%PLAYER_URL%",
      MESSAGE_TO_SHOW_USER_FOR_PLAYER_INPUT_FIELD = ( "%PLAYER_URL_SETTING_MESSAGE%".indexOf( "%" ) > -1 ) ? "Paste your Brightcove player URL here." : "%PLAYER_URL_SETTING_MESSAGE%",
      BRIGHTCOVE_EXPERIENCE_URL = ( "%BRIGHTCOVE_EXPERIENCE_URL%".indexOf( "%" ) > -1 ) ? "http://admin.brightcove.com/js/BrightcoveExperiences.js": "%BRIGHTCOVE_EXPERIENCE_URL%";
      
  /**
   * @private
   */
  function videosView( options ) { 

    _settings = $.extend( {}, _defaults, options );

    this.element = $( _settings.element );
    
    //The callback function to stop sending metric events for video viewing.
    this.videoViewingEventCallback = undefined;
    
    //The index of the current video being viewed.  Undefined, if the user is not on a video detail page.
    this.currentVideo = undefined;
    
    $( document ).bind( "touchmove", function( evt ) {
      evt.preventDefault();
    });
 
    if( bc.context.initialized ) {
      this.initialize();
    } else {
      $( bc ).one( "init", $.proxy( function() {
        this.initialize();
      }, this ) );
    }
  }

  /**
   * The <code>initialize</code> function is called if the <code>bc.core</code> has already been initialized or after the <code>init</code> function fires.
   */
  videosView.prototype.initialize = function() {
    this.handlePageContainer();
    
    bc.ui.init();
    
    //Load the BrightcoveExperience.js file if it is not already loaded and we support the BC HTML5 players.
    if( this.brightcovePlayerCompatible() ) {
      this.loadBrightcoveExperienceFile();
      this.setPlayerEmbedCode();
    }

    //Allow this view to rotate in all directions
    bc.device.setAutoRotateDirections( ['all'] );
    
    //Add our css
    this.element.addClass( "playlist-container" );
    
    //Apply the CSS styles that our currently in the cache.
    bc.core.applyStyles();
    
    //register our event listeners for this view.
    this.registerEventListeners();

    //Builds the page as soon as this view is instantiated.
    this.render( bc.core.cache( bc.viewID + "_videos_data" ) );
    
    //Retrieve the data from the server.
    bc.core.getData( 
      "videos", 
      $.proxy( function( data ) {
        this.render( data.items );
      }, this ),
      $.proxy( function( data ) {
        this.handleNoData( data );
      }, this ) 
    );
    
  };
  
  /**
   * Responsible for building out the HTML for the first page the user is shown. If there is only one playlist assigned to this
   * view, then the view will not build the playlist view but rather go directly to the list of videos. 
   */
  videosView.prototype.render = function( data ) {

    //If the data is not new we should just return
    if( data !== undefined && bc.utils.isEqual( data, this.data ) ) {
      //No need to the draw the UI if we have no new data.
      return;
    }
    
    if( !data ) {
     return;
    }

    this.clearPageContainer();

    bc.core.cache( bc.viewID + "_videos_data", data );
    this.data = data;

    if ( this.data.length === 0 ) {
      this.handleNoVideos();
    }
    else if ( this.data.length === 1 ) {
      _indexOfCurrentPlaylist = 0;
      this.buildListOfVideos( this.data[_indexOfCurrentPlaylist], true );
    } else {
      this.buildListOfPlaylists();      
    }  
     
    bc.ui.enableScrollers();
  };

  /**
   * Reset the contents of the page container by removing all elements that this class
   * creates as children/siblings of the page container contents.
   */  
  videosView.prototype.clearPageContainer = function() {
    $( ".scroller .spinner" ).remove(); 
    $( ".scroller .error-message" ).remove();       
    $( ".scroller .ul-listview" ).empty();    
  };

  /**
   * Called if there is an error getting data. If we are in the Studio then we show the spinner.
   */
  videosView.prototype.handleNoData = function( error ) {
    this.renderErrorMessage( error.error );
  };
  
  /**
   * Called if there is no playlists or videos are returned from the databinding.
   */
  videosView.prototype.handleNoVideos = function( error ) {
    this.renderErrorMessage( "No videos are currently available, add some playlists." );
  };

  /**
   * Render out a specific error message to the user.  For now, this is meant for informational
   * purposes in the Studio and not in a running app.  This is a useful place to add additional
   * logic/feedback to a user of the app if content is not available.
   */
  videosView.prototype.renderErrorMessage = function( errorMsg ) {
    // we might be called as a result of error callback, need to clear any existing content
    this.clearPageContainer();

    if( bc.core.current_mode === bc.core.mode.PREVIEW ) {
      $( ".scroller" ).append( "<h3 class='header-b error-message'>" + errorMsg + "</h3>" );
    }
  };

  videosView.prototype.handlePageContainer = function() {
    var context = {
      showBackToMoreSection: bc.context.moreNavigationView
    };
    this.element.html( Mark.up( bc.templates["page-container-tmpl"], context ) );
  };
  
  /**
    * Handles new settings or styles becoming available to the view.  When new styles become available, the view will call
    * <code>applyStyles</code> which will update the UI with the new styles.
    * @param evt The event object.
    * @param info The info object has the new settings and styles.
    */
  videosView.prototype.handleNewConfigurationInfo = function( info ) {
    if ( info.status !== "error" && info.styles.isNew ) {
       bc.core.applyStyles( info.styles.values );
    }    
  };

  /**
   * Builds the HTML for the list of Playlists page and injects it into the DOM.  See <code>listOfPlaylistHTML</code> for the
   * actual HTML snippet that gets created.
   */
  videosView.prototype.buildListOfPlaylists = function() {
    var html = bc.templates["list-of-playlists-tmpl"],
        context = { playlists: this.data },
        options = {
          globals: {
            orientation: bc.context.orientation
          }
        };
      

    $( ".list-of-playlists" ).find( ".ul-listview" )
                             .html( Mark.up( html, context, options ) );

    $( ".list-of-videos" ).css( "-webkit-transform", "translate3d( 100%, 0px, 0px )" );
    bc.ui.setCurrentPage( $( ".list-of-playlists" ) );
    this.handleOrientationChange();
  };

  /**
   * Builds, injects, and transitions to the list of videos page.  Depending on whether or not this is the first page of this view, it will either add a new
   * header and transition to the new page once it has been added to the view, or simply build the HTML and inject into the element.
   * @param playlist The data for the playlist that is to be rendered on this page.
   * @param firstPage A boolean indicating if this is the first page in the view.  True if there is only playlist data bound to this view.
   */
  videosView.prototype.buildListOfVideos = function( playlist, firstPage ) {
    var $listOfVideosPage = $( ".list-of-videos" );

    //If this is not the first page then we need to add in a new page and header to transition to.
    if( firstPage ) {
      if( !bc.context.moreNavigationView ) {
        $( ".list-of-videos .back-button" ).css( "display", "none" );
      }  
      $( ".list-of-playlists .ul-listview" ).empty();    
      bc.ui.setCurrentPage( $( ".list-of-videos" ) );
    } else {
      $( ".list-of-videos .back-button" ).css( "display", "block" );
    }
    
    $listOfVideosPage.find( ".ul-listview" ).html( Mark.up( bc.templates["list-of-videos-tmpl"], { videos: playlist.videos } ) );

    if( !firstPage ) {
      bc.ui.forwardPage( $listOfVideosPage );
    }
  };
  
  /**
   * Builds the video detail page and transitions to it.
   * @param video The video object used to build the HTML for the detail page.  This object expects the following values:
   <pre>
   { 
    "id": "unique_id",
    "FLVURL": "url to the video file.  (can be a m3u8 index file)",
    "name": "The name of the video",
    "thumbnailURL": "The url to the thumbnail",
    "shortDescription": "The short description",
    "videoStillURL": "The url to the video still"
   }
   </pre>
   */
  videosView.prototype.buildVideoDetail = function( video ) {
    var brightcoveCompatible = this.brightcovePlayerCompatible(),
        $html,
        context = {
          video: video,
          brightcoveCompatible: brightcoveCompatible,
          height: ( bc.ui.width() * 0.75 )
        };
    
    $( ".page.video-details" ).data( "bc-video-id", video.id );
    $html = $( Mark.up( bc.templates["video-details-tmpl"], context ) );
    this.currentVideo = video;
    
    if( !brightcoveCompatible ) {
      $html.find( ".offscreen" )
           .appendTo( "body" )
           .one( "load", $.proxy( function( evt ) {
             this.positionVideoStill( evt.currentTarget );
           }, this ) );
    }
    
    $( ".page.video-details .scroller > div" ).html( $html );
    bc.ui.forwardPage( $( ".page.video-details" ) );

    if( bc.metrics !== undefined ) {
      this.videoViewingEventCallback = bc.metrics.live( 
        "content",
        { "name": this.currentVideo.name,
          "type": "video",
          "uri": this.currentVideo.name
        } 
      );
    }

  };
  
  /**
   * The HTML snippet for the Brightcove Video Cloud player embed code.  This HTML comes from the settings for the view, so that a user can set the embed code via the App Cloud Studio.
   * @param id The id of the video to play.
   */
  videosView.prototype.brightcovePlayerHTML = function( id ) {
    var $playerHTML = $( _embedCode ),
        $widthParam = $playerHTML.find( "param[name='width']" ),
        $heightParam = $playerHTML.find( "param[name='height']" ),
        width = 320,
        height = 180;
    
    // update size
    $widthParam.attr( "value", width );
    $heightParam.attr( "value", height );

    $playerHTML.find( "param[name='@videoPlayer']" ).attr( "value", id );
    
    playerHTML = $( "<div></div>" ).append( $playerHTML ).html();
    setTimeout( function() {
      $( "head" ).append( "<script type='text/javascript'>brightcove.createExperiences();</script>" );
    }, 0 );
    return playerHTML;
  };

  /**
   * Register all of the event listeners for the videosView.  These should be registered as delegates
   * wherever possible.  This is because since many of these elements are built dynamically in JavaScript,
   * they may not exist at the time that <code>registerEventListeners</code> is called.  Additionally, we
   * recommend 'delegate' over 'live' since some events are not bubbled all the way up to the document, which is what <code>.live</code> listens on.
   */
  videosView.prototype.registerEventListeners = function() {
    //register event listener for when new data is fetched
    $( bc ).on( "newconfigurations", $.proxy( function( evt, info ) {
          this.handleNewConfigurationInfo( info );
        }, this ) 
    );

    //Bind the playlist to a tap event.
    $( "body" ).on( "tap", ".playlist", $.proxy( function( evt ) {
      this.playlistTap( evt );
    }, this ) );
    
    //Bind the playlist to a tap event.
    $( "body" ).on( "tap", ".video", $.proxy( function( evt ) {
      this.videoTap( evt );
    }, this ) );
    
    //Bind to the back button.
    $( "body" ).on( "tap", ".back-button", $.proxy( function( evt ) {
      this.handleBackButtonTap( evt );
    }, this ) );
    
    //Bind to the player-contianer tap event.
    $( "body" ).on( "tap", ".player-container", $.proxy( function( evt ) {
      this.playVideo();
    }, this ) );
    
    $( bc ).on( "pageshow", $.proxy( function( evt, page ) {
      this.hideSpinnerAfterVideoLoads();
      this.loadPlayer( page );
    }, this) );
    
    $( bc ).on( "viewfocus", $.proxy( function( evt ) {
      this.handleViewFocus( evt );
    }, this ) );
    
    $( bc ).on( "viewblur", $.proxy( function( evt ) {
      this.handleViewBlur( evt );
    }, this ) );
    
    $( bc ).on( "vieworientationchange", $.proxy( function( evt ) {
      this.handleOrientationChange( evt );
    }, this ) );
  };
  
  videosView.prototype.handleOrientationChange = function() {
    var $ul = $( ".list-of-playlists .ul-listview" ),
        scroller;
      
    if( bc.context.viewOrientation === "landscape" ) {
      $ul.width( this.data.length * ( $ul.find( "li" ).width() + 20 ) );
      scroller = bc.ui.getScrollerForPage( 0 );
      scroller.scrollToY( 0, "0ms");
      scroller.setScrollingDirection("horizontal");
    } else {
      $ul.width( "100%" );
      scroller = bc.ui.getScrollerForPage( 0 );
      scroller.scrollToX( 0, "0ms" );
      scroller.setScrollingDirection("vertical");
    }
  };
  
  /**
   * Called when the user taps on the video still.  We load the video player off the screen in order to work around issues of
   * putting HTML elements over the video player.
   */
  videosView.prototype.playVideo = function() {
    bc.ui.currentPage.find( "video" ).get(0).play();
  };
  
  /**
   * Called when the user taps the <code>li</code> that represents the playlist.  This function is responsible for providing the wiring to build the list of videos page.
   * @param evt The event object that was triggered when from this tap event.
   */
  videosView.prototype.playlistTap = function( evt ) {
    var $elem = $( evt.currentTarget );
    $elem.addClass( "bc-active" );
    $elem.find( ".header-b" ).addClass( "bc-active" );
    $elem.find( ".desc-a" ).addClass( "bc-active" );
    _indexOfCurrentPlaylist = $elem.attr( "data-index" );
    this.buildListOfVideos( this.data[_indexOfCurrentPlaylist], false );
  };
  
  /**
   * Called whenever the user taps on the back button.  This function is responsible for transitioning the page back to the previous page and stopping the video viewing events if we are on the 
   * video detail page.
   * @param evt The event that was fired with this tap event.
   */
  videosView.prototype.handleBackButtonTap = function( evt ) {
    if( bc.ui.currentPage.hasClass( "video-details" ) && this.videoViewingEventCallback) {
      this.videoViewingEventCallback();
      this.currentVideo = undefined;
    }
    bc.ui.backPage();
  };
  
  /**
   * Called when the user taps the <code>li</code> that represents the video.  This function is responsible for providing the wiring to build the video detail page.
   * @param evt The event object that was triggered when from this tap event.
   */
  videosView.prototype.videoTap = function( evt ) {
    var $elem,
        video;
        
    if ( _transitioningToDetailPage ) {
      return;
    }
    
    _transitioningToDetailPage = true;
    $( bc ).one( "pageshow", function( evt, page ) {  
      _transitioningToDetailPage = false;    
    });
    $elem = $( evt.currentTarget );
    $elem.addClass( "bc-active" );
    $elem.find( ".header-b" ).addClass( "bc-active" );
    $elem.find( ".desc-a" ).addClass( "bc-active" );
    video = this.findVideoByID( $elem.data( "bc-video-id" ) );
    if( video ) {
      this.buildVideoDetail( video );
    }
  };
  
  /**
   * Called when the "view" gains focus. 
   * @param evt The event object that was fired with this event.
   */
  videosView.prototype.handleViewFocus = function( evt ) {
    if( this.currentVideo !== undefined && bc.metrics !== undefined ) {
      this.videoViewingEventCallback = bc.metrics.live( 
        "content",
        { "name": this.currentVideo.name,
          "type": "video",
          "uri": this.currentVideo.name
        } 
      );
    }
  };

 /**
  * Called when this "view" loses focus.  This occurs when the user switches to a different "view". 
  * @param evt The event object that was fired with this event.
  */
 videosView.prototype.handleViewBlur = function( evt ) {
   //If we have an article viewing event then we need to kill it.
   if( this.videoViewingEventCallback !== undefined ) {
     this.videoViewingEventCallback();
   }
 };
  
  /**
   * Helper function to find a video object by its Video Cloud ID.
   * @param id The ID for the video we are want to look up.
   * @return A video object or null if there is no video object with that ID.
   */
  videosView.prototype.findVideoByID = function( id ) {
    for( var i = 0, len = this.data.length; i < len; i++ ) {
      for(var j = 0, max = this.data[i].videos.length; j < max; j++ ) {
        if( id === this.data[i].videos[j].id ) {
          return this.data[i].videos[j];
        }
      }
    }
    return null;
  };

  
  /**
   * Called once the video still has finished loading off screen.  The function
   * is responsible for positioning the video still vertically inside the container.
   */
  videosView.prototype.positionVideoStill = function( elem ) {
    var $elem = $(elem ),
         newTop = "0px",
         containerHeight = $( ".player-container" ).height();
         
    if( $elem.height() < containerHeight ) {
      newTop = ( containerHeight - $elem.height() ) / 2;
    }
    $elem.css( { "top": newTop } )
         .removeClass( "offscreen" )
         .addClass( "video-still" )
         .insertBefore( ".play-icon" );
  };
  
  /**
   * If the device supports the Brightcove HTML5 players, then we inject the <code>BrightcoveExperience</code> file into the DOM.
   */
  videosView.prototype.loadBrightcoveExperienceFile = function() {
    var bc;
    if( $( "[src='" + BRIGHTCOVE_EXPERIENCE_URL + "']" ).length === 0 ) {
      bc = document.createElement( "script" );
      bc.type = "text/javascript";
      bc.src = BRIGHTCOVE_EXPERIENCE_URL;
      document.getElementsByTagName("head")[0].appendChild( bc );
    }
  };
  
  /**
   * The Brightcove Video Cloud HTML5 players are not supported on iOS 4.1 and below.  This function
   * inspects the user agent to see if this device will support the Video Cloud HTML5 players.
   * return Boolean indicating whether or not Video Cloud HTML5 players are supported.
   */
  videosView.prototype.brightcovePlayerCompatible = function() {
    var useragent;
    if( _brightcovePlayerCompatible !== undefined ) {
      return _brightcovePlayerCompatible;
    }
    
    useragent = navigator.userAgent;
    if( useragent.indexOf( "iPhone OS 3") > -1 || useragent.indexOf( "iPhone OS 4_0") > -1 || useragent.indexOf( "iPhone OS 4_1" ) > -1 ) {
      return ( _brightcovePlayerCompatible = false );
    }
    return (_brightcovePlayerCompatible = true );
  };
  
  /**
   * While the Brightcove Video Cloud HTML5 players are loading, we show a spinner
   * to let the user know that something is happening.  This function removes the spinner
   * once the player has loaded.
   */
  videosView.prototype.hideSpinnerAfterVideoLoads = function() {
    
    if( bc.ui.currentPage.find( "iFrame" ).length > 0 ) {
      bc.ui.currentPage.find( ".spinner" ).remove();
      return;
    }
    setTimeout( $.proxy( function() { this.hideSpinnerAfterVideoLoads(); }, this ), 100 );
  };
  
  /**
   * Injects the Brightcove Video Cloud HTML5 player into the DOM.  We do this once the page
   * has finished transitioning in order to ensure that the transition is smooth across
   * devices.
   */
  videosView.prototype.loadPlayer = function( page ) {
    var $page = ( page !== undefined ) ? $( page ) : bc.ui.currentPage;
    if( $page.hasClass( "video-details" ) && this.brightcovePlayerCompatible() ) {
      $( this.brightcovePlayerHTML( $page.data( "bc-video-id" ) ) ).appendTo( ".player-container" );
    }
  };
  
  videosView.prototype.setPlayerEmbedCode = function() {
    var defaultEmbedCode = "<object id='myExperience' class='BrightcoveExperience'><param name='bgcolor' value='#ffffff' /><param name='width' value='480' /><param name='height' value='270' /><param name='playerID' value='%PLAYERID%' /><param name='playerKey' value='%PLAYERKEY%' /><param name='isVid' value='true' /><param name='isUI' value='true' /><param name='dynamicStreaming' value='true' /><param name='@videoPlayer' value='' /></object>",
        playerIDDelimeter = "bcpid",
        playerKeyDelimeter = "bckey=",
        playerURL = ( bc.core.getSetting( "playerURL" ) === undefined || bc.core.getSetting( "playerURL" ) === MESSAGE_TO_SHOW_USER_FOR_PLAYER_INPUT_FIELD ) ? DEFAULT_PLAYER_URL : bc.core.getSetting( "playerURL" ),
        playerID = playerURL.substring( playerURL.indexOf( playerIDDelimeter ) + playerIDDelimeter.length, playerURL.indexOf( "?" ) ),
        playerKey = playerURL.substring( playerURL.indexOf( playerKeyDelimeter ) + playerKeyDelimeter.length );
      
    _embedCode = defaultEmbedCode.replace( "%PLAYERID%", playerID ).replace( "%PLAYERKEY%", playerKey );
  };
  
  return videosView;
  
})( bc.lib.jQuery );

Mark.pipes.imgForPlaylist = function( videos ) {
  // try to find a videoStill
  for( var i=0, len=videos.length; i<len; i++ ) {
    if ( !!videos[i].videoStillURL ) {
      return videos[i].videoStillURL;
    }
  }
  
  for( i=0, len=videos.length; i<len; i++ ) {
    if ( !!videos[i].thumbnailURL ) {
      return videos[i].thumbnailURL;
    }
  } 

  return "";
};

Mark.pipes.widthOfLI = function() {
  // 30 is because we have 20 pixels of padding on the sides but tabbar is 50 pixels high.
  return ( bc.context.viewOrientation === "landscape" ) ? Math.floor( bc.ui.height() + 50 ): Math.floor( bc.ui.width() - 20 );
};

Mark.pipes.widthOfImage = function() {
  // 30 is because we have 20 pixels of padding on the sides but tabbar is 50 pixels high.
  return ( bc.context.viewOrientation === "landscape" ) ? Math.floor( bc.ui.height() + 50 ): Math.floor( bc.ui.width() - 20 );
};

Mark.pipes.heightOfImage = function() {
  var width = ( bc.context.viewOrientation === "landscape" ) ? Math.floor( bc.ui.height() + 50 ): Math.floor( bc.ui.width() - 20 );
  return Math.floor( width * 0.56 );
};
