
(function () {

    var $ = jQuery;

    var defaults = {
        steps : null,
        throttleMs : 250,
        max : 100,
        min : 0,
        value : 25,
        draggable: true
    };

    var ProgressBar = function (parent, options) {

        if( ! (this instanceof  ProgressBar))
            return new ProgressBar(parent, options);

        var config = $.extend({}, defaults, options);
        this._steps = config.steps;
        this._throttleMs = config.throttleMs;
        this._max = config.max;
        this._min = config.min;
        this._value = config.value;
        this.ui = {};
        this.createMarkup(parent);
        this._render();
        this.setDraggable(config.draggable);

        MetaPlayer.dispatcher(this);
    };

    MetaPlayer.ProgressBar = ProgressBar;

    ProgressBar.prototype = {

        createMarkup : function (parent) {
            this.ui.track = $("<div></div>")
                .css({
                    position : "relative",
                    top : 0,
                    left : 0
                })
                .bind("mousedown touchstart", this.bind( this._onDragStart ))
                .appendTo(parent);

            this.ui.fill = $("<div></div>")
                .css({
                    position : "absolute",
                    top : 0,
                    left : 0,
                    height: "100%"
                })
                .appendTo(this.ui.track);
        },


        getPercent : function () {
            return this._value / this._range();
        },

        getValue : function () {
            return this._value;
        },

        getStep : function () {
            return Math.ceil( this.getPercent() * this._steps);
        },

        setValue : function ( val ) {
            this._value = val;
            this._render();
        },

        setDraggable : function (bool) {
            this._draggable = Boolean(bool);
            this.ui.track.css("cursor", this._draggable ? "pointer" : 'inherit');
        },

        setMin : function ( min ){
            this._min = min;
            this._render();
        },

        setMax : function ( max ){
            this._max = max;
            this._render();
        },

        _range : function () {
            return this._max - this._min;
        },

        _render : function (percent) {
            if( percent == null )
                percent = this.getPercent();

            if( this._dragging && arguments[0] == null)
                return;

            if( this._steps > 0 )
                percent = this.getStep() / this._steps;

            this.ui.fill.width( (percent * 100) + "%" );
        },

        _onDragStart : function (e) {

            if( ! this._draggable )
                return;

            this._dragging =  {
                move : this.bind(this._onDragMove),
                stop :  this.bind(this._onDragStop)
            };

            this.dispatch("dragstart");

            $(document)
                .bind("mousemove touchmove", this._dragging.move)
                .bind("mouseup touchend", this._dragging.stop);

            this._onDragMove(e);
        },

        _onDragStop : function (e) {
            if( ! this._dragging )
                return;

            $(document)
                .unbind("mousemove touchmove", this._dragging.move)
                .unbind("mouseup touchend", this._dragging.stop);

            // ensure we get a last move with the final value
            this._lastFire = null;

            this._onDragMove(e);

            this._dragging = null;

            this.dispatch("dragstop");
        },

        _onDragMove : function (e) {
            var p = this._dragPercent(e, this.ui.track );


            if(!  isNaN(p) ) { // touchend has no position info
                this._value = p * this._range() ;
                this._lastP = p;
            }
            else {
                p = this._lastP;
            }

            if( p === 0 || p > 0 )
                this._render( p );

            e.preventDefault();

            var now = (new Date()).getTime();
            if( ! this._lastFire || (now - this._lastFire > this._throttleMs) ){
                this._onThrottle();
                return;
            }

            if( ! this._timeout )
                this._timeout = setTimeout( this.bind(this._onThrottle), this._throttleMs)
        },

        _onThrottle : function () {
            clearTimeout(this._timeout);
            this._timeout = null;
            this._lastFire = (new Date()).getTime();
            this.dispatch("dragmove");
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
                    return NaN;
                pageX = oe.targetTouches[0].pageX;
            }

            var bg = this.ui.track;
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
