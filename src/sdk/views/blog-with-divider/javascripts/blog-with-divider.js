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
 
( function( $, bc, undefined ) {

  function setDividerFlags( data ) {
    var last,
        date;
    
    for( var i=0, len=data.length; i<len; i++ ) {
      date = new Date( data[i].pubDate ).toLocaleDateString();
      if( date !== last ) {
        data[i].newDivider = true;
        last = date;
      } else {
        data[i].newDivider = false;
      }
    }
    console.log( data );
  }
  
  /**
   * Responsible for the initial rendering of the page.  The loading page is shown immediately
   * so that the user has some feedback that something is happening.
   */
  blogview.prototype.render = function( data ) {
    if( !data || data === this.data || ( !data && bc.utils.numberOfProperties( this.data ) === 0 ) ) {
     //no need to redraw the UI, so we should simply return
     return;
    }
    $( ".scroller .spinner" ).remove();
    $( ".scroller .error-message" ).remove();
    setDividerFlags( data );
    this.data = data;
    bc.core.cache( bc.viewID + "_blog_data", data );
    $( ".page.blog .list-container" ).html( Mark.up( bc.templates["list-items-tmpl"], { "items": data } ) );
  };
  
})( jQuery, bc );

Mark.pipes.defined = function( image ) {
  return ( image !== "" && image !== "???" && image !== undefined && image.substring( 0, 4 ) === "http" );
}