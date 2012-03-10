(function () {

    var $ = jQuery;

    var defaults = {
    };

    var MetaData = function (player, options){
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
     * @name FOCUS
     * @event
     * @param uri The new focus uri
     */
    MetaData.FOCUS = "focus";

    /**
     * Fired when MetaData needs a resource to be defined.
     * @name LOAD
     * @event
     * @param uri Opaque string which can be used by a service to load metadata.
     */
    MetaData.LOAD = "load";

    /**
     * Fired when new metadata is received as a result of a load() request.
     * @name LOAD
     * @event
     * @param data The metadata from a resulting load() request.
     */
    MetaData.DATA = "data";


    MetaData.prototype = {

        /**
         * Request MetaData for an uri
         * @param uri
         * @param callback (optional)  If specified will suppress the DATA event
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

            if( this._data[uri] ){
                // cache hit; already loaded. respond immediately
                if( this._data[uri]._cached ) {
                    this._response(uri);
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
         * Returns the uri for which events are currently being fired.
         */
        getFocusUri : function () {
            return this._lastUri;
        },

        /**
         * Sets the uri for which events are currently being fired.
         */
        setFocusUri : function (uri) {

            if( this._lastUri == uri )
                return;

            this._lastUri = uri;
            e = this.createEvent();
            e.initEvent(MetaData.FOCUS, false, true);
            e.uri = uri;
            this.dispatchEvent(e);
        },

        /**
         * Returns any for a URI without causing an external lookup.
         * @param uri Optional argument specifying media guid. Defaults to last load() uri.
         */
        getData : function ( uri ){
            var guid = uri || this._lastUri;
            return this._data[guid]
        },

        /**
         * Sets the data for a URI, triggering DATA if the uri has focus.
         * @param data
         * @param uri (optional) Data uri, or last load() uri.
         * @param cache (optional) allow lookup of item on future calls to load(), defaults true.
         */
        setData : function (data, uri, cache ){
            var guid = uri || this._lastUri;
            this._data[guid] = $.extend(true, {}, this._data[guid], data);
            this._data[guid]._cached = ( cache == null ||  cache ) ? true : false;
            this._response(guid);
        },

        /**
         * Frees external references for manual object destruction.
         * @destructor
         */
        destroy : function  () {
            this.dispatcher.destroy();
            delete this.player;
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

            if( this._lastUri == uri ) {
                var e = this.createEvent();
                e.initEvent(MetaData.DATA, false, true);
                e.uri = uri;
                e.data = data;
                this.dispatchEvent(e);
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