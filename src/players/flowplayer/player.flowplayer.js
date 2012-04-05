(function () {

    var $ = jQuery;
    var $f = window.flowplayer;

    var defaults = {
        autoplay : false,
        preload : true,
        controls : true,
        swfUrl : "flowplayer-3.2.7.swf",
        wmode : "transparent",
        cssName : "mp-flowplayer",
        statusThrottleMSec : 500,
        fpConfig : {
            clip : {
                scaling : "fit"
            },
            canvas : {
                backgroundColor : "#0000000",
                backgroundGradient : "none"
            }
        }
    };

    var FlowPlayer = function (el, options){

        if( !(this instanceof FlowPlayer ))
            return new FlowPlayer(el, options);

        this.config = $.extend(true, {}, defaults, options);

        this.dispatcher = MetaPlayer.dispatcher(this);

        this._iOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
        this.__seeking = null;
        this.__readyState = 0;
        this.__ended = false;
        this.__paused = true;
        this.__duration = NaN;
        this.__youtubePlugin = false;

        this._pageSetup(el);

        this.__preload = this.config.preload;
        this.__autoplay = this.config.autoplay;
        this.__src = "";

        this._statepoll = Ramp.timer(250);
        this._statepoll.listen('time', this._onPlayStatePoll, this);

        this._timeupdater = Ramp.timer(250);
        this._timeupdater.listen('time', this._onTimeUpdate, this);

        var self = this;
        this._flowplayer.onLoad( function () {
            self._onLoad();
        });

        this.video = MetaPlayer.proxy.proxyPlayer(this, this._flowplayer.getParent());
        // check a flowplayer plugins
        this._loadPlugins();
    };

    MetaPlayer.flowplayer = function (el, options) {
        return FlowPlayer(el, options).video;
    };

    MetaPlayer.addPlayer("flowplayer", function (el, options) {
        // single argument mode: function(options) {
        if(!  el.getCommonClip  ) {
            options = el;
            el = $("<div></div>")
                .addClass("mp-video")
                .appendTo(this.layout.stage);
        }
        this.flowplayer = FlowPlayer(el, options);
        this.video = this.flowplayer.video;
    });

    FlowPlayer.prototype = {

        _pageSetup : function (el) {
            // if passed in fp instance
            if( el.getCommonClip ) {
                this._flowplayer = el;
                var common  = this._flowplayer.getCommonClip();
                this.preload( Boolean(common.autoBuffering) );
                this.autoplay( Boolean(common.autoPlay) );
            }
            // otherwise start one up
            else {
                el = $(el).get(0); // resolve "#foo"
                var config = $.extend(true, {
                    clip : {
                        autoPlay: false,
                        autoBuffering: true
                    }
                }, this.config.fpConfig);


                this._flowplayer = $f( el, {
                    src: this.config.swfUrl,
                    wmode: this.config.wmode
                }, config );
            }
        },

        _loadPlugins : function () {
            var config = this._flowplayer.getConfig();
            if( ! config.hasOwnProperty("plugins") )
                return;

            var pluginConfig = config.plugins;
            // check youtube plugin
            if( pluginConfig.youtube && pluginConfig.youtube.url.length > 0 )
                this.__youtubePlugin = true;
        },

        _onLoad : function () {
            // fires twice on ipad
            if( this._onLoadFired )
                return;
            this._onLoadFired = true;

            var self = this;

            // Player listeners
            this._flowplayer.onVolume( function (level) {
                self.dispatchIfClip("volumechange");
            });

            this._flowplayer.onMute( function (level) {
                self.dispatchIfClip("volumechange");
            });

            this._flowplayer.onUnmute( function (level) {
                self.dispatchIfClip("volumechange");
            });


            this._flowplayer.onPlaylistReplace( function () {
                self.dispatchIfClip("playlistChange");
            });


            this._flowplayer.onClipAdd( function () {
                self.dispatchIfClip("playlistChange");
            });


            this.controls( this.__controls );

            // apply src from before we were loaded, if any
            if( this.__src ) {
                this.src( this.__src );
            }
            else {
                var fp = this._flowplayer;
                var clips = fp.getPlaylist();
                $.each( clips, function (i, clip) {
                    self._addClipListeners(clip);
                    self.__src = clip.url;
                });
            }

            self.dispatchIfClip('loadstart');

            if( this.preload() || this.autoplay()  )
                this.load();
        },

        _addClipListeners : function (clip) {
            var self = this;

            if( ! clip )
                return;


            clip.onBeforeBegin( function (clip) {
                self.ad = clip.ovaAd || clip.isInStream;
                if( self.ad ) {
                    self.dispatch("adstart");
                }
                return true;
            });


            clip.onBegin( function (clip) {
                self._flowplayer.setVolume(100);
                self.__seeking = null;
                self.__duration = NaN;
                self._flowplayer.unmute();
            });

            clip.onStart( function (clip) {
                self._setReady();
                self._setPlaying(true);

                // ipad controls can't be hidden until after playing
                if( self._iOS && ! self.__controls ) {
                    self._setHTML5Controls(false);
                }

                self.dispatchIfClip('loadeddata');
                self.__duration = clip.duration;

                self.dispatchIfClip("durationchange");
                self.dispatchIfClip('loadedmetadata');
            });


            clip.onStop( function (clip) {
                if( self.ad ){
                    self.ad = false;
                    self.dispatch("adstop");
                }
                // this fires some times while play-seeking, not useful.
                // self._setPlaying(false);
            });

            clip.onFinish( function (clip) {
                self.__duration = NaN;
                self.__seeking = null;
                if( self.ad ){
                    self.dispatch("adstop");
                    self.ad = false;
                    return;
                }
                self.__ended = true;
                self._setPlaying(false);
                self._flowplayer.stop();
                self.dispatchIfClip("ended");
            });

            clip.onPause( function (clip) {
                self._setPlaying(false);
                self._setReady();
            });

            clip.onResume( function (clip) {
                self._setPlaying(true);
                self.dispatchIfClip("play");

                if( ! this.__duration ) {
                    self.__duration = clip.duration;
                    self.dispatchIfClip("durationchange");
                }
            });

            clip.onBeforeSeek( function (clip) {

                self.dispatchIfClip("seeking");
                self.dispatchIfClip("timeupdate");

                // fp doesn't do seeks while paused until it plays again, so we fake
                if( self.paused() )  {
                    self.dispatchIfClip("seeked");
                    self.__seeking = null;
                }
            });

            clip.onSeek( function (clip) {
                this.__currentTimeCache = 0;
                self.__seeking = null;
                if( ! self.paused() )
                    self.dispatchIfClip("seeked");
            });

        },

        _setReady : function (){
            if( this.__readyState != 4 ) {
                this.__readyState = 4;
                this.dispatchIfClip("canplay");
            }
            else {
                this.dispatchIfClip("seeking");
                this.dispatchIfClip("seeked");
            }
        },

        _setPlaying : function ( bool ){
            this.__paused = ! bool;
            // the play and pause events fire before isPlaying() and isPaused() update
            this._statepoll.start();
        },

        _setHTML5Controls : function (bool) {
            var video = $(this._flowplayer.getParent() ).find('video').get(0);
            video && (video.controls = bool);
        },

        /* Media Interface */

        load : function () {
            this.preload(true);
            if( this.src() && this._flowplayer.isLoaded()  ) {
                var c =  this._flowplayer.getClip(0);

                c.update({
                    autoPlay : this.autoplay(),
                    autoBuffer : true
                });

                // if ipad()
                if(  window.flashembed.__replaced && ! this.__loaded ) {
                    // ipad() play method respects autoPlay and autoBuffering
                    // but requires an argument to update video.src correctly
                    this._flowplayer.play(0);

                    // also has regexp bug which breaks every other play() (related: http://stackoverflow.com/a/2630538/369724)
                    if( this.autoplay() ) {
                        this._flowplayer.play(0);
                    }
                    this.__loaded = true;
                    return;
                }

                if( this.autoplay() ) {
                    this._flowplayer.play();
                }
                else {
                    this._flowplayer.startBuffering();
                }
            }
        },

        play : function () {
            this.autoplay(true);
            this.__paused = false; // helps onBeforeBegin() know to ignore clip.autoPlay == false
            this.load();
        },

        pause : function () {
            this._flowplayer.pause();
        },

        canPlayType : function (type) {
            var canPlay = null;

            // html5 / ipad
            if( window.flashembed.__replaced ){
                if( ! this._video )
                    this._video = document.createElement('video');

                // just accept m3u8
                if( this._iOS  && type.match(/mpegurl|m3u8/i)  ){
                    canPlay = "probably";
                } else if( this._video.canPlayType )
                    canPlay = this._video.canPlayType(type)
            }

            else if( this.__youtubePlugin && type.match(/youtube$/i) ) {
                canPlay = "probably";
            }

            // fall through to flash
            else if( type.match( /mp4|flv|jpg/ ) ) {
                canPlay = "probably";
            }

            return canPlay
        },

        paused : function (){
            return this.__paused;
        },

        duration : function () {
            return this.__duration;
        },

        seeking : function () {
            return (this.__seeking !== null );
        },

        ended : function () {
            return this.__ended;
        },

        currentTime : function (val){
            if( val !== undefined ){
                if( val < 0 )
                    val = 0
                if( val > this.duration )
                    val = this.duration;
                this.__seeking = val;
                this._flowplayer.seek(val);
            }

            if( this.__seeking !== null ) {
                return this.__seeking;
            }

            if( ! this._flowplayer.isLoaded() )
                return 0;

            // throttle the calls so we don't affect playback quality
            var now = (new Date()).getTime();
            var then = this.__currentTimeCache;
            var diff = now - then;

            if(then && diff< this.config.statusThrottleMSec ) {
                return this.__currentTime + (diff / 1000); // approx our position
            }
            else
                this.__currentTimeCache = now;

            var status = this._flowplayer.getStatus(); // expensive

            this.__currentTime = status.time;
            return this.__currentTime;
        },

        muted : function (val){
            if( val !== undefined ){
                if( val )
                    this._flowplayer.mute();
                else
                    this._flowplayer.unmute();
            }
            var status = this._flowplayer.getStatus();
            return Boolean( status.muted );
        },

        volume : function (val){
            if( val !== undefined ) {
                this._flowplayer.setVolume(val * 100);
            }
            return this._flowplayer.getVolume() / 100;
        },

        controls : function (val) {
            if( ! this._flowplayer.isLoaded() ) {
                if( val !== undefined )
                    this.__controls = val;
                return this.config.controls;
            }

            var controls = this._flowplayer.getControls();
            var playBtn =  this._flowplayer.getPlugin("play");

            if( val !== undefined ){
                this.__controls = val;
                if( val ) {
                    controls && ( controls.show() );
                    playBtn && playBtn.show();
                    this._setHTML5Controls(true);
                }
                else {
                    controls && ( controls.hide() );
                    playBtn && playBtn.hide();
                    this._setHTML5Controls(false);
                }
            }
            return this.__controls
        },

        preload : function (val) {
            if( val !== undefined )
                this.__preload = val;
            return this.__preload;
        },

        autoplay : function (val) {
            if( val !== undefined )
                this.__autoplay = val;
            return this.__autoplay;
        },

        loop : function (bool) {
            if( bool !== undefined ) {
                this.__loop = bool;
            }
            return this.__loop;
        },

        src : function (val) {
            if( val !== undefined ) {
                // have to show to allow proprietary must-use play button
                if( this._iOS )
                    this._setHTML5Controls(true);

                this.__src = val;
                this.__loaded  = false;
                this.__duration  = NaN;
                var fp = this._flowplayer;
                if( fp.isLoaded() ) {
                    fp.setClip(this._createClipData(this.__src));
                    var c = fp.getClip(0);
                    this._addClipListeners(c);
                }
            }
            return this.__src;
        },

        readyState : function (val) {
            if( val !== undefined )
                this.__readyState = val;
            return this.__readyState;
        },

        /* Timer Handlers */

        _onPlayStatePoll : function () {
            if( this._flowplayer.isPlaying() === this.paused() )
                return;

            this._statepoll.reset();
            if( this.paused()  ) {
                this.dispatchIfClip("pause");
                this._timeupdater.reset();
            }
            else {
                this.autoplay(true);
                this.dispatchIfClip("playing");
                this.dispatchIfClip("play");
                this._timeupdater.start();
            }
        },

        _onTimeUpdate : function  () {
            this.dispatchIfClip("timeupdate");
        },

        /* Create a clip data depending on a plugin */
        _createClipData : function (src) {
            var data = {};
            var config = this._flowplayer.getConfig();
            if ( typeof src === "undefined" || src.length <= 0 )
                return data;
            if ( this.__youtubePlugin && ! src.match(/http|rtmp/i) ) {
                data.provider = "youtube";
                data.urlResolvers = 'youtube';
                data.url = "api:" + src;
            } else {
                data.url = src;
            }
            data.autoPlay = false;
            data.autoBuffering = false;
            data.scaling = config.clip.scaling;
            return data;
        },

        dispatchIfClip : function (e){
            var clip = this._flowplayer.getClip();
             if( clip && (clip.ovaAd || clip.isInStream) )
                return;
            this.dispatch(e);
        }
    };
})();
