( function( $, undefined ) {
  var $readmeContainer; 
  $( document ).ready( function() {
    registerEventListeners();
  });
  
  function registerEventListeners() {
    $.SyntaxHighlighter.init( { lineNumbers: false } );
    $( ".download" ).click( handleDownload );
    $( ".details" ).click( showDetails );
    $( ".close" ).click( hideDetails );
  }
  
  function handleDownload() {
    $( this ).text( "Downloading..." );
    $.ajax( {
      url: "/demos",
      success: function() { window.location.reload( true ) }
    });
  }
  
  function showDetails( e ) {
    var name = $( this ).closest( "li" ).data( "name" );
    $readmeContainer = $readmeContainer || $( ".readme-container" );
    $.ajax( {
      url: "/demo/details/" + name,
    }).success( function( res ) {
      var $html = $( res.html );
      $html.find( "code" ).addClass( "highlight" );
      $readmeContainer.find( ".contents" ).html( $html );
      $readmeContainer.fadeIn();
      $readmeContainer.syntaxHighlight();
    })
    return false;
  }
  
  function hideDetails() {
    $readmeContainer.fadeOut();
  }
  
})( jQuery );
