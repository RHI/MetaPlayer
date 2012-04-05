/**

MetaPlayer Framework  v0.2.20120405

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
 * @author Greg Kindel <greg@gkindel.com>
 * @version 1.0
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
     * Create a MetaPlyer instance. Sets up core player plugins, and DOM scaffolding.
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
     * @this {MetaPlayer}
     * @param {MediaElement,String} [video] An HTML5 Media element, a DIV element, or jQuery selector string.
     * @param {Object} [options] A map of configuration options
     * @param {Object} options.layout Default options passed in to Layout module, defaults to empty object.
     * @param {Object} options.metadata Default options passed in to MetaDat module, defaults to empty object.
     * @param {Object} options.search Default options passed in to Search module, defaults to empty object.
     * @param {Object} options.cues Default options passed in to Cues module, defaults to empty object.
     */
    var MetaPlayer = function (video, options ) {

        if( ! (this instanceof MetaPlayer) )
            return new MetaPlayer( video, options );

        this.config = $.extend({}, defaults, options );

        MetaPlayer.dispatcher(this);

        this._plugins = {};
        this._loadQueue = [];
        this.target = video;

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

        // resolve video element from string, popcorn instance, or direct reference
        if( typeof video == "string")
            video = $(video).get(0);

        if( video ) {
            if( video.getTrackEvents instanceof Function ) {
                // is popcorn instance
                this.video = video.media;
                this.popcorn = video;
            }

            else if( video.play instanceof Function ) {
                // is already a media element
                this.video = video;
            }
        }

        // optional layout disabling, use at own risk for player UI layout
        if( video && this.config.layout ) {
            this.layout = MetaPlayer.layout(video, this.config.layout);
        }

        // start loading after this execution block, can be triggered earlier by load()
        // makes sure all plugins have initialized before startup sequence
        var self = this;
        setTimeout( function () {
            self._load();
        }, 0);
    };

    /**
     * Fired when all plugins are loaded.
     * @constant
     */
    MetaPlayer.READY = "ready";

    /**
     * Fired when player destructor called to allow plugins to clean up.
     * @constant
     */
    MetaPlayer.DESTROY = "destroy";


    MetaPlayer.prototype = {

        /**
         * Initializes requested player plugins, optionally begins playback.
         * @this {MetaPlayer}
         */
        load : function () {
            this._load();
            return this;
        },

        /**
         * Disabled MP instance, frees up memory resources. Fires DESTROY event for plugin notification.
         * @this {MetaPlayer}
         */
        destroy : function () {
            this.dispatcher.dispatch( MetaPlayer.DESTROY );

            delete this.plugins;
            delete this._loadQueue;

            // todo: iterate plugins, call destroy() if def
            // these should be made plugins

            delete this.layout;
            delete this.popcorn;

        },

        log : function (args, tag ){
            if( this.config.debug.indexOf(tag) < 0 )
                return;

            var arr = Array.prototype.slice.apply(args);
            arr.unshift( tag.toUpperCase() );
            console.log.apply(console, arr);
        },

        _load : function () {

            if ( this._loaded ) {
                // load() was already called
                return;
            }
            this._loaded = true;

            // fill in core interfaces were not implemented
            if( ! this.video && this.layout )
                this.html5();

            if( this.video && ! this.playlist )
                this.playlist = new MetaPlayer.Playlist(this, this.config.playlist);

            if( this.video && ! this.popcorn && Popcorn != null )
                this.popcorn = Popcorn(this.video);


            // run the plugins, any video will have been initialized by now
            var self = this;
            $( this._loadQueue ).each(function (i, plugin) {
                    plugin.fn.apply(self, plugin.args);
            });
            this._loadQueue = [];

            this.ready = true;

            // let plugins do any setup which requires other plugins
            this.dispatcher.dispatch( MetaPlayer.READY );

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
            return this;
        };
    };

    window.MetaPlayer = MetaPlayer;
    window.Ramp = MetaPlayer;
    window.MPF = MetaPlayer;

})();


(function () {

    var $ = jQuery;

    var defaults = {
    };

    var Cues = function (player, options){

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._cues = {};

        this._rules = {
            // default rule mapping "captions" to popcorn "subtitle"
            "subtitle" : { clone : "captions" }
        };

        this.player = player;
        this._addListeners();
    };

    MetaPlayer.Cues = Cues;

    /**
     * Fired when cues are available for the focus uri.
     * @name CUES
     * @event
     * @param data The cues from a resulting load() request.
     * @param uri The focus uri
     * @param plugin The cue type
     */
    Cues.CUES = "cues";

    /**
     * Fired when cue list reset, usually due to a track change
     * @name CLEAR
     * @event
     */
    Cues.CLEAR = "clear";

    Cues.prototype = {
        /**
         * Bulk adding of cue lists to a uri.
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
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCueLists : function ( uri) {
            var guid = uri || this.player.metadata.getFocusUri();
            return this._cues[guid];
        },

        /**
         * For a given cue type, adds an array of cues events, triggering a CUE event
         * if the uri has focus.
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
            this._cues[guid][type] = this._cues[guid][type].concat(cues);

            this._dispatchCues(guid, type)
        },

        /**
         * Returns an array of caption cues events. Shorthand for getCues("caption")
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCaptions : function ( uri ){
            return this.getCues("captions", uri);
        },

        /**
         * Returns an array of cue objects for a given type. If no type specified, acts
         * as alias for getCueLists() returning a dictionary of all cue types and arrays.
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
         * @param type Cue type
         * @param overrides Optional object with properties to define in each popcorn event, such as target
         * @param rules (advanced) Optional rules hash for cloning, sequencing, and more.
         */
        enable : function (type, overrides, rules) {
            var r = $.extend({}, this._rules[type], rules);
            r.overrides = $.extend({}, r.overrides, overrides);
            r.enabled = true;
            this._rules[type] = r;

            this._renderCues(type, this.getCues( r.clone || type) )
        },

        /**
         * Disables popcorn events for a cue type
         * @param type Cue type
         */
        disable : function (type) {
            if( ! type )
                return;

            if( this._rules[type] )
                this._rules[type].enabled = false;

            this._removeEvents(type);
        },

        /**
         * Frees external references for manual object destruction.
         * @destructor
         */
        destroy : function  () {
            this._removeEvents();
            this.dispatcher.destroy();
            delete this.player;
        },

        /* "private" */

        // broadcasts cue data available for guid, if it matches the current focus uri
        // defaults to all known cues, or can have a single type specified
        // triggers attachment of popcorn events
        _dispatchCues : function ( guid, type ) {

            // only focus uri causes events
            if( guid != this.player.metadata.getFocusUri() ) {
                return;
            }

            var self = this;
            var types = [];

            // specific cue type to be rendered
            if( type ) {
                types.push(type)
            }

            // render all cues
            else if( this._cues[guid] ){
                types = $.map(this._cues[guid], function(cues, type) {
                    return type;
                });
            }

            $.each(types, function(i, type) {
                var cues = self.getCues(type);

                var e = self.createEvent();
                e.initEvent(Cues.CUES, false, true);
                e.uri = guid;
                e.plugin = type;
                e.cues = cues;

                if( self.dispatchEvent(e) ) {
                   // allow someone to cancel, blocking popcorn scheduling
                    self._renderCues(type, cues)
                }
            });
        },

        _addListeners : function () {
            var player = this.player;
            var metadata = player.metadata;
            player.listen( MetaPlayer.DESTROY, this.destroy, this);
            metadata.listen( MetaPlayer.MetaData.FOCUS, this._onFocus, this)
        },

        _onFocus : function (e) {
            //... remove all popcorn events because the track has changed
            this._removeEvents();

            // let others know we've cleared
            var event = this.createEvent();
            event.initEvent(Cues.CLEAR, false, true);
            this.dispatchEvent(event);

            this._dispatchCues( e.uri );
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

    MetaPlayer.Layout = function (target, options){
        this.config = $.extend({}, defaults, options);

        this.target = $(target).get(0);
        this.panels = [];

        // the base is for controls, stage
        if( this.target.play instanceof Function )
            this.base = this._setupVideo();

        else if( this.target )
            this.base = this._setupContainer();

        // the stage is a container for all overlays
        if( this.base )
            this.stage = this._addStage();
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

        addPanel : function (options) {
            var box = $.extend({},
                MetaPlayer.Layout.PANEL_OPTIONS,
                options);

            this.panels.push( box );
            this._renderPanels(0);
            return (this.panels.length - 1);
        },

        getPanel : function (id) {
            return this.panels[id] || null;
        },

        togglePanel : function (id, bool, duration) {
            var p = this.getPanel(id);
            if( ! p )
                return;
            p.enabled = bool;
            this._renderPanels(duration);
        },

        updatePanel : function (id, options, duration) {
            var box = $.extend( this.getPanel(id),
                options);
            this._renderPanels(duration);
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

            v.stop().animate({
                'margin-top': box.top,
                'margin-left': box.left,
                'width' : w,
                'height' : h
            }, msec);
        },

        // deprecated: removed to allow click-through
        _sizeOverlays : function (box, duration) {
            var msec = (duration != null) ? duration : this.config.sizeMsec;

            $(this.base).find('.mp-stage')
                .stop()
                .animate({
                    top : box.top,
                    right : box.right,
                    bottom : box.bottom,
                    left : box.left
                }, msec);
        },

        _setupContainer : function (container) {
            return $(this.target)
                .addClass("metaplayer")
                .get(0);
        },

        _setupVideo : function () {

            this.video = this.target;
            var v = $(this.video);
            var container = v.parents(".metaplayer");

            if( ! container.length ) {
                if( ! this.config.adoptVideo )
                    return;
                container = $("<div></div>")
                    .addClass("metaplayer")
                    .insertAfter(v)
                    .append(v);
            }
            container.width( v.width() );
            container.height( v.height() );

            return container.get(0);
        },

        _addStage : function () {
            return $("<div></div>").addClass("mp-stage").appendTo(this.base).get(0);
        }


    };


})();(function () {

    var $ = jQuery;

    var defaults = {
    };

    var MetaData = function (player, options){
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
     * @name FOCUS
     * @event
     * @param uri The new focus uri
     */
    MetaData.FOCUS = "focus";

    /**
     * Fired when MetaData needs a resource to be defined.
     * @name LOAD
     * @event
     * @param uri Opaque string which can be used by a service to load metadata.
     */
    MetaData.LOAD = "load";

    /**
     * Fired when new metadata is received as a result of a load() request.
     * @name LOAD
     * @event
     * @param data The metadata from a resulting load() request.
     */
    MetaData.DATA = "data";


    MetaData.prototype =  {


        /**
         * Request MetaData for an uri
         * @param uri
         * @this {MetaData}
         * @param callback (optional)  If specified will suppress the DATA event
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

            if( this._data[uri] ){
                // cache hit; already loaded. respond immediately
                if( this._data[uri]._cached ) {
                    this._response(uri);
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
         * Returns the uri for which events are currently being fired.
         */
        getFocusUri : function () {
            return this._lastUri;
        },

        /**
         * Sets the uri for which events are currently being fired.
         */
        setFocusUri : function (uri) {

            if( this._lastUri == uri )
                return;

            this._lastUri = uri;
            e = this.createEvent();
            e.initEvent(MetaData.FOCUS, false, true);
            e.uri = uri;
            this.dispatchEvent(e);
        },

        /**
         * Returns any for a URI without causing an external lookup.
         * @param uri Optional argument specifying media guid. Defaults to last load() uri.
         */
        getData : function ( uri ){
            var guid = uri || this._lastUri;
            return this._data[guid]
        },

        /**
         * Sets the data for a URI, triggering DATA if the uri has focus.
         * @param data
         * @param uri (optional) Data uri, or last load() uri.
         * @param cache (optional) allow lookup of item on future calls to load(), defaults true.
         */
        setData : function (data, uri, cache ){
            var guid = uri || this._lastUri;
            this._data[guid] = $.extend(true, {}, this._data[guid], data);
            this._data[guid]._cached = ( cache == null ||  cache ) ? true : false;
            this._response(guid);
        },

        /**
         * Frees external references for manual object destruction.
         * @destructor
         */
        destroy : function  () {
            this.dispatcher.destroy();
            delete this.player;
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

            if( this._lastUri == uri ) {
                var e = this.createEvent();
                e.initEvent(MetaData.DATA, false, true);
                e.uri = uri;
                e.data = data;
                this.dispatchEvent(e);
            }

            if( this._callbacks[uri] ) {
                $.each( this._callbacks[uri] || [], function (i, callback ) {
                    callback.fn.call(callback.scope, data);
                });
                delete this._callbacks[uri];
            }
        }
    };


})();
(function () {

    var $ = jQuery;


    var defaults = {
        sourceTags : true,
        selectSource : true,
        linkAdvance : false,
        autoAdvance : true,
        autoBuffer : true,
        related: true,
        loop : false
    };


    /**
     *
     * @name MetaPlayer.Playlist
     * @constructor
     * @param player
     * @param options
     */
     var Playlist = function (player, options ){

        this.config = $.extend({}, defaults, options);
        this.player = player;
        this._tracks = [];
        this._index = 0;

        this.loop = this.config.loop;
        this.preload = this.config.autoBuffer;
        this.advance = this.config.autoAdvance;
        this.linkAdvance = this.config.linkAdvance;

        MetaPlayer.dispatcher(this);

        this._addListeners();
    };

    MetaPlayer.Playlist = Playlist;

    Playlist.prototype = {

        index : function ( i ) {
            i = this._resolveIndex(i);
            if( i != null ) {
                this._index = i;
                this._select( this.track() );
            }
            return this._index;
        },

        queue : function ( tracks ) {
            if( ! (tracks instanceof Array) )
                tracks = [tracks];

            var wasEmpty = (this._tracks.length == 0);

            var self = this;
            $(tracks).each( function (i, track) {
                self._addTrack(track, true)
            });
            this.dispatcher.dispatch("playlistchange");

            if( wasEmpty )
                this._select( this.track() )
        },

        // begins the process of changing video source, starting with fetching metadata
        _select : function ( uri ) {
            this.dispatcher.dispatch("trackchange");
            this.player.video.pause();
            if(! this.player.metadata.load(uri) ){
                // if have no data, and no one will look it up, just play the url
                this._setSrc( uri );
            }
        },

        empty : function ( tracks ) {
            if(! this.config.selectSource ){
                return;
            }

            this.player.video.pause();
            this.player.video.src = "";
            this._tracks = [];
            this.transcodes = null;
            this._index = 0;
            this.dispatcher.dispatch("playlistchange");
            this.dispatcher.dispatch("trackchange");
        },

        next  : function () {

            var i = this._index + 1;
            var t = this.track(i);

            if( this.linkAdvance ) {
                var data = this.player.metadata.getData();
                if( data.link ) {
                    window.top.location = data.link;
                    return;
                }
            }

            this.index(i )
        },

        previous : function () {
            this.index( this._index - 1 )
        },

        track : function (i){
            if( i === undefined )
                i = this.index();
            return this._tracks[ this._resolveIndex(i) ];
        },

        nextTrack : function () {
            return this.track( this._index + 1);
        },

        tracks : function () {
            return this._tracks;
        },

        _addTrack : function ( track, silent ) {
            this._tracks.push(track);
            if( ! silent )
                this.dispatcher.dispatch("playlistchange");
        },

        _resolveIndex : function (i) {
            if( i == null)
                return null;
            var pl = this.tracks();
            if( i < 0  )
                i = pl.length + i;
            if( this.loop )
                i = i % pl.length;
            if( i >= pl.length || i < 0) {
                return null;
            }
            return i;
        },

        _addListeners : function () {
            var player = this.player;
            var metadata = this.player.metadata;
            var video = this.player.video;

            player.listen(MetaPlayer.DESTROY, this.destroy, this);
            metadata.listen(MetaPlayer.MetaData.DATA, this._onMetaData, this);

            var self = this;
            $(player.video).bind('ended error', function(e) {
                self._onEnded()
            });
        },


        _onMetaData : function (e) {
            if( e.uri != this.track() ){
                return;
            }

            this.transcodes = e.data.content;

            if( this.config.sourceTags )
                this.addSourceTags();

            if( this.config.selectSource )
                this.selectSource();
        },

        addSourceTags : function  () {
            var self = this;
            var video = this.player.video;
            $.each(this.transcodes, function (i, source) {
                video.appendChild( self._createSource(source.url, source.type) );
            });
        },

        selectSource : function () {
            // sticky, for playlists
            this.config.selectSource = true;

            var self = this;
            var video = this.player.video;
            var probably = [];
            var maybe = [];

            if( ! this.transcodes )
                return;

            $.each(this.transcodes, function (i, source) {
                var canPlay = video.canPlayType(source.type);
                if( ! canPlay )
                    return;
                if( canPlay == "probably" )
                    probably.push(source.url);
                else
                    maybe.push(source.url);
            });

            var src = probably.shift() || maybe .shift();
            if( src )
                this._setSrc(src);
        },

        _setSrc : function ( src ) {
            var video = this.player.video;
            video.src = src;
            if( video.autoplay || this.index() > 0 ) {
                video.play();
            }
            else if( video.preload ) {
                video.load()
            }
        },

        _createSource : function (url, type) {
            var src = $('<source>')
                .attr('type', type || '')
                .attr('src', url) ;
            return src[0];
        },

        _onEnded : function () {
            if(! this.advance )
                return;

            if( this.index() == this.tracks().length - 1 ) {
                this.dispatcher.dispatch('playlistComplete');
            }

            this.next();
        },

        destroy : function () {
            this.dispatcher.destroy();
            delete this.player;
        }

    };

})();
(function () {

    var $ = jQuery;

    var defaults = {
        forceRelative : false
    };

    var Search = function (player, options){
        this.config = $.extend({}, defaults, options);

        this.player = player;
        this.forceRelative = this.config.forceRelative;
        MetaPlayer.dispatcher(this);

        this.player.listen(MetaPlayer.DESTROY, this.destroy, this);
    };


    Search.QUERY = "QUERY";
    Search.RESULTS = "results";

    MetaPlayer.Search = Search;

    MetaPlayer.addPlugin("search", function (options) {
        return new Search(this);
    });

    Search.prototype = {
        query : function (query, callback, scope) {
            var data = this.player.metadata.getData();
            if(! data.ramp.searchapi )
                throw "no searchapi available";


            var e = this.createEvent();
            e.initEvent(Search.QUERY, false, false);
            e.query = query;
            this.dispatchEvent(e);

            this._queryAPI(data.ramp.searchapi, query, callback, scope)
        },

        destroy : function () {
            this.dispatcher.destroy();
            delete this.player;
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
                    })
                });
                ret.results.push(s);
            });
            return ret;
        },

        _deSmart : function (text) {
            return text.replace(/\xC2\x92/, "\u2019" );
        }
    }

})();

(function () {
    var $ = jQuery;

    var EventDispatcher = function (source){

        if( source && source.dispatcher instanceof EventDispatcher)
            return source.dispatcher;

        if( ! (this instanceof EventDispatcher ))
            return new EventDispatcher(source);

        this._listeners = {};
        this.attach(source);
    };

    MetaPlayer.dispatcher = EventDispatcher;

    EventDispatcher.Event = function () {
        this.cancelBubble = false;
        this.defaultPrevented = false;
    };

    EventDispatcher.Event.prototype = {
        initEvent : function (type, bubbles, cancelable)  {
            this.type = type;
            this.cancelable = cancelable;
        },
        stopPropagation : function () {
            this.cancelBubble  = true;
        },
        stopImmediatePropagation : function () {
            this.cancelBubble  = true;
        },
        preventDefault : function () {
            if( this.cancelable )
                this.defaultPrevented = true;
        }
    },

    EventDispatcher.prototype = {

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
            MetaPlayer.proxy.proxyFunction ( "listen forget dispatch createEvent",
                this, source);

            source.dispatcher = this;
        },

        destroy : function () {
            delete this._listeners;
            delete this.addEventListener;
            delete this.removeEventListener;
            delete this.dispatchEvent;
            this.__destroyed = true; // for debugging / introspection
        },

        listen : function ( eventType, callback, scope) {
            this.addEventListener(eventType, function (e) {
                callback.call(scope, e, e.data);
            })
        },

        forget : function (type, callback) {
            this.removeEventListener(type, callback);
        },

        dispatch : function (eventType, data) {
            var eventObject = this.createEvent();
            eventObject.initEvent(eventType, true, true);
            eventObject.data = data;
            return this.dispatchEvent(eventObject);
        },

        // traditional event apis
        addEventListener : function (eventType, callback) {
            if( ! this._listeners[eventType] )
                this._listeners[eventType] = [];
            this._listeners[eventType].push(callback);
        },

        removeEventListener : function (type, callback) {
            var l = this._listeners[type] || [];
            var i;
            for(i=l.length - 1; i >= 0; i-- ){
                if( l[i] == callback ) {
                    l.splice(i, 1);
                }
            }
        },

        createEvent : function (type) {
            if( document.createEvent )
                return document.createEvent(type || 'Event');

            return new EventDispatcher.Event();
        },

        dispatchEvent : function (eventObject) {

//            if( eventObject.type != "timeupdate")
//                   console.log(eventObject.type, eventObject);

            var l = this._listeners[eventObject.type] || [];
            for(var i=0; i < l.length; i++ ){
                if( eventObject.cancelBubble ) // via stopPropagation()
                    break;
                l[i].call(l[i].scope || this, eventObject, eventObject.data )
            }
            return ! eventObject.defaultPrevented;
        }

    }

})();
(function () {

    MetaPlayer.format = {
        seconds : function (time) {
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
                Ramp.dispatcher(target);
            }
            $.each(types.split(/\s+/g), function (i, type) {
                source.addEventListener(type, function (e) {
                    // if emulated, just use type
                    if( target.dispatch ) {
                        target.dispatch(e.type);
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
            if( descriptor.set && obj.__defineSetter__ )
                obj.__defineSetter__( prop, descriptor.set);

            // ie7 and other old browsers fail silently
        },

        // returns an object which can safely used with Object.defineProperty
        // IE8: can't do javascript objects
        // iOS: can't do DOM objects
        // use DOM where possible
        getProxyObject : function ( dom ) {

            // All modern browsers (and ie8)
            if( ! dom )
                dom = document.createElement("div");

            try {
                Object.defineProperty(dom, "__proptest", {} );
                return dom;
            }
            catch(e){
            }

            // iOS, fake as best we can, adding props as needed
            var target = {
                _proxyNode : dom,
                parentNode : dom.parentNode,
                tagName : dom.tagName,
                ownerDocument : dom.ownerDocument,
                style : dom.style,
                appendChild : function() { dom.appendChild.apply(dom, arguments) }
            };
            try {
                Object.defineProperty(target, "__proptest", {} );
                return target;
            }
            catch(e){
            }

            throw "Object.defineProperty not defined";
        },

        proxyPlayer : function (source, target) {
            var proxy = Ramp.proxy.getProxyObject(target);

            Proxy.mapProperty("duration currentTime volume muted seeking" +
                " paused controls autoplay preload src ended readyState ad",
                proxy, source);

            Proxy.proxyFunction("load play pause canPlayType" ,source, proxy);

            // MetaPlayer Optional Extensions
            Proxy.proxyFunction("mpf_resize" ,source, proxy);

            Proxy.proxyPlayerEvents(source, proxy);

            return proxy;
        },

        proxyPlayerEvents : function (source, target){
            Proxy.proxyEvent("timeupdate seeking seeked playing play pause " +
                "loadeddata loadedmetadata canplay loadstart durationchange volumechange adstart adstop"
                + " ended error",source, target);
        }
    };

    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.proxy = Proxy;


})();

(function () {

    var $ = jQuery;

    Ramp.script = {

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
        }

    }

})();
/**
 * skinnable, touch friendly lightweight scroller
 */


(function () {

    var $ = jQuery;

    var defaults = {
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
                .bind("mousewheel", function (e){
                    self.onScroll(e);
                })
                .bind((this.config.mouseDrag ? "mousedown" : '') + " touchstart", function (e) {
                    self.onTouchStart(e);
                });


            this.scrollTo(0,0);
        },

        onScroll : function(e) {
            var x = e.originalEvent.wheelDeltaX || e.originalEvent.delta || 0;
            var y = e.originalEvent.wheelDeltaY || e.originalEvent.delta || 0;
            this.scrollBy(-x, -y);
            e.preventDefault();
        },

        scrollBy : function (x, y, duration){
            var sl = this.scroller.scrollLeft();
            var st = this.scroller.scrollTop();
            this.scrollTo( sl + x ,  st + y, duration);
        },

        scrollTop : function () {
            return this.scroller.scrollTop();
        },

        scrollTo : function (x, y, duration){
            var max = this.body.height() - this.parent.height();
            var at_max = ( max > 0 && this.scroller.scrollTop() + 1 >= max ); // allow rounding fuzzyiness

             if( y > max  )
                y = max;

            if( y < 0 )
                y = 0;

            this.scroller.stop();

            if( duration && !at_max ){
                var self = this;
                this._scrollY = y;
                this.scroller.animate({
                    scrollLeft : x,
                    scrollTop : y
                }, duration, function () {
                    self._scrollY = null;
                });
                this.render(duration);
            }
            else {
                this.scroller.scrollLeft(x);
                this.scroller.scrollTop(y);
                this.render();
            }
        },

        render: function (duration) {

            // ff 11 crashes without second check if this.body isn't visible (or part of dom yet)
            if( ! this.body || ! this.body.is(":visible")) {
                return;
            }

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
                this.render(this.config.knobAnimateMs);
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
            this.scrollTo(x, y);
            e.stopPropagation();
            e.preventDefault();
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
        Ramp.dispatcher(this);
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

    Ramp.timer = Timer;

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

    Ramp.ui = {
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
