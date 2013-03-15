(function () {

    var $ = jQuery;

    var defaults = {
        msQuotes : true,
        rampHost : "http://api.ramp.com/v1/mp2/playlist/",
        retries : 3,
        retryDelayMSec : 4000
    };

    var RampService = function (player, url, options) {
        this.config = $.extend({}, defaults, options);
        this.dispatcher = MetaPlayer.dispatcher(this);
        this.player = player;
        this._currentUrl = null;
        this.rampHost = this.config.rampHost;
        this._retries = 0;
        this.player.listen( MetaPlayer.READY, this.onReady, this);
    };

    MetaPlayer.addPlugin("ramp", function (apikey, rampId, options) {
        if(! this._ramp )
            this._ramp =  new RampService(this, apikey, rampId, options);

        var ramp = this._ramp;

        // if they pass in a url...
        if( apikey && apikey.match("/") ){
            // if passed in a template url
            if( apikey.match(/[\?\&]e=$/) ){
                ramp.rampHost = apikey;
            }
            // else passed in a playlist url
            else if(! this.ready )
                ramp._currentUrl = apikey;
            else
                ramp.load( apikey , true);
        }
        // if they pass in an api token
        else if( apikey ) {
            ramp.apiKey = apikey;
            if( rampId ) {
                if(! rampId.match(/^ramp:/) )
                    rampId = "ramp:" + rampId;
                ramp._currentUrl = rampId
            }
        }
        return this;
    });

    RampService.prototype = {

        onReady  : function (e) {
            this.player.metadata.listen( MetaPlayer.MetaData.LOAD,
                this.onMetaDataLoad, this);

            this.player.metadata.listen( MetaPlayer.DESTROY,
                this.onDestroy, this);

            if( this._currentUrl )
                this.load(this._currentUrl, true);
        },

        onMetaDataLoad : function (e) {
            var data = e.data;
            var uri;
            if(data.ramp && data.ramp.serviceURL ){
                uri = data.ramp.serviceURL
            }
            else if( e.uri.match(/^ramp:/) ){
                uri = e.uri;
            }
            if( uri ) {
                this.load(uri);
                e.stopPropagation(); // let others know we're on it.
                e.preventDefault();
            }
            // else fall through to noop if not recognized
        },

        onDestroy : function () {
            this.dispatcher.destroy();
            delete this.config;
            delete this.player;
        },

        load : function ( uri, isPlaylist ) {
            var track;

            // parse format:  "ramp:publishing.ramp.com/sitename:1234"
            var url = uri;
            if( typeof uri == "string" &&  uri.match(/^ramp\:/) ) {
                var parts = this.parseUrl(uri);

                // ex.   ramp://publishing.ramp.com/:12345
                if( parts.apiKey && parts.apiKey.match('/') ){
                    url = parts.apiKey + parts.rampId;
                }
                // ex.   ramp:QWER1234ASDF2345:12345
                // ex.   ramp:12345  w/ ramp("QWER1234ASDF2345")
                else if( parts.apiKey || this.apiKey ){
                    parts.apiKey = this.apiKey;
                    url = this.rampHost + "?apikey="
                        + encodeURIComponent(parts.apiKey)
                        + "&e="
                        + encodeURIComponent(parts.rampId)
                }
                // ex.   ramp:12345  w/ ramp("http://publishing.ramp.com/foo/mp2-playlist/e=")
                else if( this.rampHost ) {
                    url  = this.rampHost + parts.rampId
                }

            }

            var params = {
            };

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    if( this._retries <  this.config.retries ) {
                        setTimeout( this.bind( function (e) {
                            this.load(uri, isPlaylist);
                        }), this.config.retryDelayMSec * this._retries); // increase delay with each retry
                        this._retries++;
                        this.player.warn( "ServiceAjaxError", jqXHR.status + " " + textStatus + " "+ uri +" attempt #" + this._retries);
                        return;
                    }

                    this.player.error( "ServiceAjaxError",  jqXHR.status + " " + textStatus + " "+ uri +"  attempt #" + this._retries);
                    this._retries = 0;
                },
                success : function (response, textStatus, jqXHR) {
                    this._retries = 0;
                    var items = this.parse(response, url);
                    if( items.length )
                        this.setItems(items, isPlaylist);
                    else {
                        this.player.warn( "ServiceParseError", "Invalid Playlist ["+ uri +"]")
                    }
                }
            });
        },


        setItems : function (items, isPlaylist) {
            var metadata = this.player.metadata;
            var playlist = this.player.playlist;
            var cues = this.player.cues;

            // first item contains full info
            var first = items[0];
            var guid = first.metadata.guid;

            cues.setCueLists( first.cues, guid  );
            metadata.setData( first.metadata, guid, true );

            // subsequent items contain metadata only, no transcodes, tags, etc.
            // they require another lookup when played, so disable caching by metadata
            if( playlist  ) {
                var self = this;
                // add stub metadata
                $.each(items.slice(1), function (i, item) {
                    metadata.setData(item.metadata, item.metadata.guid, false);
                });

                // queue the uris
                if( isPlaylist ) {
                    playlist.setPlaylist( $.map(items, function (item) {
                        return item.metadata.guid;
                    }));
                }
            }
            else {
                // only trigger a DATA event if not playing video
                metadata.load(guid);
            }
        },

        parse : function (data, uri) {
            var self = this;
            var playlist = $(data).find('par').toArray();
            var media = [];
            $.each(playlist, function(i, node) {
                media.push( self.parseMedia(node, uri) );
            });
            return media;
        },

        parseMedia : function (node, uri) {
            var item = {
                metadata : {},
                cues : {}
            };

            var self = this;
            var video = $(node).find('video');

            // mrss metadata
            item.metadata.title = video.attr('title');
            item.metadata.description = video.find('metadata meta[name=description]').text();
            item.metadata.thumbnail = video.find('metadata meta[name=thumbnail]').attr('content');
            item.metadata.guid = "ramp:" + video.find('metadata meta[name=rampId]').attr('content');
            item.metadata.link = video.find('metadata meta[name=linkURL]').attr('content');

            item.metadata.subTitles = [];
            video.find('metadata meta[name=subTitle]').each( function (i, node){
                var track = $(node);
                item.metadata.subTitles.push({
                        type : track.attr('content'),
                        href : track.text()
                    });
            });
            item.metadata.subTitle = item.metadata.subTitles[0];

            item.metadata.cueTracks = [];
            video.find('metadata meta[name=cueTrack]').each( function (i, node){
                var track = $(node);
                    item.metadata.cueTracks.push({
                        type : track.attr('content'),
                        href : track.text()
                    });
            });

            // other metadata
            item.metadata.ramp = {
            };
            video.find('metadata meta').each( function (i, metadata){
                var meta = $(metadata);
                item.metadata.ramp[ meta.attr('name') ] = meta.attr('content') || meta.text();
            });

            if( item.metadata.ramp.rampId && ! item.metadata.ramp.serviceURL ){
                if( uri.match( /mp2[-\/]playlist/ ) ) {
                    item.metadata.ramp.serviceURL = uri.replace(/e=(\d+)/, "e=" + item.metadata.ramp.rampId);
                }
            }

            // content & transcodes
            item.metadata.content = [];
            item.metadata.content.push({
                name : "default",
                url : video.attr('src'),
                type : self.resolveType( video.attr('src') ),
                isDefault : true
            });

            var transcodes = $(node).find("metadata[xml\\:id^=transcodes]");
            transcodes.find('meta').each(function (i, transcode){
                var code = $(transcode);
                item.metadata.content.push({
                    name : code.attr('name'),
                    type : code.attr('type') || self.resolveType( code.attr('content') ),
                    url : code.attr('content'),
                    isDefault: false
                });
            });

            // jump tags
            item.metadata.ramp.tags = [];
            item.cues.tags = [];
            var jumptags = $(node).find("seq[xml\\:id^=jumptags]");
            jumptags.find('ref').each(function (i, jump){
                var tag = {};
                $(jump).find('param').each( function (i, val) {
                    var param = $(val);
                    tag[ param.attr('name') ] = param.text();
                });
                if( tag.timestamps )
                    tag.timestamps = tag.timestamps.split(',');
                item.metadata.ramp.tags.push(tag);

                $.each(tag.timestamps, function(i, time){
                    var event = {
                        term : tag.term,
                        start: parseFloat(time)
                    };
                    item.cues.tags.push(event);
                });
            });

            // event tracks / MetaQ
            var metaqs = $(node).find("seq[xml\\:id^=metaqs]");
            metaqs.find('ref').each(function (i, metaq){
                var event = {};

                // handle mp2-style cues, which are collapsed into one cue entry
                if( $(metaq).find('param[name="origin"]').text() == "metaq" ) {
                    self.parseMp2Cues(item.cues, metaq);
                    return;
                }

                $(metaq).find('param').each( function (i, val) {
                    var param = $(val);
                    var name =  param.attr('name');
                    var text =  self.deSmart( param.text() );
                    if( name == "code"  ) {
                        try {
                            var code = $.parseJSON( text );
                            $.extend(true, event, code);
                        }
                        catch (e){
                            event.code = text;
                        }
                    }
                    else
                        event[ name ] = text;

                });
                if( ! item.cues[event.plugin] )
                    item.cues[event.plugin] = [];

                item.cues[event.plugin].push(event);
            });

            // transcript
            var smilText = $(node).find("smilText");
            item.cues.captions = this.parseCaptions(smilText);
            return item;
        },

        parseMp2Cues : function  (cues, metaq){
            var self = this;
            var mq = $(metaq);
            var event = {};

            event.term = mq.find('param[name=term]').text();

            var plugin = mq.find('param[name=id]').text();
            if( plugin == "timeline-q")
                event.plugin = "timeQ";
            else if( plugin == "adhoc-js")
                event.plugin = "script";


            $(metaq).find('param').each( function (i, val) {
                var param = $(val);
                var name =  param.attr('name');
                event[ name ] = self.deSmart( param.text() );
            });

            var timestamps = event.timestamps || '';
            delete event.timestamps;

            if( ! cues[event.plugin] )
                cues[event.plugin] = [];

            $.each(timestamps.split(','), function (i, val){
                var e = $.extend({}, event);
                e.start = parseFloat(val);
                cues[event.plugin].push(e);
            });
        },

        parseCaptions : function (xml) {
            // static factory constructor
            var self = this;
            var nodes = $(xml).contents();
            var cues  = [
            ];

            var current = {
                text : '',
                start: 0,
                offset : 0
            };

            var previous;

            var getStart = function (node, lastCue) {
                var el = $(node);
                var parseSeconds = this.parseSeconds;


                var begin = el.attr('begin');
                if( begin != null )
                    return self.parseSeconds(begin);

                var _next = el.attr('next');
                if( _next != null )
                    return self.parseSeconds(_next) + lastCue.start;
            };

            var handleNode = function (node, text) {
                var start = getStart(node);
                previous = current;
                previous.end = start;
                if( text )
                    previous.text += text ;
                cues.push(previous);
                current = {
                    text: '',
                    start : start,
                    offset : current.offset+1
                };
            };

            nodes.each( function ( i, node ){
                var text = nodes[i].data;
                if( node.tagName === undefined ){
                    if( self.config.msQuotes ) {
                        text = self.deSmart(text);
                    }
                    current.text += text;
                    return;
                }

                switch (node.tagName) {
                    case "smil:clear":
                    case "clear":
                        handleNode(node);
                        break;

                    case "smil:tev":
                    case "tev":
                        handleNode(node);
                        break;

                    case "smil:br":
                    case "br":
                        handleNode(node, "<br />" );
                        break;

                    case "smil:div":
                    case "smil:p":
                    case "smil:span":
                    default:
                        throw "unsupported tag";
                    // unsupported...
                }
            });

            if( current.text )
                cues.push(current);

            return cues;
        },

        parseSeconds : function (str) {
            // http://www.w3.org/TR/smil/smil-timing.html#Timing-ClockValueSyntax
            var lastChar = str.substr(-1);
            var val = parseFloat(str);

            if( lastChar == "s")
                return val;

            if( lastChar == "m")
                return val * 60;

            if( lastChar == "h")
                return val * 3600;

            var sec = 0;
            var p = str.split(':');
            for (var i = 0; i < Math.min(p.length, 4); i++)
                sec += Math.pow(60, i) * parseFloat(p[i]);
            return sec;
        },

        parseUrl : function ( url, obj ) {
            var parts = url.split(':');
            if( obj == undefined)
                obj = {};
            if( parts[0] !== "ramp" )
                obj.url = url;
            else if( parts.length == 3 ){
                obj.apiKey = parts[1];
                obj.rampId = parts[2];
            }
            else {
                obj.rampId = parts[1];
            }
            return obj;
        },

        toUrl : function ( item ) {
            return "ramp:" + item.ramp.rampHost + ":" + item.ramp.rampId;
        },

        deSmart : function (text) {
            return text.replace(/\xC2\x92/, "\u2019" );
        },

        resolveType : function ( url ) {
            var ext = url.substr( url.lastIndexOf('.') + 1 );

            if( url.match("www.youtube.com") ) {
                return "video/youtube"
            }

            if( ext == "ogv")
                return "video/ogg";

            // none of these seem to work on ipad4
            if( ext == "m3u8" )
                return  "application/application.vnd.apple.mpegurl";

            return "video/"+ext.toLowerCase();
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            }
        }
    };


})();
