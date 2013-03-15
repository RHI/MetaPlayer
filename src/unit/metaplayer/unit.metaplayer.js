
var mpf;
function MetaPlayerHarness (unit, apikey, media){
    if( ! (this instanceof MetaPlayerHarness))
        return new MetaPlayerHarness(unit, apikey, media);

    unit.test("MetaPlayer()", function () {
        unit.assert("param: apikey", apikey);
        unit.assert("param: media", media);

        mpf = MetaPlayer(media);
        unit.assert("mpf instance", mpf);

        mpf.ramp(apikey);

        unit.event("mpf ready", mpf, "ready");
        mpf.load();
    });

    unit.test("ready status", function (){
        unit.event("metadata focus event", mpf.metadata, "focus");
        unit.event("metadata load event", mpf.metadata, "load");

        unit.assert("video api", mpf.video);
        unit.assert("playlist api", mpf.playlist);
        unit.assert("metadata api", mpf.metadata);
        unit.assert("cues api", mpf.cues);

        unit.event("playlist trackchange event", mpf.playlist, "trackchange");

        unit.event("cues event", mpf.cues, "cues", function () {
            unit.assert("has captions", mpf.cues.getCaptions().length);
        });


        unit.event("data event", mpf.metadata, "data", function () {
            var data = mpf.metadata.getData();
            unit.assert("has data", data);
            unit.assert("has title", data.title);
            unit.assert("has description", data.description);
            unit.assert("has encodings", data.content.length);
        });

        unit.assert("has video", mpf.video);
        unit.assert("has playlist api", mpf.playlist);
    });

    unit.test("playlist changes data", function () {
        unit.assert("at index 0", mpf.playlist.getIndex(), 0);

        var items = mpf.playlist.getPlaylist();

        unit.assert("playlist has 2+ videos", items.length > 1);

        unit.event("metadata focus event", mpf.metadata, "focus", function (e) {
            unit.assert("focus second uri: ", items[1] , e.uri);

        });

        unit.event("metadata load event", mpf.metadata, "load", function(e){
            unit.assert("data guid matches: ", items[1] , e.data.guid);
        });

        unit.event("playlist trackchange event", mpf.playlist, "trackchange", function (){
            unit.assert("at index 1", mpf.playlist.getIndex(), 1);
        });

        mpf.playlist.next();
    });

}