( function () {
    var $ = jQuery;

    var defaults = {
        cssPrefix : "metaplayer-embed",

        label : "Embed:",

        sizes : [
            {name: 'large', width: 960, height: 590},
            {name: 'medium', width: 620, height: 380},
            {name: 'small', width: 400, height: 245}
        ],

        embedUrl : "{{embedURL}}&width={{width}}&height={{height}}",

        embedCode : '<iframe src="{{src}}" height="{{height}}px" width="{{width}}px" ' +
            'frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ' +
            'style="border:0; padding:0; margin:0;"></iframe>'

    };

    var Embed = function (target, player, options) {
        this.config = $.extend(true, {}, defaults, options);
        this.container = target;
        this.addDom();
        player.metadata.listen(MetaPlayer.MetaData.DATA, this.onMetaData, this );
    };

    MetaPlayer.Embed  = Embed;

    MetaPlayer.addPlugin("embed", function (target, options) {
        this.embed = new Embed(target, this, options);
    });

    Embed.prototype = {

        onMetaData : function (e) {
            this._metadata = e.data;

            if( this._current )
                this.open(this._current); // re-render

            this.find().show();
        },

        addDom : function () {
            var el = this.create().hide().appendTo(this.container);
            var self = this;

            this.create("header")
                .text(this.config.label)
                .appendTo(el);

            $.each( this.config.sizes, function (i, embed) {
                self.create("button")
                    .addClass( self.cssName(embed.name) )
                    .appendTo(el)
                    .append( self.create('label').text(embed.name) )
                    .attr('title', embed.width + "x" + embed.height)
                    .click( function (e) {
                        self.onClick(embed);
                    });
            });

            this.create("clear", "br")
                .css('clear', 'both')
                .css('height', '1')
                .appendTo(el);

            var textbox = this.create("textbox")
                .hide()
                .appendTo(el);

            var close = this.create("close")
                .html('&otimes;')
                .appendTo(textbox)
                .click( function () { self.close() });

            this.create("text", "textarea")
                .attr('readonly', 'readonly')
                .appendTo(textbox);
        },

        onClick : function (embed) {
            if( this._current && this._current.name == embed.name ) {
                this.close();
                return;
            }
            this.open(embed);
        },

        open : function (embed) {

            this.close();

            this._current = embed;

            this.find(embed.name).addClass( this.cssName('selected') );

            var data = this._metadata;
            // {{var}} substituation with anything in size config
            var dict = $.extend({}, data.ramp, data, embed);

            dict.src = encodeURI( Embed.templateReplace( this.config.embedUrl, dict) );

            var code = Embed.templateReplace( this.config.embedCode, dict);

            this.find('textbox').show();
            this.find('text').val( code ).select();
        },

        close : function () {
            this.find('selected').removeClass( this.cssName('selected') );
            this.find('textbox').hide();
            delete this._current;
        },


        find : function (className){
            return $(this.container).find('.' + this.cssName(className) );
        },
        create : function (className, tagName){
            if( ! tagName )
                tagName = "div";
            return $("<" + tagName + ">").addClass( this.cssName(className) );
        },

        cssName : function (className){
            return  this.config.cssPrefix + (className ? '-' + className : '');
        }
    };

    Embed.templateReplace = function (template, dict) {
        return template.replace( /\{\{(\w+)\}\}/g,
            function(str, match) {
                return dict[match];
            });
    };

})();
