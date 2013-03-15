(function() {
    var $ = jQuery;

    var StrobeMediaPlayback = function( playerId, jsBridge ) {
        /* HTML5 specific attributes */
        
        if ( !( this instanceof StrobeMediaPlayback ) ) {
            return new StrobeMediaPlayback( playerId, jsBridge );
        }

        // Display
        this._src = "";
        //this.poster = ""; Is this supported?
        //this.controls = false;  Is this supported?
        //this.videoWidth = 640;  Supported?
        //this.videoHeight = 480; Supported?

        // Playback
        this._currentTime = 0;
        this._paused = true;
        this._ended = false;
        this._loop = false;
        this._autobuffer = true;
        this._seeking = false;
        this._duration = NaN;

        this._volume = 1;
        this._muted = false;
        this._readyState = 0;
        this._preload = "none";
        this._autoplay = false;

        this.dispatcher = MetaPlayer.dispatcher( this );

        this.playerId = playerId;
        this.player = $( '#' +playerId ).get( 0 );

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.player);

        // I don't normally proxy object tags, but when I do I use a workaround.
        var addEventListener = this.video.addEventListener;
        this.video.addEventListener = function  (type, callback, useCapture){
            // strobe object.addEventListener throws an exception with three args.
            addEventListener.apply(this, [type, callback]);
        };

        this.addListeners( jsBridge );
    };

    MetaPlayer.strobemediaplayback = function ( playerId, jsBridge ) {
        var smp = StrobeMediaPlayback( playerId, jsBridge );
        return smp.video;
    };

    StrobeMediaPlayback.prototype =  {
        isReady : function() {
            return Boolean(this.player && this.player.getState() != "loading");
        },

        addListeners : function( jsBridge ) {
            var self = this;

            window[ jsBridge ] = function( a,b,c ) {

                switch( b ) {
                    case "loadstart":
                        self.onLoadStart( c );
                        break;
                    case "durationchange":
                        self.onMediaChange( c );
                        break;
                    case "complete":
                        self.onMediaComplete();
                        break;
                    case "play":
                        self.onMediaPlay( c );
                        break;
                    case "timeupdate":
                        self.onMediaProgress( c );
                        break;
                    case "seeked":
                        self.onMediaSeekNotify( c );
                        break;
                    case "pause":
                        self.onMediaPause();
                }
            };
            return this;
        },

        onLoadStart: function(e) {
            this._readyState = 4;
            this.dispatch("loadstart");
        },

        onMediaChange : function(e) {
            //this._src = e.media.id;
            
            if ( !isNaN( e.duration ) ) {
                this._duration = e.duration;
                this.dispatch('loadedmetadata');
                this.dispatch('loadeddata');
                this.dispatch("canplay");
                this.dispatch("durationchange");
            }

            this._currentTime = 0;
            this._seekOnPlay = null;
            this._hasBegun = false;


            if ( this._autoplay ) {
                this._paused = false;
            }
            else {
                this._paused = true;
            }
        },

        onMediaComplete : function(e) {
            this._ended = true;
            this._paused = true;
            
            this.dispatch("ended");
        },

        onMediaError : function(e) {
        },

        onMediaPlay : function(e) {
            this._ended = e.ended;
            this._paused = false;
            this._hasBegun = true;

            
            this.dispatch("play");
            this.dispatch("playing");
            
        },

        onMediaBegin : function(e) {
            this._hasBegun = true;
        },

        onMediaProgress : function(e) {
            this._currentTime = e.currentTime;
            this.dispatch("timeupdate");
        },

        onMediaSeekNotify : function(e) {
            this._seeking = false;
            this.dispatch("seeked");
            this.dispatch("timeupdate");
            //this._currentTime = e.position;
        },

        onMediaPause: function() {
            this._paused = true;
            this.dispatch("pause");
        },

        startVideo : function() {
            if ( ! this.isReady()) {
                return;
            }

            if ( this._preload == "none") {
                return;
            }

            if( this._ended ) {
                this.currentTime(0);
            }

            this._ended = false;

            var src = this._src;
            if ( !src ) {
                return;
            }
            

            // "http://link.brightcove.com/services/link/bcpid1745093542/bclid1612710147/bctid1697210143001?src=mrss"
            //var longForm = src.toString().match(/^http:\/\/link.brightcove.com.*bctid(\d+)\?/);
            // if( longForm ) {
            //     src = parseInt( longForm[1] );
            // }

            if (this._autoplay) {
                this.player.setMediaResourceURL(src);
                this.player.play2();
            }
            else {
                this.player.setMediaResourceURL(src);
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
            
            if (this.player.getState() != "ready" && this.player.canSeekTo( time ) )
            {
                this.player.seek( time );
            }

            // var self = this;
            // setTimeout(function () {
            //     self._currentTime = time;
                this._seeking = false;
                this.dispatch("seeked");
                this.dispatch("timeupdate");
            // }, 1500);
        },

        /* Media Interface */

        load : function() {
            this._preload = "auto";
            this.startVideo();
        },

        play : function() {
            this._paused = false;
            this._preload = "auto";
            this._autoplay = true;

            if( this._readyState == 4 ) {
                this.player.play2();
            }
            else {
                this.startVideo();
            }
        },

        pause : function() {
            if( this.isReady() )
                this.player.pause();
        },

        canPlayType : function( type) {
            switch( type ){
                case 'video/strobe':
                case 'appplication/strobe':

                // borrowed from jwplayer
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

                // m3u8 works with plugin
                case "application/application.vnd.apple.mpegurl":
                case "application/x-mpegURL":
                    return "maybe";

                default:
                    return "";
            }
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
            if ( val != undefined ) {
                this._muted = Boolean(val) ;
                if ( this.isReady() )
                    this.player.setVolume( this._muted ? 0 : this._volume );
                this.dispatch("volumechange");
            }
            return this._muted;
        },

        volume : function ( val ) {
            if ( val != undefined ) {
                this._volume = val;
                this.muted( this._muted );
            }
            return this._volume;
        },

        src : function (id) {
            if (id != undefined) {
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