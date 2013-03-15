

(function () {

    var $ = jQuery;

    var defaults = {
        openDelayMsec : 1000,
        hideDelayMsec : 4000,
        backButtonSec : 5,
        overlay : true,
        autoHide : true
    };

    var TLC = function (player, target, options) {

        if( !(this instanceof TLC) )
            return new TLC(player, target, options);

        this.config = $.extend(true, {}, defaults, options);

        this.ui = {};
        this._hasPlayed = false;
        this._cues = [];

        this.player = player;

        this.popcorn = player.popcorn;
        this.popcorn._TLC = this;

        this.layout = player.layout;
        this.ui.layoutPanel = player.layout.addPanel({});

        this.video = player.video;
        this.video.controls = false;

        this.cues = player.cues;
        this.cues.enable("tlcCaptions", null, { clone : 'captions' } );
        this.cues.enable("tlcTimelineCue", null, { clone : 'tlc', duration: 4 } );

        if( ! target ) {
            target = $('<div></div>')
                .css('position', 'absolute')
                .css('width', '100%')
                .css('top', 'auto')
                .css('bottom', '0')
                .appendTo(this.video.parentNode)
                .get(0);
        }
        this.target = $(target);

        this.createMarkup();
        this.addVideoListeners();
        this._renderVolume();

        this.toggleOverlay( this.config.overlay );


        if( MetaPlayer.iOS )
            this.ui.base.hide();
    };

    MetaPlayer.TLC = TLC;

    MetaPlayer.addPlugin("tlc", function(options) {
        this.tlc = TLC(this, null, options);

    });

    // css namespace
    var cssName = function ( name ) {
        return 'mpf-tlc' + (name ? '-' + name : '');
    };

    TLC.prototype = {

        addVideoListeners : function () {
            var v = this.video;

            v.addEventListener("playing", this.bind( function () {
                this._hasPlayed = true;
                if( this.config.autoHide )
                    this._blur();
                this._renderControls()
            }));

            v.addEventListener("pause", this.bind( function () {
                this._renderControls();

                if( this.config.autoHide )
                    this.toggleShade(false);

            }));

            v.addEventListener("loadstart", this.bind( this._onLoadStart ));
            v.addEventListener("canplay", this.bind( this._onCanPlay) );

            v.addEventListener("durationchange", this.bind( this._renderDuration ));
            v.addEventListener("volumechange", this.bind( this._renderVolume ));
            v.addEventListener("timeupdate", this.bind( function () {
                this._renderTime();
            }));


            this.layout.addEventListener("maximize", this.bind( function (e){
                this.ui.maximize.hide();
                this.ui.restore.show();
            }));

            this.layout.addEventListener("restore", this.bind( function (e){
                this.ui.restore.hide();
                this.ui.maximize.show();
            }));

            this.layout.addEventListener("resize", this.bind( function (e){
                this._renderCues();
                this._renderOverlay();
            }));

            this.player.metadata.listen("data", this.bind( this._onData ) );

            if( this.config.autoHide ) {
                this._canBlur = true;

                $(v).bind("click touchend", this.bind( function () {
                    if( this._shaded ) {
                        this.toggleShade(false);
                        this._blur();
                    }
                    else if( this.video.paused ){
                        this.video.play();
                    }
                    else
                        this.video.pause();
                }));

                $(this.ui.panel).bind("mousemove touchmove touchstart", this.bind( function (e) {
                    if( MetaPlayer.iOS ) {
                        this._focus(0);
                    }
                    else {
                        this._canBlur = false;
                        this._focus();
                    }
                }));
                $(this.ui.panel).bind("mouseleave touchend", this.bind( function () {
                    this._canBlur = true;
                    this._blur();
                }));
            }
        },

        createMarkup : function (){
            var ui = this.ui;

            // used to center main panel, contain elements which require overflow
            ui.base = $(this.target).addClass( cssName() );

            // used to slide body panel
            ui.panel = $("<div></div>")
                .addClass(cssName("panel"))
                .appendTo(ui.base);

            // used to calculate height of child panels
            ui.body = $("<div></div>")
                .addClass(cssName("body"))
                .appendTo(ui.panel);

            //  toggle-able captions panel
            ui.ccPanel = $("<div></div>")
                .addClass(cssName("panel-captions"))
                .appendTo(ui.body);

            this._captions = TLCCaptions(this.popcorn, ui.ccPanel);
            this._captions.onChange = this.bind( this._renderShade );

            // top timeline/cues panel
            ui.trackPanel = $("<div></div>")
                .addClass(cssName("panel-track"))
                .appendTo(ui.body);

            ui.cueTrack = $("<div></div>")
                .css({'opacity': 0})
                .addClass(cssName("cue-track"))
                .appendTo(ui.trackPanel);

            // timeline
            this._timeline = MetaPlayer.ProgressBar(ui.trackPanel, {
                draggable: false,
                throttleMs : 1,
                value : 0
            });
            this._timeline.ui.track.addClass(cssName("track"));
            this._timeline.ui.fill.addClass(cssName("track-fill"));
            this._timeline.addEventListener("dragmove", this.bind( this._onTimeDrag ));
            this._timeline.addEventListener("dragstop", this.bind( this._onTimeDragStop ));

            // timeline maker overlay
            ui.overlay = $('<div>')
                .addClass( cssName("track-overlay") )
                .appendTo( this._timeline.ui.track );

            // bottom row
            ui.controlsPanel = $("<div></div>")
                .addClass( cssName("panel-controls"))
                .appendTo(ui.body);

            // left button group
            ui.controlsLeft = $("<div></div>")
                .addClass( cssName("controls-left"))
                .appendTo(ui.controlsPanel);

            ui.play = this.createButton("play", true)
                .attr('title', "Play")
                .click( this.bind( function () {
                    this.video.play();
                }))
                .appendTo( ui.controlsLeft );

            ui.pause = this.createButton("pause", true)
                .hide()
                .attr('title', "Pause")
                .click( this.bind(function () {
                    this.video.pause();
                }))
                .appendTo( ui.controlsLeft );

            ui.back = this.createButton("back", true)
                .attr('title', "Skip Back")
                .click( this.bind(function () {
                    if( this.video.readyState == 4)
                        this.video.currentTime -= this.config.backButtonSec;
                }))
                .appendTo( ui.controlsLeft );


            // right button group
            ui.controlsRight = $("<div></div>")
                .addClass( cssName("controls-right"))
                .appendTo(ui.controlsPanel);


            // time display
            ui.clock = $("<div></div>")
                .addClass( cssName("time"))
                .addClass( cssName("button"))
                .hide()
                .appendTo( ui.controlsRight );

            ui.clockOffset = $("<span></span>")
                .text("-")
                .addClass( cssName("time-offset"))
                .appendTo( ui.clock );

            $("<span></span>")
                .text("/")
                .addClass( cssName("time-seprator"))
                .appendTo( ui.clock );

            ui.clockDuration = $("<span></span>")
                .text("-")
                .addClass( cssName("time-duration"))
                .appendTo( ui.clock );

            // share button
            this.createButton("share", "Share")
                .click( this.bind ( this.toggleShareMenu ))
                .bind("mousedown", function (e) {
                    e.preventDefault();
                })
                .appendTo( ui.controlsRight );

            // share menu
            ui.shareMenu = $("<div />")
                .hide()
                .addClass( cssName("share-menu"))
                .appendTo( ui.base );

            ui.shareClose = $("<div />")
                .addClass( cssName("share-close"))
                .click( this.bind ( this.toggleShareMenu ))
                .appendTo( ui.shareMenu );

            ui.shareButtons = $("<div />")
                .addClass( cssName("share-buttons"))
                .appendTo( ui.shareMenu );

            if( MetaPlayer.Social )
                this._social = new MetaPlayer.Social(ui.shareButtons, this.player );

            ui.shareEmbed = $("<div />")
                .addClass( cssName("share-embed"))
                .appendTo( ui.shareMenu );

            var shareLinkRow = $("<div />")
                .addClass( cssName("share-row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("share-label"))
                .text("Get Link")
                .appendTo( shareLinkRow );

            ui.shareLink = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("share-link"))
                .appendTo( shareLinkRow );

            var shareEmbedRow = $("<div />")
                .addClass( cssName("share-row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("share-label"))
                .text("Get Embed")
                .appendTo( shareEmbedRow );

            ui.shareEmbed = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("share-embed"))
                .appendTo( shareEmbedRow );


            // captions
            this.createButton("cc")
                .click( this.bind( this._toggleCaptions ))
                .appendTo( ui.controlsRight );

            this._toggleCaptions(); // disable


            // volume
            ui.mute = this.createButton("mute")
                .toggle( ! MetaPlayer.iOS )
                .click(this.bind( this._onMuteToggle ))
                .appendTo( ui.controlsRight );

            this._volumebar = MetaPlayer.ProgressBar(ui.controlsRight, {
                max : 1,
                min : 0,
                value : 1,
                steps: 5
            });

            this._volumebar.ui.track
                .toggle( ! MetaPlayer.iOS )
                .addClass(cssName("volume"));

            this._volumebar.ui.fill
                .addClass(cssName("volume-fill"));

            this._volumebar.addEventListener("dragmove", this.bind( this._onVolumeDrag ));


            // zoom
            ui.maximize = this.createButton("zoom")
                .click( this.bind( function (e) {
                     this.layout.fullscreen();
                }))
                .appendTo( ui.controlsRight );

            ui.restore = this.createButton("unzoom")
                .hide()
                .click( this.bind( function (e) {
                    this.layout.restore();
                }))
                .appendTo( ui.controlsRight );


            // metaq pop-up
            ui.cueTip  = $("<div></div>")
                .css({opacity: 0})
                .hide()
                .addClass( cssName('cue-tip') )
                .appendTo( ui.base );

            ui.cueTipBody = $("<div></div>")
                .addClass( cssName('cue-tip-body') )
                .appendTo( ui.cueTip );

            ui.cueTipTail = $("<div></div>")
                .addClass( cssName('cue-tip-tail') )
                .appendTo( ui.cueTip );

            ui.cueTipThumb = $("<img />")
                .addClass( cssName('cue-tip-thumb') )
                .appendTo( ui.cueTipBody );

            ui.cueTipIcon = $("<div></div>")
                .addClass( cssName('cue-tip-icon') )
                .appendTo( ui.cueTipBody );

            ui.cueTipText = $("<div></div>")
                .addClass( cssName('cue-tip-text') )
                .appendTo( ui.cueTipBody );

            $("<div></div>")
                .addClass( cssName('clear') )
                .appendTo( ui.cueTipBody );
        },

        _toggleCaptions : function () {
            var plugin = 'tlcCaptions';
            var popc = this.popcorn;
            var enabled = ! (Popcorn.indexOf( popc.data.disabled, plugin ) === -1);

            if( enabled ) {
                popc.enable(plugin);
                this.ui.ccPanel.show().css('height', 0).stop().animate({height: "2em"},150, "linear");
            }
            else
                this.ui.ccPanel.stop().animate({height: 0}, 150, "linear", this.bind( function () {
                    popc.disable(plugin);
                    this.ui.ccPanel.hide();
                }));

            this._renderShade(0);
            this._renderOverlay();
        },

        _renderControls : function () {
            var v = this.video;

            // Play / Pause
            this.ui.pause.hide();
            this.ui.play.hide();

            if( MetaPlayer.iOS ){
                v.controls =  ! this._hasPlayed;
                this.ui.base.toggle(this._hasPlayed);
                this._renderDuration();
            }

            if( v.paused )
                this.ui.play.show();
            else
                this.ui.pause.show();
        },

        _onLoadStart : function () {
            this._timeline.setDraggable(false);
            if( ! this._duration )
                this.ui.clock.hide();
            this._renderControls();
        },

        _onCanPlay : function () {
            this._timeline.setDraggable(true);
        },

        _renderDuration : function () {
            var d = this.video.duration || this._duration;

            if( ! d ) {
                this.ui.time.hide();
                return;
            }
            var f = MetaPlayer.format.seconds(d);

            this.ui.clockDuration.text(f);

            this._timeline.setMax( d );
            this.ui.clock.fadeIn();

            this._renderTime();
            this._renderCues()
        },

        _renderCues : function () {
            var nextX;
            $.each(this._cues, this.bind( function (i, options) {
                this._renderCue(options);
                // don't overlap cues, just pile to the right
                // *need to anchor cuetips off cue rather than timeline!
                /*
                var el = options.el;
                var left = parseFloat( el.css('left') );
                if( nextX && left < nextX ){
                    options.el.css('left', nextX);
                    left = nextX;
                }
                nextX = el.width() + left;
                 */
            }));

            if( this._cues.length == 0 ||  this.ui.cueTrack.css('opacity') > 0)
                return;

            this.ui.cueTrack.css({opacity: 0})
                .show()
                .stop().animate({opacity : 1}, 500, "easeInExpo");
        },

        _renderVolume : function () {
            var muted = this.video.muted;
            var volume = muted ? 0 : this.video.volume;

            var m = this.ui.mute;
            // reset
            m.attr("class", '')
                .addClass(cssName( "button" ))
                .addClass(cssName( "button-mute" ));

            var clazz;
            if( volume == 0 || muted )
                clazz = "vol0";
            else if( volume <= .5 )
                clazz = "vol1";
            else
                clazz = "vol2";
            m.addClass( cssName(clazz) );


            this._volumebar.setValue(volume);
        },

        _onVolumeDrag : function () {
            this.video.muted = false;
            this.video.volume = this._volumebar.getValue();
        },

        _onMuteToggle : function () {
            var v = this.video;

            if( v.muted )
                v.muted = false;

            else if( v.volume == 0 )
                v.volume = 1;

            else
                v.muted = true;
        },

        _renderTime : function ( time ) {

            if( time == null ) {
                if( this._timeDragging )
                    return;
                time = this.video.currentTime;
            }

            this._timeline.setValue( time );

            var f = MetaPlayer.format.seconds(time);
            this.ui.clockOffset.text(f);
        },

        _onTimeDrag : function (e) {
            this._timeDragging = true;
            if( this.video.readyState == 4) {
                this._renderTime( this._timeline.getValue() )
            }
        },

        _onTimeDragStop : function (e) {
            this._timeDragging = false;
            if( this.video.readyState == 4) {
                this.video.currentTime = this._timeline.getValue();
            }
        },

        _renderCueTip : function (options, duration){
            if( duration == null )
                duration = 1500;

            var p = this.ui.cueTip;
            p.find( cssName('cue-tip-label')).text(options.term);

            var pw = p.outerWidth();
            var ph = p.outerHeight();

            var track = this.ui.cueTrack;
            var tail = this.ui.cueTipTail;

            var to = offsetFrom( this.ui.cueTrack, this.ui.base);
            var per = options.start / this.video.duration || 0;
            var cueOffset = track.width() * per;

            var x = to.left + cueOffset;
            var y = to.top - ph - 15;

            // center x
            x = x - (pw *.5);

            // left and right edge boundary conditions
            var min = 10;
            var max = this.ui.base.width() - pw - 10;
            if( x < min )
                x = min;
            else if( x > max )
                x = max;

            // position tail
            var tailx;
            if( x == min || x == max )
                tailx = (to.left + cueOffset) - x - (tail.outerWidth() * .5) ;
            else
                tailx = ( pw - tail.outerWidth() ) * .5;

            p.css({
                    opacity : 0,
                    top : y - 50,
                    left: x
                })
                .show()
                .stop().animate({
                    top : [y, "easeOutBounce"],
                    opacity: 1
                }, duration);

            tail.css('left', tailx);
        },

        _onData : function () {
            var data = this.player.metadata.getData();

            this._duration = parseFloat(data.ramp.duration);
            this._renderDuration();

            this.ui.shareLink.val( data.ramp.linkURL );
            this.ui.shareEmbed.val( this.embedUrl( data.ramp.embedURL ) );
        },

        createButton : function (cssClass, label){
            if( label == null)
                label = "";

            var el = $("<div></div>")
                .addClass( cssName("button"))
                .addClass( cssName( "button-" + cssClass ))
                .html(label);

            $("<div></div>")
                .addClass( cssName("button-icon"))
                .addClass( cssName( "button-icon-" + cssClass ))
                .appendTo(el);
            
            return el;
        },

        toggleShareMenu : function () {
            this._shareOpen = ! this._shareOpen;
            if( this._shareOpen )
                this.ui.shareMenu.fadeIn();
            else
                this.ui.shareMenu.fadeOut();
        },

        toggleShade : function (bool, duration ) {

            if( bool == null )
                this._shaded = ! this._shaded;
            else if ( bool != this._shaded )
                this._shaded = bool;
            else
                return;

            this._renderShade(500)
        },

        _renderShade : function ( duration ) {
            var h;

            // shade only if enabled, if overlay mode or fullscreen, and if not video paused.
            var shaded = this._shaded &&  ! this.video.paused && (this._overlay || this.layout.isMaximized);

            if( shaded ){
                var track = this._timeline.ui.track;
                h = track.offset().top - this.ui.panel.offset().top + 2;
            }
            else {
                h = this.ui.body.outerHeight();
            }

            if( duration )
                this.ui.panel.stop().animate({'height': h }, duration, "linear",
                this.bind( function () {
                    ! shaded && this.ui.panel.css("height", "");
                }));
            else
                this.ui.panel.stop().css("height", shaded && h || "");
        },

        toggleOverlay : function ( bool  ) {
            if( bool == null )
                this._overlay = ! this._overlay;
            else if ( bool != this._overlay )
                this._overlay = Boolean(bool);
            else
                return;

            this._renderOverlay();
        },

        _renderOverlay : function () {
            var useOverlay = this.layout.isMaximized ? true : this._overlay;

            var h = ( useOverlay )
                ? 0
                : this.ui.body.outerHeight();


            this.ui.base.toggleClass( cssName('overlay'), useOverlay );
            this.layout.updatePanel(this.ui.layoutPanel, { bottom:  h});

            this._renderShade(0);
            this._renderCues();
        },

        _focus : function ( duration ) {
            if( duration == null )
                duration = 250;

            clearTimeout(this._blurTimer);
            if(!  this._focusTimer  ) {
                this._focusTimer = setTimeout( this.bind( function () {
                    this._focusTimer = null;
                    this.toggleShade(false);
                    this._blur(); // start the blur timer
                }), 250);
            }
        },

        _blur : function ( duration ) {

            if(! this._canBlur)
                return;

            if( duration == null )
                duration = this.config.hideDelayMsec;

            clearTimeout(this._blurTimer);
            clearTimeout(this._focusTimer);
            this._focusTimer = null;

            this._blurTimer = setTimeout( this.bind(function (){
                this.toggleShade(true)
            }), duration);
        },

        addCue : function (options){
            options.el = $("<div></div>")
                .hide()
                .addClass( cssName("cue") )
                .addClass( cssName("cue-" + options.type) )
                .attr('title', options.term)
                .click( this.bind( function () {
                    // seeking before helps key-frame related glitches on ipad
                    this.video.currentTime = this.video.paused
                        ? options.start
                        : options.start - .5;
                }))
                .appendTo(this.ui.cueTrack);

            this._renderCue(options);

            this._cues.push(options);
        },

        focusCue : function (options) {
            options.el.addClass( cssName("cue-active") );
            this._lastCue = options;


            if(  options.thumb  ){
                this.ui.cueTipThumb.show();
                this.ui.cueTipThumb.attr('src', options.thumb);
            }
            else
                this.ui.cueTipThumb.hide();

            this.ui.cueTipIcon.attr('class', cssName('cue-tip-icon') ) // reset
                .addClass( cssName("cue-" + options.type) )
                .attr('src', options.thumb || '');

            this.ui.cueTipText.html( options.label || "");

            this._renderCueTip(options);

        },

        blurCue : function (options) {
            options.el.removeClass( cssName("cue-active") );
            var o = this.ui.cueTip.position();
            this._lastCue = null;
            this.ui.cueTip.stop().animate({
                opacity : 0,
                left :o.left - 5,
                top :o.top - 10
            }, 500, "linear", this.bind( function () {
                this.ui.cueTip.hide();
                this.ui.cueTip.css("opacity", 0);
            }));
        },

        removeCue : function (options){
            options.el.remove();
        },

        _renderCue : function (options) {
            var el = options.el;

            var d = this._duration || this.video.duration
            if( ! d ) {
                return;
            }

            var track = this.ui.cueTrack;
            var tw = track.width();
            var th = track.height();
            var ew = options.el.width();
            var eh = options.el.height();

            var percent = options.start / d;

            // center
            var x = (percent * tw) - (ew * .5);
            var y = .5 * (th - eh);

            el.css({
                    opacity : 1,
                    left : x,
                    top : y
                })
                .show();
        },

        /* util */

        embedUrl : function (src) {
            return  "<iframe src=''" + encodeURI(src) + "' height='380' width='620px' "+
                "frameborder='0' scrolling='no' marginheight='0' marginwidth='0' " +
                "style='border:0; padding:0; margin:0;'></iframe>";
        },

        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        }

    };

    var offsetFrom = function (object, reference) {
        var o = $(object).offset();
        var r = $(reference).offset();
        return {
            top : o.top - r.top,
            left : o.left - r.left
        };
    };

    /** TLC Captions **/
    var TLCCaptions = function (popcorn, target, config) {
        if( popcorn._tlcCaptions )
            return popcorn._tlcCaptions;

        if( ! ( this instanceof TLCCaptions) )
            return new TLCCaptions(popcorn, target, config);

        if( ! target )
            return null;

        this._target = target;
        this.ui = {};
        this.init();
        this.onChange = function () {};

        popcorn._tlcCaptions = this;
    };

    TLCCaptions.prototype = {
        init : function (){
            this.ui.frame = $("<div></div>")
                .addClass("mp-cc-frame")
                .appendTo(this._target);

            this.ui.text = $('<div></div>')
                .addClass("mp-cc-text")
                .html("&nbsp;")
                .appendTo(this.ui.frame);
        },

        focus : function (options) {
            if( options.el )
                return;

            options.el = $("<span></span>")
                .html( options.text )
                .appendTo(this.ui.text);
            this.onChange();
        },

        blur : function (options) {
            options.el.remove();
            options.el = null;
            this.onChange();
        },

        clear : function (options) {
            this.ui.text.empty();
            this.onChange();
        }
    };

    if( Popcorn ) {

        Popcorn.plugin( "tlcCaptions" , {
            _setup: function( options ) {
            },

            start: function( event, options ){
                TLCCaptions(this).focus(options);
            },

            end: function( event, options ){
                TLCCaptions(this).blur(options);
            },

            _teardown: function( options ) {
            }
        });

        Popcorn.plugin( "tlcTimelineCue" , {
            _setup: function( options ){
                this._TLC.addCue(options);
            },

            start: function( event, options ){
                this._TLC.focusCue(options);
            },

            end: function( event, options ){
                this._TLC.blurCue(options);
            },

            _teardown: function( options ){
                this._TLC.removeCue(options);
            }
        });
    }



})();
