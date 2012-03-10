(function () {
    var $ = jQuery;
    var ovp = window.ovp;

    var defaults = {
        // OVP main default configs
        strategy : {"order":["HTML5","Flash","Silverlight"]}, // Case is important
        sliderdelay : 5000,
        sliderspeed : "slow",
        immediately : false,
        controls: {'src_img':'/images/play.png'},
        ovp_container_class:'ovp',
        controller_keepalive_seconds: 5,
        players : {
            "Flash":{"src":"ovp-2.1.6.swf","minver":"10","controls":false, "plugins":[]},
            "Silverlight":{"src":"ovp-2.3.1.xap","minver":"4.0","controls":false, "plugins":[]},
            "HTML5":{"minver":"0","controls":false}
        },
        status_timer : 500,
        // OVP video default configs
        ovpConfig: {
            sources:[
                    {'src':'/videos/trailer.ogv', 'type':'video/ogg'},
                    {'src':'/videos/trailer.mp4','type':'video/mp4'}
            ],
            width : '100%', // swfobject requires width/height of player.
            height : '100%',
            posterimg:'/images/poster.png',
            autobuffer:true,
            autoplay:false,
            id: 'ovp',
            scalemode: 'fit',
            controls: false
        }
    };

    var status = {
        LOAD  : 0,
        READY : 1,
        PLAY  : 2,
        PAUSE : 3,
        SEEK  : 4,
        ENDED : 5
    };

    var OVPlayer = function(el, options) {
        if(!(this instanceof OVPlayer))
            return new OVPlayer(el, options);

        this.config = $.extend(true, {}, defaults, options); 
        this.__readyState = 0;
        this.__paused = (! this.config.immediately);
        this.__duration = NaN;
        this.__ended = false;
        this.__seeking = false;
        this.__controls = false;
        this.__volume = 1;
        this.__muted = false;
        this.__src = "";
        this.__status = status.LOAD;
        
        this._ovp = this._render( $(el).get(0) );
        this.video = $(el).get(0);
        this.dispatcher = MetaPlayer.dispatcher( this );
        MetaPlayer.proxy.proxyPlayer( this, this.video );
        this._setControls();
        this._addEventListeners();
    };

    if( window.MetaPlayer ) {
        MetaPlayer.addPlayer("ovp", function ( options ) {
            var target = $("<div></div>").appendTo(this.layout.stage);
            this.ovp = OVPlayer(target, options);
            this.video = this.ovp.video;
        });
    } else {
        window.MetaPlayer = {};
    }

    MetaPlayer.ovp = function (target, options) {
        var ovp = OVPlayer(target, options);
        return ovp.video;
    };

    OVPlayer.prototype = {
        _render: function (el) { 
            var presetplay = this.config.immediately;
            if (! presetplay ) this.config.immediately = true;
            ovp.init(this.config);
            this.config.immediately = presetplay;
            return ovp.render(el, this.config.ovpConfig)[0];
        },
        
        _addEventListeners : function () {
            // start ovp player status check
            this._loadtimer = Ramp.timer(this.config.status_timer);
            this._loadtimer.listen('time', this._onBeforeLoad, this);
            this._loadtimer.start();
            
            this._statustimer = Ramp.timer(this.config.status_timer);
            this._statustimer.listen('time', this._onStatus, this);
        },
        _onBeforeLoad : function () {
            if(typeof this._ovp.player !== "object")
                return;
            this.dispatch('loadstart');
            this._loadtimer.reset();
            this._onReady();
            this._startDurationCheck();
        },
        _onReady : function () {
            this._statustimer.start();
            this.__readyState = 4;
            this.dispatch("loadeddata");
            this.dispatch("canplay");
            this.load();

            this.__status = status.READY;
            
            this.video.pause();
            if(this.config.immediately || this.config.ovpConfig.autoplay) {
                this.video.play();
            }
        },
        _startDurationCheck : function () {
            var self = this;
            if( this._durationCheckInterval ) {
                return;
            }
            this._durationCheckInterval = setInterval(function () {
                self._onDurationCheck();
            }, 1000);
        },

        _onDurationCheck : function () {
            var duration = this._ovp.getDuration();
            if( duration > 0 ) {
                this.__duration = duration;
                this.dispatch("loadeddata");
                this.dispatch("loadedmetadata");
                this.dispatch("durationchange");
                this.dispatch("timeupdate");
                clearInterval( this._durationCheckInterval );
                this._durationCheckInterval = null;
            }
        },
        
        _onStatus : function () {
            if ( this._ovp.isPlaying() ) {
                this.__paused = false;
                if( this.__status !== status.PLAY ) {
                    this.dispatch("play");
                }
                this.dispatch("timeupdate");
                this.__status = status.PLAY;
            } else if ( this._ovp.isEnded() ){
                this.__paused = true;
                if( this.__status !== status.ENDED ) {
                    this.dispatch("ended");
                }
                this.__status = status.ENDED;
            } else {
                this.__paused = true;
                if( this.__status !== status.PAUSE ) {
                    this.dispatch("pause");
                }
                this.__status = status.PAUSE;
            }
        },
        _setControls : function () {
            if ( this._ovp.controlsState === 'RENDERED' )
                this.__controls = this._ovp.controls;
        },
        _getCurrentTimeFromCache : function () {
            if (! this._ovp.player )
                return 0;
            
            var now = (new Date()).getTime();
            var then = this.__currentTimeCache;
            var diff = now - then;

            if( then && diff < this.config.status_timer )
                return this.__currentTime + (diff / 1000); // approx our position
            else
                this.__currentTimeCache = now;
            
            var ovpCurrentTime = this._ovp.getCurrentTime();
            this.__currentTime = ( ovpCurrentTime < 0 )? 0 : ovpCurrentTime;
            return this.__currentTime;
        },
        doSeek : function (time) {
            this.__seeking = true;
            this.dispatch("seeking");
            this._ovp.seekTo( time );
            this.__currentTime = time;
            this.__status = status.SEEK;

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
        updateTime : function () {
            this.__currentTime = this._ovp.getCurrentTime();
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
            if (! this._ovp.player )
                return;
            
            var f = this.src();
            if(f) {
                this.config.ovpConfig.sources = [{src: f}];
            }
            // start to play video.
        },
        play : function () {
            this.__paused = false;
            this._ovp.playpause();
        },
        pause : function () {
            this.__paused = true;
            this._ovp.playpause();
        },
        canPlayType : function (val) {
            // In ovp, it has to be changed the video sources before it checks.
            return this._ovp.canPlay();
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
            return this.__seeking;
        },
        ended : function () {
            return this.__ended;
        },
        currentTime : function (val) {
            if( typeof val !== 'undefined' ) {
                if( val < 0 )
                    val = 0;
                if( val > this.duration )
                    val = this.duration;
                this.doSeek(val);
            }
            
            return this._getCurrentTimeFromCache();
        },
        readyState : function (val) {
            if( val !== undefined )
                this.__readyState = val;
            return this.__readyState;
        },
        muted : function (val) {
            if( val != null ){
                this.__muted = val;
                if( ! this._ovp )
                    return val;
                if( val )
                    this._ovp.mutetoggle();
                else
                    this._ovp.mutetoggle();
                this.dispatch("volumechange");
                return val;
            }

            return this.__muted;
        },
        volume : function (val) {
            if( val != null ){
                this.__volume = val;
                if( ! this._ovp )
                    return val;
                // ovp doesn't support to change any volume level.
                this._ovp.mutetoggle();
                this.dispatch("volumechange");
            }
            return this.__volume;
        },
        src : function (val) {
            if( val !== undefined ) {
                this.__src = val;
            }
            return this.__src
        },
        controls : function (val) {
            if( typeof val !== 'undefined' || val != false ) {
                this.__controls = val;
            }
            return this.__controls;
        }
    };
})();
