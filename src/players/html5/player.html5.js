/**
 * HTML5 MetaPlayer Adapter
 * Supports:  Media API, Playlist API
 * Since we already have an HTML5 Media interface, we just need to add the Playlist Read API.
 */

(function () {

    var $ = jQuery;

    var Html5Adapter = function (media) {

        if( typeof media == "string" ){
            media = $(media).get(0);
        }

        // is a media adapter
        if( ! (media && media.play && media.canPlayType) )
            return null;

        return media;
    };

    Html5Adapter.create = function (target) {
        var t = $(target);
        var video = $("<video></video>")
            .height( t.height() )
            .width( t.width() )
            .appendTo(t)
            .get(0);

        video.controls = true;
        return video;
    };

    MetaPlayer.Players.HTML5 = Html5Adapter;

    /* deprecated */

    MetaPlayer.html5 = function (target){
        return Html5Adapter.create(target);
    };

    MetaPlayer.addPlayer("html5", function (options) {
        this.video = Html5Adapter.create(this.layout.base);
    });


})();
