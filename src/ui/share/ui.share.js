

(function () {

    var $ = jQuery;

    var defaults = {
        openDelayMsec : 1000,
        hideDelayMsec : 4000,
        backButtonSec : 5,
        overlay : true,
        autoHide : true,
        embedHeight : 380,
        embedWidth : 620,
        embedTemplate : "<iframe src='{{embedURL}}' height='{{embedHeight}}px' width='{{embedWidth}}px' "+
                    " frameborder='0' scrolling='no' marginheight='0' marginwidth='0' " +
                    " style='border:0; padding:0; margin:0;'></iframe>"
    };

    MetaPlayer.addPlugin("share", function(options) {
        this.share = new MetaPlayer.UI.Share(this, options);
    });

    MetaPlayer.UI.Share = function (player, options) {
        this.player = player;
        this.config = $.extend({}, defaults, options);
        this.createMarkup(player.layout.stage);

        this.player.metadata.listen("data", this.bind( this._onData ) );
    };

    MetaPlayer.UI.Share.prototype = {

        createMarkup : function (container){
            var ui = this.ui = {};

            if( this.player.controlbar && this.player.controlbar.addButton ){
                this.player.controlbar.addButton(
                    $("<div></div>")
                        .addClass( cssName('button') )
                        .text("Share")
                        .attr('title', "Share Menu")
                        .click( this.bind ( function (e) {
                            this.toggle();
                            e.preventDefault();
                        }))
                );
            }

            // share menu
            ui.shareMenu = $("<div />")
                .hide()
                .addClass( cssName("panel"))
                .appendTo( container );

            ui.shareClose = $("<div />")
                .addClass( cssName("close"))
                .text("x")
                .click( this.bind ( function (e) {
                    this.toggle(false);
                }))
                .appendTo( ui.shareMenu );

            ui.shareButtons = $("<div />")
                .addClass( cssName("buttons"))
                .appendTo( ui.shareMenu );

            if( MetaPlayer.Social )
                this._social = new MetaPlayer.Social(ui.shareButtons, this.player );

            ui.shareEmbed = $("<div />")
                .addClass( cssName("embed"))
                .appendTo( ui.shareMenu );

            var shareLinkRow = $("<div />")
                .addClass( cssName("row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("label"))
                .text("Get Link")
                .appendTo( shareLinkRow );

            ui.shareLink = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("link"))
                .appendTo( shareLinkRow );

            var shareEmbedRow = $("<div />")
                .addClass( cssName("row"))
                .appendTo( ui.shareMenu );

            $("<div />")
                .addClass( cssName("label"))
                .text("Get Embed")
                .appendTo( shareEmbedRow );

            ui.shareEmbed = $("<input />")
                .bind("click touchstart", function (e) {  $(e.currentTarget).select() })
                .addClass( cssName("embed"))
                .appendTo( shareEmbedRow );

        },

        toggle : function (bool) {
            if( bool == null )
                bool = ! this.ui.shareMenu.is(":visible");

            if( bool && this._hasData)
                this.ui.shareMenu.stop().fadeIn();
            else
                this.ui.shareMenu.stop().fadeOut();
        },


        _onData : function () {
            this._hasData = true;
            var data = this.player.metadata.getData();
            this.ui.shareLink.val( data.ramp.linkURL );
            this.ui.shareEmbed.val( this.embedUrl( data.ramp.embedURL ) );
        },

        embedUrl : function (embedURL) {
            var dict = {
                embedHeight : this.config.embedHeight,
                embedWidth : this.config.embedWidth,
                embedURL : embedURL
            };
            return MetaPlayer.format.replace( this.config.embedTemplate, dict);
        },

        bind : function ( callback ) {
            var self = this;
            return function () {
                callback.apply(self, arguments);
            };
        }
    };

    // css namespace
    function cssName ( name ) {
        return 'mpf-share' + (name ? '-' + name : '');
    }

})();
