(function () {

    var $ = jQuery;

    // stand-alone mode
    if( ! window.MetaPlayer )
          window.MetaPlayer = {};

    var defaults = {
        cssPrefix : "mp",
        adoptVideo : true,
        sizeVideo : true,
        sizeMsec : 250
    };

    /**
     * @name API.Layout
     * @class Manages the MetaPlayer DOM elements, video & panel arrangment.
     * @constructor
     * @param {String|Element} target The DOM element to decorate, or jQuery selector there of.
     * @param {Object} [options]  A dictionary of configuration properties.
     * @param {Boolean} [options.adoptVideo=true]  If no parent element is a "metaplayer" class,
     * create one and re-parent the video.
     * @param {Boolean} [options.sizeVideo=true]  Allow re-sizing of the video element.
     * @param {Number} [options.sizeMsec=250] When animating panels, the duration of the animation.
     */
    MetaPlayer.Layout = function (target, options){
        this.config = $.extend({}, defaults, options);

        this.target = $(target).get(0);
        this.panels = [];
        MetaPlayer.dispatcher(this);

        /**
         * The root DOM element of the MetaPlayer instance, with class="metaplayer".
         * @name API.Layout#base
         * @type {Element}
         */

        /**
         * A container for video overlays.
         * @name API.Layout#stage
         * @type {Element}
         */
        this.target = $(target)[0]; // normalize
        this._setup();

        var self = this;
        $(document.documentElement).bind('fullscreenchange webkitfullscreenchange', function (e){
            self.onFullScreen(e);

        });
        $(document).bind('mozfullscreenchange', function (e){
            self.onFullScreen(e);
        });

        $(window).bind('resize', function (e) {
            if( self.isMaximized )
                self.maximize();
        });

        $(window).bind("mousewheel DOMMouseScroll touchmove", function (e) {
            if( self.isMaximized ) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        this.isFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    };

    MetaPlayer.layout = function  (target, options){
        return new MetaPlayer.Layout(target, options);
    };


    MetaPlayer.Layout.PANEL_OPTIONS = {
        top : 0,
        right : 0,
        bottom: 0,
        left: 0,
        enabled : true,
        video : true
    };

    MetaPlayer.Layout.prototype =  {

        /**
         * Adds a panel to the layout.  A panel is something that should indent the video from the
         * DOM bounding box, usually a control bar or info panel.
         * @name API.Layout#addPanel
         * @function
         * @param {Object} panelConfig Contains configuration.
         * @param panelConfig.id A unique name for the panel, used for later access.
         * @param [panelConfig.top=0] The top video margin required for panel to not cover video.
         * @param [panelConfig.right=0] The right video margin.
         * @param [panelConfig.bottom=0] The bottom video margin.
         * @param [panelConfig.enabled=true] Whether the panel is enabled by default.
         * @param [panelConfig.video=true] Whether the panel should resize the video in addition to panels.
         * @example
         *  mp.layout.addPanel({
         *    id : "controls",
         *    bottom: 32,
         *    video: false
         *  });
         */
        addPanel : function (panelConfig) {
            var box = $.extend({},
                MetaPlayer.Layout.PANEL_OPTIONS,
                panelConfig);

            this.panels.push( box );
            this._renderPanels(0);
            return (this.panels.length - 1);
        },

        /**
         * Returns the panel spec for a panel id.
         * @name API.Layout#getPanel
         * @function
         * @param {String} id The panel id
         */
        getPanel : function (id) {
            return this.panels[id] || null;
        },

        /**
         * Toggles the visibility of a panel, animating if a duration is specified.
         * @name API.Layout#togglePanel
         * @function
         * @param {String} id The panel id
         * @param {Boolean} bool The target visibility state, true for visible.
         * @param {Number} [duration] The animation duration, in seconds, or undefined to disable.
         */
        togglePanel : function (id, bool, duration) {
            var p = this.getPanel(id);
            if( ! p )
                return;
            p.enabled = bool;
            this._renderPanels(duration);
        },

        /**
         * Updates a panel specification, usually to a new height or width.
         * @name API.Layout#updatePanel
         * @function
         * @param {String} id The panel id
         * @param {Object} options The panel spec. See {@link Layout#addPanel}.
         * @param {Number} [duration] The animation duration, in seconds, or undefined to disable.
         * @
         */
        updatePanel : function (id, options, duration) {
            var box = $.extend( this.getPanel(id),
                options);
            this._renderPanels(duration);
        },


        render : function (duration) {
            this._renderPanels(duration);
            this.dispatch("resize");
        },

        _renderPanels : function (duration)  {
            var video = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            var overlays = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            $.each(this.panels, function (i, box) {
                if(! box.enabled )
                    return;

                if( box.video ) {
                    video.top += box.top || 0;
                    video.left += box.left || 0;
                    video.bottom += box.bottom || 0;
                    video.right += box.right || 0;
                }

                overlays.top += box.top || 0;
                overlays.left += box.left || 0;
                overlays.bottom += box.bottom || 0;
                overlays.right += box.right || 0;
            });

            this._sizeVideo(video, duration);

        },

        maximize : function () {
            this._maximize();
            this._secondSize();
        },

        _maximize : function () {
            var c = $(this.base);
            var win =  $(window);
            if( ! this._restore ){
                this._restore = {
                    width: c.width(),
                    height: c.height(),
                    offset :c.offset(),
                    position : c.css('position')
                };
            }
            $('body').css('margin', 0).css('padding', 0);

            if( ! this.restoreZ )
                this.restoreZ = c.css('z-index');

            c.css('position', 'fixed')
                .width("100%")
                .addClass("mp-fullscreen")
                .height("100%")
                .css({
                    'z-index' :  (-1 >>> 1) // max int, 2147483647 in chrome
                })
                .offset({
                    top: win.scrollTop(), left: win.scrollLeft()
                });

            $("html,body").css("overflow","hidden");

            this._renderPanels();

            if(! this.isMaximized ) {
                this.isMaximized = true;
                this.dispatch("maximize");
            }
            this.dispatch("resize");
        },

        fullscreen : function () {
            var docElm = document.documentElement;

            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
            else {
                this.maximize();
                this._secondSize();
            }
        },

        window : function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        },

        onFullScreen : function (e) {
            this.isFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
            if( this.isFullScreen ) {
                this.dispatch("fullscreen");
                delete this._restore;
                this.maximize();
            }
            else {
                this.restore();
            }
            this._secondSize();
        },

        restore : function () {

            this.window();

            if( ! this._restore )
                return;

            // restore size
            var c = $(this.base);
            var r = this._restore;

            var win =  $(window);
            $('body').css('margin', '').css('padding', '');
            c.css('position', r.position)
                .offset({ top: r.offset.top, left: r.offset.left})
                .width(r.width)
                .css({
                    'z-index' :  this.restoreZ  || 'inherit'
                })
                .removeClass("mp-fullscreen")
                .height(r.height);

            $("html,body").css("overflow","auto");

            this._renderPanels();
            if( this.isMaximized ) {
                this.isMaximized = false;
                this.dispatch("restore");
                this.dispatch("resize");

            }
        },

        _secondSize : function () { // some browsers need a second resize
            var self = this;
            var fn =  function () {
                if( self.isMaximized )
                    self._maximize();
                else
                    self.restore();
            };
            setTimeout(fn, 500);
        },

        _sizeVideo : function (box, duration) {
            if( !(this.config.sizeVideo && this.video) )
                return;

            var msec = (duration  != null) ? duration : this.config.sizeMsec;

            var c = $(this.base);
            var v = $(this.video);

            var w = c.width() - box.left - box.right;
            var h = c.height() - box.top - box.bottom;

            // allow for players that need help sizing
            if( this.video.mpf_resize instanceof Function )
                this.video.mpf_resize(w, h);

            var css = {
                'margin-top': box.top,
                'margin-left': box.left,
                'width' : (w / c.width() * 100) + "%", // allows for liquid resizing, sorta
                'height' : (h / c.height() * 100) + "%"
            };

            if( duration ) {
                this.stage.stop().animate(css, msec);
            }
            else {
                this.stage.css(css)
            }

        },

        _setup : function () {
            var target = this.target;


            var el = $(target);
            var v;
            // target is the video, we need to wrap
            if( target.play instanceof Function ) {
                this.video = target;
                v = $(this.video._proxyFor || this.video );
            }

            // target is a metaplayer-classed div
            if( el.is(".metaplayer") )
                this.base = el;

            // target child of metaplayer div or just some random div without a base
            else
                this.base = el.parents(".metaplayer").first();

            // target becomes base if not found
            if( ! this.base.length ) {
                this.base = $("<div/>")
                    .addClass("metaplayer")
                    .insertAfter(v);
            }

            this.stage = this.base.children(".mp-stage").first();

            if( ! this.stage.length ) {
                this.stage = $("<div />")
                    .addClass("mp-stage")
                    .css({ position : "relative" })
                    .appendTo(this.base);
            }

            if( v ) {
                this.base.css({
                    height: v.height(),
                    width:  v.width()
                });
                this.addVideo()
            }
            this._renderPanels();
        },

        addVideo : function (video) {
            if( video )
                this.video = video;
            var v = $(this.video._proxyFor || this.video );
            v.css({
                height: "100%",
                width: "100%"
            });
            if( this.config.adoptVideo )
                this.stage.append(v);
            this._renderPanels();
        },

        _addStage : function () {
            return $("<div></div>").addClass("mp-stage").appendTo(this.base).get(0);
        }
    };


})();