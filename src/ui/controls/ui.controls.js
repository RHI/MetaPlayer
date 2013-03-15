
// timeline / control bar for HTML5 media API
// supports timeline annotations
(function () {

    var $ = jQuery;

    var defaults = {
        cssPrefix : 'mp-controls',
        leading: true,
        trackIntervalMsec : 5000,
        clockIntervalMsec : 500,
        revealTimeMsec : 500,
        revealDelayMsec : 500,
        hideDelayMsec : 1500,
        annotationSeekOffsetSec : -1,
        createMarkup : true,
        renderTags : true,
        renderMetaq : false,
        autoHide : false,
        annotationAnimate : true,
        annotationMsec : 1200,
        annotationEntropy : 1,
        annotationSpacing : .5,
        showBelow : true
    };

    /**
     * The Controls player widget renders a timeline scrubber, play/pause button, and a current
     * playback timestamp. The timeline scrubber supports the addition of annotations.
     * @name UI.Controls
     * @class The MetaPlayer controls and timeline scrubber player widgets.
     * @constructor
     * @param {MetaPlayer} player A MetaPlayer instance.
     * @param {Object} [options]
     * @param {Boolean} [options.autoHide=false] Controls are only rendered during mouse hover.
     * @param {Boolean} [options.renderTags=true] Render any Tags metadata, if available.
     * @param {Boolean} [options.showBelow=true] Show the controls below the video (not overlaid).
     * @example
     * MetaPlayer(video)
     *       .controls({
     *           autoHide : false,
     *           renderTags : true,
     *           showBelow : true
     *       })
     *       .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *       .load();
     * @example
     * <iframe style="width: 100%; height: 375px" src="http://jsfiddle.net/ramp/PYzRm/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
     * @see MetaPlayer#controls
     */
    var Controls = function (player, options) {

        this.config = $.extend(true, {}, defaults, options);

        this.container = $(this.config.container ||  player.layout.base );
        this.player = player;
        this.video = player.video;

        this.annotations = [];
        this.video.controls = false;
        this._hasTween = $.easing.easeOutBounce; // jquery UI

        if( this.config.createMarkup )
            this.createMarkup();

        this.addDataListeners(player);
        this.addVideoListeners();
        this.addUIListeners();

        this.trackTimer = MetaPlayer.timer(this.config.trackIntervalMsec);
        this.trackTimer.listen('time', this.render, this);

        this.clockTimer = MetaPlayer.timer(this.config.clockIntervalMsec);
        this.clockTimer.listen('time', this.onClockTimer, this);

        this.revealTimer = MetaPlayer.timer(this.config.revealDelayMsec);
        this.revealTimer.listen('time', this.onRevealTimer, this);

        this.hideTimer = MetaPlayer.timer(this.config.hideDelayMsec);
        this.hideTimer.listen('time', this.onHideTimer, this);

        this.panel = this.player.layout.addPanel({ });


        if( this.config.autoHide ) {
            this.config.showBelow = false;
        }

        if( this.config.showBelow ) {
            this.showBelow(true);
        }

        if( MetaPlayer.iOS ){
            this.video.controls = true;
            this.toggle(false, 0);
            this.showBelow(false);
        }

    };

    /**
     * @name MetaPlayer#controls
     * @function
     * @description
     * Creates a {@link UI.Controls} instance with the given options.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .controls()
     *     .load();
     * @see <a href="http://jsfiddle.net/ramp/PYzRm/">Live Example</a>
     * @see UI.Controls
     * @requires  metaplayer-complete.js
     */
    MetaPlayer.addPlugin("controls", function (options) {
        this.controls = new Controls(this, options);
    });

    Controls.prototype = {

        addVideoListeners : function () {
            var self = this;
            $(this.video).bind('pause play playing seeked seeking ended', function(e){
                self.video.controls = false
                self.onPlayStateChange(e)
            });

            $(this.video).bind('adstart adstop', function(e){
                self.toggle( e.type != "adstart");
            });

            $(this.video).bind('durationchange', function(e){
                self.renderAnnotations(true);
            });
        },

        addUIListeners : function (el) {
            var self = this;

            this.find('play').click( function (e) {
                self.onPlayToggle(e);
            });

            this.find('track-knob').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track-fill').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track-buffer').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            this.find('track').bind("mousedown touchstart", function (e) {
                return self.onKnobMouseDown(e);
            });

            $(document).bind("mouseup touchend", function (e) {
                return self.onKnobMouseUp(e);
            });

            $(document).bind("mousemove touchmove", function (e) {
                return self.onKnobMouseMove(e);
            });

            var player = $(this.container);
            player.bind("mouseenter touchstart", function (e) {
                if( self.config.autoHide ) {
                    self.hideTimer.reset();
                    self.revealTimer.start();
                }
            });

            player.bind("mouseleave", function (e) {
                if( self.config.autoHide ) {
                    self.revealTimer.reset();
                    self.hideTimer.start();
                }
            });
        },

        addDataListeners : function () {
            var metadata = this.player.metadata;

            if( this.config.renderTags )
                metadata.listen( MetaPlayer.MetaData.DATA, this.onTags, this);

            var cues = this.player.cues;
            cues.listen( MetaPlayer.Cues.CLEAR, this._onCuesClear, this);

            var search = this.player.search;
            search.listen(MetaPlayer.Search.RESULTS, this.onSearch, this);
        },

        onTags : function (e) {
            var tags = e.data.ramp.tags || [];
            var self = this;
            $.each(tags, function (i, tag){
                $.each(tag.timestamps, function (j, time){
                    self.addAnnotation(time, null, tag.term, "tag");
                });
            });
            this.renderAnnotations();
        },

        addAnnotations : function (events, type) {
            if( type == null )
                type = "metaq";
            var self = this;
            $.each(events, function (i, event){
                self.addAnnotation(event.start, event.end, event.text || event.term, type);
            });
            this.renderAnnotations();
        },

        _onCuesClear: function (e, track) {
            this.clearAnnotations();
        },

        onSearch : function (e, response) {
            var self = this;
            var searchClass = 'query';

            this.removeAnnotations( searchClass );

            $.each(response.results, function (i, result){
                var start = result.start;
                var text =  [ ];
                $.each(result.words, function (i, word){
                    text.push(word.text);
                });
                text = text.join(' ').replace(/[\r\n]/g, ' ');
                self.addAnnotation(start, null, text, searchClass);
            });

            this.renderAnnotations();
        },

        onClockTimer : function (e) {
            if( ! this.dragging )
                this.renderTime();
            //            if( ! this.buffered )
            //                this.renderBuffer();
        },

        onPlayToggle : function () {
            var p = this.video;
            if( p.paused )
                p.play();
            else
                p.pause();

            this.render();
        },

        onPlayStateChange : function (e) {
            // manage our timers based on play state

            if( ! this.config.autoHide ) {
                this.toggle(true);
                if( this.config.showBelow  ){
                    this.showBelow(true);
                }
            }

            if(! this.video.paused ){
                this.clockTimer.start();
                this.trackTimer.start();
            }
            else {
                this.clockTimer.reset();
                this.trackTimer.reset();
            }
            this.render();
        },

        onKnobMouseDown : function (e) {
            this.dragging = true;
            this.find('track-knob').stop();
            this.onKnobMouseMove(e);
            e.preventDefault();
            return false;
        },

        onKnobMouseUp : function (e) {
            if( ! this.dragging ) {
                return;
            }
            this.dragging = false;
            this.setByMousePosition(e);
        },

        onKnobMouseMove : function (e) {
            if( ! this.dragging )
                return;

            var buffer = this.find('track-buffer');
            var knob = this.find('track-knob');
            var track = this.find('track');

            var parent = knob.parent().offset();
            var x = ( e.pageX || e.originalEvent.touches[0].pageX ) - parent.left;


            x = Math.min(x, track.width());
            x = Math.max(x, 0);


            var ratio = x / track.width();
            var t = ratio * this.video.duration;

            this.renderTime(t);

            knob.css('left', x + "px");
            this.setByMousePosition(e, true);
        },

        setByMousePosition : function (e, throttle) {
            var knob = this.find('track-knob');
            var track = this.find('track');
            var parent = knob.parent();
            var x = knob.position().left;

            var percent = x / parent.width();
            var time = percent * this.video.duration;

            if( throttle )
                this.throttledSeek(time);
            else
                this.seek(time);
        },

        throttledSeek : function ( time ){
            clearTimeout( this.seekDelay );
            var self = this;
            this.seekDelay = setTimeout( function () {
                self.seek(time);
            }, 100);
        },

        seek : function (time) {
            clearTimeout( this.seekDelay );
            this.video.currentTime = parseFloat(time);
            this.render();
        },

        renderTime : function (time ) {
            if( ! time ) {
                time = this.video.currentTime; // render seek target if present
            }
            this.find("time-current").text( this.formatTime(time) );
        },

        //        renderBuffer : function (){
        //            var status = this.video.status();
        //            var bufferPercent = status.buffer.end / this.video.duration * 100;
        //            var buffer = this.find('track-buffer').stop();
        //            buffer.animate( { width : bufferPercent + "%"}, this.config.clockIntervalMsec, 'linear');
        //            if( bufferPercent == 100)
        //                this.buffered = true;
        //        },

        render : function (){
            var duration = this.video.duration;
            var time = this.video.currentTime; // render seek target if present

            this.find('play').toggleClass( this.cssName('pause'), ! this.video.paused );
            this.find('time-duration').html(' / ' + this.formatTime( duration ) );

            if( this.annotations.modified )
                this.renderAnnotations();

            var msec = this.config.trackIntervalMsec;

            // time isn't always ok correct immediately following a seek
            this.renderTime();

            var trackPercent, toPercent;
            if( duration ) {
                trackPercent = time / duration * 100;
                toPercent = (time +  (msec/1000) ) / duration * 100;
                toPercent = Math.min(toPercent, 100);
            }
            else {
                trackPercent = 0;
                toPercent = 0;
                toPercent =0;
            }

            var fill = this.find('track-fill').stop();
            var knob = this.find('track-knob').stop();

            if( this.video.paused ) {
                toPercent = trackPercent;
            }

            if( this.video.seeking ){
                msec = msec * 3; // give time and don't overshoot the animation
                return;
            }

            fill.width( trackPercent + "%");

            if( ! this.dragging ){
                knob.css('left', trackPercent + "%");
            }

            if( ! this.video.paused && this.config.leading && !(this.video.seeking || this.dragging) ){
                fill.animate( { width : toPercent + "%"}, msec, 'linear');
                knob.animate( { left : toPercent + "%"}, msec, 'linear');
            }

        },

        /**
         * toggles whether the controls are visible during mouse-over.
         * @name UI.Controls#autohide
         * @function
         * @param {Boolean} bool True for visible.
         */
        autoHide : function (bool) {
            if( bool )
                this.hideTimer.start();
            else
                this.hideTimer.stop();

            return this.config.autoHide = bool;
        },

        onRevealTimer : function () {
            this.toggle(true);
            this.revealTimer.reset();
        },

        onHideTimer : function () {
            this.toggle(false);
            this.hideTimer.reset();
        },

        /**
         * Toggles the visiblity of the controls
         * @name UI.Controls#toggle
         * @function
         * @param {Boolean} bool True for visible.
         * @param {Number} duration Seconds of fade in/out, if defined.
         */
        toggle : function (bool, duration) {
            var el = this.find();
            var v = $(this.container).find('.metaplayer-video');
            var show = bool == undefined ? !el.is(":visible") : bool;

            if( show  ) // make visible to fade in
                el.toggle(true);

            if( this.config.showBelow )
                this.showBelow(bool);

            el.stop().animate({
                    opacity: show ? 1 : 0
                }, duration == null ? this.config.revealTimeMsec : duration,
                function () {
                    el.toggle(show);
                });
        },

        /**
         * Toggles the rendering of the controls below playback, adding a bottom marign to the video.
         * @name UI.Controls#showBelow
         * @function
         * @param {Boolean} bool True for controls below the video..
         */
        showBelow : function (bool){
            var h = bool ? this.find().height() : 0;
            this.player.layout.updatePanel(this.panel, { bottom: h } );
        },

         /**
         * Toggles the rendering of the controls below playback, adding a bottom marign to the video.
         * @name UI.Controls#addAnnotation
         * @function
          * @param {Number} start The start time, in seconds
          * @param {Number} end The start time, in seconds. This will affect the width of the annotation container,
          * although the CSS theme may have a fixed with annotation marker.
          * @param {String} title The tooltip text.
          * @param [cssClass] An optional CSS class to append to the annotation for custom styling.
         */
        addAnnotation : function (start, end, title, cssClass) {
            var overlay = this.find('track-overlay');
            var marker = this.create("track-marker");

            marker.hide();

            var self = this;
            marker.click( function (e) {
                return self.seek(parseFloat(start) + self.options.annotationSeekOffsetSec);
            });

            if( title  )
                marker.attr('title', this.formatTime(start) + "  " + title);

            if( cssClass)
                marker.addClass( this.cssName(cssClass) );

            if( end == start )
                end = null;

            overlay.append(marker);
            this.annotations.modified = true;
            this.annotations.push({
                rendered: false,
                start : parseFloat( start ),
                end : parseFloat( end ) || null,
                el : marker,
                cssClass : cssClass
            });

            this.renderAnnotations();

            return marker;

        },

        renderAnnotations : function (force) {
            var duration = this.video.duration;
            if( ! duration )
                return;

            var videoHeight = $(this.video).height();
            var config = this.config;
            var last;
            var self = this;

            var spacing = this.config.annotationSpacing;
            var sorted = this.annotations.sort( Controls.annotationSort );

            $(sorted).each( function (i, annotation) {

                var trackPercent = annotation.start / duration * 100;
                if( trackPercent > 100 )
                    trackPercent = 100;

                annotation.el.css('left', trackPercent + "%");
                if( annotation.end ) {
                    var widthPercent = (annotation.end - annotation.start) / duration * 100;
                    annotation.el.css('width', widthPercent + "%");
                }

                // bouncy
                if(force || ! annotation.rendered  ){
                    if( config.annotationAnimate && self._hasTween ) {
                        annotation.el.css('top', -videoHeight).animate({
                                top : 0
                            },
                            (config.annotationMsec + ( Math.random() * config.annotationEntropy * config.annotationMsec)),
                            "easeOutBounce"
                        );
                    }
                    annotation.rendered = true;
                }

                annotation.el.show();

                // enforce annotation spacing rendering (but not firing)
                if (last && spacing != null
                    && last.el.position().left + ( last.el.width() * spacing )
                    > annotation.el.position().left ) {
                    annotation.el.stop().hide();
                    return;
                }

                last = annotation;
            });


            this.annotations.modified = false;
        },

        /**
         * Removes all annotation markers which were identified with given name. 
         * @name UI.Controls#removeAnnotations
         * @function
         * @param {String} className A CSS class name used to select annotations.
         */
        removeAnnotations : function (className) {
            var i, a;
            for(i = this.annotations.length - 1; i >= 0 ; i-- ) {
                a = this.annotations[i];
                if( a.cssClass == className ){
                    this.annotations.splice(i, 1);
                    a.el.remove();
                }
            }
        },

        clearAnnotations : function () {
            this.find('track-overlay').empty();
            this.annotations = [];
        },

        createMarkup : function () {
            var controls = this.create().appendTo(this.container);

            var box = this.create('box');
            controls.append(box)

            var play = this.create('play');
            play.append( this.create('icon-play') );
            box.append( play);
            box.append( this.create('fullscreen') );

            var time = this.create('time');
            time.append( this.create('time-current') );
            time.append( this.create('time-duration') );
            box.append(time);

            var track = this.create('track');
            track.append( this.create('track-buffer') );
            track.append( this.create('track-fill') );
            track.append( this.create('track-overlay') );
            track.append( this.create('track-knob') );
            box.append(track);
        },

        // display seconds in hh:mm:ss format
        formatTime : function (time) {
            if( isNaN(time) )
                return "-:-";

            var zpad = function (val, len) {
                var r = String(val);
                while( r.length < len ) {
                    r = "0" + r;
                }
                return r;
            };
            var hr = Math.floor(time / 3600);
            var min = Math.floor( (time %  3600) / 60);
            var sec = Math.floor(time % 60);
            var parts = [
                zpad(min, 2),
                zpad(sec, 2)
            ];
            if( hr )
                parts.unshift(hr);
            return parts.join(":");
        },

        /* core */
        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className){
            return $("<div></div>").addClass( this.cssName(className) );
        },

        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }

    };

    Controls.annotationSort = function (a, b) {
        var as = parseFloat( a.start );
        var bs = parseFloat( b.start );
        if( bs > as )
            return -1;
        if( as > bs )
            return 1;
        return 0;
    };

})();
