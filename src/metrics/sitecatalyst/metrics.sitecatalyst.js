(function () {

    var $ = jQuery;

    /**
     * @name Metrics.SiteCatalyst
     * @constructor
     * @class SiteCatalyst integration for HTML5
     * @param {Video} video The html5 video element to be tracked.
     * @param {SiteCatalyst} s The "s" global variable provided by SiteCatalyst's s_code.js
     * @param {String} mediaName The title of the current video
     * @param {String} [playerName] The current player identifier. Defaults to "metaplayer".
     * @requires s_code.js
     * @example
     *     sc = MetaPlayer.Metrics.SiteCatalyst("#video", s, "Test Video");
     * @see MetaPlayer#sitecatalyst
     */

    var SiteCatalyst = function (video, s, mediaName, playerName) {

        if( ! (this instanceof SiteCatalyst) )
            return new SiteCatalyst(video, s, mediaName, playerName);

        /**
         * @name mediaName
         * @type String
         * @description The title of the current video
         */
        this.playerName = playerName || "metaplayer";
        this.mediaName = mediaName ? mediaName.replace(/\s*$/, "").replace(/\s/g, "+") : "";
        this.video = $(video);
        this.s = s;


        var self = this;
        this.video.bind("durationchange play pause seeking seeked ended", function (e) {
            self._handleMediaEvent(e);
        });
    };

    /**
     * @name MetaPlayer#sitecatalyst
     * @function
     * @description MetaPlayer plugin for SiteCatalyst
     * @param {SiteCatalyst} s The "s" global variable provided by SiteCatalyst's s_code.js
     * @param {String} [title] The title to use for reporting. Defaults to {@link MetaData} title.
     * @example
     * MetaPlayer(video)
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .sitecatalyst(s)
     *       .load();
     * @see Metrics.SiteCatalyst
     */
    MetaPlayer.addPlugin("sitecatalyst", function (s, title, playerName) {
        var sc = SiteCatalyst(this.video, s, title, playerName);
        this.metadata.addEventListener("data", function(e){
            this.opened = false;
            if(e.data.title)
                sc.mediaName = e.data.title.replace(/\s*$/, "").replace(/\s/g, "+");
        })
    });

    SiteCatalyst.prototype = {

        _handleMediaEvent : function (e) {
            var m = this.s.Media,
                v = this.video.get(0),
                n = this.mediaName,
                d = Math.round(v.duration),
                t = Math.round(v.currentTime),
                p = v.paused;

            if( ! d )
                return;

            // if not opened or opening event, skip
            if( !( this.opened || e.type.match(/^(play|durationchange)$/) ) ){
                return;
            }

            // open media handle as necessary
            if( ! this.opened ) {
                MetaPlayer.log("sitecatalyst", e.type, "open", n, 0, this.playerName);
                m.open(n, d, this.playerName);
                this.opened = true;
            }

            switch (e.type) {
                case "durationchange":
                    MetaPlayer.log("sitecatalyst", e.type, "play", n, 0);
                    m.play(n, 0);
                    break;

                case "play":
                    MetaPlayer.log("sitecatalyst", e.type, "play", n, t);
                    m.play(n, t);
                    break;

                case "pause":
                    MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                    m.stop(n, t);
                    break;

                case "seeking":
                    // throttle seeking events if already stopped
                    if( !(this.seeking || p ) ) {
                        MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                        m.stop(n, t);
                    }
                    this.seeking = true;
                    break;

                case "seeked":
                    if( ! this.seeking )
                        return;
                    this.seeking = false;
                    if( !p ){
                        MetaPlayer.log("sitecatalyst", e.type, "play", n, t);
                        m.play(n, t);
                    }
                    break;

                case "ended":
                    MetaPlayer.log("sitecatalyst", e.type, "stop", n, t);
                    m.stop(n, t);
                    MetaPlayer.log("sitecatalyst", e.type, "close", n);
                    m.close(n);
                    this.opened = false;
                    break;
            }
        }

    };

    MetaPlayer.Metrics.SiteCatalyst = SiteCatalyst;
})();
