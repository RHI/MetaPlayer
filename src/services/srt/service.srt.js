(function () {

    var $ = jQuery;

    var defaults = {
    };

    var SrtService = function (options) {
        if( ! (this instanceof SrtService ))
            return new SrtService(options);
        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
    };

    MetaPlayer.srt = function (url, callback, options) {
        var srt = SrtService(options);
        srt.listen("data", function (e) {
            callback && callback(e.cues)
        });
        srt.load(url);
    };

    MetaPlayer.prototype.srt = function (url) {
        var mpf = this;
        if(! mpf._srt ) {
            mpf._srt  = SrtService();

            mpf.metadata.listen("data", function (e) {
                var tracks = e.data.subTitles || [];
                var i, url, track;
                for(i = 0; i< tracks.length; i++ ){
                    track = tracks[i];
                    if( track.type == "application/x-subrip" || track.href.match(/\.srt$/) ) {
                        url = tracks[i].href;
                        break;
                    }
                }
                if( url )
                    mpf._srt.load(url, e.uri)
            });

            mpf._srt.listen("data", function (e) {
                mpf.cues.setCues("captions", e.cues,  e.data );
            });
        }

        if( url )
            mpf._srt.load(url, mpf.metadata.getFocusUri() );
        return mpf;
    };

    SrtService.prototype = {
        load : function ( url, passedData) {
            var params = {};

            $.ajax(url, {
                dataType : "text",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    this.event("error", {
                        url : url,
                        data : passedData,
                        status : textStatus,
                        message: errorThrown
                    });
                },
                success : function (response, textStatus, jqXHR) {
                    var captionData = this.parse(response);
                    if( captionData )
                        this.event("data", {
                            url : url,
                            data : passedData,
                            cues : captionData
                        });
                }
            });
        },

        parse : function (text) {
            var captions = [];
            // don't /\n/ use regex! http://blog.stevenlevithan.com/archives/cross-browser-split
            var lines = text.split("\n");
            var line, times, cue, attr, content, buffer;

            while( line = lines.shift() ){
                buffer = [];
                cue = {
                    start : null,
                    end : null,
                    text : null
                };
                content = [];

                // optional id (webvtt)
                if( line.indexOf("-->") == -1){
                    cue.id = line;
                    line = lines.shift();
                    buffer.push(line);
                }

                // expect a timestamp
                times = line && line.match(/^([\d\,\:]+)\s*-->\s*([\d\,\:]+)(?:\s+(.*))?/);
                if ( times ) {
                    cue.start = MetaPlayer.script.parseSrtTime(times[1]);
                    cue.end = MetaPlayer.script.parseSrtTime(times[2]);
                    line = lines.shift();
                    buffer.push(line);

                    // support simple cue attributes of form "\w+:[^\s\:]+"
                    if( times[3] ){
                        $.each(times[3].split(' '), function (i,val){
                            var parts = val.split(":");
                            var name =  MetaPlayer.script.camelCase(parts[0]);
                            if( parts[1] )
                                cue[ name ] = parts[1]
                        })
                    }
                }

                while( line && line.length ) {
                    content.push(line);
                    line = lines.shift();
                    buffer.push(line);
                }
                cue.text = content.join("\n");

                var data;
                if( cue.format ){
                    if ( cue.format == "json") {
                        try {
                            data= JSON.parse(cue.text);
                            delete cue.format;
                            delete cue.text;
                            $.extend(cue, data);
                        }
                        catch(e){
                            cue.error = e.toString();
                        }
                    }
                }

                if( cue.start != null && cue.end != null && cue.text ){
                    captions.push(cue);
                }
                else {
                    try {
                        console.warn(cue, "invalid srt cue:\n" + buffer.join("\n") );
                    } catch(e){}
                }
            }
            return captions;
        }


    };

})();