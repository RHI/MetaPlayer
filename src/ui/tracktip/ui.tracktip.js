

(function () {

    var $ = jQuery;

    var defaults = {
        offsetY : 5
    };

    var TrackTip = function (target, player, options) {
        if( !(this instanceof TrackTip) )
            return new TrackTip(target, player, options);

        this.player = player;
        this.player.tracktip = this;
        this.target = $(target);
        this.config = $.extend(true, {}, defaults, options);
        this.createMarkup();
        this.renterTime(0);
        this.renderPosition(0);

        this.player.layout.listen("resize", this.onResize, this)
    };

    MetaPlayer.TrackTip = TrackTip;

    MetaPlayer.addPlugin("tracktip", function(target, options) {
        this.tracktip = TrackTip(target, this, options);
    });

    TrackTip.prototype = {

        createMarkup : function (){
            this.ui = {};

            this.ui.track = $(this.target)
                .bind("mousemove touchmove", this.bind( this.onTrackMove))
                .bind("mouseleave touchend", this.bind( this.close));

            this.ui.base = $("<div></div>")
                .addClass("mp-tracktip")
                .bind("touchend", this.bind( this.close))
                .appendTo(this.target);

            this.ui.box = $("<div></div>")
                .addClass("mp-tracktip-box")
                .appendTo(this.ui.base);

            this.ui.thumb = $("<img>")
                .addClass("mp-tracktip-thumb")
                .appendTo(this.ui.box);

            this.ui.caption = $("<div></div>")
                .addClass("mp-tracktip-cc")
                .appendTo(this.ui.box);

            this.ui.box = $("<div></div>")
                .addClass("mp-tracktip-clear")
                .appendTo(this.ui.base);

            this.ui.time = $("<div></div>")
                .addClass("mp-tracktip-time")
                .appendTo(this.ui.base);
        },

        open : function (t){
            var d = this.player.video.duration;
            if( ! d )
                return;
            var p = t/d;
            this.renterTime(p);
            this.renderPosition(p);
        },

        close : function () {
            this.ui.base.stop().hide().css('opacity', 0);
        },

        onTrackMove : function  (e) {
            var p = this._dragPercent(e, this.target);
            this.renterTime(p);
            this.renderPosition(p);
        },

        renderPosition : function (p) { //0..1
            var tw = this.ui.track.width();
            var ow = this.ui.base.outerWidth();
            var oh = this.ui.base.outerHeight();
            var max = tw - ow;
            var x = (tw * p) - (ow * .5);
            if( x < 0 )
                x = 0;
            if( x > max )
                x = max;
            this.ui.base.css('left', x);
            this.ui.base.css('top', - (oh + this.config.offsetY));
        },

        renterTime : function (t) {
            var d = this.player.video.duration;
            if( ! d )
                return;

            var sec = t*d;
            this.ui.time.text( MetaPlayer.format.seconds(sec));
            this.renderCaption(sec);
            this.renderThumb(sec);
            this.ui.base.stop().show().animate({'opacity': 1}, 100);
        },

        renderCaption : function  (t) {
            var captions = this.player.cues.getCaptions();
            var last;
            $.each(captions, function (i, val) {
                if( val.start > t ) {
                    return false;
                }
                last = val;
            });
            var text = '';
            if( last && last.text ) {
                text = "..." + last.text.replace(/\s*$/, '') + "...";
            }
            this.ui.caption.html( text );
        },

        renderThumb : function (t) {
            var data = this.player.metadata.getData();
            var base;
            var extension = "jpg";
            var rate = 10;
            if( ! data )
                return;

            if( data.timedThumbnailRoot ){
                base = data.timedThumbnailRoot;
                extension = data.timedThumbnailExt;
                rate = parseFloat( data.timedThumbnailRate );
            }
            else if( data.ramp && data.ramp.thumbnail ) {
                base = data.ramp.thumbnail.match(/^.*\//)[0];
            }

            var file, time;
            if( base ) {
                time = Math.ceil(t / rate) * rate;
                file = base + MetaPlayer.format.zpad( time, 6) + "." + extension;
            }
            else {
                file = data.thumbnail;
            }

            if( file )
                this.ui.thumb.attr('src', file);
        },

        /* util */
        _dragPercent : function (event, el) {
            var oe = event.originalEvent;
            var pageX = event.pageX;

            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length )
                    return;
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = $(el);
            var x =  pageX - bg.offset().left;

            var p = x / bg.width();
            if( p < 0 )
                p = 0;
            else if( p > 1 )
                p = 1;
            return p
        },

        onResize : function () {
            var b = $(this.player.layout.base);

            var width = Math.max( b.width() * .2, 250)
            var font =  width / 20;

            this.ui.thumb
                .height( (font * 5) + "px");

            this.ui.base
                .css("font-size", font + "px")
                .width(width);
        },

        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        }
    };

})();
