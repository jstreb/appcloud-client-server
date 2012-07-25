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
 * A photoGalleryView is a view that presents a collection of photos. The view will show an initial screen of a grid thumbnails.
 * When the user taps a thumbnail, they will transition to a new screen that shows the fullsize image that then allows the user to swipe through the
 * images.  Tapping this screen will hide or show the details for this image.  To use this view on a tablet, simply include  <code>source/views/tablet-photogallery.js</code> in addition
 * to this file.  The <code>tablet-photogallery.js</code> file will override a handful of the functions to make this specific to tablets.
 *
 * @class A photoGalleryView is a view that presents a collection of photos. The view will show an initial screen of a grid thumbnails.
 * When the user taps a thumbnail they will transition to a new screen that shows the fullsize image that then allows the user to swipe through the
 * images.  Tapping this screen will hide or show the details for this image.  To use this view on a tablet, simply include <code>source/views/tablet-photogallery.js</code> in addition
 * to this file.  The <code>tablet-photogallery.js</code> file will override a handful of the functions to make this specific to tablets.
 * @constructor
 * @param options An object of the possible options for this view. The only option available is the element that this view should load into. By default, this will be the body tag.
 * @param ignore
 * { @list Styles: gridBackgroundColor, sliderBackgroundColor, descriptionTextColor }
 * @example new photoGalleryView( document.getElementById( "photoGallery" ) );
 * @return  A new photoGalleryView instance.
 */
var photoGalleryView = ( function( $, undefined ) {
  var _orientation,
      _overlayShowing = true,
      _defaults = { "element": "body" },
      PADDING_BETWEEN_THUMBNAILS = 4,
      DEFAULT_NUMBER_OF_THUMBS_PER_ROW = 2,
      _emptyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzM5MUE4Q0JFMzhCMTFFMEE2MkNCNzAzMDM3NjE0M0UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzM5MUE4Q0NFMzhCMTFFMEE2MkNCNzAzMDM3NjE0M0UiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3MzkxQThDOUUzOEIxMUUwQTYyQ0I3MDMwMzc2MTQzRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3MzkxQThDQUUzOEIxMUUwQTYyQ0I3MDMwMzc2MTQzRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Phf80ecAAAAQSURBVHjaYvj//z8DQIABAAj8Av7bok0WAAAAAElFTkSuQmCC";
      
  /**
   * @private
   */
  function photoGalleryView( options ) {    

    _settings = $.extend( {}, _defaults, options );
    
    this.element = $( _settings.element ).addClass( "photo-gallery-thumbnail-grid" );

    //The index of the current photo
    this.indexOfCurrentImag = undefined;

    //Do not allow the page to scroll
    document.addEventListener( "touchmove", function( evt ) { evt.preventDefault(); } );
    
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
  photoGalleryView.prototype.initialize = function() {
    this.handlePageContainer();
    
    //The width of the viewport
    this.width = bc.ui.width();
    
    //The height of the viewport
    this.height = bc.ui.height();
    
    // The current view orientation
    _orientation = bc.context.viewOrientation;
    
    //register our event listeners for this view.
    this.registerEventListeners();
    
    bc.core.applyStyles();
    
    //Allow this view to rotate in all directions.
    bc.device.setAutoRotateDirections( ['all'] );
    
    this.render( bc.core.cache( bc.viewID + "_photogallery_data" ) );
    
    bc.core.getData( "photos",
        $.proxy( function( data ) {
          this.render( data );
        }, this ),
        $.proxy( function( data ) {
          this.handleNoData( data );
        }, this )
    );
  };
  
  /**
   * Creates the default page container for this view.
   * @param element The element inside which to render the view.
   */
  photoGalleryView.prototype.handlePageContainer = function() {
    var title = bc.core.getSetting( "titleOfPage" ) || "",
        context = {
          title: title,
          showBackToMoreSection: bc.context.moreNavigationView
        };

    this.element.html( Mark.up( bc.templates["page-container-tmpl"], context ) );
    bc.ui.init();
  };
  
  
  /**
   * Responsible for building out the initial page the user is shown, which is the grid of thumbnails.
   */
  photoGalleryView.prototype.render = function( data ) {
    var imageWidth,
        imageHeight,
        context,
        $html;
      
    //If the data is not new we should just return
    if( data !== undefined && bc.utils.isEqual( data, this.data ) ) {
      return;
    }
    
    if( !data && !this.data && $( ".scroller .spinner" ).length === 0 ) {
     $( ".scroller" ).append( bc.ui.spinner() );
     return;
    }
    
    function positionThumbnail() {
       var $elem = $( this );
       if( $elem.width() > $elem.height() ) {
         $elem.css( 
           { 
             "top": ( ( $elem.parent().height() - $elem.height() ) ) / 2,
             "left": "0px"
           } 
         ).data( "orientation", "landscape" );
       } else {
         $elem.css( 
           { 
             "top": "0px",
             "left": ( ( $elem.parent().width() - $elem.width() ) ) / 2
           } 
         ).data( "orientation", "portrait" );
       }
       $elem.addClass( "show" );
    };
    
    imageWidth = this.calculateWidthOfThumbnail();
    imageHeight = this.calculateHeightOfThumbnail( imageWidth );
    
    context = {
      width: imageWidth,
      height: imageHeight,
      photos: data,
      ios: bc.context.os
    };
    
    $( ".scroller .spinner" ).remove();
    this.data = data;
    bc.core.cache( bc.viewID + "_photogallery_data", data );
    $html = $( Mark.up( bc.templates["thumbnail-grid-tmpl"], context ) );

    $html.find( ".thumbnail" ).one( "load", positionThumbnail );

    $( ".thumbnail-container" ).html( $html );
    
    bc.ui.enableScrollers();
    
  };
  
  /**
   * Called if there is an error getting data. If we are in the Studio, then we show the spinner.
   */
  photoGalleryView.prototype.handleNoData = function( error ) {
    //If we are in preview mode then show the spinner, otherwise do nothing
    if( bc.core.current_mode === bc.core.mode.PREVIEW ) {
      this.element.html( "<h3 class='header-b error-message'>" + error.error + "</h3>" );
      $( document.body ).css( "display", "none" );
      setTimeout( function() {
        $( document.body ).css( "display", "block" );
      }, 0 );
    }
  };
  
  /**
   * Builds the new page for the slide show and transitions to it.  Note that the actual images are populated when the
   * device has gone full screen. This is for positioning purposes.
   */
  photoGalleryView.prototype.buildSlideShow = function() {
    var $slideShowPage = $( ".slideshow-page" );
    $slideShowPage.html( this.slideShowHTML( this.indexOfCurrentImage ) );
    bc.ui.forwardPage( $slideShowPage );
    $( bc ).one( "pageshow", $.proxy( this.createCarousel, this ) );
  };
  
  /**
   * Enables scrolling for this view and sets the current image to the correct site.
   */
  photoGalleryView.prototype.createCarousel = function() {
    var currentImageIndex = this.indexOfCurrentImage;
    this.slider = new iScroll( $( ".slider" )[0], {
      snap: true, 
      momentum: false,
      hScrollbar: false,
      vScrollbar: false,
      vScroll: false,
      onScrollEnd: $.proxy( function( e ) {
       this.handleScrollTo( this.slider.currPageX );
      }, this ) 
    } );
    this.slider.scrollToPage( currentImageIndex, 0, 0 );
  };
  
  /**
   * Registers all of the event listeners for this view.  Note that these are bound to the body since the elements do not exist yet.
   */
  photoGalleryView.prototype.registerEventListeners = function() {

    //register event listener for when new data is fetched
    $( bc ).on( "newconfigurations", $.proxy( function( evt, info ) {
        this.handleNewConfigurationInfo( info );
      }, this ) 
    );

    //Listen for when a thumbnail is clicked
    $( "body" ).on( "tap", ".thumbnail", $.proxy( function( evt ) {
      this.thumbnailTap( evt );
    }, this) );
    
    //Bind to the back button.
    $( "body" ).on( "tap", ".back-button", $.proxy( function( evt ) {
      this.handleBackButtonTap( evt );
    }, this ) );
    
    //Register for tap events on the slideshow
    $( "body" ).on( "tap", ".slideshow-page", $.proxy( function( evt ) {
      this.toggleOverlay( evt );
    }, this ) );
    
    //Register event listeners for when the user rotates the device and update our scrollers when they do.
    $( window ).on( "resize", $.proxy( function( evt, data ) {    
      this.handleResize( data );
    }, this ) );
    
    $( bc ).on( "viewfocus", $.proxy( function( evt ) {
      this.handleViewFocus( evt );
    }, this ) );
    
    $( bc ).on( "viewblur", $.proxy( function( evt ) {
      this.handleViewBlur( evt );
    }, this ) );
    
  };
  
  /**
   * Called when there are new styles, settings, or data available for this view.
   * @param info An object that has the current styles, settings, and data for this view.  For example
   * info object.
   <pre> 
   { 
    "data": { ... },
    "styles": { ... },
    "settings": { ... }
   }
   </pre>
   */
   /**
    * Handles new data becoming available to the view.  When new data comes in,
    * the view renders itself again with the new data.
    */
   photoGalleryView.prototype.handleNewConfigurationInfo = function( info ) {
     if ( info.status !== "error" && info.styles.isNew ) {
        bc.core.applyStyles( info.styles.values );
     }    
   };
  
  /**
   * Called when a back button is clicked within this view.
   * @param evt The event object for this tap event handler. This is a typical event object.
   */
  photoGalleryView.prototype.handleBackButtonTap = function( evt ) {
    if( bc.ui.currentPage.hasClass( "slideshow-page" ) ) {
      bc.device.exitFullScreen();
    }
    
    bc.ui.backPage();
    
    if( bc.metrics && this.indexOfCurrentImage !== undefined ) {
      bc.metrics.endContentSession( this.data[this.indexOfCurrentImage].media_content_url );
    }
    this.indexOfCurrentImage = undefined;
  };
  
  /**
   * Handles updating the UI when the orientation of the device changes.
   * @param direction The direction of the new orientation.
   */
  photoGalleryView.prototype.handleResize = function( data ) {
    var scroller;
    _orientation = ( _orientation !== bc.context.viewOrientation ) ? bc.context.viewOrientation : _orientation;
    this.handleViewPortChange();
    this.updateUIOnOrientationChange();
    
    //Need to scroll the first page back to the top.
    scroller = bc.ui.getScrollerForPage( 0 );
    if( scroller ) {
      scroller.scrollToY( 0, "0ms");
    }
  };
  
  /**
    * Called when the "view" gains focus.
    * @param evt The event object that was fired with this event.
    */
   photoGalleryView.prototype.handleViewFocus = function( evt ) {
     if( this.indexOfCurrentImage !== undefined && bc.metrics !== undefined ) {
       bc.metrics.startContentSession( this.data[this.indexOfCurrentImage].media_content_url, this.data[this.indexOfCurrentImage].media_title );
     }
   };

   /**
    * Called when this "view" loses focus.  This occurs when the user switches to a different "view". 
    * @param evt The event object that was fired with this event.
    */
   photoGalleryView.prototype.handleViewBlur = function( evt ) {
     //If we have a article viewing event then we need to kill it.
     if( this.indexOfCurrentImage !== undefined && bc.metrics !== undefined ) {
       bc.metrics.endContentSession( this.data[this.indexOfCurrentImage].media_content_url );
     }
   };
  
  photoGalleryView.prototype.handleScrollTo = function( newIndex ) {
    var $elem;
    if( newIndex === this.indexOfCurrentImage ) {
      $elem = $( "#" + newIndex + "_wrapper" ).removeClass( "hidden" );
      $elem.next().removeClass( "hidden" );
      $elem.prev().removeClass( "hidden" );
      return;
    }
    
    //If we have moved more then one "page" then we should reload all of the images.
    if( Math.abs( this.indexOfCurrentImage - newIndex ) > 1 || $( "#" + newIndex + "_wrapper" ).hasClass( "hidden" ) ) {
      this.resetScroller( newIndex );
      return;
    }
    
    if( newIndex < this.indexOfCurrentImage ) {
      this.unloadImage( $( "#" + ( this.indexOfCurrentImage + 1) + "_wrapper" ).addClass( "hidden" ) );
      if( newIndex !== 0) {
        $( "#" + ( newIndex - 1) + "_wrapper" ).removeClass( "hidden" );
        this.loadImage( $( "#" + ( newIndex - 1) + "_wrapper" ) );
      }
    } else {
      this.unloadImage( $( "#" + ( this.indexOfCurrentImage - 1) + "_wrapper" ).addClass( "hidden" ) );
      if( newIndex < this.data.length ) {
        $( "#" + ( newIndex + 1) + "_wrapper" ).removeClass( "hidden" );
        this.loadImage( $( "#" + ( newIndex + 1 ) + "_wrapper" ) );
      }
    }
    
    if( this.indexOfCurrentImage !== undefined && bc.metrics ) {
      bc.metrics.endContentSession( this.data[this.indexOfCurrentImage].media_content_url );
    }
    this.indexOfCurrentImage = newIndex;
    bc.metrics.startContentSession( this.data[this.indexOfCurrentImage].media_content_url, this.data[this.indexOfCurrentImage].media_title );
    this.updateOverlayMetaData();
  };
  
  photoGalleryView.prototype.resetScroller = function( newIndex ) {
    var $elem = $( "#" + newIndex + "_wrapper" );
    $( ".image-wrapper:not(.hidden)" ).each( $.proxy ( function( index, element ) {
        this.unloadImage( $( element ).addClass( "hidden" ) );
        }, this )
      );

    $elem.removeClass( "hidden" );
    this.loadImage( $( "#" + newIndex + "_wrapper" ) );
    
    if( newIndex < this.data.length ) {
      $elem.next().removeClass( "hidden" );
      this.loadImage( $( "#" + ( newIndex + 1 ) + "_wrapper" ) );
    }
    
    if( newIndex !== 0 ) {
      $elem.prev().removeClass( "hidden" );
      this.loadImage( $( "#" + ( newIndex - 1 ) + "_wrapper" ) );
    }
    
    if( this.indexOfCurrentImage !== undefined && bc.metrics ) {
      bc.metrics.endContentSession( this.data[this.indexOfCurrentImage].media_content_url );
    }
    this.indexOfCurrentImage = newIndex;
    bc.metrics.startContentSession( this.data[this.indexOfCurrentImage].media_content_url, this.data[this.indexOfCurrentImage].media_title );
    this.updateOverlayMetaData();
  };
  
  /**
   * Updates the header and description to reflect the current image. Occurs after the image has finished its animation.
   */
  photoGalleryView.prototype.updateOverlayMetaData = function() {
    $( ".overlay-header h1" ).html( ( this.indexOfCurrentImage + 1) + " " + Mark.includes.of_msg + " " + this.data.length );
    $( ".overlay-description p" ).html( bc.utils.stripTags( this.data[this.indexOfCurrentImage].media_description ) );
  };
  
  /**
   * Toggles the display of the overlay.
   * @param evt The event that was triggered from this event.  This is a typical event object.
   */
  photoGalleryView.prototype.toggleOverlay = function( evt ) {
    if( _overlayShowing ) {
      _overlayShowing = false;
      $( ".overlay-header" ).addClass( "hide" );
      $( ".overlay-description" ).addClass( "hide" );
    } else {
      _overlayShowing = true;
      $( ".overlay-header" ).removeClass( "hide" );
      $( ".overlay-description" ).removeClass( "hide" );
    }
  };
  
  /**
   * When a user taps a thumbnail, we insert and transition to the slide show page.  
   * @param evt The event that was triggered from this event. This is a typical event object.
   */
  photoGalleryView.prototype.thumbnailTap = function( evt ) {
    this.indexOfCurrentImage = $( evt.currentTarget ).data( "bc-index" );
    this.buildSlideShow();
    bc.device.enterFullScreen( $.proxy( function() {
      this.handleViewPortChange();
      this.loadImagesIntoSlideShow();
    }, this ), 
    $.proxy( function() {
      this.loadImagesIntoSlideShow();
    }, this ) );
    bc.metrics.startContentSession( this.data[this.indexOfCurrentImage].media_content_url, this.data[this.indexOfCurrentImage].media_title );
  };
  
  /**
   * Updates the width and height.
   */
  photoGalleryView.prototype.handleViewPortChange = function() {
    this.width = bc.ui.width();
    this.height = bc.ui.height();
  };
  
  /**
   * When the orientation of the device changes, we need resize the images appropriately.
   */
  photoGalleryView.prototype.updateUIOnOrientationChange = function() {
    var thumbnailWidth = this.calculateWidthOfThumbnail();
    this.width = bc.ui.width();
    this.height = bc.ui.height();
    $( ".photo-gallery-thumbnail-grid .thumb-wrapper" ).width( thumbnailWidth );
    $( ".photo-gallery-thumbnail-grid .thumb-wrapper" ).height( thumbnailWidth );
    this.resizeThumbnails( thumbnailWidth );
    //If we are on the slideshow page resize images
    if( bc.ui.currentPage.hasClass( "slideshow-page" ) ) {
      $( ".image-wrapper" ).width( this.width );
      $( ".slider > div" ).width( this.width * this.data.length );
      if( this.slider ) {
        this.slider.refresh();
        this.slider.scrollToPage( this.indexOfCurrentImage, 0, 0 );
      }

      //On android tablets we need to let the original UI redraw itself before we reset.
      if( bc.context.os === "ios" ) {
        this.resetScroller( this.indexOfCurrentImage );
      } else {
        setTimeout( $.proxy( function() {
          this.resetScroller( this.indexOfCurrentImage );
        }, this), 1 );
      }
    }
  };
  
  /**
   * Load the images into the slide show.
   */
  photoGalleryView.prototype.loadImagesIntoSlideShow = function() {
    this.loadImage( $( "#" + this.indexOfCurrentImage + "_wrapper" ) );
    
    if( this.indexOfCurrentImage !== 0 ) {
      this.loadImage( $( "#" + ( this.indexOfCurrentImage - 1 ) + "_wrapper" ) );
    }
    
    if( this.indexOfCurrentImage !== (this.data.length - 1)) {
      this.loadImage( $( "#" + ( this.indexOfCurrentImage + 1 ) + "_wrapper" ) );
    }
  };
  
  /**
   * Loads the image off screen to get the dimensions and then inserts into the slide show.
   * @param image An object that has an ID and a URL to the image.  For example { "id": "37", "url": "http://picture.to.honeybadger" }
   */
  photoGalleryView.prototype.loadImage = function( $elem ) {
    var $img = $elem.find( "img" ),
        index = $img.data( "index" ),
        $imageLoader = $( "<img id='#" + index + "_loader' data-bc-index='" + index + "' src='" + $img.data( "still" ) + "' class='offscreen' />" );
    
    $imageLoader.appendTo('body')
                .one('load', $.proxy( function( evt ) {
                  this.insertImageIntoSlideShow( evt.currentTarget );
                } , this ) );
  };
  
  photoGalleryView.prototype.unloadImage = function( $elem ) {
    var $img = $elem.find( "img" );
    $img.attr( "src", _emptyImage );
  };
  
  /**
   * Responsible for positioning and sizing the image correctly within the slide show.
   * @param elem The image that is to be inserted into the slide show.
   */
  photoGalleryView.prototype.insertImageIntoSlideShow = function( imageLoadedOffScreen ) {
    var $imageLoadedOffScreen = $( imageLoadedOffScreen ),
        index = $imageLoadedOffScreen.data( "bc-index" ),
        imageType = this.landscapeOrPortrait( $imageLoadedOffScreen.height(), $imageLoadedOffScreen.width() ),
        $image = $( "#" + index + "_wrapper > img" ),
        top;
    
    if( $image.length > 0 ) {
      if( imageType === "landscape" ) {
        top = ( this.width * $imageLoadedOffScreen.height() / $imageLoadedOffScreen.width() );
        $image.css( "margin-top", ( -top/2 ) + "px" );
        $image.removeClass( "portrait" )
              .addClass( "landscape" );
      } else {
        $image.css( "margin-top", "0px" );
        $image.removeClass( "landscape")
              .addClass( "portrait" );
      }
      $image.attr( "src", $image.data( "still" ) );
    }
    
    $imageLoadedOffScreen.attr( 'src', '' )
                         .delay(100)
                         .remove();
  };
  
  /**
   * Determines if the image should be displayed as portrait or landscape.
   * @param height The height of the image that we are determining should be shown as portrait or landscape.
   * @param width The width of the image that we are determining should be shown as portrait or landscape.
   */
  photoGalleryView.prototype.landscapeOrPortrait = function( height, width ) {
    return ( ( height / width ) > this.height / this.width ) ? "portrait" : "landscape";
  };
  
  /**
   * Generates the HTML snippet for the slide show.
   */
  photoGalleryView.prototype.slideShowHTML = function( index ) {
    var headerText = ( index + 1 ) + " " + Mark.includes.of_msg + " " + this.data.length,
        width = this.data.length * this.width,
        imageType,
        top,
        aspectRatioOfThumbnails,
        maxDimension,
        context,
        options;

    aspectRatioOfThumbnails = bc.core.getSetting( "aspectRatioOfThumbnails" );
    imageType = ( aspectRatioOfThumbnails > ( this.height / this.width ) ) ? "portrait" : "landscape";
    if( imageType === "landscape" ) { 
      top = ( this.width * aspectRatioOfThumbnails ) / -2;
      maxDimension = this.width;
    } else {
      maxDimension = this.height;
    }
    
    options = {
      globals: {
          slideShowWidth: width,
          windowWidth: this.width,
          imageType: imageType,
          top: top,
          maxDimension: maxDimension,
          emptyImage: _emptyImage 
      }
    };
    
    context = {
      headerText: headerText,
      photos: this.data,
      description: this.data[index].media_description
    };
    return Mark.up( bc.templates["slideshow-tmpl"], context, options );
  };
  
  /**
   * Calculates the width of thumbnail to fit within the width of the device.
   * @param width The width of the viewport.
   */
  photoGalleryView.prototype.calculateWidthOfThumbnail = function( width ) {
    var thumbsPerRow = ( bc.core.getSetting( "thumbnailsPerRow" ) !== undefined ) ? bc.core.getSetting( "thumbnailsPerRow" ) : DEFAULT_NUMBER_OF_THUMBS_PER_ROW;
    width = width || bc.ui.width();
    return Math.floor(( width - 1 - ( thumbsPerRow * 2 * PADDING_BETWEEN_THUMBNAILS) ) / thumbsPerRow);	
  };
  
  /**
   * Calculates the height of the thumbnail.
   * @param width The width of the thumbnail.
   */
   photoGalleryView.prototype.calculateHeightOfThumbnail = function( width ) {
     //Defaulting to one for the aspect ratio.
     return ( bc.core.getSetting( "aspectRatioOfThumbnails" ) !== undefined ) ? width * bc.core.getSetting( "aspectRatioOfThumbnails" ) : width;
   };
  
  /**
   * @private
   */
  photoGalleryView.prototype.setPrivateVariables = function( options ) {
    for( var prop in options ) {
      if( typeof options[prop] === "string" ) {
        eval( prop + " = '" + options[prop] + "'");
      } else {
        eval( prop + " = " + options[prop] );
      }
    }
  };
  
  photoGalleryView.prototype.resizeThumbnails = function( width ) {
    $( ".photo-gallery-thumbnail-grid .thumb-wrapper" ).each( function() {
      var $elem = $( this ),
          $img = $( this ).find( "img" ),
          newHeightOfImage,
          newWidthOfImage;

      if( $img.data( "orientation" ) === "landscape" ) {
        newHeightOfImage = ( $elem.width() * $img.height() ) / $img.width();
        $img.css(
          { 
            "top": ( $elem.height() - newHeightOfImage )  / 2,
            "left": "0px",
            "width": $elem.width()
          }
       );
      } else {
         newWidthOfImage = ( $elem.width() * $img.width() ) / $img.height();
         $img.css(
           { 
             "top": "0px",
             "left": ( $elem.width() - newWidthOfImage ) / 2,
             "height": $elem.height()
           }
        );
      }
    });
  };
  
  return photoGalleryView; 

})( bc.lib.jQuery );

/*************************
 * Pipes
 ************************/
 Mark.pipes.stripTags = function ( desc ) {
  return bc.utils.stripTags( desc );
 };