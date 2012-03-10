/**
 Metaplayer - A standards-based, multiple player, UI and Event framework for JavaScript.

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

 Created: 2011 by Greg Kindel <greg@gkindel.com>

 Dependencies: jQuery

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
        if( video ) {
            if( typeof video == "string")
                video = $(video).get(0);

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
            this.layout = MetaPlayer.layout(video);
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

            if (! this._loadQueue ) {
                // load() was already called
                return;
            }

            // fill in core interfaces were not implemented
            if( ! this.video && this.layout )
                this.html5();

            if( this.video && ! this.playlist )
                this.playlist = new MetaPlayer.Playlist(this, this.config);

            if( this.video && ! this.popcorn && Popcorn != null )
                this.popcorn = Popcorn(this.video);


            // run the plugins, any video will have been initialized by now
            var self = this;
            $( this._loadQueue ).each(function (i, plugin) {
                plugin.fn.apply(self, plugin.args);
            });
            this._loadQueue = null;


            // let plugins do any setup which requires other plugins
            this.dispatcher.dispatch( MetaPlayer.READY );

            this.ready = true;
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


