(function () {

    var $ = jQuery;

    var defaults = {
    };

    var MetaqService = function (url, options) {
        if( ! (this instanceof MetaqService ))
            return new MetaqService(url, options);
        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        if( url )
            this.load( url )
    };

    MetaPlayer.metaq = function (url, callback, options) {
        var service =  MetaqService(url, options);
        service.listen("data", function (e) {
            callback(e.items);
        })
    };

    MetaPlayer.prototype.metaq = function (url) {
        var mpf = this;
        if(! this._metaq ) {
            this._metaq  = MetaqService();

            mpf.metadata.listen("data", function (e) {
                var tracks = e.data.cueTracks || [];
                var i, url, track;
                for(i = 0; i< tracks.length; i++ ){
                    track = tracks[i];
                    if( track.type == "application/x-metaq-xml" ) {
                        url = tracks[i].href;
                        mpf._metaq.load(url, e.uri)
                    }
                }
            });
            this._metaq.listen("data", function (e) {
                mpf.cues.setCueLists(e.cues, e.data);
            });
        }
        if( url )
            this._metaq.load(url);
        return this;
    };

    MetaqService.prototype = {
        load : function ( url, extraData) {
            MetaPlayer.log("metaq", "load", url, extraData);

            var params = {};
            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    MetaPlayer.log("metaq", "got error", errorThrown);

                    this.event("error", {
                        url : url,
                        status : textStatus,
                        message: errorThrown,
                        data : extraData
                    })
                },
                success : function (response, textStatus, jqXHR) {
                    MetaPlayer.log("metaq", "got response");

                    var cues = this.parse(response);
                    this.event("data", {
                        'cues': cues,
                        'data': extraData
                    })
                }
            });
        },

        parse : function (xml) {
            MetaPlayer.log("metaq", "got response");
            var i;
            var matches = xmlChildren(xml, "Response.Matches.Match");
            var cues = {};
            var match;

            for(i=0; i<matches.length; i++ ){
                match = parseMatch( matches[i] );
                if( ! cues[match.type] )
                    cues[match.type] = [];
                cues[match.type].push(match.attributes);
            }
            return cues;
        }
    };

    function xmlChildren(xml, nodeName ){
        if( nodeName == "") {
            return xml;
        }

        var ret = [];
        var i;
        var path = nodeName.split(".");
        var tag = path.shift();
        var nodes = xml.childNodes;
        var node;

        for( i = 0; i < nodes.length; i++ ){
            node = nodes[i];
            if( node.nodeName == tag )
                ret = ret.concat( xmlChildren( node, path.join(".") ) );
        }
        return ret;
    }

    function xmlText (xml, path) {
        var text, node;
        try {
            node = xmlChildren(xml, path)[0];
            text = node.textContent || node.text || "";
        }
        catch(e){}
        return text;
    }

    function xmlNameValues(nodes) {
        var ret = {};
        var i, name;
        for( i = 0;i < nodes.length; i++){
            name  = xmlText(nodes[i], "Name");
            if( name )
                ret[ name ] = xmlText(nodes[i], "Value");
        }
        return ret;
    }

    function parseMatch (matchXml) {

        var type = xmlText(matchXml, "Actions.Action.Type");
        if( ! type )
            type = xmlText(matchXml, "Actions.Action.Name");

        var attributes = $.extend({
            start : parseFloat( xmlText(matchXml, "Occurrence.StartTime") )
            // end : parseFloat( xmlText(matchXml, "Occurrence.EndTime") )
        }, xmlNameValues( xmlChildren(matchXml, "Actions.Action.Attributes.Attribute") ));


        return  {
            type : type,
            attributes: attributes
        };
    }
})();