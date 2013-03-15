

(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var pluginName = "captions";

    var defaults = {
        cssPrefix : "metaplayer-captions",
        pluginName :pluginName,  // override to use another popcorn plugin
        detectTextTracks : false  // beta, popcorn parser issues
    };

    /**
     * Captions are a PopcornJS plugin. Requires a parent with layout relative or absolute.
     * @name UI.Captions
     * @class The MetaPlayer captions overlay and plugin for PopcornJS
     * @constructor
     * @param {Element|PopcornJS} target The video element, or PopcornJS instance containing one.
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .captions()
     *     .load();
     *
     * @see <a href="http://jsfiddle.net/ramp/bvrxy/">Live Demo</a>
     * @see MetaPlayer#captions
     * @see Popcorn#captions

     */

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

    /**
     * @name MetaPlayer#captions
     * @function
     * @requires  metaplayer-complete.js
     * @description
     * Creates a {@link UI.Captions} instance
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .captions()
     *     .load();
     * @see UI.Captions
     */
    MetaPlayer.addPlugin("captions", function (options){

        var popcorn = this.popcorn;
        var captions = Captions(popcorn, options);

        this.layout.listen("resize", function (){
            captions.size();
        });

        if( ! (popcorn[pluginName] instanceof Function) )
            throw "popcorn plugin does not exist: " + pluginName;

        this.cues.enable( pluginName );
        this.captions = captions;
    });

    Captions.prototype = {
        init : function (){
            this.container = this.create()
                .addClass("mp-cc-frame")
                .hide();
            this.text = $('<div></div>')
                .addClass("metaplayer-captions-text")
                .addClass("mp-cc-text")
                .appendTo(this.container);

            this._captions = {};

            $(this.target.parentNode).append( this.container );

        },

        size:  function () {
            var size = this.container.parent().height() / 20;
            this.container.css('font-size',size + "px");
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
            var el = $("<span></span>")
                .html( options.text );
            this._captions[ options.start ] = el;
            this.text.append(el);
            this.container.show()
        },

        blur : function (options) {
            var el = this._captions[options.start];
            delete this._captions[options.start];
            el.remove();
            if( this.text.children().length == 0 )
                this.container.hide()
        },

        clear : function (options) {
            this._captions = {};
            this.text.empty();
            this.container.hide()
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
        /**
         * Schedules a subtitle to be rendered at a given time.
         * @name Popcorn#captions
         * @function
         * @param {Object} config
         * @param {String} config.text The caption text.
         * @param {Number} config.start Start time text, in seconds.
         * @param {Number} [config.end] End time text, in seconds, if any.
         * @example
         *  # without MetaPlayer Framework
         *  var pop = Popcorn(video);
         *  pop.captions({
         *      start: 0,
         *      end : 2,
         *      text : "The first caption"
         *  });
         */
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
