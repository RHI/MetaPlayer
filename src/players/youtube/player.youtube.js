(function () {

    // save reference for no conflict support
    var $ = jQuery;

    var defaults = {
        autoplay : false,
        preload : "auto",
        updateMsec : 500,
        playerVars : {
            enablejsapi : 1,
            version : 3,
            autohide : 0,
            autoplay : 0,
            controls : 1,
            fs : 1,
            hd : 1,
            rel : 1,
            showinfo : 1,
            iv_load_policy : 0,
            cc_load_policy : 0,
            wmode : "transparent"
        }
    };

    var YouTubePlayer = function (youtube, options) {

        if( !(this instanceof YouTubePlayer) )
            return new YouTubePlayer(youtube, options);

        this.config = $.extend(true, {}, defaults, options);

        this.__seeking = false;
        this.__readyState = 0;
        this.__ended = false;
        this.__muted = false;
        this.__paused = true;
        this.__duration = NaN;
        this.__currentTime = 0;
        this.__volume = 1;
        this.__loop = this.config.loop;
        this.__src = "";

        if( this.config.chromeless ){
            var pv = this.config.playerVars;
            pv.controls = 0;
            pv.rel = 0;
            pv.showinfo = 0;
        }
        this.preload = this.config.preload;
        this.autoplay = this.config.autoplay;
        this.updateMsec = this.config.updateMsec;

        MetaPlayer.dispatcher( this );

        if( typeof youtube == "string" || ! youtube.getVideoEmbedCode ) {
            this.container = $(youtube).get(0);
            // add another child so our proxy div doesn't get replaced by the frame
            this.target = $("<div></div>").appendTo(this.container).get(0);
            this.init();
        }
        else {
            this.youtube = youtube;
            var el = $(youtube.a);
            // wrap so we have a non-iframe container to append source elements to
            this.container  = $("<div></div>")
                .appendTo( el.parent() )
                .height( el.height() )
                .width( el.width() )
                .append( el )
                .get(0);

            el.width("100%");
            el.height("100%");

            this.addListeners();
        }

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.container);
    };


    MetaPlayer.youtube = function (youtube, options){
        var yt = new YouTubePlayer(youtube, options);
        return yt.video;
    };

    MetaPlayer.Players.YouTube = function (media) {
        if( ! ( media.getVideoEmbedCode instanceof Function ) )
            return false;
        return MetaPlayer.youtube(media);
    };

    /**
     * @deprecated
     */
    MetaPlayer.addPlayer("youtube", function (youtube, options ) {

        // single arg form
        if( ! options && youtube instanceof Object && ! youtube.getVideoEmbedCode){
            options = youtube;
            youtube = null;
        }

        if( ! options ) {
            options = {};
        }

        if( ! youtube ) {

            // disable default UI if initialized without options
            if( options.chromeless == null )
                options.chromeless = true;

           youtube = $("<div></div>")
               .prependTo(this.layout.base);
        }

        var yt = new YouTubePlayer(youtube, options);
        this.video = yt.video;
        this.youtube = yt
    });


    YouTubePlayer.prototype = {

        init : function () {

            if( window.YT instanceof Function ){
                this.onApiReady();
                return;
            }

            var tag = document.createElement('script');
            tag.src = "http://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // play nice; global context
            var self = this;
            var oldReady = window.onYouTubePlayerAPIReady;
            window.onYouTubePlayerAPIReady = function (){
                self.onApiReady();
                if( oldReady )
                    oldReady.call(window);
            };
        },

        onApiReady : function () {
            this.youtube = new YT.Player( this.target, {
                height: '100%',
                width: '100%',
//                playerVars : this.getParams()
                playerVars : this.config.playerVars
            });
            this.addListeners();
        },

        addListeners : function () {
            var yt = this.youtube;
            var self = this;

            yt.addEventListener("onReady", function(e) {
                self.onReady(e);
            });
            yt.addEventListener("onStateChange", function(e) {
                self.onStateChange(e);
            });
            yt.addEventListener("onError", function(e) {
                self.onError(e);
            });
        },

        onReady : function () {
            if( ! this.isReady() ) {
                this.error = "unabled to find youtube player";
                this.dispatch("error");
                return;
            }

            if( this.__readyState < 4 ){
                this.__readyState = 4;
            }


            if( this.__muted ) {
                this.youtube.mute();
            }

            // volume works, this is too early to set mute
            this.volume(this.__volume);

            this._initTrack();

            this.startDurationCheck();

            this.startTimeCheck(); // check while paused to handle event-less seeks
        },

        isReady : function () {
            return Boolean(this.youtube && this.youtube.playVideo);
        },

        onStateChange : function (e) {
            var state = e.data;

            MetaPlayer.log("youtube", "onStateChange", state);
            // http://code.google.com/apis/youtube/js_api_reference.html#Events
            switch(state) {
                case -1: // unstarted
                    break;
                case 0: //ended
                    this.__ended = true;
                    this.dispatch("ended");
                    break;
                case 1: // playing
                    this.__paused = false;
                    if( ! this.__ended ) {
                        this.dispatch("playing");
                        this.dispatch("play");
                    }
                    this.startDurationCheck();
                    break;
                case 2: // paused
                    if( ! this.__paused ) {
                        this.__paused = true;
                        this.dispatch("pause");
                    }
                    break;
                case 3: // buffering
                    
                    break;
                case 5: // queued
                    this.dispatch("loadstart");
                    this.dispatch("canplay");
                    this.dispatch("loadeddata");
                    this.dispatch("loadedmetadata");

                    // play then stop if !autoplay to get duration
                    if (!this.autoplay) {
                        this.youtube.playVideo();
                        this.__playingForDuration = true;
                    }
                    break;
            }
        },

        onError : function (e) {
            MetaPlayer.log("youtube", "onError", e);
            this.dispatch("error");
        },

        startTimeCheck : function () {

            var self = this;
            if( this._timeCheckInterval ) {
                return;
            }

            this._timeCheckInterval = setInterval(function () {
                self.updateTime();
            }, this.updateMsec);

            // set an initial value, too
            this.updateTime();
        },

        updateTime : function () {
            var last = this.__currentTime;
            var now = this.youtube.getCurrentTime();
            var seekThreshold = last + (2 * (this.updateMsec / 1000) );
            var paused = this.paused();
            var seeked = false;

            // detect seek while playing
            if( ! paused  && (now < last || now > seekThreshold) )
                seeked = true;

            // detect seek while paused
            else if( paused && (now != last ) )
                seeked = true;

            this.__currentTime = now;

            if( ! this.__ended && now >= this.__duration - (this.updateMsec/1000) && now == last ) {
                this.__ended = true;
                this.__paused = true;
                this.dispatch("ended");
                this.dispatch("paused");
                return;
            }

            if( this.__ended && ! paused) {
                this.__ended = false;
                this.__paused = false;
                this.dispatch("play");
                console.log("playing");
                this.dispatch("playing");
                return;
            }

            if( seeked ) {
                if( ! this.__seeking ){
                    this.__seeking = true;
                    this.dispatch("seeking");
                }
                this.__seeking = false;
                this.dispatch("seeked");
            }

            if( now != last ) {
                this.dispatch("timeupdate");
            }
        },

        startDurationCheck : function () {
            var self = this;
            if( this.__duration )
                return;

            if( this._durationCheckInterval ) {
                return;
            }
            this._durationCheckInterval = setInterval(function () {
                self.onDurationCheck();
            }, this.updateMsec);
        },

        onDurationCheck : function () {
            if( this.__readyState != 4 )
                return;

            var duration = this.youtube.getDuration();
            if( duration > 0 ) {
                this.__duration = duration;
                if (this.__playingForDuration) {
                    this.youtube.stopVideo();
                    delete this.__playingForDuration;
                }
                this.dispatch("durationchange");
                clearInterval( this._durationCheckInterval );
                this._durationCheckInterval = null;
            }
        },

        _initTrack : function () {
            var src = this.src();
            MetaPlayer.log("youtube", "init track", src)
            if( ! src ) {
                return;
            }

            // player not loaded yet
            if( ! this.isReady() )
                return;

            this.__ended = false;
            this.__currentTime = 0;
            this.__duration = NaN;
            this.__seeking = false;

            if( src.match("^http") ){
                var videoId = src.match( /www.youtube.com\/(watch\?v=|v\/)([\w-]+)/ )[2];
            }
            this.youtube.cueVideoById( videoId || src );

            this.dispatch("loadstart");

            MetaPlayer.log("youtube", "_initTrack", this.autoplay);

            if( this.autoplay )
                this.play();

            else if( this.preload != "none" )
                this.load();

        },

        doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            if( time != this.__currentTime )
                this.youtube.seekTo( time );
        },

        /* Media Interface */

        load : function () {
            this.preload = "auto";
            if( ! this.isReady() ){
                return;
            }
            MetaPlayer.log("youtube", "load()", this.isReady() );

            // kickstart the buffering so we get the duration
            //this.youtube.playVideo();
            //this.youtube.pauseVideo();

            this.startDurationCheck();
        },

        play : function () {
            this.autoplay = true;
            if( ! this.isReady() )
                return;
            MetaPlayer.log("youtube", "play()", this.isReady() );
            this.youtube.playVideo()
        },

        pause : function () {
            MetaPlayer.log("youtube", "pause()", this.isReady() );
            if(! this.isReady() )
                return false;
            this.youtube.pauseVideo()
        },

        canPlayType : function (type) {
            return Boolean  ( type.match( /\/youtube$/ ) );
        },

        paused : function (){
            return this.__paused;
        },

        duration : function () {
            return this.__duration;
        },

        seeking : function () {
            return this.__seeking;
        },

        ended : function () {
            if(! this.isReady()  )
                return false;
            return (this.youtube.getPlayerState() == 0);
        },

        currentTime : function (val){
            if(! this.isReady()  )
                return 0;
            if( val != undefined ) {
                this.doSeek(val);
            }
            return this.__currentTime;
        },

        muted : function (val){
            if( val != null ){
                this.__muted = val
                if( ! this.isReady() )
                    return val;
                if( val  )
                    this.youtube.mute();
                else
                    this.youtube.unMute();
                this.dispatch("volumechange");
                return val;
            }

            return this.__muted;
        },

        volume : function (val){
            if( val != null ){
                this.__volume = val;
                if( ! this.isReady() )
                    return val;
                this.youtube.setVolume(val * 100)
                this.dispatch("volumechange");
            }
            return this.__volume;
        },

        src : function (val) {
            if( val !== undefined ) {
                this.__src = val;
                this._initTrack();
            }
            return this.__src
        },

        readyState : function () {
            return this.__readyState;
        }
    }

})();
