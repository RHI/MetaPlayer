(function () {

    // save reference for no conflict support
    var $ = jQuery;

    var defaults = {
        autoplay : false,
        preload : true,
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
            // wrap so we have a non-iframe container to append source elements to
            this.container  = $("<div></div>")
                .appendTo( youtube.a.parentNode )
                .append( youtube.a )
                .get(0);
            this.addListeners();
        }

        this.video = MetaPlayer.proxy.proxyPlayer(this, this.container);
    };


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
               .addClass("mp-video")
               .appendTo(this.layout.stage);
        }

        var yt = new YouTubePlayer(youtube, options);
        this.video = yt.video;
        this.youtube = yt
    });

    MetaPlayer.youtube = function (youtube, options){
        var yt = new YouTubePlayer(youtube, options);
        return yt.video;
    }


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

            // flash implemented, works in IE?
            // player.addEventListener(event:String, listener:String):Void
            this.startVideo();
        },

        isReady : function () {
            return this.youtube && this.youtube.playVideo;
        },

        onStateChange : function (e) {
            var state = e.data;

            // http://code.google.com/apis/youtube/js_api_reference.html#Events
            switch(state) {
                case -1: // unstarted
                    break;
                case 0: //ended
                    this.__ended = true;
                    this.__duration = NaN;
                    this.dispatch("ended");
                    break;
                case 1: // playing
                    this.__paused = false;
                    this.dispatch("playing");
                    this.dispatch("play");
                    break;
                case 2: // paused
                    this.__paused = true;
                    this.dispatch("pause");
                    break;
                case 3: // buffering
                    this.startDurationCheck();
                    this.startTimeCheck(); // check while paused to handle event-less seeks
                    break;
                case 5: // queued
                    this.dispatch("canplay");
                    this.dispatch("loadeddata");
                    break;
            }
        },

        onError : function (e) {
            this.dispatch("error");
        },

        startTimeCheck : function () {
            var self = this;
            if( this._timeCheckInterval ) {
                return;
            }

            this._timeCheckInterval = setInterval(function () {
                self.onTimeUpdate();
            }, this.updateMsec);

            // set an initial value, too
            this.updateTime();
        },

        stopTimeCheck : function () {
            clearInterval(this._timeCheckInterval);
            this._timeCheckInterval = null;
        },

        onTimeUpdate: function () {
            this.updateTime();
            this.dispatch("timeupdate");
        },

        updateTime : function () {
            this.__currentTime = this.youtube.getCurrentTime();
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
            var duration = this.youtube.getDuration();
            if( duration > 0 ) {
                this.__duration = duration;
                this.dispatch("loadedmetadata");
                this.dispatch("durationchange");
                clearInterval( this._durationCheckInterval );
                this._durationCheckInterval = null;
            }
        },

        startVideo : function () {
            // not loaded yet
            if( ! this.isReady() )
                return;

            this.__ended = false;

            if( this.__muted ) {
                this.youtube.mute();
            }
            // volume works, this is too early to set mute
            this.youtube.setVolume(this.__volume);

            var src = this.src();
            if( ! src ) {
                return;
            }

            if( this.__readyState < 4 ){
                this.dispatch("loadstart");
                this.__readyState = 4;
            }

            if( src.match("^http") ){
                var videoId = src.match( /www.youtube.com\/(watch\?v=|v\/)([\w-]+)/ )[2];
            }
            this.youtube.cueVideoById( videoId || src );

            if( this.autoplay )
                this.play();
            else if( this.preload )
                this.load();

        },

        doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            this.youtube.seekTo( time );
            this.__currentTime = time;

            // no seeking events exposed, so fake best we can
            // will be subject to latency, etc
            var self = this;
            setTimeout (function () {
                self.updateTime(); // trigger a time update
                self.__seeking = false;
                self.dispatch("seeked");
                self.dispatch("timeupdate");
            }, 1500)
        },

        /* Media Interface */

        load : function () {
            this.preload = true;

            if( ! this.isReady() )
                return;

            if( this.youtube.getPlayerState() != -1 )
                return;

            var src = this.src();
            // kickstart the buffering so we get the duration
            this.youtube.playVideo();
            this.youtube.pauseVideo();
        },

        play : function () {
            this.autoplay = true;
            if( ! this.isReady() )
                return;

            this.youtube.playVideo()
        },

        pause : function () {
            if(! this.isReady()  )
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
                this.__ended = false;
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
                this.startVideo();
            }
            return this.__src
        },

        readyState : function () {
            return this.__readyState;
        }
    }

})();
