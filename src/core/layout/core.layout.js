/*
 ui.base.js
 - establishes a basic html structure for adding player UI elements
 - ui elements can reliably position themselves using css
 - resizing is handled by css and the browser, not javascript calculations
 - components can adjust video size by adjusting css top/bottom/etc properties of metaplayer-video

 Basic structure:
 <div class="metaplayer" style="postion: relative">

 <!-- video element is stretched to fit parent using absolute positioning -->
 <div class="metaplayer-video" style="position: absolute: top: 0; left: 0; right: 0; bottom: 0>
 <--- any object or video child elements are height: 100%, width: 100% -->
 </div>

 <!-- example bottom-aligned control bar -->
 <div class="sample-controls" style="position: absolute: bottom: 0; height: 32px">
 ...
 </div>

 </div>
 */

( function () {
    var $ = jQuery;

    var defaults = {
        cssPrefix : "mp"
    };

    MetaPlayer.layout = function (target, options) {

        this.config = $.extend(true, {}, defaults, options);
        this._iOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

        // on ipad, target might be an object created by MetaPlayer.proxy.proxyVideo
        var t = $(target._proxyNode || target);
        var elem  = t.get(0);

        var base;
        var stage = t.find('.mp-stage');
        var video = t.find('video');
        var isVideo = (target.play instanceof Function);
        var isFrame = (elem.tagName.toUpperCase() == "IFRAME");

        // set up main wrapper
        if( isVideo || isFrame ){
            base = $('<div></div>')
                .addClass('metaplayer')
                .insertAfter( t );

            // assume they've set the dimensions on the target
            base.width( t.width() );
            base.height( t.height() );
        }
        else {
            base = t;
        }
        base.addClass('metaplayer');


        // set up the video playback area "stage"
        if( stage.length == 0) {
            stage = $('<div></div>')
                .addClass('mp-stage');
            stage.appendTo(base);
        }

        // move any child video objects over
        if( video.length > 0 ) {
            stage.append(video);
        }

        if( base !== t )
            stage.append(t);

        return {
            target : target,
            base : base.get(0),
            stage : stage.get(0)
        }
    }
})();
