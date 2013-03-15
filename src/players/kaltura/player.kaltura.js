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

})();