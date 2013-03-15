
(function () {

    var $ = jQuery;

    var defaults = {
    };

    var defaultSettings = {
        lang : 'en',
        textEdge : 'edge-drop',
        textOpacity : 'opacity-normal',
        textColor : 'white',
        textFont : 'font-default',
        textSize : 'size-100',
        frameOpacity : 'alpha-semi',
        frameColor : 'black'
    };

    var rules = {
        'size-50' : {
            'font-size' : '.5em'
        },
        'size-100' : {
            'font-size' : '1em'
        },
        'size-150' : {
            'font-size' : '1.5em'
        },
        'size-200' : {
            'font-size' : '2em'
        },

        'edge-none' : {
            filter: 'none',
            'text-shadow' : 'none'
        },
        'edge-drop' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=1,offY=1,color=000000)',
            'text-shadow' : '#000000 .05em .05em 2px'
        },
        'edge-outline' : {
            filter: 'glow(color=black,strength=3)',
            'text-shadow' : '#000000 1px 1px 0, #000000 -1px -1px 0, #000000 1px -1px 0, #000000 -1px 1px 0'
        },
        'edge-raised' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=-1,offY=-1,color=ffffff)',
            'text-shadow' : '#ffffff -1px -1px 0'
        },
        'edge-depressed' : {
            filter: 'progid:DXImageTransform.Microsoft.DropShadow(offX=1,offY=1,color=ffffff)',
            'text-shadow' : '#ffffff 1px 1px 0'
        },
        'edge-uniform' : {
            filter: 'glow(color=white,strength=3)',
            'text-shadow' : '#ffffff 1px 1px 0, #ffffff -1px -1px 0, #ffffff 1px -1px 0, #ffffff -1px 1px 0'
        },

        'opacity-normal' : {
            'opacity' : '1'
        },
        'opacity-semi' : {
            'opacity' : '.75'
        },

        'alpha-trans' : {
            '_alpha' : '0'
        },
        'alpha-semi' : {
            '_alpha' : '.5'
        },
        'alpha-opaque' : {
            '_alpha' : '1'
        },

        'white' : {
            'color' : '#ffffff'
        },
        'red' : {
            'color' : '#ff0000'
        },
        'magenta' : {
            'color' : '#ff27ff'
        },
        'yellow' : {
            'color' : '#ffff00'
        },
        'green' : {
            'color' : '#00ff00'
        },
        'cyan' : {
            'color' : '#00ffff'
        },
        'blue' : {
            'color' : '#0000ff'
        },
        'black' : {
            'color' : '#000000'
        },

        'font-mono-sans' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Andale Mono, monospace"
        },
        'font-prop-sans' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Arial, sans-serif"
        },
        'font-mono-serif' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Courier, monospace"
        },
        'font-prop-serif' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Times, serif"
        },
        'font-casual' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Comic Sans, Comic Sans MS, fantasy"
        },
        'font-cursive' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Lucida Handwriting, cursive"
        },
        'font-small-caps' : {
            'text-transform' : 'uppercase',
            "font-family" : "Verdana, sans-serif",
            "font-size" : ".9em"
        },
        'font-default' : {
            'text-transform' : 'none',
            "font-size" : "1em",
            "font-family" : "Verdana, sans-serif"
        }
    };
    var CaptionConfig = function (parent, target, options) {
        if( !(this instanceof CaptionConfig ))
            return new CaptionConfig(parent, target, options);

        this.config = $.extend({}, defaults, options);
        this.data = {};
        this.ui = {};
        this.target = $(target);
        this.createMarkup(parent);
        this.close();
        this.load();

        $(window).bind('storage', this.bind( function  (e){
            this.load();
        }));
    };

    MetaPlayer.addPlugin("captionconfig", function (options) {
        var captionconfig =  CaptionConfig(this.layout.stage, this.layout.base, options);

        if( this.controlbar && this.controlbar.addButton )
            this.controlbar.addButton(
                $("<div></div>")
                    .addClass("mp-cc-settings-btn")
                    .attr('title', "Configure Captions")
                    .click( captionconfig.bind( captionconfig.toggle ) )
        );

        this.captionconfig =  captionconfig;

        // initialize so that our render has a target
        if( ! this.captions.focus )
            this.captions();

        this.listen("ready", function () {
            captionconfig.render();
        });
    });

    MetaPlayer.CaptionConfig = CaptionConfig;

    CaptionConfig.prototype = {

        render: function  () {
            var t = $(this.target);
            var settings =  this.data;

            var textCss = {};
            textCss = $.extend( textCss, rules[settings.textEdge] );
            textCss = $.extend( textCss, rules[settings.textOpacity] );
            textCss = $.extend( textCss, rules[settings.textColor] );
            textCss = $.extend( textCss, rules[settings.textFont] );
            t.find('.mp-cc-text').css(textCss);

            var frameCss = {};
            frameCss = $.extend( frameCss, rules[settings.frameOpacity] );
            frameCss = $.extend( frameCss, rules[settings.frameColor] );
            frameCss = $.extend( frameCss, rules[settings.textSize] );
            frameCss.background = rgba( frameCss.color, frameCss._alpha );
            t.find('.mp-cc-frame').css(frameCss);
        },

        toggle : function () {
            if( this.ui.base.is(":visible") )
                this.close();
            else
                this.open();
        },

        close : function (){
            this.ui.base.toggle(false);
        },

        open : function (){
            this.ui.base.toggle(true);
        },

        load : function () {
            this.data = $.extend({}, defaultSettings);
            var save = localStorage.getItem("com.ramp.mpf.caption.settings");
            try {
                if( save != null ){
                    this.data = $.extend( this.data, JSON.parse(save) );
                }
            }
            catch (e) {
                //... ignore bad json
            }
            this.resetForm();
            this.render();
        },

        resetForm: function (settings) {
            this.ui.langSelect.val(this.data.lang);
            this.ui.displaySelect.val(this.data.display)
            this.ui.textFont.val(this.data.textFont);
            this.ui.textColor.select(this.data.textColor);
            this.ui.frameColor.select(this.data.frameColor);
            this.ui.textSize.select(this.data.textSize);
            this.ui.textEdge.select(this.data.textEdge);
            this.ui.textOpacity.select(this.data.textOpacity);
            this.ui.frameOpacity.select(this.data.frameOpacity);
            this.render()
        },

        setRule : function (name, rule) {
            this.data[name] = rule;
            this.render();
            this.save();
        },

        save : function () {
            var save = JSON.stringify(this.data);
            localStorage.setItem("com.ramp.mpf.caption.settings", save);
        },

        createMarkup : function (parent){

            this.ui.base = $('<div></div>')
                .addClass('mp-cc-config')
                .appendTo(parent);

            this.ui.panel = $('<div></div>')
                .addClass('mp-cc-config-panel')
                .appendTo(this.ui.base);

            // header
            this.ui.header = $("<div></div>")
                .addClass("mp-cc-config-header")
                .appendTo(this.ui.panel);

            $("<div></div>")
                .addClass("mp-cc-config-badge")
                .appendTo(this.ui.header);

            $("<div></div>")
                .addClass("mp-cc-config-title")
                .text("Closed Captions")
                .appendTo(this.ui.header);

            var headerRight = $("<div></div>")
                .addClass("mp-cc-config-header-right")
                .appendTo(this.ui.header);

            $("<div></div>")
                .addClass("mp-cc-config-reset")
                .text("Reset")
                .click( this.bind( function(e) {
                    this.data = $.extend({}, defaultSettings);
                    this.resetForm();
                }))
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-separator")
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-save")
                .text("Save")
                .click( this.bind( function(e) {
                    this.close();
                }))
                .appendTo(headerRight);

            $("<div></div>")
                .addClass("mp-cc-config-hr")
                .appendTo(this.ui.panel);

            // body
            var body = $("<div></div>")
                .addClass("mp-cc-config-body")
                .appendTo(this.ui.panel);

            // body left col
            var left = $("<div></div>")
                .addClass("mp-cc-config-left")
                .appendTo(body);


            this.ui.langSelect =  this.textSelect([
                    {
                        name : "English",
                        value : "en"
                    }
                ]);
//            this.row( "Language", this.ui.langSelect).appendTo(left);

            this.ui.textFont =  this.textSelect([
                    {
                        name : "Verdana",
                        value : "font-default"
                    },
                    {
                        name : "Andale",
                        value : "font-mono-sans"
                    },
                    {
                        name : "Arial",
                        value : "font-prop-sans"
                    },
                    {
                        name : "Courier",
                        value : "font-mono-serif"
                    },
                    {
                        name : "Times",
                        value : "font-prop-serif"
                    },
                    {
                        name : "Casual",
                        value : "font-casual"
                    },
                    {
                        name : "Cursive",
                        value : "font-cursive"
                    },
                    {
                        name : "Capitals",
                        value : "font-small-caps"
                    }
                ])
                .change( this.bind( function(e) {
                    this.setRule("textFont", $(e.currentTarget).val() );
                }));
            this.row( "Font", this.ui.textFont).appendTo(left);


            this.ui.displaySelect =  this.textSelect([
                    {
                        name : "Pop On",
                        value : "pop"
                    },
                    {
                        name : "Roll Up",
                        value : "roll"
                    },
                    {
                        name : "Paint On",
                        value : "paint"
                    }
                ]);
//            this.row( "Display", displaySelect).appendTo(left);

            this.ui.textColor = ColorSelect().onChange( this.bind( function (val){
                this.setRule("textColor", val);
            }));
            this.row( "Text Color", this.ui.textColor.dom).appendTo(left);

            this.ui.frameColor = ColorSelect().onChange( this.bind( function (val){
                this.setRule("frameColor", val);
            }));
            this.row( "Frame Color", this.ui.frameColor.dom).appendTo(left);

            // body right col
            var right = $("<div></div>")
                .addClass("mp-cc-config-right")
                .appendTo(body);

//            $("<div></div>")
//                .addClass("mp-cc-config-row-empty")
//                .appendTo(right);


            var textTemplate ='<div class="mp-cc-config-text-template"><div>ABC</div></div>';

            this.ui.textSize = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textSize', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-size-50"),  "size-50")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-100"), "size-100")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-150"), "size-150")
                .append( $(textTemplate).addClass("mp-cc-config-text-size-200"), "size-200");
            this.ui.textSize.dom.addClass("mp-cc-config-text-size");
            this.row("Text Size", this.ui.textSize.dom ).appendTo(right);


            this.ui.textEdge = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textEdge', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-none"), 'edge-none')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-drop"), 'edge-drop')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-outline"), 'edge-outline')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-raised"), 'edge-raised')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-depressed"), 'edge-depressed')
                .append( $(textTemplate).addClass("mp-cc-config-text-edge-uniform"), 'edge-uniform');
            this.ui.textEdge.dom.addClass("mp-cc-config-text-edge");
            this.row("Text Edge", this.ui.textEdge.dom ).appendTo(right);


            this.ui.textOpacity = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('textOpacity', val);
                }))
                .append( $(textTemplate).addClass("mp-cc-config-text-opacity-normal"), 'opacity-normal')
                .append( $(textTemplate).addClass("mp-cc-config-text-opacity-semi"), 'opacity-semi');
            this.ui.textOpacity.dom.addClass("mp-cc-config-text-opacity");
            this.row("Text Opacity", this.ui.textOpacity.dom ).appendTo(right);

            var frameTemplate ='<div class="mp-cc-config-frame-opacity"><div class="mp-cc-config-frame-fill"></div></div>';

            this.ui.frameOpacity = Carousel()
                .onChange( this.bind( function (val) {
                    this.setRule('frameOpacity', val);
                }))
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-trans"), 'alpha-trans')
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-semi"), 'alpha-semi' )
                .append( $(frameTemplate).addClass("mp-cc-config-frame-opacity-opaque"), 'alpha-opaque' );
            this.ui.frameOpacity.dom.addClass("mp-cc-config-text-opacity");
            this.row("Frame Opacity", this.ui.frameOpacity.dom ).appendTo(right);


            // clear body
            $("<div></div>")
                .addClass("mp-cc-config-clear")
                .appendTo(body);

            // footer, sample
           this.ui.footer = $("<div></div>")
                .addClass("mp-cc-config-footer")
                .appendTo(this.ui.panel);

            var bg = $('<div></div>')
                .addClass("mp-cc-frame")
                .appendTo(this.ui.footer);

            $('<span></span>')
                .addClass("mp-cc-text")
//                .text("The quick brown fox jumps over the lazy dog")
                .text("Sample Caption")
                .appendTo(bg)
        },

        row : function (label, content) {
            var row = $("<div></div>")
                .addClass("mp-cc-config-row");

            $("<div></div>")
                .text(label)
                .addClass("mp-cc-config-label")
                .appendTo(row);

            var body = $("<div></div>")
                .addClass("mp-cc-config-row-body")
                .append( content )
                .appendTo(row);

            return row;
        },

        textSelect : function (options) {
            var select = $("<select></select>")
                .addClass("mp-cc-config-select");

            $.each(options, function (i, option) {
                $("<option></option>")
                    .text(option.name)
                    .val(option.value)
                    .addClass("mp-cc-config-option")
                    .appendTo(select);
            });
            return select;
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // an array of color boxes selector
    var ColorSelect = function () {
        if( ! (this instanceof ColorSelect) )
            return new ColorSelect();

        this.ui = {};
        this.index = null;
        this.values = [];
        this.callbacks = [];

        this.dom = $("<div></div>")
            .addClass("mp-cc-config-colorbox")
            .delegate(".mp-cc-config-color", "click", this.bind( function (e){
                var i = $(e.currentTarget).data('index');
                this.select(i)
            }));

        $.each(this.colors, this.bind( function (i, name) {
            this.colorBox(rules[name].color ).data('index', i).appendTo(this.dom);
        }));
    };

    ColorSelect.prototype = {
        colors : ['white', 'red', 'magenta', 'yellow', 'green', 'cyan', 'blue', 'black'],

        colorBox : function (color){
            var el = $("<div></div>")
                .addClass("mp-cc-config-color");

            $("<div></div>")
                .addClass("mp-cc-config-fill")
                .css('background', color)
                .appendTo(el);
            return el
        },

        select : function (index) {

            if( typeof index == "string" ) {
                var search = index;
                index = null;
                $.each( this.colors, function (i, val) {
                    if( val == search ) {
                        index = i;
                        return true;
                    }
                });
            }

            if( index == null || isNaN(index) )
                return;

            var children = this.dom.children();
            if( index == this.index )
                return;

            this.index = index;
            children.removeClass("mp-cc-config-color-selected");
            $(children[index]).addClass("mp-cc-config-color-selected");

            var val = this.colors[index];
            $.each(this.callbacks, function (i, callback) {
                callback( val );
            });
        },

        onChange : function ( fn ){
            this.callbacks.push(fn);
            return this;
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // an arrow-base selector that loops
    var Carousel = function () {
        if( ! (this instanceof Carousel) )
            return new Carousel();

        this.ui = {};
        this.index = null;
        this.values = [];
        this.callbacks = [];
        this.dom = $("<div></div>").addClass("mp-cc-config-carousel");

        $("<div></div>")
            .addClass("mp-cc-config-carousel-next")
            .click( this.bind(this.next) )
            .mousedown( function (e) { e.preventDefault() })
            .appendTo( this.dom );

        this.ui.body = $("<div></div>")
            .addClass("mp-cc-config-carousel-body")
            .appendTo( this.dom );

        $("<div></div>")
            .addClass("mp-cc-config-carousel-previous")
            .mousedown( function (e) { e.preventDefault() })
            .click( this.bind(this.previous) )
            .appendTo( this.dom );
    };

    Carousel.prototype = {
        select : function (index) {
            if( typeof index == "string" ) {
                var search = index;
                index = null;
                $.each( this.values, function (i, val) {
                    if( val == search ) {
                        index = i;
                        return true;
                    }
                });
            }

            if( index == null || isNaN(index) )
                return;


            var children = this.ui.body.children();
            var i = (index + children.length) % children.length; // avoids negative mods
            if( i == this.index )
                return;

            children.hide();
            $( children[i] ).show();
            this.index = i;

            var val = this.value();
            $.each(this.callbacks, function (i, callback) {
                callback( val );
            });
        },

        onChange : function ( fn ){
            this.callbacks.push(fn);
            return this;
        },

        value : function ( index ) {
            if( index == null )
                index = this.index;
            return this.values[index];
        },

        append : function (el, value) {
            if( value == null)
                value = this.values.length;

            this.ui.body.append( $(el).hide() );
            this.values.push( value  );
            return this;
        },

        next : function (e) {
            this.select(this.index + 1);
            e && e.preventDefault() && e.stopPropagation();
        },

        previous : function (e) {
            this.select(this.index - 1);
            e && e.preventDefault() && e.stopPropagation();
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }

    };

    function rgba (hex, alpha) {
        if( ! (hex && alpha) )
            return '';

        var rgba = [
            parseInt( hex.substr(1,2), 16),
            parseInt( hex.substr(3,2), 16),
            parseInt( hex.substr(5,2), 16),
            parseFloat(alpha)
        ];
        return "rgba(" + rgba.join(",") + ")";
    }
})();