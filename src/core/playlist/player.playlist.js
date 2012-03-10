
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
                var link = t.link || t.linkURL;
                if( link ) {
                    window.top.location = link;
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
