( function( $, undefined ) {
  var $readmeContainer;
  var $newAppForm;
  
  $( document ).ready( function() {
    registerEventListeners();
  });
  
  function registerEventListeners() {
    $.SyntaxHighlighter.init( { lineNumbers: false } );
    $( ".download" ).click( handleDownload );
    $( ".readme" ).click( showDetails );
    $( ".readme-container .close" ).click( hideDetails );
    $( ".new-app" ).click( showAppForm );
    $( ".new-app-form .close" ).click( hideAppForm );
    $( ".new-app-form .submit" ).click( createApp );
    $( ".new-app-form .add-view" ).click( addView );
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
  
  function showAppForm() {
    $newAppForm = $newAppForm || $( ".new-app-form" );
    $newAppForm.fadeIn();
  }
  
  function hideAppForm( cb ) {
    $newAppForm.fadeOut( cb );
  }
  
  function createApp() {
    var $this = $( this );
    var data = {
      appName: $( "#app-name" ).val(),
      viewNames: getViewValues()
    };
    
    $this.text( "Creating..." );
    
    $.ajax( 
      {
        url: "/app",
        type: "POST",
        data: data
      }
    ).success( function() {
          $this.text( "Created" );
          setTimeout( function() {
            hideAppForm( function() {
              location.reload( true );
            })
          }, 300 );
    })
    
  }
  
  function getViewValues() {
    var ret = [];
    $( ".view-name" ).each( function() {
      ret.push( this.value );
    });
    
    return ret;
  }
  
  function addView() {
    var $form = $newAppForm.find( "form" );
    $.ajax(
      {
        url: "/app/newview",
      }
    ).success( function( html ) {
      var $html = $( html );
      $html.css( { display: 'none' } ).appendTo( $form ).fadeIn();
    });


  }

})( jQuery );
