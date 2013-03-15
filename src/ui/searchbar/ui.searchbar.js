

(function () {

    var $ = jQuery;

    var defaults = {
        inputLabel : "Search in video",
        nextLabel : "NEXT:",
        cssPrefix : "mp-searchbar",
        spacingSec : 0,
        maxNext : 0,
        fadeOutPx : 21,
        cueType : "tags",
        seekOffset : -.5
    };

    var SearchBar = function (target, player, options) {

        if( !(this instanceof SearchBar) )
            return new SearchBar(target, player, options);

        this.player = player;
        this.target = $(target);

        this.config = $.extend(true, {}, defaults, options);

        this.createMarkup();
        this.addListeners();
        this.clear();

    };

    MetaPlayer.SearchBar = SearchBar;

    MetaPlayer.addPlugin("searchbar", function(target, options) {
        this.searchbar = SearchBar(target, this, options);
    });

    SearchBar.prototype = {

        createMarkup : function (){
            this.ui = {};
            $(this.target).addClass('mpf-searchbar');

            // Next Up
            this.nextup = $('<div>')
                .addClass("mpf-searchbar-nextup")
                .css('opacity', 0)
                .appendTo(this.target);

            $('<div>')
                .addClass("mpf-searchbar-nextup-label")
                .html(this.config.nextLabel + "&nbsp;")
                .appendTo(this.nextup);

            this.counter = $('<div>')
                .addClass("mpf-searchbar-nextup-countdown")
                .appendTo(this.nextup);

            // Search Form
            var searchform = $('<div>')
                .addClass("mpf-searchbar-search")
                .appendTo(this.target);

            var inputbox = $('<div>')
                .addClass("mpf-searchbar-search-inputbox")
                .appendTo(searchform);

            this.input = $('<input>')
                .addClass("mpf-searchbar-search-input")
                .attr('placeholder', this.config.inputLabel )
                .appendTo(inputbox)
                .keypress( this.bind( this.onInputKey ));

            $('<div>')
                .addClass("mpf-searchbar-search-submit")
                .appendTo(searchform)
                .click( this.bind( this.onInput ));


            // Tags
            this.tags = $('<div>')
                .addClass("mpf-searchbar-tags")
                .appendTo(this.target);

            this.scroll = $('<div>')
                .addClass("mpf-searchbar-tags-scroll")
                .appendTo(this.tags);

            $('<div>')
                .addClass("mpf-searchbar-tags-fade")
                .appendTo(this.target);

            // Navigation
            this.nav = $('<div>')
                .addClass("mpf-searchbar-nav")
                .appendTo(this.target);

            this.ui.prev = $('<div>')
                .addClass("mpf-searchbar-nav-prev")
                .appendTo(this.nav)
                .click( this.bind(this.previous) );

            this.ui.next =$('<div>')
                .addClass("mpf-searchbar-nav-next")
                .appendTo(this.nav)
                .click( this.bind(this.next) );


            // Search Results
            this.results = $('<div>')
                .addClass("mpf-searchbar-results")
                .appendTo(this.target);

            $('<div>')
                .addClass("mpf-searchbar-results-clear")
                .appendTo(this.results)
                .click( this.bind( function () {
                this.player.search.query('');
            }));

            this.query = $('<div>')
                .addClass("mpf-searchbar-results-query")
                .appendTo(this.results);

            this.resultsFound = $('<div>')
                .addClass("mpf-searchbar-results-label")
                .html("found at: ")
                .appendTo(this.results);

            this.resultsNotFound = $('<div>')
                .addClass("mpf-searchbar-results-label")
                .html("not found. ")
                .appendTo(this.results);

            this.resultsList = $('<div>')
                .addClass("mpf-searchbar-results-list")
                .appendTo(this.results);

            $('<div>')
                .addClass("mpf-searchbar-results-fade")
                .appendTo(this.results);

        },

        renderTag : function ( text, time ) {
            var first = ! this.scroll.children().length;
            if( ! first )
                $('<div>')
                    .html("&#x2022;")
                    .addClass("mpf-searchbar-tag-spacer")
                    .appendTo(this.scroll);

            return $('<div>')
                .append(  $("<div>").addClass("mpf-searchbar-tag-label").text(text) )
                .data("start", time)
                .data("term", text)
                .addClass("mpf-searchbar-tag")
                .appendTo(this.scroll);
        },

        addListeners : function () {
            this.player.cues.addEventListener(MetaPlayer.Cues.CUES, this.bind( this.onCues) );

            this.player.video.addEventListener("timeupdate", this.bind( this.renderTime ) );

            this.target.delegate(".mpf-searchbar-tag, .mpf-searchbar-results-item", "mouseenter",
                this.bind( this.onPreviewStart ) );

            this.target.delegate(".mpf-searchbar-tag, .mpf-searchbar-results-item", "mouseleave",
                this.bind( this.onPreviewStop ) );

            this.scroll.delegate(".mpf-searchbar-tag", "click", this.bind( function (e) {
                var time = $(e.currentTarget).data('start');
                this.player.video.currentTime = time + this.config.seekOffset;

                var term = $(e.currentTarget).data('term');
                this.player.search.query(term);
                this.input.val(term);
            }));

            this.resultsList.delegate(".mpf-searchbar-results-item", "click", this.bind( function (e) {
                var time = $(e.currentTarget).data('start');
                this.player.video.currentTime = time + this.config.seekOffset;
            }));

            this.player.search.listen(MetaPlayer.Search.QUERY, this.onSearch, this);
            this.player.search.listen(MetaPlayer.Search.RESULTS, this.onResults, this);
        },

        onPreviewStart : function (e) {
            var time = $(e.currentTarget).data('start');
            if( this.player.tracktip && this.player.tracktip.open )
                this.player.tracktip.open(time);
        },
        onPreviewStop : function (e) {
            if( this.player.tracktip && this.player.tracktip.close )
                    this.player.tracktip.close();
        },

        onCues : function (e) {
            this.clear();
            var tags = this.player.cues.getCues( this.config.cueType );
            this.tagData = [];
            var last;
            $.each(tags, this.bind( function (i, tag){
                var data = $.extend({}, tag);
                if( last && (this.getTerm(data) == this.getTerm(last) || data.start < last.start + this.config.spacingSec) )
                    return;
                last = tag;
                data.el = this.renderTag( this.getTerm(tag), tag.start);
                data.index = this.tagData.length;
                this.tagData.push(data);
            }));

            this.nextup.css('opacity', this.tagData.length ? 1 : 0);
            this.renderTime();
        },


        renderTime : function ( seconds ) {
            var time = seconds;

            if( typeof seconds != "number")
                 time = this.player.video.currentTime || 0;

            // cache hit
            if(this._renderCache
                && (time > this._renderCache.start && (time < this._renderCache.end || ! this._renderCache.end) )){
                this.renderNext(time);
                return;
            }

            if( ! this.tags.is(":visible") )
                return;

            this._renderCache = null;

            this.scroll.children('.mpf-searchbar-tag-selected')
                .removeClass('mpf-searchbar-tag-selected');

            if( ! (this.tagData && this.tagData.length))
                return;

            var tag, next, i = -1;
            while(i < this.tagData.length){
                tag = this.tagData[i];
                next = this.tagData[i+1];
                if( ! next || next.start > time )
                    break;
                i++;
            }
            // cache tag bounds so we can skip rendering in each timeupdate loop
            this._renderCache = {
                start : 0,
                index : i
            };

            if( tag ) {
                tag.el.addClass('mpf-searchbar-tag-selected');
                this._renderCache.term = tag.term;
                this._renderCache.start = tag.start;
                this.centerTag(tag.index);
            }
            else
                this.centerTag(-1);


            if( next ) {
                this._renderCache.end = next.start;
            }

        },

        renderNext : function (time) {

            if( ! this._renderCache )
                return;

            var next_sec = Math.round(this._renderCache.end - time) || null;

            if( this._renderCache.counter == next_sec )
                return;

            if( ! this.config.maxNext || next_sec >  this.config.maxNext )
                next_sec = null;

            this.counter.text(
                MetaPlayer.format.seconds(next_sec, { minutes: false, seconds: false })
            );

            if( ! this._renderCache.counter )
                this.nextup.children().show();

            this._renderCache.counter = next_sec;
        },

        centerTag : function (index) {
            var tag = this.tagData[index];
            var offset = 0;

            var middle = (this.tags.width() - this.config.fadeOutPx) / 2;
            if( tag ) {
                var center = tag.el.position().left + (.5 * tag.el.width());
                if( center < middle )
                    offset = 0;
                else
                    offset = center - middle;
            }

            this.scrollTo( offset );
        },

        next : function ( ) {
            var i = 0, tag, offset;
            var view = this.tags.width() - this.config.fadeOutPx;
            var max = view - this.scroll.position().left;
            while(this.tagData && i < this.tagData.length) {
                tag = this.tagData[i++];
                if( tag.el.width() + tag.el.position().left > max )  {
                    offset = tag.el.position().left;
                    break;
                }
            }
            if( offset )
                this.scrollTo( offset );
        },

        previous : function () {
            var view = this.tags.width() - this.config.fadeOutPx;
            var i = this.tagData.length -1, tag;
            var min = -this.scroll.position().left;
            var offset;
            while( i >= 0  ) {
                tag = this.tagData[i];
                if( tag.el.position().left < min ){
                    offset = tag.el.position().left + tag.el.width() - view;
                    if( offset < 0 )
                        offset = 0;
                    break;
                }
                i--;
            }
            if( offset != null )
                this.scrollTo( offset );
        },

        scrollTo: function (x, now) {
            if ( now )
                this.scroll.stop().css('left', -x);
            else
                this.scroll.stop().animate({ 'left' : -x });

            var view = this.tags.width() - this.config.fadeOutPx;
            var max = view;
            if( this.tagData && this.tagData.length ){
                var last = this.tagData[this.tagData.length-1].el;
                max = last.width() + last.position().left;
            }

            this.ui.prev.css('visibility', x > 0 ? 'visible' : 'hidden');
            this.ui.next.css('visibility', x + view < max  ? 'visible' : 'hidden');
        },

        search : function (query) {
            this.player.search.query(query);
        },

        clear : function () {
            this.counter.hide();
            this.scroll.empty();
            this.scrollTo(0, true);
            this._renderCache = null;
            this.toggleResults(false);
        },

        /* results */

        onInputKey : function (e) {
            if ( e.which == 13 ) {
                this.onInput();
                e.preventDefault();
            }
        },

        onInput : function () {
            var query = this.input.val();
            this.player.search.query(query)
        },

        toggleResults : function ( results ) {
            this.results.toggle( results );
            this.nextup.toggle( !results );
            this.tags.toggle( !results );
            this.nav.toggle( !results );
            if(! results ){
                this.input.val('');
            }
        },

        onSearch : function (e) {
            this.query.text(e.query);
            this.resultsList.empty();
        },

        onResults : function (e) {
            var results = e.data.results;
            if(! e.query ) {
                this.toggleResults(false);
                return;
            }

            var found = Boolean(e.data.results.length);
            this.resultsFound.toggle(found);
            this.resultsNotFound.toggle(!found);

            this.query.text(e.query);
            $.each(results, this.bind( function(i, result){
                $("<div></div>")
                    .data("start", result.start)
                    .text( MetaPlayer.format.seconds(result.start) )
                    .addClass("mpf-searchbar-results-item")
                    .appendTo(this.resultsList)
            }));
            this.toggleResults(true);
        },

        /* util */

        getTerm : function (options) {
            return options.term || options.topic || options.text || '';
        },

        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        },

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
