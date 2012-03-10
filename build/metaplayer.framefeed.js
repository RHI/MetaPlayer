/*
Metaplayer - A standards-based, multiple player, UI and Event framework for JavaScript.

Copyright (c) 2011 RAMP Holdings, Inc.

Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/
(function () {

    var $ = jQuery;
    var Popcorn = window.Popcorn;

    var defaults = {
        cssPrefix : "mp-ff",
        filterMsec : 500,
        revealMsec : 1500,
        duplicates : false,
        baseUrl : ""
    };

    var FrameFeed = function (target, options) {

        var t = $(target);
        target = t.get(0);

        // return intance if exists
        if( target && FrameFeed.instances[ target.id ] ){
            return FrameFeed.instances[ target.id ];
        }

        if( ! (this instanceof FrameFeed) )
            return new FrameFeed(target, options);

        this.config = $.extend(true, {}, defaults, options);


        this.target = $("<div></div>")
            .addClass( this.cssName("scroller") )
            .width("100%")
            .height("100%")
            .appendTo(target);

        this.scrollbar = MetaPlayer.scrollbar(target);
        this.seen = {};
        this.init();

        MetaPlayer.dispatcher(this);

        FrameFeed.instances[ target.id ] = this;
    };

    FrameFeed.instances = {};


    MetaPlayer.addPlugin("framefeed", function (target, options){
        this.cues.enable("framefeed", { target : target });
        this.framefeed = FrameFeed(target, options);
    });

    MetaPlayer.framefeed = FrameFeed;

    FrameFeed.prototype = {

        init : function () {
            var t = $(this.target);
            this.items = [];
            t.addClass( this.cssName() );
        },

        filter: function (query) {
            this.hideAll();
            this.query = query;
            this.render();
            this.scrollbar.scrollTo(0);

        },

        hideAll : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.hideItem(val);
            });
            this.dispatch("size")
        },

        render : function  () {
            var self = this;
            $.each(this.items, function (i, val) {
                self.renderItem(val);
            });
            this.scrollbar.render();
        },

        filtered : function (obj) {
            return ( this.query && (! obj.tags || ! obj.tags.match(this.query) ) );
        },

        focus : function (obj) {
            this.render();
            obj.active = true;
            this.frame(obj, true);
        },

        blur : function (obj) {
            obj.active = false;
            this.hideItem(obj);
            this.scrollbar.render();
        },


        frame : function (obj, animate) {
            if( typeof obj == "string" ){
                obj = { url :  obj };
            }

            var url = obj.url;
            if(! url.match('^http') && this.config.baseUrl )
                url = this.config.baseUrl + url;


            if( this.seen[url] && this.seen[url].start != obj.start && ! this.config.duplicates) {
                return;
            }
            this.seen[url] = obj;

            var self = this;

            if( ! obj.item ){
                obj.loadAnimate = true;
                var frame = $("<iframe frameborder='0'></iframe>")
                    .attr("src", url)
                    .attr("scrolling", "no")
                    .attr("marginheight", 0)
                    .attr("marginwidth", 0)
                    .bind("load", function () {
                        obj.loaded = true;
                        self.renderItem(obj,
                            obj.loadAnimate ? self.config.revealMsec : null);
                    })
                    .attr("height", obj.height);

                obj.item = $("<div></div>")
                    .addClass( this.cssName("box") )
                    .prependTo( this.target )
                    .append(frame);

                this.hideItem( obj );;
                this.items.push(obj);
            }
            else {
                this.renderItem(obj, this.config.revealMsec);
            }
        },

        hideItem : function (obj) {
            obj.item
                .height(0)
                .hide()
                .css('opacity', 0)
        },

        renderItem : function (obj, duration) {
            obj.item.stop();
            obj.loadAnimate = false;

            if( ! obj.active || ! obj.loaded || this.filtered(obj) ){
                this.hideItem(obj);
                return;
            }

            var rendered = obj.item.css('opacity') == 1;
            if( rendered ){
                return;
            }
            obj.item.show();

            var scroll = this.scrollbar.scrollTop();
            var self = this;

            if( scroll > 0 || ! duration ){
                // fade in without height animation
                obj.item
                    .height(obj.height)
                    .animate({
                        opacity: 1
                    }, this.config.filterMsec );

                if( scroll && duration) {
                    this.scrollbar.scrollTo( 0 , scroll + obj.height );
                }
            }
            // else scroll and fade in
            else {
                obj.item.animate({
                    height: obj.height,
                    opacity: 1
                }, duration, function () {
                    self.scrollbar.render();
                });
            }
            self.dispatch("size");
        },

        clear : function () {
            $(this.target).empty();
        },

        /* util */
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

    if( Popcorn ) {
        Popcorn.plugin( "framefeed" , {

            _setup: function( options ) {
                FrameFeed(options.target);
            },

            start: function( event, options ){
                FrameFeed(options.target)
                    .focus(options);
            },

            end: function( event, options ){
                FrameFeed(options.target)
                    .blur(options);
            },

            _teardown: function( options ) {
                FrameFeed(options.target)
                    .clear();
            }
        });
    }


})();
