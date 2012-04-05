

(function () {

    var $ = jQuery;

    var defaults = {
        cssPrefix : "mp-search",
        tags : true,
        query : "",
        seekBeforeSec : .25,
        context : 3,
        strings : {
            'tagHeader' : "In this video:",
            'searchPlaceholder' : "Search transcript...",
            'ellipsis' : "...",
            'resultsHeader' : "Showing {{count}} {{results}} for \"{{query}}\":",
            'results' : function (dict) { return "result" + (dict['count'] == 1 ? "" : "s")},
            'clear' : "x"
        }
    };

    var SearchBox = function (target, player, options) {


        if( !(this instanceof SearchBox) )
            return new SearchBox(target, player, options);

        this.player = player;
        this.target = $(target);

        this.config = $.extend(true, {}, defaults, options);

        this.createMarkup();

        this.scrollbar = MetaPlayer.scrollbar( this.results );

        this.addListeners();
        this.clear();
    };

    SearchBox.instances = {};
    SearchBox._count = 0;

    MetaPlayer.SearchBox = SearchBox;

    MetaPlayer.addPlugin("searchbox", function(target, options) {
        this.searchbox = SearchBox(target, this, options);
    });

    SearchBox.getPhrase = function (words, offset, context){
        if( typeof words == "string" )
            words = words.split(' ');

        var len = context * 2 + 1;

        var start = 0;
        if(  words.length - offset <= context ) {
            start = words.length - len;
        }
        else if( offset > context ){
            start = offset-context;
        }

        if( start < 0 )
            start = 0;

        return {
            words :  words.slice( start, start + len),
            start : start,
            len : len
        };
    },

    SearchBox.prototype = {

        createMarkup : function (){
            var t = $(this.target);
            var c = this.create();

            var f= this.create('form')
            c.append(f);

            var ti = $('<input type="text" />');
            ti.addClass( this.cssName('input') );
            ti.val( this.config.query );
            ti.attr('placeholder',  this.getString("searchPlaceholder") );
            f.append(ti);

            var sm = this.create('submit', 'a');
            sm.append( this.create('submit-label', 'span') );
            f.append(sm);

            this.results = this.create('results')
                .appendTo(c);

            this.create('tags')
                .appendTo(c);

            this.container = c;
            t.append(this.container);
        },

        addListeners : function () {
            var self = this;

            this.find('submit').bind("click", function () {
                self.onSearch();
            });

            this.find('input').bind("keypress", function (e) {
                if (e.which == 13 ) {
                    self.onSearch();
                }
            });

            this.find('results').bind("click", function (e) {
                var el = $(e.target).parents('.' + self.cssName('result') );
                if( ! el.length )
                    el = $(e.target);
                var start = el.data().start;
                if( self.player )
                    self.player.video.currentTime = start - self.config.seekBeforeSec;
            });

            this.player.metadata.listen(MetaPlayer.MetaData.DATA, this.onTags, this);
            this.player.search.listen(MetaPlayer.Search.QUERY, this.onSearchStart, this);
            this.player.search.listen(MetaPlayer.Search.RESULTS, this.onSearchResult, this);
        },

        onTags : function (e) {
            var ramp = e.data.ramp;
            if(! ramp.tags ){
                return;
            }

            var box = this.find("tags");
            var self = this;

            box.empty();

            this.create('tag-header')
                .text( this.getString("tagHeader") )
                .appendTo(box);

            $.each(ramp.tags, function (i, tag) {
                var cell = $("<div></div>")
                    .addClass( self.cssName("tag") )
                    .appendTo(box);

                $("<span></span>")
                    .addClass( self.cssName("tag-label") )
                    .text(tag.term)
                    .click( function () {
                        self.search(tag.term);
                    })
                    .appendTo(cell)
            });
        },


        onSearch : function (e) {
            var q = this.find('input').val();
            this.search(q);
        },

        search : function (query) {
            this.player.search.query(query);
        },

        clear : function () {
            var r = this.scrollbar.body.empty();
            this.find('close').hide();
            this.find("tags").show();
        },

        onClose : function () {
            this.search('');
        },

        onSearchStart : function (e) {
            this.find('input').val(e.query);
        },

        onSearchResult : function (e, response) {
            this.clear();

            if( ! response.query.length ) {
                return;
            }

            this.find("tags").hide();

            this.find('close').show();
            var r = this.scrollbar.body;


            $("<div></div>")
                .addClass( this.cssName("result-count") )
                .text( this.getString("resultsHeader", {
                    count : response.results.length,
                    query : response.query.join(" ")
                }))
                .appendTo(r);

            var self = this;
            this.create("close")
                .text( this.getString("clear") )
                .bind("click", function (e){
                    self.onClose();
                })
                .appendTo(r);


            $.each(response.results, function (i, result){
                var el = self.create('result');
                var start = result.start;

                var words = [], offset;
                $.each(result.words, function (i, word){
                    var w = $('<span>')
                        .text(word.text);
                    if( word.match ){
                        offset = i;
                        w.addClass( self.cssName('match') )
                    }
                    words.push( w.get(0) );
                });


                var phrase = SearchBox.getPhrase(words, offset, self.config.context );
                start = result.words[phrase.start].start;

                el.data('start', start);

                var time = self.create('time')
                    .text( Ramp.format.seconds(start) )
                    .appendTo(el);

                $.each(phrase.words, function (i, word) {
                    el.append( word );
                    if( i + 1 < phrase.words.length )
                        el.append(" ");
                });

                var ellipses = self.getString("ellipsis");
                el.appendTo(r)
                    .prepend(ellipses)
                    .append(ellipses);

            });
        },

        getString : function (name, dict) {
            var template = $.extend({}, this.config.strings, dict);
            return MetaPlayer.format.replace( this.config.strings[name], template)
        },

        /* util */
        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className, tagName){
            if( ! tagName )
                tagName = "div";
            return $("<" + tagName + ">").addClass( this.cssName(className) );
        },

        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }
    };



})();
