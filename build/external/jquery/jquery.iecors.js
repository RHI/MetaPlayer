/*
 The MIT License
 Copyright (c) 2011 Derek Kastner

 Copyright (c) 2011 RAMP Holdings, Inc.
 .. Modified RAMP : fix undefined variables, early aborts

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function( jQuery ) {
    // Create the request object
    // (This is still attached to ajaxSettings for backward compatibility)
    jQuery.ajaxSettings.xdr = function() {
        return (window.XDomainRequest ? new window.XDomainRequest() : null);
    };

    // Determine support properties
    (function( xdr ) {
        jQuery.extend( jQuery.support, { iecors: !!xdr });
    })( jQuery.ajaxSettings.xdr() );

    // Create transport if the browser can provide an xdr
    if ( jQuery.support.iecors ) {

        jQuery.ajaxTransport(function( s ) {
            var callback;

            return {
                send: function( headers, complete ) {
                    var xdr = s.xdr();

                    xdr.onload = function() {
                        var headers = { 'Content-Type': xdr.contentType };
                        complete(200, 'OK', { text: xdr.responseText }, headers);
                    };

                    // need to define handlers to avoid aborts
                    // http://stackoverflow.com/a/9928073/369724
                    xdr.onprogress = function () {};

                    // Apply custom fields if provided
                    if ( s.xhrFields ) {
                        xdr.onerror = s.xhrFields.error;
                        xdr.ontimeout = s.xhrFields.timeout;
                    }

                    xdr.open( s.type, s.url );

                    // XDR has no method for setting headers O_o

                    xdr.send( ( s.hasContent && s.data ) || null );
                },

                abort: function() {
                    s.xdr().abort();
                }
            };
        });
    }
})( jQuery );
