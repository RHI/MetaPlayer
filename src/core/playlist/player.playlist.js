/**
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
