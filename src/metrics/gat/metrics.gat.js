(function () {

    var $ = jQuery;

/*
From MP2:
 defaultTrackEvents : {"onBegin"  : {label: "Begin",  type: "clip", track: false},
 "onFinish" : {label: "Finish", type: "clip", track: true},
 "onPause"  : {label: "Pause",  type: "clip", track: true},
 "onResume" : {label: "Play",   type: "clip", track: true},
 "onSeek"   : {label: "Seek",   type: "clip", track: true},
 "onStart"  : {label: "Start",  type: "clip", track: true},
 "onStop"   : {label: "Stop",   type: "clip", track: true},
 "onMute"   : {label: "Mute",   type: "player", track: true},
 "onUnmute" : {label: "Unmute", type: "player", track: true},
 "onFullscreen"     : {label: "Fullscreen",      type: "player", track: true},
 "onFullscreenExit" : {label: "Fullscreen exit", type: "player", track: true},
 "onCaptionsOn"  : {label: "Captions on",  type: "custom", track: true},
 "onCaptionsOff" : {label: "Captions off", type: "custom", track: true},
 "onReplay"      : {label: "Replay", type: "custom", track: true},
 "onUpNextClick" : {label: "UpNextClick", type: "custom", track: true},
 "onShare"       : {label: "Share",  type: "custom", track: true},      // twitter/fb/etc
 "onSearch"      : {label: "Search", type: "custom", track: true},      // search term
 "onSearchResultClick" : {label: "SearchResultClick", type: "custom", track: true}, // (search term, result position)
 "onTagClick"    : {label: "TagClick", type: "custom", track: true},  //  (tag type, tag value, position)
 "onQCardAdd"    : {label: "QCardAdd", type: "custom", track: true},  // (term,ts,target area, card-id)
 "onQCardUserHover" : {label: "QCardUserHover", type: "custom", track: true}, // (term,ts,target area, card-id)
 "onQCardDisplay"   : {label: "QCardDisplay",   type: "custom", track: true}, // (term,ts,target area, card-id)
 "onQCardUserClick" : {label: "QCardUserClick", type: "custom", track: true}  // (term,ts,target area, card-id)
 },
 */

    var Adapter = function (player, gaTracker) {

        if( ! (this instanceof Adapter) )
            return new Adapter(player, gaTracker);

        this.player = player;
        this.gat = gaTracker;
        this.addListeners();
        this.init();
    };



    MetaPlayer.addPlugin("gat", function (gaTracker) {
        this.gat = Adapter(this, gaTracker  );
    });

    Adapter.prototype = {
        init : function () {
            this.hasPlayed = false;
            this.muted = this.player.video.muted;
        },

        addListeners : function () {
            var v = this.player.video;

            v.addEventListener("loadstart", this._bind( function () {
                this.hasPlayed = false;
                this._track("Begin");
            }));

            v.addEventListener("playing", this._bind( function () {
                if( this.hasPlayed ) {
                    this._track("Resume");
                    return;
                }
                this.hasPlayed = true;
                this._track("Start");
            }));

            v.addEventListener("volumechange", this._bind( function () {
                var muted = this.player.video.muted || (this.player.video.volume == 0);

                if( this.muted !=  muted ) {
                    if( this.muted )
                        this._track("Unmute");
                    else
                        this._track("Mute");
                    this.muted = muted;
                }
            }));

            v.addEventListener("ended", this._bind( this._track, "Finish") );
            v.addEventListener("pause", this._bind( this._track, "Pause") );
            v.addEventListener("seeked", this._bind( this._track, "Seek") );


            var l = this.player.layout;
            if( l.addEventListener ) { // backwards compatibility
                l.addEventListener("maximize", this._bind( this._track, "Fullscreen") );
                l.addEventListener("restore", this._bind( this._track, "Fullscreen exit") );
            }

            var c = this.player.cues;
            c.addEventListener("enable", this._bind( function (e) {
                if( e.action = "captions")
                    this._track("onCaptionsOn");
            }));
            c.addEventListener("disable", this._bind( function (e) {
                if( e.action = "captions")
                    this._track("onCaptionsOff");
            }));
        },

        _track : function (action, data, time) {
            if( ! time )
                time = this.player.video.currentTime;
            this.gat._trackEvent("Videos", action, data, Math.round(time) );
        },

        _bind : function (callback) {
            var args =  Array.prototype.slice.call(arguments, 1);
            var self = this;
            return function () {
                return callback.apply(self, args.length ? args : arguments);
            }
        }
    };

    MetaPlayer.Metrics.GAT = Adapter;
})();
