
var TestPLaylist = function (unit, video, items ) {
    var lastIndex = items.length - 1;
    var setTrack = function (i) {
        unit.test(" set track " + i, function () {
            video.autoAdvance = true;
            video.loop = false;
            video.autoplay = false;
            video.preload = "metadata";

            unit.event("trackchange event", video, "trackchange", function () {
                unit.assert('index is ' + i, video.getIndex(), i);
                unit.assert('guid ok', video.getItem(), items[i].guid);
                unit.assert("not playing", video.paused );
                unit.event("canplay event", video, "canplay");
            });
            video.setIndex(i);
        })
    };

    video.muted = true;

    unit.test("initial setup", function () {
        unit.assert("not playing", video.paused );
        unit.assert("looping off", ! video.loop);
        unit.assert("playlist advance on", video.autoAdvance);
        unit.assert("playlist has length", video.getPlaylist().length > 0);
        unit.assert('index is 0', video.getIndex(), 0);
        unit.assert('guid is first', video.getItem(), items[0].guid);
    });

    unit.test("setIndex", function () {
        unit.event("trackchange event", video, "trackchange", function () {
            unit.assert('guid ok', video.getItem(), items[1].guid);
            unit.assert("not playing", video.paused );
            unit.assert('index is 1', video.getIndex(), 1);
        });

        unit.assert('index is 0', video.getIndex(), 0);
        unit.assert('set index 1', video.setIndex(1), true);
    });

    unit.test("previous", function () {
        unit.event("trackchange event", video, "trackchange", function () {
            unit.assert('index ok', video.getIndex(), 0);
            unit.assert('guid ok', video.getItem(), items[0].guid);
        });
        unit.assert('index is 1', video.getIndex(), 1);
        unit.assert('previous()', video.previous(), true);
    });


  unit.test("next", function () {
      unit.event("trackchange event", video, "trackchange", function () {
          unit.assert('index is 1', video.getIndex(), 1);
          unit.assert('guid ok', video.getItem(), items[1].guid);
        });
      unit.assert('index is 0', video.getIndex(), 0);
      unit.assert('next()', video.next() , true);
    });

    setTrack(0);

    unit.test("advancing", function () {
        unit.assert('index is 0', video.getIndex(), 0);
        unit.assert("has duration", video.duration);

        unit.event("playing event", video, "playing", function () {
            unit.assert("seek to end", video.currentTime = video.duration - 5);
        });

        unit.event("has seeked", video, "seeked", null, 30000);

        unit.event("ended event", video, "ended", function () {
            unit.event("trackchange event", video, "trackchange", function () {
                unit.assert('index ok', video.getIndex(), 1);
                unit.assert('guid ok', video.getItem(), items[1].guid);
            });

        }, 30000);

        unit.assert("not playing", video.paused );
        unit.assert("autoadvance is enabled", video.autoAdvance , true);
        video.play();
    });

    setTrack(0);

    unit.test("advancing disabled", function () {
        unit.assert('index is 0', video.getIndex(), 0);
        unit.assert("not playing", video.paused );

        unit.event("playing event", video, "playing", function () {
            unit.assert('index is 0', video.getIndex(), 0);
            unit.assert("seek to end", video.currentTime = video.duration - 5);
        });

        unit.event("has ended", video, "ended", function () {
            setTimeout(
                unit.callback("trackchange timeout", function () {
                    unit.assert('index ok', video.getIndex(), 0);
                    unit.assert('guid ok', video.getItem(), items[0].guid);
                    unit.assert("not playing", video.paused );
                }, this),
                2000
            );
        }, 30000);
        video.autoAdvance = false;
        unit.assert("autoadvance is disabled", video.autoAdvance , false);
        video.play();
    });

    setTrack(lastIndex);

    unit.test("looping", function () {
        unit.event("playing event", video, "playing", function () {
            unit.assert('playing index is last: ' + lastIndex, video.getIndex(), lastIndex);
            unit.assert("playing seek to end", video.currentTime = video.duration - 5);
        });

        unit.event("has ended", video, "ended", function () {
            unit.event("track advance", video, "trackchange", function () {
                unit.assert('index ok', video.getIndex(), 0);
                unit.assert('guid ok', video.getItem(), items[0].guid);
            }, 10000);
        }, 30000);

        unit.assert('index is last: ' + lastIndex, video.getIndex(), lastIndex);
        video.loop = true;
        unit.assert("looping is enabled", video.loop , true);
        unit.assert("has autoadvance", video.autoAdvance);
        video.play();
    });

    setTrack(lastIndex);

    unit.test("looping disabled", function () {
        unit.event("playing event", video, "playing", function () {
            unit.assert('index is last: ' + lastIndex, video.getIndex(), lastIndex);
            unit.assert("seek to end", video.currentTime = video.duration - 5);
        });

        unit.event("has ended", video, "ended", function () {
            setTimeout(
                unit.callback("trackchange timeout", function () {
                    unit.assert('index ok', video.getIndex(), lastIndex);
                    unit.assert('guid ok', video.getItem(), items[lastIndex].guid);
                    unit.assert("not playing", video.paused );
                }, this),
                3000
            );
        }, 30000);

        video.loop = false;
        unit.assert("looping is disabled", video.loop , false);
        unit.assert("has autoadvance", video.autoAdvance);
        video.play();
    });

};