(function () {

    var $ = jQuery;

    var defaults = {
    };

    /**
     * @class Stores all timed metadata, integrates with PopcornJS to schedule cues. <br/>
     * @constructor
     * @name API.Cues
     * @param {MetaPlayer} player
     */
    var Cues = function (player, options){

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._cues = {};

        this._rules = {
            // default rule mapping "captions" to popcorn "subtitle"
            "subtitle" : { clone : "captions", enabled : true }
        };

        this.player = player;
        this._addListeners();
    };

    MetaPlayer.Cues = Cues;

    /**
     * Fired when cues are available for the focus uri.
     * @name API.Cues#event:CUES
     * @event
     * @param {Event} e
     * @param e.data The cues from a resulting load() request.
     * @param e.uri The focus uri
     * @param e.plugin The cue type
     */
    Cues.CUES = "cues";

    /**
     * Fired when cue list reset, usually due to a track change
     * @name API.Cues#event:CLEAR
     * @event
     * @param {Event} e
     */
    Cues.CLEAR = "clear";
    Cues.RENDER = "render";
    Cues.ENABLE = "enable";
    Cues.DISABLE = "disable";

    Cues.prototype = {
        /**
         * Bulk adding of cue lists to a uri.
         * @name API.Cues#setCueLists
         * @function
         * @param cuelists a dictionary of cue arrays, indexed by type.
         * @param uri (optional) Data uri, or last load() uri.
         */
        setCueLists : function ( cuelists , uri) {
            var self = this;
            $.each(cuelists, function(type, cues){
                self.setCues(type, cues, uri)
            });
        },

        /**
         * Returns a dictionary of cue arrays, indexed by type.
         * @name API.Cues#getCueLists
         * @function
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCueLists : function ( uri) {
            var guid = uri || this.player.metadata.getFocusUri();
            return this._cues[guid];
        },

        /**
         * For a given cue type, adds an array of cues events, triggering a CUE event
         * if the uri has focus.
         * @name API.Cues#setCues
         * @function
         * @param type The name of the cue list (eg: "caption", "twitter", etc)
         * @param cues An array of cue obects.
         * @param uri (optional) Data uri, or last load() uri.
         */
        setCues : function (type, cues , uri){
            var guid = uri || this.player.metadata.getFocusUri();

            if( ! this._cues[guid] )
                this._cues[guid] = {};

            if( ! this._cues[guid][type] )
                this._cues[guid][type] = [];

            this._cues[guid][type] = cues;

            // data normalization
            $.each(cues, function (i, val) {
                if( typeof val.start == "string" )
                    val.start = parseFloat(val.start);
                if( typeof val.end == "string" )
                    val.start = parseFloat(val.end);
            });

            if( uri == this.player.metadata.getFocusUri() )
                this._renderCueType(type);
        },

        /**
         * Returns an array of caption cues events. Shorthand for getCues("caption")
         * @name API.Cues#getCaptions
         * @function
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCaptions : function ( uri ){
            return this.getCues("captions", uri);
        },

        /**
         * Returns an array of cue objects for a given type. If no type specified, acts
         * as alias for getCueLists() returning a dictionary of all cue types and arrays.
         * @name API.Cues#getCues
         * @function
         * @param type The name of the cue list (eg: "caption", "twitter", etc)
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCues : function (type, uri) {
            var guid = uri || this.player.metadata.getFocusUri();

            if( ! type ) {
                return this.getCueLists();
            }

            if( this._rules[type] && this._rules[type].clone ){
                type = this._rules[type].clone;
            }

            if(! this._cues[guid]  || ! this._cues[guid][type])
                return [];

            return this._cues[guid][type].sort( Cues.cueSortFn );
        },

        /**
         * Enables popcorn events for a cue type
         * @name API.Cues#enable
         * @function
         * @param type Cue type
         * @param overrides Optional object with properties to define in each popcorn event, such as target
         * @param rules (advanced) Optional rules hash for cloning, sequencing, and more.
         */
        enable : function (type, overrides, rules) {
            var r = $.extend({}, this._rules[type], rules);
            if(r.enabled )
                return;
            r.overrides = $.extend({}, r.overrides, overrides);
            r.enabled = true;
            this._rules[type] = r;

            var event = this.createEvent();
            event.initEvent(Cues.ENABLE, false, true);
            event.action = type;
            this.dispatchEvent(event);

            this._scheduleCues(type, this.getCues( r.clone || type) )
        },

        /**
         * Disables popcorn events for a cue type
         * @name API.Cues#disable
         * @function
         * @param type Cue type
         */
        disable : function (type) {
            if( ! type )
                return;

            if(! this._rules[type] )
                this._rules[type] = {};

            this._rules[type].enabled = false;

            var event = this.createEvent();
            event.initEvent(Cues.DISABLE, false, true);
            event.action = type;
            this.dispatchEvent(event);

            this._removeEvents(type);
        },

        isEnabled : function (type) {
            var r = this._rules[type]
            return Boolean(r && r.enabled);
        },

        /**
         * Frees external references for manual object destruction.
         * @name API.Cues#destroy
         * @function
         * @destructor
         */
        destroy : function  () {
            this._removeEvents();
            this.dispatcher.destroy();
            delete this.player;
        },

        /* "private" */

        _renderCueType : function (type){
            var guid = this.player.metadata.getFocusUri();
            var cues = this.getCues(type, guid);
            this._renderCues(type, cues)
            this.event(Cues.CUES, {
                uri : guid,
                plugin: type,
                cues : cues
            })
        },

        _addListeners : function () {
            var player = this.player;
            var metadata = player.metadata;
            player.listen( MetaPlayer.DESTROY, this.destroy, this);
            metadata.listen( MetaPlayer.MetaData.FOCUS, this._onFocus, this)
            metadata.listen( MetaPlayer.MetaData.DATA, this._onData, this)
        },

        _onFocus : function (e) {
            //... remove all popcorn events because the track has changed
            this._removeEvents();

            // let others know we've cleared
            var event = this.createEvent();
            event.initEvent(Cues.CLEAR, false, true);
            this.dispatchEvent(event);
        },

        _onData : function (e) {
            // render all cues
            var self = this;
            $.map(this._cues[e.uri] || [], function(cues, type) {
                self._renderCueType(type);
            });

            var event = this.createEvent();
            event.initEvent(Cues.RENDER, false, true);
            event.uri = e.uri;
            this.dispatchEvent(event);
        },

        _removeEvents : function ( type ) {
            var popcorn = this.player.popcorn;
            if( popcorn ) {
                var events = popcorn.getTrackEvents();
                $.each(events, function (i, e){
                    if( !type || type == e._natives.type )
                        popcorn.removeTrackEvent(e._id);
                });
            }
        },

        _renderCues : function (type, cues){
            var self = this;

            this._scheduleCues(type, cues);

            // additionally schedule any clones
            $.each( this._rules, function (plugin, rules){
                if( rules.clone == type ){
                    self._scheduleCues(plugin, cues)
                }
            });
        },

        _scheduleCues : function (type, cues) {
            var rules = this._rules[type] || {};
            var lastCue;

            this._removeEvents(type);

            if(! rules.enabled ) {
                return;
            }

            // deep copy of cues
            var events = $.extend(true, [], cues );

            // "sequence" automatically fills in missing cue end times with next cue start
            if( rules.sequence ) {
                $.each(events, function (i, event) {
                    if( lastCue )
                        lastCue.end = event.start;
                    lastCue = event;
                });
            }

            // "duration" sets a fixed length for any cue
            if( rules.duration ) {
                $.each(events, function (i, event) {
                    event.end = event.start + rules.duration;
                });
            }

            // "overrides" allow for page-specific event overrides
            if( rules.overrides ) {
                $.each(events, function (i, event) {
                    $.extend(true, event, rules.overrides)
                });
            }

            // schedule with popcorn instance
            var popcorn = this.player.popcorn;
            if( popcorn && popcorn[type] instanceof Function  ) {
                $.each(events, function(i, cue){
                    popcorn[type].call(popcorn, $.extend({}, cue) );
                });
            }
        }

    };

    Cues.cueSortFn = function (one, two){
        return parseFloat( one.start ) - parseFloat( two.start );
    };

})();