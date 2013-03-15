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

    var BrightcovePlayer = function(experienceID, options) {

        this.config = $.extend(true, {}, defaults, options);

        /* Brightcove Values */
        this.experienceID = experienceID;

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


        var objectElement = $("#"+experienceID);
        this.container = objectElement.get(0);
        this.video = MetaPlayer.proxy.proxyPlayer(this, this.container);

        this.initCheck()
    };

    MetaPlayer.Players.Brightcove = function ( bcExperienceId ) {
        if( ! window.brightcove )
            return;

        var bc_object = document.getElementById(bcExperienceId);
        if( ! bc_object || bc_object.getAttribute("class") == "BrightcoveExperience" )
            return;

        return MetaPlayer.brightcove(bcExperienceId);
    };

    MetaPlayer.addPlayer("brightcove", function (bc, options) {
        // single arg form
        if ( ! options && bc instanceof Object) {
            options = bc;
            bc = null;
        }

        if ( ! options ) {
            options = {};
        }

        if ( ! bc ) {
            bc = $("<div></div>")
                .prependTo(this.layout.base);
        }

        var bCove = new BrightcovePlayer(bc, options);
        this.video = bCove.video;
        this.brightcove = bCove;
    });

    MetaPlayer.brightcove = function (bcExperienceId, options) {
        var bCove = new BrightcovePlayer(bcExperienceId);
        return bCove.video;
    };

    BrightcovePlayer.prototype =  {
        initCheck : function () {
            MetaPlayer.log("brightcove", "initcheck...")
            var self = this;
            if( brightcove.api && brightcove.internal._instances[this.experienceID] ) {
                try {
                    this.brightcovePlayer = brightcove.api.getExperience(this.experienceID);
                    this.brightcoveVideoPlayer = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                    this.addListeners();
                    MetaPlayer.log("brightcove", "initcheck ok")
                    clearInterval( this._readyInterval );
                    self.init();

                }
                catch(e){}
            }
            else if( ! this._readyInterval ) {
                MetaPlayer.log("brightcove", "initcheck start interval")
                this._readyInterval = setInterval( function (e) {
                    self.initCheck();
                }, 250);
            }
        },
        init : function() {
            try {
            this.brightcovePlayer = brightcove.api.getExperience(this.experienceID);
            this.brightcoveVideoPlayer = this.brightcovePlayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
            } catch(e){
                debugger;
            }
            this.addListeners();
            this.startVideo();
        },

        isReady : function() {
            return this.brightcovePlayer;
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


        onMediaChange : function(e) {
            this._src = e.media.id;
            this._duration = e.duration / 1000;
            this._currentTime = 0;
            this._seekOnPlay = null;
            this._hasBegun = false;


            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
            this._readyState = 4;
            this.dispatch("canplay");
            this.dispatch('loadedmetadata');
            this.dispatch('loadeddata');
            this.dispatch("durationchange");
        },

        onMediaComplete : function(e) {
            this._ended = true;
            this._paused = true;
            var self = this;
            // re-entry problems
            setTimeout( function () {
                self.dispatch("ended");
            }, 0);
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function(e) {
            this._ended = false;
            this._paused = false;
            this._hasBegun = true;

            this._currentTime = e.position;

            var self = this;
            // brightcove has re-entry problems if seek is called during play event
            setTimeout( function () {
                self.dispatch("play");
                self.dispatch("playing");
            },250);
        },

        onMediaBegin : function(e) {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            var update = e.position - this._currentTime;
            if( isNaN(update) || update > .2 ) {
             // throttle to no more than 5/sec, BC seems to do about 25/sec
                this._currentTime = e.position;
                this.dispatch("timeupdate");
            }

            // onBegin is too soon to seek (it gets ignored), so we do it here
            if( this._seekOnPlay )
                this.doSeek(this._seekOnPlay )
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

            if ( this._preload == "none")
                return;

            if( this._ended )
                this.currentTime(0);

            this._ended = false;
            this.muted( this._muted );

            var src = this._src;
            if ( !src ) {
                return;
            }

            this.dispatch("loadstart");

            // "http://link.brightcove.com/services/link/bcpid1745093542/bclid1612710147/bctid1697210143001?src=mrss"
            var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            if( longForm )
                src = parseInt( longForm[1] );

            if (this._autoplay)
                this.brightcoveVideoPlayer.loadVideoByID(src);
            else
                this.brightcoveVideoPlayer.cueVideoByID(src);
        },

        doSeek : function(time) {
            this._currentTime = time;

            if(! this._hasBegun ){
                this._seekOnPlay = time;
            }

            this._seeking = true;
            this._seekOnPlay = null;
            this.dispatch("seeking");
            this.brightcoveVideoPlayer.seek(time);

            // onMediaSeekNotify callback doesn't fire when
            // programmatically seeking

            var self = this;
            setTimeout(function () {
                self._currentTime = time;
                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500);
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._preload = "auto";
            this._autoplay = true;

            if( this._readyState == 4 )
                this.brightcoveVideoPlayer.play();
            else
                this.startVideo();
        },

        pause : function() {
            this.isReady() && this.brightcoveVideoPlayer.pause();
        },

        canPlayType : function( type) {
            MetaPlayer.log("brightcove", "canPlayType?", type)
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
                this._currentTime = val || 0;
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
                // note: BC does not have a documented mute api
                this.brightcoveVideoPlayer._callMethod("mute", [ Boolean(val) ]);
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
                // note: BC does not have a documented volume api
                this.brightcoveVideoPlayer._callMethod("setVolume", [ val ]);
                this.dispatch("volumechange");
            }
            return this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
                this._readyState = 0;
                this._duration = NaN;
                this._currentTime = 0;
                this.startVideo();
            }
            return this._src;
        },

        autoplay : function ( val ) {
            if( val != null)
                this._autoplay = Boolean(val);
            return this._autoplay;
        },

        preload : function ( val ) {
            if( val != null)
                this._preload = val;
            return this._preload;
        },

        readyState: function() {
            return this._readyState;
        }

    };

})();