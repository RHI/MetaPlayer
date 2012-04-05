

var PlayerUnit = function (unit){
    if( ! ( this instanceof PlayerUnit ))
        return new PlayerUnit(unit)

    this.unit = unit;
    this.nearTimeSec = 3; // forgiveness for keyframes,
    this.media = null;
};

PlayerUnit.prototype = {

    isNearTime : function (sec) {
        return Math.abs(this.media.currentTime - sec) < this.nearTimeSec;
    },

    addTests : function () {
        var unit = this.unit;
        var self = this;

        unit.test("media setup",  function () {
            unit.nequal( self.media, undefined, "media instance not null");
            unit.equal( isNaN(self.media.duration), true, "duration at start is NaN");

            unit.assert( self.media.canPlayType instanceof Function, "canPlayType defined" );

            unit.event("loadstart", self.media, "loadstart event");

            // FF bug: won't fire unless media.play() already called
            unit.log("canplay/canplaythrough event are not supported in FF w/ autoplay=false");
            unit.event("canplay", self.media, "canplay event");
//            unit.event("canplaythrough", self.media, "canplaythrough event");

            self.media.src = self.src;

        });

        unit.test("load events",  function () {

            unit.event("loadeddata", self.media, "loadeddata event");

            unit.event("durationchange", self.media, "durationchange event", function (){
                unit.equal( self.media.duration > 0, true, "duration > 0");
            });

            unit.event("loadedmetadata", self.media, "loadedmetadata event", function (){
                unit.equal( isNaN(self.media.duration), false, "duration defined");
            });

            unit.equal( self.media.paused, true, "media instance paused");

            self.media.load();
        }, {postDelay : 0 });

        unit.test("currentTime",  function () {
            var seekTarget = Math.floor(self.media.duration / 2);            
            unit.log("Seek target: " + seekTarget);
            unit.equal( self.isNearTime(0), true, "initial self.media.currentTime is 0");
            unit.equal( self.media.seeking, false, "initial self.media.seeking is false");
            unit.event("seeking", self.media, "seeking event", function (e) {
                unit.equal( self.media.seeking, true, "on seeking: media.seeking is true");
            });
            unit.event("seeked", self.media, "seeked event", function (e) {
                unit.equal( self.isNearTime(seekTarget), true, "seeked currentTime near "  + seekTarget);
            });
            unit.event("timeupdate", self.media, "timeupdate event", function (e) {
                unit.equal( self.isNearTime(seekTarget), true, "timeupdate currentTime near " + seekTarget);
            });
            self.media.currentTime = seekTarget;
        }, {postDelay : 0 });

        unit.test("play",  function () {
            unit.equal( self.media.ended, false, "media.ended is false");
            unit.equal( self.media.paused, true, "media.paused is true");

            unit.event("playing", self.media, "play event", function (e) {
                unit.equal( self.media.paused, false, "media.paused is false");
            });
            unit.event("timeupdate", self.media, "timeupdate event");
            self.media.play();
        });


        unit.test("volume",  function () {
            unit.equal( self.media.volume, 1, "media.volume is 1");
            unit.event("volumechange", self.media, "volumechange event", function (e) {
                unit.equal( self.media.volume, .5, "self.volume is 1");
            });
            self.media.volume = .5;
        });

        unit.test("mute",  function () {
            unit.equal( self.media.muted, false, "set self.media.muted false");
            unit.event("volumechange", self.media, "muted volumechange event", function (e) {
                unit.equal( self.media.muted, true, "set self.media.muted true");
            });
            self.media.muted = true;
        });

        unit.test("pause",  function () {
            unit.equal( self.media.ended, false, "media.ended is false");
            unit.equal( self.media.paused, false, "media.paused is false");

            unit.event("pause", self.media, "pause event", function (e) {
                unit.equal( self.media.paused, true, "media.paused is true");
            });
            self.media.pause();
        }, { postDelay : 0 });

        unit.test("seek while playing",  function () {
            unit.equal( self.media.paused, true, "media.paused is true");
            unit.equal( self.media.seeking, false, "initial self.media.seeking is false");

            unit.event("play", self.media, "play event", function (e) {
                unit.equal( self.media.paused, false, "media.paused is false");                
                self.media.currentTime = 5;
            });

            unit.event("seeking", self.media, "seeking event", function (e) {
                unit.equal( self.media.seeking, true, "media.seeking is true");
            });

            unit.event("seeked", self.media, "seeked event", function (e) {
                unit.equal( self.isNearTime(5), true, "seeked currentTime is near 5");
            });

            unit.event("timeupdate", self.media, "timeupdate event");
            self.media.play();
        });


        unit.test("ended event",  function () {
            unit.equal( self.media.paused, false, "media.paused is false");
            unit.event("seeking", self.media, "seeking event");
            unit.event("ended", self.media, "ended event", null, 7000);
            self.media.currentTime = self.media.duration - 3;            
        });

    }
};