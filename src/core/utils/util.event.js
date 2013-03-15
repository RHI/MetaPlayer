
(function () {
    var $ = jQuery;

    /**
     * Creates a dispatcher property on an object, and mixes in a DOM style event API.
     * @name Util.EventDispatcher
     * @constructor
     * @param source A JS object, or DOM node
     */
    var EventDispatcher = function (source){

        if( source && source.dispatcher instanceof EventDispatcher)
            return source.dispatcher;

        if( ! (this instanceof EventDispatcher ))
            return new EventDispatcher(source);

        this._listeners = {};
        this.attach(source);
    };

    MetaPlayer.dispatcher = EventDispatcher;

    EventDispatcher.prototype = {

        /**
         * Extend <code>source</code> with eventDispatcher properties, via mix-in pattern.
         * @name Util.EventDispatcher#attach
         * @function
         * @param source
         */
        attach : function (source) {
            if(!  source )
                return;

            if( source.addEventListener ){
                // use the element's native core
                MetaPlayer.proxy.proxyFunction( "addEventListener removeEventListener dispatchEvent",
                    source, this);
            }
            else {
                // or enable plain objects
                MetaPlayer.proxy.proxyFunction(
                    "addEventListener removeEventListener dispatchEvent",
                    this, source);
            }

            // and add our convenience functions
            MetaPlayer.proxy.proxyFunction ( "listen forget dispatch createEvent event",
                this, source);

            source.dispatcher = this;
        },

        /**
         * disables object, frees memory references
         * @name Util.EventDispatcher#destroy
         * @function
         */
        destroy : function () {
            delete this._listeners;
            delete this.addEventListener;
            delete this.removeEventListener;
            delete this.dispatchEvent;
            this.__destroyed = true; // for debugging / introspection
        },

        /**
         * A an alias for addEventListener which allows for setting scope
         * @name Util.EventDispatcher#listen
         * @function
         * @param eventType
         * @param {Function} callback An anonymous function
         * @param [scope] The object to set as <code>this</code> when executing the callback.
         */
        listen : function ( eventType, callback, scope) {
            this.addEventListener(eventType, function (e) {
                callback.call(scope, e, e.data);
            })
        },

        forget : function (type, callback) {
            this.removeEventListener(type, callback);
        },

        /**
         * An convenience alias for dispatchEvent which creates an event of eventType,
         * sets event.data, and dispatches the event.
         * @name Util.EventDispatcher#dispatch
         * @function
         * @param {String} eventType An event name
         * @param data A value to be set to event.data before dispatching
         * @returns {Boolean} <code>true</code> if event was not cancelled.
         */
        dispatch : function (eventType, data) {
            var eventObject = this.createEvent();
            eventObject.initEvent(eventType, true, true);
            eventObject.data = data;
            return this.dispatchEvent(eventObject);
        },

        event : function ( type, obj ) {
            var eventObject = this.createEvent();
            eventObject.initEvent(type, true, true);
            $.extend( eventObject, obj );
            return this.dispatchEvent(eventObject);
        },

        /* traditional event apis */

        /**
         * Registers a callback function to be executed every time an event of evenType fires.
         * @name Util.EventDispatcher#addEventListener
         * @function
         * @param {String} eventType An event name
         * @param {Function} callback An anonymous function
         */
        addEventListener : function (eventType, callback) {
            if( ! this._listeners[eventType] )
                this._listeners[eventType] = [];
            this._listeners[eventType].push(callback);
        },

        /**
         * Un-registers a callback function previously passed to addEventListener
         * @name Util.EventDispatcher#removeEventListener
         * @function
         * @param {String} eventType An event name
         * @param {Function} callback An anonymous function
         */
        removeEventListener : function (type, callback) {
            var l = this._listeners[type] || [];
            var i;
            for(i=l.length - 1; i >= 0; i-- ){
                if( l[i] == callback ) {
                    l.splice(i, 1);
                }
            }
        },

        /**
         * Creates an Event object which can be configured and dispatched with dispatchEvent
         * @name Util.EventDispatcher#createEvent
         * @function
         * @param {String} eventType An event name
         */
        createEvent : function (eventType) {
            if( document.createEvent )
                return document.createEvent(eventType || 'Event');

            return new EventDispatcher.Event();
        },

        /**
         * Triggers any callbacks associated with eventObject.type
         * @name Util.EventDispatcher#dispatchEvent
         * @function
         * @param {Event} eventObject created with createEvent
         * @returns {Boolean} <code>true</code> if event was not cancelled.
         */
        dispatchEvent : function (eventObject) {

            if(! eventObject.type.match(/^time/) )
                MetaPlayer.log("event", eventObject.type, eventObject);
            else
                MetaPlayer.log("time", eventObject.type, eventObject);

            // copy so that removeEventListener doesn't break iteration
            var l = ( this._listeners[eventObject.type] || [] ).concat();

            for(var i=0; i < l.length; i++ ){
                if( eventObject.cancelBubble ) // via stopPropagation()
                    break;
                l[i].call(l[i].scope || this, eventObject, eventObject.data )
            }
            return ! eventObject.defaultPrevented;
        }

    };

    /**
     * Used as an Event object in browsers which do not support document.createEvent
     * @name Util.Event
     * @constructor
     */
    EventDispatcher.Event = function () {
        this.cancelBubble = false;
        this.defaultPrevented = false;
    };

    EventDispatcher.dispatch = function (dispatcher, eventType, data ) {
        var eventObject;
        if( document.createEvent )
            eventObject = document.createEvent('Event');
        else
            eventObject =  new EventDispatcher.Event();

        eventObject.initEvent(eventType, true, true);
        if( data instanceof Object )
            $.extend(eventObject, data);
        return dispatcher.dispatchEvent(eventObject);
    };

    EventDispatcher.Event.prototype = {
        /**
         * Sets event properties
         * @name Util.Event#initEvent
         * @function
         * @param {String} eventType An event name
         * @param {Boolean} bubbles  Not used by non-DOM dispatchers
         * @param {Boolean} cancelable  Enables preventDefault()
         */
        initEvent : function (eventType, bubbles, cancelable)  {
            this.type = eventType;
            this.cancelable = cancelable;
        },

        /**
         * Cancels the event from firing any more callbacks.
         * @name Util.Event#stopPropagation
         * @function
         */
        stopPropagation : function () {
            this.cancelBubble  = true;
        },

        /**
         * Cancels the event. For non-DOM object, same as stopPropegation()
         * @name Util.Event#stopImmediatePropagation
         * @function
         */
        stopImmediatePropagation : function () {
            this.cancelBubble  = true;
        },

        /**
         * Indicates a default action should be skipped, by causing dispatchEvent()
         * to return false.
         * @name Util.Event#preventDefault
         * @function
         */
        preventDefault : function () {
            if( this.cancelable )
                this.defaultPrevented = true;
        }
    };


})();
