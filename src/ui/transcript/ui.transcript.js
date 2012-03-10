

(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "transcript",
        focusMs : 750,
        fadeMs : 1000,
        opacity: 1,
        timestamps : false,
        breaks : false
    };

    // case insensative find
    $.expr[':'].tx_contains = function(a, i, m) {
        return $(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };

    var Transcript = function (target, player, options) {

        // two argument constructor (target, options)
        if( options == undefined && ! (player && player.play) ) {
            options = player;
            player = null;
        }
        if( typeof target == "string" && Transcript.instances[target] ) {
            var self = Transcript.instances[target];
            if(player && player.play ) {
                self.setPlayer( player );
            }
            return self;
        }

        if( !(this instanceof Transcript) )
            return new Transcript(target, player, options);

        this.target = target;
        this.setPlayer( player );
        this.config = $.extend(true, {}, defaults, options);

        this.init();
        this.addListeners();

        Transcript.instances[target] = this;
    };

    Transcript.instances = {};

    MetaPlayer.Transcript = Transcript;

    MetaPlayer.addPlugin("transcript", function (target, options) {
        this.cues.enable("transcript", { target : target }, { clone : "captions"} );
        this.transcript = Transcript( target, this.video, options);
    });


    Transcript.prototype = {
        init : function (){
            this.container = this.create();
            this.scroller = this.create('scroller');


            this._captions = {};
            $(this.target).append( this.container );
            $(this.container).append( this.scroller );

            this.scrollbar = MetaPlayer.scrollbar( this.container );
        },

        addListeners : function (e) {
            var self = this;
            this.container.bind("click touchstart", function (e){
                var node = $(e.target).parent( '.' + self.cssName('caption') );
                if( ! node.length )
                    return;
                var options = $(node).data('options');
                if( options ) {
                    self.player.currentTime = options.start;
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            this.container.bind("mouseenter touchstart", function (e){
                self.mousing = true;
            });
            this.container.bind("mouseleave touchend", function (e){
                self.mousing = false;
            });
        },

        setPlayer : function ( player ) {
            if( this.player )
                return;

            this.player = player;
            var self = this;
            $(this.player).bind("search", function (e) {
                var terms = e.originalEvent.data;
                self.search(terms);
            })
        },

        search : function (terms) {
            if( typeof terms == "string" )
                terms = terms.split(/\s+/);

            var searchCss = this.cssName("search");
            this.find('search').removeClass(searchCss);

            var self = this;
            var matches = [];
            $.each(terms, function (i, term) {
                var found = self.find("caption").find("." + self    .cssName('text') + " span:tx_contains(" + term + ")");
                found.addClass( searchCss );
            });
        },

        append :  function (options) {
            var el = this.create("caption", this.config.breaks ? 'div' : 'span');

            if( this.config.timestamps) {
                var ts = this.create("time", 'span');
                ts.text( options.start + "s");
                el.append(ts);
            }


            var self = this;
            var phrase = $('<span></span>')
                .addClass( this.cssName("text") )
                .click( function () {
                    self.player.currentTime = options.start;
                })
                .appendTo(el);

            var terms = options.text.split(/\s+/);
            $.each(terms, function (i, term) {
                $('<span></span>')
                    .text( term )
                    .appendTo(phrase);
                $(document.createTextNode(' '))
                    .appendTo(phrase);

            });

            el.data('options', options);
            el.css('opacity', this.config.opacity);
            this.scroller.append(el);
            this._captions[ options.start ] = el;
        },

        clear : function () {
            $(this.scroller).empty();
            this._captions = {};
            this.scrollbar.render();
        },

        focus : function (options) {
            var el = this._captions[options.start];
            el.stop().animate({opacity: 1}, this.config.focusMs);
            el.toggleClass( this.cssName('focus'), true );

            var top = el.position().top - (this.container.height() / 2);
            if( ! this.mousing ) {
                this.scrollbar.scrollTo(0 , top, 1000 );
            }
        },

        blur : function (options) {
            var el = this._captions[options.start];
            el.stop().animate({opacity: this.config.opacity}, this.config.fadeMs);
            el.toggleClass( this.cssName('focus'), false )
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
        Popcorn.plugin( "transcript" , {

            _setup: function( options ) {
                var t = Transcript(options.target, this.media);
                t.append( options );
            },

            start: function( event, options ){
                var t = Transcript(options.target);
                t.focus(options)
            },

            end: function( event, options ){
                var t = Transcript(options.target);
                t.blur(options)

            },

            _teardown: function( options ) {
                var t = Transcript(options.target);
                t.clear();
            }
        });
    }

})();
