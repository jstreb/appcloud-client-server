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
 * @class A Tablet Blog view takes a list of articles that it then displays in a grid-like layout.
   The user can then swipe through the pages to view a synposis of the different articles.  If a user taps on an article, it will open in a
   module window. The user can then scroll through the article.
 *
 * @constructor
 * @param options An object of the possible options for this view. The only option available is the element that this view should load into. By default, this will be the body tag.
 * @param ignore
 * @return A new tabletBlogView
 */
var tabletBlogView = ( function( $, undefined) {
  //The number of "zones" articles per page.
  var ARTICLES_PER_PAGE = 5,
      ARTICLE_PADDING = 30,
      _defaults = { "element": "body" };
  /**
   * @private
   */
  function tabletBlogView( options ) { 
    _settings = $.extend( {}, _defaults, options );

    this.element = $( _settings.element );
    
    /** The index of the current article that is being viewed by the user. */
    this.currentArticleIndex = undefined;
    
    /** The index of the current 'page' we are on for the view that shows the synopsis of each article. */
    this.currentPageIndex = 0;

    /** The iScroll object for the article that is being viewed. */
    this.articleScroller = undefined;

    /** The iScroll object that allows the user to swipe horizontally through the "pages". */
    this.pageScroller = undefined;
    
    /** Keeps track of the user's font size preference. */
    this.fontSizePreference = bc.core.cache( "font-size-preference" ) || "medium";
    
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
  tabletBlogView.prototype.initialize = function() {
    bc.core.applyStyles();
    
    /** Tell the container that this view will support rotating in all directions */
    bc.device.setAutoRotateDirections( ["all"] );
    
    this.registerEventListeners();
    
    this.buildLayout( bc.core.cache( bc.viewID + "_blog_data" ) );
    
    bc.core.getData( 
      "blog",
      $.proxy( function( data ) {
        this.buildLayout( data );
      }, this ),
      $.proxy( function() {
        this.handleNoData();
      }, this ) 
    );
    
  };

  /**
   * buildLayout is responsible for building the HTML of the page that shows the synopsis of each article and allows the user to swipe
   * between the different pages.  If there is no data available yet, then we show the spinner.
   */
  tabletBlogView.prototype.buildLayout = function( data ) {
    var numberOfPages,
        context,
        pages = [],
        contentAreaHeight,
        html,
        self;
        
    //If the data is not new we should just return
    if( data !== undefined && bc.utils.isEqual( data, this.data ) ) {
      return;
    }
    
    if( !data && !this.data ) {
     this.element.html( bc.ui.spinner() );
     return;
    }
    
    this.data = data;
    
    bc.core.cache( bc.viewID + "_blog_data", data );
    
    numberOfPages = Math.ceil( this.data.length / ARTICLES_PER_PAGE );
    
    for(var i=0; i<numberOfPages; i++) {
      pages.push(i);
    }
    
    context = {
      ARTICLES_PER_PAGE: ARTICLES_PER_PAGE,
      title: (bc.core.getSetting( "title" ) || ""),
      showBackButton: bc.context.moreNavigationView,
      height: bc.ui.height(),
      windowWidth: bc.ui.width(),
      wrapperWidth: ( bc.ui.width() * numberOfPages ),
      pages: pages,
      articles: data
    };
    
    self = this;
    html = Mark.up( bc.templates["page-container-tmpl"], context );
    
    $( html ).find( ".positionOnLoad" ).one( "load", function( evt ) {
      var index = $( this ).parent().data( "bc-index" );
      self.positionElementsWithinZone( $( "[data-bc-index=" + index + "]") );
    });

    this.element[0].innerHTML = html;
    contentAreaHeight = bc.ui.height() - $( ".header" ).height() - $( ".pagination-container" ).height();
    $( ".tablet-screen" ).height( contentAreaHeight );
    $( ".page-scroller" ).height( contentAreaHeight );
    this.positionElementsWithinZones();
    
    this.enableScrolling();
  };
  
  /**
   * Called if there is an error getting data. If we are in the Studio, then we show the spinner.
   */
  tabletBlogView.prototype.handleNoData = function() {
    //If we are in preview mode then show the spinner, otherwise do nothing
    if( bc.core.current_mode === bc.core.mode.PREVIEW ) {
      this.element.html( bc.ui.spinner() );
    }
  };
  
  /**
   * Enables scrolling / paging for the layout view of the view.  This is what allows the user to swipe through the various "pages".  A page consists of
   * a collection of 5 articles.
   */
  tabletBlogView.prototype.enableScrolling = function() {
    
    if( $( ".page-scroller" ).length === 0 ) {
      return;
    }
    
    this.pageScroller = new iScroll( $( ".page-scroller" )[0], {
      snap: true, 
      momentum: false,
      hScrollbar: false,
      vScrollbar: false,
      vScroll: false,
      onScrollEnd: $.proxy( function( e ) {
        this.updateActivePageIndicator( this.pageScroller.currPageX );
      }, this ) 
    } );
  };
  
  /**
   * Responsible for handling the page indicator for which page we are on.
   * @param activePageIndex The active page index.
   */
  tabletBlogView.prototype.updateActivePageIndicator = function( activePageIndex ) {
    $( ".pagination-container .active" ).removeClass( "active background-b border-b" )
                                        .addClass( "border-a background-a" );

    $( ".page-indicator:eq(" + activePageIndex + ")" ).removeClass( "background-a border-a" )
                                                     .addClass( "background-b border-b active" );
  
  };
      
  /**
   * resizeImage is responsible for resizing the image that appears in the synopsis of the article.  The reason for this is that we have limited space
   * within each section of the "zone", and we want to make sure that the text can appear correctly.
   * @param The HTML snippet of the zone of which we are going to position the images within.  Note that this is a jQuery object.
   */
  tabletBlogView.prototype.resizeImage = function( $zone ) {
    var $img = $zone.find( "img" ),
        zoneWidth = $zone.width(),
        zoneHeight = ( $zone.height() - $zone.find( "h1" ).height() ),
        imgHeight = $img.height(),
        imgWidth = $img.width(),
        newHeight,
        newWidth;
    
    //If the image is taking up more then 70% of the real estate shrink it.
    if( ( imgWidth * imgHeight ) / (zoneWidth * zoneHeight ) > 0.7 ) {
      if( ( imgWidth / zoneWidth ) > ( imgHeight / zoneHeight ) ) {
        newWidth = Math.floor( zoneWidth * 0.5 );
        $img.width( newWidth);
        $img.height( Math.floor( ( newWidth * imgHeight ) / imgWidth ) );
      } else {
        newHeight = Math.floor( zoneHeight * 0.5 );
        $img.height( newHeight );
        $img.width( Math.floor( ( newHeight * imgWidth ) / imgHeight ) );
      }
      return;
    }
    
    //if the image takes up more then 80% of the width of the zone then we want to make it equal to the width of the zone
    if( imgWidth > ( zoneWidth * 0.8 ) ) {
      $img.width( zoneWidth );
      return;
    }
    
    //if the image takes up more then the height of the available area we want to make equal to the available height.
    if( imgHeight > zoneHeight ) {
      $img.height( zoneHeight );
      return;
    }
  };
  
  /**
   * positionElementsWithinZones iterates through each zone and calls positionElementWithinZone for each one.
   */
  tabletBlogView.prototype.positionElementsWithinZones = function() {
    var $zones = $( ".zone ");
    for( var i = 0, len = $zones.length; i < len; i++ ) {
      this.positionElementsWithinZone( $zones[i] );
    }
  };
  
  /**
   * positionElementsWithinZone is responsible for making sure that text does not get cut off half way between showing text,
   * and positioning the images.
   * @param The HTML snippet that represents the zone we are working with.
   */
  tabletBlogView.prototype.positionElementsWithinZone = function( zone, width, height ) {
    var $zone = $( zone ),
        $img = $zone.find( "img" ),
        zoneHeight,
        lineHeight = bc.utils.getNum( $zone.find( "p" ).css( "line-height" ) ),
        titleHeight = $zone.find( "h1" ).height() + 20,        // no magic numbers, this aint proserv
        imgHeight,
        imgWidth,
        heightAvailableToParagraph;
    
    //remove any previous heights set
    $zone.removeAttr( "style" );
    zoneHeight = $zone.height();
    
    this.resizeImage( $zone );

    imgHeight = height || $img.height();
    imgWidth = width || $img.width();
    
    //If the image is the width of the zone then the text is not going to wrap around and we need to take it into account.
    if( imgWidth === $zone.width() ) {
      heightAvailableToParagraph = Math.floor( ( zoneHeight - ( imgHeight + titleHeight ) ) / lineHeight ) * lineHeight;
      $zone.height( titleHeight + imgHeight + heightAvailableToParagraph );
    } else {
      heightAvailableToParagraph = Math.floor( ( zoneHeight - titleHeight ) / lineHeight ) * lineHeight;
      $zone.height( titleHeight + heightAvailableToParagraph );
    }
  };
    
  /**
   * In the articles themselves, there are often items that you may not render.  This may be some tracking scripts, ads, or other cruft.
   * This functions provides a way to remove any wanted elements before the article is injected into the page.
   * @param The article as a jQuery object.
   */
  tabletBlogView.prototype.contentCleanup = function( $article, options ) {
    var settings = { "removeScripts": true };
    $.extend( settings, options );
    $article.find( ".feedflare" ).remove();
    $article.find( "img[src*='feed.feedburner.com']" ).remove();
    
    if( settings.removeScripts ) {
      $article.find( "noscript" ).remove();
      $article.find( "script" ).remove();
      $article.find( "object" ).remove();
    }
  };

  /**
   * The event listeners for this particular view.
   */ 
  tabletBlogView.prototype.registerEventListeners = function() {         

    $( bc ).on( "newconfigurations", $.proxy( function( evt, info ) {
        this.handleNewConfigurationInfo( info );
      }, this ) 
    );
       
    $( "body" ).on( "tap", ".zone", $.proxy( function( evt ) {
        this.loadStoryBoard( evt );
      }, this ) 
    );
    
    $( "body" ).on( "tap", ".close", $.proxy( function() {
      this.closeStoryBoard();
      }, this )
    );
    
    $( "body" ).on( "tap", ".font-size", $.proxy( function( evt ) {
        this.toggleFontOverlay( evt );
      }, this )
    );
    
    $( window ).on( "resize", $.proxy( function( evt, data ) {
        this.handleResize( evt, data );
      }, this )
    );
    
    $( "body" ).on( "tap", ".page-up", $.proxy( function( evt ) {
        this.handlePageUp( evt );
      }, this ) 
    );
    
    $( "body" ).on( "tap", ".page-down", $.proxy( function( evt ) {
        this.handlePageDown( evt );
      }, this ) 
    );

    $( "body" ).on( "tap", ".text-overlay li", $.proxy( function( evt ) {
        this.handleFontSelection( evt );
      }, this ) 
    );
    
    $( "body" ).on( "tap", ".back-button", bc.ui.backPage );
    
    $( bc ).on( "viewfocus", $.proxy( function( evt ) {
      this.handleViewFocus( evt );
    }, this ) );
    
    $( bc ).on( "viewblur", $.proxy( function( evt ) {
      this.handleViewBlur( evt );
    }, this ) );
    
  };
  
  /**
    * Handles new settings and styles becoming available to the view.  When new styles become available, the view calls
    * <code>applyStyles</code>, which will update the UI with the new styles.
    * @param evt The event object.
    * @param info The info object has the new settings and styles.
    */
   tabletBlogView.prototype.handleNewConfigurations = function( info ) {
     if ( info.status !== "error" && info.styles.isNew ) {
       bc.core.applyStyles( info.styles.values );
     }
   };
   
   /**
    * Updates the UI when a the device changes its orientation.
    * @param evt The event object.
    * @param data The data object for the view orientation change event.  This has the new width and height properties of the screen.
    */
   tabletBlogView.prototype.handleResize = function( evt, data ) {
     var width = bc.ui.width(),
         height = bc.ui.height();
       
     $( ".wrapper" ).width( width * Math.ceil( this.data.length / ARTICLES_PER_PAGE ) );
     $( ".tablet-screen" ).width( width )
                          .height( height - $( ".header" ).height() - $( ".pagination-container" ).height() );
     $( ".page-scroller" ).height( height - $( ".header" ).height() - $( ".pagination-container" ).height() );
                          
     $( ".storyboard .container" ).width( width - ARTICLE_PADDING )
                                  .height( height - ARTICLE_PADDING );

     setTimeout( $.proxy( function() {
       if( this.pageScroller ) {
          this.pageScroller.refresh();
          this.pageScroller.scrollToPage( this.pageScroller.currPageX, 0, 10 ); 
       }
       if( this.articleScroller ) {
         this.articleScroller.refresh();
       }
       
     }, this) , 0 );
     this.positionElementsWithinZones();
   };
   
   /**
    * Called when the "view" gains focus. 
    * @param evt The event object that was fired with this event.
    */
  tabletBlogView.prototype.handleViewFocus = function( evt ) {
    if( this.currentArticleIndex !== undefined && bc.metrics !== undefined ) {
      bc.metrics.startContentSession( this.data[this.currentArticleIndex].title, this.data[this.currentArticleIndex].title );
    }
  };
   
   /**
    * Called when this "view" loses focus.  This occurs when the user switches to a different "view". 
    * @param evt The event object that was fired with this event.
    */
   tabletBlogView.prototype.handleViewBlur = function( evt ) {
     //If we have a article viewing event then we need to kill it.
     if( this.currentArticleIndex !== undefined && bc.metrics ) {
       bc.metrics.endContentSession( this.data[this.currentArticleIndex].title );
     }
   };
  
  /************************************************************************
   * STORY BOARD FUNCTIONS
   ***********************************************************************/
  
  /**
   * Creates the area that the article will load into and animates into view.  It is also responsible for calling <code>loadArticle</code> once the
   * storyboard has animated into view.
   * @param evt The event object fired from the tap event.
   */
  tabletBlogView.prototype.loadStoryBoard = function( evt ) {
    var $storyboard;
    this.currentArticleIndex = $( evt.currentTarget ).data( "bc-index" );
    $storyboard = $( this.storyBoardHTML() ).appendTo( "body" );
    
    $storyboard[0].style.webkitTransformOrigin = evt.pageX + "px " + evt.pageY + "px";
    
    //This needs to be in a setTimeout so that the element first renders scaled down and then gets the CSS change so that the animation is applied.
    setTimeout( function() {
      $storyboard.addClass( "storyboard-grow" );
    }, 0 );
    
    $storyboard.one( "webkitTransitionEnd", $.proxy( function() {
      this.loadArticle();
    }, this ) );
  };
  
  /**
   * The HTML for the storyboard page.
   */
   tabletBlogView.prototype.storyBoardHTML = function() {
     var context = {
       width: ( bc.ui.width() - ARTICLE_PADDING ),
       height: ( bc.ui.height() - ARTICLE_PADDING ),
       link: this.data[this.currentArticleIndex].link
     };
     
     return Mark.up( bc.templates["story-board-tmpl"], context );
   };
   
  /**
   * Prepares and loads the article into the storyboard.  The preparation includes instantiating the iScroll object, fading in the article and
   * tweaking the article so that appears correct.  (See <code>prepareArticleForInjection</code> for more information about how we "tweak" the article.)
   */
  tabletBlogView.prototype.loadArticle = function() {
    $( ".storyboard .container" ).append( $( this.articleHTML() )[0] );
    
    $( ".storyboard .web" ).attr( "href", this.data[this.currentArticleIndex].link );
        
    setTimeout( $.proxy( function() {
      this.prepareArticleForInjection( $( ".article" ) );
    }, this ), 0 );
    
    setTimeout( $.proxy( function() {
      var $overlay = $( ".storyboard .overlay" );
      
      this.articleScroller = new iScroll( $( ".article-scroller" )[0], { "hideScrollbar": true } );
      
      //I hide and then show the article because I need to force a redraw for the text to appear correctly.  Without this the first two lines
      //are indented for no apparent reason.
      $( ".storyboard article" ).css( "display", "none" );
      setTimeout( function() {
        $( ".storyboard article" ).css( "display", "block" );
      }, 10 );
      
      $overlay.one( "webkitTransitionEnd", function() {
        $overlay.remove();
      } );
      $overlay.addClass( "fade-away" );
    }, this ), 100 );
    
    //Trigger a tracking event for the viewing of this article.
    if( this.currentArticleIndex !== undefined && bc.metrics !== undefined ) {
      bc.metrics.startContentSession( this.data[this.currentArticleIndex].title, this.data[this.currentArticleIndex].title );
    }
  };
  
  /**
   * Generates the HTML for the article section.
   */
  tabletBlogView.prototype.articleHTML = function() {
    var context = {
      article: this.data[this.currentArticleIndex],
      fontSizePreference: this.fontSizePreference
    };
    
    return Mark.up( bc.templates["story-board-article-tmpl"], context );
  };
  
  /**
   * Performs some minor adjustments to the article in order to improve its appearance.  This includes centering the
   * the images, styling links, removing ads, and adding a small graphic to denote the end of the article.
   */
  tabletBlogView.prototype.prepareArticleForInjection = function( $article ) {
    this.contentCleanup( $article, { "removeScripts": false } );
    $article.find( "img" ).each( function() {
      var $img = $( this );
      if( $img.width() > bc.ui.width() ) {
        $img.width( "100%" );
      }
    });
    $article.find( "img" ).wrap( "<div class='image-wrapper'></div>" );
    $article.find( "a" ).addClass( "header-b fullArticleLinkTextColor" + this.id );
    $article.append( "<div class='end-symbol'></div>" );
  };
  
  /**
   * Shows the Overlay window of the different size fonts available to the user.
   * @param evt The event that was triggered with this tap event.
   */
  tabletBlogView.prototype.toggleFontOverlay = function( evt ) {  
    if( $( ".text-overlay" ).length > 0 ) {
      $( ".text-overlay" ).one( "webkitTransitionEnd", function() { $( this ).remove(); } )
                          .addClass( "fade-away" );
    } else {
      this.showFontOverlay( evt );
    }
  };
  
  /**
   * Fades in the font choice Overlay.
   * @param evt The event object that was fired when the user tapped the font size button.
   */
  tabletBlogView.prototype.showFontOverlay = function( evt ) {
    var $fontButton = $( ".font-size" ),
        offset = $fontButton.offset(),
        x = offset.left + $fontButton.width() / 2 - 20, //20 is the offset to align the button under the arrow
        y = offset.top + $fontButton.height() + 20, //20 is the padding between the button and the overlay
        context = {
          x: x,
          y: y,
          fontSizePreference: this.fontSizePreference
        };
    
    $( "body" ).append( Mark.up( bc.templates["font-overlay-tmpl"], context ) );
    
    setTimeout( function() {
      $( ".text-overlay" ).addClass( "fade-in" );
    }, 0 );
  };
  
  /**
   * Responsible for changing the font size of the article, persisting the users preference, and hiding or removing the
   * font-size selection overlay.
   * @param evt The event object that was fired from the tap event.
   */
  tabletBlogView.prototype.handleFontSelection = function( evt ) { 
    var $elem = $( evt.currentTarget ),
        fontSize;
        
    if( $elem.hasClass( "selected" ) ) {
      this.toggleFontOverlay();
      return;
    }
    
    $elem.siblings( ".selected" )
         .removeClass( "selected" );
    
    $elem.addClass( "selected" );
    
    fontSize = $elem.data( "bc-font-size" );
    $( ".article" ).removeClass( this.fontSizePreference )
                   .addClass( fontSize );
                   
    this.fontSizePreference = fontSize;
    bc.core.cache( "font-size-preference", fontSize );
    
    this.toggleFontOverlay();
    
    setTimeout( $.proxy( function() {
        this.articleScroller.refresh();
    }, this ), 0 );
  };
 
  /**
   * Handles the destruction and loading of the next article when the user taps the page up button.
   * @param evt The event that is associated with the tap event.
   */
  tabletBlogView.prototype.handlePageUp = function( evt ) {
    if( this.articleScroller !== undefined ) {
      this.articleScroller.destroy();
    }
    
    if ( this.currentArticleIndex === 0 ) {
      this.currentArticleIndex = this.data.length - 1;
    } else {
      this.currentArticleIndex--;
    }
    
    $( "<div class='overlay fade-away'></div>" ).one( "webkitTransitionEnd", $.proxy( function() {
                                                     $( ".article-container" ).remove();
                                                     this.loadArticle();
                                                   }, this ) 
                                                  )
                                                .appendTo( ".container" );
    setTimeout( function() {
      $( ".overlay" ).removeClass( "fade-away" );
    }, 0 );
  };
  
  /**
   * Handles the destruction and loading of the next article when the taps the page down button.
   * @param evt The event that is associated with the tap event.
   */
  tabletBlogView.prototype.handlePageDown = function( evt ) {
    if( this.articleScroller !== undefined ) {
      this.articleScroller.destroy();
    }
    
    if( this.currentArticleIndex === ( this.data.length - 1 ) ) {
      this.currentArticleIndex = 0;
    } else {
      this.currentArticleIndex++;
    }
    
    $( "<div class='overlay fade-away'></div>" ).one( "webkitTransitionEnd", $.proxy( function() {
                                                    $( ".article-container" ).remove();
                                                     this.loadArticle();
                                                   }, this ) 
                                                  )
                                                .appendTo( ".container" );
    setTimeout( function() {
      $( ".overlay" ).removeClass( "fade-away" );
    }, 0 );
  };
  
  /**
   * Removes the storyboard and returns the user back to the view in which they can view all of the articles.
   */
  tabletBlogView.prototype.closeStoryBoard = function() {
    var $storyboard = $( ".storyboard" );
    
    if( this.articleScroller !== undefined ) {
      this.articleScroller.destroy();
    }
    
    $storyboard.find( "article" ).remove();
    $( ".text-overlay" ).remove();
    $storyboard.removeClass( "storyboard-grow" );
    $storyboard.one( "webkitTransitionEnd", $.proxy( function() {
      $storyboard.remove();
    }, this ) );
    if( this.currentArticleIndex && bc.metrics ) {
      bc.metrics.endContentSession( this.data[this.currentArticleIndex].title );
    }
    this.currentArticleIndex = undefined;
  };
  
  return tabletBlogView;  
})( bc.lib.jQuery );

Mark.pipes.times = function( arg1, arg2 ) {
  return arg1 * arg2;
};

Mark.pipes.layoutStyle = function( description ) {
  if( description.length < 300 ) {
    return 1;
  }
  return Math.floor( 3 * Math.random() ) + 1;
};

Mark.pipes.findImageInDOM = function( text ) {
  var $images = $( text ).find( "img" );
  
  for( var i = 0, len = $images.length; i < len; i++ ) {
    if( $images[i].width > 1 && $images[i].height > 1 && $images[i].src.indexOf( "doubleclick" ) === -1 ) {
      return "<img src='" + $images[i].src + "' width='" + $images[i].width + "' height='" + $images[i].height + "' />";
    }
  }
  
  //TODO - Make sure this works with the refactor.
  //If we did not find an image with a width and height greater then 1 then we can assume that they were not cached nor
  //do they have a width and height specified in the img tag so we need to load it offscreen in order to get its dimensions.
  for( i = 0; i < len; i++ ) {
    if( $images[i].width === 0 ) {        
      return "<img src='" + $images[i].src + "' class='positionOnLoad' />";                       
    }
  }
  return "";
};

Mark.pipes.getText = function( text ) {
  var t = "";
  $( text ).each( function() {
    if( this && this.tagName && this.tagName.toLowerCase() === "p" ) {
      t += $( this ).text();
    }
  });
  return t;
};

Mark.pipes.setZone = function( index ) {
  return ( index%5 ) + 1;
};

Mark.pipes.formatDate = function( date ) {
  return bc.utils.hoursAgoInWords( new Date( date ) );
};

Mark.pipes.isSelected = function( fontPref, match ) {
  return ( fontPref == match ) ? "selected" : "";
};