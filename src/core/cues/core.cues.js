(function () {

    var $ = jQuery;

    var defaults = {
    };

    var Cues = function (player, options){

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._cues = {};

        this._rules = {
            // default rule mapping "captions" to popcorn "subtitle"
            "subtitle" : { clone : "captions" }
        };

        this.player = player;
        this._addListeners();
    };

    MetaPlayer.Cues = Cues;

    /**
     * Fired when cues are available for the focus uri.
     * @name CUES
     * @event
     * @param data The cues from a resulting load() request.
     * @param uri The focus uri
     * @param plugin The cue type
     */
    Cues.CUES = "cues";

    Cues.prototype = {
        /**
         * Bulk adding of cue lists to a uri.
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
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCueLists : function ( uri) {
            var guid = uri || this.player.metadata.getFocusUri();
            return this._cues[guid];
        },

        /**
         * For a given cue type, adds an array of cues events, triggering a CUE event
         * if the uri has focus.
         * @param type The name of the cue list (eg: "caption", "twitter", etc)
         * @param cues An array of cue obects.
         * @param uri (optional) Data uri, or last load() uri.
         */
        setCues : function (type, cues , uri){
            var guid = uri || this.player.metadata.getFocusUri();

            if( ! this._cues[guid] )
                this._cues[guid] = {};

            this._cues[guid][type] = cues;

            this._dispatchCues(guid, type)
        },

        /**
         * Returns an array of caption cues events. Shorthand for getCues("caption")
         * @param uri (optional) Data uri, or last load() uri.
         */
        getCaptions : function ( uri ){
            return this.getCues("captions", uri);
        },

        /**
         * Returns an array of cue objects for a given type. If no type specified, acts
         * as alias for getCueLists() returning a dictionary of all cue types and arrays.
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
            return this._cues[guid][type];
        },

        /**
         * Enables popcorn events for a cue type
         * @param type Cue type
         * @param overrides Optional object with properties to define in each popcorn event, such as target
         * @param rules (advanced) Optional rules hash for cloning, sequencing, and more.
         */
        enable : function (type, overrides, rules) {
            var r = $.extend({}, this._rules[type], rules);
            r.overrides = $.extend({}, r.overrides, overrides);
            r.enabled = true;
            this._rules[type] = r;

            this._renderCues(type, this.getCues( r.clone || type) )
        },

        /**
         * Disables popcorn events for a cue type
         * @param type Cue type
         */
        disable : function (type) {
            if( ! type )
                return;

            if( this._rules[type] )
                this._rules[type].enabled = false;

            this._removeEvents(type);
        },

        /**
         * Frees external references for manual object destruction.
         * @destructor
         */
        destroy : function  () {
            this._removeEvents();
            this.dispatcher.destroy();
            delete this.player;
        },

        /* "private" */

        // broadcasts cue data available for guid, if it matches the current focus uri
        // defaults to all known cues, or can have a single type specified
        // triggers attachment of popcorn events
        _dispatchCues : function ( guid, type ) {

            // only focus uri causes events
            if( guid != this.player.metadata.getFocusUri() ) {
                return;
            }

            var self = this;
            var types = [];

            // specific cue type to be rendered
            if( type ) {
                types.push(type)
            }

            // render all cues
            else if( this._cues[guid] ){
                types = $.map(this._cues[guid], function(cues, type) {
                    return type;
                });
            }

            $.each(types, function(i, type) {
                var cues = self.getCues(type);

                var e = self.createEvent();
                e.initEvent(Cues.CUES, false, true);
                e.uri = guid;
                e.plugin = type;
                e.cues = cues;

                if( self.dispatchEvent(e) ) {
                   // allow someone to cancel, blocking popcorn scheduling
                    self._renderCues(type, cues)
                }
            });
        },

        _addListeners : function () {
            var player = this.player;
            var metadata = player.metadata;
            player.listen( MetaPlayer.DESTROY, this.destroy, this);
            metadata.listen( MetaPlayer.MetaData.FOCUS, this._onFocus, this)
        },

        _onFocus : function (e) {
            //... remove all popcorn events because the track has changed
            this._removeEvents();
            this._dispatchCues( e.uri );
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

})();