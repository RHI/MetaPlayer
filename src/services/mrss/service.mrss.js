(function () {

    /*
     * support for MediaRSS v1.1.2
     * - with additional support for subTitle
     */
    var $ = jQuery;

    var defaults = {
        isPlaylist : true
    };

    var MrssService = function (url, options) {
        if( ! (this instanceof MrssService ))
            return new MrssService(url, options);
        MetaPlayer.dispatcher(this);
        if( url )
            this.load( url )
    };

    MetaPlayer.mrss = function (url, callback, options) {
        var service =  MrssService(url, options);
        service.listen("data", function (e) {
            callback(e.items);
        })
    };

    MetaPlayer.prototype.mrss = function (url, options) {
        var options = $.extend({}, defaults, options)
        var mpf = this;
        if(! this._mrss ) {
            this._mrss  = MrssService();
            this._mrss.listen("data", function (e) {
                var items = e.items;
                var playlist = [];
                $(e.items).each( function (i, item) {
                    if( item.cues ){
                        mpf.cues.setCueLists( item.cues, item.guid );
                        delete item.cues; // these don't show up in metadata
                    }
                    mpf.metadata.setData( item, item.guid);
                    playlist.push(item.guid);
                });
                if(options.isPlaylist)
                    mpf.playlist.setPlaylist(playlist);
            });
            this._mrss.listen("error", function (e) {
                mpf.warn(e.code, e.message)
            });
        }
        this._mrss.load(url);
        return this;
    };

    MrssService.prototype = {
        load : function ( url, extraData) {
            var params = {};
            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    this.event("error", {
                        url : url,
                        code : "MRSSAjaxError",
                        message: errorThrown + " :: " + url
                    })
                },
                success : function (response, textStatus, jqXHR) {
                    var items = this.parse(response);
                    this.event("data", {
                        'items': items,
                        'data': extraData
                    })
                }
            });
        },

        parse : function (data) {
            var self = this;
            var items = [];
            var nodes = $(data).find('item').toArray();

            $.each(nodes, function(i, node) {
                items.push( self.parseItem(i, node) );
            });
            return items;
        },

        parseItem : function (i, itemXml) {
            var self = this;
            var item = {};
            var el = $(itemXml);
            var time = (new Date()).getTime();

            // redundant selectors due to compatibility issues: http://bugs.jquery.com/ticket/10377
            var content = el.find('media\\:content, content');
            item.content = [];
            item.group = {};
            $.each(content, function (i, node) {
                node = $(node);
                var codec = node.attr('codec');
                var type = node.attr('type') || '';
                if( type && codec )
                    type += 'codec="'+codec+'"';
                var content = {
                    url : node.attr('url'),
                    fileSize : node.attr('fileSize'),
                    type : type,
                    medium : node.attr('medium'),
                    isDefault : node.attr('isDefault'),
                    expression : node.attr('expression') || "full",
                    bitrate : node.attr('bitrate'),
                    framerate : node.attr('framerate'),
                    samplingrate : node.attr('samplingrate'),
                    channels : node.attr('channels'),
                    duration : node.attr('duration'),
                    height : node.attr('height'),
                    width : node.attr('width'),
                    lang : node.attr('lang'),
                    codec : codec
                };
                item.content.push(content);

                // item.group[expression] = [ content, content ]
                if( ! item.group[content.expression] )
                    item.group[content.expression] = [];
                item.group[content.expression].push(content)
            });

            // mpf requires a GUID, so generate one if missing
            item.guid = el.find('guid').text() || "MPF_" + i + "_" + (new Date).getTime() ;
            item.title = el.find('media\\:title, title').first().text();
            item.description = el.find('media\\:description, description').first().text();

            item.thumbnails = [];
            el.find('media\\:thumbnail, thumbnail').each( function (i, node) {
                var thumb = $(node);
                item.thumbnails.push({
                    url : thumb.attr('url'),
                    width : thumb.attr('width'),
                    height : thumb.attr('height'),
                    time : thumb.attr('time')
                })
            });
            if( item.thumbnails.length )
                item.thumbnail = item.thumbnails[0].url;

            item.subTitles = [];
            el.find('media\\:subTitle, subTitle').each( function (i, node) {
                var track = $(node);
                item.subTitles.push({
                    type : track.attr('type'),
                    lang : track.attr('lang'),
                    href : track.attr('href')
                })
            });
            item.subTitle = item.subTitles[0];

            item.rating = el.find('media\\:rating, rating').first().text();
            item.adult = el.find('media\\:adult, adult').first().text();
            item.keywords = el.find('media\\:keywords, keywords').first().text();


            var hash = el.find('media\\:hash, hash');
            item.hash = {
                algo : hash.attr('algo'),
                text : hash.text()
            };

            var player = el.find('media\\:player, player');
            item.player = {
                url : player.attr('url'),
                height : player.attr('height'),
                width : player.attr('width')
            };

            item.credits = [];
            el.find('media\\:credit, credit').each( function (i, node) {
                var credit = $(node);
                item.credits.push({
                    role : credit.attr('role'),
                    scheme : credit.attr('scheme'),
                    text : credit.text()
                })
            });
            item.credit = item.credits[0];

            var copyright = el.find('media\\:copyright, copyright');
            item.copyright = {
                url : copyright.attr('url'),
                text : copyright.text()
            };

            item.text = [];
            el.find('media\\:text, text').each( function (i, node) {
                var line = $(node);
                item.text.push({
                    type : line.attr('type'),
                    lang : line.attr('lang'),
                    start : line.attr('start'),
                    end : line.attr('end'),
                    text : line.text()
                })
            });

            item.restrictions = [];
            el.find('media\\:restriction, restriction').each( function (i, node){
                    var r = $(node);
                    var type = r.attr('type');
                    item.restrictions[type] = {
                        relationship : r.attr('relationship'),
                        text : player.text()
                    }
            });


            /*
             not implemented:
             media:community
                media:starRating
                media:statistics
                media:tags
             media:comments
                media:comment
             media:embed
                media:param
             media:responses
                media:response
             media:backLinks
                media:backLink
             media:status
             media:price
             media:license
             media:peerLink
             media:location
                georss:where
                gml:Point
                gml:pos
             media:rights
             media:scenes
                media:scene
             */

            /* MPF extensions */
            el.find('mpf\\:attribute, attribute').each( function (i, node){
                var attr = $(node);
                var type = MetaPlayer.script.camelCase( attr.attr('name') );
                MetaPlayer.script.objectPath( item, type, attr.text() );
            });


            item.cueTracks = [];
            el.find('media\\:cueTrack, cueTrack').each( function (i, node) {
                var track = $(node);
                item.cueTracks.push({
                    type : track.attr('type'),
                    href : track.attr('href')
                })
            });

            item.cues = {};
            el.find('mpf\\:cue, cue').each( function (i, node) {
                var track = $(node);
                var type = track.attr('type') || 'unknown';
                var format = track.attr('format') || '';
                var cue = {
                    start : MetaPlayer.script.parseSrtTime( track.attr('start') || ''),
                    end : MetaPlayer.script.parseSrtTime( track.attr('end') || '')
                };

                if( cue.end == null )
                    delete cue.end;

                if(! item.cues[type] )
                    item.cues[type] = []

                if( format  == "json") {
                    try {
                        $.extend(cue, JSON.parse( track.text() ))
                    }
                    catch(e){
                        self.event("error", {
                            code : "MRSSJsonError",
                            message: e.toString() + " :: " + track.text()
                        });
                        return false;
                    }
                }
                else {
                    cue.text = track.text();
                }
                item.cues[type].push( cue );
            });

            return item;
        }
    };

    window.xmlnsFind = function (node, tagname){
        $.grep( $(node).find('*'), function (el, i){
            console.log("e: " + el.tagName + " .. " + el.nodeName );
        })
    }

})();