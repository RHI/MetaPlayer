(function() {

    var $ = jQuery;
    var jwplayer = window.jwplayer;

    var defaults = {
        autostart  : true,
        autobuffer : true,
        controlbar :  "none",
        image      : "",
        id         : "jwplayer",
        //duration   : 0,
        volume     : 100,
        width      : "100%",
        height     : "100%",
        icons      : false, // disable a big play button on the middle of screen
        events     : {
            onTime: function(e) {}, onMeta: function(e) {}
        },
        plugins: { viral: { onpause: false, oncomplete: false, allowmenu: false } } // disable all viral features.
    };

    var JWPlayer = function(el, options) {
        if(!( this instanceof JWPlayer ))
            return new JWPlayer(el, options);

        this.config = $.extend(true, {}, defaults, options);
        this.__autoplay = this.config.autostart;
        this.__autobuffer = this.config.autobuffer;
        this.__volume = (this.config.volume/100);
        this.__seeking = null;
        this.__readyState = 0;
        this.__ended = false;
        this.__paused = (! this.config.autostart);
        this.__duration = NaN;
        this.__metadata = null;
        this.__started = false;
        this.__currentTime = 0;
        this.__src = "";

        this._jwplayer = this._render( $(el).get(0) );

        // we have to wrap: jwplayer will clone this container and eventually
        // remove it from the DOM.
        var video = $("<div></div>")
            .height( el.config.height )
            .width( el.config.width )
            .insertAfter( el.container )
            .append(el.container);

        this.dispatcher = MetaPlayer.dispatcher( this );
        this.video = MetaPlayer.proxy.proxyPlayer( this, video.get(0) );

        var self = this;
        this._jwplayer.onReady(function() {
            self._onLoad();
        });
    };

    if( window.MetaPlayer ) {
        MetaPlayer.addPlayer("jwplayer", function ( target, options ) {
            if(target.container ) {
                $(this.layout.stage).append(target.container);
            }
            else {
                options = target;
                target = this.layout.stage;
            }
            this.jwplayer = JWPlayer(target, options);
            this.video = this.jwplayer.video;
        });
    } else {
        window.MetaPlayer = {};
    }

    MetaPlayer.jwplayer = function (target, options) {
        var jwplayer = JWPlayer(target, options);
        return jwplayer.video;
    };

    JWPlayer.prototype = {
        _render: function (el) {
            if( el.container ) {
                this.__autoplay = el.config.autostart;
                return el;
            }
            var target = $("<div class='mpf-jwplayer'></div>").appendTo(el).get(0);
            return jwplayer(target).setup(this.config);
        },

        _onLoad: function() {
            var self = this;

            //console.log("_onLoad", this._jwplayer.getMeta());
            // Player listeners
            this._jwplayer.onPlay( function (level) {
                self.__ended = false;
                self.__paused = false;
                self.__started = true;
                self.dispatch("play");
            });

            this._jwplayer.onPause( function (level) {
                self.__paused = true;
                self.dispatch("pause");
            });

            this._jwplayer.onTime( function (e) {
                self.__currentTime = e.position;
                self.dispatch("timeupdate");
            });

            this._jwplayer.onIdle( function (e) {
                // not sure what should do for this event.
            });

            this._jwplayer.onBuffer( function (e) {
                self.__readyState = 4;
                self.dispatch("buffering");       
            });

            this._jwplayer.onSeek( function (e) {
                self.__seeking = e.offset;
                self.__currentTime = e.offset;
                self.dispatch("seeked");
            });

            this._jwplayer.onComplete( function (e) {
                self.__ended = true;
                self.__started = false;
                self.__paused = true;
                self.dispatch("ended");
            });

            this._jwplayer.onVolume( function (e) {
                self.dispatch("volumechange");
            });

            this._jwplayer.onMute( function (e) {
                self.dispatch("volumechange");
            });

            this._jwplayer.onMeta( function (e) {
                self.__metadata = e.metadata;   
                if ( e.metadata.duration && e.metadata.duration > 0 ) {
                    self.__duration = e.metadata.duration;
                    self.dispatch("loadeddata");
                    self.dispatch("loadedmetadata");
                    self.dispatch("durationchange");
                }
            });

            this._jwplayer.onPlaylist( function (e) {
                self.__started = false;
                self.dispatch("playlistChange");
            });

            this._jwplayer.onError( function (e) {
                self.__started = false;
            });

            this.__src = this._getSrc();

            this.dispatch('loadstart');
            this.dispatch("canplay");

            if( this._getAutoBuffer() || this._getAutoPlay() )
                this.load();
        },

        _doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            this._jwplayer.seek( time );
            this.__currentTime = time;

            // no seeking events exposed, so fake best we can
            // will be subject to latency, etc
            var self = this;
            setTimeout (function () {
                self._updateTime(); // trigger a time update
                self.__seeking = null;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500)
        },
        _updateTime : function () {
            this.__currentTime = this._jwplayer.getPosition();
        },

        _getAutoPlay : function () {
            return this.__autoplay;
        },

        _getAutoBuffer : function () {
            return this.__autobuffer;
        },

        _getSrc : function () {
            if (! this._jwplayer ) return "";
            return this._jwplayer.getPlaylist()[0].file;
        },

        /**
         * adding to video src to jwplayer's playlist
         * due to its async for getting a video src,
         * creates a interval to check the player is initiated or not to put a video source.
         */ 
        _addToPlaylist : function (val) {
            var self = this;
            if( typeof val !== 'undefined' && val.length > 0 ) {
                if( self._jwplayer && self._jwplayer.getState() ) {
                    self._jwplayer.load({file : val, autostart: self._jwplayer.config.autostart});
                    clearInterval( self._playlistCheckInterval );
                    self._playlistCheckInterval = null;
                } else {
                    if( self._playlistCheckInterval ) {
                        return;
                    }
                    self._playlistCheckInterval = setInterval(function () {
                        self._addToPlaylist(val);
                    }, 1000);
                }
                self.__src = val;
            }
        },

        _getVideoContainer : function (target) {
            return (target.container)? target.container.parentElement : target;
        },

        /**
         * MetaPlayer Media Interfaces
         *
         * @Functions
         * load()
         * play()
         * pause()
         * canPlayType(type)
         *
         */
        load : function () {
            if( this.src() ) {
                var f = this.src();
                this._jwplayer.load([{file: f}]);
            }
            if( this._jwplayer ) {
                if( this._getAutoPlay() ) {
                    this._jwplayer.play();
                } else {
                    // in jwplayer, it doesn't have a autobuffer. add a trick with play/pause.
                    this._jwplayer.play();
                    this._jwplayer.pause();
                }
            }
        },
        play : function () {
            this._jwplayer.play();
        },
        pause : function () {
            this._jwplayer.pause();
        },
        canPlayType : function (val) {
            return true;
        },
        /**
         * MetaPlayer Media Properties
         * paused()
         * duration()
         * seeking()
         * ended()
         * currentTime(val)
         * muted()
         * volume(val)
         * src(val)
         * readyState()
         * controls()
         */
        paused : function () {
            return this.__paused;
        },
        duration : function () {
            return this.__duration;
        },
        seeking : function () {
            return (this.__seeking !== null);
        },
        ended : function () {
            return this.__ended;
        },
        currentTime : function (val) {
            if( val !== undefined ){
                if( val < 0 )
                    val = 0;
                if( val > this.duration )
                    val = this.duration;
                this._doSeek(val);
            }

            return this.__currentTime;
        },
        readyState : function (val) {
            if( val !== undefined )
                this.__readyState = val;
            return this.__readyState;
        },
        muted : function (val) {
            if( val !== undefined )
                this._jwplayer.setMute();
            return this._jwplayer.getMute();
        },
        volume : function (val) {
            if( val != null ){
                this.__volume = val;
                if( ! this._jwplayer )
                    return val;
                // ovp doesn't support to change any volume level.
                this._jwplayer.setVolume(val*100);
                this.dispatch("volumechange");
            }
            return (this.__volume > 1)? (this.__volume/100):this.__volume;
        },
        src : function (val) {
            this._addToPlaylist(val);
            return this.__src
        },
        controls : function (val) {
            if( typeof val !== 'undefined' ) {
                this.__controls = val;
                if( val )
                    this._jwplayer.getPlugin("controlbar").show();
                else
                    this._jwplayer.getPlugin("controlbar").hide();
            }
            return this.__controls;
        },

        // MPF Extensions
        mpf_resize : function (w, h) {
            if( this._height != h || this._width != w ){
                this._height = h;
                this._width = w;
                this._jwplayer.resize(w +"px", h+"px");
            }
        }
    };

})();
