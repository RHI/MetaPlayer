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

    var ThePlatformPlayer = function(theplatform, options) {
        this.config = $.extend(true, {}, defaults, options);

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

        // Grab config parameters
        this._autobuffer = this.config.autobuffer;
        this._autoplay = this.config.autoplay;
        this._preload = this.config.preload;
        this._loop = this.config.loop;

        MetaPlayer.dispatcher( this );

        this.theplatform = theplatform;
        this.tpController = theplatform.controller;

        this.addListeners();

        this.video = MetaPlayer.proxy.proxyPlayer(this);
        
    };

    MetaPlayer.addPlayer("theplatform", function (theplatform, options) {

        // single arg form 
        if ( ! options && theplatform instanceof Object) {
            options = theplatform;
            theplatform = null;
        }

        if ( ! options ) {
            options = {};
        }


        if (! this.video) {
            var tp = new ThePlatformPlayer(theplatform, options);
            this.video = tp.video;  
            this.theplatform = bc;            
        }
        
    });

    MetaPlayer.theplatform = function (theplatform, options) {
        var tp = new ThePlatformPlayer(theplatform, options);
        return tp.video;
    }

    ThePlatformPlayer.prototype =  {
        
        init : function() {

        },

        isReady : function() {
            return this.theplatform && this.theplatform.controller;
        },

        addListeners : function() { 
            var tpc = this.tpController;
            var self = this;

            tpc.addEventListener("OnMediaPause", function(e) {
                self.onMediaPause(e);
            });

            tpc.addEventListener("OnMediaUnpause", function(e) {    
                self.onMediaUnpause(e);
            });

            // misleading event - documentation mentions firing when playack is resumed
            // after buffering
            tpc.addEventListener("OnMediaPlay", function(e) { 
                self.onMediaPlay(e);
            });

            tpc.addEventListener("OnReleaseStart", function(e) {
                self.onReleaseStart(e);
            });

            tpc.addEventListener("OnMediaPlay", function(e) {
                self.onReleaseStart(e);
            });

            tpc.addEventListener("OnSetRelease", function(e) { 
                self.onMediaChange(e);
            });            

            tpc.addEventListener("OnSetReleaseUrl", function(e) { 
                self.onMediaChange(e);
            });            

            tpc.addEventListener("OnLoadRelease", function(e) { 
                self.onMediaChange(e);
            });            

            tpc.addEventListener("OnLoadReleaseUrl", function(e) { 
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

        onReleaseStart : function(e) {  
            this._ended = false;
            this.dispatch("play");
            this.dispatch("playing");
            this._paused = false;
        },

        onMediaChange : function(e) {
            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
            
            if (typeof e.data == "object") {
                this._duration = e.data.length;
            }
            this.dispatch('durationchange');
            this.dispatch('loadedmetadata');

            this.dispatch('loadeddata');
        },

        onMediaEnd : function(e) {            
            this._ended = true;
            this._duration = NaN;
            this.dispatch("ended");
        },

        onMediaError : function(e) {
            this.dispatch("error");
        },
        
        onMediaPlaying : function(e) {
            this._currentTime = e.data.currentTime;
            this.dispatch("timeupdate");
        },

        onMediaSeek : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            this._currentTime = e.data.end.currentTime;
        },

        onMediaPause : function(e) {
            this._paused = true;
            this._ended = false;
            this.dispatch("pause");
           
        },

        onMediaUnpause : function(e) {  
            this._paused = false;
            this._ended = false;
            this.dispatch("play");
            this.dispatch("playing");
            
        },

        startVideo : function() {   
            if ( ! this.isReady()) {
                return;
            }

            this._ended = false;

            if ( this._muted ) {
                this.tpController.mute(this._muted);
            }

            var src = this._src;

            if ( !src ) {
                return;
            }
            
            if ( this._readyState < 4) {
                this._readyState = 4;
                this.dispatch("loadstart");
                this.dispatch("canplay");
            }

            // TODO: Pull out ID if URL passed for SRC

            if (this._autoplay) {                
                // TODO: Implement URL / ID load - like YouTube Player
                this.tpController.setReleaseURL(src);
            }
            else if (this._preload) {                
                this.load();
            }


        },

        doSeek : function(time) {    
            this._seeking = true;
            this.dispatch("seeking");    
            this.tpController.seekToPosition(time);
            this._currentTime = time;

            /// temp to get through the unit test because seek is not 
            // available until the video has begun playing
            // will remove this later
            var self = this;
            setTimeout(function() {
                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
    
            })
        },

        /* Media Interface */

        load : function() {
            this._preload = true;

            if ( ! this.isReady() ) {
                return;
            }

            // TODO: Needs URL and ID Support - like YouTube Player
            this.tpController.loadReleaseURL(this._src);

        },

        play : function() {
            this._autoplay = true;
            if ( ! this.isReady() ) {

                return;
            }

            if (this._paused) {
                 this.tpController.pause(!this._paused);
            }
            this.tpController.clickPlayButton();
        

        },

        pause : function() {
            if ( ! this.isReady() ) {
                return;
            }

            this.tpController.pause(!this._paused);
        },

        canPlayType : function() {
            return Boolean  ( type.match(/\/theplatform$/ ) );
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
            if ( val != undefined ) {
                this._ended = false;
                this.doSeek(val * 1000);
            }
            return this._currentTime * .001;
        },

        muted : function( val ) {
            if ( val != null ) {
                this._muted = val;
                if ( ! this.isReady() ) {
                    return val;
                }
                // CHANGE ***********
                if ( val ) {
                    //mute 
                }
                else {
                    //unmute 
                }
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {   
            if ( val != null ) {
                if (val < 1 ) {
                    val = val * 100;
                }
                this._volume = val;
                if ( ! this.isReady() ) {
                    return val;
                }
                this.tpController.setVolume(val);
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

    }

})();