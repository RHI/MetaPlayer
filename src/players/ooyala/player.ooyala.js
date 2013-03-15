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

    var OoyalaPlayer = function() {

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
        this._preload = "none";
        this._autoplay = false;
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

        var ooyalaScriptEl = $('script[src*="//player.ooyala.com/player.js"]').get(0);

        //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
        var getParameterByName = function(name, string)
        {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(string);
            if(results === null)
                return "";
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        this.playerId = getParameterByName('playerId', ooyalaScriptEl.src);
        this.playerCallback = getParameterByName('callback', ooyalaScriptEl.src);

        this.onReady();
        
        this.init();
    };

    MetaPlayer.ooyala = function () {
        var ooyala = new OoyalaPlayer();
        return ooyala.video;
    };

    OoyalaPlayer.prototype =  {
        init : function() {

            this.addListeners();
            this.startVideo();            
        },

        isReady : function() {
            // we don't instantiate until the ready callback from the plyaer
            return true;
        },

        addListeners : function() {
            var self = this;
            
            window[this.playerCallback] = function(playerId, eventName, eventArgs) {
                switch (eventName) {
                    case "apiReady":
                        break;
                    case "playerEmbedded":

                        break;
                    case "playheadTimeChanged":
                        self.onMediaProgress(eventArgs);
                        break;
                    case "stateChanged":
                        switch (eventArgs.state) {
                            case "buffering":
                                self.onMediaBegin();
                                break;
                            case "playing":
                                self.onMediaPlay();
                                break;
                            case "paused":
                                self.onMediaPause();
                                break;
                        }
                        break;
                    case "seeked":
                        self.onMediaSeekNotify(eventArgs);
                        break;
                    case "playComplete":
                        self.onMediaComplete();
                        break;
                    case "currentItemEmbedCodeChanged":
                        // not sure what difference is here between this and embedCodeChanged
                        
                        break;
                    case "totalTimeChanged":
                        
                        break;
                    case "embedCodeChanged":
                        self.onMediaChange(eventArgs);
                        break;
                    case "volumeChanged":
                        
                        break;
                }
            };
        },

        onReady : function() {
            this.ooyalaPlayer = $('#' +this.playerId).get(0);
            MetaPlayer.dispatcher( this );
            this.video = MetaPlayer.proxy.proxyPlayer(this, this.ooyalaPlayer);
        },

        onMediaChange : function(e) {
            this._src = e.embedCode;
            this._currentTime = 0;
            this._duration = e.time;
            this._seekOnPlay = null;
            this._hasBegun = false;
            this._readyState = 4;

            // if ( this._autoplay ) {
            //     this._paused = false;
            //     // do the playing here for change
            // }
            // else {
            //     console.log('we are here');
            //     this._paused = true;
            // }
            
            this.dispatch('canplay');
            this.dispatch("loadstart");
            this.dispatch('loadedmetadata');
            this.dispatch('loadeddata');
            this.dispatch("durationchange");
        },

        onMediaComplete : function(e) {
            this._currentTime = 0;
            this._ended = true;
            this._paused = true;
            this.dispatch("ended");
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function() {
            this._ended = false;
            this._paused = false;
            this._hasBegun = true;
            this.dispatch("playing");
            this.dispatch("play");
        },

        onMediaBegin : function() {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            this._currentTime = e.playheadTime;
            this.dispatch("timeupdate");
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            this._currentTime = e.newPlayheadTime;
        },

        onMediaPause : function() {
            this._paused = true;
            this._ended = false;
            this.dispatch( "pause" );
        },

        startVideo : function() {
            if( this._ended ) {
                this.currentTime(0);
            }

            this._ended = false;
            this.muted( this._muted );

            var src = this._src;
            if ( !src ) {
                return;
            }

            this.dispatch("loadstart");

            //var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            // if( longForm )
            //     src = parseInt( longForm[1] );
            
            this.ooyalaPlayer.setQueryStringParameters({embedCode: src});

            if ( this._autoplay ) {
               this.ooyalaPlayer.playMovie();
            }
                
        },

        doSeek : function(time) {
            this._currentTime = time;

            if(! this._hasBegun ){
                this._seekOnPlay = time;
            }

            this._seeking = true;
            this._seekOnPlay = null;
            this.dispatch("seeking");
            this.ooyalaPlayer.setPlayheadTime(time);
            
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._autoplay = true;
            if ( this._preload == "none" ) {
                this.startVideo();
            }
            else {

                this.ooyalaPlayer.playMovie();
            }
        },

        pause : function() {
            return this.ooyalaPlayer.pauseMovie();
        },

        canPlayType : function( type) {
            MetaPlayer.log("ooyala", "canPlayType?", type);
            return Boolean  ( type.match(/\/ooyala$/ ) );
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
            if ( val != undefined ) {
                this._muted = val;
               
                if ( val ) {
                    this.ooyalaPlayer.setVolume(0);
                }
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },

        volume : function( val ) {
           if ( val != null && val != this._volume ) {
                this._volume = val;

                this.ooyalaPlayer.setVolume( val );
                this.dispatch("volumechange");
            }
            return ( this._volume > 1 ) ? ( this._volume / 100 ) : this._volume;
        },

        src : function (id) {
            if (id !== undefined) {
                this._src = id;
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