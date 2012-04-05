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

    MetaPlayer.Layout = function (target, options){
        this.config = $.extend({}, defaults, options);

        this.target = $(target).get(0);
        this.panels = [];

        // the base is for controls, stage
        if( this.target.play instanceof Function )
            this.base = this._setupVideo();

        else if( this.target )
            this.base = this._setupContainer();

        // the stage is a container for all overlays
        if( this.base )
            this.stage = this._addStage();
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

        addPanel : function (options) {
            var box = $.extend({},
                MetaPlayer.Layout.PANEL_OPTIONS,
                options);

            this.panels.push( box );
            this._renderPanels(0);
            return (this.panels.length - 1);
        },

        getPanel : function (id) {
            return this.panels[id] || null;
        },

        togglePanel : function (id, bool, duration) {
            var p = this.getPanel(id);
            if( ! p )
                return;
            p.enabled = bool;
            this._renderPanels(duration);
        },

        updatePanel : function (id, options, duration) {
            var box = $.extend( this.getPanel(id),
                options);
            this._renderPanels(duration);
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

            v.stop().animate({
                'margin-top': box.top,
                'margin-left': box.left,
                'width' : w,
                'height' : h
            }, msec);
        },

        // deprecated: removed to allow click-through
        _sizeOverlays : function (box, duration) {
            var msec = (duration != null) ? duration : this.config.sizeMsec;

            $(this.base).find('.mp-stage')
                .stop()
                .animate({
                    top : box.top,
                    right : box.right,
                    bottom : box.bottom,
                    left : box.left
                }, msec);
        },

        _setupContainer : function (container) {
            return $(this.target)
                .addClass("metaplayer")
                .get(0);
        },

        _setupVideo : function () {

            this.video = this.target;
            var v = $(this.video);
            var container = v.parents(".metaplayer");

            if( ! container.length ) {
                if( ! this.config.adoptVideo )
                    return;
                container = $("<div></div>")
                    .addClass("metaplayer")
                    .insertAfter(v)
                    .append(v);
            }
            container.width( v.width() );
            container.height( v.height() );

            return container.get(0);
        },

        _addStage : function () {
            return $("<div></div>").addClass("mp-stage").appendTo(this.base).get(0);
        }


    };


})();