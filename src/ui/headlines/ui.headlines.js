/**
 * RSS Headlines widget
 */
(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-hl",
        baseUrl : ""
    };

    /**
     * Headlines is a page widget which populates with a set of links harvested from a RSS feed. RSS
     * feeds can be specified for various times in the video, re-populating the link in the page.
     * @name UI.Headlines
     * @class The MetaPlayer headlines widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the headlines will be added.
     * @param {Object} [options]
     * @param {String} [baseUrl=""] An options base url to prepend to item links in the feed.
     * @example
     * # shown with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .headlines("#headlines", {
     *          baseUrl : "/feeds/"
     *     })
     *     .load();
     * @see MetaPlayer#framefeed
     * @see Popcorn#framefeed
     */
    var Headlines = function (target, options) {
        var t = $(target);
        target = t.get(0);

        // return intance if exists
        if( target && Headlines.instances[ target.id ] ){
            return Headlines.instances[ target.id ];
        }

        if( ! (this instanceof Headlines) )
            return new Headlines(target, options);

        this.config = $.extend(true, {}, defaults, options);
        this.seen= {};
        this.init(target);

        Headlines.instances[ target.id ] = this;
    };

    Headlines.instances = {};

    /**
     * @name MetaPlayer#headlines
     * @function
     * @description
     * Creates a {@link UI.Headlines} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the headlines will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .headlines("#headlines")
     *     .load();
     * @see UI.Headlines
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("headlines", function (target, options){
        this.cues.enable("headlines", { target : target });
        this.headlines = Headlines(target, options);
    });

    MetaPlayer.Headlines = Headlines;

    Headlines.prototype = {

        init : function (parent) {

            this.target = $("<div></div>")
                .addClass( this.cssName() )
                .appendTo(parent);

            this.title = $("<div></div>")
                .addClass( this.cssName('title') )
                .appendTo( this.target );

            var nav = $("<div></div>")
                .addClass( this.cssName('nav') )
                .appendTo( this.target );

            $("<span></span>")
                .addClass( this.cssName('prev') )
                .text("<")
                .appendTo( nav );

            $("<span></span>")
                .addClass( this.cssName('next') )
                .text(">")
                .appendTo( nav );

            this.scroll = $("<div></div>")
                .addClass( this.cssName('scroll') )
                .appendTo( this.target );


            this.items = [];

        },

        render : function  () {
            var self = this;
        },

        rss : function (url, title) {

            if(! url.match('^http') && this.config.baseUrl )
                url = this.config.baseUrl + url;

            $.ajax(url, {
                dataType : "xml",
                timeout : 15000,
                context: this,
                data : {},
                error : function (jqXHR, textStatus, errorThrown) {
                    console.error("Load RSS error: " + textStatus + ", url: " + url);
                },
                success : function (response, textStatus, jqXHR) {
                    this.onRSS( response, title);
                }
            });
        },

        onRSS : function (response, title) {

            this.clear();

            this.title.text( title || $(response).find('channel').children('title').text() )

            var items = $(response).find('item');

            var self = this;
            $.each(items, function (i, node ) {
                var item = $(node);
                self.addItem(
                    item.find('title').text(),
                    item.find('link').text()
                );
            })

        },

        addItem : function (title, link){
            $("<a></a>")
                .text(title)
                .addClass( this.cssName('item') )
                .attr('href', link)
                .appendTo(this.scroll);

            $( document.createTextNode(" ") ).appendTo(this.scroll);
        },

        focus : function (obj) {
            this.rss(obj.url, obj.title);
        },

        blur : function (obj) {
            this.clear();
        },

        clear : function () {
            this.scroll.empty();
            this.title.empty();

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

    if( Popcorn ) {
        /**
         * Schedules a headline links to be rendered and a given time.
         * @name Popcorn#headlines
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the headlines
         * @param {String} config.height A height for the feed item
         * @param {String} config.url An Ajax url for RSS source (subject to ajax cross-domain restrictions)
         * @param {Number} config.start Start time, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         * pop.headlines ({
         *     target : "#myheadlines",
         *     url : "sample-rss.xml",
         *     start : 10
         * });
         *
         */
        Popcorn.plugin( "headlines" , {

            _setup: function( options ) {
                Headlines(options.target);
            },

            start: function( event, options ){
                Headlines(options.target)
                    .focus(options);
            },

            end: function( event, options ){
                Headlines(options.target)
                    .blur(options);
            },

            _teardown: function( options ) {
                Headlines(options.target)
                    .clear();
            }
        });
    }


})();
