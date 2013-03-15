(function () {

    var $ = jQuery;

    var defaults = {
        forceRelative : false,
        useCache: true
    };

    /**
     * Creates a Search interface for use with MetaPlayer and RAMP services.
     * @name API.Search
     * @class Provides search servies for the currently video. <br />
     * @constructor
     * @augments Util.EventDispatcher
     * @param {MetaPlayer} player A MetaPlayer instance containing a MetaData reference.
     * @see MetaData
     */
    var Search = function (player, options){
        this.config = $.extend({}, defaults, options);

        this.player = player;
        this.forceRelative = this.config.forceRelative;
        MetaPlayer.dispatcher(this);

        this.player.listen(MetaPlayer.DESTROY, this.destroy, this);

    };

    /**
     * Fired when a search is initiated.
     * @name API.Search#event:QUERY
     * @event
     * @param {Event} e
     * @param {String} e.query The current search string
     * @example
     * mpf.search.addEventListener( MetaPlayer.Search.RESULTS , function (e) {
     *    console.log("Searched initiated for: " + e.query);
     * });
     */
    Search.QUERY = "query";

    /**
     * Fired when search results are available.
     * @name API.Search#event:RESULTS
     * @event
     * @param {Event} e
     * @param {String} e.query The current search string
     * @param {Object} e.data  The search results
     * @example
     * mpf.search.addEventListener( MetaPlayer.Search.RESULTS , function (e) {
     *   console.log("Results for: " + e.query);
     *   console.log(JSON.stringify(e.data, null, "  "));
     * });
     * mpf.search.query("Babylon");
     * @example
     * Results for: Babylon
     *{
     *  "query": [
     *    "Babylon"
     *  ],
     *  "results": [
     *    {
     *      "start": "473.964",
     *      "words": [
     *        {
     *          "match": false,
     *          "start": "480.0457",
     *          "text": "hanging"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.05457",
     *          "text": "gardens"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.06345",
     *          "text": "of"
     *        },
     *        {
     *          "match": true,
     *          "start": "480.07233",
     *          "text": "\nBabylon."
     *        }
     *      ]
     *    }
     *  ]
     *}
     */
    Search.RESULTS = "results";

    MetaPlayer.Search = Search;

    MetaPlayer.addPlugin("search", function (options) {
        return new Search(this);
    });


    Search.context = function ( str, offset, count, maxbuffer) {
        // returns *count words of context starting at offset
        // if count is negative, looks bacward from offset
        // if maxbuffer is less than a word size, it will be split into two words (default: 256)
        // returns an array of objects in the form of
        // eg: [ { text : "first word", offset : 0 }, ... ]

        var o = offset;
        var words = [],
            match;
        if( count == null )
            count = 10;

        if( maxbuffer == null )
            maxbuffer = 256;

        var re, sub;
        if( count > 0 ){
            re = /^\s*(\S+)/;
            sub = str.substr(o, maxbuffer)
        }
        else {
            re = /(\S+)\s*$/;
            if( o >= maxbuffer )
                sub = str.substr(  o - maxbuffer, maxbuffer);
            else
                sub = str.substr(0, o);
        }

        var word;
        while( words.length < Math.abs(count) && (match = sub.match(re) ) ){
            if( count > 0 ){
                words.push({
                    text : match[1],
                    offset: o
                });
                o += match[0].length;
                sub = str.substr(o, maxbuffer)
            }
            else {
                o -= match[0].length;
                words.unshift({
                    text : match[1],
                    offset: o
                });
                if( o >= maxbuffer )
                    sub = str.substr(  o - maxbuffer, maxbuffer);
                else
                    sub = str.substr(0, o);
            }
        }
        return words;
    };

    Search.search = function (str, query, count) {

        if(! query.length )
            return [];

        var escaped = query.replace(/(\W)/g, '\\$1')
            .replace(/(\\\s)+/g, '\\s+');
        var re = new RegExp("(\\b\\S*" + escaped + "\\S*\\b)", "i");
        var match;
        var o = 0;
        var c;
        var sub = str.substr(o);
        var start, after, before, words;

        if( count == null)
            count = 6;

        var results = [];
        while( match = sub.match(re) ) {
            start = o + match.index;
            after = Search.context(str, start + match[1].length, 10);
            before = Search.context(str, start, -10);
            words = [{
                match : true,
                text : match[1],
                offset: start
            }];
            words.offset = start;

            c = 0;
            while( words.length < count && (before.length || after.length) ){
                c++;
                if( before.length && c % 2 == 0 )
                    words.unshift( before.pop() );
                else if( after.length )
                    words.push( after.shift() );
            }

            o = start + 1;
            sub = str.substr(o);
            results.push(words);
        }
        return results;
    };

    Search.prototype = {

        /**
         * Initiates a search.
         * @name API.Search#query
         * @function
         * @param {String} query A search phrase.
         */
        query : function (query, callback, scope) {
            var data = this.player.metadata.getData();


            var e = this.createEvent();
            e.initEvent(Search.QUERY, false, false);
            e.query = query;
            this.dispatchEvent(e);

            if (this.config.useCache) {
                this.searchLocal(query, callback, scope);
            }
            else {
                if(! data.ramp.searchapi )
                    throw "no searchapi available";
                this._queryAPI(data.ramp.searchapi, query, callback, scope);
            }
        },

        /**
         * Disables the instance and frees memory references.
         * @name API.Search#destroy
         * @function
         */
        destroy : function () {
            this.dispatcher.destroy();
            delete this.player;
        },

        searchLocal : function(query, callback, scope) {
            var captions = this.player.cues.getCaptions();

            var corpus = "";  // full text
            var metadata = []; // index of offsets => timestamps

            var o; // position in corpus of last needle match
            var needles = query.replace(/(^\s|\s$)/, '').toLowerCase().split(/\s+/);

            // build index/corups
            $.each(captions, function (i, cue) {
                metadata.push({
                    start : cue.start,
                    offset : corpus.length
                });
                corpus += cue.text + " ";
            });

            var timeOffset = function (offset) {
                var last = 0;
                for(var t = 0; t < metadata.length; t++ ){
                    if( offset < metadata[t].offset )
                        break;
                    last = metadata[t].start
                }
                return last;
            };

            var matches = Search.search(corpus, query);
            var ret = {
                usingCues: true,
                query : query,
                results : []
            };

            $.each(matches, function (i, match) {
                ret.results.push({
                    offset: match.offset,
                    start: timeOffset( match.offset ),
                    words :$.map(match, function (word) {
                        return {
                            offset: word.offset,
                            text : word.text,
                            match : Boolean(word.match),
                            start : timeOffset( word.offset )
                        }
                    })
                })
            });
            this.setResults(ret, query, callback, scope);
        },

        _queryAPI : function (url, query, callback, scope) {

            if( this.forceRelative ) {
                url = url.replace(/^(.*\/\/[\w.]+)/, ""); // make match local domain root
            }

            var params = {
                q : "\"" + query + "\"" //wrapped with double quotes for multi-words
            };

            if( ! query ) {
                this.setResults({ query : [], results : [] }, query, callback, scope);
                return;
            }

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : params,
                error : function (jqXHR, textStatus, errorThrown) {
                    console.error("Load search error: " + textStatus + ", url: " + url);
                },
                success : function (response, textStatus, jqXHR) {
                    var results = this.parseSearch(response, callback, scope);
                    this.setResults(results, query, callback, scope);
                }
            });
        },

        setResults : function (results, query, callback, scope) {
            if( callback ){
                callback.call(scope, results, query);
                return;
            }

            var e = this.createEvent();
            e.initEvent(Search.RESULTS, false, false);
            e.query = query;
            e.data = results;
            this.dispatchEvent(e);
        },

        parseSearch : function (xml) {
            var node = $(xml);
            var self = this;
            var ret = {
                query : [],
                results : []
            };

            var terms = node.find('SearchTerms Term');
            terms.each(function() {
                ret.query.push( self._deSmart( $(this).text() ) );
            });

            var snippets = node.find('Snippets Snippet');
            snippets.each( function (i, snip) {
                var node = $(snip);
                var s = {
                    start : node.attr('time'),
                    words : []
                };
                var words = node.find('T');
                $.each(words, function (i, word){
                    var el = $(word);
                    s.words.push({
                        match : Boolean( el.find('MQ').length ),
                        start : el.attr('s'),
                        text : self._deSmart( el.text() )
                    });
                });
                ret.results.push(s);
            });
            return ret;
        },

        _deSmart : function (text) {
            return text.replace(/\xC2\x92/, "\u2019" );
        }
    };

    /**
     * @example
     * Results for: Babylon
     *{
     *  "query": [
     *    "Babylon"
     *  ],
     *  "results": [
     *    {
     *      "start": "473.964",
     *      "words": [
     *        {
     *          "match": false,
     *          "start": "480.0457",
     *          "text": "hanging"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.05457",
     *          "text": "gardens"
     *        },
     *        {
     *          "match": false,
     *          "start": "480.06345",
     *          "text": "of"
     *        },
     *        {
     *          "match": true,
     *          "start": "480.07233",
     *          "text": "\nBabylon."
     *        }
     *      ]
     *    }
     *  ]
     *}
     */

})();
