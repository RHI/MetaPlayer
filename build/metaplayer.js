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
