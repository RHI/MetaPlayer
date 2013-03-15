(function () {

    var PopcornAdapter = function (popcorn) {
        if( !( popcorn && popcorn.getTrackEvents && popcorn.media) )
            return null;

        return popcorn.media;
    };

    MetaPlayer.Players.Popcorn = PopcornAdapter;
})();
