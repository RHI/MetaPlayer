

(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        duplicates: false,
        cssPrefix : "mp-carousel",
        slideDurationMs : 750,
        renderAnnotations : true
    };

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

            this.target.addClass( this.cssName() );
            this.render();

            var self = this;
            var nav = this.find( this.cssName('nav') ).click( function (e) {
                self._navClick(e);
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
            if( this.config.renderAnnotations && this.player && this.player.controls ){
                this.player.controls.addAnnotation(options.start, null, options.topic || '', 'metaq');
            }

            // prevent duplicate cards
            if(! this.config.duplicates ){
                if( this._uniques[ id ] != null ){
                    options.index = this._uniques[ id ];
                    return;
                }
                this._uniques[ id ] = options.index;
            }

            var card = $("<div></div>")
                .addClass( this.cssName("content"))
                .html(options.html || '')
                .appendTo(this.scroller);


            var nav = $("<div></div>")
                .addClass( this.cssName("nav") )
                .attr('title', options.topic || '' )
                .data("index", options.index  )
                .click( function (e) {
                    self._navClick(e);
                })
                .appendTo( this.find('navbar')  );

            if( options.url ) {
                $("<div></div>")
                    .addClass( this.cssName('loading') )
                    .appendTo(card);

                card.load( options.url, function(response, status, xhr) {
                    if (status == "error")
                        card.empty().addClass( self.cssName("error") );
                });
            }


            this.render();

        },

        focus : function (options) {
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
