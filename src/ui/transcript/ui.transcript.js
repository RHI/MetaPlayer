

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

    /**
     * Transcript is a PopcornJS plugin for rendering captions in paragraph-form, with each caption scrolled into
     * view and highlighted as it is activated. Text can be clicked to seek to corresponding parts of the video.
     * @name UI.Transcript
     * @class The MetaPlayer moving transcript widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the transcript will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.breaks=false] If true, each caption will be on its own line.
     * @param {Boolean} [options.timestamps=false] If true, ill prefix each caption with a timestamp
     * @param {Number} [options.focusMs=750] The fade in animation duration when a caption becomes active
     * @param {Number} [options.fadeMs=750] The fade out animation duration when a caption becomes inactive
     * @param {Number} [options.opacity=1] The opacity for inactive captions
     * @example
     * # with default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .transcript('#mytranscript', {
     *         breaks: true,
     *         timestamps: true,
     *         focusMs: 1000,
     *         fadeMs : 750,
     *         opacity: 1
     *      })
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/CcWEX/">Live Example</a>
     * @see MetaPlayer#transcript
     * @see Popcorn#transcript
     * @requires  metaplayer-complete.js, popcorn.js
     */
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

    /**
     * @name MetaPlayer#transcript
     * @function
     * @description
     * Creates a {@link UI.Transcript} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the transcript will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .transcript("#mytranscript")
     *     .load();
     * @see UI.Transcript
     * @requires  metaplayer-complete.js, popcorn.js
     */
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
            /**
             * Adds a caption to be added to the tracscript, and scheduled to be focused at a given time.
             * @name Popcorn#transcript
             * @function
             * @param {Object} config
             * @param {Element} config.end The target container for the caption text.
             * @param {String} config.text The caption text.
             * @param {Number} config.start Start time text, in seconds.
             * @param {Number} [config.end] End time text, in seconds, if any.
             * @example
             *  # without MetaPlayer Framework
             *  var pop = Popcorn(video);
             *
             *  # optional configuration step
             *  MetaPlayer.transcript('#mytranscript', { breaks: true })
             *
             *  pop.transcript({
             *      start: 0,
             *      end : 2,
             *      text : "The first caption"
             *      target : "#mytranscript"
             *  });
             *  @see UI.Transcript
             */
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
