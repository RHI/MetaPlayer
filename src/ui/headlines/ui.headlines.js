/**
 * RSS Headlines widget
 */
(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-hl",
        filterMsec : 500,
        revealMsec : 1500,
        duplicates : false,
        baseUrl : ""
    };

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
