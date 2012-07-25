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
/*jshint indent:2, browser: true, white: false devel:true undef:false evil:true*/

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
      PADDING_BETWEEN_THUMBNAILS = 12,
      DEFAULT_NUMBER_OF_THUMBS_PER_ROW = 4,
      _loadingImage = "data:image/gif;base64,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";
      
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
    
    $( "body" ).addClass( bc.context.os.toLowerCase() );
    
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
    
    bc.core.getData( 
      "photos",
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
    var context = { showBackToMoreSection: bc.context.moreNavigationView };

    this.element.html( Mark.up( bc.templates["page-container-tmpl"], context ) );
    bc.ui.init();
  };
  
  
  /**
   * Responsible for building out the initial page the user is shown, which is the grid of thumbnails.
   */
  photoGalleryView.prototype.render = function( data ) {
    var context,
        options,
        $html,
        self = this;
    
    function dataIsNew ( newData, oldData ) {
      if( !newData || !oldData || ( newData.length !== oldData.length ) ) {
        return false;
      }
      for( var i=0, len=newData.length; i<len; i++ ) {
        if( oldData[i].width ) {
          newData[i].width = oldData[i].width;
        }
        if( oldData[i].height ) {
          newData[i].height = oldData[i].height;
        }
        if( oldData[i].maxDim ) {
          newData[i].maxDim = oldData[i].maxDim;
        }
      }

      return bc.utils.isEqual( newData, oldData );
    }

    function positionThumbnail() {
       var $elem = $( this ),
       index = $elem.data( "bc-index" );

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

       //Store the width and height to use for positioning in the slideshow.
       self.data[index].width = $elem.width();
       self.data[index].height = $elem.height();
    }
    
    //If the data is not new we should just return
    if( dataIsNew( data, this.data ) ) {
      return;
    }
    
    if( !data && !this.data && $( ".scroller .spinner" ).length === 0 ) {
     $( ".scroller" ).append( bc.ui.spinner() );
     return;
    }
    
    options = {
      globals: {
        maxDimension: this.calculateWidthOfThumbnail()
      }
    };
    
    context = { photos: data };
    
    $( ".scroller .spinner" ).remove();
    this.data = data;
    bc.core.cache( bc.viewID + "_photogallery_data", data );
    $html = $( Mark.up( bc.templates["thumbnail-grid-tmpl"], context, options ) );

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
   * Registers all of the event listeners for this view.  Note that these are registered as delegates so that the DOM can change without
   * having to rebind all of our event listeners.
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
      this.unloadImage( $( "#" + ( this.indexOfCurrentImage + 1) + "_wrapper" ) );
      if( newIndex !== 0) {
        $( "#" + ( newIndex - 1) + "_wrapper" ).removeClass( "hidden" );
        this.loadImage( $( "#" + ( newIndex - 1) + "_wrapper" ) );
      }
    } else {
      this.unloadImage( $( "#" + ( this.indexOfCurrentImage - 1) + "_wrapper" ) );
      if( newIndex < this.data.length - 1 ) {
        $( "#" + (newIndex + 1) + "_wrapper" ).removeClass( "hidden" );
        this.loadImage( $( "#" + (newIndex + 1) + "_wrapper" ) );
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
      this.unloadImage( $( element ) );
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
    var thumbnailWidth = this.calculateWidthOfThumbnail(),
        imageURL,
        $elem,
        self = this;
      
    this.width = bc.ui.width();
    this.height = bc.ui.height();
    $( ".photo-gallery-thumbnail-grid .thumb-wrapper" ).width( thumbnailWidth );
    $( ".photo-gallery-thumbnail-grid .thumb-wrapper" ).height( thumbnailWidth );
    this.resizeThumbnails( thumbnailWidth );
    //If we are on the slideshow page resize images
    if( bc.ui.currentPage.hasClass( "slideshow-page" ) ) {
      //$( ".image-wrapper" ).width( this.width );
      //Load a new image that has a new max dimension
      $( ".image-wrapper" ).width( bc.ui.width() ).each( function( index, elem ) {
        $elem = $( elem );
        imageURL = $elem.data( "image" ).split( "&max_dimension" )[0];
        imageURL = imageURL + "&max_dimension=" + self.getMaxDimension( index );
        $elem.data( "image", imageURL );
        if( !$elem.hasClass( "hidden" ) ) {
          self.loadImage( $elem );
        }
      });
      
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
  
  photoGalleryView.prototype.getMaxDimension = function( index ) {
    var originalWidth = this.data[index].width,
        originalHeight = this.data[index].height,
        newWidth,
        maxDimension,
        type = this.landscapeOrPortrait( originalHeight, originalWidth );
    
    if( type === "landscape" ) {
      maxDimension = bc.ui.width();
    } else {
      newWidth = Math.floor( ( originalWidth * bc.ui.height() ) / originalHeight );
      maxDimension = ( newWidth > bc.ui.height() ) ? newWidth : bc.ui.height();
    }
    this.data[index].maxDim = maxDimension;
    return maxDimension;
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
    var index = $elem.data( "bc-index" ),
        originalWidth,
        originalHeight,
        css;
    
    if( !this.data[index] ) {
      console.log( "out of bounds" );
      return;
    }
    
    originalWidth = this.data[index].width;
    originalHeight = this.data[index].height;
    
    css = {
      "background-image": "url(" + $elem.data( 'image' ) + "), url(" + _loadingImage + ")",
      "background-position": "center center, center center"
    };
    $elem.css( css );
  };
  
  photoGalleryView.prototype.unloadImage = function( $elem ) {
    var css = {
      "background-image": "url(" + _loadingImage + ")",
      "background-position": "center center"
    };
    $elem.css( css ).addClass( "hidden" );
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
        context,
        options;
    
    for( var i=0, len=this.data.length; i<len; i++ ) {
      this.getMaxDimension( i );
    }
    
    options = {
      globals: {
        slideShowWidth: width,
        windowWidth: this.width
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
    return Math.floor(( width - ( thumbsPerRow * 2 * PADDING_BETWEEN_THUMBNAILS) ) / thumbsPerRow);
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
            "top": ( $elem.height() - newHeightOfImage ) / 2,
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