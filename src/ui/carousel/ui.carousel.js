(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        duplicates: false,
        refocus: true,
        cssPrefix : "mp-carousel",
        slideDurationMs : 750,
        renderAnnotations : true
    };

    /**
     * Carousel is a PopcornJS plugin for rendering MetaQ carousel events. The UI is rendered
     * as a window with sliding panels, controled through a tab control consisting of dots.
     * @name UI.Carousel
     * @class The MetaPlayer carousel widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the carousel will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.duplicates=false] If true, tile out duplicates rather than consolidating them into
     * one card.
     * @param {Boolean} [options.renderAnnotations=true] If the MetaPlayer controlbar is present, will render
     * timeline annotations indication when Carousel events will fire.
     * @param {Number} [options.slideDurationMs=750] The animation duration, in msec.
     * @param {Boolean} [options.refocus=true] If duplicates are consolidated (disable), refocus the single card on
     * subsequent events.
     * @example
     * # with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .carousel("#mycarousel", {
     *          duplicates: false,
     *          slideDurationMS: 750,
     *          renderAnnotations: true
     *     })
     *     .load();
     * @see MetaPlayer#carousel
     * @see Popcorn#carousel
     */
    var Carousel = function (id, options) {

        // return any previous instance for this player
        if(  Carousel.instances[id] ) {
            return Carousel.instances[id];
        }

        if( ! (this instanceof Carousel) )
            return new Carousel(id, options);

        this.config = $.extend({}, defaults, options);

        this.init(id);

        Carousel.instances[id] = this;
    };

    if( ! window.RAMP  ) {
        window.RAMP = {};
    }
    MetaPlayer.carousel = function  (target, options) {
        return new Carousel(target, options);
    };

    /**
     * @name MetaPlayer#carousel
     * @function
     * @description
     * Creates a {@link UI.Carousel} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the carousel will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .carousel("#mycarousel")
     *     .load();
     * @see UI.Carousel
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("carousel", function (target, options){
        var popcorn = this.popcorn;
        this.carousel = Carousel(target, options);
        this.carousel.player = this;
        this.cues.enable( 'carousel', { target: target }, {sequence: true });
    });


    Carousel.instances = {};
    Carousel._count = 0;


    Carousel.prototype = {
        init : function (id){

            this.target = $(id);
            this.scroller = $("<div></div>").addClass( this.cssName('scroller') ).appendTo(this.target);
            this.navbar = $("<div></div>").addClass( this.cssName('navbar') ).appendTo(this.target);
            this._uniques = {};
            this._autoscroll = true;


            this.target.addClass( this.cssName() );
            this.render();

            var self = this;
            var nav = this.find( this.cssName('nav') ).click( function (e) {
                self._navClick(e);
            });

            this.target.bind("mouseenter", function (e){
                self._autoscroll = false;
            });
            this.target.bind("mouseleave", function (e){
                self._autoscroll = true;
            });

            this.scroller.bind("touchstart", function (e) {
                self._dragStart(e);
            });

            this.scroller.bind("touchmove", function (e) {
                self._dragMove(e);
            });
            this.scroller.bind("touchend",function (e) {
                self._dragStop(e);
            });
        },

        _dragStart : function (e) {
            this.dragging = true;
            this.scroller.stop();
            this._dragStartPos = this.eventX(e);
            this._dragStartScroll = this.scroller.scrollLeft();
            e.preventDefault();
        },

        _dragMove : function (e) {
            var x = this.eventX(e) - this._dragStartPos- this._dragStartScroll;
            this.scroller.stop();
            this.scroller.scrollLeft(-x);
        },

        _dragStop : function (e) {
            this.dragging = false;
            this.snap();
        },

        _navClick : function (e){
            var i = $(e.currentTarget).data('index')
            this.scrollTo(i);
            this._highlight(i);
        },

        render : function () {
            var panels = this.find('content');
            $.each( panels, function (i, val){
                var panel = $(val);
                panel.css('position', 'absolute');
                panel.css('left', (i * 100) + "%" );
            });
            this._highlight()
        },

        scrollTo : function (i) {
            var to = this.target.width() * i;
            var self = this;
            this.scroller.stop().animate({
                    scrollLeft: to
                }, this.config.slideDurationMs, "swing",
                function () {
                    self._highlight()
                }
            );
        },

        currentIndex : function () {
            return this.scroller.scrollLeft() /  this.target.width();
        },

        snap : function () {
            this.scrollTo( Math.round( this.currentIndex() ) )
        },

        _highlight : function ( index ) {
            var highlightClass = this.cssName("selected");

            var i = (index != null) ? index :  Math.round( this.currentIndex() );

            this.find("selected").removeClass( highlightClass );

            $(this.find('nav')[i]).addClass( highlightClass );
        },

        eventX : function (e) {
            var pageX = e.pageX || e.originalEvent.touches[0].pageX;
            return pageX - this.target.offset().left;

        },

        // Popcorn :
        setup :  function (options) {
            var self = this;

            options.index = this.find('nav').length;
            var id = options.url || options.html;

            // render annotations if asked
            if( this.config.renderAnnotations && this.player
                && this.player.controls
                && this.player.controls.addAnnotation ){
                this.player.controls.addAnnotation(options.start, null, options.topic || '', 'metaq');
            }

            // prevent duplicate cards
            if(! this.config.duplicates ){
                if( this._uniques[ id ] != null ){
                    options.index = this._uniques[ id ];
                    options.duplicate = true;
                    return;
                }
                this._uniques[ id ] = options.index;
            }

            var card = $("<div></div>")
                .addClass( this.cssName("content"))
                .appendTo(this.scroller);


            var nav = $("<div></div>")
                .addClass( this.cssName("nav") )
                .attr('title', options.topic || '' )
                .data("index", options.index  )
                .click( function (e) {
                    self._navClick(e);
                })
                .appendTo( this.find('navbar')  );

            if( options.html) {
                if( options.html.match(/^http\:\/\//) ) {
                    card.html('');
                    $("<div></div>")
                        .addClass( this.cssName('loading') )
                        .appendTo(card);

                    $.ajax(options.html, {
                        dataType : "text",
                        timeout : 15000,
                        error : function (jqXHR, textStatus, errorThrown) {
                            if (status == "error")
                                card.empty().addClass( self.cssName("error") );
                        },
                        success : function (response, textStatus, jqXHR) {
                            card.html(response);
                        }
                    });
                }
                else {
                    card.html(options.html || '')
                }
            }
            if( options.url ) {
                var frame = $("<iframe></iframe>")
                    .attr("frameborder", "0")
                    .addClass( this.cssName('loading') )
                    .appendTo(card);

                frame.attr('src', options.url);
            }


            this.render();

        },

        focus : function (options) {
            if(! this._autoscroll )
                   return;

            if( options.duplicate && ! this.config.refocus )
                return;

            this.scrollTo( options.index );
        },

        blur : function (options) {
        },

        clear : function (options) {
            this.navbar.empty();
            this.scroller.empty();
            this._uniques = {};
        },

        // utils
        find : function (className){
            return this.target.find("." + this.cssName( className) );
        },
        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }
    };

    if( Popcorn ) {
        /**
         * Schedules a carousel card to be rendered and focused at a given time.
         * @name Popcorn#carousel
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the carousel
         * @param {String} config.topic The tooltip to be used on the navigation dot
         * @param {String} [config.html] The HTML content of the panel
         * @param {String} [config.url] An alternate to <code>html</code, and Ajax url for HTML content.
         * @param {Number} config.start Start time text, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         *  # optional configuration step
         *  MetaPlayer.carousel("#carousel", {
         *          duplicates: false,
         *  });
         *
         *  pop.carousel({
         *      target: "#carousel"
         *      topic : "one!"
         *      html : "<b>first card</b>",
         *      start: 1
         *  });
         *  pop.carousel({
         *      target: "#carousel"
         *      topic : "two!"
         *      url : /two.html",
         *      start: 10,
         *  });
         */
        Popcorn.plugin( "carousel" , {
            _setup: function( options ) {
                Carousel(options.target).setup(options)
            },

            start: function( event, options ){
                Carousel(options.target).focus(options)
            },

            end: function( event, options ){
                Carousel(options.target).blur(options);
            },

            _teardown: function( options ) {
                Carousel(options.target).clear();
            }
        });
    }

})();
