Metaplayer : Html5 Playlist Plugin
=============
 An HTML5 Playlist adapter for Metaplayer.

About
-------------
This library creates a Html5Player instance, which acts as a HTML5 MediaController, with additional APIs for
playlist support integration into the Metaplayer data service for initialization.


Quick Start
-------------


Ramp framework initialization:

        var ramp = Ramp('36234882', "/pca");
        var media = ramp.html5('#target');


See the `examples/` folder for functional demos of these and more.

Constructor
-------------

* `ramp.html5(el, config)`
    * `el`

        (required) - a reference to a DOM div or Video element, or a jQuery-style id (eg. '#video')

    * `config`

        Required object with key value pair options:

        * `related` (optional) - use RAMP related videos to initialize a Flowplayer playlist. Default is `true`.
        * `preload` (optional) -  Default is `true`.
        * `autoplay` (optional) -  Default is `true`.
        * `loop` (optional) -  Enables playlist looping. Default is `false`.
        * `autoAdvance` (optional) -  Automatically selects next track upon video end. Disabling allows for
        a custom end-cap display between videos. Default is `true`.

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



