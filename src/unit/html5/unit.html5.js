

var PlayerUnit = function (unit){
    if( ! ( this instanceof PlayerUnit ))
        return new PlayerUnit(unit)

    this.unit = unit;
    this.nearTimeSec = 10; // forgiveness for seeking in wide keyframes,
    this.media = null;
};

PlayerUnit.prototype = {

    isNearTime : function (sec) {
        return Math.abs(this.media.currentTime - sec) < this.nearTimeSec;
    },

    addTests : function () {
        var unit = this.unit;
        var self = this;

        unit.test("initial state",  function () {
            unit.assert("media instance not null", self.media);
            unit.assert("autoplay disabled", self.media.autoplay, false);
            unit.assert("preload disabled", self.media.preload, "none" );
            unit.assert("duration at start is NaN", isNaN(self.media.duration) );
            unit.assert("canPlayType defined", self.media.canPlayType instanceof Function);
            unit.assert("has src", self.media.src);
            unit.assert("readystate 0", self.media.readyState, 0);
        });

        unit.test("loading",  function () {
            unit.event("loadstart event", self.media, "loadstart");
            unit.event("canplay event", self.media, "canplay", function () {
                unit.assert("readyState is 4", self.media.readyState, 4);
                unit.assert("media.paused is true", self.media.paused, true);
            });
            unit.event( "loadeddata event", self.media, "loadeddata");

            unit.event("durationchange event", self.media, "durationchange", function (){
                unit.assert("duration > 0", self.media.duration > 0, true);
            });

            unit.event("loadedmetadata event", self.media, "loadedmetadata", function (){
                unit.assert("duration isNaN", isNaN(self.media.duration), true);
            });

            unit.assert("media instance paused", self.media.paused, true);

            self.media.load();
        });

        unit.test("seeking",  function () {
            var seekTarget = Math.min( Math.floor(self.media.duration / 2), 30 );
            unit.log("Seek target: " + seekTarget);
            unit.assert("initial self.media.currentTime is 0", self.isNearTime(0));
            unit.assert("initial self.media.seeking is false", self.media.seeking, false);

            unit.event("seeking", self.media, "seeking", function (e) {
                unit.assert("on seeking: media.seeking is true", self.media.seeking, true);
            });
            unit.event("seeked", self.media, "seeked", function (e) {
                unit.assert("seeked currentTime near "  + seekTarget, self.isNearTime(seekTarget));
                unit.assert("post seek media.seeking is false", self.media.seeking, false);
            }, 15000);
            unit.event("timeupdate", self.media, "timeupdate", function (e) {
                unit.assert("timeupdate currentTime near " + seekTarget, self.isNearTime(seekTarget));
            });
            self.media.currentTime = seekTarget;
        });

        unit.test("playing",  function () {
            unit.assert("media.ended is false", self.media.ended, false);
            unit.assert("media.paused is false", self.media.paused, false);

            unit.event("playing event", self.media, "playing", function (e) {
                unit.assert("media.paused is false", self.media.paused, false);
            });
            unit.event("timeupdate event", self.media, "timeupdate");
            self.media.play();
        });

        unit.test("volume",  function () {
            unit.assert("media.volume is 1", self.media.volume, 1);
            unit.event("volumechange", self.media, "volumechange", function (e) {
                unit.assert("self.volume is 0.5", self.media.volume, 0.5);
            });
            self.media.volume = 0.5;
        });

        unit.test("muting",  function () {
            unit.assert("set self.media.muted false", self.media.muted, false);

            unit.event("muted volumechange event", self.media, "volumechange", function (e) {
                unit.assert("set self.media.muted true", self.media.muted, true);
            });
            self.media.muted = true;
        });

        unit.test("pause",  function () {
            unit.assert("media.ended is false", self.media.ended, false);
            unit.assert("media.paused is false", self.media.paused, false);
            unit.event("pause event", self.media, "pause", function (e) {
                unit.assert("media.paused is true", self.media.paused, true);
            });
            self.media.pause();
        });

        unit.test("seek while playing",  function () {
            var target = self.media.duration - 15;

            unit.assert("media.paused is true", self.media.paused, true);
            unit.assert("initial self.media.seeking is false", self.media.seeking, false);

            unit.event("playing event", self.media, "playing");
            unit.event("play event", self.media, "play", function (e) {
                unit.assert("media is playing", self.media.paused, false);
                unit.log("Seek target: " + target);
                self.media.currentTime = target;
            });

            unit.event("seeking event", self.media, "seeking", function (e) {
                unit.assert("media.seeking is true", self.media.seeking, true);
            });

            unit.event("seeked event", self.media, "seeked", function (e) {
                unit.assert("seeked currentTime is near "+ target, self.isNearTime(target));
            });

            unit.event("timeupdate event", self.media, "timeupdate");
            self.media.play();
        });

        unit.test("ended",  function () {
            unit.assert("media.paused is near end", self.media.duration - self.media.currentTime < 20);
            unit.assert("media is playing", self.media.paused, false);
            unit.assert("media has duration", self.media.duration   );

            unit.event("ended event", self.media, "ended", function () {
                unit.assert("media.ended is true", self.media.ended, true);
                unit.assert("media.paused is true", self.media.paused, true);
            }, 60000);  // seeking to the end of a long progressive download can take a while, so we give time


            unit.event("seeked event", self.media, "seeked", function (e) {
                unit.assert("seeked currentTime is near "+ target, self.isNearTime(target));
            });

            var target = self.media.duration - 5;
            unit.log("Seek target: " + target);
            self.media.currentTime = target;
        });

        unit.test("replay after ended",  function () {
            unit.event("play event", self.media, "play", function (e){
                unit.assert("media.ended is false", self.media.ended, false);
                unit.assert("media.paused is false", self.media.paused, false);
                unit.assert("replay currentTime is near 0", self.isNearTime(0));
                self.media.pause();
            }, 6000);
            unit.event("playing event", self.media, "playing", null, 6000);

            setTimeout(function() {
                self.media.play();
            }, 1000);
        });

    }
};