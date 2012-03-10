

(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var pluginName = "captions";

    var defaults = {
        cssPrefix : "metaplayer-captions",
        pluginName :pluginName,  // override to use another popcorn plugin
        detectTextTracks : false  // beta, popcorn parser issues
    };

    var Captions = function (target, options) {

        var id;
        // give passed in players an id for future instance lookup
        if( typeof target !== "string") {
            if ( ! target.__CAPTIONS_ID )
                target.__CAPTIONS_ID = "CC!" + (Captions._count++);
            id = target.__CAPTIONS_ID;
        }
        else {
            id = target;
        }

        // return any previous instance for this player
        if(  Captions.instances[id] ) {
            return Captions.instances[id];
        }

        // optional new() statement
        if( !(this instanceof Captions) )
            return new Captions(target, options);

        this.config = $.extend({}, defaults, options);

        if( target.getTrackEvents ) {
            this.popcorn = target;
            this.target = target.media;
        }
        else
            this.target = target;

        this.config = $.extend(true, {}, defaults, options);

        this.init();

        Captions.instances[id] = this;
    };

    MetaPlayer.Captions = Captions;

    Captions.instances = {};
    Captions._count = 0;

    MetaPlayer.addPlugin("captions", function (options){

        var popcorn = this.popcorn;
        this.captions = Captions(popcorn, options);

        if( ! (popcorn[pluginName] instanceof Function) )
            throw "popcorn plugin does not exist: " + pluginName;

        this.cues.enable( pluginName );
    });

    Captions.prototype = {
        init : function (){
            this.container = this.create();

            this._captions = {};

            var target;
            if( this.target.getTrackEvents )
                target = this.target.media;
            else
                target = this.target;

            $(this.target.parentNode).append( this.container );

        },

        findTrackElements : function (){
            var popcorn = this.popcorn;
            if( ! (popcorn.parseSRT instanceof Function) ){
                return;
            }

            var tracks = $(this.target).find('track[kind="subtitle"]');
            $.each( tracks, function (i, track) {
                var src = $(track).attr('src');
                var ext = src.substr( src.lastIndexOf('.') );
                if( ext == ".srt" ) {
                    popcorn.parseSRT(src);
                    return false;
                }
            })
        },

        append :  function (options) {

        },

        focus : function (options) {
            var el = this.create("text", 'div');
            el.html( options.text );
            this._captions[ options.start ] = el;
            this.container.append(el);
        },

        blur : function (options) {
            var el = this._captions[options.start];
            delete this._captions[options.start];
            el.remove();
        },

        clear : function (options) {
            this._captions = {};
            this.container.empty();
        },

        /* util */
        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className, tagName){
            if( ! tagName )
                tagName = "div";
            return $("<" + tagName + ">").addClass( this.cssName(className) );
        },

        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }
    };

    if( Popcorn ) {
        Popcorn.plugin( pluginName , {
            _setup: function( options ) {
                Captions(this);
            },

            start: function( event, options ){
                Captions(this).focus(options)
            },

            end: function( event, options ){
                Captions(this).blur(options);
            },

            _teardown: function( options ) {
                Captions(this).clear();
            }
        });
    }

})();
