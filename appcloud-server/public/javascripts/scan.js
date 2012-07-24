( function( $, undefined ) {
  var _sliding = false;
  var _widthOfView;
  var _$leftArrow;
  var _$rightArrow;
  var _$scroller;
  var _$widthOfScrollContainer;
  
  $( document ).ready( function() {
    initializeClipboard();
    _$scroller = $( ".scroller" );
    _$leftArrow = $( ".leftarrow" );
    _$rightArrow = $( ".rightarrow" );
    _widthOfView = $( ".tabbar a" ).width();
    _numberOfViews = $( ".tabbar a" ).length;
    _$widthOfScrollContainer = $( ".scroll-container" ).width();
    registerEventListeners();
    handleLocalhostWarning();
  });
  
  function registerEventListeners() {
    _$leftArrow.click( slideLeft );
    _$rightArrow.click( slideRight );
  }
  
  function handleLocalhostWarning() {
    if( location.hostname === "localhost" ) {
      $( ".localhost-warning" ).removeClass( "hide" );                                                                                           
    }
  }
  
  function slideLeft() {
    if( _sliding || _$leftArrow.hasClass( "disabled" ) ) {
      return;
    }
    _sliding = true;
    _$scroller.animate({left: "+=" + _widthOfView }, 350, handleScrollComplete );
  }
  
  function slideRight() {
    if( _sliding || _$rightArrow.hasClass( "disabled" ) ) {
      return;
    }
    _sliding = true;
    _$scroller.animate({left: "-=" + _widthOfView }, 350, handleScrollComplete);
  }
  
  function handleScrollComplete() {
    var left = parseInt( _$scroller.css( "left" ).split( "px")[0] );
    console.log( left );
    //Check to see if we should disable the left arrow
    if( left === 0 ) {
      _$leftArrow.addClass( "disabled" );
    } else {
      _$leftArrow.removeClass( "disabled" );
    }
    
    if( Math.abs( left ) + _$widthOfScrollContainer >= _numberOfViews * _widthOfView ) {
      _$rightArrow.addClass( "disabled" );
    } else {
      _$rightArrow.removeClass( "disabled" );
    }
    
    _sliding = false;
  }
  
  function initializeClipboard() {
    ZeroClipboard.setMoviePath( '/javascripts/ZeroClipboard10.swf' );
    var clip = new ZeroClipboard.Client();
    clip.setHandCursor( true );
    clip.glue( 'copy', 'copyContainer' );
    clip.addEventListener( 'mouseDown', setText );
    
    function setText() {
      clip.setText( document.getElementById('input-url').value );
    }
  }
})( jQuery );