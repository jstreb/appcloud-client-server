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
 
( function( $, undefined) {
  var _data;
  
  function handleBackTap( evt ) {
    bc.device.navigateToMoreMenu();
  }
  
  function registerEventListeners() {
    $( ".back-button" ).bind( "tap", handleBackTap );
  }
  
  function render( data ) {
    var html;
    
    //If we have no data just return.
    if( !data ) {
      return;
    }
    
    //If the data is not new.
    if( bc.utils.isEqual( data, this.data ) ) {
      return;
    }
    
    $( ".spinner" ).remove();
    
    bc.core.cache( "about_data", data );
    
    _data = data;
    
    html = Mark.up( bc.templates["content-tmpl"], data );
    
    $( ".content-container" ).html( html );
  }
  
  function initialize() {
    var html;
    
    html = Mark.up( bc.templates["page-container-tmpl"] );
    
    $( "body" ).append( html );
    
    render( bc.core.cache( "about_data" ) );
    
    bc.core.getData( "about", render ); 
    
    bc.ui.init();
    
    registerEventListeners();
  }
  
  if( bc.context.initialized ) {
    initialize();
  } else {
    $( bc ).one( "init", initialize );
  }
  
})( bc.lib.jQuery );