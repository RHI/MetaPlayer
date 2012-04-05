/**
 * skinnable, touch friendly lightweight scroller
 */


(function () {

    var $ = jQuery;

    var defaults = {
        fixedHeight : false,
        minHeight : 20, //px
        mouseDrag : false,
        listenChanges : true,
        knobAnimateMs : 1000,
        inertial : false  // beta
    };
    var ScrollBar = function (container, options) {
        this.config = $.extend(true, {}, defaults, options);
        this.init(container);
        this.inertiaY = 0;
    };

    var eventX = function (e) {
        return e.pageX || e.originalEvent.touches[0].pageX;
    };
    var eventY = function (e) {
        return  e.pageY || e.originalEvent.touches[0].pageY;
    };

    ScrollBar.prototype = {
        init : function (parent) {
            this.parent = $(parent);
            var self = this;
            var children = this.parent[0].childNodes;

            this.body = $("<div></div>")
                .addClass("mp-scroll-body")
                .css("position", "relative")
                .bind("resize DOMSubtreeModified size change", function(e) {
                    self.onResize(e);
                })
                .append( children );


            this.scroller = $("<div></div>")
                .css("width", "100%")
                .css("height", "100%")
                .css("overflow", "hidden")
                .addClass("mp-scroll")
                .append(this.body)
                .appendTo(parent);


            // memoise event callbacks
            this._touchStop = function (e) {
                self.onTouchStop(e);
            };
            this._touchMove = function (e) {
                self.onTouchMove(e);
            };

            this._knobStop = function (e) {
                self.onKnobStop(e);
            };
            this._knobMove = function (e) {
                self.onKnobMove(e);
            };

            this.knob = $("<div></div>")
                .css('position', "absolute")
                .css('background', "black")
                .css('top', 0)
                .css('right', "-10px")
                .css('border-radius', "4px")
                .css('background', "#000")
                .css('opacity', .4)
                .css('cursor', "pointer")
                .width(8)
                .addClass("mp-scroll-knob")
                .appendTo(this.parent)
                .bind("mousedown touchstart", function (e) {
                    self.onKnobStart(e);
                });

            this.parent
                .css("position", "relative")
                .css("overflow", "visible")
                .bind("mousewheel", function (e){
                    self.onScroll(e);
                })
                .bind((this.config.mouseDrag ? "mousedown" : '') + " touchstart", function (e) {
                    self.onTouchStart(e);
                });


            this.scrollTo(0,0);
        },

        onScroll : function(e) {
            var x = e.originalEvent.wheelDeltaX || e.originalEvent.delta || 0;
            var y = e.originalEvent.wheelDeltaY || e.originalEvent.delta || 0;
            this.scrollBy(-x, -y);
            e.preventDefault();
        },

        scrollBy : function (x, y, duration){
            var sl = this.scroller.scrollLeft();
            var st = this.scroller.scrollTop();
            this.scrollTo( sl + x ,  st + y, duration);
        },

        scrollTop : function () {
            return this.scroller.scrollTop();
        },

        scrollTo : function (x, y, duration){
            var max = this.body.height() - this.parent.height();
            var at_max = ( max > 0 && this.scroller.scrollTop() + 1 >= max ); // allow rounding fuzzyiness

             if( y > max  )
                y = max;

            if( y < 0 )
                y = 0;

            this.scroller.stop();

            if( duration && !at_max ){
                var self = this;
                this._scrollY = y;
                this.scroller.animate({
                    scrollLeft : x,
                    scrollTop : y
                }, duration, function () {
                    self._scrollY = null;
                });
                this.render(duration);
            }
            else {
                this.scroller.scrollLeft(x);
                this.scroller.scrollTop(y);
                this.render();
            }
        },

        render: function (duration) {

            // ff 11 crashes without second check if this.body isn't visible (or part of dom yet)
            if( ! this.body || ! this.body.is(":visible")) {
                return;
            }

            var bh = this.body.height();
            var ph = this.parent.height();


            var kh =  Math.min( ph - ( (bh - ph) / bh * ph ), ph);

            if( kh < this.config.minHeight || this.config.fixedHeight )
                kh = this.config.minHeight;

            var y = (this._scrollY != null) ? this._scrollY : this.scroller.scrollTop();
            var perY = y /  ( bh - ph );
            var knobY = (ph - kh) * perY;

            // don't trigger animations if we haven't changed
            var cacheHeight = knobY + kh;
            if(  this._cacheHeight == cacheHeight ){
                return;
            }
            this._cacheHeight = cacheHeight;

            this.knob
                .toggle( kh < ph );

            if( duration ){
                this.knob.stop().animate({
                    height : kh,
                    top : knobY
                }, duration)
            }
            else {
                this.knob.stop()
                    .height(kh)
                    .css('top', knobY);
            }
        },

        onResize : function () {
            if( this.config.listenChanges )
                this.render(this.config.knobAnimateMs);
        },

        onTouchStart : function (e) {

            this.touching = {
                lastX : this.scroller.scrollLeft(),
                lastY : this.scroller.scrollTop()
            };

            this.touching.x = eventX(e) + this.touching.lastX;
            this.touching.y = eventY(e) + this.touching.lastY;

            $(document)
                .bind("mousemove touchmove", this._touchMove )
                .bind("mouseup touchend", this._touchStop );

            if( this.config.inertial ) {
                var self = this;
                this.inertiaInterval = setInterval( function() {
                    self.onInertiaUpdate();
                },30);
            }
        },

        onInertiaUpdate : function () {
            this.inertiaY = this.inertiaY * .9;

            if( this.touching ) {
                return;
            }

            if( this.inertiaY < 1 )
                clearInterval( this.inertiaInterval );

            this.scrollBy(0, this.inertiaY);
        },

        onTouchStop : function (e) {

             $(document)
                .unbind("mousemove touchmove", this._touchMove )
                .unbind("mouseup touchend", this._touchStop );
            this.touching = null;


        },

        onTouchMove : function (e) {
            var x = (eventX(e) - this.touching.x) * -1;
            var y = (eventY(e) - this.touching.y) * -1;

            this.inertiaY += y - this.touching.lastY;

            this.touching.lastX = x;
            this.touching.lastY = y;
            this.scrollTo(x, y);
            e.stopPropagation();
            e.preventDefault();
        },

        onKnobStart : function (e, inverse) {
            this.scroller.stop();

            this.dragging = {
                x : eventX(e) - this.knob.position().left,
                y : eventY(e) -  this.knob.position().top
            };

            $(document)
                .bind("mousemove touchmove", this._knobMove )
                .bind("mouseup touchend", this._knobStop );

            e.stopPropagation();
            e.preventDefault();
        },

        onKnobStop : function (e) {
             $(document)
                .unbind("mousemove touchmove", this._knobMove )
                .unbind("mouseup touchend", this._knobStop );
            this.dragging = null;

        },

        onKnobMove : function (e) {
            var x = (eventX(e) - this.dragging.x);
            var y = (eventY(e) - this.dragging.y);


            var bh = this.body.height();
            var ph = this.parent.height();
            var kh = this.knob.height();

            var perY = y / (ph - kh);
            this.scrollTo(x, perY * (bh -ph) );
        }

    };

    if( ! window.MetaPlayer )
        window.MetaPlayer = {};

    MetaPlayer.scrollbar = function (target, options) {
        return new ScrollBar(target, options);
    };

})();
