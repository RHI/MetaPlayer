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

    var BrightcovePlayer = function(brightcove, options) {
        this.config = $.extend(true, {}, defaults, options);

        /* Brightcove Values */
        this.experienceID = this.config.playerVars.experienceID;

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

        // other object vars
//        this._timeCheckInterval = null;

        MetaPlayer.dispatcher( this );

        this.brightcove = brightcove;
        this.brightcovePlayer = this.brightcove.api.getExperience(this.experienceID);
        this.brightcoveVideoPlayer = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
        this.brightcoveContent = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.CONTENT);
        this.brightcoveExperience = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
        this.brightcoveExperience = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.CUE_POINTS);

        //this.container = $(this.config.container).get(0);
        this.addListeners();

        this.video = MetaPlayer.proxy.proxyPlayer(this);
        
    };

    MetaPlayer.addPlayer("brightcove", function (brightcove, options) {

        // single arg form 
        if ( ! options && brightcove instanceof Object) {
            options = brightcove;
            brightcove = null;
        }

        if ( ! options ) {
            options = {};
        }

//        if ( ! brightcove ) {
            // not sure yet.
//        }

        if (! this.video) {
            var bc = new BrightcovePlayer(brightcove, options);
            this.video = bc.video;  
            this.brightcove = bc;            
        }
        
    });

    MetaPlayer.brightcove = function (brightcove, options) {
        var bc = new BrightcovePlayer(brightcove, options);
        return bc.video;
    }

    BrightcovePlayer.prototype =  {
        
        init : function() {

        },

        isReady : function() {
            return this.brightcove && this.brightcovePlayer.getModule(this.brightcove.api.modules.APIModules.VIDEO_PLAYER);
        },

        addListeners : function() { 
            var bcvp = this.brightcoveVideoPlayer;
            var self = this;

            bcvp.addEventListener("mediaBegin", function(e) { 
                self.onMediaBegin(e);
            });

            bcvp.addEventListener("mediaChange", function(e) { 
                self.onMediaChange(e);
            });            

            bcvp.addEventListener("mediaComplete", function(e) { 
                self.onMediaComplete(e);
            });            

            bcvp.addEventListener("mediaError", function(e) { 
                self.onMediaError(e);
            });            

            bcvp.addEventListener("mediaPlay", function(e) { 
                self.onMediaPlay(e);
            });            

            bcvp.addEventListener("mediaProgress", function(e) { 
                self.onMediaProgress(e);
            });            

            bcvp.addEventListener("mediaSeekNotify", function(e) { 
                self.onMediaSeekNotify(e);
            });            

            bcvp.addEventListener("mediaStop", function(e) { 
                self.onMediaStop(e);
            });            
        },

        onMediaBegin : function(e) {
            
        },

        onMediaChange : function(e) {
            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
            this._duration = e.duration * .001;
            this.dispatch('durationchange');
            this.dispatch('loadedmetadata');

            this.dispatch('loadeddata');
        },

        onMediaComplete : function(e) {
            this._ended = true;
            this._duration = NaN;
            this.dispatch("ended");
        },

        onMediaError : function(e) {

        },

        onMediaPlay : function(e) {
            this._ended = false;
            this._paused = false;
            this.dispatch("play");
            this.dispatch("playing");
        },

        onMediaProgress : function(e) {
            this._currentTime = e.position;
            this.dispatch("timeupdate");
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            this._currentTime = e.position;
        },

        onMediaStop : function(e) {
            if (this._duration == e.position) {
                // handled at onMediaComplete
                //this._paused = false;
                //this._ended = true;
                //this.dispatch("ended");
                
            }
            else {
                this._paused = true;
                this._ended = false;
                this.dispatch("pause");
                
            }
        },

        startVideo : function() {   
            if ( ! this.isReady()) {
                return;
            }

            this._ended = false;

//            if ( this._muted ) {
                // mute brightcove - not supported
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

            // TODO: Pull out ID if URL passed for SRC

            if (this._autoplay) {                
                this.brightcoveVideoPlayer.loadVideoByID(src);
            }
            else if (this._preload) {                
                this.load();
            }


        },

        doSeek : function(time) {    
            this._seeking = true;
            this.dispatch("seeking");
            this.brightcoveVideoPlayer.seek(time);
            this._currentTime = time;

            var self = this;

            // onMediaSeekNotify callback doesn't fire when
            // programmatically seeking
            
            setTimeout(function () { 
                self._currentTime = time;
                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500);
        },

        /* Media Interface */

        load : function() {
            this._preload = true;

            if ( ! this.isReady() ) {
                return;
            }

            this.brightcoveVideoPlayer.cueVideoByID(this._src);            

        },

        play : function() {
            this._autoplay = true;
            if ( ! this.isReady() ) {

                return;
            }

            this.brightcoveVideoPlayer.play();

        },

        pause : function() {
            if ( ! this.isReady() ) {
                return;
            }

            this.brightcoveVideoPlayer.pause();
        },

        canPlayType : function() {
            return Boolean  ( type.match(/\/brightcove$/ ) );
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
                this.doSeek(val);
            }
            return this._currentTime;
        },

        muted : function( val ) {
            if ( val != null ) {
                this._muted = val;
                if ( ! this.isReady() ) {
                    return val;
                }
//                if ( val ) {
                    // mute brightcove - not supported
//                }
//                else {
                    // unmute brightcove - not supported
//                }
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {   
            if ( val != null ) {
                this._volume = val;
                if ( ! this.isReady() ) {
                    return val;
                }
                // set brightcove volume - not supported
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