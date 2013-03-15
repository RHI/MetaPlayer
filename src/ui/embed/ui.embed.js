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

    /**
     * @name UI.Embed
     * @class Embed is a PopcornJS plugin which present buttons which can be used to summon
     * a textbox with embed code for various sizes.
     * @description Embed can be provided with lightweight string templates which can be used
     * to access any properties of {@link API.MetaData#getData}, as well as a 'src' property which
     * is an alias to the embedUrl template. String variables are escaped with double curly brackets.
     * @constructor Constructor method.
     * @param {Element} id The DOM or jQuery element to which the buttons will be added.
     * @param {MetaPlayer} [player] A MetaPlayer instance
     * @param {Object} [options]
     * @param {Object} [options.embedUrl] A string template for the URL generated.
     * @param {Object} [options.embedCode] A string template for the code generated, which
     * by default contains a reference to embedUrl.
     * @param {Object} [options.sizes]
     * @param {String} [options.label] The label preceding the buttons in the DOM.
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed")
     *     .load();
     *
     * @example
     * # with default options
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed", {
     *          label : "Embed:",
     *          sizes : [
     *              {name: 'large', width: 960, height: 590},
     *              {name: 'medium', width: 620, height: 380},
     *              {name: 'small', width: 400, height: 245}
     *          ],
     *          embedUrl : "{{embedURL}}&width={{width}}&height={{height}}",
     *          embedCode : '&lt;iframe src="{{src}}" height="{{height}}px" width="{{width}}px" ' +
     *              'frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ' +
     *              'style="border:0; padding:0; margin:0;">&lt;/iframe>'
     *     })
     *     .load();
     *
     * @see <a href="http://jsfiddle.net/ramp/PaTgf/">Live Example</a>
     * @see MetaPlayer#embed
     */
    var Embed = function (target, player, options) {
        this.config = $.extend(true, {}, defaults, options);
        this.container = target;
        this.addDom();
        player.metadata.listen(MetaPlayer.MetaData.DATA, this.onMetaData, this );
    };

    MetaPlayer.Embed  = Embed;

    /**
     * @name MetaPlayer#embed
     * @function
     * @description
     * Creates a {@link UI.Embed} instance with the given target and options.
     * @param {Element} id The DOM or jQuery element to which the buttons will be added.
     * @param {Object} [options]
     * @example
     * var mpf = MetaPlayer(video)
     *     .ramp("http://api.ramp.com/v1/mp2/playlist?e=52896312&apikey=0302cd28e05e0800f752e0db235d5440")
     *     .embed("#embed")
     *     .load();
     * @see UI.Embed
     */
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
