(function () {

    var $ = jQuery;

    var defaults = {
        controls : true,
        fullscreen : false,
        annotations : 'tags',
        backButtonSec : 5,
        volumeBarSteps : 5,
        pauseDuringSeek : false,
        tracktip: true,
        volumeButtonSteps : 3
    };

    var ControlBar = function (target, player, options) {

        if( !(this instanceof ControlBar) )
            return new ControlBar(target, player, options);

        this.player = player;
        this.player.video.controls = false;

        this.config = $.extend(true, {}, defaults, options);

        if(typeof this.config.annotations == "string" )
            this.config.annotations = this.config.annotations.split(/\s+/);

        this.ui = {};
        if( ! target ) {
            target = $('<div></div>')
                .css('position', 'absolute')
                .css('width', '100%')
                .css('top', 'auto')
                .css('bottom', '0')
                .appendTo(player.layout.base)
                .get(0);
            this.ui.layoutPanel = player.layout.addPanel({})
        }

        this.target = $(target);
        this.createMarkup();

        if( MetaPlayer.iOS ){
            this.player.video.controls = true;
            this.ui.left.toggle(false);
            this.ui.right.toggle(false);
        }

        if( ! this.config.controls )
            this.ui.panel.hide();

        this.addListeners();
        this.render();

    };

    MetaPlayer.ControlBar = ControlBar;

    MetaPlayer.addPlugin("controlbar", function(options) {
        this.controlbar = ControlBar(null, this, options);
    });

    ControlBar.prototype = {

        createMarkup : function (){

            this.ui.base = $(this.target).addClass('mpf-controlbar')
                .mousemove( this.bind( this.focus ))
                .mouseout( this.bind( this.blur ));

            /* timeline */
            var tl = $('<div>')
                .addClass("mpf-controlbar-track")
                .appendTo(this.target)
                .bind("mousedown touchstart", this.bind( this.onTrackStart ));

            if( this.config.tracktip && MetaPlayer.TrackTip )
                this.ui.tracktip = MetaPlayer.TrackTip(tl, this.player);

            this.ui.buffer  = $('<div>')
                .addClass("mpf-controlbar-track-buffer")
                .appendTo(tl);

            this.ui.track  = $('<div>')
                .addClass("mpf-controlbar-track-fill")
                .appendTo(tl);

            this.ui.overlay = $('<div>')
                .addClass("mpf-controlbar-track-overlay")
                .appendTo(tl);

            this.ui.knob = $('<div>')
                .addClass("mpf-controlbar-track-knob")
                .appendTo(this.ui.track);

            /* button bar */
            this.ui.panel = $('<div>')
                .addClass("mpf-controlbar-panel")
                .appendTo(this.target);

            // left button group
            this.ui.left = $('<div>')
                .addClass("mpf-controlbar-panel-left")
                .appendTo(this.ui.panel);

            this.ui.play = $('<div>')
                .addClass("mpf-controlbar-play")
                .appendTo(this.ui.left)
                .attr('title', "Play")
                .click( this.bind( function () {
                    this.player.video.play();
                }));

            this.ui.pause = $('<div>')
                .addClass("mpf-controlbar-pause")
                .appendTo(this.ui.left)
                .attr('title', "Pause")
                .click( this.bind(function () {
                    this.player.video.pause();
                }));

            this.ui.back = $('<div>')
                .addClass("mpf-controlbar-back")
                .appendTo(this.ui.left)
                .attr('title', "Skip Back")
                .click( this.bind(function () {
                    this.player.video.currentTime -= this.config.backButtonSec;
                }));

            this.ui.clock= $('<div>')
                .addClass("mpf-controlbar-clock")
                .appendTo(this.ui.left);

            this.ui.time = $('<div>')
                .text("00:00")
                .addClass("mpf-controlbar-time")
                .appendTo(this.ui.clock);

            $('<div>')
                .html("&nbsp;/&nbsp;")
                .addClass("mpf-controlbar-time-spacer")
                .appendTo(this.ui.clock);

            this.ui.duration = $('<div>')
                .text("99:99")
                .addClass("mpf-controlbar-duration")
                .appendTo(this.ui.clock);

            // right button group
            this.ui.right = $('<div>')
                .addClass("mpf-controlbar-panel-right")
                .appendTo(this.ui.panel);

            this.ui.volume = $('<div>')
                .addClass("mpf-controlbar-volume")
                .appendTo(this.ui.right)
                .attr('title', "Toggle Mute")
                .click( this.bind( this.onMuteToggle ));

            var volumebar = $('<div>')
                .addClass("mpf-controlbar-volumebar")
                .appendTo(this.ui.right)
                .attr('title', "Set Volume")
                .bind("mousedown touchstart", this.bind( this.onVolumeStart ));

            this.ui.volumebar = $('<div>')
                .addClass("mpf-controlbar-volumebar-fill")
                .appendTo(volumebar);

            this.ui.cc = $('<div>')
                .addClass("mpf-controlbar-cc")
                .addClass("mpf-controlbar-cc-off")
                .appendTo(this.ui.right)
                .attr('title', "Toggle Captions")
                .click( this.bind( this.onCCToggle ) );

            this.ui.fullscreen = $('<div>')
                .addClass("mpf-controlbar-fullscreen")
                .attr('title', "Toggle Zoom")
                .click( this.bind( this.onFullscreenToggle ))
                .appendTo(this.ui.right)
                .toggle( Boolean(this.config.fullscreen)
            );

            this.toggle( this.config.controls );

        },

        addButton : function (el, position) {
            if( position != null )
                this.ui.right.children().eq(position).before(el);
            else
                el.appendTo(this.ui.right);
        },

        toggle: function (bool) {
            if( bool == null )
                bool = this.ui.panel.css("display") == 'none';

            this.ui.panel.css('display', bool ? 'block' : 'none');
            this.ui.knob.css('display', bool ? 'block' : 'none'); // overflow causes scrollbar in fullscreen

            if( this.ui.layoutPanel == null)
                return;

            var height = this.player.layout.isMazimized  ?  this.ui.track.height() : this.ui.base.height();
            this.player.layout.updatePanel(this.ui.layoutPanel, { bottom:  height});
        },

        addAnnotation : function (text, time, type) {
            var d = this.player.video.duration;
            if( !d )
                return;

            var el = $('<div>')
                .attr("title", text)
                .addClass("mpf-controlbar-track-marker")
                .appendTo(this.ui.overlay)
                .css('left', (time/d*100) + "%");

            if( type )
                el.addClass("mpf-controlbar-track-marker-" + type);

        },

        clearAnnotations : function (type) {
            if( type )
                this.ui.base.find(".mpf-controlbar-track-marker-"+type).remove();
            else
                this.ui.overlay.empty();
        },

        addListeners : function () {
            var v = this.player.video;
            v.addEventListener("loadstart", this.bind( this.onLoadStart ));
            v.addEventListener("pause", this.bind( this.renderControls) );
            v.addEventListener("playing", this.bind( this.renderControls) );
            v.addEventListener("canplay", this.bind( function () {
                if( MetaPlayer.iOS ){
                    this.player.video.controls = false;
                    this.ui.left.toggle(true);
                    this.ui.right.toggle(true);
                }
            }));
            v.addEventListener("ended", this.bind( this.renderControls) );
            v.addEventListener("loadstart", this.bind( this.renderControls) );
            v.addEventListener("durationchange", this.bind( this.renderDuration) );
            v.addEventListener("volumechange", this.bind( this.renderVolume) );
            v.addEventListener("timeupdate", this.bind( this.renderTime ));

            this.player.playlist.addEventListener("trackchange", this.bind( this.onTrackChange ));
            this.player.cues.addEventListener("cues", this.bind( this.onCues ));
            this.player.search.listen("results", this.onSearchResults, this);

            this.player.listen("ready", this.bind( function () {
                this.player.cues.disable("captions");
            }));
        },

        onTrackChange: function () {
            this._duration = null;
            this.clearAnnotations();
        },

        onLoadStart : function () {
            this.ui.cc.toggleClass("mpf-controlbar-cc-off", true);
            this.render();
        },

        focus : function () {
            clearTimeout(this._blurTimer);
            this._blurTimer = setTimeout( this.bind(function (){
                this.ui.knob.stop().animate({'opacity': 1 });
            }), 300);
        },

        blur : function () {
            clearTimeout(this._blurTimer);
            this._blurTimer = setTimeout( this.bind(function (){
                this.ui.knob.stop().animate({'opacity': 0 });
            }), 750);
        },

        render : function () {
            this.renderControls();
            this.renderDuration();
            this.renderVolume();
        },

        renderControls : function () {
            var v = this.player.video;

            // Play / Pause
            this.ui.pause.hide();
            this.ui.play.hide();

            if( v.paused )
                this.ui.play.show();
            else
                this.ui.pause.show();
        },

        renderDuration : function () {
            var d = this.player.video.duration;
            if( ! d ) {
                this.ui.clock.hide();
                return;
            }

            var f = MetaPlayer.format.seconds(d);

            this._duration = d;
            this.ui.duration.text(f);
            this.renderTime();
            this.renderCues();
            this.ui.clock.show();
        },

        renderVolume : function () {
            var p = this.player.video;

            if( MetaPlayer.iOS ) {
                this.ui.volume.hide();
                this.ui.volumebar.parent().hide();
            }

            // volume bar
            var v = p.muted ? 0 : p.volume;
            this.ui.volumebar.width( (v * 100) + "%" );

            // volume button
            var b = this.ui.volume;
            var steps = this.config.volumeButtonSteps;
            var step, css;

            // clear prior states
            b.attr('class', "mpf-controlbar-volume");

            if( v == 0 )
                css ="mpf-controlbar-muted";
            else if( steps ) {
                step = Math.ceil(v * steps);
                css = "mpf-controlbar-volume-" + step;
            }
            else
                css ="mpf-controlbar-unmuted";

            b.addClass(css);
        },

        onVolumeStart : function (e) {
            this._volumeDragging =  {
                move : this.bind(this.onVolumeMove),
                stop :  this.bind(this.onVolumeStop)
            };
            $(document)
                .bind("mousemove touchmove", this._volumeDragging.move)
                .bind("mouseup touchstop", this._volumeDragging.stop);
            this.onVolumeMove(e);
        },

        onVolumeStop: function (e) {
            if( ! this._volumeDragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._volumeDragging.move)
                .unbind("mouseup touchstop", this._volumeDragging.stop);
            this._volumeDragging = null;
            this.onVolumeMove(e);
        },

        onVolumeMove : function (e) {
            var v = this._dragPercent(e, this.ui.volumebar);

            var steps = this.config.volumeBarSteps;
            if( steps )
                v = Math.ceil(v * steps) / steps;

            this.player.video.volume = v;
            this.player.video.muted = false;
            e.preventDefault();
        },

        onMuteToggle : function (){
            var p = this.player.video;
            var v = p.muted ? 0 : p.volume;

            // unmute
            if( p.muted || v == 0 ) {
                p.muted = false;
                if( p.volume == 0 )
                    p.volume = 1;
            }

            // mute
            else {
                p.muted = true;
            }
        },

        renderTime : function () {
            this.renderClock();
            this.renderTimeline();
        },

        renderClock : function () {
            var t = this.player.video.currentTime;
            var f = "";
            if(! isNaN(t) )
                f = MetaPlayer.format.seconds(t);
            this.ui.time.text(f);
        },

        renderTimeline : function (force) {
            var v = this.player.video;
            var t = force == null ? v.currentTime : force;

            if( this._trackDragging && force == null)
                return;

            var w = 0;
            if( v.duration )
                w = t / v.duration * 100;

            if( w < 0 )
                w = 0;
            else if( w > 100 )
                w = 100;

            this.ui.track.width(w + "%");
        },

        onTrackStart : function (e) {
            this._trackDragging =  {
                move : this.bind(this.onTrackMove),
                stop :  this.bind(this.onTrackStop)
            };

            if( this.config.pauseDuringSeek ){
                this._trackDragging.resume = ! this.player.video.paused;
                this.player.video.pause();
            }
            $(document)
                .bind("mousemove touchmove", this._trackDragging.move)
                .bind("mouseup touchend", this._trackDragging.stop);
            this.onTrackMove(e);
        },

        onTrackStop : function (e) {
            if( ! this._trackDragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._trackDragging.move)
                .unbind("mouseup touchend", this._trackDragging.stop);

            if( this._trackDragging.resume )
                this.player.video.play();

            this.onTrackMove(e);

            this._trackDragging = null;

            if( this.player.tracktip )
                this.player.tracktip.close();
        },

        onTrackMove : function (e) {
            var v = this.player.video;

            if( ! v.duration || v.ad )
                return;

            var p = this._dragPercent(e, this.ui.track );

            if( p != null )
                this._trackDragging.lastTime = p * v.duration;

            if( e.type.match(/^touchend|mouseup/) ) {
                this.player.video.currentTime = this._trackDragging.lastTime;
            }

            this.renderTimeline(this._trackDragging.lastTime);

            if( this.player.tracktip )
                this.player.tracktip.open(this._trackDragging.lastTime);

            e.preventDefault();
        },

        onCCToggle : function (){
            this.toggleCaptions(null);
        },

        onFullscreenToggle : function () {
            if( this.player.config.maximize){
                if( this.player.layout.isFullScreen )
                    this.player.layout.window();
                else
                    this.player.layout.fullscreen();
                return;
            }

            if( this.player.layout.isMaximized )
                this.player.layout.restore();
            else
                this.player.layout.fullscreen();
        },

        toggleCaptions : function (bool) {
            var cues = this.player.cues;

            var enabled = (bool == null)
                ? ! cues.isEnabled('captions')
                : bool;

            if( enabled )
                cues.enable('captions');
            else
                cues.disable('captions');
        },

        onCues : function () {
            this._cuesRendered = false;
            this.renderCues();
        },

        renderCues : function () {

            this.clearAnnotations();

            var cues = this.player.cues;
            var hasCC = cues.getCaptions().length;
            this.ui.cc.toggleClass("mpf-controlbar-cc-off", ! hasCC);

            var plugins = this.config.annotations;
            var self = this;

            $.each( plugins, function (i, name) {
                $.each( cues.getCues(name), function (i, cue ){
                    self.addAnnotation(cue.term || cue.topic || cue.text || '', cue.start, name);
                });
            });
        },

        onSearchResults : function (e) {
            var results = e.data.results;

            this.clearAnnotations('search');

            if(! e.query )
                return;

            $.each(results, this.bind( function(i, result){
                this.addAnnotation(e.query, result.start, "search")
            }));
        },

        /* util */
        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        },

        _dragPercent : function (event, el) {
            var oe = event.originalEvent;
            var pageX = event.pageX;

            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length )
                    return;
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = $(el).parent();
            var x =  pageX - bg.offset().left;

            var p = x / bg.width();
            if( p < 0 )
                p = 0;
            else if( p > 1 )
                p = 1;
            return p
        }
    };



})();
