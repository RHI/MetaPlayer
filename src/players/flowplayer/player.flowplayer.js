(function () {

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
