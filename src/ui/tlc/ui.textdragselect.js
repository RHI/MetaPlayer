
(function () {

    var $ = jQuery;

    window.TextSelector = function (id, callback ) {
        if( ! (this instanceof TextSelector))
            return new TextSelector(id, callback);

        this.callback = callback;
        this.el = $(id);
        this.el.addClass("mpf-text-select");

        this.start = 0;
        this.startpoint =0;
        this.endpoint =0;

        var noop = function (e){
            if( ! (e.metaKey || e.shiftKey) )
              e.preventDefault();
        };

//        this.textarea = $("<textarea></textarea>)")
//            .attr("readonly", "readonly")
//            .bind("mousemove touchmove", this.bind( this.update ) )
//            .bind("blur", this.bind( this.onBlur ) )
//            .appendTo(this.el);


        this.el
            .bind("mousemove touchmove", this.bind( this.onMouseMove ))
            .bind("mouseup touchend", this.bind( this.onMouseUp ));

        this.before = $("<span />)")
            .appendTo(this.el);

        this.start = $("<span />)")
            .bind("mousedown touchstart", this.bind( function (e) {
                this.dragging = {
                    knob : this.start,
                    isStart : true,
                    offset : this.startpoint
                };
                e.preventDefault();
            }))
            .addClass("tx-start")
            .appendTo(this.el);


        this.body = $("<span />)")
            .addClass("tx-select")
            .appendTo(this.el);

        this.stop = $("<span />)")
            .bind("mousedown touchstart", this.bind( function (e) {
                this.dragging = {
                    knob : this.stop,
                    isStart : false,
                    offset : this.endpoint
                };
                e.preventDefault();
            }))
            .addClass("tx-end")
            .appendTo(this.el);


        this.after = $("<span />)")
            .appendTo(this.el);
    };


    TextSelector.prototype = {

        onMouseUp : function (event){
            this.dragging = null;
        },

        onMouseMove : function (event) {
            if( this.dragging == null )
                return;

            var oe = event.originalEvent;
            var pageX = event.pageX;
            var pageY = event.pageY;


            if( oe.targetTouches ) {
                if( ! oe.targetTouches.length )
                    return NaN;
                pageX = oe.targetTouches[0].pageX;
                pageY = oe.targetTouches[0].pageY;
            }

            var x =  pageX;
            var y =  pageY;

            this.x = x;
            this.y = y;

            clearTimeout(this.delay);
            this.delay = setTimeout( this.bind( this.onDelay), 10);
        },

        onDelay : function (event){
            if( this.dragging == null )
                return;
            this.dragging.knob.css('opacity', 0);
            this.moveY(this.y);
            this.dragging.knob.css('opacity', 1);
        },

        moveY : function (y) {
            var ldy, dy, lo;

            var n = 0,
                max = this.tx.length;

            while( n++ < max ) {
                var mo = this.dragging.knob.offset();
                mo.bottom = mo.top + this.dragging.knob.height();

                // move left
                if( y < mo.top ) {
                    dy = mo.top - y;
                    this.dragging.offset -= 1;
                }

                // move right
                else if( y > mo.bottom ) {
                    dy = y - mo.bottom;
                    this.dragging.offset += 1;
                }

                // y looks good, figure out y
                else {
                    this.moveX(this.x);
                    break;
                }

                // notice if we've overshot
                if( ldy != null && ldy < dy ){
                    this.position(lo, this.dragging.isStart );
                    this.moveX(this.x);
                    break;
                }

                // break on string boundaries
                if( this.dragging.offset > max || this.dragging.offset < 0 ){
                    break;
                }

                ldy = dy;
                lo = this.dragging.offset;
                this.position( this.dragging.offset, this.dragging.isStart );
            }
        },

        moveX : function (x) {
            var ldx, dx, lo;

            var n = 0,
                max = this.tx.length;

            while( n++ < max ) {
                var mo = this.dragging.knob.offset();
                mo.right = mo.left + this.dragging.knob.width();


                dx = Math.min(mo.left - x, x - mo.right);

                // move left
                if( x < mo.left ) {
                    dx = mo.left - x;
                    this.dragging.offset -= 1;
                }

                // move right
                else if( x > mo.right ) {
                    dx = x - mo.right;
                    this.dragging.offset += 1;
                }

                // y looks good, figure out x
                else {
                    break; //
                }

                // notice if we've overshot
                if( ldx != null && ldx < dx ){
                    this.position(lo, this.dragging.isStart );
                    break;
                }

                // break on string boundaries
                if( this.dragging.offset > max || this.dragging.offset < 0 ){
                    break;
                }

                ldx = dx;
                lo = this.dragging.offset;
                this.position( this.dragging.offset, this.dragging.isStart );
            }
        },

        position : function (offset, isStart ){
            // in theory, we should never have to change more than 2 of 3 text spans
            // this is the core of our hack, and needs to be as optimized as a hack can be

            var wasEmpty = this.startpoint == this.endpoint;

            // need to update startpoint
            if( isStart || offset < this.startpoint ){
                this.startpoint = offset;
                this.before.text( this.tx.slice(0, this.startpoint) );
            }

            // need to update endpoint
            if( ! isStart || offset > this.endpoint ) {
                this.endpoint = offset;
                this.after.text( this.tx.slice(this.endpoint ) );
            }

            // render body unless was & is still empty
            if( !(wasEmpty && this.startpoint == this.endpoint) ){
                this.body.text( this.tx.slice(this.startpoint, this.endpoint) );
            }

        },

        captions : function (captions) {
            this.captions = captions;
            var text = [];

            $.each(captions, this.bind( function (i, cc ) {
                text.push(cc.text);
            }));

            this.tx = text.join('');

            this.position(5);
        },

        time : function () {
            var len = 0;
            var cc, i;
            for(i = 0; i < this.captions.length; i++ ){
                cc = this.captions[i];
                len += cc.text.length;
                if( len > this.start )
                    return cc.start;
            }

            return 0;
        },

        bind : function ( fn ) {
            var self = this;
            return function () {
                return fn.apply(self, arguments);
            }
        }
    }

})();



