(function() {

    var $ = jQuery;

    /**
     * @name Players.JWPlayer
     * @constructor
     * @param {JWPlayer} el A JWPlayer instance
     * @description Given a JWPlayer instance, returns an HTML5 MediaElement like
     * interface for standards compatibility.
     * @extends Util.ProxyPlayer
     * @example
     * var jwp = jwplayer('video').setup({
     *    flashplayer: "player.swf",
     *    autostart   : true,
     *    width: "100%",
     *    height: "100%"
     * });
     * var video = MetaPlayer.jwplayer(jwp);
     *
     * @see MetaPlayer.jwplayer
     * @see <div style="margin: 10px 0;">Live Example: </div>
     * <iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/ramp/XG495/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
     */

    var log = function() {
        if ( window.console ) {
            console.log.apply( console, arguments );
        }
    };

    var JWPlayer = function( jwp ) {
        if ( !( this instanceof JWPlayer ) ) {
            return new JWPlayer( jwp );
        }

        this._jwplayer = jwp;
        this._volume = 0;
        this._seeking = null;
        this._readyState = 0;
        this._ended = false;
        this._paused = true;
        this._duration = NaN;
        this._metadata = null;
        this._muted = false;
        this._started = false;
        this._currentTime = 0;
        this._src = "";

        this.dispatcher = MetaPlayer.dispatcher( this );
        this.video = MetaPlayer.proxy.proxyPlayer( this, this._jwplayer.container );
        MetaPlayer.Playlist.proxy( this, this.video );

        this._autoplay = this._jwplayer.config.autostart;
        this._preload = this._jwplayer.config.autobuffer;
        
        this._onLoad();
    };

    /**
     * @name MetaPlayer.jwplayer
     * @function
     * @param {JWPlayer} el A JWPlayer instance
     * @descriptions Given a JWPlayer instance, returns an HTML5 MediaElement like
     * interface for standards compatibility. Serves as an alias for <code>(new JWPlayer(el, options)).video</code>
     * @example
     * var jwp = jwplayer('video').setup({
     *    flashplayer: swf,
     *    autostart   : true,
     *    width: "100%",
     *    height: "100%"
     * });
     * var video = MetaPlayer.jwplayer(jwp);
     *
     * @see Players.JWPlayer
     * @see <a href="http://jsfiddle.net/ramp/XG495/">Live Example</a>
     */
    // MetaPlayer.jwplayer = function( jwp ) {
    //     var jwplayer = JWPlayer( jwp );
    //     return jwplayer.video;
    // };

    MetaPlayer.jwplayer = function( jwp ) {
        var jwplayer = JWPlayer( jwp );
        return jwplayer.video;
    };

    JWPlayer.prototype = {
        
        _onLoad: function() {
            
            var self = this,
                jwp = this._jwplayer;

            jwp.onBuffer(function( e ){
                //log( "Buffer", e );
                
                self._readyState = 4;
            });

            jwp.onBufferChange(function( e ) {
                ////log( "BufferChange", e );
            });

            jwp.onBufferFull(function( e ) {
                //log( "BufferFull", e );
            });

            jwp.onError(function( e ) {
                //log( "Error", e );
            });

            jwp.onFullscreen(function( e ) {
                //log( "FullScreen", e );
            });

            jwp.onMeta(function( e ) {
                //log( "Meta", e );
            });

            jwp.onMute(function( e ) {
                //log( "Mute", e );

                self._muted = e.mute;
            });

            jwp.onPlaylist(function( e ) {
                //log( "Playlist" , e);
            });

            jwp.onPlaylistItem(function( e ){
                //log( "PlaylistItem", e );

                var playlistItem = self._jwplayer.getPlaylistItem(e.index);
                self._src = playlistItem.sources[0].file;
                self._paused = true;

            });

            jwp.onBeforePlay(function( e ){
                //log( "BeforePlay", e );

                var waitForDuration = function( duration ) {
                    if ( duration == -1 ) {
                        setTimeout( function() {
                            waitForDuration( self._jwplayer.getDuration() );
                        }, 500 );
                        return;
                    }
                    else {
                        
                        self._paused = true;
                        self._duration = self._jwplayer.getDuration();
                        self._volume = self._jwplayer.getVolume();
                        self.dispatch('loadedmetadata');
                        self.dispatch("loadstart");
                        self.dispatch('loadeddata');
                        self._readyState = 4;
                        self.dispatch('canplay');
                        
                        self.dispatch("durationchange");
                    }
                };

                waitForDuration( self._jwplayer.getDuration() );
            });


            jwp.onPlay(function( e ){
                //log( "Play", e );

                self._paused = false;
                self.dispatch("play");
            });

            jwp.onPause(function( e ) {
                //log( "Pause", e );

                self.dispatch("pause");
                self._paused = true;
            });

            jwp.onSeek(function( e ) {
                //log( "Seek", e );

                self._seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
                self._currentTime = e.position;
            });

            jwp.onIdle(function( e ){
                //log( "Idle", e );
            });

            jwp.onComplete(function( e ){
                //log( "Complete", e );

                self._paused = true;
                self._ended = true;
                self.dispatch("ended");
            });

            jwp.onTime(function( e ){
                ////log( "Time", e );

                self._currentTime = e.position;
                self.dispatch("timeupdate");
                self.dispatch("playing");
                self._paused = false;
                this_seeking = false;
            });

            jwp.onVolume(function( e ){
                //log( "Volume", e );

                self._volume = e.volume;
            });
        },

        autoplay: function( val ) {
            if ( val !== null) {
                this._autoplay = Boolean( val );
            }

            return this._autoplay;
        },

        preload: function( val ) {
            if ( val != null ) {
                this._preload = val;
            }

            return this._preload;
        },

        _doSeek: function( time ) {
            this._currentTime = time;

            // if ( !this._hasBegun ) {
            //     this._seekOnPlay = time;
            // }

            this._seeking = true;
            this.dispatch("seeking");
            this._jwplayer.seek( time );
        },

        _isReady: function() {
            return this._jwplayer.getState();
        },

        _bind: function( fn ) {
            var self = this;

            return function() {
                return fn.apply( self,arguments );
            };
        },

        _getVideoContainer: function( target ) {
            return ( target.container ) ? target.container.parentElement : target;
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
        load: function() {
            //log('load()');
            
            if ( !this._isReady() ) {
                return;
            }

            this.dispatch("loadstart");

            if ( !this.src() ) {
                return;
            }

            var jwp = this._jwplayer;
            var current = this._jwplayer.getPlaylistItem() ;

            if ( ! current || ( current.file != this.src() ) ) {
                jwp.load({
                    file : this._src,
                    type: ( this._src.match(".mov") && jwplayer.version.split(".")[0] >= 6 ? "mp4": undefined )
                });
            }
            jwp.play();
        },

        play: function() {
            //log('play()');
            this._autoplay = true;

            if ( this._ended ) {
                this._jwplayer.seek( 0 );
                this._restorePaused = false;
                return;
            }

            this.load();
        },

        pause: function() {
            //log('pause()');
            
            if ( this._paused ) {
                return;
            }
            
            this._autoplay = false;
            this._paused = true;
            this._jwplayer.pause();
        },

        canPlayType: function( val ) {
            switch( val ){
                // via http://developer.longtailvideo.com/trac/browser/branches/4.2/com/jeroenwijering/parsers/ObjectParser.as?rev=80
                case 'application/x-fcs':
                case 'application/x-shockwave-flash':
                case 'audio/aac':
                case 'audio/m4a':
                case 'audio/mp4':
                case 'audio/mp3':
                case 'audio/mpeg':
                case 'audio/x-3gpp':
                case 'audio/x-m4a':
                case 'image/gif':
                case 'image/jpeg':
                case 'image/png':
                case 'video/flv':
                case 'video/3gpp':
                case 'video/h264':
                case 'video/mp4':
                case 'video/x-3gpp':
                case 'video/x-flv':
                case 'video/x-m4v':
                case 'video/x-mp4':
                case 'video/mov':
                    return "probably";

                // rtmp (manifest)
                // http://www.longtailvideo.com/support/jw-player/28836/media-format-support/
                case "application/smil":
                    return "maybe";

                // ... and add a few more:
                // m3u8 works in premium
                case "application/application.vnd.apple.mpegurl":
                case "application/x-mpegURL":
                    return "maybe";

                // ramp() service returns this for youtube videos
                case "video/youtube":
                    return "maybe";

                default:
                    return "";
            }
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
        paused: function() {
            return this._paused;
        },

        duration: function() {
            return this._duration;
        },

        seeking: function() {
            return Boolean( this._seeking );
        },

        ended: function() {
            return this._ended;
        },

        currentTime: function( val ) {
            if ( val != undefined ) {
                if ( val < 0 ) {
                    val = 0;
                }

                this._ended = false;
                this._doSeek( val );
            }

            return this._currentTime;
        },

        readyState: function( val ) {
            if ( val != undefined ) {
                this._readyState = val;
             }

            return this._readyState;
        },
        muted: function( val ) {
            if ( val != undefined ) {
                this._muted = val;
                this._jwplayer.setMute( val );
                this.dispatch("volumechange");
                return val;
            }
            return this._muted;
        },
        volume: function( val ) {
            if ( val != null && val != this._volume ) {
                this._volume = val;

                // ovp doesn't support to change any volume level.
                this._jwplayer.setVolume( ( this._volume <= 1 ) ? ( this._volume * 100 ) : this._volume );
                this.dispatch("volumechange");
            }
            return ( this._volume > 1 ) ? ( this._volume / 100 ) : this._volume;
        },

        src: function( val ) {
            if ( val == undefined ) {
                if ( !this._isReady() ) {
                    return this._src;
                }
                else {
                    return this._src || this._jwplayer.getPlaylistItem().file;
                }
            }

            this._src = val;

            if ( this.autoplay() ) {
                this.play();
            }

            if ( this._preload != "none" ) {
                this.load();
            }

            return this._src;
        },

        // MPF Extensions
        mpf_resize: function( w, h ) {
            if ( this._height != h || this._width != w ) {
                this._height = h;
                this._width = w;
                this._jwplayer.resize( w +"px", h+"px" );
            }
        }
    };

})();
