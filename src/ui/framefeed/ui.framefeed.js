(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-ff",
        filterMsec : 500,
        revealMsec : 1500,
        duplicates : false,
        scrollbar : true,
        renderAnnotations : true,
        baseUrl : ""
    };

    /**
     * FrameFeed is a PopcornJS plugin for rendering MetaQ framefeed events. The UI is rendered
     * as a feed with iframe panels prepended to the top of the list, animating down. The feed can
     * be filtered by a string match against the panel's tag property.
     * @name UI.FrameFeed
     * @class The MetaPlayer framefeed widget and plugin for PopcornJS
     * @constructor
     * @param {Element} id The DOM target to which the framefeed will be added.
     * @param {Object} [options]
     * @param {Boolean} [options.duplicates=false] If false, will not render duplicates of rendered cards
     * @param {Boolean} [options.renderAnnotations=true] If the MetaPlayer controlbar is present, will render
     * timeline annotations indicating when FrameFeed events will fire.
     * @param {Number} [options.filterMsec=750] The animation duration, in msec, for when a filter is applied.
     * @param {Number} [options.revealMsec=1500] The animation duration, in msec, for when a panel is added.
     * @param {String} [options.baseUrl=""] A prefix to any urls in the feed. Can be used if the feed contains relative URLS.
     * @example
     * # shown with all default options:
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .framefeed("#myfeed", {
     *          duplicates: false,
     *          filterMsec: 500,
     *          revealMsec: 1500,
     *          renderAnnotations: true
     *          baseUrl : ""
     *     })
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/GCUrq/">Live Demo</a>
     * @see MetaPlayer#framefeed
     * @see Popcorn#framefeed
     */
    var FrameFeed = function (target, options) {

        var t = $(target);
        target = t.get(0);

        // return intance if exists
        if( target && FrameFeed.instances[ target.id ] ){
            return FrameFeed.instances[ target.id ];
        }

        if( ! (this instanceof FrameFeed) )
            return new FrameFeed(target, options);

        this.config = $.extend(true, {}, defaults, options);

        this.target = $("<div></div>")
            .addClass( this.cssName("scroller") )
            .width("100%")
            .height("100%")
            .appendTo(target);

        this.scrollbar = MetaPlayer.scrollbar(target, { disabled : ! this.config.scrollbar });
        this.seen = {};
        this.init();

        MetaPlayer.dispatcher(this);

        FrameFeed.instances[ target.id ] = this;
    };

    FrameFeed.instances = {};

    /**
     * @name MetaPlayer#framefeed
     * @function
     * @description
     * Creates a {@link UI.FrameFeed} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the framefeed will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .framefeed("#myfeed")
     *     .load();
     * @see UI.FrameFeed
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("framefeed", function (target, options){
        this.cues.enable("framefeed", { target : target });
        this.framefeed = FrameFeed(target, options);
        this.framefeed.player = this;
    });

    MetaPlayer.framefeed = FrameFeed;

    FrameFeed.prototype = {

        init : function () {
            var t = $(this.target);
            this.items = [];
            t.addClass( this.cssName() );
        },

        filter: function (query) {
            this.hideAll();
            this.query = query;
            this.render();
            this.scrollbar.scrollTo(0);

        },

        hideAll : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.hideItem(val);
            });
            this.dispatch("size")
        },

        render : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.renderItem(val);
            });
            this.scrollbar.render();
        },

        filtered : function (obj) {
            return ( this.query && (! obj.tags || ! obj.tags.match(this.query) ) );
        },

        setup :  function (options) {
            var self = this;
            // render annotations if asked
            if( this.config.renderAnnotations && this.player && this.player.controls ){
                this.player.controls.addAnnotation(options.start, null, options.topic || '', 'metaq');
            }
        },

        focus : function (obj) {
            this.render();
            obj.active = true;
            this.frame(obj, true);
        },

        blur : function (obj) {
            obj.active = false;
            this.hideItem(obj);
            this.scrollbar.render();
        },


        frame : function (obj, duration) {
            if( typeof obj == "string" ){
                obj = { url :  obj };
            }

            var url = obj.url;
            if(! url.match('^http') && this.config.baseUrl )
                url = this.config.baseUrl + url;


            if( this.seen[url] && this.seen[url].start != obj.start && ! this.config.duplicates) {
                return;
            }
            this.seen[url] = obj;

            var self = this;
            var revealMsec = duration == null ? this.config.revealMsec : duration;
            if( ! obj.item ){
                obj.loadAnimate = true;
                var frame = $("<iframe frameborder='0'></iframe>")
                    .attr("src", url)
                    .attr("scrolling", "no")
                    .attr("marginheight", 0)
                    .attr("marginwidth", 0)
                    .bind("load", function () {
                        obj.loaded = true;
                        self.renderItem(obj,
                            obj.loadAnimate ? revealMsec : null);
                    })
                    .attr("height", obj.height);

                obj.item = $("<div></div>")
                    .addClass( this.cssName("box") )
                    .prependTo( this.target )
                    .append(frame);

                this.hideItem( obj );;
                this.items.push(obj);
            }
            else {
                this.renderItem(obj, revealMsec);
            }
        },

        hideItem : function (obj) {
            obj.item
                .height(0)
                .hide()
                .css('opacity', 0)
        },

        renderItem : function (obj, duration) {
            obj.item.stop();
            obj.loadAnimate = false;

            if( ! obj.active || ! obj.loaded || this.filtered(obj) ){
                this.hideItem(obj);
                return;
            }

            var rendered = obj.item.css('opacity') == 1;
            if( rendered ){
                return;
            }
            obj.item.show();

            var scroll = this.scrollbar.scrollTop();
            var self = this;

            if( scroll > 0 || ! duration ){
                // fade in without height animation
                obj.item
                    .height(obj.height)
                    .animate({
                        opacity: 1
                    }, this.config.filterMsec );

                if( scroll && duration) {
                    this.scrollbar.scrollTo( 0 , scroll + obj.height );
                }
                else {
                    this.scrollbar.render();
                }
            }
            // else scroll and fade in
            else {
                obj.item.animate({
                    height: obj.height,
                    opacity: 1
                }, duration, function () {
                    self.scrollbar.render();
                });
            }
            self.dispatch("size");
        },

        clear : function () {
            $(this.target).empty();
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
         * Schedules a framefeed card to be rendered and focused at a given time.
         * @name Popcorn#framefeed
         * @function
         * @param {Object} config
         * @param {Element} config.target The target element for the framefeed
         * @param {String} config.height A height for the feed item
         * @param {String} config.url An Ajax url for Iframe content.
         * @param {Number} config.start Start time text, in seconds.
         * @example
         *  var pop = Popcorn(video);
         *
         *  # optional configuration step
         *  MetaPlayer.framefeed("#myfeed", {
         *          duplicates: false,
         *  });
         *
         * pop.framefeed({
         *     target : "#myfeed",
         *     start : 1,
         *     height: 200,
         *     url :"http://www.ramp.com/"
         * });
         */
        Popcorn.plugin( "framefeed" , {

            _setup: function( options ) {
                FrameFeed(options.target).setup(options);
            },

            start: function( event, options ){
                FrameFeed(options.target)
                    .focus(options);
            },

            end: function( event, options ){
                FrameFeed(options.target)
                    .blur(options);
            },

            _teardown: function( options ) {
                FrameFeed(options.target)
                    .clear();
            }
        });
    }


})();
