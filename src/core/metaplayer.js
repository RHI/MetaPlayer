/**
 * @fileOverview A media player framework for HTML5/JavaScript for use with RAMP services.
*/

(function () {

    var $ = window.jQuery;
    var Popcorn = window.Popcorn;


    var defaults  = {
        isTouchDevice : null, // autodetect
        debug : "",
        layout : {},
        metadata : {},
        search : {},
        cues : {}
    };

    /**
     * Create a MetaPlayer instance. Sets up core player plugins, and DOM scaffolding.
     * By default, search, metadata, and cues interfaces are queued for load(). If a DOM element is passed,
     * then the layout and playlist interfaces are queued as well.
     *
     * Example:
     * In the page
     * <code><pre>
     *      &lt;video id="myVideo" src="myvideo.mp4" /&gt;
     * </pre></code>
     *
     *
     * In JavaScript, after DOM loaded:
     * <code><pre>
     *      var mp = MetaPlayer("#myVideo")
     *          .pluginA()
     *          .pluginB()
     *          .load()
     * </pre></code>
     *
     * @name MetaPlayer
     * @constructor
     * @augments Util.EventDispatcher
     * @param {MediaElement,String} [video] An HTML5 Media element, a DIV element, or jQuery selector string.
     * @param {Object} [options] A map of configuration options
     * @param {Object} options.layout Default options passed in to Layout module, defaults to empty object.
     * @param {Object} options.metadata Default options passed in to MetaDat module, defaults to empty object.
     * @param {Object} options.search Default options passed in to Search module, defaults to empty object.
     * @param {Object} options.cues Default options passed in to Cues module, defaults to empty object.
     */
    var MetaPlayer = function (media, options ) {

        if( ! (this instanceof MetaPlayer) )
            return new MetaPlayer( media, options );


        this.config = $.extend({}, defaults, options, MetaPlayer.script.query("^mp."));

        MetaPlayer.dispatcher(this);

        this._plugins = {};
        this._loadQueue = [];
        this.target = media;

        // autodetect, or manual set for testing
        this.isTouchDevice = ( this.config.isTouchDevice != null )
            ? this.config.isTouchDevice
            : /iPad|iPhone|iPod/i.test(navigator.userAgent);

        // metadata interface
        if( this.config.metadata )
            this.metadata = new MetaPlayer.MetaData(this, this.config);

        // search interface
        if( this.config.search )
            this.search = new MetaPlayer.Search(this, this.config );

        // cues interface
        if( this.config.cues )
            this.cues = new MetaPlayer.Cues(this, this.config );

        // resolve html5 player adapter
        this.video = this.adaptMedia(media);

        // optional layout disabling, use at own risk for player UI layout
        if( this.config.layout && (this.video || typeof media == "string") ){
            this.layout = MetaPlayer.layout(this.video || media, this.config.layout);
            if( this.config.maximize )
                this.layout.maximize();
        }

        // start loading after this execution block, can be triggered earlier by load()
        // makes sure all plugins have initialized before startup sequence
        var self = this;
        setTimeout( function () {
            self._load();
        }, 0);
    };

    MetaPlayer.DEBUG = "error,warning";

    /**
     * Fired when all plugins are loaded.
     * @event
     * @name MetaPlayer#event:READY
     * @param {Event} e
     */
    MetaPlayer.READY = "ready";

    /**
     * Fired when player destructor called to allow plugins to clean up.
     * @event
     * @name MetaPlayer#event:DESTROY
     * @param {Event} e
     */
    MetaPlayer.DESTROY = "destroy";


    MetaPlayer.prototype = {

        /**
         * Initializes requested player plugins, optionally begins playback.
         * @name MetaPlayer#load
         * @function
         */
        load : function () {
            this._load();
            return this;
        },

        adaptMedia :  function ( media ) {
            var video;
            var self = this;
            $.each( MetaPlayer.Players, function (key, adapter) {
                // break loop if adapter return true
                video = adapter(media, self);
                if( video )
                    return false;
            });
            return video;
        },

        /**
         * Disabled MP instance, frees up memory resources. Fires DESTROY event for plugin notification.
         * @name MetaPlayer#destroy
         * @function
         */
        destroy : function () {
            this.dispatcher.dispatch( MetaPlayer.DESTROY );

            delete this.plugins;
            delete this._loadQueue;
            delete this.layout;
            delete this.popcorn;

        },

        _load : function () {

            if ( this._loaded ) {
                // load() was already called
                return;
            }
            var self = this;
            this._loaded = true;

            // fill in core interfaces were not implemented
            if( ! this.video && this.layout )
                this.html5();

            if( this.config.preload != null )
                this.video.preload = this.config.preload;

            if( this.video && ! this.popcorn && Popcorn != null )
                this.popcorn = Popcorn(this.video);

            if( this.video ){
                this.playlist = new MetaPlayer.Playlist(this);
            }

            if( this.video && this.config.linkAdvance ) {
                this.video.addEventListener("trackchange", function () {
                    var link = self.metadata.getData().link;
                    if( link && self.video.getIndex() > 0)
                        window.top.location = link;
                });
            }



            // run the plugins, any video will have been initialized by now
            var plugin;
            while( this._loadQueue.length ) {
                plugin = this._loadQueue.shift();
                plugin.fn.apply(this, plugin.args);
            }

            this.ready = true;

            // let plugins do any setup which requires other plugins
            this.dispatcher.dispatch( MetaPlayer.READY );

        },

        error : function (code, message, type) {
            var e = this.createEvent();
            e.initEvent("error", false, true);
            e.code = code;
            e.message = message;
            this.dispatchEvent(e);
            var args = Array.prototype.slice.call(arguments);
            args.unshift("MPF");
            try {
                console.error( args.join(" :: ") );
            }
            catch(e){};
        },

        warn : function (code, message) {
            var e = this.createEvent();
            e.initEvent("warning", false, true);
            e.code = code;
            e.message = message;
            this.dispatchEvent(e);
            var args = Array.prototype.slice.call(arguments);
            args.unshift("MPF");
            try {
                console.warn( args.join(" :: ") );
            }
            catch(e){};
        }

    };

    /**
     * Registers a plugin.
     *
     * For example:
     * <code><pre>
     *      MetaPlayer.addPlugin("foo", function (id) {
     *          this.video.src = id + ".mp4";
     *      });
     *      var mp = MetaPlayer("#mydiv").foo("trailer").load();
     * </pre></code>
     * @param {String} keyword The name to be use
     * @param {Function} callback Function reference to invoke to initialize plugin,
     *  with metaplayer instance as "this". All args are passed through.
     */
    MetaPlayer.addPlugin= function (keyword, callback ) {
        var p = MetaPlayer.prototype;
        if( p[keyword] )
            throw "keyword unavailable: " + keyword;

        p[keyword] = function () {
            // wait for load()
            if( ! this.ready ) {
                this._loadQueue.push({
                    name : keyword,
                    args : arguments,
                    fn : callback
                })
            }
            else { // post load(), fire now
                callback.apply(this, arguments);
            }
            return this;
        };
    };


    /**
     * @deprecated
     * @description
     * Registers a function as a playback plugin.  Playback plugins are initialized earlier than other plugins.
     *
     * For example:
     * <code><pre>
     *      MetaPlayer.addPlayer("foo", function (id) {
     *          this.video = document.getElementById(id);
     *      });
     *      var mp = MetaPlayer("#mydiv").foo("myVid").load();
     * </pre></code>
     * @param {String} keyword The name to be use
     * @param {Function} callback Function reference to invoke to initialize plugin,
     *  with metaplayer instance as "this". All args are passed through.
     */
    MetaPlayer.addPlayer = function (keyword, callback ) {
        var p = MetaPlayer.prototype;

        if( p[keyword] )
            throw "keyword unavailable: " + keyword;

        p[keyword] = function () {
            callback.apply(this, arguments);
            this.layout.addVideo(this.video);
            return this;
        };
    };

    MetaPlayer.iOS =  /iPad|iPhone|iPod/i.test(navigator.userAgent);

    /**
     * @name API
     * @namespace MetaPlayer Interfaces: MetaData, Cues, Search, Layout
     */
    MetaPlayer.Core = {};

    /**
     * @name Services
     * @namespace MetaData and Search providers
     */
    MetaPlayer.Services = {};

    /**
     * @name Players
     * @namespace Player HTML5 adapters
     */
    MetaPlayer.Players = {};

    /**
     * @name UI
     * @namespace Player Controls and Page Widgets
     */
    MetaPlayer.UI = {};

    /**
     * @name Util
     * @namespace Utility libraries and widgets.
     */
    MetaPlayer.Util = {};

    /**
     * @name Metrics
     * @namespace Utility libraries and widgets.
     */
    MetaPlayer.Metrics = {};


    MetaPlayer.log = function (type, rest) {
        var args = Array.prototype.slice.call(arguments);

        // memoise string DEBUG into objects for quick lookup
        if( typeof MetaPlayer.DEBUG == "string" ){
            var types = MetaPlayer.DEBUG.split(/[,\s]+/);
            MetaPlayer.DEBUG = {};
            $.each(types, function (i,val){
                MetaPlayer.DEBUG[val] = true;
            })
        }

        if( MetaPlayer.DEBUG && (MetaPlayer.DEBUG == true || MetaPlayer.DEBUG[type]) ) {
            args.unshift("MPF");
            try{
                console.log(args.join(" :: "));
            }
            catch(e){}
        }
    };

    /**
     * @name Popcorn
     * @class PopcornJS plugins provided by the MetaPlayer Framework
     */
    window.MetaPlayer = MetaPlayer;
    window.MetaPlayerFramework = MetaPlayer;
    window.MPF = MetaPlayer;



})();


