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
 
/*global bc:true */
/*jshint indent:2, browser: true, white: false, undef:false*/


/**
 * A tabletVideosView is a view that presents a collection of playlists.  The view will show an initial screen of the list of playlists and then
 * allow the user to drill down into the a page that has the player and list of videos on it.  If there is only one playlist, it will go straight to the page with the list of videos.
 * To play videos from your account, set up a new content feed for your videos and also change the embed code to use an HTML5 player from your Video Cloud account.
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
 * @class A tabletVideosView is a view that presents a collection of playlists.  The view will show an initial screen of the list of playlists and then
 * allow the user to drill down into the a page that has the player and list of videos on it.  If there is only one playlist, it will go straight to the page with the list of videos.
 * To see your videos appear from your account while in development mode, before the template has been ingested into the App Cloud studio, the <code>contentFeed</code> and <code>DEFAULT_PLAYER_EMBED_CODE</code> 
 * must be updated with values from your account.  To update the content feed, replace the token with a Media API read token from your account and update the playlists IDs to playlists from your account.
 *
 * @constructor 
 * @param options An object of the possible options for this view.  The only option available is the element that this view should load into. By default, this will be the body tag.
 * @param ignore
 * @return  A new videosView instance.
 */
var tabletVideosView = ( function( $, undefined) {  
  var PLAYLIST_ITEMS_PER_ROW = 3,
      PLAYLIST_ITEM_CLASS = "playlist-list-item",
      DEFAULT_PLAYER_URL = ( "%PLAYER_URL%".indexOf( "%" ) > -1 ) ? "http://link.brightcove.com/services/player/bcpid835199013001?bckey=AQ~~,AAAAwnfEsvk~,KAoXD_LRPPB5swx0MfLg05G8agjxyQ1V" : "%PLAYER_URL%",
      BRIGHTCOVE_EXPERIENCE_URL = ( "%BRIGHTCOVE_EXPERIENCE_URL%".indexOf( "%" ) > -1 ) ? "http://admin.brightcove.com/js/BrightcoveExperiences.js": "%BRIGHTCOVE_EXPERIENCE_URL%",
      MESSAGE_TO_SHOW_USER_FOR_PLAYER_INPUT_FIELD = ( "%PLAYER_URL_SETTING_MESSAGE%".indexOf( "%" ) > -1 ) ? "Paste your Brightcove player URL here." : "%PLAYER_URL_SETTING_MESSAGE%",
      _defaults = { "element": "body" },
      _settings,
      _playerKey,
      _playerID;
      
  function getPlayerDimensions() {
    var width,
        height,
        DEFAULT_HEIGHT = 400,
        minimalHeight = ( bc.ui.height() > bc.ui.width() ) ? bc.ui.width() - 100 : bc.ui.height(); //100 is the space for when we are vertical.

    //299 is the height of the header, thumb strip and padding of the container.
    height = ( ( DEFAULT_HEIGHT + 299 ) > minimalHeight ) ? minimalHeight - 299 : DEFAULT_HEIGHT;
    width = ( height - 40 ) * ( 16/9 );
    return { width: width, height: height };
  }

  /**
   * @private
   */
  function tabletVideosView( options ) { 

    _settings = $.extend( {}, _defaults, options );
    
    /** The index of the current playlist in view. */
    this.indexOfCurrentPlaylist = "";

    /** The iScroll object for the list of thumbnails */
    this.thumbnailScroller = undefined;

    this.scrolling = undefined;
    
    this.element = $( _settings.element );
    
    if( bc.context.initialized ) {
      this.initialize();
    } else {
      $( bc ).bind( "init", $.proxy( function() {
        this.initialize();
      }, this ) );
    }
  }

  /**
   * The <code>initialize</code> function is called if the <code>bc.core</code> has already been initialized or after the <code>init</code> function fires.
   */
  tabletVideosView.prototype.initialize = function() {

    this.handlePageContainer();
    
    bc.ui.init();
    
    Mark.includes.videoplayer = bc.templates["video-player-tmpl"];
    
    bc.core.applyStyles( this.styles );
    
    //register our event listeners for this component.
    this.registerEventListeners();

    this.loadBrightcoveExperienceFile();
    
    this.setPlayerConfigs();
    
    this.element.addClass( bc.context.os );
    
    /** Tell the container that this view will support rotating in all directions */
    bc.device.setAutoRotateDirections( ['all'] );
    
    this.render( bc.core.cache( bc.viewID + "_videos_data" ) );
    
    bc.core.getData( 
      "videos",
      $.proxy( function( data ) {
        this.render( data );
      }, this ),
      $.proxy( function() {
        this.handleNoData();
      }, this ) 
    );

  };
  
  /**
   * Draw the UI to the current page.  Determines if it should either show a spinner, list of playlists, or a single playlist view.
   */
  tabletVideosView.prototype.render = function( data ) {
     //If the data is not new we should just return
     if( !!data && bc.utils.isEqual( data, this.data ) ) {
       //No need to the draw the UI if we have no new data.
       return;
     }

     if( ( !data && !this.data ) || ( data && data.items && data.items.length === 0 ) ) {
      return;
     }
     
     this.data = data.items;
     
     this.clearPageContainer();
     
     bc.core.cache( bc.viewID + "_videos_data", data );

     if ( this.data.length > 1 ) {
       this.buildListOfPlaylists();
     } else {
       this.indexOfCurrentPlaylist = 0;
       this.buildListOfVideos( this.data[ this.indexOfCurrentPlaylist ], true );
     }  

    bc.ui.enableScrollers();

   };
  
 /**
  * Called if there is an error getting data.  If we are in the Studio, then we show the spinner.
  */
  tabletVideosView.prototype.handleNoData = function() {
    //If we are in preview mode then show the spinner, otherwise do nothing
    if( bc.core.current_mode === bc.core.mode.PREVIEW ) {
      this.element.html( bc.ui.spinner() );
    }
  };

  /**
   * Populates the element with the default page container information.
   * @param element The element associated with this 
   */
  tabletVideosView.prototype.handlePageContainer = function( element ) {
    var context = {
      showBackToMoreSection: bc.context.moreNavigationView
    };
    this.element.html( Mark.up( bc.templates["page-container-tmpl"], context ) );
  };
  
  /**
   * Reset the contents of the page container by removing all elements that this class
   * creates as children/siblings of the page container contents.
   */
  tabletVideosView.prototype.clearPageContainer = function() {
    $( ".scroller .spinner" ).remove(); 
    $( ".scroller .error-message" ).remove();       
    $( ".scroller .playlist-list" ).empty();    
  };
  
  /**
   * Generates and appends the HTML snippet for the page that lists the playlists associated with this view.
   */
  tabletVideosView.prototype.buildListOfPlaylists = function() {
   var itemWidthInfo = this.calculatePlaylistItemWidthInfo(),
       context = {
          os: bc.context.os,
          marginRightAdjustment: itemWidthInfo.containerMarginAdjustment,
          width: itemWidthInfo.itemWidth,
          title: bc.core.getSetting( "titleOfPage" ),
          showBackButton: bc.context.moreNavigationView,
          height: this.calculatePlaylistItemHeight( itemWidthInfo.itemWidth ),
          imageHeight: this.calculatePlaylistImgHeight( itemWidthInfo.itemWidth ),
          playlists: this.data
        };

    $( ".playlist-list" ).html( Mark.up( bc.templates["list-of-playlists-tmpl"], context ) );     
  };

  /**
   * Determines the margin, padding, and border for a playlist-list-item.  This is used when calculating the widths and positions of
   * the playlist items.
   * @return An object that has the margin, padding, and border properties.  
   */
  tabletVideosView.prototype.calculatePlaylistItemNonContentSpace = function() {
    var measureItem = $( "<div class='border-b " + PLAYLIST_ITEM_CLASS + "' style='position:absolute;left:-10000px'></div>" ).appendTo( "body" ),
        margin = measureItem.css( "margin-left" ).replace( "px", "" ),
        padding = measureItem.css( "padding-left" ).replace( "px", "" ),
        border = measureItem.css( "border-left-width" ).replace( "px", "" );

    margin = margin ? margin : 0;
    padding = padding ? padding : 0;
    border = border ? border : 0;        

    measureItem.remove();

    return {
      "margin": parseInt( margin, 10 ),
      "padding": parseInt( padding, 10 ),
      "border": parseInt( border, 10 )
      };
  };

  /**
   * Determines the correct width of a playlist item and any adjustments that need to made to the container.
   * @return An object that has properties of <code>itemWidth</code> and <code>containerMarginAdjustment</code>.
   */
  tabletVideosView.prototype.calculatePlaylistItemWidthInfo = function() {  
    // get total available space
    var screenWidth = bc.ui.width(),
        itemSpacing = this.calculatePlaylistItemNonContentSpace(),
        totalItemSpacing = ( itemSpacing.border + itemSpacing.padding + itemSpacing.margin ) * 2 * PLAYLIST_ITEMS_PER_ROW,
        itemContentAvailSpace = screenWidth - totalItemSpacing,
        extraPixels = itemContentAvailSpace % PLAYLIST_ITEMS_PER_ROW,
        containerMarginAdjustment = Math.floor( extraPixels / 2 ),
        itemWidth = itemContentAvailSpace / PLAYLIST_ITEMS_PER_ROW;
    
    // allocate any 'extra' pixels to the left and right margin of the container
    return {
      "itemWidth": itemWidth,
      "containerMarginAdjustment": containerMarginAdjustment
    };
  };

  /**
   * Determines the height of a playlist item using the passed-in width and the specified aspect ratio exposed as a setting.
   * @param itemWidth The width of the playlist item.
   * @return The height to be used for the playlist item.
   */
  tabletVideosView.prototype.calculatePlaylistItemHeight = function( itemWidth ) {
    var itemHeight = ( bc.core.getSetting( "aspectRatioOfPlaylistThumbnail" ) ) * itemWidth;
    return ( itemHeight + 35 );
  };

  /**
   * Determines the height of an image within the playlist.
   * @param itemWidth The width of the image to placed inside the playlist item.
   * @return The new height of the image.
   */
  tabletVideosView.prototype.calculatePlaylistImgHeight = function( imageWidth ) {    
    return ( bc.core.getSetting( "aspectRatioOfPlaylistThumbnail" ) ) * imageWidth;
  };

  /**
   * If the device supports the Brightcove HTML5 players, then we inject the <code>BrightcoveExperience</code> file into the DOM.
   */
  tabletVideosView.prototype.loadBrightcoveExperienceFile = function() {
    var bc;
    if( $( "[src='" + BRIGHTCOVE_EXPERIENCE_URL + "']" ).length === 0 ) {
      bc = document.createElement( "script" );
      bc.type = "text/javascript";
      bc.src = BRIGHTCOVE_EXPERIENCE_URL;
      document.getElementsByTagName("head")[0].appendChild( bc );
    }
  };

  /**
    * Handles new settings and styles becoming available to the view.  When new styles become available, the view will call
    * <code>applyStyles</code>, which will update the UI with the new styles.
    * @param evt The event object.
    * @param info The info object has the new settings and styles.
    */
  tabletVideosView.prototype.handleNewConfigurationInfo = function( info ) {
    if ( info.status !== "error" && info.styles.isNew ) {
       bc.core.applyStyles( info.styles.values );
    }    
  };

  /**
   * Register all of the event listeners for the tabletVideosView.  The reason for this is 
   *  because many of these elements are built dynamically in JavaScript, they may not exist at the time that <code>registerEventListeners</code> is called.  Additionally, we
   * recommend 'delegate' over 'live' since some events are not bubbled all the way up to the document, which is what .live listens on.
   */
  tabletVideosView.prototype.registerEventListeners = function() {
    var self = this;
    //register event listener for when new data is fetched
    $( bc ).on( "newconfigurations", function( evt, info ) {
      self.handleNewConfigurationInfo( info );
    }); 

    $( "body" ).on( "tap", ".playlist-list-item", function( evt ) {
      self.handlePlaylistTap( evt );
    });

    $( "body" ).on( "tap", ".back-button", function( evt ) {
      self.handleBackButtonTap( evt );
    });   

    //This is a click instead of a tap, because the swapping of the video player via tap happened so fast that it could cause the browser to crash.
    $( "body" ).on( "click", "#thumb-strip li", function( evt ) {
      self.handleVideoThumbClick( evt );      
    });
    
    $( window ).on( "resize", function( data ) {
      self.handleResize( data );
    });
    
  };

  /**
   * Handles the orientation change of the view.  The function is responsible for refreshing the scroller of the thumbnails.
   * @param data The data that was fired with this event.
   */
  tabletVideosView.prototype.handleResize = function( data ) {
    var itemWidth = this.calculatePlaylistItemWidthInfo().itemWidth,
        itemHeight = this.calculatePlaylistItemHeight( itemWidth ),
        imgHeight = this.calculatePlaylistImgHeight( itemWidth );
    
    $( "li.set-width-and-height-js" ).width( itemWidth )
                                      .height( itemHeight );
                                      
    $( "img.set-width-and-height-js" ).width( itemWidth )
                                      .height( imgHeight );
                                   
    
    
    if( this.thumbnailScroller !== undefined ) {
      this.thumbnailScroller.refresh();
    }
  };
  
  /**
   * Called when the user taps the back button.  Responsible for transition back to the home page and destroying the scroller.
   * @param evt 
   */
  tabletVideosView.prototype.handleBackButtonTap = function( evt ) {
    bc.ui.backPage();
    if( this.thumbnailScroller !== undefined ) {
      this.thumbnailScroller.destroy();
      this.thumbnailScroller = undefined;
    }

  };
  
  /**
   * Handles the tapping of a video thumbnail by updating the details and playing the video.
   * @param evt The event object associated with this tap event.
   */
  tabletVideosView.prototype.handleVideoThumbClick = function( evt ) {
    var $elem = $( evt.currentTarget ),
        videoIDX =  $( evt.currentTarget ).data("bc-video-idx"),
        video = this.videoAtIndex( videoIDX );
    
    $elem.siblings( ".active" )
         .removeClass( "active selectedVideoBorderColor" );
         
    $elem.addClass( "active selectedVideoBorderColor" );
    this.updateVideoPlayer( video );
  };

  /**
   * Stops the current video from playing and replaces it with the new video.
   * @param video The new video that should be played.
   */
  tabletVideosView.prototype.updateVideoPlayer = function( video ) {
    var context,
        playerDimensions = getPlayerDimensions();
    $( ".player-container" ).find( 'video' ).each( function() {
      this.pause();
      $( this ).remove();
    });
    context = {
      video: video,
      playerID: _playerID,
      playerKey: _playerKey,
      playerContainerWidth: playerDimensions.width,
      playerContainerHeight: playerDimensions.height,
      playerWidth: playerDimensions.width,
      playerHeight: playerDimensions.height - 40,
      brightcoveDefined: ( typeof( brightcove ) !== "undefined" )
    };

    $( ".player-container" ).html( Mark.up( bc.templates["video-player-tmpl"], context ) );
  };

  /**
   * Handles the building of the list of videos and adding the approriate CSS classes to the elements.
   * @param evt The event object that was triggered from a tap event.
   */
  tabletVideosView.prototype.handlePlaylistTap = function( evt ) {
    var $elem = $( evt.currentTarget );
    $elem.addClass( "bc-active" );    
    $elem.find( ".header-b" ).addClass( "bc-active" );
    $elem.find( ".desc-a" ).addClass( "bc-active" );
    this.indexOfCurrentPlaylist = $elem.attr( "data-bc-playlist-idx" );     
    this.buildListOfVideos( this.data[ this.indexOfCurrentPlaylist ], false );
  };

  /**
   * Generates and injects the HTML for the list of videos page.  If there is only one playlist associated with this view then
   * this will be the first page. Otherwise it will be transitioned to and a back button will be drawn in the upper left hand corner.
   * @param playlist The playlist object that contains the data needed to build this HTML.
   * @param firstPage A boolean indicating if this is the first page being shown to the user.
   */
  tabletVideosView.prototype.buildListOfVideos = function( playlist, firstPage ) {
    var playerDimensions = getPlayerDimensions(),
        widthOfEachVideo = 222,
        context = {
          firstpage: firstPage,
          showBackButton: ( !firstPage || (firstPage && bc.context.moreNavigationView ) ),
          index: this.indexOfCurrentPlaylist,
          os: bc.context.os,
          playerContainerWidth: playerDimensions.width,
          playerContainerHeight: playerDimensions.height,
          playerWidth: playerDimensions.width,
          playerHeight: (playerDimensions.height - 40),
          playerKey: _playerKey,
          playerID: _playerID,
          playlist: playlist,
          video: playlist.videos[0],
          brightcoveDefined: ( typeof( brightcove ) !== "undefined" ),
          thumbStripWidth: playlist.videos.length * widthOfEachVideo
        };
      
    if( firstPage && !bc.context.moreNavigationView ) {
      $( ".list-of-videos .back-button" ).css( {display: "none" } );
    } else {
      $( ".list-of-videos .back-button" ).css( {display: "block" } );
    }
    bc.ui.forwardPage( $( ".list-of-videos" )[0] );

    
    $( bc ).one( "pageshow", $.proxy( function() {
      $( ".videos-page" ).html( Mark.up( bc.templates["video-detail-tmpl"], context ) );
      if( $( "#thumb-strip" ).length > 0 ) {
        this.thumbnailScroller = new iScroll( "thumb-strip", { hScroll: true, vScroll: false, hScrollbar: false, vScrollbar: false } );
      }
    }, this ) );
    
  };

  /**
   * Gets the video object from the currentPlaylist.
   * @param videoIDX The index of the video that appears in the playlist.
   * @return The video object that corresponds to the index passed in.
   */
  tabletVideosView.prototype.videoAtIndex = function( videoIDX ) {
    var playlist = this.currentPlaylist(),
        video;

    if ( playlist ) {
      video = playlist.videos[ videoIDX ];
    }
    return video;    
  };

  /**
   * Gets the current playlist for the view.
   * @return The playlist object for the current playlist.
   */
  tabletVideosView.prototype.currentPlaylist = function() {
    var currentPlaylist;
    if ( this.data ) {
      currentPlaylist = this.data[ this.indexOfCurrentPlaylist ];
    }

    return currentPlaylist;
  };
  
  tabletVideosView.prototype.setPlayerConfigs = function() {
    var playerIDDelimeter = "bcpid",
        playerKeyDelimeter = "bckey=",
        playerURL = ( bc.core.getSetting( "playerURL" ) === undefined || bc.core.getSetting( "playerURL" ) === MESSAGE_TO_SHOW_USER_FOR_PLAYER_INPUT_FIELD ) ? DEFAULT_PLAYER_URL : bc.core.getSetting( "playerURL" );
      
    _playerID = playerURL.substring( playerURL.indexOf( playerIDDelimeter ) + playerIDDelimeter.length, playerURL.indexOf( "?" ) );
    _playerKey = playerURL.substring( playerURL.indexOf( playerKeyDelimeter ) + playerKeyDelimeter.length );
  };

  return tabletVideosView;  

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