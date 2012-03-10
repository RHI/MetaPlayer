(function () {

    var $ = jQuery;

    var defaults = {
    };

    var MrssService = function (video, options) {
        if( ! (this instanceof MrssService ))
            return new MrssService(video, options);

        this.config = $.extend({}, defaults, options);

        this.dispatcher = MetaPlayer.dispatcher(video);
        this.dispatcher.attach(this);

        // if we're attached to video, update with track changes
        this.dispatcher.listen("trackchange", this._onTrackChange, this);
    };


    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.mrss = function (options) {
        return MrssService(null, options);
    };

    MetaPlayer.addPlugin("mrss", function (options) {
        this.service = MrssService(this.video, options);
    });

    MrssService.prototype = {
        load : function ( url  ) {

            var params = {};

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    console.error("Load playlist error: " + textStatus + ", url: " + url);
                },
                success : function (response, textStatus, jqXHR) {
                    this.setData( this.parse(response) );
                }
            });
        },

        setData : function (data) {
            this._data = data;
            var d = this.dispatcher;
            d.dispatch('metadata', data.metadata);
            d.dispatch('transcodes', data.transcodes);
            d.dispatch('captions', data.captions);
            d.dispatch('tags', data.tags);
            d.dispatch('metaq', data.metaq);
            d.dispatch('related', data.related);
        },

        _onTrackChange : function (e, track) {
            if(! track ) {
                return;
            }
            e.preventDefault();

            if( typeof track == "string"  ){
                this.load(track);
            }
            else {
                this.setData(track);
            }
        },


        parse : function (data) {
            var self = this;
            var playlist = [];
            var nodes = $(data).find('item').toArray();

            $.each(nodes, function(i, node) {
                playlist.push( self.parseItem(node) );
            });

            var media = playlist.shift();
            media.related = playlist;
            return media;
        },

        parseItem : function (item) {
            var media = {
                metadata : {},
                transcodes : [],
                tags : [],
                captions : [],
                metaq : {},
                related : []
            };
            var el = $(item);
            var self = this;

            // compatibility issues: http://bugs.jquery.com/ticket/10377
            var content = el.find('media:content, content');
            $.each(content, function (i, node) {
                node = $(node);
                var codec = node.attr('codec');
                var type = node.attr('type') + ( codec ? 'codec="'+codec+'"' : '');
                media.transcodes.push({
                    url : node.attr('url'),
                    fileSize : node.attr('fileSize'),
                    type : type,
                    medium : node.attr('medium'),
                    isDefault : node.attr('isDefault'),
                    expression : node.attr('expression'),
                    bitrate : node.attr('bitrate'),
                    framerate : node.attr('framerate'),
                    samplingrate : node.attr('samplingrate'),
                    channels : node.attr('channels'),
                    duration : node.attr('duration'),
                    height : node.attr('height'),
                    width : node.attr('width'),
                    lang : node.attr('lang'),
                    codec : codec
                })
            });

            media.metadata.title = el.find('media:title, title').text()

            media.metadata.description = el.find('media:description, description').text()
                || el.find(']').text();

            media.metadata.thumbnail = el.find('media:thumbnail, thumbnail').attr('url');

            return media;
        },

        search : function ( query, callback, scope) {
            throw "not implemented"
        }
    };

})();