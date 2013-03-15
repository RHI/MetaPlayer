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

})();