(function () {

    var $ = jQuery;    

    var defaults = {
        cssPrefix : "metaplayer-preview",
    };

    var Preview = function (player, options) {
        
        this.config = $.extend(true, {}, defaults, options);

        this.player = player;
        this.video = player.video;

        this.dispatcher = MetaPlayer.dispatcher ( this.player.video );
        this.dispatcher.attach(this);


        this._init();  

    };

    MetaPlayer.Preview = Preview;    

    MetaPlayer.addPlugin("preview", function (options){

        this.preview = new Preview(this, options);

    });

    Preview.prototype = {
        _init : function() {
            this._createMarkup();
            this._addListeners();
            this.togglePreview(true);
        },

        _createMarkup : function() {
            this.el = $('<div></div>').appendTo(this.player.layout.stage)
                .addClass(this.config.cssPrefix)
                .append("<img>");

            this.imageEl = this.el.find('img');
        },

        _addListeners : function() {
            var self = this;
            var metadata = this.player.metadata;

            metadata.listen(MetaPlayer.MetaData.DATA, function(e) {
                self._setPreviewImage(e.data.thumbnail);
            });
            
            this.dispatcher.listen('play', function(e) {
                self.togglePreview(false);
            });
            
            this.dispatcher.listen('end', function(e) {
                self.togglePreview(true);
            });
        },

        _setPreviewImage : function(thumbnailSrc) {            
            this.previewImage = thumbnailSrc;
            
            var height = $(this.player.layout.base).css('height');
            var width = $(this.player.layout.base).css('width');

            this.imageEl.attr('src', this.previewImage);
            this.imageEl.attr('height', height);
            this.imageEl.attr('width', width);
        },

        togglePreview : function(bool) {
            if (bool) {
                this.imageEl.fadeIn(bool);  
            }
            else {
                this.imageEl.fadeOut();
            }
        }
    }

})();