JWPlayer Plugin
=====================
About
--------------


Quick Start
--------------

JWPlayer initialization:

    /**
     * support the playlist params
     * playlist : [
                { file : "", "sharing.link": "" },
                { file : "", "sharing.link": "" }
                ]
       plugins: { sharing : { link: true } }
       events: { 
            onComplete: function() { console.log("the video is finished"); },
            onReady: function() { this.play(); },
            onVolume: funtion(event) { console.log("the volume is ", event.volume); }
            }
        // version ~> 5.5
        modes: [
                { type: "html5" },
                { type: "flash", src: "../../../external/jwplayer/player.swf" }
               ]
        // version 5.5+
        modes: [
                { type: "flash",
                  src: "../../../external/jwplayer/player.swf",
                  config: {
                    file: "video.mp4",
                    streamer: "rtmp://rtmp.server.com/videos",
                    provider: "rtmp"
                  }
                },
                { type: "html5",
                  config: {
                     file: "http://server.com/videos/video.mp4"
                  }
                }
               ]
     */
    
    var config = {
    id          : 'jwplayer',
    autostart   : false,
    controlbar  : "none",
    flashplayer : "../../../../external/jwplayer/player.swf",
    file        : "../../../../media/elephants_dream/elephant.mp4",
    image       : "",
    volume      : 0
};

var player = MetaPlayer("#target").jwplayer(config).controls().load();
