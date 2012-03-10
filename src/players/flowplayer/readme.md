Metaplayer : Flowplayer Plugin
=============
 An HTML5 MediaController adapter for Flowplayer, with an optional Metaplayer metadata loader.

About
-------------
This library adapts a Flowplayer instance into an HTML5 MediaController.  Additionally, if a Metaplayer object
is provided, it will initialize the flowplayer instance with media urls and transcripts.  Use of this library will
enable other HTML5 Video utilities, such as PopcornJS, to work without modification.


Quick Start
-------------

Flowplayer framework initialization:

        var fp = $f("target", "../../../external/flowplayer/flowplayer-3.2.7.swf")
            .ramp(36234882, '/pca');
            .load();

        var video = fp.ramp.media;

Ramp framework initialization:

        var ramp = Ramp('36234882', "/pca");
        ramp.flowplayer('#target', {
            swfUrl : "../../../external/flowplayer/flowplayer-3.2.7.swf"
        });

Standalone HTML5 controller:

        var fp = $f("target", "../../../external/flowplayer/flowplayer-3.2.7.swf", {
            clip : {
                url: "http://pseudo01.hddn.com/vod/demo.flowplayervod/flowplayer-700.flv"
            }
        });

        var video  = Ramp.Players.FlowPlayer(fp);


See the `examples/` folder for functional demos of these and more.

Constructors
-------------

* `Ramp.Players.FlowPlayer(fp, config, ramp)`

    * `fp`

        A flowplayer instance

    * `config`

        (optional) object with key value pair options:
        * related - use RAMP related videos to initialize a Flowplayer playlist. Defaults to true.

    * `ramp` : (optional) A RAMP instance. Will resolve any "ramp:" urls, load playlist.

* `fp.ramp(mediaId, rampHost, config)`

    * `mediaId` ,  `rampHost`

        (optional) Will initialize flowplayer with the specified RAMP-enabled media.

    * `config` :

        (optional) Object with key value pair options:

        * related - use RAMP related videos to initialize a Flowplayer playlist. Defaults to true.


* `ramp.flowplayer(el, config)`
    * `config`

        Required object with key value pair options:

        * `swfUrl` (required) - url to the flowplayer swf
        * `related` (optional) - use RAMP related videos to initialize a Flowplayer playlist. Default is `true`
        * `preload` (optional) - enables flowplayer autoBuffering on all clips added/ Default is `true`.,
        * `autoplay` (optional) - enables flowplayer autoPlay on all clips added. Default is `true`.,
        * `wmode` (optional) - sets the swf wmode. Default is `true` to allow for HTML overlays.
        * `fpConfig` (optional) - optional flowplayer configuration to be used.

Methods and Properties
-------------

The wrapper supports the majority of the [MediaController interface](http://www.w3.org/TR/html5/video.html#mediacontroller),
with few exceptions (at this time, `played` and `buffered`, and playback rates are unsupported).


In addition, the loader supports the following Metaplayer extensions for playlist support:

* `playlist`

    Contains an array of RAMP metadata objects, including the media id, thumbnail, title, description.

* `index`

    The current playlist index.

*  `nextTrackIndex()`

    Returns the next track index, accounting for looping.  If at the last track and looping is disabled, return null.

* `nextTrack()`

    Moves the playlist one track forward. If at the last video and looping enabled, wraps to the first track;
    otherwise does nothing.

* `previousTrack()`

    Moves the playlist one track backward. If at the first video and looping enabled, wraps to the last track;
    otherwise does nothing.



