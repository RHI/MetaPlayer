(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    if( ! Popcorn )
        return;

    var defaults = {
        top : 1,
        left : 0,
        right: 0,
        durationSec : 4,
        center : true
    };

    Popcorn.TimeQ = function (popcorn, options) {
        var cached = popcorn._timeQ;
        if( cached ) {
            if( options ){
                cached.config = $.extend( cached.config, options );
                cached.position();
            }
            return cached;
        }

        if( ! (this instanceof Popcorn.TimeQ) )
            return new Popcorn.TimeQ(popcorn, options);

        this.config = $.extend({}, defaults, options);
        this.el = $('<div></div>')
            .addClass("mpf-timeq")
            .css({
                position: "absolute",
                'z-index' : this.config.zIndex,
                display : "none"
            })
            .appendTo( $('body') );

        this.media = popcorn.media;
        popcorn._timeQ = this;

    };


    Popcorn.TimeQ.prototype = {

        init : function (options) {
            options.end = options.start + this.config.durationSec;
        },

        focus : function (options) {
            this.el.html(options.code);
            this.position(options.start);
            this.el.stop().slideDown();
        },

        blur : function (options) {
            this.el.stop().slideUp();
        },

        destroy : function (options) {
            this.el.remove();
        },

        position : function ( time ) {

            if( time == null )
                time = this.last;
            else
                this.last = time;

            var percent = 0;
            if( this.media.duration > 0 )
                percent = time / this.media.duration;

            var el = this.el;

            var centered = this.config.center;
            var m = $(this.media);
            var mo = m.offset();
            var mw = m.outerWidth() - (this.config.left + this.config.right);
            var mh = m.height();

            var min = mo.left + (centered ? 0 : this.config.left);
            var max = min + mw;

            var ew = el.outerWidth();

            var pos = mo.left + this.config.left + (mw * percent);
            if( centered ) {
                pos -= (.5 * ew);
                max += (this.config.left + this.config.right);
            }

            // if would overflow left
            if( pos < min  ) {
                pos = min;
            }

            // if would overflow right
            if( pos + ew > max) {
                pos = max - ew;
            }

            el.css({
                top: mo.top + this.config.top + mh,
                left:  pos
            });
        }
    };

    Popcorn.plugin( "timeQ" , {
        _setup: function( options ) {
            Popcorn.TimeQ(this).init(options);
        },

        start: function( event, options ){
            Popcorn.TimeQ(this).focus(options)
        },

        end: function( event, options ){
            Popcorn.TimeQ(this).blur(options)
        },

        _teardown: function( options ) {
            Popcorn.TimeQ(this).destroy();
        }
    });

    if( MetaPlayer ) {
        MetaPlayer.addPlugin("timeQ", function (options){
            Popcorn.TimeQ(this.popcorn, options);
        });
    }
})();
