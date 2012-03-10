

var PlaylistUnit = function (){
    if( ! ( this instanceof PlaylistUnit ))
        return new PlaylistUnit();

    this.nearTimeSec = 1;
    this.media = null;
};

PlaylistUnit.prototype = {

    getCurrentTitle : function () {
        return this.media.tracks()[ this.media.index ].title;
    },

    addTests : function (unit) {
        var self = this;
        unit.test("service setup",  function () {
            unit.nequal( self.media, undefined, "media instance not null");
            self.media.onRelated( unit.callback("related event", null, function(related){
                self.related = related;
            }));
            unit.event("canplay", self.media, "canplay event");
        }, {postDelay : 0});

        unit.test("media setup",  function () {
            unit.equal( self.getCurrentTitle(), "Video 1", "first video title matches");
        });

        unit.test("intial state", function () {
            unit.equal( self.media.index, 0, "default index is 0");
            unit.equal(self.media.nextTrackIndex(), 1, "nextTrackIndex: 1");
            self.media.load();

        }, {postDelay : 1000    });

        unit.test("buffer to end", function () {
            unit.equal( self.media.paused, true, "media.paused is true");
            unit.event("playing", self.media, "playing event");
            self.media.play();
        }, {postDelay : 0});

        unit.test("seek to end, autoadvance", function () {
            unit.equal(self.media.index, 0, "now on first video");
            unit.event("seeking", self.media, "seeking event");
            unit.event("seeked", self.media, "seeked event", function (){
                unit.event("ended", self.media, "ended event");
                unit.event("trackChange", self.media, "trackChange event", function () {
                    unit.equal(self.media.index, 1, "now on second video");
                    unit.equal( self.getCurrentTitle(), "Video 2", "second video title matches");
                }, 10000);
            }, 30000); // clip might take a while to download that far
            self.media.currentTime = self.media.duration - 3;
        }, {postDelay : 5000});

        unit.test("index assign", function () {
            unit.equal(self.media.index, 1, "now on second video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.equal(self.media.index, 0, "now on first video");
            });
            self.media.index = 0;
        });

        unit.test("nextTrack()", function () {
            unit.equal(self.media.index, 0, "now on first video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.equal(self.media.index, 1, "now on second video");
            });
            self.media.next();
        });

        unit.test("previousTrack()", function () {
            unit.equal(self.media.index, 1, "now on second video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.equal(self.media.index, 0, "now on first video");
            });
            self.media.previous();
        });

        unit.test("previousTrack() loops ", function () {
            unit.equal(self.media.index, 0, "now on first video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.equal(self.media.index, 1, "now on second video");
            });
            unit.equal(self.media.nextTrackIndex(), 1, "nextTrackIndex: 1");
            self.media.previous()
        });

        unit.test("nextTrack() loops ", function () {
            unit.equal(self.media.index, 1, "now on second video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.equal(self.media.index, 0, "now on first video");
            });
            unit.equal(self.media.nextTrackIndex(), 0, "nextTrackIndex: 0");
            self.media.next()
        });

        unit.test("ended loops ", function () {
            unit.equal(self.media.index, 0, "now on first video");
            unit.event("trackChange", self.media, "trackChange event", function () {
                unit.event("loadedata", self.media, "canplay event", function () {
                    unit.equal(self.media.index, self.media.playlist.length - 1, "now on last video");
                    unit.event("seeked", self.media, "seeked event", function (){
                        unit.event("ended", self.media, "ended event");
                        unit.event("trackChange", self.media, "trackChange event", function () {
                            unit.equal(self.media.index, 0, "now on first video");
                        });
                    });
                    self.media.currentTime = self.media.duration - 3;
                    self.media.play();
                });
            });
            self.media.index = self.media.tracks().length - 1;
        });

    }
};