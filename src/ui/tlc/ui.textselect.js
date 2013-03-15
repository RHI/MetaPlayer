
(function () {

    var $ = jQuery;

    var defaults = {
        intervalMSec : 1000
    };

    window.TextSelector = function (id, callback ) {
        if( ! (this instanceof TextSelector))
            return new TextSelector(id, callback);

        this.callback = callback;
        this.el = $(id);

        this.body = $("<span />)")
            .appendTo(this.el);

        this._lastRange = null;

        if(  MetaPlayer.iOS ) {
            this.el
                .bind("touchstart", this.bind( this.onStart ))
                .bind("touchend", this.bind( this.onStop ))
                .addClass("mpf-text-select");
            this.startInterval();
        }
        else {
            this.el
                .bind("mousedown", this.bind( this.onStart ))
                .bind("mouseup", this.bind( this.onStop ));
        }
    };


    TextSelector.prototype = {

        startInterval : function () {
            this.interval = setInterval( this.bind( this.onTime), defaults.intervalMSec);
        },

        onStart : function (){
        },

        onStop : function () {
            this.update();
        },

        onTime : function () {
            this.update();
        },

        update : function (){
            var range =  TextSelector.getSelectionRange();

            if( ! range ) {
                range = {
                    startOffset : 0,
                    endOffset : 0,
                    toString : function () { return "" }
                };
            }

            var last = this._lastRange;
            if( ! last
                || (last.startOffset != range.startOffset)
                || (last.endOffset != range.endOffset) ) {

                this._lastRange = range;
                this._text = range.toString();
                if( this._text )
                    this.callback( this._text, this._time(range.startOffset) );
            }
        },


        captions : function (captions) {
            this.captions = captions;
            var text = [];

            $.each(captions, this.bind( function (i, cc ) {
                text.push(cc.text);
            }));

            this.tx = text.join('');

            this.render();
        },

        render : function () {
            this.body.text(this.tx);
        },

        _time : function ( offset ) {
            var len = 0;
            var cc, i;
            for(i = 0; i < this.captions.length; i++ ){
                cc = this.captions[i];
                len += cc.text.length;
                if( len > offset )
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
    };


    TextSelector.getSelectionRange  = function () {
        var range = null;

        if( window.getSelection != null ){
            var sel = getSelection();
            if (sel.rangeCount)
                range =  sel.getRangeAt(0);
        } else if ( document.selection != null) {
            if (document.selection.type == "Text")
                range = document.selection.createRange();
        }
        return range;
    }


})();



