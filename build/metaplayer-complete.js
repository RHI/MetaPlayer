/**

MetaPlayer Framework  v3.2.20130313

A standards-based, multiple player, UI and Event framework for JavaScript.

Copyright (c) 2011 RAMP Holdings, Inc.

Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/
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


(function () {

    var $ = jQuery;

    var defaults = {
    };

    /**
     * @class Stores all timed metadata, integrates with PopcornJS to schedule cues. <br/>
     * @constructor
     * @name API.Cues
     * @param {MetaPlayer} player
     */
    var Cues = function (player, options){

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._cues = {};

        this._rules = {
            // default rule mapping "captions" to popcorn "subtitle"
            "subtitle" : { clone : "captions", enabled : true }
        };

        this.player = player;
        this._addListeners();
    };

    MetaPlayer.Cues = Cues;

    /**
     * Fired when cues are available for the focus uri.
     * @name API.Cues#event:CUES
     * @event
     * @param {Event} e
     * @param e.data The cues from a resulting load() request.
     * @param e.uri The focus uri
     * @param e.plugin The cue type
     */
    Cues.CUES = "cues";

    /**
     * Fired when cue list reset, usually due to a track change
     * @name API.Cues#event:CLEAR
     * @event
     * @param {Event} e
     */
    Cues.CLEAR = "clear";
    Cues.RENDER = "render";
    Cues.ENABLE = "enable";
    Cues.DISABLE = "disable";

    Cues.prototype = {
        /**
         * Bulk adding of cue lists to a uri.
         * @name API.Cues#setCueLists
         * @function
         * @param cuelists a dictionary of cue arrays, indexed by type.
         * @param uri (optional) Data uri, or last load() uri.
         */
        setCueLists : function ( cuelists , uri) {
            var self = this;
            $.each(cuelists, function(type, cues){
                self.setCues(type, cues, uri)
            });
        },

        /**
         * Returns a dictionary of cue arrays, indexed by type.
         * @name API.Cues#getCueLists
         * @function
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCueLists : function ( uri) {
            var guid = uri || this.player.metadata.getFocusUri();
            return this._cues[guid];
        },

        /**
         * For a given cue type, adds an array of cues events, triggering a CUE event
         * if the uri has focus.
         * @name API.Cues#setCues
         * @function
         * @param type The name of the cue list (eg: "caption", "twitter", etc)
         * @param cues An array of cue obects.
         * @param uri (optional) Data uri, or last load() uri.
         */
        setCues : function (type, cues , uri){
            var guid = uri || this.player.metadata.getFocusUri();

            if( ! this._cues[guid] )
                this._cues[guid] = {};

            if( ! this._cues[guid][type] )
                this._cues[guid][type] = [];

            this._cues[guid][type] = cues;

            // data normalization
            $.each(cues, function (i, val) {
                if( typeof val.start == "string" )
                    val.start = parseFloat(val.start);
                if( typeof val.end == "string" )
                    val.start = parseFloat(val.end);
            });

            if( uri == this.player.metadata.getFocusUri() )
                this._renderCueType(type);
        },

        /**
         * Returns an array of caption cues events. Shorthand for getCues("caption")
         * @name API.Cues#getCaptions
         * @function
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCaptions : function ( uri ){
            return this.getCues("captions", uri);
        },

        /**
         * Returns an array of cue objects for a given type. If no type specified, acts
         * as alias for getCueLists() returning a dictionary of all cue types and arrays.
         * @name API.Cues#getCues
         * @function
         * @param type The name of the cue list (eg: "caption", "twitter", etc)
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCues : function (type, uri) {
            var guid = uri || this.player.metadata.getFocusUri();

            if( ! type ) {
                return this.getCueLists();
            }

            if( this._rules[type] && this._rules[type].clone ){
                type = this._rules[type].clone;
            }

            if(! this._cues[guid]  || ! this._cues[guid][type])
                return [];

            return this._cues[guid][type].sort( Cues.cueSortFn );
        },

        /**
         * Enables popcorn events for a cue type
         * @name API.Cues#enable
         * @function
         * @param type Cue type
         * @param overrides Optional object with properties to define in each popcorn event, such as target
         * @param rules (advanced) Optional rules hash for cloning, sequencing, and more.
         */
        enable : function (type, overrides, rules) {
            var r = $.extend({}, this._rules[type], rules);
            if(r.enabled )
                return;
            r.overrides = $.extend({}, r.overrides, overrides);
            r.enabled = true;
            this._rules[type] = r;

            var event = this.createEvent();
            event.initEvent(Cues.ENABLE, false, true);
            event.action = type;
            this.dispatchEvent(event);

            this._scheduleCues(type, this.getCues( r.clone || type) )
        },

        /**
         * Disables popcorn events for a cue type
         * @name API.Cues#disable
         * @function
         * @param type Cue type
         */
        disable : function (type) {
            if( ! type )
                return;

            if(! this._rules[type] )
                this._rules[type] = {};

            this._rules[type].enabled = false;

            var event = this.createEvent();
            event.initEvent(Cues.DISABLE, false, true);
            event.action = type;
            this.dispatchEvent(event);

            this._removeEvents(type);
        },

        isEnabled : function (type) {
            var r = this._rules[type]
            return Boolean(r && r.enabled);
        },

        /**
         * Frees external references for manual object destruction.
         * @name API.Cues#destroy
         * @function
         * @destructor
         */
        destroy : function  () {
            this._removeEvents();
            this.dispatcher.destroy();
            delete this.player;
        },

        /* "private" */

        _renderCueType : function (type){
            var guid = this.player.metadata.getFocusUri();
            var cues = this.getCues(type, guid);
            this._renderCues(type, cues)
            this.event(Cues.CUES, {
                uri : guid,
                plugin: type,
                cues : cues
            })
        },

        _addListeners : function () {
            var player = this.player;
            var metadata = player.metadata;
            player.listen( MetaPlayer.DESTROY, this.destroy, this);
            metadata.listen( MetaPlayer.MetaData.FOCUS, this._onFocus, this)
            metadata.listen( MetaPlayer.MetaData.DATA, this._onData, this)
        },

        _onFocus : function (e) {
            //... remove all popcorn events because the track has changed
            this._removeEvents();

            // let others know we've cleared
            var event = this.createEvent();
            event.initEvent(Cues.CLEAR, false, true);
            this.dispatchEvent(event);
        },

        _onData : function (e) {
            // render all cues
            var self = this;
            $.map(this._cues[e.uri] || [], function(cues, type) {
                self._renderCueType(type);
            });

            var event = this.createEvent();
            event.initEvent(Cues.RENDER, false, true);
            event.uri = e.uri;
            this.dispatchEvent(event);
        },

        _removeEvents : function ( type ) {
            var popcorn = this.player.popcorn;
            if( popcorn ) {
                var events = popcorn.getTrackEvents();
                $.each(events, function (i, e){
                    if( !type || type == e._natives.type )
                        popcorn.removeTrackEvent(e._id);
                });
            }
        },

        _renderCues : function (type, cues){
            var self = this;

            this._scheduleCues(type, cues);

            // additionally schedule any clones
            $.each( this._rules, function (plugin, rules){
                if( rules.clone == type ){
                    self._scheduleCues(plugin, cues)
                }
            });
        },

        _scheduleCues : function (type, cues) {
            var rules = this._rules[type] || {};
            var lastCue;

            this._removeEvents(type);

            if(! rules.enabled ) {
                return;
            }

            // deep copy of cues
            var events = $.extend(true, [], cues );

            // "sequence" automatically fills in missing cue end times with next cue start
            if( rules.sequence ) {
                $.each(events, function (i, event) {
                    if( lastCue )
                        lastCue.end = event.start;
                    lastCue = event;
                });
            }

            // "duration" sets a fixed length for any cue
            if( rules.duration ) {
                $.each(events, function (i, event) {
                    event.end = event.start + rules.duration;
                });
            }

            // "overrides" allow for page-specific event overrides
            if( rules.overrides ) {
                $.each(events, function (i, event) {
                    $.extend(true, event, rules.overrides)
                });
            }

            // schedule with popcorn instance
            var popcorn = this.player.popcorn;
            if( popcorn && popcorn[type] instanceof Function  ) {
                $.each(events, function(i, cue){
                    popcorn[type].call(popcorn, $.extend({}, cue) );
                });
            }
        }

    };

    Cues.cueSortFn = function (one, two){
        return parseFloat( one.start ) - parseFloat( two.start );
    };

})();(function () {

    var $ = jQuery;

    // stand-alone mode
    if( ! window.MetaPlayer )
          window.MetaPlayer = {};

    var defaults = {
        cssPrefix : "mp",
        adoptVideo : true,
        sizeVideo : true,
        sizeMsec : 250
    };

    /**
     * @name API.Layout
     * @class Manages the MetaPlayer DOM elements, video & panel arrangment.
     * @constructor
     * @param {String|Element} target The DOM element to decorate, or jQuery selector there of.
     * @param {Object} [options]  A dictionary of configuration properties.
     * @param {Boolean} [options.adoptVideo=true]  If no parent element is a "metaplayer" class,
     * create one and re-parent the video.
     * @param {Boolean} [options.sizeVideo=true]  Allow re-sizing of the video element.
     * @param {Number} [options.sizeMsec=250] When animating panels, the duration of the animation.
     */
    MetaPlayer.Layout = function (target, options){
        this.config = $.extend({}, defaults, options);

        this.target = $(target).get(0);
        this.panels = [];
        MetaPlayer.dispatcher(this);

        /**
         * The root DOM element of the MetaPlayer instance, with class="metaplayer".
         * @name API.Layout#base
         * @type {Element}
         */

        /**
         * A container for video overlays.
         * @name API.Layout#stage
         * @type {Element}
         */
        this.target = $(target)[0]; // normalize
        this._setup();

        var self = this;
        $(document.documentElement).bind('fullscreenchange webkitfullscreenchange', function (e){
            self.onFullScreen(e);

        });
        $(document).bind('mozfullscreenchange', function (e){
            self.onFullScreen(e);
        });

        $(window).bind('resize', function (e) {
            if( self.isMaximized )
                self.maximize();
        });

        $(window).bind("mousewheel DOMMouseScroll touchmove", function (e) {
            if( self.isMaximized ) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        this.isFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    };

    MetaPlayer.layout = function  (target, options){
        return new MetaPlayer.Layout(target, options);
    };


    MetaPlayer.Layout.PANEL_OPTIONS = {
        top : 0,
        right : 0,
        bottom: 0,
        left: 0,
        enabled : true,
        video : true
    };

    MetaPlayer.Layout.prototype =  {

        /**
         * Adds a panel to the layout.  A panel is something that should indent the video from the
         * DOM bounding box, usually a control bar or info panel.
         * @name API.Layout#addPanel
         * @function
         * @param {Object} panelConfig Contains configuration.
         * @param panelConfig.id A unique name for the panel, used for later access.
         * @param [panelConfig.top=0] The top video margin required for panel to not cover video.
         * @param [panelConfig.right=0] The right video margin.
         * @param [panelConfig.bottom=0] The bottom video margin.
         * @param [panelConfig.enabled=true] Whether the panel is enabled by default.
         * @param [panelConfig.video=true] Whether the panel should resize the video in addition to panels.
         * @example
         *  mp.layout.addPanel({
         *    id : "controls",
         *    bottom: 32,
         *    video: false
         *  });
         */
        addPanel : function (panelConfig) {
            var box = $.extend({},
                MetaPlayer.Layout.PANEL_OPTIONS,
                panelConfig);

            this.panels.push( box );
            this._renderPanels(0);
            return (this.panels.length - 1);
        },

        /**
         * Returns the panel spec for a panel id.
         * @name API.Layout#getPanel
         * @function
         * @param {String} id The panel id
         */
        getPanel : function (id) {
            return this.panels[id] || null;
        },

        /**
         * Toggles the visibility of a panel, animating if a duration is specified.
         * @name API.Layout#togglePanel
         * @function
         * @param {String} id The panel id
         * @param {Boolean} bool The target visibility state, true for visible.
         * @param {Number} [duration] The animation duration, in seconds, or undefined to disable.
         */
        togglePanel : function (id, bool, duration) {
            var p = this.getPanel(id);
            if( ! p )
                return;
            p.enabled = bool;
            this._renderPanels(duration);
        },

        /**
         * Updates a panel specification, usually to a new height or width.
         * @name API.Layout#updatePanel
         * @function
         * @param {String} id The panel id
         * @param {Object} options The panel spec. See {@link Layout#addPanel}.
         * @param {Number} [duration] The animation duration, in seconds, or undefined to disable.
         * @
         */
        updatePanel : function (id, options, duration) {
            var box = $.extend( this.getPanel(id),
                options);
            this._renderPanels(duration);
        },


        render : function (duration) {
            this._renderPanels(duration);
            this.dispatch("resize");
        },

        _renderPanels : function (duration)  {
            var video = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            var overlays = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            $.each(this.panels, function (i, box) {
                if(! box.enabled )
                    return;

                if( box.video ) {
                    video.top += box.top || 0;
                    video.left += box.left || 0;
                    video.bottom += box.bottom || 0;
                    video.right += box.right || 0;
                }

                overlays.top += box.top || 0;
                overlays.left += box.left || 0;
                overlays.bottom += box.bottom || 0;
                overlays.right += box.right || 0;
            });

            this._sizeVideo(video, duration);

        },

        maximize : function () {
            this._maximize();
            this._secondSize();
        },

        _maximize : function () {
            var c = $(this.base);
            var win =  $(window);
            if( ! this._restore ){
                this._restore = {
                    width: c.width(),
                    height: c.height(),
                    offset :c.offset(),
                    position : c.css('position')
                };
            }
            $('body').css('margin', 0).css('padding', 0);

            if( ! this.restoreZ )
                this.restoreZ = c.css('z-index');

            c.css('position', 'fixed')
                .width("100%")
                .addClass("mp-fullscreen")
                .height("100%")
                .css({
                    'z-index' :  (-1 >>> 1) // max int, 2147483647 in chrome
                })
                .offset({
                    top: win.scrollTop(), left: win.scrollLeft()
                });

            $("html,body").css("overflow","hidden");

            this._renderPanels();

            if(! this.isMaximized ) {
                this.isMaximized = true;
                this.dispatch("maximize");
            }
            this.dispatch("resize");
        },

        fullscreen : function () {
            var docElm = document.documentElement;

            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
            else {
                this.maximize();
                this._secondSize();
            }
        },

        window : function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        },

        onFullScreen : function (e) {
            this.isFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
            if( this.isFullScreen ) {
                this.dispatch("fullscreen");
                delete this._restore;
                this.maximize();
            }
            else {
                this.restore();
            }
            this._secondSize();
        },

        restore : function () {

            this.window();

            if( ! this._restore )
                return;

            // restore size
            var c = $(this.base);
            var r = this._restore;

            var win =  $(window);
            $('body').css('margin', '').css('padding', '');
            c.css('position', r.position)
                .offset({ top: r.offset.top, left: r.offset.left})
                .width(r.width)
                .css({
                    'z-index' :  this.restoreZ  || 'inherit'
                })
                .removeClass("mp-fullscreen")
                .height(r.height);

            $("html,body").css("overflow","auto");

            this._renderPanels();
            if( this.isMaximized ) {
                this.isMaximized = false;
                this.dispatch("restore");
                this.dispatch("resize");

            }
        },

        _secondSize : function () { // some browsers need a second resize
            var self = this;
            var fn =  function () {
                if( self.isMaximized )
                    self._maximize();
                else
                    self.restore();
            };
            setTimeout(fn, 500);
        },

        _sizeVideo : function (box, duration) {
            if( !(this.config.sizeVideo && this.video) )
                return;

            var msec = (duration  != null) ? duration : this.config.sizeMsec;

            var c = $(this.base);
            var v = $(this.video);

            var w = c.width() - box.left - box.right;
            var h = c.height() - box.top - box.bottom;

            // allow for players that need help sizing
            if( this.video.mpf_resize instanceof Function )
                this.video.mpf_resize(w, h);

            var css = {
                'margin-top': box.top,
                'margin-left': box.left,
                'width' : (w / c.width() * 100) + "%", // allows for liquid resizing, sorta
                'height' : (h / c.height() * 100) + "%"
            };

            if( duration ) {
                this.stage.stop().animate(css, msec);
            }
            else {
                this.stage.css(css)
            }

        },

        _setup : function () {
            var target = this.target;


            var el = $(target);
            var v;
            // target is the video, we need to wrap
            if( target.play instanceof Function ) {
                this.video = target;
                v = $(this.video._proxyFor || this.video );
            }

            // target is a metaplayer-classed div
            if( el.is(".metaplayer") )
                this.base = el;

            // target child of metaplayer div or just some random div without a base
            else
                this.base = el.parents(".metaplayer").first();

            // target becomes base if not found
            if( ! this.base.length ) {
                this.base = $("<div/>")
                    .addClass("metaplayer")
                    .insertAfter(v);
            }

            this.stage = this.base.children(".mp-stage").first();

            if( ! this.stage.length ) {
                this.stage = $("<div />")
                    .addClass("mp-stage")
                    .css({ position : "relative" })
                    .appendTo(this.base);
            }

            if( v ) {
                this.base.css({
                    height: v.height(),
                    width:  v.width()
                });
                this.addVideo()
            }
            this._renderPanels();
        },

        addVideo : function (video) {
            if( video )
                this.video = video;
            var v = $(this.video._proxyFor || this.video );
            v.css({
                height: "100%",
                width: "100%"
            });
            if( this.config.adoptVideo )
                this.stage.append(v);
            this._renderPanels();
        },

        _addStage : function () {
            return $("<div></div>").addClass("mp-stage").appendTo(this.base).get(0);
        }
    };


})();(function () {

    var $ = jQuery;

    var defaults = {
    };

    /**
     * Constructs the MetaData store. <br />
     * @name API.MetaData
     * @class Stores metadata for video items.
     * @constructor
     */
    var MetaData = function (options){
        if( !(this instanceof MetaData ))
            return new MetaData(options);

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._data = {};
        this._callbacks = {};
        this._lastUri = null;
    };

    MetaPlayer.MetaData = MetaData;

    /**
     * Fired when a uri becomes the focus, broadcasting events on updates.
     * @name API.MetaData#event:FOCUS
     * @event
     * @param {Event} e
     * @param e.uri The new focus uri
     */
    MetaData.FOCUS = "focus";

    /**
     * Fired when MetaData needs a resource to be defined.
     * @name API.MetaData#event:LOAD
     * @event
     * @param {Event} e
     * @param e.uri Opaque string which can be used by a service to load metadata.
     */
    MetaData.LOAD = "load";

    /**
     * Fired when new metadata is received as a result of a load() request.
     * @name API.MetaData#event:DATA
     * @event
     * @param {Event} e
     * @param e.data The metadata from a resulting load() request.
     */
    MetaData.DATA = "data";


    MetaData.prototype =  {


        /**
         * Request MetaData for an uri.  If no callback is specified, will also
         * set the focus uri.
         * @name API.MetaData#load
         * @function
         * @param uri
         * @param [callback] If specified will suppress the DATA event
         * @see MetaData#event:DATA
         * @see MetaData#event:FOCUS
         */
        load : function ( uri, callback, scope) {
            var e;

            // calling  w/ a callback will not trigger a focus change or DATA events
            if( callback ) {
                this._queue(uri, callback, scope);
            }

            // no callback, let others know focus has changed, that a DATA event is coming
            else {
                this.setFocusUri(uri);
            }

            if( ! uri )
                return;

            if( this._data[uri] ){
                // cache hit; already loaded. respond immediately
                if( this._data[uri]._cached ) {
                    // consistently async
                    var self = this;
                    setTimeout( function (){
                        self._response(uri);
                    },0);
                    return true;
                }
                // load in progress, skip
                else if ( this._data[uri]._loading ) {
                    return true;
                }
            }

            // flag as loading
            if( ! this._data[uri] )
                this._data[uri] = {};
            this._data[uri]._loading =  (new Date()).getTime();

            // send a loading request, with any data we have
            e = this.createEvent();
            e.initEvent(MetaData.LOAD, false, true);
            e.uri = uri;
            e.data = this.getData(uri);

            // see if anyone caught our request, return accordingly
            var caught = ! this.dispatchEvent(e);
            if( ! caught ) {
                this._data[uri]._loading = false;
            }
            return caught;
        },

        /**
         * Gets the uri for which events are currently being fired.
         * @name API.MetaData#getFocusUri
         * @function
         * @return {String} The current focus URI.
         */
        getFocusUri : function () {
            return this._lastUri;
        },

        /**
         * Sets the uri for which events are currently being fired.
         * @name API.MetaData#setFocusUri
         * @function
         * @see MetaData#event:FOCUS
         */
        setFocusUri : function (uri) {
            this._lastUri = uri;
            this._firedDataEvent = false;
            var e = this.createEvent();
            e.initEvent(MetaData.FOCUS, false, true);
            e.uri = uri;
            this.dispatchEvent(e);
        },

        /**
         * Returns any cached data for a URI if available. Differs from load() in that
         * it is synchronous and will not trigger a new data lookup.
         * @name API.MetaData#getData
         * @function
         * @param uri Optional argument specifying media guid. Defaults to last load() uri.
         */
        getData : function ( uri ){
            var guid = uri || this._lastUri;
            return this._data[guid]
        },

        /**
         * Sets the data for a URI, triggering DATA if the uri has focus.
         * @name API.MetaData#setData
         * @function
         * @param data {Object}
         * @param uri (optional) Data uri, or last load() uri.
         * @param cache (optional) allow lookup of item on future calls to load(), defaults true.
         * @see MetaData#event:DATA
         */
        setData : function (data, uri, cache ){
            var guid = uri || this._lastUri;
            // dont't clobber known data with cache half-datas
            if( !( this._data[guid] && ! cache) ){
                this._data[guid] = $.extend(true, {}, this._data[guid], data);
                this._data[guid]._cached = ( cache == null ||  cache ) ? true : false;
            }
            if( cache )
                this._response(guid);
        },

        /**
         * Frees external references for manual object destruction.
         * @name API.MetaData#destroy
         * @function
         * @destructor
         */
        destroy : function  () {
            this.dispatcher.destroy();
            delete this._callbacks;
            delete this._data;
            delete this.config;
        },

        // registers a callback
        _queue : function ( uri, callback, scope ) {
            if( ! this._callbacks[uri] )
                this._callbacks[uri] = [];
            this._callbacks[uri].push({ fn : callback, scope : scope });
        },

        // handles setting data, firing event and callbacks as necessary
        _response : function ( uri ){
             var data = this._data[uri];

            if( this._lastUri == uri && ! this._firedDataEvent) {
                var e = this.createEvent();
                e.initEvent(MetaData.DATA, false, true);
                e.uri = uri;
                e.data = data;
                this.dispatchEvent(e);
                this._firedDataEvent = true;
            }

            if( this._callbacks[uri] ) {
                $.each( this._callbacks[uri] || [], function (i, callback ) {
                    callback.fn.call(callback.scope, data);
                });
                delete this._callbacks[uri];
            }
        }
    };


})();/**
 * Playlist functionality for HTML5 video
 */
(function () {

    var $ = jQuery;

    var defaults = {
        autoAdvance : true,
        loop : false,
        selectSource: true,
        appendSources: false
    };


    /**
     * @name API.Playlist
     * @class Defines a  interface for playlist navigation and management.
     * @constructor
     * @param {Object} [options]  A dictionary of configuration properties.
     * @param {Number} [options.autoAdvance=true] Automatically advance the playlist when the current video ends.
     * @param {Number} [options.selectSource=true] Automatically select the resource when a track is selected.
     * @param {Number} [options.loop=false] If true, the playlist is circular and will repeat,
     */
    var Playlist = function (player, options) {

        // check if already implements Playlist API
        var media = player.video;

        this.config = $.extend({}, defaults, options);
        this.player = player;

        if( !( media.getPlaylist || media.getItem) ){
            this._playlist = [];
            this._index = 0;
            this.loop = this.config.loop;
            this.autoAdvance = this.config.autoAdvance;
            this.selectSource = this.config.selectSource;

            MetaPlayer.dispatcher(this);

            // extends the video into a playlist via mix-in
            Playlist.proxy(this, this.player.video);

            this._addProxyListeners();
        }

        this._addListeners();

        return media;
    };

    MetaPlayer.Playlist = Playlist;

    /**
     * Fires when the current track index/guid changes (but possibly before a src is selected).
     * @name API.Playlist.TRACK_CHANGE
     * @event
     */
    Playlist.TRACK_CHANGE = "trackchange";

    /**
     * Fires when the playlist is modified, via append or replace.
     * @name API.Playlist.PLAYLIST_CHANGE
     * @event
     */
    Playlist.PLAYLIST_CHANGE = "playlistchange";


    /**
     * Utility for applying the getters and setters associated with the Playlist API.
     * @name API.Playlist.proxy
     * @function
     * @param {Object} playlist A playlist implementation.
     * @param {Object} target A DOM element or JS object to which the properties should be applied.
     */
    Playlist.proxy = function (playlist, target) {
        MetaPlayer.proxy.mapProperty("loop autoAdvance selectSource", target, playlist);
        MetaPlayer.proxy.proxyFunction("getIndex setIndex getItem updateItem getPlaylist setPlaylist next previous",
            playlist, target);
        MetaPlayer.proxy.proxyEvent( Playlist.TRACK_CHANGE, playlist, target);
        MetaPlayer.proxy.proxyEvent( Playlist.PLAYLIST_CHANGE, playlist, target);
    };

    Playlist.prototype = {

        _addProxyListeners : function () {
            var self = this;
            this.player.video.addEventListener("ended", function (e) {
                self._onEnded(e);
            });
            this.player.video.addEventListener("error", function (e) {
                self._onEnded(e);
            });

        },

        _addListeners : function () {
            var self = this;
            this.player.addEventListener("destroy", function (e) {
                self._destroy();
            });
            this.player.video.addEventListener( "loadstart", function (e) {
                self.player.video.preload = "auto";
            });
            this.player.video.addEventListener( "playing", function (e) {
//                self.player.video.autoplay = true;
            });
            this.player.video.addEventListener( "pause", function (e) {
//                self.player.video.autoplay = false;
            });
            this.player.video.addEventListener( Playlist.TRACK_CHANGE, function (e) {
                self._onTrackChange(e);
            });
            this.player.metadata.addEventListener("data", function (e) {
                self._onData(e);
            });
        },

        _onEnded : function () {
            if( this.autoAdvance ) {
                var self = this;
                // has to occur after ended event
                setTimeout(function () {
                    self.next();
                }, 0)

            }
        },

        _onData : function  (e) {
            if( this.config.appendSources )
                this._appendSources(e.data);
            this.player.video.updateItem(e.uri, e.data);
        },

        /**
         * Callback which is fired when a track changes and metadata (and resource urls) becomes available. Will
         * select media source.
         * @name API.Playlist#updateItem
         * @function
         * @param {String} uri The content guid
         * @param {Object} metadata An object representing the metadata for this content.
         */
        updateItem : function (uri, metadata, already_resolved) {
            if( this._index == null || uri != this.getItem() )
                return;

            if( metadata.resolveUrl && ! already_resolved){
                this._applyResolver(uri, metadata.resolveUrl);
                return;
            }

            var v = this.player.video;
            var src = this._selectResource( metadata.content );

            if( src ) {
                v.pause();
                this._applySource(src);
            }

            if( metadata.thumbnail && (v.preload == "none" || ! v.autoplay) )  // avoid flicker if loading anyway
                this.player.video.poster = metadata.thumbnail;
        },

        _applyResolver : function (guid, lookup_url) {
            var self = this;
            MetaPlayer.mrss(lookup_url, function (playlist) {
                if( playlist.length > 0 ) {
                    self.updateItem(guid, playlist[0], true)
                }
            });
        },

        _applySource : function (src) {
            if( ! this.selectSource )
                return;
            var v = this.player.video;
            v.src = src;

            // video element should do this on src assign, but is racey
            if( v.autoplay )
                v.play();

            else if( v.preload != "none" )
                v.load();
        },

        _appendSources : function (data) {
            var v = this.player.video;
            $(v).empty();

            $.each(data.content, function (i, item) {
                $('<source>')
                    .attr('src', item.url)
                    .attr('type', item.type)
                    .appendTo(v);
            });
        },

        _selectResource : function (transcodes) {
            var self = this;
            var video = this.player.video;
            var probably = [];
            var maybe = [];

            if( ! transcodes )
                return;

            $.each(transcodes, function (i, source) {
                var canPlay = video.canPlayType(source.type || self._resolveType(source.url) );
                if( ! canPlay )
                    return;
                if( canPlay == "probably" )
                    probably.push(source.url);
                else
                    maybe.push(source.url);
            });

            return probably.shift() || maybe.shift();
        },

        _destroy : function () {
            this.dispatcher.destroy();
            delete this.player;
        },

        /**
         * Returns an Array of content guids, representing the play order.
         * @name API.Playlist#getPlaylist
         * @function
         * @return {Array} An array of guids.
         */
        getPlaylist : function () {
            return this._playlist;
        },

        /**
         * Accepts an array of content guids, representing the play order.
         * @name API.Playlist#setPlaylist
         * @function
         * @param {Array} items  An array of GUIDs.
         * @param {boolean} items If true, will append to the current playlist instead of replacing it.
         */
        setPlaylist : function ( items, append ) {
            if( ! (items instanceof Array) )
                items = [ items ];

            if( ! append ){
                this._playlist = [];
            }

            var i;
            var pl = this._playlist;
            for( i = 0; i< items.length; i++) {
                pl.push( items[i] );
            }

            this.dispatch(Playlist.PLAYLIST_CHANGE);

            if( ! append )
                this.setIndex(0, true);
        },


        /**
         * Returns the current playlist position.
         * @name API.Playlist#getIndex
         * @function
         * @return {Integer}
         */
        getIndex : function ( i ) {
            // internal: will also resolve an index passed in with respect to the loop attribute
            var pl = this._playlist;

            if( i == null)
                return this._index;

            if( i < 0  && this.loop)
                i = pl.length + i;

            if( !this.loop && (i >= pl.length || i < 0) ){
                return null
            }

            return  i % pl.length;
        },


        /**
         * Assigns the current index. If looping is enabled, then index will wrap.
         * @name API.Playlist#setIndex
         * @function
         * @param {Integer} i Sets the current index, triggering a track change;
         */
        setIndex : function (i, force) {
            i = this.getIndex(i);

            if(! force && (i == null || i == this._index) )
                return false;

            this._index = i;

            this.dispatch(Playlist.TRACK_CHANGE);
            return true;
        },

        _onTrackChange : function (e) {
            var guid = this.player.playlist.getItem();
            if(! this.player.metadata.load(guid) ){
                // if have no data, and no one will look it up, just play the url
                this._applySource(guid);
            }
        },

        /**
         * Returns a GUID for the current video by default, or another video if specified.
         * @name API.Playlist#getItem
         * @function
         * @param {Integer} [i] An optional index, defaults to the current video.
         * @return {String} The item GUID.
         */
        getItem : function ( i ) {
            if(i == null )
                i = this._index;
            return this._playlist[ this.getIndex(i) ];
        },

        next : function () {
            return this.setIndex( this.getIndex() + 1 );
        },

        previous : function () {
            return this.setIndex( this.getIndex() - 1 );
        },


        _resolveType : function ( url ) {
            var ext = url.substr( url.lastIndexOf('.') + 1 );

            if( url.match("www.youtube.com") ) {
                return "video/youtube"
            }

            if( ext == "ogv")
                return "video/ogg";

            // none of these seem to work on ipad4
            // http://developer.apple.com/library/ios/#technotes/tn2235/_index.html
            if( ext == "m3u8" )
                return  "application/application.vnd.apple.mpegurl";

            return "video/"+ext.toLowerCase();
        }

    };

})();
(function () {

    var $ = jQuery;

    var defaults = {
        forceRelative : false,
        useCache: true
    };

    /**
     * Creates a Search interface for use with MetaPlayer and RAMP services.
     * @name API.Search
     * @class Provides search servies for the currently video. <br />
     * @constructor
     * @augments Util.EventDispatcher
     * @param {MetaPlayer} player A MetaPlayer instance containing a MetaData reference.
     * @see MetaData
     */
    var Search = function (player, options){
        this.config = $.extend({}, defaults, options);

        this.player = player;
        this.forceRelative = this.config.forceRelative;
        MetaPlayer.dispatcher(this);

        this.player.listen(MetaPlayer.DESTROY, this.destroy, this);

    };

    /**
     * Fired when a search is initiated.
     * @name API.Search#event:QUERY
     * @event
     * @param {Event} e
     * @param {String} e.query The current search string
     * @example
     * mpf.search.addEventListener( MetaPlayer.Search.RESULTS , function (e) {
     *    console.log("Searched initiated for: " + e.query);
     * });
     */
    Search.QUERY = "query";

    /**
     * Fired when search results are available.
     * @name API.Search#event:RESULTS
     * @event
     * @param {Event} e
     * @param {String} e.query The current search string
     * @param {Object} e.data  The search results
     * @example
     * mpf.search.addEventListener( MetaPlayer.Search.RESULTS , function (e) {
     *   console.log("Results for: " + e.query);
     *   console.log(JSON.stringify(e.data, null, "  "));
     * });
     * mpf.search.query("Babylon");
     * @example
     * Results for: Babylon
     *{
     *  "query": [
     *    "Babylon"
     *  ],
     *  "results": [
     *    {
     *      "start": "473.964",
     *      "words": [
     *        {
     *          "match": false,
     *          "start": "480.0457",
     *          "text": "hanging"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.05457",
     *          "text": "gardens"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.06345",
     *          "text": "of"
     *        },
     *        {
     *          "match": true,
     *          "start": "480.07233",
     *          "text": "\nBabylon."
     *        }
     *      ]
     *    }
     *  ]
     *}
     */
    Search.RESULTS = "results";

    MetaPlayer.Search = Search;

    MetaPlayer.addPlugin("search", function (options) {
        return new Search(this);
    });


    Search.context = function ( str, offset, count, maxbuffer) {
        // returns *count words of context starting at offset
        // if count is negative, looks bacward from offset
        // if maxbuffer is less than a word size, it will be split into two words (default: 256)
        // returns an array of objects in the form of
        // eg: [ { text : "first word", offset : 0 }, ... ]

        var o = offset;
        var words = [],
            match;
        if( count == null )
            count = 10;

        if( maxbuffer == null )
            maxbuffer = 256;

        var re, sub;
        if( count > 0 ){
            re = /^\s*(\S+)/;
            sub = str.substr(o, maxbuffer)
        }
        else {
            re = /(\S+)\s*$/;
            if( o >= maxbuffer )
                sub = str.substr(  o - maxbuffer, maxbuffer);
            else
                sub = str.substr(0, o);
        }

        var word;
        while( words.length < Math.abs(count) && (match = sub.match(re) ) ){
            if( count > 0 ){
                words.push({
                    text : match[1],
                    offset: o
                });
                o += match[0].length;
                sub = str.substr(o, maxbuffer)
            }
            else {
                o -= match[0].length;
                words.unshift({
                    text : match[1],
                    offset: o
                });
                if( o >= maxbuffer )
                    sub = str.substr(  o - maxbuffer, maxbuffer);
                else
                    sub = str.substr(0, o);
            }
        }
        return words;
    };

    Search.search = function (str, query, count) {

        if(! query.length )
            return [];

        var escaped = query.replace(/(\W)/g, '\\$1')
            .replace(/(\\\s)+/g, '\\s+');
        var re = new RegExp("(\\b\\S*" + escaped + "\\S*\\b)", "i");
        var match;
        var o = 0;
        var c;
        var sub = str.substr(o);
        var start, after, before, words;

        if( count == null)
            count = 6;

        var results = [];
        while( match = sub.match(re) ) {
            start = o + match.index;
            after = Search.context(str, start + match[1].length, 10);
            before = Search.context(str, start, -10);
            words = [{
                match : true,
                text : match[1],
                offset: start
            }];
            words.offset = start;

            c = 0;
            while( words.length < count && (before.length || after.length) ){
                c++;
                if( before.length && c % 2 == 0 )
                    words.unshift( before.pop() );
                else if( after.length )
                    words.push( after.shift() );
            }

            o = start + 1;
            sub = str.substr(o);
            results.push(words);
        }
        return results;
    };

    Search.prototype = {

        /**
         * Initiates a search.
         * @name API.Search#query
         * @function
         * @param {String} query A search phrase.
         */
        query : function (query, callback, scope) {
            var data = this.player.metadata.getData();


            var e = this.createEvent();
            e.initEvent(Search.QUERY, false, false);
            e.query = query;
            this.dispatchEvent(e);

            if (this.config.useCache) {
                this.searchLocal(query, callback, scope);
            }
            else {
                if(! data.ramp.searchapi )
                    throw "no searchapi available";
                this._queryAPI(data.ramp.searchapi, query, callback, scope);
            }
        },

        /**
         * Disables the instance and frees memory references.
         * @name API.Search#destroy
         * @function
         */
        destroy : function () {
            this.dispatcher.destroy();
            delete this.player;
        },

        searchLocal : function(query, callback, scope) {
            var captions = this.player.cues.getCaptions();

            var corpus = "";  // full text
            var metadata = []; // index of offsets => timestamps

            var o; // position in corpus of last needle match
            var needles = query.replace(/(^\s|\s$)/, '').toLowerCase().split(/\s+/);

            // build index/corups
            $.each(captions, function (i, cue) {
                metadata.push({
                    start : cue.start,
                    offset : corpus.length
                });
                corpus += cue.text + " ";
            });

            var timeOffset = function (offset) {
                var last = 0;
                for(var t = 0; t < metadata.length; t++ ){
                    if( offset < metadata[t].offset )
                        break;
                    last = metadata[t].start
                }
                return last;
            };

            var matches = Search.search(corpus, query);
            var ret = {
                usingCues: true,
                query : query,
                results : []
            };

            $.each(matches, function (i, match) {
                ret.results.push({
                    offset: match.offset,
                    start: timeOffset( match.offset ),
                    words :$.map(match, function (word) {
                        return {
                            offset: word.offset,
                            text : word.text,
                            match : Boolean(word.match),
                            start : timeOffset( word.offset )
                        }
                    })
                })
            });
            this.setResults(ret, query, callback, scope);
        },

        _queryAPI : function (url, query, callback, scope) {

            if( this.forceRelative ) {
                url = url.replace(/^(.*\/\/[\w.]+)/, ""); // make match local domain root
            }

            var params = {
                q : "\"" + query + "\"" //wrapped with double quotes for multi-words
            };

            if( ! query ) {
                this.setResults({ query : [], results : [] }, query, callback, scope);
                return;
            }

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    console.error("Load search error: " + textStatus + ", url: " + url);
                },
                success : function (response, textStatus, jqXHR) {
                    var results = this.parseSearch(response, callback, scope);
                    this.setResults(results, query, callback, scope);
                }
            });
        },

        setResults : function (results, query, callback, scope) {
            if( callback ){
                callback.call(scope, results, query);
                return;
            }

            var e = this.createEvent();
            e.initEvent(Search.RESULTS, false, false);
            e.query = query;
            e.data = results;
            this.dispatchEvent(e);
        },

        parseSearch : function (xml) {
            var node = $(xml);
            var self = this;
            var ret = {
                query : [],
                results : []
            };

            var terms = node.find('SearchTerms Term');
            terms.each(function() {
                ret.query.push( self._deSmart( $(this).text() ) );
            });

            var snippets = node.find('Snippets Snippet');
            snippets.each( function (i, snip) {
                var node = $(snip);
                var s = {
                    start : node.attr('time'),
                    words : []
                };
                var words = node.find('T');
                $.each(words, function (i, word){
                    var el = $(word);
                    s.words.push({
                        match : Boolean( el.find('MQ').length ),
                        start : el.attr('s'),
                        text : self._deSmart( el.text() )
                    });
                });
                ret.results.push(s);
            });
            return ret;
        },

        _deSmart : function (text) {
            return text.replace(/\xC2\x92/, "\u2019" );
        }
    };

    /**
     * @example
     * Results for: Babylon
     *{
     *  "query": [
     *    "Babylon"
     *  ],
     *  "results": [
     *    {
     *      "start": "473.964",
     *      "words": [
     *        {
     *          "match": false,
     *          "start": "480.0457",
     *          "text": "hanging"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.05457",
     *          "text": "gardens"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.06345",
     *          "text": "of"
     *        },
     *        {
     *          "match": true,
     *          "start": "480.07233",
     *          "text": "\nBabylon."
     *        }
     *      ]
     *    }
     *  ]
     *}
     */

})();

(function () {
    var $ = jQuery;

    /**
     * Creates a dispatcher property on an object, and mixes in a DOM style event API.
     * @name Util.EventDispatcher
     * @constructor
     * @param source A JS object, or DOM node
     */
    var EventDispatcher = function (source){

        if( source && source.dispatcher instanceof EventDispatcher)
            return source.dispatcher;

        if( ! (this instanceof EventDispatcher ))
            return new EventDispatcher(source);

        this._listeners = {};
        this.attach(source);
    };

    MetaPlayer.dispatcher = EventDispatcher;

    EventDispatcher.prototype = {

        /**
         * Extend <code>source</code> with eventDispatcher properties, via mix-in pattern.
         * @name Util.EventDispatcher#attach
         * @function
         * @param source
         */
        attach : function (source) {
            if(!  source )
                return;

            if( source.addEventListener ){
                // use the element's native core
                MetaPlayer.proxy.proxyFunction( "addEventListener removeEventListener dispatchEvent",
                    source, this);
            }
            else {
                // or enable plain objects
                MetaPlayer.proxy.proxyFunction(
                    "addEventListener removeEventListener dispatchEvent",
                    this, source);
            }

            // and add our convenience functions
            MetaPlayer.proxy.proxyFunction ( "listen forget dispatch createEvent event",
                this, source);

            source.dispatcher = this;
        },

        /**
         * disables object, frees memory references
         * @name Util.EventDispatcher#destroy
         * @function
         */
        destroy : function () {
            delete this._listeners;
            delete this.addEventListener;
            delete this.removeEventListener;
            delete this.dispatchEvent;
            this.__destroyed = true; // for debugging / introspection
        },

        /**
         * A an alias for addEventListener which allows for setting scope
         * @name Util.EventDispatcher#listen
         * @function
         * @param eventType
         * @param {Function} callback An anonymous function
         * @param [scope] The object to set as <code>this</code> when executing the callback.
         */
        listen : function ( eventType, callback, scope) {
            this.addEventListener(eventType, function (e) {
                callback.call(scope, e, e.data);
            })
        },

        forget : function (type, callback) {
            this.removeEventListener(type, callback);
        },

        /**
         * An convenience alias for dispatchEvent which creates an event of eventType,
         * sets event.data, and dispatches the event.
         * @name Util.EventDispatcher#dispatch
         * @function
         * @param {String} eventType An event name
         * @param data A value to be set to event.data before dispatching
         * @returns {Boolean} <code>true</code> if event was not cancelled.
         */
        dispatch : function (eventType, data) {
            var eventObject = this.createEvent();
            eventObject.initEvent(eventType, true, true);
            eventObject.data = data;
            return this.dispatchEvent(eventObject);
        },

        event : function ( type, obj ) {
            var eventObject = this.createEvent();
            eventObject.initEvent(type, true, true);
            $.extend( eventObject, obj );
            return this.dispatchEvent(eventObject);
        },

        /* traditional event apis */

        /**
         * Registers a callback function to be executed every time an event of evenType fires.
         * @name Util.EventDispatcher#addEventListener
         * @function
         * @param {String} eventType An event name
         * @param {Function} callback An anonymous function
         */
        addEventListener : function (eventType, callback) {
            if( ! this._listeners[eventType] )
                this._listeners[eventType] = [];
            this._listeners[eventType].push(callback);
        },

        /**
         * Un-registers a callback function previously passed to addEventListener
         * @name Util.EventDispatcher#removeEventListener
         * @function
         * @param {String} eventType An event name
         * @param {Function} callback An anonymous function
         */
        removeEventListener : function (type, callback) {
            var l = this._listeners[type] || [];
            var i;
            for(i=l.length - 1; i >= 0; i-- ){
                if( l[i] == callback ) {
                    l.splice(i, 1);
                }
            }
        },

        /**
         * Creates an Event object which can be configured and dispatched with dispatchEvent
         * @name Util.EventDispatcher#createEvent
         * @function
         * @param {String} eventType An event name
         */
        createEvent : function (eventType) {
            if( document.createEvent )
                return document.createEvent(eventType || 'Event');

            return new EventDispatcher.Event();
        },

        /**
         * Triggers any callbacks associated with eventObject.type
         * @name Util.EventDispatcher#dispatchEvent
         * @function
         * @param {Event} eventObject created with createEvent
         * @returns {Boolean} <code>true</code> if event was not cancelled.
         */
        dispatchEvent : function (eventObject) {

            if(! eventObject.type.match(/^time/) )
                MetaPlayer.log("event", eventObject.type, eventObject);
            else
                MetaPlayer.log("time", eventObject.type, eventObject);

            // copy so that removeEventListener doesn't break iteration
            var l = ( this._listeners[eventObject.type] || [] ).concat();

            for(var i=0; i < l.length; i++ ){
                if( eventObject.cancelBubble ) // via stopPropagation()
                    break;
                l[i].call(l[i].scope || this, eventObject, eventObject.data )
            }
            return ! eventObject.defaultPrevented;
        }

    };

    /**
     * Used as an Event object in browsers which do not support document.createEvent
     * @name Util.Event
     * @constructor
     */
    EventDispatcher.Event = function () {
        this.cancelBubble = false;
        this.defaultPrevented = false;
    };

    EventDispatcher.dispatch = function (dispatcher, eventType, data ) {
        var eventObject;
        if( document.createEvent )
            eventObject = document.createEvent('Event');
        else
            eventObject =  new EventDispatcher.Event();

        eventObject.initEvent(eventType, true, true);
        if( data instanceof Object )
            $.extend(eventObject, data);
        return dispatcher.dispatchEvent(eventObject);
    };

    EventDispatcher.Event.prototype = {
        /**
         * Sets event properties
         * @name Util.Event#initEvent
         * @function
         * @param {String} eventType An event name
         * @param {Boolean} bubbles  Not used by non-DOM dispatchers
         * @param {Boolean} cancelable  Enables preventDefault()
         */
        initEvent : function (eventType, bubbles, cancelable)  {
            this.type = eventType;
            this.cancelable = cancelable;
        },

        /**
         * Cancels the event from firing any more callbacks.
         * @name Util.Event#stopPropagation
         * @function
         */
        stopPropagation : function () {
            this.cancelBubble  = true;
        },

        /**
         * Cancels the event. For non-DOM object, same as stopPropegation()
         * @name Util.Event#stopImmediatePropagation
         * @function
         */
        stopImmediatePropagation : function () {
            this.cancelBubble  = true;
        },

        /**
         * Indicates a default action should be skipped, by causing dispatchEvent()
         * to return false.
         * @name Util.Event#preventDefault
         * @function
         */
        preventDefault : function () {
            if( this.cancelable )
                this.defaultPrevented = true;
        }
    };


})();
(function () {

    var $ = jQuery;

    MetaPlayer.format = {

        zpad : function (val, len) {
            var r = String(val);
            while( r.length < len ) {
                r = "0" + r;
            }
            return r;
        },
        seconds : function (time, options) {
            var defaults = {
                minutes : true,
                seconds : true,
                hours   : false // auto
            };
            var config = $.extend({}, defaults, options);

            var zpad = MetaPlayer.format.zpad;

            var hr = Math.floor(time / 3600);
            var min = Math.floor( (time %  3600) / 60);
            var sec = Math.floor(time % 60);
            var parts = [];

            if( config.seconds || min || hr )
                parts.unshift( zpad(sec, 2) );
            else if( sec > 0)
                parts.unshift(sec);

            if( config.minutes || hr )
                parts.unshift( zpad(min, 2) );
            else if( min > 0)
                parts.unshift(min);

            if( config.hours )
                parts.unshift( zpad(hr, config.hours) );
            else if(  hr > 0)
                parts.unshift(hr);

            return parts.join(":");
        },

        replace : function (template, dict) {
        return template.replace( /\{\{(\w+)\}\}/g,
            function(str, match) {
                var ret;
                if( dict[match] instanceof Function ){
                    ret = dict[match](dict);
                }
                else if( dict[match] != null ){
                    ret = dict[match]
                }
                else {
                    return "{!!!" + match + "!!!}"
                }
                return MetaPlayer.format.replace( ret.toString(), dict )
            });
    }
};

})();


(function () {

    var $ = jQuery;

    var defaults = {
        steps : null,
        throttleMs : 250,
        max : 100,
        min : 0,
        value : 25,
        draggable: true
    };

    var ProgressBar = function (parent, options) {

        if( ! (this instanceof  ProgressBar))
            return new ProgressBar(parent, options);

        var config = $.extend({}, defaults, options);
        this._steps = config.steps;
        this._throttleMs = config.throttleMs;
        this._max = config.max;
        this._min = config.min;
        this._value = config.value;
        this.ui = {};
        this.createMarkup(parent);
        this._render();
        this.setDraggable(config.draggable);

        MetaPlayer.dispatcher(this);
    };

    MetaPlayer.ProgressBar = ProgressBar;

    ProgressBar.prototype = {

        createMarkup : function (parent) {
            this.ui.track = $("<div></div>")
                .css({
                    position : "relative",
                    top : 0,
                    left : 0
                })
                .bind("mousedown touchstart", this.bind( this._onDragStart ))
                .appendTo(parent);

            this.ui.fill = $("<div></div>")
                .css({
                    position : "absolute",
                    top : 0,
                    left : 0,
                    height: "100%"
                })
                .appendTo(this.ui.track);
        },


        getPercent : function () {
            return this._value / this._range();
        },

        getValue : function () {
            return this._value;
        },

        getStep : function () {
            return Math.ceil( this.getPercent() * this._steps);
        },

        setValue : function ( val ) {
            this._value = val;
            this._render();
        },

        setDraggable : function (bool) {
            this._draggable = Boolean(bool);
            this.ui.track.css("cursor", this._draggable ? "pointer" : 'inherit');
        },

        setMin : function ( min ){
            this._min = min;
            this._render();
        },

        setMax : function ( max ){
            this._max = max;
            this._render();
        },

        _range : function () {
            return this._max - this._min;
        },

        _render : function (percent) {
            if( percent == null )
                percent = this.getPercent();

            if( this._dragging && arguments[0] == null)
                return;

            if( this._steps > 0 )
                percent = this.getStep() / this._steps;

            this.ui.fill.width( (percent * 100) + "%" );
        },

        _onDragStart : function (e) {

            if( ! this._draggable )
                return;

            this._dragging =  {
                move : this.bind(this._onDragMove),
                stop :  this.bind(this._onDragStop)
            };

            this.dispatch("dragstart");

            $(document)
                .bind("mousemove touchmove", this._dragging.move)
                .bind("mouseup touchend", this._dragging.stop);

            this._onDragMove(e);
        },

        _onDragStop : function (e) {
            if( ! this._dragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._dragging.move)
                .unbind("mouseup touchend", this._dragging.stop);

            // ensure we get a last move with the final value
            this._lastFire = null;

            this._onDragMove(e);

            this._dragging = null;

            this.dispatch("dragstop");
        },

        _onDragMove : function (e) {
            var p = this._dragPercent(e, this.ui.track );


            if(!  isNaN(p) ) { // touchend has no position info
                this._value = p * this._range() ;
                this._lastP = p;
            }
            else {
                p = this._lastP;
            }

            if( p === 0 || p > 0 )
                this._render( p );

            e.preventDefault();

            var now = (new Date()).getTime();
            if( ! this._lastFire || (now - this._lastFire > this._throttleMs) ){
                this._onThrottle();
                return;
            }

            if( ! this._timeout )
                this._timeout = setTimeout( this.bind(this._onThrottle), this._throttleMs)
        },

        _onThrottle : function () {
            clearTimeout(this._timeout);
            this._timeout = null;
            this._lastFire = (new Date()).getTime();
            this.dispatch("dragmove");
        },

        /* util */
        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        },

        _dragPercent : function (event, el) {
            var oe = event.originalEvent;
            var pageX = event.pageX;

            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length )
                    return NaN;
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = this.ui.track;
            var x =  pageX - bg.offset().left;

            var p = x / bg.width();
            if( p < 0 )
                p = 0;
            else if( p > 1 )
                p = 1;
            return p
        }
    };



})();
(function () {
    var $ = jQuery;

    var Proxy = {
        proxyProperty : function (props, source, target ){
            $.each(props.split(/\s+/g), function (i, prop) {
                Proxy.mapProperty(prop, target, source);
            });
        },

        proxyFunction : function (props, source, target ){
            $.each(props.split(/\s+/g), function (i, prop) {
                if( !  source[prop] )
                    return;
                target[prop] = function () {
                    return source[prop].apply(source, arguments);
                };
            });
        },

        proxyEvent : function (types, source, target ){
            // emulate if old non-standard event model
            if( ! target.addEventListener ) {
                MetaPlayer.dispatcher(target);
            }
            $.each(types.split(/\s+/g), function (i, type) {
                source.addEventListener(type, function (e) {
                    // if emulated, just use type
                    if( target.dispatch ) {
                        target.dispatch(e.type, e.data);
                        return;
                    }
                    // else use standard model
                    var evt = document.createEvent("Event");
                    evt.initEvent(e.type, false, false);
                    target.dispatchEvent(evt);
                });
            });
        },

        mapProperty : function (props, target, source, method){
            // example :   map("name" myObject, myObject._name);
            //             map("name" myObject);
            if( ! source )
                source = target;

            $.each(props.split(/\s+/g), function (i, prop) {

                // support _propName
                var sProp = (source[prop] == undefined)
                    ?  "_" + prop
                    : prop;

                var fn;

                if( source[sProp] instanceof Function ){
                    fn = function () {
                        return source[sProp].apply(source, arguments);
                    };
                }
                else {
                    fn = function (val) {
                        if( val !== undefined )
                            source[sProp] = val;
                        return source[sProp];
                    };
                }

                Proxy.define(target, prop, { get : fn, set : fn });
            });
        },

        define : function (obj, prop, descriptor) {
            descriptor.configurable = true;
            try {
                // modern browsers
                return Object.defineProperty(obj, prop, descriptor);
            }
            catch(e){
                // ie8 exception if not DOM element
            }

            // older, pre-standard implementations
            if( obj.__defineGetter && descriptor.get )
                obj.__defineGetter__( prop, descriptor.get);
            if( descriptor.set && obj.__defineSetter__ ) {
                obj.__defineSetter__( prop, descriptor.set);
            }

            // ie7 and other old browsers fail silently
        },

        // returns an object which can safely used with Object.defineProperty
        // IE8: can't do javascript objects
        // iOS: can't do DOM objects
        // use DOM where possible
        getProxyObject : function ( source ) {

            // if already a proxy object
            if( source && source._proxyFor )
                return source;

            var dom = document.createElement("div");
            var proxy;

            try {
                // 1) Proxy can be a DOM node (CR/FF4+/IE8+)  !iOS !IE7
                // iOS4 throws error on any dom element
                // iOS4 throws error specifically on parentElement
                // ie7 has no setter support whatsoever
                proxy = dom;
                Object.defineProperty(proxy, "parentElement", {
                    get : function () {
                        return source.parentElement;
                    },
                    configurable : true
                });
            }

            catch(e){
                // 2) Proxy is a JS Object, (CR/FF/IE9/iOS) !IE7, !IE8
                // ie8 only supports getters on DOM elements.
                proxy = {};
                Proxy.mapProperty("children", proxy, dom);
                Proxy.proxyFunction("appendChild removeChild prependChild", dom, proxy);
            }

            if( source ) {
                // proxy the source element in attributes the best we can.
//                we only care about standard dom properties, and FF blows up when you iterate an object tag

//                $.map(dom,  function (val, key) {
                var key, val;
                for( key in dom ) {

                    // skip some, either because we don't want to proxy them (append child, etc)
                    // or because they break (eg. dom["filters"] throws an error in IE8)
                    if( key.match(/filters|child|textContent|nodeName|nodeType/i) )
                        continue;

                    val = undefined;
                    try {
                        val = dom[key];  // document.createElement('p').offsetParent throws exception in ie8
                    }
                    catch(e){}

                    if( val && val instanceof Function )
                        Proxy.proxyFunction(key, source, proxy);
                    else
                        Proxy.mapProperty(key, proxy, source);
                }
            }

            if( proxy !== dom ){
                // map child methods so as not to modify original dom node
                // here we lie to jQuery: it refuses to bind nodeType "object"
                Proxy.mapProperty("nodeName nodeType children textContent", proxy, dom);
                Proxy.proxyFunction("appendChild removeChild prependChild", dom, proxy);
            }

            proxy._proxyFor = source;
            return proxy;
        },

        /**
         *
         * @name Util.ProxyPlayer
         * @class ProxyPlayer contains a substantial a subset of the Media Element properties.  If provided
         * a target DOM node, the media attributes will be applied to that DOM node, if possible.  In iOS, where DOM
         * getters functions cannot be defined, a JavaScript object will be provided with both media element properties and
         * proxyed DOM element properties.
         * @see Documentation ported from: <a href=http://www.w3.org/TR/html5/media-elements.html#media-elements">W3.Org Media Elements</a>
         * @param source A JavaScript object containing an HTML5 MediaController interface.  Getter/setter properties
         * such as currentTime and src can be defined as function (eg: currentTime(time), src(src).
         * @param [target] A DOM element upon which to define the MediaController interface, clobbering any
         * existing properties (such as readyState). If not defined, the iOS fallback JS object is returned.
         * @description
         * This utility function hides browser-specific complexity of mapping a video player wrapper onto a DOM node,
         * and returns an object which can be used as if it were a <code>&lt;video></code> element.  Usually, this is
         * the DOM element passed in, with the exception being iOS in which a JS object is returned.
         * @example
         *         var myWrapper = {
         *              __time : 0,
         *              currenTime : function (val) {
         *                  if( val != null)
         *                      this.__time = val;
         *                  return this.__time;
         *              }
         *         };
         *         var video = MetaPlayer.proxy.proxyPlayer( myWrapoer,
         *              document.getElementById("#myDif") );
         */

        /**
         * @name Util.ProxyPlayer#duration
         * @type Number
         * @description Returns the difference between the earliest playable moment and the latest playable moment (not considering whether the data in question is actually buffered or directly seekable, but not including time in the future for infinite streams). Will return zero if there is no media.
         */

        /**
         * @name Util.ProxyPlayer#currentTime
         * @type Number
         * @description Returns the current playback position, in seconds, as a position between zero time and the
         * current duration. Can be set, to seek to the given time.
         */

        /**
         * @name Util.ProxyPlayer#paused
         * @type Boolean
         * @description Returns true if playback is paused; false otherwise. When this attribute is true, any media element slaved to this controller will be stopped.
         */

        /**
         * @name Util.ProxyPlayer#volume
         * @type Number
         * @description Returns the current playback volume multiplier, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest. Can be set, to change the volume multiplier.
         */

        /**
         * @name Util.ProxyPlayer#muted
         * @type Boolean
         * @description Returns true if all audio is muted (regardless of other attributes either on the controller or on any media elements slaved to this controller), and false otherwise. Can be set, to change whether the audio is muted or not.
         */

        /**
         * @name Util.ProxyPlayer#seeking
         * @type Boolean
         * @description Returns true if the user agent is currently seeking.
         */

        /**
         * @name Util.ProxyPlayer#controls
         * @type Boolean
         * @description If false, render no controls.  If true render the default playback controls.
         */

        /**
         * @name Util.ProxyPlayer#autoplay
         * @type Boolean
         * @description Automatically loads and plays the video when a source is available.
         */

        /**
         * @name Util.ProxyPlayer#preload
         * @type String
         * @description If true, then load() will be invoked automatically upon media selection. Ignored if autoplay is enabled.
         * <ul>
         * <li>none</li>
         * <li>metadata</li>
         * <li>auto</li>
         * </ul>
         */

        /**
         * @name Util.ProxyPlayer#ended
         * @type Boolean
         * @description True if the media has loaded and playback position has progressed to the terminus of the
         * content in the current playback direction.
         */

        /**
         * @name Util.ProxyPlayer#src
         * @type String
         * @description Gives the address of the media resource (video, audio) to show. Can be set to change
         * the current media.
         */

        /**
         * @name Util.ProxyPlayer#readyState
         * @type Integer
         * @description Describes to what degree the media is ready to be rendered at the current playback position.
         * <ul>
         * <li>0 - HAVE_NOTHING</li>
         * <li>1 - HAVE_METADATA</li>
         * <li>2 - HAVE_CURRENT_DATA</li>
         * <li>3 - HAVE_FUTURE_DATA</li>
         * <li>4 - HAVE_ENOUGH_DATA</li>
         * </ul>
         * @see <a href="http://www.w3.org/TR/html5/media-elements.html#ready-states">readyState</a>
         */

        /**
         * @name Util.ProxyPlayer#load
         * @function
         * @description Begins the download, and buffering of the media specified, beginning with media
         * seletion from <code> &lt;source></code> tags if no <code>src</code> is specified.
         */

        /**
         * @name Util.ProxyPlayer#play
         * @function
         * @description Sets the paused attribute to false.
         */

        /**
         * @name Util.ProxyPlayer#pause
         * @function
         * @description Sets the paused attribute to false.
         */

         /**
         * @name Util.ProxyPlayer#canPlayType
         * @function
         * @param {String} type A MIME type string.
         * @description Returns the empty string if type is a type that the user agent knows it cannot render, returns
          * "probably" if the user agent is confident that the type represents a media resource that it can
          * render, "maybe" otherwise.
          * @see <a href="http://www.w3.org/TR/html5/media-elements.html#dom-navigator-canplaytype">canPlayType</a>
          * @see <a href="http://www.w3.org/TR/html5/the-source-element.html#attr-source-type">types</a>
          */

        /**
         * @name Util.ProxyPlayer#event:timeupdate
         * @event
         * @description The current playback position changed as part of normal playback or discontinuously, such as seeking.
         */

        /**
         * @name Util.ProxyPlayer#event:seeking
         * @event
         * @description  The seeking property has been set to true.
         */

        /**
         * @name Util.ProxyPlayer#event:seeked
         * @event
         * @description The seeking property has been set false.
         */

        /**
         * @name Util.ProxyPlayer#event:playing
         * @event
         * @description Playback is ready to start after having been paused or delayed due to lack of media data.
         */

        /**
         * @name Util.ProxyPlayer#event:play
         * @event
         * @description The element is no longer paused. Fired after the play() method has returned, or when the autoplay attribute has caused playback to begin.
         */
        /**
         * @name Util.ProxyPlayer#event:pause
         * @event
         * @description The element has been paused.
         */
        /**
         * @name Util.ProxyPlayer#event:loadeddata
         * @event
         * @description The user agent can render the media data at the current playback position for the first time.
         */
        /**
         * @name Util.ProxyPlayer#event:loadedmetadata
         * @event
         * @description The user agent has just determined the duration and dimensions of the media resource.
         */
        /**
         * @name Util.ProxyPlayer#event:canplay
         * @event
         * @description The user agent can resume playback of the media data.
         */
        /**
         * @name Util.ProxyPlayer#event:loadstart
         * @event
         * @description The element is constructed and is ready for a media source.
         */
        /**
         * @name Util.ProxyPlayer#event:durationchange
         * @event
         * @description The duration attribute has just been updated.
         */
        /**
         * @name Util.ProxyPlayer#event:volumechange
         * @event
         * @description Either the volume attribute or the muted attribute has changed.
         */
        /**
         * @name Util.ProxyPlayer#event:ended
         * @event
         * @description Playback has stopped because the end of the media resource was reached.
         */
        /**
         * @name Util.ProxyPlayer#event:error
         * @event
         * @description An error occurs while fetching the media data.
         */


        /**
         * @name Util.ProxyPlayer#ad
         * @type Boolen
         * @description True if an Ad is currently rendering.
         */

        /**
         * @name Util.ProxyPlayer#event:adstart
         * @event
         * @description Fired when the player begins an ad, indicating that seeking should be disabled.
         */

        /**
         * @name Util.ProxyPlayer#event:adstop
         * @event
         * @description Fired when the player finishes playing an ad, indicating that seeking can be re-enabled.
         */


        proxyPlayer : function (adapter, dom) {
            var proxy = MetaPlayer.proxy.getProxyObject(dom);

            Proxy.mapProperty("duration currentTime volume muted seeking" +
                " paused controls autoplay preload src ended readyState ad",
                proxy, adapter);

            Proxy.proxyFunction("load play pause canPlayType" ,adapter, proxy);

            // MetaPlayer Optional Extensions
            Proxy.proxyFunction("mpf_resize mpf_index", adapter, proxy);

            Proxy.proxyEvent("timeupdate seeking seeked playing play pause " +
                "loadeddata loadedmetadata canplay loadstart durationchange volumechange adstart adstop"
                + " ended error",adapter, proxy);

            return proxy;
        }
    };

    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.proxy = Proxy;


})();

(function () {

    var $ = jQuery;

    MetaPlayer.script = {

        url : function (filename) {
            // returns the first matching script tag
            var match;
            var re = RegExp( filename );
            $('script').each( function (i, el){
                var src =  $(el).attr('src');
                if( src && src.match(re) ){
                    match = src;
                    return false;
                }
            });
            return match;
        },

        /**
         * Returns the directory of a specified script if found,
         * or of metaplayer.js if not.
         * @param filename
         */
        base : function (filename) {
            var src, base;
            if( filename )
                src = this.url(filename) || '';
            if( ! src )
                src = this.url('metaplayer(-complete)?(\.min)?\.js');
            if( src )
                return  src.substr(0, src.lastIndexOf('/') + 1);
        },

        query : function (filter) {
            var query = {};
            var regex = RegExp(filter);
            var search = location.search && location.search.substr(1).split("&");
            $.each(search, function (i, pair) {
                var parts = pair && pair.split("=") || [];
                var key = parts[0];

                if( ! key )
                    return;

                // namespacing by prefix
                if( filter ) {
                    if( ! key.match(regex) )
                        return;
                    else
                        key = key.replace( regex, '');
                }

                // unescaping
                var val = parts[1] || '';
                val = decodeURIComponent(val.replace(/\+/g, " ") );

                // casting
                if( val == "" )
                    val = null;
                else if( val.match(/^\d+$/) )
                    val = parseInt( val );
                else if( val.match(/^true|false$/) )
                    val = (val === "true");

                query[ key ] = val
            });
            return query;
        },

        camelCase : function (str) {
            return str.replace(/[\s_\-]+([A-Za-z0-9])?([A-Za-z0-9]*)/g, function(str, p1, p2) { return p1.toUpperCase() + p2.toLowerCase() } )
        },

        objectPath : function (obj, key, val, depth) {
            if( depth == null)
                depth = 0;
            var i =  key.indexOf(".");
            if( i == -1 ) {
                if( val !== undefined )
                    obj[key] = val;
                return obj[key];
            }
            var name = key.slice(0,i);
            var remain = key.slice(i+1);
            if( key !== undefined && ! (obj[name] instanceof Object) )
                obj[name] = {};
            return MetaPlayer.script.objectPath(obj[name], remain, val, depth + 1)
        },

        parseSrtTime : function (str) {
            var m = str.match(/^(?:(\d+):)?(\d\d):(\d\d)[\.,](\d\d\d)$/);
            if( ! m ) {
                return null;
            }
            if( ! m[1] )
                m[1] = 0
            return ( parseInt(m[1], 10) * 3600) + ( parseInt(m[2], 10) * 60)+ parseInt(m[3], 10) + (parseInt(m[4], 10) *.001);
        }
    }

})();
/**
 * skinnable, touch friendly lightweight scroller
 */


(function () {

    var $ = jQuery;

    var defaults = {
        disabled : false,
        fixedHeight : false,
        minHeight : 20, //px
        mouseDrag : false,
        listenChanges : true,
        knobAnimateMs : 1000,
        inertial : false  // beta
    };
    var ScrollBar = function (container, options) {
        this.config = $.extend(true, {}, defaults, options);
        this.init(container);
        this.inertiaY = 0;
    };

    var eventX = function (e) {
        return e.pageX || e.originalEvent.touches[0].pageX;
    };
    var eventY = function (e) {
        return  e.pageY || e.originalEvent.touches[0].pageY;
    };

    ScrollBar.prototype = {
        init : function (parent) {
            this.parent = $(parent);
            var self = this;
            var children = this.parent[0].childNodes;

            this.body = $("<div></div>")
                .addClass("mp-scroll-body")
                .css("position", "relative")
                .bind("resize DOMSubtreeModified size change", function(e) {
                    self.onResize(e);
                })
                .append( children );


            this.scroller = $("<div></div>")
                .css("width", "100%")
                .css("height", "100%")
                .css("overflow", "hidden")
                .addClass("mp-scroll")
                .append(this.body)
                .appendTo(parent);


            // memoise event callbacks
            this._touchStop = function (e) {
                self.onTouchStop(e);
            };
            this._touchMove = function (e) {
                self.onTouchMove(e);
            };

            this._knobStop = function (e) {
                self.onKnobStop(e);
            };
            this._knobMove = function (e) {
                self.onKnobMove(e);
            };

            this.knob = $("<div></div>")
                .css('position', "absolute")
                .css('background', "black")
                .css('top', 0)
                .css('right', "-10px")
                .css('border-radius', "4px")
                .css('background', "#000")
                .css('opacity', .4)
                .hide()
                .css('cursor', "pointer")
                .width(8)
                .addClass("mp-scroll-knob")
                .appendTo(this.parent)
                .bind("mousedown touchstart", function (e) {
                    self.onKnobStart(e);
                });

            this.parent
                .css("position", "relative")
                .css("overflow", "visible")
                .bind("mousewheel DOMMouseScroll", function (e){
                    self.onScroll(e);
                })
                .bind((this.config.mouseDrag ? "mousedown" : '') + " touchstart", function (e) {
                    self.onTouchStart(e);
                });


            this.scrollTo(0,0);
        },

        onScroll : function(e) {
            var x = e.originalEvent.wheelDeltaX || e.originalEvent.delta || e.originalEvent.detail * 10|| 0;
            var y = e.originalEvent.wheelDeltaY || e.originalEvent.delta ||  e.originalEvent.detail * 10|| 0;
            if( ! this.config.disabled ){
                if( this.scrollBy(-x, -y) ){
                    e.preventDefault();
                }
            }
        },

        scrollBy : function (x, y, duration){
            var sl = this.scroller.scrollLeft();
            var st = this.scroller.scrollTop();
            return this.scrollTo( sl + x ,  st + y, duration);
        },

        scrollTop : function () {
            return this.scroller.scrollTop();
        },

        scrollTo : function (x, y, duration){

            var currentY = this.scroller.scrollTop();
            var max = this.body.height() - this.parent.height();
            var at_max = ( max > 0 && currentY + 1 >= max ); // allow rounding fuzzyiness

            if( y > max  )
                y = max;

            if( y < 0 )
                y = 0;

            this.scroller.stop();

            if( y == currentY ){
                return false;
            }

            if( duration ){
                var self = this;
                this._scrollY = y;
                this.scroller.animate({
                    scrollLeft : x,
                    scrollTop : y
                }, duration, function () {
                    self._scrollY = null;
                });
                this.render(duration);
                return false;
            }

            if( y ) {
                this.scroller.scrollLeft(x);
                this.scroller.scrollTop(y);
                this.render();
                return true;
            }
        },

        throttledRender : function (duration) {
            if( this._delay )
                clearTimeout(this._delay);

            if( duration == null )
                duration = this.config.knobAnimateMs;

            var self = this;
            this._delay = setTimeout( function () {
                self._delay = null;
                self.render(duration);
            }, 0);
        },

        render: function (duration) {

            // ff 11 crashes without second check if this.body isn't visible (or part of dom yet)
            if( ! this.body || ! this.body.is(":visible")) {
                return;
            }

            if( this.config.disabled )
                return;

            var bh = this.body.height();
            var ph = this.parent.height();


            var kh =  Math.min( ph - ( (bh - ph) / bh * ph ), ph);

            if( kh < this.config.minHeight || this.config.fixedHeight )
                kh = this.config.minHeight;

            var y = (this._scrollY != null) ? this._scrollY : this.scroller.scrollTop();
            var perY = y /  ( bh - ph );
            var knobY = (ph - kh) * perY;

            // don't trigger animations if we haven't changed
            var cacheHeight = knobY + kh;
            if(  this._cacheHeight == cacheHeight ){
                return;
            }
            this._cacheHeight = cacheHeight;

            this.knob
                .toggle( kh < ph );

            if( duration ){
                this.knob.stop().animate({
                    height : kh,
                    top : knobY
                }, duration)
            }
            else {
                this.knob.stop()
                    .height(kh)
                    .css('top', knobY);
            }
        },

        onResize : function () {
            if( this.config.listenChanges )
                this.throttledRender();
        },

        onTouchStart : function (e) {
            this.touching = {
                lastX : this.scroller.scrollLeft(),
                lastY : this.scroller.scrollTop()
            };

            this.touching.x = eventX(e) + this.touching.lastX;
            this.touching.y = eventY(e) + this.touching.lastY;

            $(document)
                .bind("mousemove touchmove", this._touchMove )
                .bind("mouseup touchend", this._touchStop );

            if( this.config.inertial ) {
                var self = this;
                this.inertiaInterval = setInterval( function() {
                    self.onInertiaUpdate();
                },30);
            }
        },

        onInertiaUpdate : function () {
            this.inertiaY = this.inertiaY * .9;

            if( this.touching ) {
                return;
            }

            if( this.inertiaY < 1 )
                clearInterval( this.inertiaInterval );

            this.scrollBy(0, this.inertiaY);
        },

        onTouchStop : function (e) {

            $(document)
                .unbind("mousemove touchmove", this._touchMove )
                .unbind("mouseup touchend", this._touchStop );
            this.touching = null;


        },

        onTouchMove : function (e) {
            var x = (eventX(e) - this.touching.x) * -1;
            var y = (eventY(e) - this.touching.y) * -1;

            this.inertiaY += y - this.touching.lastY;

            this.touching.lastX = x;
            this.touching.lastY = y;


            if(  this.scrollTo(x, y) ){
                e.stopPropagation();
                e.preventDefault();
            }
        },

        onKnobStart : function (e, inverse) {
            this.scroller.stop();

            this.dragging = {
                x : eventX(e) - this.knob.position().left,
                y : eventY(e) -  this.knob.position().top
            };

            $(document)
                .bind("mousemove touchmove", this._knobMove )
                .bind("mouseup touchend", this._knobStop );

            e.stopPropagation();
            e.preventDefault();
        },

        onKnobStop : function (e) {
            $(document)
                .unbind("mousemove touchmove", this._knobMove )
                .unbind("mouseup touchend", this._knobStop );
            this.dragging = null;

        },

        onKnobMove : function (e) {
            var x = (eventX(e) - this.dragging.x);
            var y = (eventY(e) - this.dragging.y);


            var bh = this.body.height();
            var ph = this.parent.height();
            var kh = this.knob.height();

            var perY = y / (ph - kh);
            this.scrollTo(x, perY * (bh -ph) );
        }

    };

    if( ! window.MetaPlayer )
        window.MetaPlayer = {};

    MetaPlayer.scrollbar = function (target, options) {
        return new ScrollBar(target, options);
    };

})();

(function () {
    var $ = jQuery;

    var Timer = function (delay, count) {
        if( ! (this instanceof Timer ) )
            return new Timer(delay, count);

        var self = this;
        MetaPlayer.dispatcher(this);
        this.delay = delay;
        this.count = count || -1;
        this._counted = 0;
        this._onTimeout = function () {
            self._counted++;
            self.dispatcher.dispatch('time', {
                count : self._counted,
                remain : self.count - self._counted
            });
            if( self.count > 0 && self.count < self._counted + 1 ){
                self.reset();
                self.dispatcher.dispatch('complete');
            }
        };
    };

    MetaPlayer.timer = Timer;

    Timer.prototype = {
        reset : function () {
            this._counted = 0;
            this.stop();
        },

        stop : function () {
            clearInterval(this._interval);
            this._interval = null;
            this.running = null;

        },

        toggle : function () {
            if( this.running )
                this.stop();
            else
                this.start()

        },

        start : function () {
            if( this._interval )
                return;
            this.running = (new Date()).getTime();
            this._interval = setInterval(this._onTimeout, this.delay );
        }
    };


})();

(function () {

    var $ = jQuery;

    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.ui = {
        /**
         * Ensures that target's parentNode is it's offsetParent, creating a wrapping div if necessary.
         *  Returned box can be used to reliably position UI elements absolutely using top,left,etc.
         * @param target - a DOM node or jquery selector
         */
        ensureOffsetParent :  function ( target ) {
            target = $(target).first();
            var el = target[0];

            if( el.offsetParent === el.parentNode && el.offsetParent.offsetParent ) {
                return;
            }

            var wrap = $('<div></div>');
            wrap.css('position', 'relative');
            wrap.css('top', 0);
            wrap.css('left', 0);
            wrap.css('width', "100%");
            wrap.css('height', "100%");

            if( el.width )
                wrap.width(el.width);

            if( el.height )
                wrap.height(el.height);

            target.css('width', "100%");
            target.css('height', "100%");

            target.parent().append(wrap);
            wrap.append(target);
        }
    };
})();
(function () {

    var $ = jQuery;

/*
From MP2:
 defaultTrackEvents : {"onBegin"  : {label: "Begin",  type: "clip", track: false},
 "onFinish" : {label: "Finish", type: "clip", track: true},
 "onPause"  : {label: "Pause",  type: "clip", track: true},
 "onResume" : {label: "Play",   type: "clip", track: true},
 "onSeek"   : {label: "Seek",   type: "clip", track: true},
 "onStart"  : {label: "Start",  type: "clip", track: true},
 "onStop"   : {label: "Stop",   type: "clip", track: true},
 "onMute"   : {label: "Mute",   type: "player", track: true},
 "onUnmute" : {label: "Unmute", type: "player", track: true},
 "onFullscreen"     : {label: "Fullscreen",      type: "player", track: true},
 "onFullscreenExit" : {label: "Fullscreen exit", type: "player", track: true},
 "onCaptionsOn"  : {label: "Captions on",  type: "custom", track: true},
 "onCaptionsOff" : {label: "Captions off", type: "custom", track: true},
 "onReplay"      : {label: "Replay", type: "custom", track: true},
 "onUpNextClick" : {label: "UpNextClick", type: "custom", track: true},
 "onShare"       : {label: "Share",  type: "custom", track: true},      // twitter/fb/etc
 "onSearch"      : {label: "Search", type: "custom", track: true},      // search term
 "onSearchResultClick" : {label: "SearchResultClick", type: "custom", track: true}, // (search term, result position)
 "onTagClick"    : {label: "TagClick", type: "custom", track: true},  //  (tag type, tag value, position)
 "onQCardAdd"    : {label: "QCardAdd", type: "custom", track: true},  // (term,ts,target area, card-id)
 "onQCardUserHover" : {label: "QCardUserHover", type: "custom", track: true}, // (term,ts,target area, card-id)
 "onQCardDisplay"   : {label: "QCardDisplay",   type: "custom", track: true}, // (term,ts,target area, card-id)
 "onQCardUserClick" : {label: "QCardUserClick", type: "custom", track: true}  // (term,ts,target area, card-id)
 },
 */

    var Adapter = function (player, gaTracker) {

        if( ! (this instanceof Adapter) )
            return new Adapter(player, gaTracker);

        this.player = player;
        this.gat = gaTracker;
        this.addListeners();
        this.init();
    };



    MetaPlayer.addPlugin("gat", function (gaTracker) {
        this.gat = Adapter(this, gaTracker  );
    });

    Adapter.prototype = {
        init : function () {
            this.hasPlayed = false;
            this.muted = this.player.video.muted;
        },

        addListeners : function () {
            var v = this.player.video;

            v.addEventListener("loadstart", this._bind( function () {
                this.hasPlayed = false;
                this._track("Begin");
            }));

            v.addEventListener("playing", this._bind( function () {
                if( this.hasPlayed ) {
                    this._track("Resume");
                    return;
                }
                this.hasPlayed = true;
                this._track("Start");
            }));

            v.addEventListener("volumechange", this._bind( function () {
                var muted = this.player.video.muted || (this.player.video.volume == 0);

                if( this.muted !=  muted ) {
                    if( this.muted )
                        this._track("Unmute");
                    else
                        this._track("Mute");
                    this.muted = muted;
                }
            }));

            v.addEventListener("ended", this._bind( this._track, "Finish") );
            v.addEventListener("pause", this._bind( this._track, "Pause") );
            v.addEventListener("seeked", this._bind( this._track, "Seek") );


            var l = this.player.layout;
            if( l.addEventListener ) { // backwards compatibility
                l.addEventListener("maximize", this._bind( this._track, "Fullscreen") );
                l.addEventListener("restore", this._bind( this._track, "Fullscreen exit") );
            }

            var c = this.player.cues;
            c.addEventListener("enable", this._bind( function (e) {
                if( e.action = "captions")
                    this._track("onCaptionsOn");
            }));
            c.addEventListener("disable", this._bind( function (e) {
                if( e.action = "captions")
                    this._track("onCaptionsOff");
            }));
        },

        _track : function (action, data, time) {
            if( ! time )
                time = this.player.video.currentTime;
            this.gat._trackEvent("Videos", action, data, Math.round(time) );
        },

        _bind : function (callback) {
            var args =  Array.prototype.slice.call(arguments, 1);
            var self = this;
            return function () {
                return callback.apply(self, args.length ? args : arguments);
            }
        }
    };

    MetaPlayer.Metrics.GAT = Adapter;
})();
(function () {

    var $ = jQuery;

    /**
     * @name Metrics.SiteCatalyst
     * @constructor
     * @class SiteCatalyst integration for HTML5
     * @param {Video} video The html5 video element to be tracked.
     * @param {SiteCatalyst} s The "s" global variable provided by SiteCatalyst's s_code.js
     * @param {String} mediaName The title of the current video
     * @param {String} [playerName] The current player identifier. Defaults to "metaplayer".
     * @requires s_code.js
     * @example
     *     sc = MetaPlayer.Metrics.SiteCatalyst("#video", s, "Test Video");
     * @see MetaPlayer#sitecatalyst
     */

    var SiteCatalyst = function (video, s, mediaName, playerName) {

        if( ! (this instanceof SiteCatalyst) )
            return new SiteCatalyst(video, s, mediaName, playerName);

        /**
         * @name mediaName
         * @type String
         * @description The title of the current video
         */
        this.playerName = playerName || "metaplayer";
        this.mediaName = mediaName ? mediaName.replace(/\s*$/, "").replace(/\s/g, "+") : "";
        this.video = $(video);
        this.s = s;


        var self = this;
        this.video.bind("durationchange play pause seeking seeked ended", function (e) {
            self._handleMediaEvent(e);
        });
    };

    /**
     * @name MetaPlayer#sitecatalyst
     * @function
     * @description MetaPlayer plugin for SiteCatalyst
     * @param {SiteCatalyst} s The "s" global variable provided by SiteCatalyst's s_code.js
     * @param {String} [title] The title to use for reporting. Defaults to {@link MetaData} title.
     * @example
     * MetaPlayer(video)
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .sitecatalyst(s)
     *       .load();
     * @see Metrics.SiteCatalyst
     */
    MetaPlayer.addPlugin("sitecatalyst", function (s, title, playerName) {
        var sc = SiteCatalyst(this.video, s, title, playerName);
        this.metadata.addEventListener("data", function(e){
            this.opened = false;
            if(e.data.title)
                sc.mediaName = e.data.title.replace(/\s*$/, "").replace(/\s/g, "+");
        })
    });

    SiteCatalyst.prototype = {

        _handleMediaEvent : function (e) {
            var m = this.s.Media,
                v = this.video.get(0),
                n = this.mediaName,
                d = Math.round(v.duration),
                t = Math.round(v.currentTime),
                p = v.paused;

            if( ! d )
                return;

            // if not opened or opening event, skip
            if( !( this.opened || e.type.match(/^(play|durationchange)$/) ) ){
                return;
            }

            // open media handle as necessary
            if( ! this.opened ) {
                MetaPlayer.log("sitecatalyst", e.type, "open", n, 0, this.playerName);
                m.open(n, d, this.playerName);
                this.opened = true;
            }

            switch (e.type) {
                case "durationchange":
                    MetaPlayer.log("sitecatalyst", e.type, "play", n, 0);
                    m.play(n, 0);
                    break;

                case "play":
                    MetaPlayer.log("sitecatalyst", e.type, "play", n, t);
                    m.play(n, t);
                    break;

                case "pause":
                    MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                    m.stop(n, t);
                    break;

                case "seeking":
                    // throttle seeking events if already stopped
                    if( !(this.seeking || p ) ) {
                        MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                        m.stop(n, t);
                    }
                    this.seeking = true;
                    break;

                case "seeked":
                    if( ! this.seeking )
                        return;
                    this.seeking = false;
                    if( !p ){
                        MetaPlayer.log("sitecatalyst", e.type, "play", n, t);
                        m.play(n, t);
                    }
                    break;

                case "ended":
                    MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                    m.stop(n, t);
                    MetaPlayer.log("sitecatalyst", e.type, "close", n);
                    m.close(n);
                    this.opened = false;
                    break;
            }
        }

    };

    MetaPlayer.Metrics.SiteCatalyst = SiteCatalyst;
})();
(function() {
    var $ = jQuery;

    var defaults = {
        autoplay: false,
        preload: true,
        loop: false,
        updateMsec: 500,
        playerVars: {
        }
    };

    var BrightcovePlayer = function(experienceID, options) {

        this.config = $.extend(true, {}, defaults, options);

        /* Brightcove Values */
        this.experienceID = experienceID;

        /* HTML5 specific attributes */
        
        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        this._duration = NaN;
        this._paused = true;
        this._ended = false;
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        //this.defaultPlaybackRate = 1; Supported?
        //this.playbackRate = 1; Supported?
        //this.seekable = {}; Supported?
        //this.buffered = {}; Supported?
        //this.played = {}; Supported?

        // Ot_her Player Attributes
        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        //this.networkState;
        //this.error;

        // Grab config parameters
        this._autobuffer = this.config.autobuffer;
        this._autoplay = this.config.autoplay;
        this._preload = this.config.preload;
        this._loop = this.config.loop;


        MetaPlayer.dispatcher( this );


        var objectElement = $("#"+experienceID);
        this.container = objectElement.get(0);
        this.video = MetaPlayer.proxy.proxyPlayer(this, this.container);

        this.initCheck()
    };

    MetaPlayer.Players.Brightcove = function ( bcExperienceId ) {
        if( ! window.brightcove )
            return;

        var bc_object = document.getElementById(bcExperienceId);
        if( ! bc_object || bc_object.getAttribute("class") == "BrightcoveExperience" )
            return;

        return MetaPlayer.brightcove(bcExperienceId);
    };

    MetaPlayer.addPlayer("brightcove", function (bc, options) {
        // single arg form
        if ( ! options && bc instanceof Object) {
            options = bc;
            bc = null;
        }

        if ( ! options ) {
            options = {};
        }

        if ( ! bc ) {
            bc = $("<div></div>")
                .prependTo(this.layout.base);
        }

        var bCove = new BrightcovePlayer(bc, options);
        this.video = bCove.video;
        this.brightcove = bCove;
    });

    MetaPlayer.brightcove = function (bcExperienceId, options) {
        var bCove = new BrightcovePlayer(bcExperienceId);
        return bCove.video;
    };

    BrightcovePlayer.prototype =  {
        initCheck : function () {
            MetaPlayer.log("brightcove", "initcheck...")
            var self = this;
            if( brightcove.api && brightcove.internal._instances[this.experienceID] ) {
                try {
                    this.brightcovePlayer = brightcove.api.getExperience(this.experienceID);
                    this.brightcoveVideoPlayer = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                    this.addListeners();
                    MetaPlayer.log("brightcove", "initcheck ok")
                    clearInterval( this._readyInterval );
                    self.init();

                }
                catch(e){}
            }
            else if( ! this._readyInterval ) {
                MetaPlayer.log("brightcove", "initcheck start interval")
                this._readyInterval = setInterval( function (e) {
                    self.initCheck();
                }, 250);
            }
        },
        init : function() {
            try {
            this.brightcovePlayer = brightcove.api.getExperience(this.experienceID);
            this.brightcoveVideoPlayer = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
            } catch(e){
                debugger;
            }
            this.addListeners();
            this.startVideo();
        },

        isReady : function() {
            return this.brightcovePlayer;
        },

        addListeners : function() {
            var bcvp = this.brightcoveVideoPlayer;
            var self = this;

            bcvp.addEventListener("mediaBegin", function(e) {
                self.onMediaBegin(e);
            });

            bcvp.addEventListener("mediaChange", function(e) {
                self.onMediaChange(e);
            });

            bcvp.addEventListener("mediaComplete", function(e) {
                self.onMediaComplete(e);
            });

            bcvp.addEventListener("mediaError", function(e) {
                self.onMediaError(e);
            });

            bcvp.addEventListener("mediaPlay", function(e) {
                self.onMediaPlay(e);
            });

            bcvp.addEventListener("mediaProgress", function(e) {
                self.onMediaProgress(e);
            });

            bcvp.addEventListener("mediaSeekNotify", function(e) {
                self.onMediaSeekNotify(e);
            });

            bcvp.addEventListener("mediaStop", function(e) {
                self.onMediaStop(e);
            });
        },


        onMediaChange : function(e) {
            this._src = e.media.id;
            this._duration = e.duration / 1000;
            this._currentTime = 0;
            this._seekOnPlay = null;
            this._hasBegun = false;


            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
            this._readyState = 4;
            this.dispatch("canplay");
            this.dispatch('loadedmetadata');
            this.dispatch('loadeddata');
            this.dispatch("durationchange");
        },

        onMediaComplete : function(e) {
            this._ended = true;
            this._paused = true;
            var self = this;
            // re-entry problems
            setTimeout( function () {
                self.dispatch("ended");
            }, 0);
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function(e) {
            this._ended = false;
            this._paused = false;
            this._hasBegun = true;

            this._currentTime = e.position;

            var self = this;
            // brightcove has re-entry problems if seek is called during play event
            setTimeout( function () {
                self.dispatch("play");
                self.dispatch("playing");
            },250);
        },

        onMediaBegin : function(e) {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            var update = e.position - this._currentTime;
            if( isNaN(update) || update > .2 ) {
             // throttle to no more than 5/sec, BC seems to do about 25/sec
                this._currentTime = e.position;
                this.dispatch("timeupdate");
            }

            // onBegin is too soon to seek (it gets ignored), so we do it here
            if( this._seekOnPlay )
                this.doSeek(this._seekOnPlay )
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            this._currentTime = e.position;
        },

        onMediaStop : function(e) {
            if (this._duration == e.position) {
                // handled at onMediaComplete
                //this._paused = false;
                //this._ended = true;
                //this.dispatch("ended");
                
            }
            else {
                this._paused = true;
                this._ended = false;
                this.dispatch("pause");
                
            }
        },

        startVideo : function() {
            if ( ! this.isReady()) {
                return;
            }

            if ( this._preload == "none")
                return;

            if( this._ended )
                this.currentTime(0);

            this._ended = false;
            this.muted( this._muted );

            var src = this._src;
            if ( !src ) {
                return;
            }

            this.dispatch("loadstart");

            // "http://link.brightcove.com/services/link/bcpid1745093542/bclid1612710147/bctid1697210143001?src=mrss"
            var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            if( longForm )
                src = parseInt( longForm[1] );

            if (this._autoplay)
                this.brightcoveVideoPlayer.loadVideoByID(src);
            else
                this.brightcoveVideoPlayer.cueVideoByID(src);
        },

        doSeek : function(time) {
            this._currentTime = time;

            if(! this._hasBegun ){
                this._seekOnPlay = time;
            }

            this._seeking = true;
            this._seekOnPlay = null;
            this.dispatch("seeking");
            this.brightcoveVideoPlayer.seek(time);

            // onMediaSeekNotify callback doesn't fire when
            // programmatically seeking

            var self = this;
            setTimeout(function () {
                self._currentTime = time;
                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500);
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._preload = "auto";
            this._autoplay = true;

            if( this._readyState == 4 )
                this.brightcoveVideoPlayer.play();
            else
                this.startVideo();
        },

        pause : function() {
            this.isReady() && this.brightcoveVideoPlayer.pause();
        },

        canPlayType : function( type) {
            MetaPlayer.log("brightcove", "canPlayType?", type)
            return Boolean  ( type.match(/\/brightcove$/ ) );
        },

        paused : function() {
            return this._paused;
        },

        duration : function() {
            return this._duration;
        },

        seeking : function() {
            return this._seeking;
        },

        ended : function() {
            if ( ! this.isReady() ) {
                return false;
            }
            return this._ended;
        },

        currentTime: function(val) {
            if (! this.isReady() ) {
                this._currentTime = val || 0;
                return 0;
            }
            if ( val !== undefined ) {
                this._ended = false;
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val !== undefined ) {
                this._muted = val;
                if ( ! this.isReady() ) {
                    return val;
                }
                // note: BC does not have a documented mute api
                this.brightcoveVideoPlayer._callMethod("mute", [ Boolean(val) ]);
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {
            if ( val !== undefined ) {
                this._volume = val;
                if ( ! this.isReady() ) {
                    return val;
                }
                // note: BC does not have a documented volume api
                this.brightcoveVideoPlayer._callMethod("setVolume", [ val ]);
                this.dispatch("volumechange");
            }
            return this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
                this._readyState = 0;
                this._duration = NaN;
                this._currentTime = 0;
                this.startVideo();
            }
            return this._src;
        },

        autoplay : function ( val ) {
            if( val != null)
                this._autoplay = Boolean(val);
            return this._autoplay;
        },

        preload : function ( val ) {
            if( val != null)
                this._preload = val;
            return this._preload;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();(function () {

    /* FlowPlayer HTML5 Adapter and MPF Playlist API

     - FlowPlayer has many re-entry issues, where calling a method within an event handler causes exceptions,
     so the _async() method gets around this by wrapping the handler with a setTimout of 0.

     - Additionally, there is no way to change tracks without playing, and startBuffering is an unsupported API.
     Buffering is achieved through play() pause() combinations, but calling them in rapid succession causes further
     race conditions.
     */


    var $ = jQuery;
    var $f = window.flowplayer;

    var defaults = {
        updateIntervalMsec : 500,
        seekDetectSec : 1.5
    };

    var log = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift("flowplayer");
        MetaPlayer.log.apply(null, args);
    };

    var FlowPlayer = function (el, options){

        if( !(this instanceof FlowPlayer ))
            return new FlowPlayer(el, options);

        this._readyState = 0;
        this._preload = "auto";
        this._autoplay = false;
        this._duration = NaN;
        this._currentTime = 0;
        this._paused = true;
        this._ended = false;
        this._seeking = false;
        this._muted = false;
        this._volume = 1;
        this._buffered = false;
        this._controls = true;


        this._index = null;
        this._autoAdvance = true;
        this._loop = false;
        this._flowplayer = el;
        this.ad = false;

        this._hasFiredBegin = {};

        // we can make the assumption here that if there's a playlist, the current item will be the first one
        if ( this._flowplayer.getPlaylist() && this._flowplayer.getPlaylist()[0] && this._flowplayer.getPlaylist()[0].url ) {
            this._src = this._flowplayer.getPlaylist()[0].url;
        }

        this.config = $.extend(true, {}, defaults, options);
        this.dispatcher = MetaPlayer.dispatcher(this);

        this.video = MetaPlayer.proxy.proxyPlayer(this, this._flowplayer.getParent());

        // flowplayer-driven playlist if it arrives with content, else mpf-driven
        if( this.getPlaylist().length )
            MetaPlayer.Playlist.proxy(this, this.video);

        this._timeupdater = MetaPlayer.timer( this.config.updateIntervalMsec );
        this._timeupdater.listen('time', this._onTime, this);

        this._init();
    };

    MetaPlayer.Players.FlowPlayer = function (media) {
        if( ! (media.getCommonClip instanceof Function) )
            return null;
        return FlowPlayer(media).video;
    };

    MetaPlayer.flowplayer = function ( media ) {
        return MetaPlayer.Players.FlowPlayer(media);
    };


    FlowPlayer._isAd = function ( clip ){
        return (clip.isCommon || clip.ovaAd || clip.isInStream || ! clip.url);
    };

    FlowPlayer.prototype = {

        _init: function (fp){
            this._hlsplugin = (this._flowplayer.getPlugin('httpstreaming') != null);
            this._youtube = (this._flowplayer.getPlugin('youtube') != null);

            if( this._flowplayer.isLoaded() )
                this._onLoad();
            else {
                this._flowplayer.onLoad( this._async(this._onLoad) );
            }
        },

        _onLoad : function () {
            log('fp: onLoad()', this.volume() );

            // fires twice on ipad
            if( this._onLoadFired )
                return;
            this._onLoadFired = true;

            // Player listeners
            var fp = this._flowplayer;

            fp.onVolume( this._bind( function() {
                log('fp: onVolume()');
                this._volume = this._flowplayer.getVolume() / 100;
                this.dispatch("volumechange");
            }));

            fp.onMute( this._bind( function () {
                log('fp: onMute()');
                this._muted = true;
                this.dispatch("volumechange");
            }));

            fp.onUnmute( this._bind( function () {
                log('fp: onUnmute()', this._readyPlaying);
                this._muted = false;
                this.dispatch("volumechange");
            }));

            fp.onPlaylistReplace( this._async( function () {
                log('fp: onPlaylistReplace()');
                this._index = null;
                this._addPlaylistListeners();
            }));

            fp.onClipAdd( this._async( function (clip) {
                log('fp: onClipAdd()');
                this._addClipListeners(clip);
                this.dispatch("playlistchange");
            }));

            if( this._playlist )
                this.setPlaylist( this._playlist );
            else
                this._addPlaylistListeners();

            if( this._loadSrc  )
                this._setItem(this._loadSrc);

            this.volume( this._volume );
            this.controls( this._controls );

        },

        _addPlaylistListeners : function (  ) {
            $.each( this._flowplayer.getPlaylist(), this._bind( function (i, clip) {
                this._addClipListeners(clip);
            }));
            this.dispatch("playlistchange");
        },

        _addClipListeners : function (clip) {
            if( ! clip )
                return;

            var onBegin = this._bind( function (clip) {
                log('fp: on*Begin() ', this._index, clip.index, clip.url, this.ad);

                // only fire once for a video
                if( this._hasFiredBegin[ clip.url ] ) {
                    log('fp: on*Begin() skip', this._index, clip.index, clip.url, this.ad);
                    return;
                }

                this._hasFiredBegin[ clip.url ] = true;

                this._timeupdater.reset();

                var idx = this._getIndexByClip(clip);
                if( idx != this._index ) {
                    this._doTrackChange( idx );
                    this.dispatch("loadstart");
                }

                if( FlowPlayer._isAd(clip) ){
                    if( ! this.ad ) {
                        this.ad = true;
                        this.dispatch("adstart");
                    }
                }
                else if( this.ad ) {
                    this.ad = false;
                    this.dispatch("adstop");
                }


                this._currentTime = 0;
                this._paused = false;
                this._src = clip.url;

                if( this._ended ) {
                    this._ended = false;
                    this.dispatch("play"); // per spec, only after pause event. but whatever --catches play after end
                }

                this.dispatch("playing"); // on any playback start
                this._timeupdater.start();
            });

            // with OVA, some ads only fire one of the other
            clip.onBeforeBegin( onBegin );
            clip.onBegin( onBegin );

            clip.onUpdate( this._async( function (clip){
                log("fp: onUpdate", clip.index, this._index, this._paused, clip.url);
                if(! this._paused ) {
                    this._flowplayer.stopBuffering();
                    this._flowplayer.play();
                }
            }));

            clip.onBufferFull( this._async( function (clip){
                log("fp: onBufferFull");
                this._buffered = true;
                if( MetaPlayer.iOS )
                    this.play();
            }));

            clip.onBufferEmpty( this._async( function (clip){
                log("fp: onBufferEmpty");
                this._buffered = true;
            }));

            clip.onBufferStop( this._async( function (clip){
                log("fp: onBufferStop");
                this._buffered = true;
            }));

            clip.onStart( this._async( function (clip) {
                // note: doesn't always fire with flash player
                log('fp: onStart()', this._readyState );
                // ipad controls can't be hidden until after playing
                if(  MetaPlayer.iOS && ! this._hasPlayed ){
                    this._hasPlayed = true;
                    this._setHTML5Controls(false);
                }
            }));

            clip.onStop( this._async( function (clip) {
                log('fp: onStop()');
            }));

            clip.onBeforeFinish( this._bind( function (clip) {
                log('fp: onBeforeFinish() ', this._autoAdvance);
            }));

            clip.onFinish( this._bind( function (clip) {
                log('fp: onFinish()');
                this._hasFiredBegin[ clip.url ] = undefined;
                this._paused = true;
                this._ended = true;
                if( ! this.ad ) {
                    this._delay( function () {
                        this.dispatchIfClip("ended");
                    });
                } else {
                    var self = this;
                    setTimeout( function() {
                        self.ad = false;
                        self.dispatch("adstop");
                    }, 1000);
                }

                if(! this._autoAdvance && ! this.ad) {
                    this._flowplayer.pause();
                }
                return false; // ipad adapter listens for this because above pause() doesn't work
            }));

            clip.onPause( this._async( function (clip) {
                log('fp: onPause() ' , this._flowplayer.isPaused(), this._flowplayer.isPlaying() );
            }));

            clip.onResume( this._async( function (clip) {
                log('fp: onResume()');
                this._paused = false;
                this._ended = false;

                this.dispatch("play"); // per spec, only after pause event
                this.dispatch("playing"); // on any playback start
            }));

            clip.onBeforeSeek( this._async(function (clip) {
                log('fp: onBeforeSeek()');
                this._seeking = true;
                this.dispatch("seeking");
            }));

            clip.onSeek( this._async( function (clip) {
                log('fp: onSeek()');
                // detected by timeupdate for more robustness, seeks during pauses
            }));
        },

        _setItem : function (src) {
            var data = this._createClipData(src);

            var fp = this._flowplayer;
            fp.setPlaylist([ data ]);

            if( this._preload != "none" )
                this.load();
        },

        _onTime : function () {
            if(! this._flowplayer.isLoaded() ) {
                return;
            }

            var c = this._flowplayer.getClip();
            if( ! c) {
                return;
            }

            var status = this._flowplayer.getStatus(); // expensive
            var old = this._currentTime;
            var delta = status.time - this._currentTime;
            var seeked = false;

            if( this._paused && Math.abs(delta) > this.config.seekDetectSec ) {
                seeked = true;
            }

            // a seek is defined as a positive delta > threshold or a negative delta
            if( (Math.abs(delta) > this.config.seekDetectSec) || ( delta < 0) ){
                seeked = true;
            }

            if( delta ) {
                this._currentTime = status.time;
                this.dispatchIfClip("timeupdate");
            }

            if( seeked ) {
                this._seeking = false;
                this.dispatchIfClip("seeked");

                if ( !this._paused ) {
                    this.dispatch("playing");
                }
            }

//            log('fp: _onTime duration check', status.time, c, c.duration, status);
            if(! this.ad &&  isNaN(this._duration) && status.time > 0) {
                // if status.time == 0, then there's a good chance a pause() fired now event will fail
                if( c && c.duration > 0 ){
                    this._duration = c.duration;
                    this.dispatch("durationchange");
                }
            }

            if( this._readyState != 4 && (this._preload != "none" || this._autoplay) ){
                log('fp: _onTime _readyState check', this._readyState, this._buffered, status.time, c.duration, status);

                var fp = this._flowplayer;

                // we don't have metadata and need to play to get it
                if( this._readyState == 0 && !(this._duration && this._buffered) && this._paused  && ! this._error  ) {
                    // removed: FP doesn't like play() called before onBegin
                    log('fp: _onTime play() get metadata', this._duration, this._buffered);
                    this._paused = false;
                    fp.play();
                    this._readyState = 1;
                    return;
                }

                // we have metadata, but need to check the play state to know if we're ready
                if( this._buffered) {
                    if( this._autoplay ) {
                        if( ! this._paused && fp.isPlaying()) {
                            this._doClipReady();
                        }
                        else {
                            log('fp: _onTime play() autoplay=true');
                            this._paused = false;
                            fp.play();
                        }
                    }
                    else { // if not autoplay
                        if( fp.isPlaying() ) {
                            log('fp: _onTime play() autoplay=false', this._autoplay);
                            this.pause();
                        }
                        else {
                            this._doClipReady();
                        }
                    }
                }
            }

        },

        _doClipReady : function () {
            this._readyState = 4;
            var wasPaused = this._paused;
            this._paused = true;
            this.dispatchIfClip("loadedmetadata");
            this.dispatchIfClip("loadeddata");
            this.dispatchIfClip("canplay");
            this._paused = wasPaused;

        },

        // only return non-ad items
        _getFilteredPlaylist : function () {
            return $.map( this._flowplayer.getPlaylist(), function (clip){
                if( FlowPlayer._isAd(clip) )
                    return null;
                return clip;
            });
        },

        _doTrackChange : function (index, force) {
            this._index = index;
            this._seeking = false;
            this._readyState = 0;
            this._currentTime = 0;
            this._duration = NaN;
            this._buffered = false;
            this._ended = false;
            this.dispatch("trackchange");
        },

        /* Media Interface */

        load : function () {
            log("load()");
            this._preload = "auto";
            if( this._readyState == 4 )
                return;

            var fp = this._flowplayer;
            log("load : fpplay() ", this._readyState );
            this._paused = false;
            fp.play();
        },

        play : function () {
            this._autoplay = true;
            this._paused = false;
            if( this._ended ) {
                this._flowplayer.stop();
                this._delay( this._bind( function () {
                    var fp_idx = this._flowplayer.getClip().index;
                    log("play fp.play() ", fp_idx);
                    this._flowplayer.play(fp_idx);

                }));
            }
            else if( this._readyState == 4 ){
                log("play fp.play() ", this._readyState );
                this._flowplayer.play();
            }
            else
                this.load();
        },

        pause : function () {
            log("pause()");
            this._paused = true;
            this._flowplayer.pause();
            this.dispatch("pause");
        },

        src : function (val) {
            var loaded = this._flowplayer.isLoaded();
            if( val != null ) {
                if( loaded )
                    this._setItem( val );
                else
                    this._loadSrc = val;
            }
            return this._src;
        },

        readyState : function (val) {
            return this._readyState;
        },

        currentTime : function (val) {
            if( this.ad )
                return 0;

            if( val != null ) {
                if( val < 0 )
                    val = 0;
                log("currentTime fp.seek", val);
                this._flowplayer.seek(val);
            }
            return this._currentTime;
        },

        duration : function () {
            return this._duration;
        },

        seeking : function () {
            return this._seeking;
        },

        preload : function (val) {
            if( val != null )
                this._preload = val;
            return this._preload;
        },

        autoplay: function (val) {
            if( val != null )
                this._autoplay = val;
            return this._autoplay;
        },

        paused : function () {
            return Boolean( this._paused );
        },

        muted : function (val) {
            if( val !== undefined ) {
                if( val )
                    this._flowplayer.mute();
                else
                    this._flowplayer.unmute();
            }
            return this._muted;
        },

        controls : function (val) {
            if( val != null )
                this._controls = val;

            if( MetaPlayer.iOS ){
                if (! this._hasPlayed ) {
                    this._setHTML5Controls( true );
                    return;
                }
                else {
                    this._setHTML5Controls( false );
                }
            }

            if( ! this._flowplayer.isLoaded() )
                return;

            var controls = this._flowplayer.getPlugin("controls");
            var playBtn =  this._flowplayer.getPlugin("play");

            if ( val ) {
                controls && ( controls.show() );
                playBtn && playBtn.show();
            }
            else {
                controls && ( controls.hide() );
                playBtn && playBtn.hide();
            }

            return this._controls;
        },

        ended : function () {
            return this._ended;
        },

        volume : function (val) {
            if( val !== undefined ) {
                this._flowplayer.setVolume(val * 100);
            }
            return this._flowplayer.getVolume() / 100;
        },

        canPlayType : function (type) {
            var canPlay = null;

            // html5 / ipad
            if( window.flashembed.__replaced ) {
                if( ! this._video )
                    this._video = document.createElement('video');

                // just accept m3u8
                if( MetaPlayer.iOS && type.match(/mpegurl|m3u8/i)  ) {
                    canPlay = "probably";
                }
                else if( this._video.canPlayType )
                    canPlay = this._video.canPlayType(type);
            }

            else if( this._youtube && type.match(/youtube$/i) ) {
                canPlay = "probably";
            }

            else if( this._hlsplugin && type.match(/mpegurl|m3u8/i) ) {
                canPlay = "probably";
            }

            // fall through to flash
            else if( type.match( /mp4|flv|jpg/ ) ) {
                canPlay = "probably";
            }

            return canPlay;
        },

        /* Playlist  API */
        getPlaylist : function () {
            return $.map( this._getFilteredPlaylist(), function (clip){
                return clip.guid ||  clip.url;
            });
        },

        setPlaylist : function ( items, append ) {
            var pl = [];

            var fp = this._flowplayer;

            if( ! fp.isLoaded() ) {
                this._playlist = items;
                return;
            }

            if (! items.length )
                items = [ items ];

            var cl, i;
            for(i = 0; i<items.length; i++) {
                cl = this._createClipData(null, items[i]);
                if( append )
                    fp.addClip(cl);
                else
                    pl.push(cl);
            }

            this._playlist = null;
            this._index = null;

            fp.setPlaylist(pl);
        },

        _getIndexByClip : function ( clip ){
            var index = 0;
            $.each( this._getFilteredPlaylist(), function (i, c){
                if( c.index >= clip.index ) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        _getOffsetFromIndex : function ( playlist_idx ){
            var count = 0;
            var index = null;
            $.each( this._flowplayer.getPlaylist(), function (i, clip){
                if( playlist_idx == count ) {
                    index = i;
                    return false;
                }
                if(! FlowPlayer._isAd(clip) ){
                    count++;
                }
            });
            return index;
        },

        getIndex : function ( i ) {
            var pl = this.getPlaylist();

            if( i == null ) {
                return this._index;
            }

            if( i < 0  && this._loop)
                i = pl.length + i;

            if( !this._loop && (i >= pl.length || i < 0) ){
                return null;
            }

            return  i % pl.length;
        },

        setIndex : function (i) {

            if( i == null || isNaN(i) ) {
                return null;
            }

            var idx = this.getIndex(i);
            if( idx == null ) {
                // looping disabled or no change
                return false;
            }

//            this._doTrackChange(idx, true);
            var fp_idx = this._getOffsetFromIndex(idx);
            log("setIndex fp.play()", fp_idx);
            this._paused = false;
            this._flowplayer.play(fp_idx);

            return true;
        },

        getItem : function ( i ) {
            return this.getPlaylist()[ this.getIndex(i) ];
        },

        updateItem : function (uri, data) {
            // breaks VPAID ads
//            var c = this._flowplayer.getClip() || this._flowplayer.getClip(0);
//            if( c.url )
//                return;
//
//            var probably = [];
//            var maybe = [];
//            var self = this;
//            $.each(data.content, function (i, content) {
//                var canPlay = self.canPlayType(content.type);
//                if( ! canPlay )
//                    return;
//                if( canPlay == "probably" )
//                    probably.push(content.url);
//                else
//                    maybe.push(content.url);
//            });
//
//            var url = probably.shift() || maybe .shift();
//            var updated = this._createClipData(url, uri);
//            c.update( updated );
//
//            if( this._autoplay )
//                this.play()
//
//            if( this._preload && this._preload != "none" )
//                this.load()
        },

        autoAdvance : function (val) {
            if( val != null ) {
                this._autoAdvance = val;
            }

            return this._autoAdvance;
        },

        loop: function (val) {
            if( val != null ) {
                this._loop = val;
            }

            return this._loop;
        },

        next : function () {
            log("next()");
            return this.setIndex(this._index + 1);
        },

        previous : function () {
            log("previous()");
            return this.setIndex(this._index - 1);
        },

        // private

        _createClipData : function (src, guid) {
            // Create a clip data depending on a plugin
            var data = {};

            var config = this._flowplayer.getConfig();
            if ( !(src || guid) )
                return data;

            if ( this._youtube && src && src.match(/youtube\.com/i) ) {
                data.provider = "youtube";
                data.urlResolvers = 'youtube';
                var yid = src.match( /www.youtube.com\/(watch\?v=|v\/)([\w-]+)/ )[2];
                data.url = "api:" + yid;
            } else {
                data.url = src;
            }

            if( src.match(/\.m3u8$/) ){
                data.provider = "httpstreaming";
                data.urlResolvers = 'httpstreaming';
            }
            if( guid )
                data.guid = guid;

            data.autoPlay = false;
            data.autoBuffering = false;
            data.scaling = config.clip.scaling;
            return data;
        },

        _setHTML5Controls : function (bool) {
            var video = $(this._flowplayer.getParent() ).find('video').get(0);
            video && (video.controls = bool);
        },

        dispatchIfClip : function (type) {

            if( this.ad ){
                if(! type.match(/^time/))
                    log("skip e:", type );
                return;
            }

            if(! type.match(/^time/))
                log("e:", type );
            this.dispatch(type);
        },

        _delay : function (callback, delay) {
            if( delay == null) {
                delay = 0;
            }

            var bound = this._bind(callback);
            setTimeout(bound, delay);
        },

        _async : function (callback, delay){
            // ensures that the callback is fired after the current execution block finishes (preventing flash re-entry)
            if( delay == null) {
                delay = 0;
            }

            var self = this;
            return function () {
                var args = arguments;
                setTimeout( function () {
                    callback.apply(self, args);
                }, delay);
            };
        },

        _bind : function (callback){
            // convenience, reduces bugs relate to scope by allowing use of 'this'
            var self = this;
            return function () {
                return callback.apply(self, arguments);
            };
        }
    };


})();
/**
 * HTML5 MetaPlayer Adapter
 * Supports:  Media API, Playlist API
 * Since we already have an HTML5 Media interface, we just need to add the Playlist Read API.
 */

(function () {

    var $ = jQuery;

    var Html5Adapter = function (media) {

        if( typeof media == "string" ){
            media = $(media).get(0);
        }

        // is a media adapter
        if( ! (media && media.play && media.canPlayType) )
            return null;

        return media;
    };

    Html5Adapter.create = function (target) {
        var t = $(target);
        var video = $("<video></video>")
            .height( t.height() )
            .width( t.width() )
            .appendTo(t)
            .get(0);

        video.controls = true;
        return video;
    };

    MetaPlayer.Players.HTML5 = Html5Adapter;

    /* deprecated */

    MetaPlayer.html5 = function (target){
        return Html5Adapter.create(target);
    };

    MetaPlayer.addPlayer("html5", function (options) {
        this.video = Html5Adapter.create(this.layout.base);
    });


})();
(function() {

    var $ = jQuery;

    /**
     * @name Players.JWPlayer
     * @constructor
     * @param {JWPlayer} el A JWPlayer instance
     * @description Given a JWPlayer instance, returns an HTML5 MediaElement like
     * interface for standards compatibility.
     * @extends Util.ProxyPlayer
     * @example
     * var jwp = jwplayer('video').setup({
     *    flashplayer: "player.swf",
     *    autostart   : true,
     *    width: "100%",
     *    height: "100%"
     * });
     * var video = MetaPlayer.jwplayer(jwp);
     *
     * @see MetaPlayer.jwplayer
     * @see <div style="margin: 10px 0;">Live Example: </div>
     * <iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/ramp/XG495/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
     */

    var log = function() {
        if ( window.console ) {
            console.log.apply( console, arguments );
        }
    };

    var JWPlayer = function( jwp ) {
        if ( !( this instanceof JWPlayer ) ) {
            return new JWPlayer( jwp );
        }

        this._jwplayer = jwp;
        this._volume = 0;
        this._seeking = null;
        this._readyState = 0;
        this._ended = false;
        this._paused = true;
        this._duration = NaN;
        this._metadata = null;
        this._muted = false;
        this._started = false;
        this._currentTime = 0;
        this._src = "";

        this.dispatcher = MetaPlayer.dispatcher( this );
        this.video = MetaPlayer.proxy.proxyPlayer( this, this._jwplayer.container );
        MetaPlayer.Playlist.proxy( this, this.video );

        this._autoplay = this._jwplayer.config.autostart;
        this._preload = this._jwplayer.config.autobuffer;
        
        this._onLoad();
    };

    /**
     * @name MetaPlayer.jwplayer
     * @function
     * @param {JWPlayer} el A JWPlayer instance
     * @descriptions Given a JWPlayer instance, returns an HTML5 MediaElement like
     * interface for standards compatibility. Serves as an alias for <code>(new JWPlayer(el, options)).video</code>
     * @example
     * var jwp = jwplayer('video').setup({
     *    flashplayer: swf,
     *    autostart   : true,
     *    width: "100%",
     *    height: "100%"
     * });
     * var video = MetaPlayer.jwplayer(jwp);
     *
     * @see Players.JWPlayer
     * @see <a href="http://jsfiddle.net/ramp/XG495/">Live Example</a>
     */
    // MetaPlayer.jwplayer = function( jwp ) {
    //     var jwplayer = JWPlayer( jwp );
    //     return jwplayer.video;
    // };

    MetaPlayer.jwplayer = function( jwp ) {
        var jwplayer = JWPlayer( jwp );
        return jwplayer.video;
    };

    JWPlayer.prototype = {
        
        _onLoad: function() {
            
            var self = this,
                jwp = this._jwplayer;

            jwp.onBuffer(function( e ){
                //log( "Buffer", e );
                
                self._readyState = 4;
            });

            jwp.onBufferChange(function( e ) {
                ////log( "BufferChange", e );
            });

            jwp.onBufferFull(function( e ) {
                //log( "BufferFull", e );
            });

            jwp.onError(function( e ) {
                //log( "Error", e );
            });

            jwp.onFullscreen(function( e ) {
                //log( "FullScreen", e );
            });

            jwp.onMeta(function( e ) {
                //log( "Meta", e );
            });

            jwp.onMute(function( e ) {
                //log( "Mute", e );

                self._muted = e.mute;
            });

            jwp.onPlaylist(function( e ) {
                //log( "Playlist" , e);
            });

            jwp.onPlaylistItem(function( e ){
                //log( "PlaylistItem", e );

                var playlistItem = self._jwplayer.getPlaylistItem(e.index);
                self._src = playlistItem.sources[0].file;
                self._paused = true;

            });

            jwp.onBeforePlay(function( e ){
                //log( "BeforePlay", e );

                var waitForDuration = function( duration ) {
                    if ( duration == -1 ) {
                        setTimeout( function() {
                            waitForDuration( self._jwplayer.getDuration() );
                        }, 500 );
                        return;
                    }
                    else {
                        
                        self._paused = true;
                        self._duration = self._jwplayer.getDuration();
                        self._volume = self._jwplayer.getVolume();
                        self.dispatch('loadedmetadata');
                        self.dispatch("loadstart");
                        self.dispatch('loadeddata');
                        self._readyState = 4;
                        self.dispatch('canplay');
                        
                        self.dispatch("durationchange");
                    }
                };

                waitForDuration( self._jwplayer.getDuration() );
            });


            jwp.onPlay(function( e ){
                //log( "Play", e );

                self._paused = false;
                self.dispatch("play");
            });

            jwp.onPause(function( e ) {
                //log( "Pause", e );

                self.dispatch("pause");
                self._paused = true;
            });

            jwp.onSeek(function( e ) {
                //log( "Seek", e );

                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
                self._currentTime = e.position;
            });

            jwp.onIdle(function( e ){
                //log( "Idle", e );
            });

            jwp.onComplete(function( e ){
                //log( "Complete", e );

                self._paused = true;
                self._ended = true;
                self.dispatch("ended");
            });

            jwp.onTime(function( e ){
                ////log( "Time", e );

                self._currentTime = e.position;
                self.dispatch("timeupdate");
                self.dispatch("playing");
                self._paused = false;
                this_seeking = false;
            });

            jwp.onVolume(function( e ){
                //log( "Volume", e );

                self._volume = e.volume;
            });
        },

        autoplay: function( val ) {
            if ( val !== null) {
                this._autoplay = Boolean( val );
            }

            return this._autoplay;
        },

        preload: function( val ) {
            if ( val != null ) {
                this._preload = val;
            }

            return this._preload;
        },

        _doSeek: function( time ) {
            this._currentTime = time;

            // if ( !this._hasBegun ) {
            //     this._seekOnPlay = time;
            // }

            this._seeking = true;
            this.dispatch("seeking");
            this._jwplayer.seek( time );
        },

        _isReady: function() {
            return this._jwplayer.getState();
        },

        _bind: function( fn ) {
            var self = this;

            return function() {
                return fn.apply( self,arguments );
            };
        },

        _getVideoContainer: function( target ) {
            return ( target.container ) ? target.container.parentElement : target;
        },

        /**
         * MetaPlayer Media Interfaces
         *
         * @Functions
         * load()
         * play()
         * pause()
         * canPlayType(type)
         *
         */
        load: function() {
            //log('load()');
            
            if ( !this._isReady() ) {
                return;
            }

            this.dispatch("loadstart");

            if ( !this.src() ) {
                return;
            }

            var jwp = this._jwplayer;
            var current = this._jwplayer.getPlaylistItem() ;

            if ( ! current || ( current.file != this.src() ) ) {
                jwp.load({
                    file : this._src,
                    type: ( this._src.match(".mov") && jwplayer.version.split(".")[0] >= 6 ? "mp4": undefined )
                });
            }
            jwp.play();
        },

        play: function() {
            //log('play()');
            this._autoplay = true;

            if ( this._ended ) {
                this._jwplayer.seek( 0 );
                this._restorePaused = false;
                return;
            }

            this.load();
        },

        pause: function() {
            //log('pause()');
            
            if ( this._paused ) {
                return;
            }
            
            this._autoplay = false;
            this._paused = true;
            this._jwplayer.pause();
        },

        canPlayType: function( val ) {
            switch( val ){
                // via http://developer.longtailvideo.com/trac/browser/branches/4.2/com/jeroenwijering/parsers/ObjectParser.as?rev=80
                case 'application/x-fcs':
                case 'application/x-shockwave-flash':
                case 'audio/aac':
                case 'audio/m4a':
                case 'audio/mp4':
                case 'audio/mp3':
                case 'audio/mpeg':
                case 'audio/x-3gpp':
                case 'audio/x-m4a':
                case 'image/gif':
                case 'image/jpeg':
                case 'image/png':
                case 'video/flv':
                case 'video/3gpp':
                case 'video/h264':
                case 'video/mp4':
                case 'video/x-3gpp':
                case 'video/x-flv':
                case 'video/x-m4v':
                case 'video/x-mp4':
                case 'video/mov':
                    return "probably";

                // rtmp (manifest)
                // http://www.longtailvideo.com/support/jw-player/28836/media-format-support/
                case "application/smil":
                    return "maybe";

                // ... and add a few more:
                // m3u8 works in premium
                case "application/application.vnd.apple.mpegurl":
                case "application/x-mpegURL":
                    return "maybe";

                // ramp() service returns this for youtube videos
                case "video/youtube":
                    return "maybe";

                default:
                    return "";
            }
        },

        /**
         * MetaPlayer Media Properties
         * paused()
         * duration()
         * seeking()
         * ended()
         * currentTime(val)
         * muted()
         * volume(val)
         * src(val)
         * readyState()
         * controls()
         */
        paused: function() {
            return this._paused;
        },

        duration: function() {
            return this._duration;
        },

        seeking: function() {
            return Boolean( this._seeking );
        },

        ended: function() {
            return this._ended;
        },

        currentTime: function( val ) {
            if ( val != undefined ) {
                if ( val < 0 ) {
                    val = 0;
                }

                this._ended = false;
                this._doSeek( val );
            }

            return this._currentTime;
        },

        readyState: function( val ) {
            if ( val != undefined ) {
                this._readyState = val;
             }

            return this._readyState;
        },
        muted: function( val ) {
            if ( val != undefined ) {
                this._muted = val;
                this._jwplayer.setMute( val );
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },
        volume: function( val ) {
            if ( val != null && val != this._volume ) {
                this._volume = val;

                // ovp doesn't support to change any volume level.
                this._jwplayer.setVolume( ( this._volume <= 1 ) ? ( this._volume * 100 ) : this._volume );
                this.dispatch("volumechange");
            }
            return ( this._volume > 1 ) ? ( this._volume / 100 ) : this._volume;
        },

        src: function( val ) {
            if ( val == undefined ) {
                if ( !this._isReady() ) {
                    return this._src;
                }
                else {
                    return this._src || this._jwplayer.getPlaylistItem().file;
                }
            }

            this._src = val;

            if ( this.autoplay() ) {
                this.play();
            }

            if ( this._preload != "none" ) {
                this.load();
            }

            return this._src;
        },

        // MPF Extensions
        mpf_resize: function( w, h ) {
            if ( this._height != h || this._width != w ) {
                this._height = h;
                this._width = w;
                this._jwplayer.resize( w +"px", h+"px" );
            }
        }
    };

})();
(function() {
    var $ = jQuery;


    var defaults = {
        autoplay: false,
        preload: true,
        loop: false,
        updateMsec: 500,
        playerVars: {
            experienceID: null
        }
    };

    var KalturaPlayer = function( objectId ) {

        /* HTML5 specific attributes */

        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        this._duration = NaN;
        this._paused = true;
        this._ended = false;
        this._autoplay = true;
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        //this.defaultPlaybackRate = 1; Supported?
        //this.playbackRate = 1; Supported?
        //this.seekable = {}; Supported?
        //this.buffered = {}; Supported?
        //this.played = {}; Supported?

        // Ot_her Player Attributes
        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        //this.networkState;
        //this.error;

        MetaPlayer.dispatcher( this );

        this.kdp = document.getElementById(objectId);

        //this.container = container.parentNode;

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.kdp);
        
        this.addListeners();
        
    };

    MetaPlayer.kaltura = function ( objectId ) {
        var kta = new KalturaPlayer( objectId );
        return kta.video;
    };

    KalturaPlayer.prototype =  {
        
        init : function() {

        },

        isReady : function() {
            return this.kdp;
        },

        addListeners : function() {
            var kdp = this.kdp,
                self = this;

            // The nature of KDP's observer pattern requires that calbacks be
            // decalared in the Global Scope - so don't blame me. O.o
            window.kdpCallback_onMediaBegin = function () {
                self._ended = false;
                self._paused = false;
                self.dispatch("play");
                self.dispatch("playing");
            };

            window.kdpCallback_onMediaPaused = function() {
                self._paused = true;
                self._ended = false;
                self.dispatch("pause");
            };

            window.kdpCallback_onMediaChange = function () {

            };

            window.kdpCallback_onDurationChange = function (e) {
                // onDurationChange fires from the KDP when seeking (weird)
                // so, let's assume we can ignore the event if the duration is
                // the same
                if (self._duration === e.newValue) {
                    return;
                }

                self._duration = e.newValue;
                //self._paused = !self._autoplay;

                self.dispatch('durationchange');
            };

            window.kdpCallback_onMediaProgress = function (e) {
                // KDP does not provide a callback for programmatically seeking - only for scrubber
                // actions directly on their player, so we have to fake it.
                if (self._seeking) {
                    self._seeking = false;
                    self.dispatch("seeked");
                }
                self._currentTime = e;
                self.dispatch("timeupdate");
            };

            window.kdpCallback_onMediaComplete = function () {
                self._ended = true;
                self._paused = true;
                self._duration = NaN;
                self.dispatch("ended");
            };

            window.kdpCallback_onEntryReady = function (e) {
                // support for loading source through player itself,
                // without this we never get into readyState, popcorn is never happy, etc
                if ( self._readyState < 4) {
                    self._readyState = 4;
                    self.dispatch("loadstart");
                    self.dispatch("canplay");
                }

                self.dispatch('loadedmetadata');
                self.dispatch('loadeddata');

                self._duration = e.duration;
                self.dispatch('durationchange');
            };

            kdp.addJsListener('entryReady',' kdpCallback_onEntryReady');
            kdp.addJsListener('playerPlayed', "kdpCallback_onMediaBegin");
            kdp.addJsListener('playerPaused', "kdpCallback_onMediaPaused");
            kdp.addJsListener('playerPlayEnd', "kdpCallback_onMediaComplete");
            kdp.addJsListener('durationChange', "kdpCallback_onDurationChange");
            kdp.addJsListener('playerUpdatePlayhead', "kdpCallback_onMediaProgress");
        },

        startVideo : function() {
            if ( ! this.isReady()) {
                return;
            }

            this._ended = false;

            // not supported
//            if ( this._muted ) {
//                this.kdp.sendNotification('mute');
//            }

            var src = this._src;

            if ( !src ) {
                return;
            }

            if ( this._readyState < 4) {
                this._readyState = 4;
                this.dispatch("loadstart");
                this.dispatch("canplay");
            }

            if (this._autoplay) {
                this.kdp.sendNotification('changeMedia', {entryId: src});
                var self = this;
                setTimeout(function() {
                    self.kdp.sendNotification('doPlay');
                }, 500);
            }
            else if (this._preload) {
                this.load();
            }


        },

        doSeek : function(time) {
            this._seeking = true;
            this.dispatch("seeking");
            this.kdp.sendNotification('doSeek', parseFloat(time));
            this._currentTime = time;

            var self = this;
        },

        /* Media Interface */

        load : function() {
            this._preload = true;

            if ( ! this.isReady() ) {
                return;
            }

            this.kdp.sendNotification('changeMedia', {entryId: this._src});

        },

        play : function() {
            this._autoplay = true;
            if ( ! this.isReady() ) {

                return;
            }

            this.kdp.sendNotification('doPlay');

        },

        pause : function() {
            if ( ! this.isReady() ) {
                return;
            }

            this.kdp.sendNotification('doPause');
        },

        canPlayType : function( type) {
            return Boolean  ( type.match(/\/kaltura$/ ) );
        },

        paused : function() {
            return this._paused;
        },

        duration : function() {
            return this._duration;
        },

        seeking : function() {
            return this._seeking;
        },

        ended : function() {
            if ( ! this.isReady() ) {
                return false;
            }
            return this._ended;
        },

        currentTime: function(val) {
            if (! this.isReady() ) {
                return 0;
            }
            if ( val !== undefined ) {
                this._ended = false;
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val !== undefined ) {
                this._muted = val;
                if ( ! this.isReady() ) {
                    return val;
                }
//                if ( val ) {
                    // mute kaltura - not supported
//                }
//                else {
                    // unmute kaltura - not supported
//                }
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {
            if ( val !== undefined ) {
                this._volume = val;
                if ( ! this.isReady() ) {
                    return val;
                }

                this.kdp.sendNotification('changeVolume', val);

                this.dispatch("volumechange");
            }
            return this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
                this.startVideo();
            }
            return this._src;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();(function() {
    var $ = jQuery;

    var defaults = {
        autoplay: false,
        preload: true,
        loop: false,
        updateMsec: 500,
        playerVars: {
        }
    };

    var OoyalaPlayer = function() {

        /* HTML5 specific attributes */
        
        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        this._duration = NaN;
        this._paused = true;
        this._ended = false;
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        this._preload = "none";
        this._autoplay = false;
        //this.defaultPlaybackRate = 1; Supported?
        //this.playbackRate = 1; Supported?
        //this.seekable = {}; Supported?
        //this.buffered = {}; Supported?
        //this.played = {}; Supported?

        // Ot_her Player Attributes
        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        //this.networkState;
        //this.error;

        var ooyalaScriptEl = $('script[src*="//player.ooyala.com/player.js"]').get(0);

        //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
        var getParameterByName = function(name, string)
        {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(string);
            if(results === null)
                return "";
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        this.playerId = getParameterByName('playerId', ooyalaScriptEl.src);
        this.playerCallback = getParameterByName('callback', ooyalaScriptEl.src);

        this.onReady();
        
        this.init();
    };

    MetaPlayer.ooyala = function () {
        var ooyala = new OoyalaPlayer();
        return ooyala.video;
    };

    OoyalaPlayer.prototype =  {
        init : function() {

            this.addListeners();
            this.startVideo();            
        },

        isReady : function() {
            // we don't instantiate until the ready callback from the plyaer
            return true;
        },

        addListeners : function() {
            var self = this;
            
            window[this.playerCallback] = function(playerId, eventName, eventArgs) {
                switch (eventName) {
                    case "apiReady":
                        break;
                    case "playerEmbedded":

                        break;
                    case "playheadTimeChanged":
                        self.onMediaProgress(eventArgs);
                        break;
                    case "stateChanged":
                        switch (eventArgs.state) {
                            case "buffering":
                                self.onMediaBegin();
                                break;
                            case "playing":
                                self.onMediaPlay();
                                break;
                            case "paused":
                                self.onMediaPause();
                                break;
                        }
                        break;
                    case "seeked":
                        self.onMediaSeekNotify(eventArgs);
                        break;
                    case "playComplete":
                        self.onMediaComplete();
                        break;
                    case "currentItemEmbedCodeChanged":
                        // not sure what difference is here between this and embedCodeChanged
                        
                        break;
                    case "totalTimeChanged":
                        
                        break;
                    case "embedCodeChanged":
                        self.onMediaChange(eventArgs);
                        break;
                    case "volumeChanged":
                        
                        break;
                }
            };
        },

        onReady : function() {
            this.ooyalaPlayer = $('#' +this.playerId).get(0);
            MetaPlayer.dispatcher( this );
            this.video = MetaPlayer.proxy.proxyPlayer(this, this.ooyalaPlayer);
        },

        onMediaChange : function(e) {
            this._src = e.embedCode;
            this._currentTime = 0;
            this._duration = e.time;
            this._seekOnPlay = null;
            this._hasBegun = false;
            this._readyState = 4;

            // if ( this._autoplay ) {
            //     this._paused = false;
            //     // do the playing here for change
            // }
            // else {
            //     console.log('we are here');
            //     this._paused = true;
            // }
            
            this.dispatch('canplay');
            this.dispatch("loadstart");
            this.dispatch('loadedmetadata');
            this.dispatch('loadeddata');
            this.dispatch("durationchange");
        },

        onMediaComplete : function(e) {
            this._currentTime = 0;
            this._ended = true;
            this._paused = true;
            this.dispatch("ended");
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function() {
            this._ended = false;
            this._paused = false;
            this._hasBegun = true;
            this.dispatch("playing");
            this.dispatch("play");
        },

        onMediaBegin : function() {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            this._currentTime = e.playheadTime;
            this.dispatch("timeupdate");
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            this._currentTime = e.newPlayheadTime;
        },

        onMediaPause : function() {
            this._paused = true;
            this._ended = false;
            this.dispatch( "pause" );
        },

        startVideo : function() {
            if( this._ended ) {
                this.currentTime(0);
            }

            this._ended = false;
            this.muted( this._muted );

            var src = this._src;
            if ( !src ) {
                return;
            }

            this.dispatch("loadstart");

            //var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            // if( longForm )
            //     src = parseInt( longForm[1] );
            
            this.ooyalaPlayer.setQueryStringParameters({embedCode: src});

            if ( this._autoplay ) {
               this.ooyalaPlayer.playMovie();
            }
                
        },

        doSeek : function(time) {
            this._currentTime = time;

            if(! this._hasBegun ){
                this._seekOnPlay = time;
            }

            this._seeking = true;
            this._seekOnPlay = null;
            this.dispatch("seeking");
            this.ooyalaPlayer.setPlayheadTime(time);
            
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._autoplay = true;
            if ( this._preload == "none" ) {
                this.startVideo();
            }
            else {

                this.ooyalaPlayer.playMovie();
            }
        },

        pause : function() {
            return this.ooyalaPlayer.pauseMovie();
        },

        canPlayType : function( type) {
            MetaPlayer.log("ooyala", "canPlayType?", type);
            return Boolean  ( type.match(/\/ooyala$/ ) );
        },

        paused : function() {
            return this._paused;
        },

        duration : function() {
            return this._duration;
        },

        seeking : function() {
            return this._seeking;
        },

        ended : function() {
            return this._ended;
        },

        currentTime: function(val) {
            if ( val !== undefined ) {
                this._ended = false;
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val != undefined ) {
                this._muted = val;
               
                if ( val ) {
                    this.ooyalaPlayer.setVolume(0);
                }
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {
           if ( val != null && val != this._volume ) {
                this._volume = val;

                this.ooyalaPlayer.setVolume( val );
                this.dispatch("volumechange");
            }
            return ( this._volume > 1 ) ? ( this._volume / 100 ) : this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
                this._duration = NaN;
                this._currentTime = 0;
                this.startVideo();
            }
            return this._src;
        },

        autoplay : function ( val ) {
            if( val != null)
                this._autoplay = Boolean(val);
            return this._autoplay;
        },

        preload : function ( val ) {
            if( val != null)
                this._preload = val;
            return this._preload;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();(function () {
    var $ = jQuery;
    var ovp = window.ovp;

    var defaults = {
        // OVP main default configs
        strategy : {"order":["HTML5","Flash","Silverlight"]}, // Case is important
        sliderdelay : 5000,
        sliderspeed : "slow",
        immediately : false,
        controls: {'src_img':'/images/play.png'},
        ovp_container_class:'ovp',
        controller_keepalive_seconds: 5,
        players : {
            "Flash":{"src":"ovp-2.1.6.swf","minver":"10","controls":false, "plugins":[]},
            "Silverlight":{"src":"ovp-2.3.1.xap","minver":"4.0","controls":false, "plugins":[]},
            "HTML5":{"minver":"0","controls":false}
        },
        status_timer : 500,
        // OVP video default configs
        ovpConfig: {
            sources:[
                    {'src':'/videos/trailer.ogv', 'type':'video/ogg'},
                    {'src':'/videos/trailer.mp4','type':'video/mp4'}
            ],
            width : '100%', // swfobject requires width/height of player.
            height : '100%',
            posterimg:'/images/poster.png',
            autobuffer:true,
            autoplay:false,
            id: 'ovp',
            scalemode: 'fit',
            controls: false
        }
    };

    var status = {
        LOAD  : 0,
        READY : 1,
        PLAY  : 2,
        PAUSE : 3,
        SEEK  : 4,
        ENDED : 5
    };

    var OVPlayer = function(el, options) {
        if(!(this instanceof OVPlayer))
            return new OVPlayer(el, options);

        this.config = $.extend(true, {}, defaults, options); 
        this.__readyState = 0;
        this.__paused = (! this.config.immediately);
        this.__duration = NaN;
        this.__ended = false;
        this.__seeking = false;
        this.__controls = false;
        this.__volume = 1;
        this.__muted = false;
        this.__src = "";
        this.__status = status.LOAD;
        
        this._ovp = this._render( $(el).get(0) );
        this.video = $(el).get(0);
        this.dispatcher = MetaPlayer.dispatcher( this );
        MetaPlayer.proxy.proxyPlayer( this, this.video );
        this._setControls();
        this._addEventListeners();
    };

    if( window.MetaPlayer ) {
        MetaPlayer.addPlayer("ovp", function ( options ) {
            var target = $("<div></div>").appendTo(this.layout.base);
            this.ovp = OVPlayer(target, options);
            this.video = this.ovp.video;
        });
    } else {
        window.MetaPlayer = {};
    }

    MetaPlayer.ovp = function (target, options) {
        var ovp = OVPlayer(target, options);
        return ovp.video;
    };

    OVPlayer.prototype = {
        _render: function (el) { 
            var presetplay = this.config.immediately;
            if (! presetplay ) this.config.immediately = true;
            ovp.init(this.config);
            this.config.immediately = presetplay;
            return ovp.render(el, this.config.ovpConfig)[0];
        },
        
        _addEventListeners : function () {
            // start ovp player status check
            this._loadtimer = MetaPlayer.timer(this.config.status_timer);
            this._loadtimer.listen('time', this._onBeforeLoad, this);
            this._loadtimer.start();
            
            this._statustimer = MetaPlayer.timer(this.config.status_timer);
            this._statustimer.listen('time', this._onStatus, this);
        },
        _onBeforeLoad : function () {
            if(typeof this._ovp.player !== "object")
                return;
            this.dispatch('loadstart');
            this._loadtimer.reset();
            this._onReady();
            this._startDurationCheck();
        },
        _onReady : function () {
            this._statustimer.start();
            this.__readyState = 4;
            this.dispatch("loadeddata");
            this.dispatch("canplay");
            this.load();

            this.__status = status.READY;
            
            this.video.pause();
            if(this.config.immediately || this.config.ovpConfig.autoplay) {
                this.video.play();
            }
        },
        _startDurationCheck : function () {
            var self = this;
            if( this._durationCheckInterval ) {
                return;
            }
            this._durationCheckInterval = setInterval(function () {
                self._onDurationCheck();
            }, 1000);
        },

        _onDurationCheck : function () {
            var duration = this._ovp.getDuration();
            if( duration > 0 ) {
                this.__duration = duration;
                this.dispatch("loadeddata");
                this.dispatch("loadedmetadata");
                this.dispatch("durationchange");
                this.dispatch("timeupdate");
                clearInterval( this._durationCheckInterval );
                this._durationCheckInterval = null;
            }
        },
        
        _onStatus : function () {
            if ( this._ovp.isPlaying() ) {
                this.__paused = false;
                if( this.__status !== status.PLAY ) {
                    this.dispatch("play");
                }
                this.dispatch("timeupdate");
                this.__status = status.PLAY;
            } else if ( this._ovp.isEnded() ){
                this.__paused = true;
                if( this.__status !== status.ENDED ) {
                    this.dispatch("ended");
                }
                this.__status = status.ENDED;
            } else {
                this.__paused = true;
                if( this.__status !== status.PAUSE ) {
                    this.dispatch("pause");
                }
                this.__status = status.PAUSE;
            }
        },
        _setControls : function () {
            if ( this._ovp.controlsState === 'RENDERED' )
                this.__controls = this._ovp.controls;
        },
        _getCurrentTimeFromCache : function () {
            if (! this._ovp.player )
                return 0;
            
            var now = (new Date()).getTime();
            var then = this.__currentTimeCache;
            var diff = now - then;

            if( then && diff < this.config.status_timer )
                return this.__currentTime + (diff / 1000); // approx our position
            else
                this.__currentTimeCache = now;
            
            var ovpCurrentTime = this._ovp.getCurrentTime();
            this.__currentTime = ( ovpCurrentTime < 0 )? 0 : ovpCurrentTime;
            return this.__currentTime;
        },
        doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            this._ovp.seekTo( time );
            this.__currentTime = time;
            this.__status = status.SEEK;

            // no seeking events exposed, so fake best we can
            // will be subject to latency, etc
            var self = this;
            setTimeout (function () {
                self.updateTime(); // trigger a time update
                self.__seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500)
        },
        updateTime : function () {
            this.__currentTime = this._ovp.getCurrentTime();
        },
        /**
         * MetaPlayer Media Interfaces
         *
         * @Functions
         * load()
         * play()
         * pause()
         * canPlayType(type)
         *
         */
        load : function () {
            if (! this._ovp.player )
                return;
            
            var f = this.src();
            if(f) {
                this.config.ovpConfig.sources = [{src: f}];
            }
            // start to play video.
        },
        play : function () {
            this.__paused = false;
            this._ovp.playpause();
        },
        pause : function () {
            this.__paused = true;
            this._ovp.playpause();
        },
        canPlayType : function (val) {
            // In ovp, it has to be changed the video sources before it checks.
            return this._ovp.canPlay();
        },
        /**
         * MetaPlayer Media Properties
         * paused()
         * duration()
         * seeking()
         * ended()
         * currentTime(val)
         * muted()
         * volume(val)
         * src(val)
         * readyState()
         * controls()
         */
        paused : function () {
            return this.__paused;
        },
        duration : function () {
            return this.__duration;
        },
        seeking : function () {
            return this.__seeking;
        },
        ended : function () {
            return this.__ended;
        },
        currentTime : function (val) {
            if( typeof val !== 'undefined' ) {
                if( val < 0 )
                    val = 0;
                if( val > this.duration )
                    val = this.duration;
                this.doSeek(val);
            }
            
            return this._getCurrentTimeFromCache();
        },
        readyState : function (val) {
            if( val !== undefined )
                this.__readyState = val;
            return this.__readyState;
        },
        muted : function (val) {
            if( val != null ){
                this.__muted = val;
                if( ! this._ovp )
                    return val;
                if( val )
                    this._ovp.mutetoggle();
                else
                    this._ovp.mutetoggle();
                this.dispatch("volumechange");
                return val;
            }

            return this.__muted;
        },
        volume : function (val) {
            if( val != null ){
                this.__volume = val;
                if( ! this._ovp )
                    return val;
                // ovp doesn't support to change any volume level.
                this._ovp.mutetoggle();
                this.dispatch("volumechange");
            }
            return this.__volume;
        },
        src : function (val) {
            if( val !== undefined ) {
                this.__src = val;
            }
            return this.__src
        },
        controls : function (val) {
            if( typeof val !== 'undefined' || val != false ) {
                this.__controls = val;
            }
            return this.__controls;
        }
    };
})();
(function() {
    var $ = jQuery;

    var StrobeMediaPlayback = function( playerId, jsBridge ) {
        /* HTML5 specific attributes */
        
        if ( !( this instanceof StrobeMediaPlayback ) ) {
            return new StrobeMediaPlayback( playerId, jsBridge );
        }

        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        this._paused = true;
        this._ended = false;
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        this._duration = NaN;

        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        this._preload = "none";
        this._autoplay = false;

        this.dispatcher = MetaPlayer.dispatcher( this );

        this.playerId = playerId;
        this.player = $( '#' +playerId ).get( 0 );

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.player);

        // I don't normally proxy object tags, but when I do I use a workaround.
        var addEventListener = this.video.addEventListener;
        this.video.addEventListener = function  (type, callback, useCapture){
            // strobe object.addEventListener throws an exception with three args.
            addEventListener.apply(this, [type, callback]);
        };

        this.addListeners( jsBridge );
    };

    MetaPlayer.strobemediaplayback = function ( playerId, jsBridge ) {
        var smp = StrobeMediaPlayback( playerId, jsBridge );
        return smp.video;
    };

    StrobeMediaPlayback.prototype =  {
        isReady : function() {
            return Boolean(this.player && this.player.getState() != "loading");
        },

        addListeners : function( jsBridge ) {
            var self = this;

            window[ jsBridge ] = function( a,b,c ) {

                switch( b ) {
                    case "loadstart":
                        self.onLoadStart( c );
                        break;
                    case "durationchange":
                        self.onMediaChange( c );
                        break;
                    case "complete":
                        self.onMediaComplete();
                        break;
                    case "play":
                        self.onMediaPlay( c );
                        break;
                    case "timeupdate":
                        self.onMediaProgress( c );
                        break;
                    case "seeked":
                        self.onMediaSeekNotify( c );
                        break;
                    case "pause":
                        self.onMediaPause();
                }
            };
            return this;
        },

        onLoadStart: function(e) {
            this._readyState = 4;
            this.dispatch("loadstart");
        },

        onMediaChange : function(e) {
            //this._src = e.media.id;
            
            if ( !isNaN( e.duration ) ) {
                this._duration = e.duration;
                this.dispatch('loadedmetadata');
                this.dispatch('loadeddata');
                this.dispatch("canplay");
                this.dispatch("durationchange");
            }

            this._currentTime = 0;
            this._seekOnPlay = null;
            this._hasBegun = false;


            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
        },

        onMediaComplete : function(e) {
            this._ended = true;
            this._paused = true;
            
            this.dispatch("ended");
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function(e) {
            this._ended = e.ended;
            this._paused = false;
            this._hasBegun = true;

            
            this.dispatch("play");
            this.dispatch("playing");
            
        },

        onMediaBegin : function(e) {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            this._currentTime = e.currentTime;
            this.dispatch("timeupdate");
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            //this._currentTime = e.position;
        },

        onMediaPause: function() {
            this._paused = true;
            this.dispatch("pause");
        },

        startVideo : function() {
            if ( ! this.isReady()) {
                return;
            }

            if ( this._preload == "none") {
                return;
            }

            if( this._ended ) {
                this.currentTime(0);
            }

            this._ended = false;

            var src = this._src;
            if ( !src ) {
                return;
            }
            

            // "http://link.brightcove.com/services/link/bcpid1745093542/bclid1612710147/bctid1697210143001?src=mrss"
            //var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            // if( longForm ) {
            //     src = parseInt( longForm[1] );
            // }

            if (this._autoplay) {
                this.player.setMediaResourceURL(src);
                this.player.play2();
            }
            else {
                this.player.setMediaResourceURL(src);
            }
        },

        doSeek : function(time) {
            this._currentTime = time;

            if(! this._hasBegun ){
                this._seekOnPlay = time;
            }

            this._seeking = true;
            this._seekOnPlay = null;
            this.dispatch("seeking");
            
            if (this.player.getState() != "ready" && this.player.canSeekTo( time ) )
            {
                this.player.seek( time );
            }

            // var self = this;
            // setTimeout(function () {
            //     self._currentTime = time;
                this._seeking = false;
                this.dispatch("seeked");
                this.dispatch("timeupdate");
            // }, 1500);
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._paused = false;
            this._preload = "auto";
            this._autoplay = true;

            if( this._readyState == 4 ) {
                this.player.play2();
            }
            else {
                this.startVideo();
            }
        },

        pause : function() {
            if( this.isReady() )
                this.player.pause();
        },

        canPlayType : function( type) {
            switch( type ){
                case 'video/strobe':
                case 'appplication/strobe':

                // borrowed from jwplayer
                case 'application/x-fcs':
                case 'application/x-shockwave-flash':
                case 'audio/aac':
                case 'audio/m4a':
                case 'audio/mp4':
                case 'audio/mp3':
                case 'audio/mpeg':
                case 'audio/x-3gpp':
                case 'audio/x-m4a':
                case 'image/gif':
                case 'image/jpeg':
                case 'image/png':
                case 'video/flv':
                case 'video/3gpp':
                case 'video/h264':
                case 'video/mp4':
                case 'video/x-3gpp':
                case 'video/x-flv':
                case 'video/x-m4v':
                case 'video/x-mp4':
                case 'video/mov':
                    return "probably";

                // m3u8 works with plugin
                case "application/application.vnd.apple.mpegurl":
                case "application/x-mpegURL":
                    return "maybe";

                default:
                    return "";
            }
        },

        paused : function() {
            return this._paused;
        },

        duration : function() {
            return this._duration;
        },

        seeking : function() {
            return this._seeking;
        },

        ended : function() {
            if ( ! this.isReady() ) {
                return false;
            }
            return this._ended;
        },

        currentTime: function(val) {
            if (! this.isReady() ) {
                this._currentTime = val || 0;
                return 0;
            }
            if ( val !== undefined ) {
                this._ended = false;
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val != undefined ) {
                this._muted = Boolean(val) ;
                if ( this.isReady() )
                    this.player.setVolume( this._muted ? 0 : this._volume );
                this.dispatch("volumechange");
            }
            return this._muted;
        },

        volume : function ( val ) {
            if ( val != undefined ) {
                this._volume = val;
                this.muted( this._muted );
            }
            return this._volume;
        },

        src : function (id) {
            if (id != undefined) {
                this._src = id;
                this._readyState = 0;
                this._duration = NaN;
                this._currentTime = 0;
                this.startVideo();
            }
            return this._src;
        },

        autoplay : function ( val ) {
            if( val != null)
                this._autoplay = Boolean(val);
            return this._autoplay;
        },

        preload : function ( val ) {
            if( val != null)
                this._preload = val;
            return this._preload;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();(function() { 
    var $ = jQuery;

    var defaults = {
        autoplay: false,
        preload: true,
        loop: false,
        updateMsec: 500,
        playerVars: {
            
        }
    };

    var ThePlatformPlayer = function( element ) {

        if ( !( this instanceof ThePlatformPlayer ) ) {
            return new ThePlatformPlayer( element );
        }

        /* HTML5 specific attributes */

        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        //this._duration = NaN;
        this._paused = true;
        this._ended = false;
        this._autoplay = false;
        this._preload = "none";
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        //this.defaultPlaybackRate = 1; Supported?
        //this.playbackRate = 1; Supported?
        //this.seekable = {}; Supported?
        //this.buffered = {}; Supported?
        //this.played = {}; Supported?

        // Other Player Attributes
        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        //this.networkState;
        //this.error;

        this._seekingWhilePaused = false;
        this._seekingWhilePausedTime = NaN;

        this.dispatcher = MetaPlayer.dispatcher( this );
        this.video = MetaPlayer.proxy.proxyPlayer(this, $('#' +element).get(0) );

        this.addListeners();

         $(element).css({
             width: "100%",
             height: "100%"
         });
    };

    MetaPlayer.theplatform = function ( element ) {
        var tp = ThePlatformPlayer( element );
        return tp.video;
    };

    ThePlatformPlayer.prototype =  {

        init : function() {

        },

        isReady : function() {
            return tpController;
        },

        addListeners : function() {
            var tpc = tpController;
            var self = this;


            tpc.addEventListener("OnMediaPause", function(e) {
                self.onMediaPause(e);
            });

            tpc.addEventListener("OnMediaUnpause", function(e) {
                self.onMediaUnpause(e);
            });

            tpc.addEventListener("OnMediaStart", function(e) {
                self.onMediaStart(e);
            });

            tpc.addEventListener("OnReleaseStart", function(e) {
                self.onReleaseStart(e);
            });

            tpc.addEventListener("OnMediaPlay", function(e) {
                self.onReleaseStart(e);
            });

            tpc.addEventListener("OnLoadReleaseUrl", function(e) {
                self.onMediaChange(e);
            });

            tpc.addEventListener("OnSetReleaseUrl", function(e) {
                self.onMediaChange(e);
            });

            tpc.addEventListener("OnMediaEnd", function(e) {
                self.onMediaEnd(e);
            });

            tpc.addEventListener("OnMediaError", function(e) {
                self.onMediaError(e);
            });

            tpc.addEventListener("OnMediaPlaying", function(e) {
                self.onMediaPlaying(e);
            });

            tpc.addEventListener("OnMediaSeek", function(e) {
                self.onMediaSeek(e);
            });

        },

        /* Event Handlers */

        onReleaseStart : function(e) {
           // if (!this._seekingWhilePaused) {
                this._ended = false;
                this._paused = false;
                this.dispatch("play");
                this.dispatch("playing");
            // }
        },

        onMediaStart : function(e) {
            if (e.data.baseClip.isAd) {
                this.dispatch('adstart');
                return;
            }

            // if (this._seekingWhilePaused) {

            //     var self = this;
            //     setTimeout(function() {
            //         tpController.seekToPosition(self._seekingWhilePausedTime);
            //     }, 50);
            // }

            this._currentTime = 0;
            this.onMediaDuration(e);
        },

        onMediaDuration : function (e) {
            if (typeof e.data == "object") {
                this._duration = e.data.length || e.data.duration;
                this._src = e.data.url;
                this.dispatch('durationchange', this._duration);
            }
        },

        onMediaChange : function(e) {
            if ( this._readyState < 4) {
                this._readyState = 4;
                this.dispatch("loadstart");
                this.dispatch("canplay");
            }
            this.dispatch('loadedmetadata');
            this.dispatch('loadstart');
            this.dispatch('canplay');
            this.dispatch('loadeddata');

            // // we can only get media duration after pressing play
            // if ( !this._autoplay ) {
            //     tpController.clickPlayButton();
            //     this._playToGetDuration = true;
            // }

            this.dispatch('trackchange', e.data);
        },

        onMediaEnd : function(e) {
            if (e.data.baseClip.isAd) {
                this.dispatch('adstop');
                return;
            }
            this._paused = true;
            this._ended = true;
            this._duration = NaN;
            this._currentTime = 0;
            this.dispatch("ended");
        },

        onMediaError : function(e) {
            this.dispatch("error");
        },

        onMediaPlaying : function(e) {
            if (!this._seekingWhilePaused) {
                this._currentTime = e.data.currentTime * 0.001;
            }

            // TODO: Make this smarter for cases where we're not overlaying anything on the video
            if ($('video').length > 0) {
                $('video').get(0).controls = false;
            }

            this.dispatch("timeupdate");
            this.dispatch("playing");

            // if ( this._playToGetDuration ) {
            //     delete this._playToGetDuration;
            //     tpController.pause(true);
            // }
        },

        onMediaSeek : function(e) {
            this._currentTime = e.data.end.currentTime * 0.001;
            this._seeking = false;
            if ( !this._paused ) {
                setTimeout(function() {
                    tpController.pause(false);
                    tpController.clickPlayButton();
                }, 1000);
            }
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            
            // if (this._seekingWhilePaused) {
                
            //     var self = this;
            //     setTimeout(function() {
            //         tpController.pause(true);
            //     }, 50);
            // }
        },

        onMediaPause : function(e) {
            // if (this._seekingWhilePaused) {
            //     this._seekingWhilePaused = false;
            //     this._seekingWhilePausedTime = NaN;
            // }
            this._paused = true;
            this._ended = false;
            this.dispatch("pause");
            
        },

        onMediaUnpause : function(e) {
            this._paused = false;
            this._ended = false;
            this.dispatch("play");
            this.dispatch("playing");

            if (this._seekingWhilePaused) {
                var self = this;
                setTimeout(function() {
                    tpController.seekToPosition(self._seekingWhilePausedTime);
                }, 50);
                
            }
            
        },

        /* --------------------------------- */

        startVideo : function() {

            this._ended = false;

            if ( this._muted ) {
                tpController.mute(this._muted);
            }

            var src = this._src;

            if ( !src ) {
                return;
            }
            
            if (this._autoplay) {
                tpController.setReleaseURL(src);
            }
            else if (this._preload != "none") {
                this.load();
            }

            // if ( this._readyState < 4) {
            //     this._readyState = 4;
            //     this.dispatch("loadstart");
            //     this.dispatch("canplay");
            // }


        },

        seekWhilePaused : function() {
            tpController.clickPlayButton();
            tpController.pause(false);
        },

        doSeek : function(time) {
            this._seeking = true;
            this.dispatch("seeking");

            this._currentTime = time;

            // if (!this._ended && this._paused) {
            //     this._seekingWhilePaused = true;
            //     this._seekingWhilePausedTime = time;
            //     this.seekWhilePaused();
            // }
            // else {
                tpController.seekToPosition(time * 1000);
            // }
        },

        /* Media Interface */

        load : function() {
            this._preload = true;

            tpController.loadReleaseURL(this._src);

        },

        play : function() {
            this._seekingWhilePaused = false;
            this._seekingWhilePausedTime = NaN;
            this._autoplay = true;

            if ( this._preload == "none" ) {
                this._preload = "auto";
                this.startVideo();
                return;
            }

            var self = this;

            if (this._paused) {
                setTimeout(function() {
                    tpController.pause(false);
                }, 500);
            }

            if (this._paused && this._currentTime == 0) {
                tpController.clickPlayButton();
            }

            this._paused = false;
        },

        pause : function() {
            tpController.pause(!this._paused);
        },

        canPlayType : function( type ) {
            return Boolean  ( type.match(/\/theplatform$/ ) );
        },

        paused : function() {
            return this._paused;
        },

        duration : function() {
            return this._duration * 0.001;
        },

        seeking : function() {
            return this._seeking;
        },

        ended : function() {
            return this._ended;
        },

        currentTime: function(val) {
            if ( val !== undefined ) {
                this._ended = false;
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val !== undefined ) {
                this._muted = val;

                tpController.mute(this._muted);

                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {
            if ( val !== undefined ) {
                this._volume = val;

                if (this._volume <= 1) {
                    val = val * 100;
                }
                tpController.setVolume(val);
                this.dispatch("volumechange");
            }
            return this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
                this.startVideo();
            }
            return this._src;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();(function () {

    // save reference for no conflict support
    var $ = jQuery;

    var defaults = {
        autoplay : false,
        preload : "auto",
        updateMsec : 500,
        playerVars : {
            enablejsapi : 1,
            version : 3,
            autohide : 0,
            autoplay : 0,
            controls : 1,
            fs : 1,
            hd : 1,
            rel : 1,
            showinfo : 1,
            iv_load_policy : 0,
            cc_load_policy : 0,
            wmode : "transparent"
        }
    };

    var YouTubePlayer = function (youtube, options) {

        if( !(this instanceof YouTubePlayer) )
            return new YouTubePlayer(youtube, options);

        this.config = $.extend(true, {}, defaults, options);

        this.__seeking = false;
        this.__readyState = 0;
        this.__ended = false;
        this.__muted = false;
        this.__paused = true;
        this.__duration = NaN;
        this.__currentTime = 0;
        this.__volume = 1;
        this.__loop = this.config.loop;
        this.__src = "";

        if( this.config.chromeless ){
            var pv = this.config.playerVars;
            pv.controls = 0;
            pv.rel = 0;
            pv.showinfo = 0;
        }
        this.preload = this.config.preload;
        this.autoplay = this.config.autoplay;
        this.updateMsec = this.config.updateMsec;

        MetaPlayer.dispatcher( this );

        if( typeof youtube == "string" || ! youtube.getVideoEmbedCode ) {
            this.container = $(youtube).get(0);
            // add another child so our proxy div doesn't get replaced by the frame
            this.target = $("<div></div>").appendTo(this.container).get(0);
            this.init();
        }
        else {
            this.youtube = youtube;
            var el = $(youtube.a);
            // wrap so we have a non-iframe container to append source elements to
            this.container  = $("<div></div>")
                .appendTo( el.parent() )
                .height( el.height() )
                .width( el.width() )
                .append( el )
                .get(0);

            el.width("100%");
            el.height("100%");

            this.addListeners();
        }

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.container);
    };


    MetaPlayer.youtube = function (youtube, options){
        var yt = new YouTubePlayer(youtube, options);
        return yt.video;
    };

    MetaPlayer.Players.YouTube = function (media) {
        if( ! ( media.getVideoEmbedCode instanceof Function ) )
            return false;
        return MetaPlayer.youtube(media);
    };

    /**
     * @deprecated
     */
    MetaPlayer.addPlayer("youtube", function (youtube, options ) {

        // single arg form
        if( ! options && youtube instanceof Object && ! youtube.getVideoEmbedCode){
            options = youtube;
            youtube = null;
        }

        if( ! options ) {
            options = {};
        }

        if( ! youtube ) {

            // disable default UI if initialized without options
            if( options.chromeless == null )
                options.chromeless = true;

           youtube = $("<div></div>")
               .prependTo(this.layout.base);
        }

        var yt = new YouTubePlayer(youtube, options);
        this.video = yt.video;
        this.youtube = yt
    });


    YouTubePlayer.prototype = {

        init : function () {

            if( window.YT instanceof Function ){
                this.onApiReady();
                return;
            }

            var tag = document.createElement('script');
            tag.src = "http://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // play nice; global context
            var self = this;
            var oldReady = window.onYouTubePlayerAPIReady;
            window.onYouTubePlayerAPIReady = function (){
                self.onApiReady();
                if( oldReady )
                    oldReady.call(window);
            };
        },

        onApiReady : function () {
            this.youtube = new YT.Player( this.target, {
                height: '100%',
                width: '100%',
//                playerVars : this.getParams()
                playerVars : this.config.playerVars
            });
            this.addListeners();
        },

        addListeners : function () {
            var yt = this.youtube;
            var self = this;

            yt.addEventListener("onReady", function(e) {
                self.onReady(e);
            });
            yt.addEventListener("onStateChange", function(e) {
                self.onStateChange(e);
            });
            yt.addEventListener("onError", function(e) {
                self.onError(e);
            });
        },

        onReady : function () {
            if( ! this.isReady() ) {
                this.error = "unabled to find youtube player";
                this.dispatch("error");
                return;
            }

            if( this.__readyState < 4 ){
                this.__readyState = 4;
            }


            if( this.__muted ) {
                this.youtube.mute();
            }

            // volume works, this is too early to set mute
            this.volume(this.__volume);

            this._initTrack();

            this.startDurationCheck();

            this.startTimeCheck(); // check while paused to handle event-less seeks
        },

        isReady : function () {
            return Boolean(this.youtube && this.youtube.playVideo);
        },

        onStateChange : function (e) {
            var state = e.data;

            MetaPlayer.log("youtube", "onStateChange", state);
            // http://code.google.com/apis/youtube/js_api_reference.html#Events
            switch(state) {
                case -1: // unstarted
                    break;
                case 0: //ended
                    this.__ended = true;
                    this.dispatch("ended");
                    break;
                case 1: // playing
                    this.__paused = false;
                    if( ! this.__ended ) {
                        this.dispatch("playing");
                        this.dispatch("play");
                    }
                    this.startDurationCheck();
                    break;
                case 2: // paused
                    if( ! this.__paused ) {
                        this.__paused = true;
                        this.dispatch("pause");
                    }
                    break;
                case 3: // buffering
                    
                    break;
                case 5: // queued
                    this.dispatch("loadstart");
                    this.dispatch("canplay");
                    this.dispatch("loadeddata");
                    this.dispatch("loadedmetadata");

                    // play then stop if !autoplay to get duration
                    if (!this.autoplay) {
                        this.youtube.playVideo();
                        this.__playingForDuration = true;
                    }
                    break;
            }
        },

        onError : function (e) {
            MetaPlayer.log("youtube", "onError", e);
            this.dispatch("error");
        },

        startTimeCheck : function () {

            var self = this;
            if( this._timeCheckInterval ) {
                return;
            }

            this._timeCheckInterval = setInterval(function () {
                self.updateTime();
            }, this.updateMsec);

            // set an initial value, too
            this.updateTime();
        },

        updateTime : function () {
            var last = this.__currentTime;
            var now = this.youtube.getCurrentTime();
            var seekThreshold = last + (2 * (this.updateMsec / 1000) );
            var paused = this.paused();
            var seeked = false;

            // detect seek while playing
            if( ! paused  && (now < last || now > seekThreshold) )
                seeked = true;

            // detect seek while paused
            else if( paused && (now != last ) )
                seeked = true;

            this.__currentTime = now;

            if( ! this.__ended && now >= this.__duration - (this.updateMsec/1000) && now == last ) {
                this.__ended = true;
                this.__paused = true;
                this.dispatch("ended");
                this.dispatch("paused");
                return;
            }

            if( this.__ended && ! paused) {
                this.__ended = false;
                this.__paused = false;
                this.dispatch("play");
                console.log("playing");
                this.dispatch("playing");
                return;
            }

            if( seeked ) {
                if( ! this.__seeking ){
                    this.__seeking = true;
                    this.dispatch("seeking");
                }
                this.__seeking = false;
                this.dispatch("seeked");
            }

            if( now != last ) {
                this.dispatch("timeupdate");
            }
        },

        startDurationCheck : function () {
            var self = this;
            if( this.__duration )
                return;

            if( this._durationCheckInterval ) {
                return;
            }
            this._durationCheckInterval = setInterval(function () {
                self.onDurationCheck();
            }, this.updateMsec);
        },

        onDurationCheck : function () {
            if( this.__readyState != 4 )
                return;

            var duration = this.youtube.getDuration();
            if( duration > 0 ) {
                this.__duration = duration;
                if (this.__playingForDuration) {
                    this.youtube.stopVideo();
                    delete this.__playingForDuration;
                }
                this.dispatch("durationchange");
                clearInterval( this._durationCheckInterval );
                this._durationCheckInterval = null;
            }
        },

        _initTrack : function () {
            var src = this.src();
            MetaPlayer.log("youtube", "init track", src)
            if( ! src ) {
                return;
            }

            // player not loaded yet
            if( ! this.isReady() )
                return;

            this.__ended = false;
            this.__currentTime = 0;
            this.__duration = NaN;
            this.__seeking = false;

            if( src.match("^http") ){
                var videoId = src.match( /www.youtube.com\/(watch\?v=|v\/)([\w-]+)/ )[2];
            }
            this.youtube.cueVideoById( videoId || src );

            this.dispatch("loadstart");

            MetaPlayer.log("youtube", "_initTrack", this.autoplay);

            if( this.autoplay )
                this.play();

            else if( this.preload != "none" )
                this.load();

        },

        doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            if( time != this.__currentTime )
                this.youtube.seekTo( time );
        },

        /* Media Interface */

        load : function () {
            this.preload = "auto";
            if( ! this.isReady() ){
                return;
            }
            MetaPlayer.log("youtube", "load()", this.isReady() );

            // kickstart the buffering so we get the duration
            //this.youtube.playVideo();
            //this.youtube.pauseVideo();

            this.startDurationCheck();
        },

        play : function () {
            this.autoplay = true;
            if( ! this.isReady() )
                return;
            MetaPlayer.log("youtube", "play()", this.isReady() );
            this.youtube.playVideo()
        },

        pause : function () {
            MetaPlayer.log("youtube", "pause()", this.isReady() );
            if(! this.isReady() )
                return false;
            this.youtube.pauseVideo()
        },

        canPlayType : function (type) {
            return Boolean  ( type.match( /\/youtube$/ ) );
        },

        paused : function (){
            return this.__paused;
        },

        duration : function () {
            return this.__duration;
        },

        seeking : function () {
            return this.__seeking;
        },

        ended : function () {
            if(! this.isReady()  )
                return false;
            return (this.youtube.getPlayerState() == 0);
        },

        currentTime : function (val){
            if(! this.isReady()  )
                return 0;
            if( val != undefined ) {
                this.doSeek(val);
            }
            return this.__currentTime;
        },

        muted : function (val){
            if( val != null ){
                this.__muted = val
                if( ! this.isReady() )
                    return val;
                if( val  )
                    this.youtube.mute();
                else
                    this.youtube.unMute();
                this.dispatch("volumechange");
                return val;
            }

            return this.__muted;
        },

        volume : function (val){
            if( val != null ){
                this.__volume = val;
                if( ! this.isReady() )
                    return val;
                this.youtube.setVolume(val * 100)
                this.dispatch("volumechange");
            }
            return this.__volume;
        },

        src : function (val) {
            if( val !== undefined ) {
                this.__src = val;
                this._initTrack();
            }
            return this.__src
        },

        readyState : function () {
            return this.__readyState;
        }
    }

})();
(function () {

    var $ = jQuery;

    var defaults = {
    };

    var MetaqService = function (url, options) {
        if( ! (this instanceof MetaqService ))
            return new MetaqService(url, options);
        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        if( url )
            this.load( url )
    };

    MetaPlayer.metaq = function (url, callback, options) {
        var service =  MetaqService(url, options);
        service.listen("data", function (e) {
            callback(e.items);
        })
    };

    MetaPlayer.prototype.metaq = function (url) {
        var mpf = this;
        if(! this._metaq ) {
            this._metaq  = MetaqService();

            mpf.metadata.listen("data", function (e) {
                var tracks = e.data.cueTracks || [];
                var i, url, track;
                for(i = 0; i< tracks.length; i++ ){
                    track = tracks[i];
                    if( track.type == "application/x-metaq-xml" ) {
                        url = tracks[i].href;
                        mpf._metaq.load(url, e.uri)
                    }
                }
            });
            this._metaq.listen("data", function (e) {
                mpf.cues.setCueLists(e.cues, e.data);
            });
        }
        if( url )
            this._metaq.load(url);
        return this;
    };

    MetaqService.prototype = {
        load : function ( url, extraData) {
            MetaPlayer.log("metaq", "load", url, extraData);

            var params = {};
            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    MetaPlayer.log("metaq", "got error", errorThrown);

                    this.event("error", {
                        url : url,
                        status : textStatus,
                        message: errorThrown,
                        data : extraData
                    })
                },
                success : function (response, textStatus, jqXHR) {
                    MetaPlayer.log("metaq", "got response");

                    var cues = this.parse(response);
                    this.event("data", {
                        'cues': cues,
                        'data': extraData
                    })
                }
            });
        },

        parse : function (xml) {
            MetaPlayer.log("metaq", "got response");
            var i;
            var matches = xmlChildren(xml, "Response.Matches.Match");
            var cues = {};
            var match;

            for(i=0; i<matches.length; i++ ){
                match = parseMatch( matches[i] );
                if( ! cues[match.type] )
                    cues[match.type] = [];
                cues[match.type].push(match.attributes);
            }
            return cues;
        }
    };

    function xmlChildren(xml, nodeName ){
        if( nodeName == "") {
            return xml;
        }

        var ret = [];
        var i;
        var path = nodeName.split(".");
        var tag = path.shift();
        var nodes = xml.childNodes;
        var node;

        for( i = 0; i < nodes.length; i++ ){
            node = nodes[i];
            if( node.nodeName == tag )
                ret = ret.concat( xmlChildren( node, path.join(".") ) );
        }
        return ret;
    }

    function xmlText (xml, path) {
        var text, node;
        try {
            node = xmlChildren(xml, path)[0];
            text = node.textContent || node.text || "";
        }
        catch(e){}
        return text;
    }

    function xmlNameValues(nodes) {
        var ret = {};
        var i, name;
        for( i = 0;i < nodes.length; i++){
            name  = xmlText(nodes[i], "Name");
            if( name )
                ret[ name ] = xmlText(nodes[i], "Value");
        }
        return ret;
    }

    function parseMatch (matchXml) {

        var type = xmlText(matchXml, "Actions.Action.Type");
        if( ! type )
            type = xmlText(matchXml, "Actions.Action.Name");

        var attributes = $.extend({
            start : parseFloat( xmlText(matchXml, "Occurrence.StartTime") )
            // end : parseFloat( xmlText(matchXml, "Occurrence.EndTime") )
        }, xmlNameValues( xmlChildren(matchXml, "Actions.Action.Attributes.Attribute") ));


        return  {
            type : type,
            attributes: attributes
        };
    }
})();(function () {

    /*
     * support for MediaRSS v1.1.2
     * - with additional support for subTitle
     */
    var $ = jQuery;

    var defaults = {
        isPlaylist : true
    };

    var MrssService = function (url, options) {
        if( ! (this instanceof MrssService ))
            return new MrssService(url, options);
        MetaPlayer.dispatcher(this);
        if( url )
            this.load( url )
    };

    MetaPlayer.mrss = function (url, callback, options) {
        var service =  MrssService(url, options);
        service.listen("data", function (e) {
            callback(e.items);
        })
    };

    MetaPlayer.prototype.mrss = function (url, options) {
        var options = $.extend({}, defaults, options)
        var mpf = this;
        if(! this._mrss ) {
            this._mrss  = MrssService();
            this._mrss.listen("data", function (e) {
                var items = e.items;
                var playlist = [];
                $(e.items).each( function (i, item) {
                    if( item.cues ){
                        mpf.cues.setCueLists( item.cues, item.guid );
                        delete item.cues; // these don't show up in metadata
                    }
                    mpf.metadata.setData( item, item.guid);
                    playlist.push(item.guid);
                });
                if(options.isPlaylist)
                    mpf.playlist.setPlaylist(playlist);
            });
            this._mrss.listen("error", function (e) {
                mpf.warn(e.code, e.message)
            });
        }
        this._mrss.load(url);
        return this;
    };

    MrssService.prototype = {
        load : function ( url, extraData) {
            var params = {};
            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    this.event("error", {
                        url : url,
                        code : "MRSSAjaxError",
                        message: errorThrown + " :: " + url
                    })
                },
                success : function (response, textStatus, jqXHR) {
                    var items = this.parse(response);
                    this.event("data", {
                        'items': items,
                        'data': extraData
                    })
                }
            });
        },

        parse : function (data) {
            var self = this;
            var items = [];
            var nodes = $(data).find('item').toArray();

            $.each(nodes, function(i, node) {
                items.push( self.parseItem(i, node) );
            });
            return items;
        },

        parseItem : function (i, itemXml) {
            var self = this;
            var item = {};
            var el = $(itemXml);
            var time = (new Date()).getTime();

            // redundant selectors due to compatibility issues: http://bugs.jquery.com/ticket/10377
            var content = el.find('media\\:content, content');
            item.content = [];
            item.group = {};
            $.each(content, function (i, node) {
                node = $(node);
                var codec = node.attr('codec');
                var type = node.attr('type') || '';
                if( type && codec )
                    type += 'codec="'+codec+'"';
                var content = {
                    url : node.attr('url'),
                    fileSize : node.attr('fileSize'),
                    type : type,
                    medium : node.attr('medium'),
                    isDefault : node.attr('isDefault'),
                    expression : node.attr('expression') || "full",
                    bitrate : node.attr('bitrate'),
                    framerate : node.attr('framerate'),
                    samplingrate : node.attr('samplingrate'),
                    channels : node.attr('channels'),
                    duration : node.attr('duration'),
                    height : node.attr('height'),
                    width : node.attr('width'),
                    lang : node.attr('lang'),
                    codec : codec
                };
                item.content.push(content);

                // item.group[expression] = [ content, content ]
                if( ! item.group[content.expression] )
                    item.group[content.expression] = [];
                item.group[content.expression].push(content)
            });

            // mpf requires a GUID, so generate one if missing
            item.guid = el.find('guid').text() || "MPF_" + i + "_" + (new Date).getTime() ;
            item.title = el.find('media\\:title, title').first().text();
            item.description = el.find('media\\:description, description').first().text();

            item.thumbnails = [];
            el.find('media\\:thumbnail, thumbnail').each( function (i, node) {
                var thumb = $(node);
                item.thumbnails.push({
                    url : thumb.attr('url'),
                    width : thumb.attr('width'),
                    height : thumb.attr('height'),
                    time : thumb.attr('time')
                })
            });
            if( item.thumbnails.length )
                item.thumbnail = item.thumbnails[0].url;

            item.subTitles = [];
            el.find('media\\:subTitle, subTitle').each( function (i, node) {
                var track = $(node);
                item.subTitles.push({
                    type : track.attr('type'),
                    lang : track.attr('lang'),
                    href : track.attr('href')
                })
            });
            item.subTitle = item.subTitles[0];

            item.rating = el.find('media\\:rating, rating').first().text();
            item.adult = el.find('media\\:adult, adult').first().text();
            item.keywords = el.find('media\\:keywords, keywords').first().text();


            var hash = el.find('media\\:hash, hash');
            item.hash = {
                algo : hash.attr('algo'),
                text : hash.text()
            };

            var player = el.find('media\\:player, player');
            item.player = {
                url : player.attr('url'),
                height : player.attr('height'),
                width : player.attr('width')
            };

            item.credits = [];
            el.find('media\\:credit, credit').each( function (i, node) {
                var credit = $(node);
                item.credits.push({
                    role : credit.attr('role'),
                    scheme : credit.attr('scheme'),
                    text : credit.text()
                })
            });
            item.credit = item.credits[0];

            var copyright = el.find('media\\:copyright, copyright');
            item.copyright = {
                url : copyright.attr('url'),
                text : copyright.text()
            };

            item.text = [];
            el.find('media\\:text, text').each( function (i, node) {
                var line = $(node);
                item.text.push({
                    type : line.attr('type'),
                    lang : line.attr('lang'),
                    start : line.attr('start'),
                    end : line.attr('end'),
                    text : line.text()
                })
            });

            item.restrictions = [];
            el.find('media\\:restriction, restriction').each( function (i, node){
                    var r = $(node);
                    var type = r.attr('type');
                    item.restrictions[type] = {
                        relationship : r.attr('relationship'),
                        text : player.text()
                    }
            });


            /*
             not implemented:
             media:community
                media:starRating
                media:statistics
                media:tags
             media:comments
                media:comment
             media:embed
                media:param
             media:responses
                media:response
             media:backLinks
                media:backLink
             media:status
             media:price
             media:license
             media:peerLink
             media:location
                georss:where
                gml:Point
                gml:pos
             media:rights
             media:scenes
                media:scene
             */

            /* MPF extensions */
            el.find('mpf\\:attribute, attribute').each( function (i, node){
                var attr = $(node);
                var type = MetaPlayer.script.camelCase( attr.attr('name') );
                MetaPlayer.script.objectPath( item, type, attr.text() );
            });


            item.cueTracks = [];
            el.find('media\\:cueTrack, cueTrack').each( function (i, node) {
                var track = $(node);
                item.cueTracks.push({
                    type : track.attr('type'),
                    href : track.attr('href')
                })
            });

            item.cues = {};
            el.find('mpf\\:cue, cue').each( function (i, node) {
                var track = $(node);
                var type = track.attr('type') || 'unknown';
                var format = track.attr('format') || '';
                var cue = {
                    start : MetaPlayer.script.parseSrtTime( track.attr('start') || ''),
                    end : MetaPlayer.script.parseSrtTime( track.attr('end') || '')
                };

                if( cue.end == null )
                    delete cue.end;

                if(! item.cues[type] )
                    item.cues[type] = []

                if( format  == "json") {
                    try {
                        $.extend(cue, JSON.parse( track.text() ))
                    }
                    catch(e){
                        self.event("error", {
                            code : "MRSSJsonError",
                            message: e.toString() + " :: " + track.text()
                        });
                        return false;
                    }
                }
                else {
                    cue.text = track.text();
                }
                item.cues[type].push( cue );
            });

            return item;
        }
    };

    window.xmlnsFind = function (node, tagname){
        $.grep( $(node).find('*'), function (el, i){
            console.log("e: " + el.tagName + " .. " + el.nodeName );
        })
    }

})();(function () {

    var $ = jQuery;

    var defaults = {
        msQuotes : true,
        rampHost : "http://api.ramp.com/v1/mp2/playlist/",
        retries : 3,
        retryDelayMSec : 4000
    };

    var RampService = function (player, url, options) {
        this.config = $.extend({}, defaults, options);
        this.dispatcher = MetaPlayer.dispatcher(this);
        this.player = player;
        this._currentUrl = null;
        this.rampHost = this.config.rampHost;
        this._retries = 0;
        this.player.listen( MetaPlayer.READY, this.onReady, this);
    };

    MetaPlayer.addPlugin("ramp", function (apikey, rampId, options) {
        if(! this._ramp )
            this._ramp =  new RampService(this, apikey, rampId, options);

        var ramp = this._ramp;

        // if they pass in a url...
        if( apikey && apikey.match("/") ){
            // if passed in a template url
            if( apikey.match(/[\?\&]e=$/) ){
                ramp.rampHost = apikey;
            }
            // else passed in a playlist url
            else if(! this.ready )
                ramp._currentUrl = apikey;
            else
                ramp.load( apikey , true);
        }
        // if they pass in an api token
        else if( apikey ) {
            ramp.apiKey = apikey;
            if( rampId ) {
                if(! rampId.match(/^ramp:/) )
                    rampId = "ramp:" + rampId;
                ramp._currentUrl = rampId
            }
        }
        return this;
    });

    RampService.prototype = {

        onReady  : function (e) {
            this.player.metadata.listen( MetaPlayer.MetaData.LOAD,
                this.onMetaDataLoad, this);

            this.player.metadata.listen( MetaPlayer.DESTROY,
                this.onDestroy, this);

            if( this._currentUrl )
                this.load(this._currentUrl, true);
        },

        onMetaDataLoad : function (e) {
            var data = e.data;
            var uri;
            if(data.ramp && data.ramp.serviceURL ){
                uri = data.ramp.serviceURL
            }
            else if( e.uri.match(/^ramp:/) ){
                uri = e.uri;
            }
            if( uri ) {
                this.load(uri);
                e.stopPropagation(); // let others know we're on it.
                e.preventDefault();
            }
            // else fall through to noop if not recognized
        },

        onDestroy : function () {
            this.dispatcher.destroy();
            delete this.config;
            delete this.player;
        },

        load : function ( uri, isPlaylist ) {
            var track;

            // parse format:  "ramp:publishing.ramp.com/sitename:1234"
            var url = uri;
            if( typeof uri == "string" &&  uri.match(/^ramp\:/) ) {
                var parts = this.parseUrl(uri);

                // ex.   ramp://publishing.ramp.com/:12345
                if( parts.apiKey && parts.apiKey.match('/') ){
                    url = parts.apiKey + parts.rampId;
                }
                // ex.   ramp:QWER1234ASDF2345:12345
                // ex.   ramp:12345  w/ ramp("QWER1234ASDF2345")
                else if( parts.apiKey || this.apiKey ){
                    parts.apiKey = this.apiKey;
                    url = this.rampHost + "?apikey="
                        + encodeURIComponent(parts.apiKey)
                        + "&e="
                        + encodeURIComponent(parts.rampId)
                }
                // ex.   ramp:12345  w/ ramp("http://publishing.ramp.com/foo/mp2-playlist/e=")
                else if( this.rampHost ) {
                    url  = this.rampHost + parts.rampId
                }

            }

            var params = {
            };

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    if( this._retries <  this.config.retries ) {
                        setTimeout( this.bind( function (e) {
                            this.load(uri, isPlaylist);
                        }), this.config.retryDelayMSec * this._retries); // increase delay with each retry
                        this._retries++;
                        this.player.warn( "ServiceAjaxError", jqXHR.status + " " + textStatus + " "+ uri +" attempt #" + this._retries);
                        return;
                    }

                    this.player.error( "ServiceAjaxError",  jqXHR.status + " " + textStatus + " "+ uri +"  attempt #" + this._retries);
                    this._retries = 0;
                },
                success : function (response, textStatus, jqXHR) {
                    this._retries = 0;
                    var items = this.parse(response, url);
                    if( items.length )
                        this.setItems(items, isPlaylist);
                    else {
                        this.player.warn( "ServiceParseError", "Invalid Playlist ["+ uri +"]")
                    }
                }
            });
        },


        setItems : function (items, isPlaylist) {
            var metadata = this.player.metadata;
            var playlist = this.player.playlist;
            var cues = this.player.cues;

            // first item contains full info
            var first = items[0];
            var guid = first.metadata.guid;

            cues.setCueLists( first.cues, guid  );
            metadata.setData( first.metadata, guid, true );

            // subsequent items contain metadata only, no transcodes, tags, etc.
            // they require another lookup when played, so disable caching by metadata
            if( playlist  ) {
                var self = this;
                // add stub metadata
                $.each(items.slice(1), function (i, item) {
                    metadata.setData(item.metadata, item.metadata.guid, false);
                });

                // queue the uris
                if( isPlaylist ) {
                    playlist.setPlaylist( $.map(items, function (item) {
                        return item.metadata.guid;
                    }));
                }
            }
            else {
                // only trigger a DATA event if not playing video
                metadata.load(guid);
            }
        },

        parse : function (data, uri) {
            var self = this;
            var playlist = $(data).find('par').toArray();
            var media = [];
            $.each(playlist, function(i, node) {
                media.push( self.parseMedia(node, uri) );
            });
            return media;
        },

        parseMedia : function (node, uri) {
            var item = {
                metadata : {},
                cues : {}
            };

            var self = this;
            var video = $(node).find('video');

            // mrss metadata
            item.metadata.title = video.attr('title');
            item.metadata.description = video.find('metadata meta[name=description]').text();
            item.metadata.thumbnail = video.find('metadata meta[name=thumbnail]').attr('content');
            item.metadata.guid = "ramp:" + video.find('metadata meta[name=rampId]').attr('content');
            item.metadata.link = video.find('metadata meta[name=linkURL]').attr('content');

            item.metadata.subTitles = [];
            video.find('metadata meta[name=subTitle]').each( function (i, node){
                var track = $(node);
                item.metadata.subTitles.push({
                        type : track.attr('content'),
                        href : track.text()
                    });
            });
            item.metadata.subTitle = item.metadata.subTitles[0];

            item.metadata.cueTracks = [];
            video.find('metadata meta[name=cueTrack]').each( function (i, node){
                var track = $(node);
                    item.metadata.cueTracks.push({
                        type : track.attr('content'),
                        href : track.text()
                    });
            });

            // other metadata
            item.metadata.ramp = {
            };
            video.find('metadata meta').each( function (i, metadata){
                var meta = $(metadata);
                item.metadata.ramp[ meta.attr('name') ] = meta.attr('content') || meta.text();
            });

            if( item.metadata.ramp.rampId && ! item.metadata.ramp.serviceURL ){
                if( uri.match( /mp2[-\/]playlist/ ) ) {
                    item.metadata.ramp.serviceURL = uri.replace(/e=(\d+)/, "e=" + item.metadata.ramp.rampId);
                }
            }

            // content & transcodes
            item.metadata.content = [];
            item.metadata.content.push({
                name : "default",
                url : video.attr('src'),
                type : self.resolveType( video.attr('src') ),
                isDefault : true
            });

            var transcodes = $(node).find("metadata[xml\\:id^=transcodes]");
            transcodes.find('meta').each(function (i, transcode){
                var code = $(transcode);
                item.metadata.content.push({
                    name : code.attr('name'),
                    type : code.attr('type') || self.resolveType( code.attr('content') ),
                    url : code.attr('content'),
                    isDefault: false
                });
            });

            // jump tags
            item.metadata.ramp.tags = [];
            item.cues.tags = [];
            var jumptags = $(node).find("seq[xml\\:id^=jumptags]");
            jumptags.find('ref').each(function (i, jump){
                var tag = {};
                $(jump).find('param').each( function (i, val) {
                    var param = $(val);
                    tag[ param.attr('name') ] = param.text();
                });
                if( tag.timestamps )
                    tag.timestamps = tag.timestamps.split(',');
                item.metadata.ramp.tags.push(tag);

                $.each(tag.timestamps, function(i, time){
                    var event = {
                        term : tag.term,
                        start: parseFloat(time)
                    };
                    item.cues.tags.push(event);
                });
            });

            // event tracks / MetaQ
            var metaqs = $(node).find("seq[xml\\:id^=metaqs]");
            metaqs.find('ref').each(function (i, metaq){
                var event = {};

                // handle mp2-style cues, which are collapsed into one cue entry
                if( $(metaq).find('param[name="origin"]').text() == "metaq" ) {
                    self.parseMp2Cues(item.cues, metaq);
                    return;
                }

                $(metaq).find('param').each( function (i, val) {
                    var param = $(val);
                    var name =  param.attr('name');
                    var text =  self.deSmart( param.text() );
                    if( name == "code"  ) {
                        try {
                            var code = $.parseJSON( text );
                            $.extend(true, event, code);
                        }
                        catch (e){
                            event.code = text;
                        }
                    }
                    else
                        event[ name ] = text;

                });
                if( ! item.cues[event.plugin] )
                    item.cues[event.plugin] = [];

                item.cues[event.plugin].push(event);
            });

            // transcript
            var smilText = $(node).find("smilText");
            item.cues.captions = this.parseCaptions(smilText);
            return item;
        },

        parseMp2Cues : function  (cues, metaq){
            var self = this;
            var mq = $(metaq);
            var event = {};

            event.term = mq.find('param[name=term]').text();

            var plugin = mq.find('param[name=id]').text();
            if( plugin == "timeline-q")
                event.plugin = "timeQ";
            else if( plugin == "adhoc-js")
                event.plugin = "script";


            $(metaq).find('param').each( function (i, val) {
                var param = $(val);
                var name =  param.attr('name');
                event[ name ] = self.deSmart( param.text() );
            });

            var timestamps = event.timestamps || '';
            delete event.timestamps;

            if( ! cues[event.plugin] )
                cues[event.plugin] = [];

            $.each(timestamps.split(','), function (i, val){
                var e = $.extend({}, event);
                e.start = parseFloat(val);
                cues[event.plugin].push(e);
            });
        },

        parseCaptions : function (xml) {
            // static factory constructor
            var self = this;
            var nodes = $(xml).contents();
            var cues  = [
            ];

            var current = {
                text : '',
                start: 0,
                offset : 0
            };

            var previous;

            var getStart = function (node, lastCue) {
                var el = $(node);
                var parseSeconds = this.parseSeconds;


                var begin = el.attr('begin');
                if( begin != null )
                    return self.parseSeconds(begin);

                var _next = el.attr('next');
                if( _next != null )
                    return self.parseSeconds(_next) + lastCue.start;
            };

            var handleNode = function (node, text) {
                var start = getStart(node);
                previous = current;
                previous.end = start;
                if( text )
                    previous.text += text ;
                cues.push(previous);
                current = {
                    text: '',
                    start : start,
                    offset : current.offset+1
                };
            };

            nodes.each( function ( i, node ){
                var text = nodes[i].data;
                if( node.tagName === undefined ){
                    if( self.config.msQuotes ) {
                        text = self.deSmart(text);
                    }
                    current.text += text;
                    return;
                }

                switch (node.tagName) {
                    case "smil:clear":
                    case "clear":
                        handleNode(node);
                        break;

                    case "smil:tev":
                    case "tev":
                        handleNode(node);
                        break;

                    case "smil:br":
                    case "br":
                        handleNode(node, "<br />" );
                        break;

                    case "smil:div":
                    case "smil:p":
                    case "smil:span":
                    default:
                        throw "unsupported tag";
                    // unsupported...
                }
            });

            if( current.text )
                cues.push(current);

            return cues;
        },

        parseSeconds : function (str) {
            // http://www.w3.org/TR/smil/smil-timing.html#Timing-ClockValueSyntax
            var lastChar = str.substr(-1);
            var val = parseFloat(str);

            if( lastChar == "s")
                return val;

            if( lastChar == "m")
                return val * 60;

            if( lastChar == "h")
                return val * 3600;

            var sec = 0;
            var p = str.split(':');
            for (var i = 0; i < Math.min(p.length, 4); i++)
                sec += Math.pow(60, i) * parseFloat(p[i]);
            return sec;
        },

        parseUrl : function ( url, obj ) {
            var parts = url.split(':');
            if( obj == undefined)
                obj = {};
            if( parts[0] !== "ramp" )
                obj.url = url;
            else if( parts.length == 3 ){
                obj.apiKey = parts[1];
                obj.rampId = parts[2];
            }
            else {
                obj.rampId = parts[1];
            }
            return obj;
        },

        toUrl : function ( item ) {
            return "ramp:" + item.ramp.rampHost + ":" + item.ramp.rampId;
        },

        deSmart : function (text) {
            return text.replace(/\xC2\x92/, "\u2019" );
        },

        resolveType : function ( url ) {
            var ext = url.substr( url.lastIndexOf('.') + 1 );

            if( url.match("www.youtube.com") ) {
                return "video/youtube"
            }

            if( ext == "ogv")
                return "video/ogg";

            // none of these seem to work on ipad4
            if( ext == "m3u8" )
                return  "application/application.vnd.apple.mpegurl";

            return "video/"+ext.toLowerCase();
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            }
        }
    };


})();
(function () {

    var $ = jQuery;

    var defaults = {
    };

    var SrtService = function (options) {
        if( ! (this instanceof SrtService ))
            return new SrtService(options);
        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
    };

    MetaPlayer.srt = function (url, callback, options) {
        var srt = SrtService(options);
        srt.listen("data", function (e) {
            callback && callback(e.cues)
        });
        srt.load(url);
    };

    MetaPlayer.prototype.srt = function (url) {
        var mpf = this;
        if(! mpf._srt ) {
            mpf._srt  = SrtService();

            mpf.metadata.listen("data", function (e) {
                var tracks = e.data.subTitles || [];
                var i, url, track;
                for(i = 0; i< tracks.length; i++ ){
                    track = tracks[i];
                    if( track.type == "application/x-subrip" || track.href.match(/\.srt$/) ) {
                        url = tracks[i].href;
                        break;
                    }
                }
                if( url )
                    mpf._srt.load(url, e.uri)
            });

            mpf._srt.listen("data", function (e) {
                mpf.cues.setCues("captions", e.cues,  e.data );
            });
        }

        if( url )
            mpf._srt.load(url, mpf.metadata.getFocusUri() );
        return mpf;
    };

    SrtService.prototype = {
        load : function ( url, passedData) {
            var params = {};

            $.ajax(url, {
                dataType : "text",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    this.event("error", {
                        url : url,
                        data : passedData,
                        status : textStatus,
                        message: errorThrown
                    });
                },
                success : function (response, textStatus, jqXHR) {
                    var captionData = this.parse(response);
                    if( captionData )
                        this.event("data", {
                            url : url,
                            data : passedData,
                            cues : captionData
                        });
                }
            });
        },

        parse : function (text) {
            var captions = [];
            // don't /\n/ use regex! http://blog.stevenlevithan.com/archives/cross-browser-split
            var lines = text.split("\n");
            var line, times, cue, attr, content, buffer;

            while( line = lines.shift() ){
                buffer = [];
                cue = {
                    start : null,
                    end : null,
                    text : null
                };
                content = [];

                // optional id (webvtt)
                if( line.indexOf("-->") == -1){
                    cue.id = line;
                    line = lines.shift();
                    buffer.push(line);
                }

                // expect a timestamp
                times = line && line.match(/^([\d\,\:]+)\s*-->\s*([\d\,\:]+)(?:\s+(.*))?/);
                if ( times ) {
                    cue.start = MetaPlayer.script.parseSrtTime(times[1]);
                    cue.end = MetaPlayer.script.parseSrtTime(times[2]);
                    line = lines.shift();
                    buffer.push(line);

                    // support simple cue attributes of form "\w+:[^\s\:]+"
                    if( times[3] ){
                        $.each(times[3].split(' '), function (i,val){
                            var parts = val.split(":");
                            var name =  MetaPlayer.script.camelCase(parts[0]);
                            if( parts[1] )
                                cue[ name ] = parts[1]
                        })
                    }
                }

                while( line && line.length ) {
                    content.push(line);
                    line = lines.shift();
                    buffer.push(line);
                }
                cue.text = content.join("\n");

                var data;
                if( cue.format ){
                    if ( cue.format == "json") {
                        try {
                            data= JSON.parse(cue.text);
                            delete cue.format;
                            delete cue.text;
                            $.extend(cue, data);
                        }
                        catch(e){
                            cue.error = e.toString();
                        }
                    }
                }

                if( cue.start != null && cue.end != null && cue.text ){
                    captions.push(cue);
                }
                else {
                    try {
                        console.warn(cue, "invalid srt cue:\n" + buffer.join("\n") );
                    } catch(e){}
                }
            }
            return captions;
        }


    };

})();
(function () {

    var $ = jQuery;

    var defaults = {
    };

    var defaultSettings = {
        lang : 'en',
        textEdge : 'edge-drop',
        textOpacity : 'opacity-normal',
        textColor : 'white',
        textFont : 'font-default',
        textSize : 'size-100',
        frameOpacity : 'alpha-semi',
        frameColor : 'black'
    };

    var rules = {
        'size-50' : {
            'font-size' : '.5em'
        },
        'size-100' : {
            'font-size' : '1em'
        },
        'size-150' : {
            'font-size' : '1.5em'
        },
        'size-200' : {
            'font-size' : '2em'
        },

        'edge-none' : {
            filter: 'none',
            'text-shadow' : 'none'
        },
        'edge-drop' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=1,offY=1,color=000000)',
            'text-shadow' : '#000000 .05em .05em 2px'
        },
        'edge-outline' : {
            filter: 'glow(color=black,strength=3)',
            'text-shadow' : '#000000 1px 1px 0, #000000 -1px -1px 0, #000000 1px -1px 0, #000000 -1px 1px 0'
        },
        'edge-raised' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=-1,offY=-1,color=ffffff)',
            'text-shadow' : '#ffffff -1px -1px 0'
        },
        'edge-depressed' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=1,offY=1,color=ffffff)',
            'text-shadow' : '#ffffff 1px 1px 0'
        },
        'edge-uniform' : {
            filter: 'glow(color=white,strength=3)',
            'text-shadow' : '#ffffff 1px 1px 0, #ffffff -1px -1px 0, #ffffff 1px -1px 0, #ffffff -1px 1px 0'
        },

        'opacity-normal' : {
            'opacity' : '1'
        },
        'opacity-semi' : {
            'opacity' : '.75'
        },

        'alpha-trans' : {
            '_alpha' : '0'
        },
        'alpha-semi' : {
            '_alpha' : '.5'
        },
        'alpha-opaque' : {
            '_alpha' : '1'
        },

        'white' : {
            'color' : '#ffffff'
        },
        'red' : {
            'color' : '#ff0000'
        },
        'magenta' : {
            'color' : '#ff27ff'
        },
        'yellow' : {
            'color' : '#ffff00'
        },
        'green' : {
            'color' : '#00ff00'
        },
        'cyan' : {
            'color' : '#00ffff'
        },
        'blue' : {
            'color' : '#0000ff'
        },
        'black' : {
            'color' : '#000000'
        },

        'font-mono-sans' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Andale Mono, monospace"
        },
        'font-prop-sans' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Arial, sans-serif"
        },
        'font-mono-serif' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Courier, monospace"
        },
        'font-prop-serif' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Times, serif"
        },
        'font-casual' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Comic Sans, Comic Sans MS, fantasy"
        },
        'font-cursive' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Lucida Handwriting, cursive"
        },
        'font-small-caps' : {
            'text-transform' : 'uppercase',
            "font-family" : "Verdana, sans-serif",
            "font-size" : ".9em"
        },
        'font-default' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Verdana, sans-serif"
        }
    };
    var CaptionConfig = function (parent, target, options) {
        if( !(this instanceof CaptionConfig ))
            return new CaptionConfig(parent, target, options);

        this.config = $.extend({}, defaults, options);
        this.data = {};
        this.ui = {};
        this.target = $(target);
        this.createMarkup(parent);
        this.close();
        this.load();

        $(window).bind('storage', this.bind( function  (e){
            this.load();
        }));
    };

    MetaPlayer.addPlugin("captionconfig", function (options) {
        var captionconfig =  CaptionConfig(this.layout.stage, this.layout.base, options);

        if( this.controlbar && this.controlbar.addButton )
            this.controlbar.addButton(
                $("<div></div>")
                    .addClass("mp-cc-settings-btn")
                    .attr('title', "Configure Captions")
                    .click( captionconfig.bind( captionconfig.toggle ) )
        );

        this.captionconfig =  captionconfig;

        // initialize so that our render has a target
        if( ! this.captions.focus )
            this.captions();

        this.listen("ready", function () {
            captionconfig.render();
        });
    });

    MetaPlayer.CaptionConfig = CaptionConfig;

    CaptionConfig.prototype = {

        render: function  () {
            var t = $(this.target);
            var settings =  this.data;

            var textCss = {};
            textCss = $.extend( textCss, rules[settings.textEdge] );
            textCss = $.extend( textCss, rules[settings.textOpacity] );
            textCss = $.extend( textCss, rules[settings.textColor] );
            textCss = $.extend( textCss, rules[settings.textFont] );
            t.find('.mp-cc-text').css(textCss);

            var frameCss = {};
            frameCss = $.extend( frameCss, rules[settings.frameOpacity] );
            frameCss = $.extend( frameCss, rules[settings.frameColor] );
            frameCss = $.extend( frameCss, rules[settings.textSize] );
            frameCss.background = rgba( frameCss.color, frameCss._alpha );
            t.find('.mp-cc-frame').css(frameCss);
        },

        toggle : function () {
            if( this.ui.base.is(":visible") )
                this.close();
            else
                this.open();
        },

        close : function (){
            this.ui.base.toggle(false);
        },

        open : function (){
            this.ui.base.toggle(true);
        },

        load : function () {
            this.data = $.extend({}, defaultSettings);
            var save = localStorage.getItem("com.ramp.mpf.caption.settings");
            try {
                if( save != null ){
                    this.data = $.extend( this.data, JSON.parse(save) );
                }
            }
            catch (e) {
                //... ignore bad json
            }
            this.resetForm();
            this.render();
        },

        resetForm: function (settings) {
            this.ui.langSelect.val(this.data.lang);
            this.ui.displaySelect.val(this.data.display)
            this.ui.textFont.val(this.data.textFont);
            this.ui.textColor.select(this.data.textColor);
            this.ui.frameColor.select(this.data.frameColor);
            this.ui.textSize.select(this.data.textSize);
            this.ui.textEdge.select(this.data.textEdge);
            this.ui.textOpacity.select(this.data.textOpacity);
            this.ui.frameOpacity.select(this.data.frameOpacity);
            this.render()
        },

        setRule : function (name, rule) {
            this.data[name] = rule;
            this.render();
            this.save();
        },

        save : function () {
            var save = JSON.stringify(this.data);
            localStorage.setItem("com.ramp.mpf.caption.settings", save);
        },

        createMarkup : function (parent){

            this.ui.base = $('<div></div>')
                .addClass('mp-cc-config')
                .appendTo(parent);

            this.ui.panel = $('<div></div>')
                .addClass('mp-cc-config-panel')
                .appendTo(this.ui.base);

            // header
            this.ui.header = $("<div></div>")
                .addClass("mp-cc-config-header")
                .appendTo(this.ui.panel);

            $("<div></div>")
                .addClass("mp-cc-config-badge")
                .appendTo(this.ui.header);

            $("<div></div>")
                .addClass("mp-cc-config-title")
                .text("Closed Captions")
                .appendTo(this.ui.header);

            var headerRight = $("<div></div>")
                .addClass("mp-cc-config-header-right")
                .appendTo(this.ui.header);

            $("<div></div>")
                .addClass("mp-cc-config-reset")
                .text("Reset")
                .click( this.bind( function(e) {
                    this.data = $.extend({}, defaultSettings);
                    this.resetForm();
                }))
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-separator")
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-save")
                .text("Save")
                .click( this.bind( function(e) {
                    this.close();
                }))
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-hr")
                .appendTo(this.ui.panel);

            // body
            var body = $("<div></div>")
                .addClass("mp-cc-config-body")
                .appendTo(this.ui.panel);

            // body left col
            var left = $("<div></div>")
                .addClass("mp-cc-config-left")
                .appendTo(body);


            this.ui.langSelect =  this.textSelect([
                    {
                        name : "English",
                        value : "en"
                    }
                ]);
//            this.row( "Language", this.ui.langSelect).appendTo(left);

            this.ui.textFont =  this.textSelect([
                    {
                        name : "Verdana",
                        value : "font-default"
                    },
                    {
                        name : "Andale",
                        value : "font-mono-sans"
                    },
                    {
                        name : "Arial",
                        value : "font-prop-sans"
                    },
                    {
                        name : "Courier",
                        value : "font-mono-serif"
                    },
                    {
                        name : "Times",
                        value : "font-prop-serif"
                    },
                    {
                        name : "Casual",
                        value : "font-casual"
                    },
                    {
                        name : "Cursive",
                        value : "font-cursive"
                    },
                    {
                        name : "Capitals",
                        value : "font-small-caps"
                    }
                ])
                .change( this.bind( function(e) {
                    this.setRule("textFont", $(e.currentTarget).val() );
                }));
            this.row( "Font", this.ui.textFont).appendTo(left);


            this.ui.displaySelect =  this.textSelect([
                    {
                        name : "Pop On",
                        value : "pop"
                    },
                    {
                        name : "Roll Up",
                        value : "roll"
                    },
                    {
                        name : "Paint On",
                        value : "paint"
                    }
                ]);
//            this.row( "Display", displaySelect).appendTo(left);

            this.ui.textColor = ColorSelect().onChange( this.bind( function (val){
                this.setRule("textColor", val);
            }));
            this.row( "Text Color", this.ui.textColor.dom).appendTo(left);

            this.ui.frameColor = ColorSelect().onChange( this.bind( function (val){
                this.setRule("frameColor", val);
            }));
            this.row( "Frame Color", this.ui.frameColor.dom).appendTo(left);

            // body right col
            var right = $("<div></div>")
                .addClass("mp-cc-config-right")
                .appendTo(body);

//            $("<div></div>")
//                .addClass("mp-cc-config-row-empty")
//                .appendTo(right);


            var textTemplate ='<div class="mp-cc-config-text-template"><div>ABC</div></div>';

            this.ui.textSize = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textSize', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-size-50"),  "size-50")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-100"), "size-100")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-150"), "size-150")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-200"), "size-200");
            this.ui.textSize.dom.addClass("mp-cc-config-text-size");
            this.row("Text Size", this.ui.textSize.dom ).appendTo(right);


            this.ui.textEdge = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textEdge', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-none"), 'edge-none')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-drop"), 'edge-drop')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-outline"), 'edge-outline')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-raised"), 'edge-raised')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-depressed"), 'edge-depressed')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-uniform"), 'edge-uniform');
            this.ui.textEdge.dom.addClass("mp-cc-config-text-edge");
            this.row("Text Edge", this.ui.textEdge.dom ).appendTo(right);


            this.ui.textOpacity = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textOpacity', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-opacity-normal"), 'opacity-normal')
                .append( $(textTemplate).addClass("mp-cc-config-text-opacity-semi"), 'opacity-semi');
            this.ui.textOpacity.dom.addClass("mp-cc-config-text-opacity");
            this.row("Text Opacity", this.ui.textOpacity.dom ).appendTo(right);

            var frameTemplate ='<div class="mp-cc-config-frame-opacity"><div class="mp-cc-config-frame-fill"></div></div>';

            this.ui.frameOpacity = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('frameOpacity', val);
                }))
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-trans"), 'alpha-trans')
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-semi"), 'alpha-semi' )
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-opaque"), 'alpha-opaque' );
            this.ui.frameOpacity.dom.addClass("mp-cc-config-text-opacity");
            this.row("Frame Opacity", this.ui.frameOpacity.dom ).appendTo(right);


            // clear body
            $("<div></div>")
                .addClass("mp-cc-config-clear")
                .appendTo(body);

            // footer, sample
           this.ui.footer = $("<div></div>")
                .addClass("mp-cc-config-footer")
                .appendTo(this.ui.panel);

            var bg = $('<div></div>')
                .addClass("mp-cc-frame")
                .appendTo(this.ui.footer);

            $('<span></span>')
                .addClass("mp-cc-text")
//                .text("The quick brown fox jumps over the lazy dog")
                .text("Sample Caption")
                .appendTo(bg)
        },

        row : function (label, content) {
            var row = $("<div></div>")
                .addClass("mp-cc-config-row");

            $("<div></div>")
                .text(label)
                .addClass("mp-cc-config-label")
                .appendTo(row);

            var body = $("<div></div>")
                .addClass("mp-cc-config-row-body")
                .append( content )
                .appendTo(row);

            return row;
        },

        textSelect : function (options) {
            var select = $("<select></select>")
                .addClass("mp-cc-config-select");

            $.each(options, function (i, option) {
                $("<option></option>")
                    .text(option.name)
                    .val(option.value)
                    .addClass("mp-cc-config-option")
                    .appendTo(select);
            });
            return select;
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // an array of color boxes selector
    var ColorSelect = function () {
        if( ! (this instanceof ColorSelect) )
            return new ColorSelect();

        this.ui = {};
        this.index = null;
        this.values = [];
        this.callbacks = [];

        this.dom = $("<div></div>")
            .addClass("mp-cc-config-colorbox")
            .delegate(".mp-cc-config-color", "click", this.bind( function (e){
                var i = $(e.currentTarget).data('index');
                this.select(i)
            }));

        $.each(this.colors, this.bind( function (i, name) {
            this.colorBox(rules[name].color ).data('index', i).appendTo(this.dom);
        }));
    };

    ColorSelect.prototype = {
        colors : ['white', 'red', 'magenta', 'yellow', 'green', 'cyan', 'blue', 'black'],

        colorBox : function (color){
            var el = $("<div></div>")
                .addClass("mp-cc-config-color");

            $("<div></div>")
                .addClass("mp-cc-config-fill")
                .css('background', color)
                .appendTo(el);
            return el
        },

        select : function (index) {

            if( typeof index == "string" ) {
                var search = index;
                index = null;
                $.each( this.colors, function (i, val) {
                    if( val == search ) {
                        index = i;
                        return true;
                    }
                });
            }

            if( index == null || isNaN(index) )
                return;

            var children = this.dom.children();
            if( index == this.index )
                return;

            this.index = index;
            children.removeClass("mp-cc-config-color-selected");
            $(children[index]).addClass("mp-cc-config-color-selected");

            var val = this.colors[index];
            $.each(this.callbacks, function (i, callback) {
                callback( val );
            });
        },

        onChange : function ( fn ){
            this.callbacks.push(fn);
            return this;
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // an arrow-base selector that loops
    var Carousel = function () {
        if( ! (this instanceof Carousel) )
            return new Carousel();

        this.ui = {};
        this.index = null;
        this.values = [];
        this.callbacks = [];
        this.dom = $("<div></div>").addClass("mp-cc-config-carousel");

        $("<div></div>")
            .addClass("mp-cc-config-carousel-next")
            .click( this.bind(this.next) )
            .mousedown( function (e) { e.preventDefault() })
            .appendTo( this.dom );

        this.ui.body = $("<div></div>")
            .addClass("mp-cc-config-carousel-body")
            .appendTo( this.dom );

        $("<div></div>")
            .addClass("mp-cc-config-carousel-previous")
            .mousedown( function (e) { e.preventDefault() })
            .click( this.bind(this.previous) )
            .appendTo( this.dom );
    };

    Carousel.prototype = {
        select : function (index) {
            if( typeof index == "string" ) {
                var search = index;
                index = null;
                $.each( this.values, function (i, val) {
                    if( val == search ) {
                        index = i;
                        return true;
                    }
                });
            }

            if( index == null || isNaN(index) )
                return;


            var children = this.ui.body.children();
            var i = (index + children.length) % children.length; // avoids negative mods
            if( i == this.index )
                return;

            children.hide();
            $( children[i] ).show();
            this.index = i;

            var val = this.value();
            $.each(this.callbacks, function (i, callback) {
                callback( val );
            });
        },

        onChange : function ( fn ){
            this.callbacks.push(fn);
            return this;
        },

        value : function ( index ) {
            if( index == null )
                index = this.index;
            return this.values[index];
        },

        append : function (el, value) {
            if( value == null)
                value = this.values.length;

            this.ui.body.append( $(el).hide() );
            this.values.push( value  );
            return this;
        },

        next : function (e) {
            this.select(this.index + 1);
            e && e.preventDefault() && e.stopPropagation();
        },

        previous : function (e) {
            this.select(this.index - 1);
            e && e.preventDefault() && e.stopPropagation();
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }

    };

    function rgba (hex, alpha) {
        if( ! (hex && alpha) )
            return '';

        var rgba = [
            parseInt( hex.substr(1,2), 16),
            parseInt( hex.substr(3,2), 16),
            parseInt( hex.substr(5,2), 16),
            parseFloat(alpha)
        ];
        return "rgba(" + rgba.join(",") + ")";
    }
})();

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
(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        duplicates: false,
        refocus: true,
        cssPrefix : "mp-carousel",
        slideDurationMs : 750,
        renderAnnotations : true
    };

    /**
     * Carousel is a PopcornJS plugin for rendering MetaQ carousel events. The UI is rendered
     * as a window with sliding panels, controled through a tab control consisting of dots.
     * @name UI.Carousel
     * @class The MetaPlayer carousel widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the carousel will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.duplicates=false] If true, tile out duplicates rather than consolidating them into
     * one card.
     * @param {Boolean} [options.renderAnnotations=true] If the MetaPlayer controlbar is present, will render
     * timeline annotations indication when Carousel events will fire.
     * @param {Number} [options.slideDurationMs=750] The animation duration, in msec.
     * @param {Boolean} [options.refocus=true] If duplicates are consolidated (disable), refocus the single card on
     * subsequent events.
     * @example
     * # with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .carousel("#mycarousel", {
     *          duplicates: false,
     *          slideDurationMS: 750,
     *          renderAnnotations: true
     *     })
     *     .load();
     * @see MetaPlayer#carousel
     * @see Popcorn#carousel
     */
    var Carousel = function (id, options) {

        // return any previous instance for this player
        if(  Carousel.instances[id] ) {
            return Carousel.instances[id];
        }

        if( ! (this instanceof Carousel) )
            return new Carousel(id, options);

        this.config = $.extend({}, defaults, options);

        this.init(id);

        Carousel.instances[id] = this;
    };

    if( ! window.RAMP  ) {
        window.RAMP = {};
    }
    MetaPlayer.carousel = function  (target, options) {
        return new Carousel(target, options);
    };

    /**
     * @name MetaPlayer#carousel
     * @function
     * @description
     * Creates a {@link UI.Carousel} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the carousel will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .carousel("#mycarousel")
     *     .load();
     * @see UI.Carousel
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("carousel", function (target, options){
        var popcorn = this.popcorn;
        this.carousel = Carousel(target, options);
        this.carousel.player = this;
        this.cues.enable( 'carousel', { target: target }, {sequence: true });
    });


    Carousel.instances = {};
    Carousel._count = 0;


    Carousel.prototype = {
        init : function (id){

            this.target = $(id);
            this.scroller = $("<div></div>").addClass( this.cssName('scroller') ).appendTo(this.target);
            this.navbar = $("<div></div>").addClass( this.cssName('navbar') ).appendTo(this.target);
            this._uniques = {};
            this._autoscroll = true;


            this.target.addClass( this.cssName() );
            this.render();

            var self = this;
            var nav = this.find( this.cssName('nav') ).click( function (e) {
                self._navClick(e);
            });

            this.target.bind("mouseenter", function (e){
                self._autoscroll = false;
            });
            this.target.bind("mouseleave", function (e){
                self._autoscroll = true;
            });

            this.scroller.bind("touchstart", function (e) {
                self._dragStart(e);
            });

            this.scroller.bind("touchmove", function (e) {
                self._dragMove(e);
            });
            this.scroller.bind("touchend",function (e) {
                self._dragStop(e);
            });
        },

        _dragStart : function (e) {
            this.dragging = true;
            this.scroller.stop();
            this._dragStartPos = this.eventX(e);
            this._dragStartScroll = this.scroller.scrollLeft();
            e.preventDefault();
        },

        _dragMove : function (e) {
            var x = this.eventX(e) - this._dragStartPos- this._dragStartScroll;
            this.scroller.stop();
            this.scroller.scrollLeft(-x);
        },

        _dragStop : function (e) {
            this.dragging = false;
            this.snap();
        },

        _navClick : function (e){
            var i = $(e.currentTarget).data('index')
            this.scrollTo(i);
            this._highlight(i);
        },

        render : function () {
            var panels = this.find('content');
            $.each( panels, function (i, val){
                var panel = $(val);
                panel.css('position', 'absolute');
                panel.css('left', (i * 100) + "%" );
            });
            this._highlight()
        },

        scrollTo : function (i) {
            var to = this.target.width() * i;
            var self = this;
            this.scroller.stop().animate({
                    scrollLeft: to
                }, this.config.slideDurationMs, "swing",
                function () {
                    self._highlight()
                }
            );
        },

        currentIndex : function () {
            return this.scroller.scrollLeft() /  this.target.width();
        },

        snap : function () {
            this.scrollTo( Math.round( this.currentIndex() ) )
        },

        _highlight : function ( index ) {
            var highlightClass = this.cssName("selected");

            var i = (index != null) ? index :  Math.round( this.currentIndex() );

            this.find("selected").removeClass( highlightClass );

            $(this.find('nav')[i]).addClass( highlightClass );
        },

        eventX : function (e) {
            var pageX = e.pageX || e.originalEvent.touches[0].pageX;
            return pageX - this.target.offset().left;

        },

        // Popcorn :
        setup :  function (options) {
            var self = this;

            options.index = this.find('nav').length;
            var id = options.url || options.html;

            // render annotations if asked
            if( this.config.renderAnnotations && this.player
                && this.player.controls
                && this.player.controls.addAnnotation ){
                this.player.controls.addAnnotation(options.start, null, options.topic || '', 'metaq');
            }

            // prevent duplicate cards
            if(! this.config.duplicates ){
                if( this._uniques[ id ] != null ){
                    options.index = this._uniques[ id ];
                    options.duplicate = true;
                    return;
                }
                this._uniques[ id ] = options.index;
            }

            var card = $("<div></div>")
                .addClass( this.cssName("content"))
                .appendTo(this.scroller);


            var nav = $("<div></div>")
                .addClass( this.cssName("nav") )
                .attr('title', options.topic || '' )
                .data("index", options.index  )
                .click( function (e) {
                    self._navClick(e);
                })
                .appendTo( this.find('navbar')  );

            if( options.html) {
                if( options.html.match(/^http\:\/\//) ) {
                    card.html('');
                    $("<div></div>")
                        .addClass( this.cssName('loading') )
                        .appendTo(card);

                    $.ajax(options.html, {
                        dataType : "text",
                        timeout : 15000,
                        error : function (jqXHR, textStatus, errorThrown) {
                            if (status == "error")
                                card.empty().addClass( self.cssName("error") );
                        },
                        success : function (response, textStatus, jqXHR) {
                            card.html(response);
                        }
                    });
                }
                else {
                    card.html(options.html || '')
                }
            }
            if( options.url ) {
                var frame = $("<iframe></iframe>")
                    .attr("frameborder", "0")
                    .addClass( this.cssName('loading') )
                    .appendTo(card);

                frame.attr('src', options.url);
            }


            this.render();

        },

        focus : function (options) {
            if(! this._autoscroll )
                   return;

            if( options.duplicate && ! this.config.refocus )
                return;

            this.scrollTo( options.index );
        },

        blur : function (options) {
        },

        clear : function (options) {
            this.navbar.empty();
            this.scroller.empty();
            this._uniques = {};
        },

        // utils
        find : function (className){
            return this.target.find("." + this.cssName( className) );
        },
        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }
    };

    if( Popcorn ) {
        /**
         * Schedules a carousel card to be rendered and focused at a given time.
         * @name Popcorn#carousel
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the carousel
         * @param {String} config.topic The tooltip to be used on the navigation dot
         * @param {String} [config.html] The HTML content of the panel
         * @param {String} [config.url] An alternate to <code>html</code, and Ajax url for HTML content.
         * @param {Number} config.start Start time text, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         *  # optional configuration step
         *  MetaPlayer.carousel("#carousel", {
         *          duplicates: false,
         *  });
         *
         *  pop.carousel({
         *      target: "#carousel"
         *      topic : "one!"
         *      html : "<b>first card</b>",
         *      start: 1
         *  });
         *  pop.carousel({
         *      target: "#carousel"
         *      topic : "two!"
         *      url : /two.html",
         *      start: 10,
         *  });
         */
        Popcorn.plugin( "carousel" , {
            _setup: function( options ) {
                Carousel(options.target).setup(options)
            },

            start: function( event, options ){
                Carousel(options.target).focus(options)
            },

            end: function( event, options ){
                Carousel(options.target).blur(options);
            },

            _teardown: function( options ) {
                Carousel(options.target).clear();
            }
        });
    }

})();
(function () {

    var $ = jQuery;

    var defaults = {
        controls : true,
        fullscreen : false,
        annotations : 'tags',
        backButtonSec : 5,
        volumeBarSteps : 5,
        pauseDuringSeek : false,
        tracktip: true,
        volumeButtonSteps : 3
    };

    var ControlBar = function (target, player, options) {

        if( !(this instanceof ControlBar) )
            return new ControlBar(target, player, options);

        this.player = player;
        this.player.video.controls = false;

        this.config = $.extend(true, {}, defaults, options);

        if(typeof this.config.annotations == "string" )
            this.config.annotations = this.config.annotations.split(/\s+/);

        this.ui = {};
        if( ! target ) {
            target = $('<div></div>')
                .css('position', 'absolute')
                .css('width', '100%')
                .css('top', 'auto')
                .css('bottom', '0')
                .appendTo(player.layout.base)
                .get(0);
            this.ui.layoutPanel = player.layout.addPanel({})
        }

        this.target = $(target);
        this.createMarkup();

        if( MetaPlayer.iOS ){
            this.player.video.controls = true;
            this.ui.left.toggle(false);
            this.ui.right.toggle(false);
        }

        if( ! this.config.controls )
            this.ui.panel.hide();

        this.addListeners();
        this.render();

    };

    MetaPlayer.ControlBar = ControlBar;

    MetaPlayer.addPlugin("controlbar", function(options) {
        this.controlbar = ControlBar(null, this, options);
    });

    ControlBar.prototype = {

        createMarkup : function (){

            this.ui.base = $(this.target).addClass('mpf-controlbar')
                .mousemove( this.bind( this.focus ))
                .mouseout( this.bind( this.blur ));

            /* timeline */
            var tl = $('<div>')
                .addClass("mpf-controlbar-track")
                .appendTo(this.target)
                .bind("mousedown touchstart", this.bind( this.onTrackStart ));

            if( this.config.tracktip && MetaPlayer.TrackTip )
                this.ui.tracktip = MetaPlayer.TrackTip(tl, this.player);

            this.ui.buffer  = $('<div>')
                .addClass("mpf-controlbar-track-buffer")
                .appendTo(tl);

            this.ui.track  = $('<div>')
                .addClass("mpf-controlbar-track-fill")
                .appendTo(tl);

            this.ui.overlay = $('<div>')
                .addClass("mpf-controlbar-track-overlay")
                .appendTo(tl);

            this.ui.knob = $('<div>')
                .addClass("mpf-controlbar-track-knob")
                .appendTo(this.ui.track);

            /* button bar */
            this.ui.panel = $('<div>')
                .addClass("mpf-controlbar-panel")
                .appendTo(this.target);

            // left button group
            this.ui.left = $('<div>')
                .addClass("mpf-controlbar-panel-left")
                .appendTo(this.ui.panel);

            this.ui.play = $('<div>')
                .addClass("mpf-controlbar-play")
                .appendTo(this.ui.left)
                .attr('title', "Play")
                .click( this.bind( function () {
                    this.player.video.play();
                }));

            this.ui.pause = $('<div>')
                .addClass("mpf-controlbar-pause")
                .appendTo(this.ui.left)
                .attr('title', "Pause")
                .click( this.bind(function () {
                    this.player.video.pause();
                }));

            this.ui.back = $('<div>')
                .addClass("mpf-controlbar-back")
                .appendTo(this.ui.left)
                .attr('title', "Skip Back")
                .click( this.bind(function () {
                    this.player.video.currentTime -= this.config.backButtonSec;
                }));

            this.ui.clock= $('<div>')
                .addClass("mpf-controlbar-clock")
                .appendTo(this.ui.left);

            this.ui.time = $('<div>')
                .text("00:00")
                .addClass("mpf-controlbar-time")
                .appendTo(this.ui.clock);

            $('<div>')
                .html("&nbsp;/&nbsp;")
                .addClass("mpf-controlbar-time-spacer")
                .appendTo(this.ui.clock);

            this.ui.duration = $('<div>')
                .text("99:99")
                .addClass("mpf-controlbar-duration")
                .appendTo(this.ui.clock);

            // right button group
            this.ui.right = $('<div>')
                .addClass("mpf-controlbar-panel-right")
                .appendTo(this.ui.panel);

            this.ui.volume = $('<div>')
                .addClass("mpf-controlbar-volume")
                .appendTo(this.ui.right)
                .attr('title', "Toggle Mute")
                .click( this.bind( this.onMuteToggle ));

            var volumebar = $('<div>')
                .addClass("mpf-controlbar-volumebar")
                .appendTo(this.ui.right)
                .attr('title', "Set Volume")
                .bind("mousedown touchstart", this.bind( this.onVolumeStart ));

            this.ui.volumebar = $('<div>')
                .addClass("mpf-controlbar-volumebar-fill")
                .appendTo(volumebar);

            this.ui.cc = $('<div>')
                .addClass("mpf-controlbar-cc")
                .addClass("mpf-controlbar-cc-off")
                .appendTo(this.ui.right)
                .attr('title', "Toggle Captions")
                .click( this.bind( this.onCCToggle ) );

            this.ui.fullscreen = $('<div>')
                .addClass("mpf-controlbar-fullscreen")
                .attr('title', "Toggle Zoom")
                .click( this.bind( this.onFullscreenToggle ))
                .appendTo(this.ui.right)
                .toggle( Boolean(this.config.fullscreen)
            );

            this.toggle( this.config.controls );

        },

        addButton : function (el, position) {
            if( position != null )
                this.ui.right.children().eq(position).before(el);
            else
                el.appendTo(this.ui.right);
        },

        toggle: function (bool) {
            if( bool == null )
                bool = this.ui.panel.css("display") == 'none';

            this.ui.panel.css('display', bool ? 'block' : 'none');
            this.ui.knob.css('display', bool ? 'block' : 'none'); // overflow causes scrollbar in fullscreen

            if( this.ui.layoutPanel == null)
                return;

            var height = this.player.layout.isMazimized  ?  this.ui.track.height() : this.ui.base.height();
            this.player.layout.updatePanel(this.ui.layoutPanel, { bottom:  height});
        },

        addAnnotation : function (text, time, type) {
            var d = this.player.video.duration;
            if( !d )
                return;

            var el = $('<div>')
                .attr("title", text)
                .addClass("mpf-controlbar-track-marker")
                .appendTo(this.ui.overlay)
                .css('left', (time/d*100) + "%");

            if( type )
                el.addClass("mpf-controlbar-track-marker-" + type);

        },

        clearAnnotations : function (type) {
            if( type )
                this.ui.base.find(".mpf-controlbar-track-marker-"+type).remove();
            else
                this.ui.overlay.empty();
        },

        addListeners : function () {
            var v = this.player.video;
            v.addEventListener("loadstart", this.bind( this.onLoadStart ));
            v.addEventListener("pause", this.bind( this.renderControls) );
            v.addEventListener("playing", this.bind( this.renderControls) );
            v.addEventListener("canplay", this.bind( function () {
                if( MetaPlayer.iOS ){
                    this.player.video.controls = false;
                    this.ui.left.toggle(true);
                    this.ui.right.toggle(true);
                }
            }));
            v.addEventListener("ended", this.bind( this.renderControls) );
            v.addEventListener("loadstart", this.bind( this.renderControls) );
            v.addEventListener("durationchange", this.bind( this.renderDuration) );
            v.addEventListener("volumechange", this.bind( this.renderVolume) );
            v.addEventListener("timeupdate", this.bind( this.renderTime ));

            this.player.playlist.addEventListener("trackchange", this.bind( this.onTrackChange ));
            this.player.cues.addEventListener("cues", this.bind( this.onCues ));
            this.player.search.listen("results", this.onSearchResults, this);

            this.player.listen("ready", this.bind( function () {
                this.player.cues.disable("captions");
            }));
        },

        onTrackChange: function () {
            this._duration = null;
            this.clearAnnotations();
        },

        onLoadStart : function () {
            this.ui.cc.toggleClass("mpf-controlbar-cc-off", true);
            this.render();
        },

        focus : function () {
            clearTimeout(this._blurTimer);
            this._blurTimer = setTimeout( this.bind(function (){
                this.ui.knob.stop().animate({'opacity': 1 });
            }), 300);
        },

        blur : function () {
            clearTimeout(this._blurTimer);
            this._blurTimer = setTimeout( this.bind(function (){
                this.ui.knob.stop().animate({'opacity': 0 });
            }), 750);
        },

        render : function () {
            this.renderControls();
            this.renderDuration();
            this.renderVolume();
        },

        renderControls : function () {
            var v = this.player.video;

            // Play / Pause
            this.ui.pause.hide();
            this.ui.play.hide();

            if( v.paused )
                this.ui.play.show();
            else
                this.ui.pause.show();
        },

        renderDuration : function () {
            var d = this.player.video.duration;
            if( ! d ) {
                this.ui.clock.hide();
                return;
            }

            var f = MetaPlayer.format.seconds(d);

            this._duration = d;
            this.ui.duration.text(f);
            this.renderTime();
            this.renderCues();
            this.ui.clock.show();
        },

        renderVolume : function () {
            var p = this.player.video;

            if( MetaPlayer.iOS ) {
                this.ui.volume.hide();
                this.ui.volumebar.parent().hide();
            }

            // volume bar
            var v = p.muted ? 0 : p.volume;
            this.ui.volumebar.width( (v * 100) + "%" );

            // volume button
            var b = this.ui.volume;
            var steps = this.config.volumeButtonSteps;
            var step, css;

            // clear prior states
            b.attr('class', "mpf-controlbar-volume");

            if( v == 0 )
                css ="mpf-controlbar-muted";
            else if( steps ) {
                step = Math.ceil(v * steps);
                css = "mpf-controlbar-volume-" + step;
            }
            else
                css ="mpf-controlbar-unmuted";

            b.addClass(css);
        },

        onVolumeStart : function (e) {
            this._volumeDragging =  {
                move : this.bind(this.onVolumeMove),
                stop :  this.bind(this.onVolumeStop)
            };
            $(document)
                .bind("mousemove touchmove", this._volumeDragging.move)
                .bind("mouseup touchstop", this._volumeDragging.stop);
            this.onVolumeMove(e);
        },

        onVolumeStop: function (e) {
            if( ! this._volumeDragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._volumeDragging.move)
                .unbind("mouseup touchstop", this._volumeDragging.stop);
            this._volumeDragging = null;
            this.onVolumeMove(e);
        },

        onVolumeMove : function (e) {
            var v = this._dragPercent(e, this.ui.volumebar);

            var steps = this.config.volumeBarSteps;
            if( steps )
                v = Math.ceil(v * steps) / steps;

            this.player.video.volume = v;
            this.player.video.muted = false;
            e.preventDefault();
        },

        onMuteToggle : function (){
            var p = this.player.video;
            var v = p.muted ? 0 : p.volume;

            // unmute
            if( p.muted || v == 0 ) {
                p.muted = false;
                if( p.volume == 0 )
                    p.volume = 1;
            }

            // mute
            else {
                p.muted = true;
            }
        },

        renderTime : function () {
            this.renderClock();
            this.renderTimeline();
        },

        renderClock : function () {
            var t = this.player.video.currentTime;
            var f = "";
            if(! isNaN(t) )
                f = MetaPlayer.format.seconds(t);
            this.ui.time.text(f);
        },

        renderTimeline : function (force) {
            var v = this.player.video;
            var t = force == null ? v.currentTime : force;

            if( this._trackDragging && force == null)
                return;

            var w = 0;
            if( v.duration )
                w = t / v.duration * 100;

            if( w < 0 )
                w = 0;
            else if( w > 100 )
                w = 100;

            this.ui.track.width(w + "%");
        },

        onTrackStart : function (e) {
            this._trackDragging =  {
                move : this.bind(this.onTrackMove),
                stop :  this.bind(this.onTrackStop)
            };

            if( this.config.pauseDuringSeek ){
                this._trackDragging.resume = ! this.player.video.paused;
                this.player.video.pause();
            }
            $(document)
                .bind("mousemove touchmove", this._trackDragging.move)
                .bind("mouseup touchend", this._trackDragging.stop);
            this.onTrackMove(e);
        },

        onTrackStop : function (e) {
            if( ! this._trackDragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._trackDragging.move)
                .unbind("mouseup touchend", this._trackDragging.stop);

            if( this._trackDragging.resume )
                this.player.video.play();

            this.onTrackMove(e);

            this._trackDragging = null;

            if( this.player.tracktip )
                this.player.tracktip.close();
        },

        onTrackMove : function (e) {
            var v = this.player.video;

            if( ! v.duration || v.ad )
                return;

            var p = this._dragPercent(e, this.ui.track );

            if( p != null )
                this._trackDragging.lastTime = p * v.duration;

            if( e.type.match(/^touchend|mouseup/) ) {
                this.player.video.currentTime = this._trackDragging.lastTime;
            }

            this.renderTimeline(this._trackDragging.lastTime);

            if( this.player.tracktip )
                this.player.tracktip.open(this._trackDragging.lastTime);

            e.preventDefault();
        },

        onCCToggle : function (){
            this.toggleCaptions(null);
        },

        onFullscreenToggle : function () {
            if( this.player.config.maximize){
                if( this.player.layout.isFullScreen )
                    this.player.layout.window();
                else
                    this.player.layout.fullscreen();
                return;
            }

            if( this.player.layout.isMaximized )
                this.player.layout.restore();
            else
                this.player.layout.fullscreen();
        },

        toggleCaptions : function (bool) {
            var cues = this.player.cues;

            var enabled = (bool == null)
                ? ! cues.isEnabled('captions')
                : bool;

            if( enabled )
                cues.enable('captions');
            else
                cues.disable('captions');
        },

        onCues : function () {
            this._cuesRendered = false;
            this.renderCues();
        },

        renderCues : function () {

            this.clearAnnotations();

            var cues = this.player.cues;
            var hasCC = cues.getCaptions().length;
            this.ui.cc.toggleClass("mpf-controlbar-cc-off", ! hasCC);

            var plugins = this.config.annotations;
            var self = this;

            $.each( plugins, function (i, name) {
                $.each( cues.getCues(name), function (i, cue ){
                    self.addAnnotation(cue.term || cue.topic || cue.text || '', cue.start, name);
                });
            });
        },

        onSearchResults : function (e) {
            var results = e.data.results;

            this.clearAnnotations('search');

            if(! e.query )
                return;

            $.each(results, this.bind( function(i, result){
                this.addAnnotation(e.query, result.start, "search")
            }));
        },

        /* util */
        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        },

        _dragPercent : function (event, el) {
            var oe = event.originalEvent;
            var pageX = event.pageX;

            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length )
                    return;
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = $(el).parent();
            var x =  pageX - bg.offset().left;

            var p = x / bg.width();
            if( p < 0 )
                p = 0;
            else if( p > 1 )
                p = 1;
            return p
        }
    };



})();

// timeline / control bar for HTML5 media API
// supports timeline annotations
(function () {

    var $ = jQuery;

    var defaults = {
        cssPrefix : 'mp-controls',
        leading: true,
        trackIntervalMsec : 5000,
        clockIntervalMsec : 500,
        revealTimeMsec : 500,
        revealDelayMsec : 500,
        hideDelayMsec : 1500,
        annotationSeekOffsetSec : -1,
        createMarkup : true,
        renderTags : true,
        renderMetaq : false,
        autoHide : false,
        annotationAnimate : true,
        annotationMsec : 1200,
        annotationEntropy : 1,
        annotationSpacing : .5,
        showBelow : true
    };

    /**
     * The Controls player widget renders a timeline scrubber, play/pause button, and a current
     * playback timestamp. The timeline scrubber supports the addition of annotations.
     * @name UI.Controls
     * @class The MetaPlayer controls and timeline scrubber player widgets.
     * @constructor
     * @param {MetaPlayer} player A MetaPlayer instance.
     * @param {Object} [options]
     * @param {Boolean} [options.autoHide=false] Controls are only rendered during mouse hover.
     * @param {Boolean} [options.renderTags=true] Render any Tags metadata, if available.
     * @param {Boolean} [options.showBelow=true] Show the controls below the video (not overlaid).
     * @example
     * MetaPlayer(video)
     *       .controls({
     *           autoHide : false,
     *           renderTags : true,
     *           showBelow : true
     *       })
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .load();
     * @example
     * <iframe style="width: 100%; height: 375px" src="http://jsfiddle.net/ramp/PYzRm/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
     * @see MetaPlayer#controls
     */
    var Controls = function (player, options) {

        this.config = $.extend(true, {}, defaults, options);

        this.container = $(this.config.container ||  player.layout.base );
        this.player = player;
        this.video = player.video;

        this.annotations = [];
        this.video.controls = false;
        this._hasTween = $.easing.easeOutBounce; // jquery UI

        if( this.config.createMarkup )
            this.createMarkup();

        this.addDataListeners(player);
        this.addVideoListeners();
        this.addUIListeners();

        this.trackTimer = MetaPlayer.timer(this.config.trackIntervalMsec);
        this.trackTimer.listen('time', this.render, this);

        this.clockTimer = MetaPlayer.timer(this.config.clockIntervalMsec);
        this.clockTimer.listen('time', this.onClockTimer, this);

        this.revealTimer = MetaPlayer.timer(this.config.revealDelayMsec);
        this.revealTimer.listen('time', this.onRevealTimer, this);

        this.hideTimer = MetaPlayer.timer(this.config.hideDelayMsec);
        this.hideTimer.listen('time', this.onHideTimer, this);

        this.panel = this.player.layout.addPanel({ });


        if( this.config.autoHide ) {
            this.config.showBelow = false;
        }

        if( this.config.showBelow ) {
            this.showBelow(true);
        }

        if( MetaPlayer.iOS ){
            this.video.controls = true;
            this.toggle(false, 0);
            this.showBelow(false);
        }

    };

    /**
     * @name MetaPlayer#controls
     * @function
     * @description
     * Creates a {@link UI.Controls} instance with the given options.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .controls()
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/PYzRm/">Live Example</a>
     * @see UI.Controls
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("controls", function (options) {
        this.controls = new Controls(this, options);
    });

    Controls.prototype = {

        addVideoListeners : function () {
            var self = this;
            $(this.video).bind('pause play playing seeked seeking ended', function(e){
                self.video.controls = false
                self.onPlayStateChange(e)
            });

            $(this.video).bind('adstart adstop', function(e){
                self.toggle( e.type != "adstart");
            });

            $(this.video).bind('durationchange', function(e){
                self.renderAnnotations(true);
            });
        },

        addUIListeners : function (el) {
            var self = this;

            this.find('play').click( function (e) {
                self.onPlayToggle(e);
            });

            this.find('track-knob').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track-fill').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track-buffer').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            $(document).bind("mouseup touchend", function (e) {
                return self.onKnobMouseUp(e);
            });

            $(document).bind("mousemove touchmove", function (e) {
                return self.onKnobMouseMove(e);
            });

            var player = $(this.container);
            player.bind("mouseenter touchstart", function (e) {
                if( self.config.autoHide ) {
                    self.hideTimer.reset();
                    self.revealTimer.start();
                }
            });

            player.bind("mouseleave", function (e) {
                if( self.config.autoHide ) {
                    self.revealTimer.reset();
                    self.hideTimer.start();
                }
            });
        },

        addDataListeners : function () {
            var metadata = this.player.metadata;

            if( this.config.renderTags )
                metadata.listen( MetaPlayer.MetaData.DATA, this.onTags, this);

            var cues = this.player.cues;
            cues.listen( MetaPlayer.Cues.CLEAR, this._onCuesClear, this);

            var search = this.player.search;
            search.listen(MetaPlayer.Search.RESULTS, this.onSearch, this);
        },

        onTags : function (e) {
            var tags = e.data.ramp.tags || [];
            var self = this;
            $.each(tags, function (i, tag){
                $.each(tag.timestamps, function (j, time){
                    self.addAnnotation(time, null, tag.term, "tag");
                });
            });
            this.renderAnnotations();
        },

        addAnnotations : function (events, type) {
            if( type == null )
                type = "metaq";
            var self = this;
            $.each(events, function (i, event){
                self.addAnnotation(event.start, event.end, event.text || event.term, type);
            });
            this.renderAnnotations();
        },

        _onCuesClear: function (e, track) {
            this.clearAnnotations();
        },

        onSearch : function (e, response) {
            var self = this;
            var searchClass = 'query';

            this.removeAnnotations( searchClass );

            $.each(response.results, function (i, result){
                var start = result.start;
                var text =  [ ];
                $.each(result.words, function (i, word){
                    text.push(word.text);
                });
                text = text.join(' ').replace(/[\r\n]/g, ' ');
                self.addAnnotation(start, null, text, searchClass);
            });

            this.renderAnnotations();
        },

        onClockTimer : function (e) {
            if( ! this.dragging )
                this.renderTime();
            //            if( ! this.buffered )
            //                this.renderBuffer();
        },

        onPlayToggle : function () {
            var p = this.video;
            if( p.paused )
                p.play();
            else
                p.pause();

            this.render();
        },

        onPlayStateChange : function (e) {
            // manage our timers based on play state

            if( ! this.config.autoHide ) {
                this.toggle(true);
                if( this.config.showBelow  ){
                    this.showBelow(true);
                }
            }

            if(! this.video.paused ){
                this.clockTimer.start();
                this.trackTimer.start();
            }
            else {
                this.clockTimer.reset();
                this.trackTimer.reset();
            }
            this.render();
        },

        onKnobMouseDown : function (e) {
            this.dragging = true;
            this.find('track-knob').stop();
            this.onKnobMouseMove(e);
            e.preventDefault();
            return false;
        },

        onKnobMouseUp : function (e) {
            if( ! this.dragging ) {
                return;
            }
            this.dragging = false;
            this.setByMousePosition(e);
        },

        onKnobMouseMove : function (e) {
            if( ! this.dragging )
                return;

            var buffer = this.find('track-buffer');
            var knob = this.find('track-knob');
            var track = this.find('track');

            var parent = knob.parent().offset();
            var x = ( e.pageX || e.originalEvent.touches[0].pageX ) - parent.left;


            x = Math.min(x, track.width());
            x = Math.max(x, 0);


            var ratio = x / track.width();
            var t = ratio * this.video.duration;

            this.renderTime(t);

            knob.css('left', x + "px");
            this.setByMousePosition(e, true);
        },

        setByMousePosition : function (e, throttle) {
            var knob = this.find('track-knob');
            var track = this.find('track');
            var parent = knob.parent();
            var x = knob.position().left;

            var percent = x / parent.width();
            var time = percent * this.video.duration;

            if( throttle )
                this.throttledSeek(time);
            else
                this.seek(time);
        },

        throttledSeek : function ( time ){
            clearTimeout( this.seekDelay );
            var self = this;
            this.seekDelay = setTimeout( function () {
                self.seek(time);
            }, 100);
        },

        seek : function (time) {
            clearTimeout( this.seekDelay );
            this.video.currentTime = parseFloat(time);
            this.render();
        },

        renderTime : function (time ) {
            if( ! time ) {
                time = this.video.currentTime; // render seek target if present
            }
            this.find("time-current").text( this.formatTime(time) );
        },

        //        renderBuffer : function (){
        //            var status = this.video.status();
        //            var bufferPercent = status.buffer.end / this.video.duration * 100;
        //            var buffer = this.find('track-buffer').stop();
        //            buffer.animate( { width : bufferPercent + "%"}, this.config.clockIntervalMsec, 'linear');
        //            if( bufferPercent == 100)
        //                this.buffered = true;
        //        },

        render : function (){
            var duration = this.video.duration;
            var time = this.video.currentTime; // render seek target if present

            this.find('play').toggleClass( this.cssName('pause'), ! this.video.paused );
            this.find('time-duration').html(' / ' + this.formatTime( duration ) );

            if( this.annotations.modified )
                this.renderAnnotations();

            var msec = this.config.trackIntervalMsec;

            // time isn't always ok correct immediately following a seek
            this.renderTime();

            var trackPercent, toPercent;
            if( duration ) {
                trackPercent = time / duration * 100;
                toPercent = (time +  (msec/1000) ) / duration * 100;
                toPercent = Math.min(toPercent, 100);
            }
            else {
                trackPercent = 0;
                toPercent = 0;
                toPercent =0;
            }

            var fill = this.find('track-fill').stop();
            var knob = this.find('track-knob').stop();

            if( this.video.paused ) {
                toPercent = trackPercent;
            }

            if( this.video.seeking ){
                msec = msec * 3; // give time and don't overshoot the animation
                return;
            }

            fill.width( trackPercent + "%");

            if( ! this.dragging ){
                knob.css('left', trackPercent + "%");
            }

            if( ! this.video.paused && this.config.leading && !(this.video.seeking || this.dragging) ){
                fill.animate( { width : toPercent + "%"}, msec, 'linear');
                knob.animate( { left : toPercent + "%"}, msec, 'linear');
            }

        },

        /**
         * toggles whether the controls are visible during mouse-over.
         * @name UI.Controls#autohide
         * @function
         * @param {Boolean} bool True for visible.
         */
        autoHide : function (bool) {
            if( bool )
                this.hideTimer.start();
            else
                this.hideTimer.stop();

            return this.config.autoHide = bool;
        },

        onRevealTimer : function () {
            this.toggle(true);
            this.revealTimer.reset();
        },

        onHideTimer : function () {
            this.toggle(false);
            this.hideTimer.reset();
        },

        /**
         * Toggles the visiblity of the controls
         * @name UI.Controls#toggle
         * @function
         * @param {Boolean} bool True for visible.
         * @param {Number} duration Seconds of fade in/out, if defined.
         */
        toggle : function (bool, duration) {
            var el = this.find();
            var v = $(this.container).find('.metaplayer-video');
            var show = bool == undefined ? !el.is(":visible") : bool;

            if( show  ) // make visible to fade in
                el.toggle(true);

            if( this.config.showBelow )
                this.showBelow(bool);

            el.stop().animate({
                    opacity: show ? 1 : 0
                }, duration == null ? this.config.revealTimeMsec : duration,
                function () {
                    el.toggle(show);
                });
        },

        /**
         * Toggles the rendering of the controls below playback, adding a bottom marign to the video.
         * @name UI.Controls#showBelow
         * @function
         * @param {Boolean} bool True for controls below the video..
         */
        showBelow : function (bool){
            var h = bool ? this.find().height() : 0;
            this.player.layout.updatePanel(this.panel, { bottom: h } );
        },

         /**
         * Toggles the rendering of the controls below playback, adding a bottom marign to the video.
         * @name UI.Controls#addAnnotation
         * @function
          * @param {Number} start The start time, in seconds
          * @param {Number} end The start time, in seconds. This will affect the width of the annotation container,
          * although the CSS theme may have a fixed with annotation marker.
          * @param {String} title The tooltip text.
          * @param [cssClass] An optional CSS class to append to the annotation for custom styling.
         */
        addAnnotation : function (start, end, title, cssClass) {
            var overlay = this.find('track-overlay');
            var marker = this.create("track-marker");

            marker.hide();

            var self = this;
            marker.click( function (e) {
                return self.seek(parseFloat(start) + self.options.annotationSeekOffsetSec);
            });

            if( title  )
                marker.attr('title', this.formatTime(start) + "  " + title);

            if( cssClass)
                marker.addClass( this.cssName(cssClass) );

            if( end == start )
                end = null;

            overlay.append(marker);
            this.annotations.modified = true;
            this.annotations.push({
                rendered: false,
                start : parseFloat( start ),
                end : parseFloat( end ) || null,
                el : marker,
                cssClass : cssClass
            });

            this.renderAnnotations();

            return marker;

        },

        renderAnnotations : function (force) {
            var duration = this.video.duration;
            if( ! duration )
                return;

            var videoHeight = $(this.video).height();
            var config = this.config;
            var last;
            var self = this;

            var spacing = this.config.annotationSpacing;
            var sorted = this.annotations.sort( Controls.annotationSort );

            $(sorted).each( function (i, annotation) {

                var trackPercent = annotation.start / duration * 100;
                if( trackPercent > 100 )
                    trackPercent = 100;

                annotation.el.css('left', trackPercent + "%");
                if( annotation.end ) {
                    var widthPercent = (annotation.end - annotation.start) / duration * 100;
                    annotation.el.css('width', widthPercent + "%");
                }

                // bouncy
                if(force || ! annotation.rendered  ){
                    if( config.annotationAnimate && self._hasTween ) {
                        annotation.el.css('top', -videoHeight).animate({
                                top : 0
                            },
                            (config.annotationMsec + ( Math.random() * config.annotationEntropy * config.annotationMsec)),
                            "easeOutBounce"
                        );
                    }
                    annotation.rendered = true;
                }

                annotation.el.show();

                // enforce annotation spacing rendering (but not firing)
                if (last && spacing != null
                    && last.el.position().left + ( last.el.width() * spacing )
                    > annotation.el.position().left ) {
                    annotation.el.stop().hide();
                    return;
                }

                last = annotation;
            });


            this.annotations.modified = false;
        },

        /**
         * Removes all annotation markers which were identified with given name. 
         * @name UI.Controls#removeAnnotations
         * @function
         * @param {String} className A CSS class name used to select annotations.
         */
        removeAnnotations : function (className) {
            var i, a;
            for(i = this.annotations.length - 1; i >= 0 ; i-- ) {
                a = this.annotations[i];
                if( a.cssClass == className ){
                    this.annotations.splice(i, 1);
                    a.el.remove();
                }
            }
        },

        clearAnnotations : function () {
            this.find('track-overlay').empty();
            this.annotations = [];
        },

        createMarkup : function () {
            var controls = this.create().appendTo(this.container);

            var box = this.create('box');
            controls.append(box)

            var play = this.create('play');
            play.append( this.create('icon-play') );
            box.append( play);
            box.append( this.create('fullscreen') );

            var time = this.create('time');
            time.append( this.create('time-current') );
            time.append( this.create('time-duration') );
            box.append(time);

            var track = this.create('track');
            track.append( this.create('track-buffer') );
            track.append( this.create('track-fill') );
            track.append( this.create('track-overlay') );
            track.append( this.create('track-knob') );
            box.append(track);
        },

        // display seconds in hh:mm:ss format
        formatTime : function (time) {
            if( isNaN(time) )
                return "-:-";

            var zpad = function (val, len) {
                var r = String(val);
                while( r.length < len ) {
                    r = "0" + r;
                }
                return r;
            };
            var hr = Math.floor(time / 3600);
            var min = Math.floor( (time %  3600) / 60);
            var sec = Math.floor(time % 60);
            var parts = [
                zpad(min, 2),
                zpad(sec, 2)
            ];
            if( hr )
                parts.unshift(hr);
            return parts.join(":");
        },

        /* core */
        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className){
            return $("<div></div>").addClass( this.cssName(className) );
        },

        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }

    };

    Controls.annotationSort = function (a, b) {
        var as = parseFloat( a.start );
        var bs = parseFloat( b.start );
        if( bs > as )
            return -1;
        if( as > bs )
            return 1;
        return 0;
    };

})();
( function () {
    var $ = jQuery;

    var defaults = {
        cssPrefix : "metaplayer-embed",

        label : "Embed:",

        sizes : [
            {name: 'large', width: 960, height: 590},
            {name: 'medium', width: 620, height: 380},
            {name: 'small', width: 400, height: 245}
        ],

        embedUrl : "{{embedURL}}&width={{width}}&height={{height}}",

        embedCode : '<iframe src="{{src}}" height="{{height}}px" width="{{width}}px" ' +
            'frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ' +
            'style="border:0; padding:0; margin:0;"></iframe>'

    };

    /**
     * @name UI.Embed
     * @class Embed is a PopcornJS plugin which present buttons which can be used to summon
     * a textbox with embed code for various sizes.
     * @description Embed can be provided with lightweight string templates which can be used
     * to access any properties of {@link API.MetaData#getData}, as well as a 'src' property which
     * is an alias to the embedUrl template. String variables are escaped with double curly brackets.
     * @constructor Constructor method.
     * @param {Element} id The DOM or jQuery element to which the buttons will be added.
     * @param {MetaPlayer} [player] A MetaPlayer instance
     * @param {Object} [options]
     * @param {Object} [options.embedUrl] A string template for the URL generated.
     * @param {Object} [options.embedCode] A string template for the code generated, which
     * by default contains a reference to embedUrl.
     * @param {Object} [options.sizes]
     * @param {String} [options.label] The label preceding the buttons in the DOM.
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed")
     *     .load();
     *
     * @example
     * # with default options
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed", {
     *          label : "Embed:",
     *          sizes : [
     *              {name: 'large', width: 960, height: 590},
     *              {name: 'medium', width: 620, height: 380},
     *              {name: 'small', width: 400, height: 245}
     *          ],
     *          embedUrl : "{{embedURL}}&width={{width}}&height={{height}}",
     *          embedCode : '&lt;iframe src="{{src}}" height="{{height}}px" width="{{width}}px" ' +
     *              'frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ' +
     *              'style="border:0; padding:0; margin:0;">&lt;/iframe>'
     *     })
     *     .load();
     *
     * @see <a href="http://jsfiddle.net/ramp/PaTgf/">Live Example</a>
     * @see MetaPlayer#embed
     */
    var Embed = function (target, player, options) {
        this.config = $.extend(true, {}, defaults, options);
        this.container = target;
        this.addDom();
        player.metadata.listen(MetaPlayer.MetaData.DATA, this.onMetaData, this );
    };

    MetaPlayer.Embed  = Embed;

    /**
     * @name MetaPlayer#embed
     * @function
     * @description
     * Creates a {@link UI.Embed} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the buttons will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed")
     *     .load();
     * @see UI.Embed
     */
    MetaPlayer.addPlugin("embed", function (target, options) {
        this.embed = new Embed(target, this, options);
    });

    Embed.prototype = {

        onMetaData : function (e) {
            this._metadata = e.data;

            if( this._current )
                this.open(this._current); // re-render

            this.find().show();
        },

        addDom : function () {
            var el = this.create().hide().appendTo(this.container);
            var self = this;

            this.create("header")
                .text(this.config.label)
                .appendTo(el);

            $.each( this.config.sizes, function (i, embed) {
                self.create("button")
                    .addClass( self.cssName(embed.name) )
                    .appendTo(el)
                    .append( self.create('label').text(embed.name) )
                    .attr('title', embed.width + "x" + embed.height)
                    .click( function (e) {
                        self.onClick(embed);
                    });
            });

            this.create("clear", "br")
                .css('clear', 'both')
                .css('height', '1')
                .appendTo(el);

            var textbox = this.create("textbox")
                .hide()
                .appendTo(el);

            var close = this.create("close")
                .html('&otimes;')
                .appendTo(textbox)
                .click( function () { self.close() });

            this.create("text", "textarea")
                .attr('readonly', 'readonly')
                .appendTo(textbox);
        },

        onClick : function (embed) {
            if( this._current && this._current.name == embed.name ) {
                this.close();
                return;
            }
            this.open(embed);
        },

        open : function (embed) {

            this.close();

            this._current = embed;

            this.find(embed.name).addClass( this.cssName('selected') );

            var data = this._metadata;
            // {{var}} substituation with anything in size config
            var dict = $.extend({}, data.ramp, data, embed);

            dict.src = encodeURI( Embed.templateReplace( this.config.embedUrl, dict) );

            var code = Embed.templateReplace( this.config.embedCode, dict);

            this.find('textbox').show();
            this.find('text').val( code ).select();
        },

        close : function () {
            this.find('selected').removeClass( this.cssName('selected') );
            this.find('textbox').hide();
            delete this._current;
        },


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

    Embed.templateReplace = function (template, dict) {
        return template.replace( /\{\{(\w+)\}\}/g,
            function(str, match) {
                return dict[match];
            });
    };

})();

(function () {

    var $ = jQuery;

    var defaults = {
        target : '',
        cssPrefix : 'metaplayer-endcap',
        template : 'templates/ui.endcap.tmpl.html',
        siteSearchUrl : "",
        countDownSec : 20,
        fbUrl : 'http://www.facebook.com/plugins/like.php',
        fadeMs : 250
    };

    var EndCap = function (player, options) {

        if( !(this instanceof EndCap ))
            return new EndCap(player, options);

        this.config = $.extend({}, defaults, options);
        this.player = player;

        this.countdownEnabled = (this.config.countDownSec > 0);

        // used to find our templates
        this.baseUrl = MetaPlayer.script.base("(metaplayer|ui).endcap.js");

        this.container = this.player.layout.stage;
        this.getTemplate();

    };

    MetaPlayer.addPlugin("endcap", function (options) {
        this.endcap =  EndCap(this, options);
    });

    EndCap.prototype = {

        getTemplate : function () {
            var url = this.baseUrl + this.config.template;
            $.ajax(url , {
                context: this,
                success : function (data){
                    $(this.container).append(data);
                    this.init();
                }
            });
        },

        init : function  (){
            var self = this;
            var video = this.player.video;
            var metadata = this.player.metadata;
            var playlist = this.player.playlist;

            metadata.addEventListener(MetaPlayer.MetaData.DATA, function (e) {
                self.onMetaData(e);
            });

            $(video).bind('play playing seeked loadstart', function (e) {
                self.onPlaying();
            });

            $(video).bind('ended', function (e) {
                self.onEnded();
            });

            this.find('countdown').click( function (e) {
                self.countdown.toggle();
                e.stopPropagation();
            });
            this.find().click( function (e) {
                self.countdown.stop();
            });
            this.find('preview').click( function () {
                playlist.next();
            });
            this.find('repeat').click( function () {
                video.currentTime = 0;
                video.play();
            });

            this.find('search-btn').click( function (e) {
                self.doSiteSearch();
            });

            this.find('search-input').keypress( function (e) {
                if (e.which == 13 ) {
                    self.doSiteSearch();
                }
            });

            playlist.autoAdvance = false;

            this.countdown = MetaPlayer.timer(1000, this.config.countDownSec);
            this.countdown.listen('time', this.onCountdownTick, this);
            this.countdown.listen('complete', this.onCountdownDone, this);


            if( MetaPlayer.Embed ) {
                this.embed = new MetaPlayer.Embed(this.find('embed'), this.player);
                this.find('embed').show();
            }

            if( MetaPlayer.Social )
                this.social = new MetaPlayer.Social( this.find('social'), this.player );

            this.toggle(false, true);
        },

        doSiteSearch : function  () {
            var q = this.find('search-input').val();
            var url = this.siteSearchUrl || this.config.siteSearchUrl;
            url += encodeURIComponent(q);
            top.location = url;
        },

        onEnded : function () {
            if( this.player.video.ad )
                return;
            this.toggle(true);
            if( ! this.countdownEnabled ) {
                this.find('countdown').text('');
                return;
            }
            this.countdown.start();
            var count = this.find('countdown').text( this.config.countDownSec );
        },

        onPlaying : function () {
            this.countdown.reset();
            this.toggle(false);
        },

        toggle : function (bool, now) {
            var el = this.find().stop();

            if( bool === undefined )
                bool = ! ( el.is(":visible") );

            if( now ){
                el.toggle(bool);
                return;
            }

            if( bool )
                el.show().animate({ opacity: 1}, this.config.fadeMs, function (){
                    $(this).show();
                });
            else
                el.animate({ opacity: 0 }, this.config.fadeMs, function (){
                    $(this).hide();
                });
        },

        onMetaData : function (e) {
            var data = this.player.metadata.getData();
            if( ! data )
                return;

            this.toggle(false);
            this.find('again-thumb').attr('src', data.thumbnail);
            this.find('again-title').text(data.title);
            this.find('again').show();

            if( data.ramp )
                this.siteSearchUrl = data.ramp.siteSearchURL;

            this.find('next').hide();

            var pl = this.player.playlist;

            var nextTrack = pl.getItem( pl.getIndex() + 1 );

            if(! nextTrack )
                return;

            this.player.metadata.load(nextTrack, this.onNextData, this )
        },

        onNextData : function (data) {
            this.find('preview-thumb').attr('src', data.thumbnail);
            this.find('preview-title').text(data.title);
            this.find('next').show();
        },

        onCountdownTick : function (e) {
            var count = this.find('countdown');
            count.text( Math.round(e.data.remain ) );
        },

        onCountdownDone : function (e) {
            this.player.playlist.next();
        },

        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className, tagName){
            if( ! tagName )
                tagName = "div";
            return $("<" + tagName + ">").addClass( this.cssName(className) );
        },
        cssName : function (className){
            return this.config.cssPrefix + (  className ?  '-' + className : '' );
        }
    };

})();(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-ff",
        filterMsec : 500,
        revealMsec : 1500,
        duplicates : false,
        scrollbar : true,
        renderAnnotations : true,
        baseUrl : ""
    };

    /**
     * FrameFeed is a PopcornJS plugin for rendering MetaQ framefeed events. The UI is rendered
     * as a feed with iframe panels prepended to the top of the list, animating down. The feed can
     * be filtered by a string match against the panel's tag property.
     * @name UI.FrameFeed
     * @class The MetaPlayer framefeed widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the framefeed will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.duplicates=false] If false, will not render duplicates of rendered cards
     * @param {Boolean} [options.renderAnnotations=true] If the MetaPlayer controlbar is present, will render
     * timeline annotations indicating when FrameFeed events will fire.
     * @param {Number} [options.filterMsec=750] The animation duration, in msec, for when a filter is applied.
     * @param {Number} [options.revealMsec=1500] The animation duration, in msec, for when a panel is added.
     * @param {String} [options.baseUrl=""] A prefix to any urls in the feed. Can be used if the feed contains relative URLS.
     * @example
     * # shown with all default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .framefeed("#myfeed", {
     *          duplicates: false,
     *          filterMsec: 500,
     *          revealMsec: 1500,
     *          renderAnnotations: true
     *          baseUrl : ""
     *     })
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/GCUrq/">Live Demo</a>
     * @see MetaPlayer#framefeed
     * @see Popcorn#framefeed
     */
    var FrameFeed = function (target, options) {

        var t = $(target);
        target = t.get(0);

        // return intance if exists
        if( target && FrameFeed.instances[ target.id ] ){
            return FrameFeed.instances[ target.id ];
        }

        if( ! (this instanceof FrameFeed) )
            return new FrameFeed(target, options);

        this.config = $.extend(true, {}, defaults, options);

        this.target = $("<div></div>")
            .addClass( this.cssName("scroller") )
            .width("100%")
            .height("100%")
            .appendTo(target);

        this.scrollbar = MetaPlayer.scrollbar(target, { disabled : ! this.config.scrollbar });
        this.seen = {};
        this.init();

        MetaPlayer.dispatcher(this);

        FrameFeed.instances[ target.id ] = this;
    };

    FrameFeed.instances = {};

    /**
     * @name MetaPlayer#framefeed
     * @function
     * @description
     * Creates a {@link UI.FrameFeed} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the framefeed will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .framefeed("#myfeed")
     *     .load();
     * @see UI.FrameFeed
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("framefeed", function (target, options){
        this.cues.enable("framefeed", { target : target });
        this.framefeed = FrameFeed(target, options);
        this.framefeed.player = this;
    });

    MetaPlayer.framefeed = FrameFeed;

    FrameFeed.prototype = {

        init : function () {
            var t = $(this.target);
            this.items = [];
            t.addClass( this.cssName() );
        },

        filter: function (query) {
            this.hideAll();
            this.query = query;
            this.render();
            this.scrollbar.scrollTo(0);

        },

        hideAll : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.hideItem(val);
            });
            this.dispatch("size")
        },

        render : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.renderItem(val);
            });
            this.scrollbar.render();
        },

        filtered : function (obj) {
            return ( this.query && (! obj.tags || ! obj.tags.match(this.query) ) );
        },

        setup :  function (options) {
            var self = this;
            // render annotations if asked
            if( this.config.renderAnnotations && this.player && this.player.controls ){
                this.player.controls.addAnnotation(options.start, null, options.topic || '', 'metaq');
            }
        },

        focus : function (obj) {
            this.render();
            obj.active = true;
            this.frame(obj, true);
        },

        blur : function (obj) {
            obj.active = false;
            this.hideItem(obj);
            this.scrollbar.render();
        },


        frame : function (obj, duration) {
            if( typeof obj == "string" ){
                obj = { url :  obj };
            }

            var url = obj.url;
            if(! url.match('^http') && this.config.baseUrl )
                url = this.config.baseUrl + url;


            if( this.seen[url] && this.seen[url].start != obj.start && ! this.config.duplicates) {
                return;
            }
            this.seen[url] = obj;

            var self = this;
            var revealMsec = duration == null ? this.config.revealMsec : duration;
            if( ! obj.item ){
                obj.loadAnimate = true;
                var frame = $("<iframe frameborder='0'></iframe>")
                    .attr("src", url)
                    .attr("scrolling", "no")
                    .attr("marginheight", 0)
                    .attr("marginwidth", 0)
                    .bind("load", function () {
                        obj.loaded = true;
                        self.renderItem(obj,
                            obj.loadAnimate ? revealMsec : null);
                    })
                    .attr("height", obj.height);

                obj.item = $("<div></div>")
                    .addClass( this.cssName("box") )
                    .prependTo( this.target )
                    .append(frame);

                this.hideItem( obj );;
                this.items.push(obj);
            }
            else {
                this.renderItem(obj, revealMsec);
            }
        },

        hideItem : function (obj) {
            obj.item
                .height(0)
                .hide()
                .css('opacity', 0)
        },

        renderItem : function (obj, duration) {
            obj.item.stop();
            obj.loadAnimate = false;

            if( ! obj.active || ! obj.loaded || this.filtered(obj) ){
                this.hideItem(obj);
                return;
            }

            var rendered = obj.item.css('opacity') == 1;
            if( rendered ){
                return;
            }
            obj.item.show();

            var scroll = this.scrollbar.scrollTop();
            var self = this;

            if( scroll > 0 || ! duration ){
                // fade in without height animation
                obj.item
                    .height(obj.height)
                    .animate({
                        opacity: 1
                    }, this.config.filterMsec );

                if( scroll && duration) {
                    this.scrollbar.scrollTo( 0 , scroll + obj.height );
                }
                else {
                    this.scrollbar.render();
                }
            }
            // else scroll and fade in
            else {
                obj.item.animate({
                    height: obj.height,
                    opacity: 1
                }, duration, function () {
                    self.scrollbar.render();
                });
            }
            self.dispatch("size");
        },

        clear : function () {
            $(this.target).empty();
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
         * Schedules a framefeed card to be rendered and focused at a given time.
         * @name Popcorn#framefeed
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the framefeed
         * @param {String} config.height A height for the feed item
         * @param {String} config.url An Ajax url for Iframe content.
         * @param {Number} config.start Start time text, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         *  # optional configuration step
         *  MetaPlayer.framefeed("#myfeed", {
         *          duplicates: false,
         *  });
         *
         * pop.framefeed({
         *     target : "#myfeed",
         *     start : 1,
         *     height: 200,
         *     url :"http://www.ramp.com/"
         * });
         */
        Popcorn.plugin( "framefeed" , {

            _setup: function( options ) {
                FrameFeed(options.target).setup(options);
            },

            start: function( event, options ){
                FrameFeed(options.target)
                    .focus(options);
            },

            end: function( event, options ){
                FrameFeed(options.target)
                    .blur(options);
            },

            _teardown: function( options ) {
                FrameFeed(options.target)
                    .clear();
            }
        });
    }


})();
/**
 * RSS Headlines widget
 */
(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-hl",
        baseUrl : ""
    };

    /**
     * Headlines is a page widget which populates with a set of links harvested from a RSS feed. RSS
     * feeds can be specified for various times in the video, re-populating the link in the page.
     * @name UI.Headlines
     * @class The MetaPlayer headlines widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the headlines will be added.
     * @param {Object} [options]
     * @param {String} [baseUrl=""] An options base url to prepend to item links in the feed.
     * @example
     * # shown with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .headlines("#headlines", {
     *          baseUrl : "/feeds/"
     *     })
     *     .load();
     * @see MetaPlayer#framefeed
     * @see Popcorn#framefeed
     */
    var Headlines = function (target, options) {
        var t = $(target);
        target = t.get(0);

        // return intance if exists
        if( target && Headlines.instances[ target.id ] ){
            return Headlines.instances[ target.id ];
        }

        if( ! (this instanceof Headlines) )
            return new Headlines(target, options);

        this.config = $.extend(true, {}, defaults, options);
        this.seen= {};
        this.init(target);

        Headlines.instances[ target.id ] = this;
    };

    Headlines.instances = {};

    /**
     * @name MetaPlayer#headlines
     * @function
     * @description
     * Creates a {@link UI.Headlines} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the headlines will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .headlines("#headlines")
     *     .load();
     * @see UI.Headlines
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("headlines", function (target, options){
        this.cues.enable("headlines", { target : target });
        this.headlines = Headlines(target, options);
    });

    MetaPlayer.Headlines = Headlines;

    Headlines.prototype = {

        init : function (parent) {

            this.target = $("<div></div>")
                .addClass( this.cssName() )
                .appendTo(parent);

            this.title = $("<div></div>")
                .addClass( this.cssName('title') )
                .appendTo( this.target );

            var nav = $("<div></div>")
                .addClass( this.cssName('nav') )
                .appendTo( this.target );

            $("<span></span>")
                .addClass( this.cssName('prev') )
                .text("<")
                .appendTo( nav );

            $("<span></span>")
                .addClass( this.cssName('next') )
                .text(">")
                .appendTo( nav );

            this.scroll = $("<div></div>")
                .addClass( this.cssName('scroll') )
                .appendTo( this.target );


            this.items = [];

        },

        render : function  () {
            var self = this;
        },

        rss : function (url, title) {

            if(! url.match('^http') && this.config.baseUrl )
                url = this.config.baseUrl + url;

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : {},
                error : function (jqXHR, textStatus, errorThrown) {
                    console.error("Load RSS error: " + textStatus + ", url: " + url);
                },
                success : function (response, textStatus, jqXHR) {
                    this.onRSS( response, title);
                }
            });
        },

        onRSS : function (response, title) {

            this.clear();

            this.title.text( title || $(response).find('channel').children('title').text() )

            var items = $(response).find('item');

            var self = this;
            $.each(items, function (i, node ) {
                var item = $(node);
                self.addItem(
                    item.find('title').text(),
                    item.find('link').text()
                );
            })

        },

        addItem : function (title, link){
            $("<a></a>")
                .text(title)
                .addClass( this.cssName('item') )
                .attr('href', link)
                .appendTo(this.scroll);

            $( document.createTextNode(" ") ).appendTo(this.scroll);
        },

        focus : function (obj) {
            this.rss(obj.url, obj.title);
        },

        blur : function (obj) {
            this.clear();
        },

        clear : function () {
            this.scroll.empty();
            this.title.empty();

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
         * Schedules a headline links to be rendered and a given time.
         * @name Popcorn#headlines
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the headlines
         * @param {String} config.height A height for the feed item
         * @param {String} config.url An Ajax url for RSS source (subject to ajax cross-domain restrictions)
         * @param {Number} config.start Start time, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         * pop.headlines ({
         *     target : "#myheadlines",
         *     url : "sample-rss.xml",
         *     start : 10
         * });
         *
         */
        Popcorn.plugin( "headlines" , {

            _setup: function( options ) {
                Headlines(options.target);
            },

            start: function( event, options ){
                Headlines(options.target)
                    .focus(options);
            },

            end: function( event, options ){
                Headlines(options.target)
                    .blur(options);
            },

            _teardown: function( options ) {
                Headlines(options.target)
                    .clear();
            }
        });
    }


})();

(function () {

    var $ = jQuery;

    var defaults = {
        target : '',
        autoHide : true,
        cssPrefix : 'metaplayer-overlay',
        template : 'templates/ui.overlay.tmpl.html',
        captions : false,
        mouseDelayMsec : 1000,
        seekBeforeSec : 1,
        hideOnEnded : true
    };
    /**
     * @name UI.Overlay
     * @class The MetaPlayer information overlay player widget.
     * @constructor
     * @param {MetaPlayer} player A MetaPlayer instance.
     * @param {Object} [options]
     * @param {Boolean} [options.autoHide=true] Overlay closes on mouse-out. If false, or on iOS,\
     * a close button is rendered instead.
     * @param {Boolean} [options.captions=false] Whether captions are on by default.
     * @param {Number} [options.mouseDelayMsec=1000] Delay in mouse-over before overlay opens.
     * @param {Number} [options.seekBeforeSec=1] When clicking search results, how many seconds prior to result to seek.
     * @param {Boolean} [options.hideOnEnd=true] Hides the overlay when the video ends, not conflicting with an endcap screen.
     * @example
     * MetaPlayer( video)
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .captions({
     *          autoHide : true.
     *          captions : false,
     *          mouseDelayMsec : 1000,
     *          seekBeforeSec : 1,
     *          hideOnEnd : true
     *       })
     *       .overlay()
     *       .load();
     * @example
     * <iframe style="width: 100%; height: 375px" src="http://jsfiddle.net/ramp/Pux7K/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
     */
    var Overlay = function (player, options) {

        if( !(this instanceof Overlay ))
            return new Overlay(player, options);

        this.config = $.extend({}, defaults, options);

        this.player = player;
        this.video = player.video;
        this.dispatcher = player.dispatcher;
        this.popcorn = player.popcorn;
        this.playlist = player.playlist;

        // used to find our templates
        this.baseUrl = MetaPlayer.script.base("(metaplayer|ui).overlay.js");

        if( this.config.container ) {
            this.container = this.config.container;
            this.init();
        }
        else {
            this.container = this.config.target || this.player.layout.stage;
            this.createMarkup(); // async init
        }
        this.video.overlay = this;
    };

    /**
     * @name MetaPlayer#overlay
     * @function
     * @description
     * Creates a {@link UI.Overlay} instance with the given options.
     * @param {Object} [options]
     * @example
     * MetaPlayer( video)
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .captions()
     *       .overlay()
     *       .load();
     * @see <a href="http://jsfiddle.net/ramp/Pux7K/">Live Example</a>
     * @see UI.Overlay
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("overlay", function (options) {
        this.overlay = Overlay(this, options);
    });

    Overlay.prototype = {
        init : function () {
            this.addUIListeners();
            this.addPlayerListeners();
            this.addPlaylistListeners();
            this.addPopcornListeners();
            this.addServiceListeners();
            this.addVideoListeners();

            //  render initial state
            this.onVolumeChange();
            this.onPlayStateChange();
            this.setCaptions(this.config.captions);
            this.adPlaying = false;

            if( this.player.isTouchDevice || ! this.config.autoHide )
                this.find('close-btn').show();

            if( MetaPlayer.Embed ) {
                this.embed = new MetaPlayer.Embed(this.find('embed'), this.player);
                this.find('embed').show();
            }

            if( MetaPlayer.Social )
                this.social = new MetaPlayer.Social( this.find('social'), this.player );
        },

        getMarkup : function () {
            var root = $("<div></div>")
                .addClass("metaplayer-overlay");

            var container = $("<div></div>")
                .addClass("metaplayer-overlay-container");
        },

        addUIListeners : function () {
            var self = this;
            this.find('play').click( function (e) {
                self.video.play();
            });
            this.find('pause').click( function (e) {
                self.video.pause();
            });
            this.find('mute').click( function (e) {
                self.video.muted = true;
            });

            this.find('unmute').click( function (e) {
                self.video.muted = false;
            });

            this.find('search-btn').click( function (e) {
                self.doSearch();
            });

            this.find('search-input').keypress( function (e) {
                if (e.which == 13 ) {
                    self.doSearch();
                }
            });

            this.find('close-btn').click( function (e) {
                self.toggle(false);
            });

            this.find('results-close').click( function (e) {
                self.find('search-input').val('');
                self.player.search.query('');
            });

            var volume_bg = this.find('volume-bg');
            $(volume_bg).bind('mousedown touchstart', function (e){
                self.onVolumeDragStart(e);
            });
            $(document).bind('mouseup touchend', function (e) {
                self.onVolumeDragEnd(e);
            });
            $(document).bind('mousemove touchmove', function (e) {
                if( ! self.volumeDragging )
                    return;
                self.onVolumeDrag(e);
            });

            if( MetaPlayer.iOS )
                this._addTouchListeners();
            else
                this._addMouseListeners();

            this.find('preview').click( function () {
                self.playlist.next();
            });
        },

        _addTouchListeners : function () {
            var self = this;
            var video = $(this.player.video );
            video.bind('touchstart', function () {
                if( ! self._ended )
                    self.delayedToggle(true);
            });
        },

        _addMouseListeners : function () {
            var self = this;

            var containers = $([ this.container, this.player.video ]);
            containers.bind('mouseenter', function (e) {
                if( ! self._ended && ! self.adPlaying )
                    self.delayedToggle(true);
            });

            containers.bind('mouseleave', function (e) {
                if( ! self._ended )
                    self.delayedToggle(false);
            });
        },

        addServiceListeners : function () {
            var metadata = this.player.metadata;
            metadata.listen(MetaPlayer.MetaData.DATA, this.onTags, this);
        },

        addVideoListeners : function () {
            var self = this;

            $(this.video).bind('adstart adstop', function(e){
                if (e.type == "adstart") {
                    self.toggle(false);
                    self.adPlaying = true;
                }
                else {
                    self.adPlaying = false;
                }
            });
        },

        onTags : function (e) {
            if( ! e.data.ramp )
                return;
            var tags = e.data.ramp.tags || [];

            var self = this;
            $.each(tags, function (i, tag){
                self.createTag(tag.term);
            });
        },

        renderNextUp : function (){
            var metadata = this.player.metadata;
            var nextTrack = this.playlist.getItem( this.playlist.getIndex() + 1 );

            if(! nextTrack )
                return;

            var data = metadata.getData(nextTrack);
            if( data )
                this.onNextData( data );
            else
                metadata.load(nextTrack, this.onNextData, this);
        },

        onNextData : function (data) {
            this.find('preview-thumb').attr('src', data.thumbnail);
            this.find('preview-title').text(data.title);
            this.find('next').show();
        },

        onTrackChange : function () {
            this.nextup = null;
            this.clearSearch();

            $('.' + this.cssName('tag') ).remove();
            this.find('next').hide();

            this.renderNextUp();
        },

        createTag : function ( term ) {
            var self = this;
            var el = this.create('tag');
            var label = this.create('tag-label');
            label.text(term);
            el.append(label);
            el.data("term", term);
            el.click( function (e) {
                self.onTagClick(e);
            });
            this.find('tags').prepend(el);
        },

        onTagClick : function (e) {
            var term = $(e.currentTarget).data().term;
            this.player.search.query(term);
        },

        doSearch : function () {
            var q = this.find('search-input').val();
            this.player.search.query(q);
        },

        onSearchStart : function (e) {
            this.find('search-input').val(e.query);
        },

        onSearchResult : function (e) {
            this.clearSearch();

            var response = e.data;

            if( ! response.query.length )
                return;

            var has_results = (response.results.length == 0);
            this.find('results-none').toggle( has_results );

            var self = this;
            $.each(response.results, function (i, result){
                self.createResult(result);
            });
            this.find('tags').hide();
            this.find('results').show();
        },

        clearSearch : function () {
            this.find('result-list').empty();
            this.find('tags').show();
            this.find('results').hide();
        },

        createResult : function (result){
            var self = this;
            var el = this.create('result');
            el.click( function (e) {
                self.video.currentTime = result.start - self.config.seekBeforeSec;
            });

            var time = this.create('result-time');
            time.text( MetaPlayer.format.seconds( result.start) );
            el.append(time);

            var phrase = this.create('result-text');
            el.append(phrase);

            $.each(result.words, function (i, word){
                var w = word.text;
                if( word.match ){
                    w = $('<span>');
                    w.addClass( self.cssName('match') );
                    w.text(word.text);
                }
                phrase.append(w);
                phrase.append(" ");
            });

            this.find('result-list').append(el);
        },

        addPopcornListeners : function () {
            if(! this.popcorn )
                return;

            var self = this;
            this.find('cc').click( function () {
                self.setCaptions(false);
            });

            this.find('cc-off').click( function () {
                self.setCaptions(true);
            });
        },

        /**
         * Toggles the captions and associated overlay button.
         * @name UI.Overlay#setCaptions
         * @function
         * @param {Boolean} bool True for captions enabled
         */
        setCaptions : function ( bool ){
            var pop = this.player.popcorn;

            if( bool )
                pop.enable('captions');
            else
                pop.disable('captions');

            this.find('cc').toggle(bool);
            this.find('cc-off').toggle(!bool);
        },


        addPlayerListeners : function () {
            var self = this;
            var video = $(this.player.video);

            video.bind('canplay', function(e){
                // check if volume adjustment is not supported (eg. iOS)
                var hold = self.video.volume;
                var test =  0.5;
                self.video.volume = test;
                if(self.video.volume !=  test)
                    self.hideVolumeControls();
                self.video.volume = hold;
            });

            video.bind('pause play seeked seeking canplay', function(e){
                self.onPlayStateChange();
            });

            video.bind('ended', function(e){
                self.onEnded();
            });

            video.bind('volumechange', function(e){
                self.onVolumeChange();
            });

        },

        addPlaylistListeners : function (){
            var self = this;
            this.player.metadata.addEventListener("data", function (e) {
                self.onTrackChange(e);
            });
            this.player.search.listen(MetaPlayer.Search.QUERY, this.onSearchStart, this);
            this.player.search.listen(MetaPlayer.Search.RESULTS, this.onSearchResult, this);
        },

        onVolumeDragStart : function (e) {
            this.volumeDragging = true;
            this.onVolumeDrag(e);
            e.preventDefault();
        },
        onVolumeDragEnd : function (e) {
            if( ! this.volumeDragging )
                return;
            this.volumeDragging = false;
            this.onVolumeDrag(e);
            e.preventDefault();
        },

        onVolumeDrag : function (e) {
            var oe = e.originalEvent;
            var pageX = e.pageX;

            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length ) {
                    return;
                }
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = this.find('volume-bg');
            var x =  pageX - bg.offset().left;
            var ratio = x / bg.width();


            if( ratio < 0 )
                ratio = 0;
            if( ratio > 1 )
                ratio = 1;

            // todo, throttle the mousemove
            this.video.muted = false;
            this.video.volume = ratio;
        },

        hideVolumeControls : function () {
            this.find('mute').hide();
            this.find('unmute').hide();
            this.find('volume-bg').hide();

        },

        onVolumeChange : function () {

            var muted = this.video.muted;
            this.find('mute').toggle( !muted );
            this.find('unmute').toggle( muted );

            var volume = muted ? 0 : this.video.volume;

            this.find('volume').width( (volume * 100) + "%");
        },

        onPlayStateChange : function (e) {
            this._ended = this.video.ended;
            // manage our timers based on play state
            // don't use toggle(); triggers layout quirks in chrome
            if( this.video.paused ) {
                this.find('pause').hide();
                this.find('play').show();
            }
            else {
                this.find('play').hide();
                this.find('pause').show();
            }
        },

        onEnded : function () {
            if( ! (this.config.hideOnEnded && this.config.autoHide) )
                return;
            this._ended = true;
            var node = this.find().stop();
            node.height(0);
        },

        createMarkup : function () {
            var url = this.baseUrl + this.config.template;
            $.ajax(url , {
                context: this,
                success : function (data){
                    $(this.container).append(data);
                    if( this.config.autoHide )
                        this.find().height(0); // start closed
                    this.init();
                }
            });
        },

        delayedToggle : function ( bool) {
            this._delayed = bool;

            // don't auto-hide;
            if( ! this.config.autoHide && ! bool){
                return;
            }
            var self = this;
            setTimeout( function () {
                if( this.__opened != self._delayed )
                    self.toggle(self._delayed);
            }, this.config.mouseDelayMsec);
        },

        /**
         * Toggles the overlay's visibility.
         * @name UI.Overlay#toggle
         * @function
         * @param {Boolean} bool True for visible.
         */
        toggle : function ( bool ) {
            this.__opened = bool;

            var node = this.find().stop();
            var height = this.find('container').height();
            if( bool )
                node.animate({height: height}, 500, function () {
                    node.height('');
                });
            else
                node.animate({height: 0}, 500);

            if( this.embed )
                this.embed.close(0);
        },

        /* core */
        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className, tagName){
            if( ! tagName )
                tagName = "div";
            return $("<" + tagName + ">").addClass( this.cssName(className) );
        },
        cssName : function (className){
            return this.config.cssPrefix + (  className ?  '-' + className : '' );
        }
    };

})();
(function () {
    var $ = jQuery;
    var Popcorn = window.Popcorn;

    if( ! Popcorn )
        return;

    Popcorn.plugin( "script" , {
        _setup: function( options ) {
        },

        start: function( event, options ){
            if( options.code.match(/^\s*<script/) ) {
                $('head').append(options.code);
                return;
            }
            try {
                window.eval(options.code);
            }
            catch(e){}
        },

        end: function( event, options ){
        },

        _teardown: function( options ) {
        }
    });
})();


(function () {

    var $ = jQuery;

    var defaults = {
        inputLabel : "Search in video",
        nextLabel : "NEXT:",
        cssPrefix : "mp-searchbar",
        spacingSec : 0,
        maxNext : 0,
        fadeOutPx : 21,
        cueType : "tags",
        seekOffset : -.5
    };

    var SearchBar = function (target, player, options) {

        if( !(this instanceof SearchBar) )
            return new SearchBar(target, player, options);

        this.player = player;
        this.target = $(target);

        this.config = $.extend(true, {}, defaults, options);

        this.createMarkup();
        this.addListeners();
        this.clear();

    };

    MetaPlayer.SearchBar = SearchBar;

    MetaPlayer.addPlugin("searchbar", function(target, options) {
        this.searchbar = SearchBar(target, this, options);
    });

    SearchBar.prototype = {

        createMarkup : function (){
            this.ui = {};
            $(this.target).addClass('mpf-searchbar');

            // Next Up
            this.nextup = $('<div>')
                .addClass("mpf-searchbar-nextup")
                .css('opacity', 0)
                .appendTo(this.target);

            $('<div>')
                .addClass("mpf-searchbar-nextup-label")
                .html(this.config.nextLabel + "&nbsp;")
                .appendTo(this.nextup);

            this.counter = $('<div>')
                .addClass("mpf-searchbar-nextup-countdown")
                .appendTo(this.nextup);

            // Search Form
            var searchform = $('<div>')
                .addClass("mpf-searchbar-search")
                .appendTo(this.target);

            var inputbox = $('<div>')
                .addClass("mpf-searchbar-search-inputbox")
                .appendTo(searchform);

            this.input = $('<input>')
                .addClass("mpf-searchbar-search-input")
                .attr('placeholder', this.config.inputLabel )
                .appendTo(inputbox)
                .keypress( this.bind( this.onInputKey ));

            $('<div>')
                .addClass("mpf-searchbar-search-submit")
                .appendTo(searchform)
                .click( this.bind( this.onInput ));


            // Tags
            this.tags = $('<div>')
                .addClass("mpf-searchbar-tags")
                .appendTo(this.target);

            this.scroll = $('<div>')
                .addClass("mpf-searchbar-tags-scroll")
                .appendTo(this.tags);

            $('<div>')
                .addClass("mpf-searchbar-tags-fade")
                .appendTo(this.target);

            // Navigation
            this.nav = $('<div>')
                .addClass("mpf-searchbar-nav")
                .appendTo(this.target);

            this.ui.prev = $('<div>')
                .addClass("mpf-searchbar-nav-prev")
                .appendTo(this.nav)
                .click( this.bind(this.previous) );

            this.ui.next =$('<div>')
                .addClass("mpf-searchbar-nav-next")
                .appendTo(this.nav)
                .click( this.bind(this.next) );


            // Search Results
            this.results = $('<div>')
                .addClass("mpf-searchbar-results")
                .appendTo(this.target);

            $('<div>')
                .addClass("mpf-searchbar-results-clear")
                .appendTo(this.results)
                .click( this.bind( function () {
                this.player.search.query('');
            }));

            this.query = $('<div>')
                .addClass("mpf-searchbar-results-query")
                .appendTo(this.results);

            this.resultsFound = $('<div>')
                .addClass("mpf-searchbar-results-label")
                .html("found at: ")
                .appendTo(this.results);

            this.resultsNotFound = $('<div>')
                .addClass("mpf-searchbar-results-label")
                .html("not found. ")
                .appendTo(this.results);

            this.resultsList = $('<div>')
                .addClass("mpf-searchbar-results-list")
                .appendTo(this.results);

            $('<div>')
                .addClass("mpf-searchbar-results-fade")
                .appendTo(this.results);

        },

        renderTag : function ( text, time ) {
            var first = ! this.scroll.children().length;
            if( ! first )
                $('<div>')
                    .html("&#x2022;")
                    .addClass("mpf-searchbar-tag-spacer")
                    .appendTo(this.scroll);

            return $('<div>')
                .append(  $("<div>").addClass("mpf-searchbar-tag-label").text(text) )
                .data("start", time)
                .data("term", text)
                .addClass("mpf-searchbar-tag")
                .appendTo(this.scroll);
        },

        addListeners : function () {
            this.player.cues.addEventListener(MetaPlayer.Cues.CUES, this.bind( this.onCues) );

            this.player.video.addEventListener("timeupdate", this.bind( this.renderTime ) );

            this.target.delegate(".mpf-searchbar-tag, .mpf-searchbar-results-item", "mouseenter",
                this.bind( this.onPreviewStart ) );

            this.target.delegate(".mpf-searchbar-tag, .mpf-searchbar-results-item", "mouseleave",
                this.bind( this.onPreviewStop ) );

            this.scroll.delegate(".mpf-searchbar-tag", "click", this.bind( function (e) {
                var time = $(e.currentTarget).data('start');
                this.player.video.currentTime = time + this.config.seekOffset;

                var term = $(e.currentTarget).data('term');
                this.player.search.query(term);
                this.input.val(term);
            }));

            this.resultsList.delegate(".mpf-searchbar-results-item", "click", this.bind( function (e) {
                var time = $(e.currentTarget).data('start');
                this.player.video.currentTime = time + this.config.seekOffset;
            }));

            this.player.search.listen(MetaPlayer.Search.QUERY, this.onSearch, this);
            this.player.search.listen(MetaPlayer.Search.RESULTS, this.onResults, this);
        },

        onPreviewStart : function (e) {
            var time = $(e.currentTarget).data('start');
            if( this.player.tracktip && this.player.tracktip.open )
                this.player.tracktip.open(time);
        },
        onPreviewStop : function (e) {
            if( this.player.tracktip && this.player.tracktip.close )
                    this.player.tracktip.close();
        },

        onCues : function (e) {
            this.clear();
            var tags = this.player.cues.getCues( this.config.cueType );
            this.tagData = [];
            var last;
            $.each(tags, this.bind( function (i, tag){
                var data = $.extend({}, tag);
                if( last && (this.getTerm(data) == this.getTerm(last) || data.start < last.start + this.config.spacingSec) )
                    return;
                last = tag;
                data.el = this.renderTag( this.getTerm(tag), tag.start);
                data.index = this.tagData.length;
                this.tagData.push(data);
            }));

            this.nextup.css('opacity', this.tagData.length ? 1 : 0);
            this.renderTime();
        },


        renderTime : function ( seconds ) {
            var time = seconds;

            if( typeof seconds != "number")
                 time = this.player.video.currentTime || 0;

            // cache hit
            if(this._renderCache
                && (time > this._renderCache.start && (time < this._renderCache.end || ! this._renderCache.end) )){
                this.renderNext(time);
                return;
            }

            if( ! this.tags.is(":visible") )
                return;

            this._renderCache = null;

            this.scroll.children('.mpf-searchbar-tag-selected')
                .removeClass('mpf-searchbar-tag-selected');

            if( ! (this.tagData && this.tagData.length))
                return;

            var tag, next, i = -1;
            while(i < this.tagData.length){
                tag = this.tagData[i];
                next = this.tagData[i+1];
                if( ! next || next.start > time )
                    break;
                i++;
            }
            // cache tag bounds so we can skip rendering in each timeupdate loop
            this._renderCache = {
                start : 0,
                index : i
            };

            if( tag ) {
                tag.el.addClass('mpf-searchbar-tag-selected');
                this._renderCache.term = tag.term;
                this._renderCache.start = tag.start;
                this.centerTag(tag.index);
            }
            else
                this.centerTag(-1);


            if( next ) {
                this._renderCache.end = next.start;
            }

        },

        renderNext : function (time) {

            if( ! this._renderCache )
                return;

            var next_sec = Math.round(this._renderCache.end - time) || null;

            if( this._renderCache.counter == next_sec )
                return;

            if( ! this.config.maxNext || next_sec >  this.config.maxNext )
                next_sec = null;

            this.counter.text(
                MetaPlayer.format.seconds(next_sec, { minutes: false, seconds: false })
            );

            if( ! this._renderCache.counter )
                this.nextup.children().show();

            this._renderCache.counter = next_sec;
        },

        centerTag : function (index) {
            var tag = this.tagData[index];
            var offset = 0;

            var middle = (this.tags.width() - this.config.fadeOutPx) / 2;
            if( tag ) {
                var center = tag.el.position().left + (.5 * tag.el.width());
                if( center < middle )
                    offset = 0;
                else
                    offset = center - middle;
            }

            this.scrollTo( offset );
        },

        next : function ( ) {
            var i = 0, tag, offset;
            var view = this.tags.width() - this.config.fadeOutPx;
            var max = view - this.scroll.position().left;
            while(this.tagData && i < this.tagData.length) {
                tag = this.tagData[i++];
                if( tag.el.width() + tag.el.position().left > max )  {
                    offset = tag.el.position().left;
                    break;
                }
            }
            if( offset )
                this.scrollTo( offset );
        },

        previous : function () {
            var view = this.tags.width() - this.config.fadeOutPx;
            var i = this.tagData.length -1, tag;
            var min = -this.scroll.position().left;
            var offset;
            while( i >= 0  ) {
                tag = this.tagData[i];
                if( tag.el.position().left < min ){
                    offset = tag.el.position().left + tag.el.width() - view;
                    if( offset < 0 )
                        offset = 0;
                    break;
                }
                i--;
            }
            if( offset != null )
                this.scrollTo( offset );
        },

        scrollTo: function (x, now) {
            if ( now )
                this.scroll.stop().css('left', -x);
            else
                this.scroll.stop().animate({ 'left' : -x });

            var view = this.tags.width() - this.config.fadeOutPx;
            var max = view;
            if( this.tagData && this.tagData.length ){
                var last = this.tagData[this.tagData.length-1].el;
                max = last.width() + last.position().left;
            }

            this.ui.prev.css('visibility', x > 0 ? 'visible' : 'hidden');
            this.ui.next.css('visibility', x + view < max  ? 'visible' : 'hidden');
        },

        search : function (query) {
            this.player.search.query(query);
        },

        clear : function () {
            this.counter.hide();
            this.scroll.empty();
            this.scrollTo(0, true);
            this._renderCache = null;
            this.toggleResults(false);
        },

        /* results */

        onInputKey : function (e) {
            if ( e.which == 13 ) {
                this.onInput();
                e.preventDefault();
            }
        },

        onInput : function () {
            var query = this.input.val();
            this.player.search.query(query)
        },

        toggleResults : function ( results ) {
            this.results.toggle( results );
            this.nextup.toggle( !results );
            this.tags.toggle( !results );
            this.nav.toggle( !results );
            if(! results ){
                this.input.val('');
            }
        },

        onSearch : function (e) {
            this.query.text(e.query);
            this.resultsList.empty();
        },

        onResults : function (e) {
            var results = e.data.results;
            if(! e.query ) {
                this.toggleResults(false);
                return;
            }

            var found = Boolean(e.data.results.length);
            this.resultsFound.toggle(found);
            this.resultsNotFound.toggle(!found);

            this.query.text(e.query);
            $.each(results, this.bind( function(i, result){
                $("<div></div>")
                    .data("start", result.start)
                    .text( MetaPlayer.format.seconds(result.start) )
                    .addClass("mpf-searchbar-results-item")
                    .appendTo(this.resultsList)
            }));
            this.toggleResults(true);
        },

        /* util */

        getTerm : function (options) {
            return options.term || options.topic || options.text || '';
        },

        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        },

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



})();


(function () {

    var $ = jQuery;

    var defaults = {
        cssPrefix : "mp-search",
        tags : true,
        query : "",
        seekBeforeSec : 0.25,
        context : 3,
        strings : {
            'tagHeader' : "In this video:",
            'searchPlaceholder' : "Search transcript...",
            'ellipsis' : "...",
            'resultsHeader' : "Showing {{count}} {{results}} for \"{{query}}\":",
            'results' : function (dict) { return "result" + (dict['count'] == 1 ? "" : "s"); },
            'clear' : "x"
        }
    };

    var SearchBox = function (target, player, options) {


        if( !(this instanceof SearchBox) )
            return new SearchBox(target, player, options);

        this.player = player;
        this.target = $(target);

        this.config = $.extend(true, {}, defaults, options);

        this.createMarkup();

        this.scrollbar = MetaPlayer.scrollbar( this.results );

        this.addListeners();
        this.clear();
    };

    SearchBox.instances = {};
    SearchBox._count = 0;

    MetaPlayer.SearchBox = SearchBox;

    MetaPlayer.addPlugin("searchbox", function(target, options) {
        this.searchbox = SearchBox(target, this, options);
    });

    SearchBox.getPhrase = function (words, offset, context){
        if( typeof words == "string" )
            words = words.split(' ');

        var len = context * 2 + 1;

        var start = 0;
        if(  words.length - offset <= context ) {
            start = words.length - len;
        }
        else if( offset > context ){
            start = offset-context;
        }

        if( start < 0 )
            start = 0;

        return {
            words :  words.slice( start, start + len),
            start : start,
            len : len
        };
    },

    SearchBox.prototype = {

        createMarkup : function (){
            var t = $(this.target);
            var c = this.create();

            var f= this.create('form');
            c.append(f);

            var ti = $('<input type="text" />');
            ti.addClass( this.cssName('input') );
            ti.val( this.config.query );
            ti.attr('placeholder',  this.getString("searchPlaceholder") );
            f.append(ti);

            var sm = this.create('submit', 'a');
            sm.append( this.create('submit-label', 'span') );
            f.append(sm);

            this.results = this.create('results')
                .appendTo(c);

            this.create('tags')
                .appendTo(c);

            this.container = c;
            t.append(this.container);
        },

        addListeners : function () {
            var self = this;

            this.find('submit').bind("click", function () {
                self.onSearch();
            });

            this.find('input').bind("keypress", function (e) {
                if (e.which == 13 ) {
                    self.onSearch();
                }
            });

            this.find('results').bind("click", function (e) {
                var el = $(e.target).parents('.' + self.cssName('result') );
                if( ! el.length )
                    el = $(e.target);
                var start = el.data().start;
                if( self.player )
                    self.player.video.currentTime = start - self.config.seekBeforeSec;
            });

            this.player.metadata.listen(MetaPlayer.MetaData.DATA, this.onTags, this);
            this.player.search.listen(MetaPlayer.Search.QUERY, this.onSearchStart, this);
            this.player.search.listen(MetaPlayer.Search.RESULTS, this.onSearchResult, this);
        },

        onTags : function (e) {
            var ramp = e.data.ramp;
            if(! ramp.tags ){
                return;
            }

            var box = this.find("tags");
            var self = this;

            box.empty();

            this.create('tag-header')
                .text( this.getString("tagHeader") )
                .appendTo(box);

            $.each(ramp.tags, function (i, tag) {
                var cell = $("<div></div>")
                    .addClass( self.cssName("tag") )
                    .appendTo(box);

                $("<span></span>")
                    .addClass( self.cssName("tag-label") )
                    .text(tag.term)
                    .click( function () {
                        self.search(tag.term);
                    })
                    .appendTo(cell);
            });
        },


        onSearch : function (e) {
            var q = this.find('input').val();
            this.search(q);
        },

        search : function (query) {
            this.player.search.query(query);
        },

        clear : function () {
            var r = this.scrollbar.body.empty();
            this.find('close').hide();
            this.find("tags").show();
        },

        onClose : function () {
            this.search('');
        },

        onSearchStart : function (e) {
            this.find('input').val(e.query);
        },

        onSearchResult : function (e, response) {
            this.clear();
            
            if( ! response.query.length ) {
                return;
            }

            this.find("tags").hide();

            this.find('close').show();
            var r = this.scrollbar.body;
            var blahblah = $("<div></div>")
                .addClass( this.cssName("result-count") )
                .text( this.getString("resultsHeader", {
                    count : response.results.length,
                    query : response.query.join(" ")
                }))
                .appendTo(r);
                
            var self = this;
            this.create("close")
                .text( this.getString("clear") )
                .bind("click", function (e){
                    self.onClose();
                })
                .appendTo(r);

            $.each(response.results, function (i, result){
                var el = self.create('result');
                var start = result.start;

                var words = [], offset;
                $.each(result.words, function (i, word){
                    var w = $('<span>')
                        .text(word.text);
                    if( word.match ){
                        offset = i;
                        w.addClass( self.cssName('match') );
                    }
                    words.push( w.get(0) );
                });

                // We don't need to trim anything if we're using cues,
                // which provide snippets already
                offset = response.usingCues ? 0 : offset;
                var context = response.usingCues ? 10 : self.config.context;

                var phrase = SearchBox.getPhrase(words, offset, context);
                
                // we just need the start of the cue if we're using cues (obviously) :)
                start = response.usingCues ? result.start : result.words[phrase.start].start;

                el.data('start', start);

                var time = self.create('time')
                    .text( MetaPlayer.format.seconds(start) )
                    .appendTo(el);

                $.each(phrase.words, function (i, word) {
                    el.append( word );
                    if( i + 1 < phrase.words.length )
                        el.append(" ");
                });

                var ellipses = self.getString("ellipsis");
                el.appendTo(r)
                    .prepend(ellipses)
                    .append(ellipses);

            });
        },

        getString : function (name, dict) {
            var template = $.extend({}, this.config.strings, dict);
            return MetaPlayer.format.replace( this.config.strings[name], template);
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



})();


(function () {

    var $ = jQuery;

    var defaults = {
        openDelayMsec : 1000,
        hideDelayMsec : 4000,
        backButtonSec : 5,
        overlay : true,
        autoHide : true,
        embedHeight : 380,
        embedWidth : 620,
        embedTemplate : "<iframe src='{{embedURL}}' height='{{embedHeight}}px' width='{{embedWidth}}px' "+
                    " frameborder='0' scrolling='no' marginheight='0' marginwidth='0' " +
                    " style='border:0; padding:0; margin:0;'></iframe>"
    };

    MetaPlayer.addPlugin("share", function(options) {
        this.share = new MetaPlayer.UI.Share(this, options);
    });

    MetaPlayer.UI.Share = function (player, options) {
        this.player = player;
        this.config = $.extend({}, defaults, options);
        this.createMarkup(player.layout.stage);

        this.player.metadata.listen("data", this.bind( this._onData ) );
    };

    MetaPlayer.UI.Share.prototype = {

        createMarkup : function (container){
            var ui = this.ui = {};

            if( this.player.controlbar && this.player.controlbar.addButton ){
                this.player.controlbar.addButton(
                    $("<div></div>")
                        .addClass( cssName('button') )
                        .text("Share")
                        .attr('title', "Share Menu")
                        .click( this.bind ( function (e) {
                            this.toggle();
                            e.preventDefault();
                        }))
                );
            }

            // share menu
            ui.shareMenu = $("<div />")
                .hide()
                .addClass( cssName("panel"))
                .appendTo( container );

            ui.shareClose = $("<div />")
                .addClass( cssName("close"))
                .text("x")
                .click( this.bind ( function (e) {
                    this.toggle(false);
                }))
                .appendTo( ui.shareMenu );

            ui.shareButtons = $("<div />")
                .addClass( cssName("buttons"))
                .appendTo( ui.shareMenu );

            if( MetaPlayer.Social )
                this._social = new MetaPlayer.Social(ui.shareButtons, this.player );

            ui.shareEmbed = $("<div />")
                .addClass( cssName("embed"))
                .appendTo( ui.shareMenu );

            var shareLinkRow = $("<div />")
                .addClass( cssName("row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("label"))
                .text("Get Link")
                .appendTo( shareLinkRow );

            ui.shareLink = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("link"))
                .appendTo( shareLinkRow );

            var shareEmbedRow = $("<div />")
                .addClass( cssName("row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("label"))
                .text("Get Embed")
                .appendTo( shareEmbedRow );

            ui.shareEmbed = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("embed"))
                .appendTo( shareEmbedRow );

        },

        toggle : function (bool) {
            if( bool == null )
                bool = ! this.ui.shareMenu.is(":visible");

            if( bool && this._hasData)
                this.ui.shareMenu.stop().fadeIn();
            else
                this.ui.shareMenu.stop().fadeOut();
        },


        _onData : function () {
            this._hasData = true;
            var data = this.player.metadata.getData();
            this.ui.shareLink.val( data.ramp.linkURL );
            this.ui.shareEmbed.val( this.embedUrl( data.ramp.embedURL ) );
        },

        embedUrl : function (embedURL) {
            var dict = {
                embedHeight : this.config.embedHeight,
                embedWidth : this.config.embedWidth,
                embedURL : embedURL
            };
            return MetaPlayer.format.replace( this.config.embedTemplate, dict);
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // css namespace
    function cssName ( name ) {
        return 'mpf-share' + (name ? '-' + name : '');
    }

})();
( function () {
    var $ = jQuery;

    var defaults = {
        cssPrefix : "metaplayer-social",

        facebookApi : '//www.facebook.com/plugins/like.php',
        twitterApi: '//platform.twitter.com/widgets/tweet_button.html',

        shareText : "Check this video out -- "
    };

    var Social = function (target, player, options) {

        this.config = $.extend(true, {}, defaults, options);

        this.player = player;
        this.container = target;

        this.addDom();
        this.player.metadata.listen(MetaPlayer.MetaData.DATA, this.onMetaData, this );
    };

    MetaPlayer.Social = Social;

    MetaPlayer.addPlugin("social", function (target, options) {
        new Social(target, this, options);
    });

    Social.prototype = {

        addDom : function () {
            var el = this.create().hide().appendTo(this.container)
            this.create('clear').appendTo( el );
        },

        onMetaData : function (e) {
            this.setFacebook(e.data);
            this.setTwitter(e.data);
            this.find().show();
        },

        setTwitter : function (t) {

            var params = {
//                via : '',
//                related : '',
                count : 'horizontal',
                lang : 'en'
            };

            params.text = this.config.shareText + ( t.title || '');
            params.url =  t.link || t.linkURL;

            if( t.hashtags )
                params.hashtags = t.hashtags;

            var query = $.map( params, function (val,key) {
                return escape(key) + "=" + escape(val);
            }).join('&');


            var el = this.create('twitter', 'iframe')
                .attr('allowtransparency', 'true')
                .attr('frameborder', '0');

            var src = this.config.twitterApi + "#" + query;
            el.attr('src', src);

            this.find('twitter').remove();
            this.find().prepend(el);
        },

        setFacebook : function (t) {

            var params = {
                'href' : '',
                'layout' : 'button_count',
                'show_faces' : false,
                'action' : 'like',
                'colorscheme' : 'light',
                'width' : '',
                'height' : ''
            };

            var el = this.create('facebook', 'iframe')
                .attr('allowtransparency', 'true')
                .attr('frameborder', '0');

            params.href = t.link || t.linkURL || document.location.toString();
            params.width = el.width();
            params.height = el.height();

            var src = this.config.facebookApi  + "?" + $.param(params, true);
            el.attr('src', src);

            this.find('facebook').remove();
            this.find().prepend(el);
        },

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
})();
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


(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "transcript",
        focusMs : 750,
        fadeMs : 1000,
        opacity: 1,
        timestamps : false,
        breaks : false
    };

    // case insensative find
    $.expr[':'].tx_contains = function(a, i, m) {
        return $(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };

    /**
     * Transcript is a PopcornJS plugin for rendering captions in paragraph-form, with each caption scrolled into
     * view and highlighted as it is activated. Text can be clicked to seek to corresponding parts of the video.
     * @name UI.Transcript
     * @class The MetaPlayer moving transcript widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the transcript will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.breaks=false] If true, each caption will be on its own line.
     * @param {Boolean} [options.timestamps=false] If true, ill prefix each caption with a timestamp
     * @param {Number} [options.focusMs=750] The fade in animation duration when a caption becomes active
     * @param {Number} [options.fadeMs=750] The fade out animation duration when a caption becomes inactive
     * @param {Number} [options.opacity=1] The opacity for inactive captions
     * @example
     * # with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .transcript('#mytranscript', {
     *         breaks: true,
     *         timestamps: true,
     *         focusMs: 1000,
     *         fadeMs : 750,
     *         opacity: 1
     *      })
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/CcWEX/">Live Example</a>
     * @see MetaPlayer#transcript
     * @see Popcorn#transcript
     * @requires  metaplayer-complete.js, popcorn.js
     */
    var Transcript = function (target, player, options) {

        // two argument constructor (target, options)
        if( options == undefined && ! (player && player.play) ) {
            options = player;
            player = null;
        }
        if( typeof target == "string" && Transcript.instances[target] ) {
            var self = Transcript.instances[target];
            if(player && player.play ) {
                self.setPlayer( player );
            }
            return self;
        }

        if( !(this instanceof Transcript) )
            return new Transcript(target, player, options);

        this.target = target;
        this.setPlayer( player );
        this.config = $.extend(true, {}, defaults, options);

        this.init();
        this.addListeners();

        Transcript.instances[target] = this;
    };

    Transcript.instances = {};

    MetaPlayer.Transcript = Transcript;

    /**
     * @name MetaPlayer#transcript
     * @function
     * @description
     * Creates a {@link UI.Transcript} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the transcript will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .transcript("#mytranscript")
     *     .load();
     * @see UI.Transcript
     * @requires  metaplayer-complete.js, popcorn.js
     */
    MetaPlayer.addPlugin("transcript", function (target, options) {
        this.cues.enable("transcript", { target : target }, { clone : "captions"} );
        this.transcript = Transcript( target, this.video, options);
    });


    Transcript.prototype = {
        init : function (){
            this.container = this.create();
            this.scroller = this.create('scroller');


            this._captions = {};
            $(this.target).append( this.container );
            $(this.container).append( this.scroller );

            this.scrollbar = MetaPlayer.scrollbar( this.container );
        },

        addListeners : function (e) {
            var self = this;
            this.container.bind("click touchstart", function (e){
                var node = $(e.target).parent( '.' + self.cssName('caption') );
                if( ! node.length )
                    return;
                var options = $(node).data('options');
                if( options ) {
                    self.player.currentTime = options.start;
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            this.container.bind("mouseenter touchstart", function (e){
                self.mousing = true;
            });
            this.container.bind("mouseleave touchend", function (e){
                self.mousing = false;
            });
        },

        setPlayer : function ( player ) {
            if( this.player )
                return;

            this.player = player;
            var self = this;
            $(this.player).bind("search", function (e) {
                var terms = e.originalEvent.data;
                self.search(terms);
            })
        },

        search : function (terms) {
            if( typeof terms == "string" )
                terms = terms.split(/\s+/);

            var searchCss = this.cssName("search");
            this.find('search').removeClass(searchCss);

            var self = this;
            var matches = [];
            $.each(terms, function (i, term) {
                var found = self.find("caption").find("." + self    .cssName('text') + " span:tx_contains(" + term + ")");
                found.addClass( searchCss );
            });
        },

        append :  function (options) {
            var el = this.create("caption", this.config.breaks ? 'div' : 'span');

            if( this.config.timestamps) {
                var ts = this.create("time", 'span');
                ts.text( options.start + "s");
                el.append(ts);
            }


            var self = this;
            var phrase = $('<span></span>')
                .addClass( this.cssName("text") )
                .click( function () {
                    self.player.currentTime = options.start;
                })
                .appendTo(el);

            var terms = options.text.split(/\s+/);
            $.each(terms, function (i, term) {
                $('<span></span>')
                    .text( term )
                    .appendTo(phrase);
                $(document.createTextNode(' '))
                    .appendTo(phrase);

            });

            el.data('options', options);
            el.css('opacity', this.config.opacity);
            this.scroller.append(el);
            this._captions[ options.start ] = el;
        },

        clear : function () {
            $(this.scroller).empty();
            this._captions = {};
            this.scrollbar.render();
        },

        focus : function (options) {
            var el = this._captions[options.start];
            el.stop().animate({opacity: 1}, this.config.focusMs);
            el.toggleClass( this.cssName('focus'), true );

            var top = el.position().top - (this.container.height() / 2);
            if( ! this.mousing ) {
                this.scrollbar.scrollTo(0 , top, 1000 );
            }
        },

        blur : function (options) {
            var el = this._captions[options.start];
            el.stop().animate({opacity: this.config.opacity}, this.config.fadeMs);
            el.toggleClass( this.cssName('focus'), false )
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
        Popcorn.plugin( "transcript" , {
            /**
             * Adds a caption to be added to the tracscript, and scheduled to be focused at a given time.
             * @name Popcorn#transcript
             * @function
             * @param {Object} config
             * @param {Element} config.end The target container for the caption text.
             * @param {String} config.text The caption text.
             * @param {Number} config.start Start time text, in seconds.
             * @param {Number} [config.end] End time text, in seconds, if any.
             * @example
             *  # without MetaPlayer Framework
             *  var pop = Popcorn(video);
             *
             *  # optional configuration step
             *  MetaPlayer.transcript('#mytranscript', { breaks: true })
             *
             *  pop.transcript({
             *      start: 0,
             *      end : 2,
             *      text : "The first caption"
             *      target : "#mytranscript"
             *  });
             *  @see UI.Transcript
             */
            _setup: function( options ) {
                var t = Transcript(options.target, this.media);
                t.append( options );
            },

            start: function( event, options ){
                var t = Transcript(options.target);
                t.focus(options)
            },

            end: function( event, options ){
                var t = Transcript(options.target);
                t.blur(options)

            },

            _teardown: function( options ) {
                var t = Transcript(options.target);
                t.clear();
            }
        });
    }

})();
