(function () {

    var $ = jQuery;

    var defaults = {
    };

    /**
     * Constructs the MetaData store. <br />
     * @name API.MetaData
     * @class Stores metadata for video items.
     * @constructor
     */
    var MetaData = function (options){
        if( !(this instanceof MetaData ))
            return new MetaData(options);

        this.config = $.extend({}, defaults, options);
        MetaPlayer.dispatcher(this);
        this._data = {};
        this._callbacks = {};
        this._lastUri = null;
    };

    MetaPlayer.MetaData = MetaData;

    /**
     * Fired when a uri becomes the focus, broadcasting events on updates.
     * @name API.MetaData#event:FOCUS
     * @event
     * @param {Event} e
     * @param e.uri The new focus uri
     */
    MetaData.FOCUS = "focus";

    /**
     * Fired when MetaData needs a resource to be defined.
     * @name API.MetaData#event:LOAD
     * @event
     * @param {Event} e
     * @param e.uri Opaque string which can be used by a service to load metadata.
     */
    MetaData.LOAD = "load";

    /**
     * Fired when new metadata is received as a result of a load() request.
     * @name API.MetaData#event:DATA
     * @event
     * @param {Event} e
     * @param e.data The metadata from a resulting load() request.
     */
    MetaData.DATA = "data";


    MetaData.prototype =  {


        /**
         * Request MetaData for an uri.  If no callback is specified, will also
         * set the focus uri.
         * @name API.MetaData#load
         * @function
         * @param uri
         * @param [callback] If specified will suppress the DATA event
         * @see MetaData#event:DATA
         * @see MetaData#event:FOCUS
         */
        load : function ( uri, callback, scope) {
            var e;

            // calling  w/ a callback will not trigger a focus change or DATA events
            if( callback ) {
                this._queue(uri, callback, scope);
            }

            // no callback, let others know focus has changed, that a DATA event is coming
            else {
                this.setFocusUri(uri);
            }

            if( ! uri )
                return;

            if( this._data[uri] ){
                // cache hit; already loaded. respond immediately
                if( this._data[uri]._cached ) {
                    // consistently async
                    var self = this;
                    setTimeout( function (){
                        self._response(uri);
                    },0);
                    return true;
                }
                // load in progress, skip
                else if ( this._data[uri]._loading ) {
                    return true;
                }
            }

            // flag as loading
            if( ! this._data[uri] )
                this._data[uri] = {};
            this._data[uri]._loading =  (new Date()).getTime();

            // send a loading request, with any data we have
            e = this.createEvent();
            e.initEvent(MetaData.LOAD, false, true);
            e.uri = uri;
            e.data = this.getData(uri);

            // see if anyone caught our request, return accordingly
            var caught = ! this.dispatchEvent(e);
            if( ! caught ) {
                this._data[uri]._loading = false;
            }
            return caught;
        },

        /**
         * Gets the uri for which events are currently being fired.
         * @name API.MetaData#getFocusUri
         * @function
         * @return {String} The current focus URI.
         */
        getFocusUri : function () {
            return this._lastUri;
        },

        /**
         * Sets the uri for which events are currently being fired.
         * @name API.MetaData#setFocusUri
         * @function
         * @see MetaData#event:FOCUS
         */
        setFocusUri : function (uri) {
            this._lastUri = uri;
            this._firedDataEvent = false;
            var e = this.createEvent();
            e.initEvent(MetaData.FOCUS, false, true);
            e.uri = uri;
            this.dispatchEvent(e);
        },

        /**
         * Returns any cached data for a URI if available. Differs from load() in that
         * it is synchronous and will not trigger a new data lookup.
         * @name API.MetaData#getData
         * @function
         * @param uri Optional argument specifying media guid. Defaults to last load() uri.
         */
        getData : function ( uri ){
            var guid = uri || this._lastUri;
            return this._data[guid]
        },

        /**
         * Sets the data for a URI, triggering DATA if the uri has focus.
         * @name API.MetaData#setData
         * @function
         * @param data {Object}
         * @param uri (optional) Data uri, or last load() uri.
         * @param cache (optional) allow lookup of item on future calls to load(), defaults true.
         * @see MetaData#event:DATA
         */
        setData : function (data, uri, cache ){
            var guid = uri || this._lastUri;
            // dont't clobber known data with cache half-datas
            if( !( this._data[guid] && ! cache) ){
                this._data[guid] = $.extend(true, {}, this._data[guid], data);
                this._data[guid]._cached = ( cache == null ||  cache ) ? true : false;
            }
            if( cache )
                this._response(guid);
        },

        /**
         * Frees external references for manual object destruction.
         * @name API.MetaData#destroy
         * @function
         * @destructor
         */
        destroy : function  () {
            this.dispatcher.destroy();
            delete this._callbacks;
            delete this._data;
            delete this.config;
        },

        // registers a callback
        _queue : function ( uri, callback, scope ) {
            if( ! this._callbacks[uri] )
                this._callbacks[uri] = [];
            this._callbacks[uri].push({ fn : callback, scope : scope });
        },

        // handles setting data, firing event and callbacks as necessary
        _response : function ( uri ){
             var data = this._data[uri];

            if( this._lastUri == uri && ! this._firedDataEvent) {
                var e = this.createEvent();
                e.initEvent(MetaData.DATA, false, true);
                e.uri = uri;
                e.data = data;
                this.dispatchEvent(e);
                this._firedDataEvent = true;
            }

            if( this._callbacks[uri] ) {
                $.each( this._callbacks[uri] || [], function (i, callback ) {
                    callback.fn.call(callback.scope, data);
                });
                delete this._callbacks[uri];
            }
        }
    };


})();