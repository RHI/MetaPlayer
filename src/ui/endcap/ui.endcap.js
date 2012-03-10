
(function () {

    var $ = jQuery;

    var defaults = {
        target : '',
        cssPrefix : 'metaplayer-endcap',
        template : 'templates/ui.endcap.tmpl.html',
        siteSearchUrl : "",
        countDownSec : 20,
        fbUrl : 'http://www.facebook.com/plugins/like.php',
        fadeMs : 250
    };

    var EndCap = function (player, options) {

        if( !(this instanceof EndCap ))
            return new EndCap(player, options);

        this.config = $.extend({}, defaults, options);
        this.player = player;

        this.baseUrl = MetaPlayer.script.base();

        this.container = this.player.layout.stage;
        this.getTemplate();

    };

    MetaPlayer.addPlugin("endcap", function (options) {
        this.endcap =  EndCap(this, options);
    });

    EndCap.prototype = {

        getTemplate : function () {
            var url = this.baseUrl + this.config.template;
            $.ajax(url , {
                context: this,
                success : function (data){
                    $(this.container).append(data);
                    this.init();
                }
            });
        },

        init : function  (){
            var self = this;
            var video = this.player.video;
            var metadata = this.player.metadata;
            var playlist = this.player.playlist;

            metadata.listen(MetaPlayer.MetaData.DATA, this.onTrackChange, this);
            playlist.listen("playlistchange", this.onTrackChange, this);

            $(video).bind('play playing seeked loadstart', function () {
                self.onPlaying();
            });

            $(video).bind('ended', function () {
                self.onEnded();
            });

            this.find('countdown').click( function (e) {
                self.countdown.toggle();
                e.stopPropagation();
            });
            this.find().click( function (e) {
                self.countdown.stop();
            });
            this.find('preview').click( function () {
                playlist.next();
            });
            this.find('repeat').click( function () {
                video.currentTime = 0;
                video.play();
            });

            this.find('search-btn').click( function (e) {
                self.doSiteSearch();
            });

            this.find('search-input').keypress( function (e) {
                if (e.which == 13 ) {
                    self.doSiteSearch();
                }
            });

            playlist.advance = false;

            this.countdown = Ramp.timer(1000, this.config.countDownSec);
            this.countdown.listen('time', this.onCountdownTick, this);
            this.countdown.listen('complete', this.onCountdownDone, this);


            if( MetaPlayer.Embed ) {
                this.embed = new MetaPlayer.Embed(this.find('embed'), this.player);
                this.find('embed').show();
            }

            if( MetaPlayer.Social )
                this.social = new MetaPlayer.Social( this.find('social'), this.player );

            this.toggle(false, true);
        },

        doSiteSearch : function  () {
            var q = this.find('search-input').val();
            var url = this.siteSearchUrl || this.config.siteSearchUrl;
            url += encodeURIComponent(q);
            top.location = url;
        },

        onEnded : function () {
            this.countdown.start();
            var count = this.find('countdown').text( this.config.countDownSec );
            this.toggle(true);
        },

        onPlaying : function () {
            this.countdown.reset();
            this.toggle(false);
        },

        toggle : function (bool, now) {
            var el = this.find().stop();

            if( bool === undefined )
                bool = ! ( el.is(":visible") );

            if( now ){
                el.toggle(bool);
                return;
            }

            if( bool )
                el.show().animate({ opacity: 1}, this.config.fadeMs);
            else
                el.animate({ opacity: 0 }, this.config.fadeMs, function (){
                    $(this).hide();
                });
        },

        onTrackChange : function (e) {

            var data = this.player.metadata.getData();
            if( ! data )
                return;

            this.toggle(false);
            this.find('again-thumb').attr('src', data.thumbnail);
            this.find('again-title').text(data.title);
            this.find('again').show();

            if( data.ramp )
                this.siteSearchUrl = data.ramp.siteSearchURL;

            this.find('next').hide();

            var nextup = this.player.playlist.nextTrack();
            if( nextup )
                this.player.metadata.load( nextup, this.onNextData, this )
        },

        onNextData : function (data) {
            this.find('preview-thumb').attr('src', data.thumbnail);
            this.find('preview-title').text(data.title);
            this.find('next').show();
        },

        onCountdownTick : function (e) {
            var count = this.find('countdown');
            count.text( Math.round(e.data.remain ) );
        },

        onCountdownDone : function (e) {
            this.player.playlist.next();
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
            return this.config.cssPrefix + (  className ?  '-' + className : '' );
        }
    };

})();