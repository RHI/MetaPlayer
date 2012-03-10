
(function () {
    var $ = jQuery;

    var EventDispatcher = function (source){

        if( source && source.dispatcher instanceof EventDispatcher)
            return source.dispatcher;

        if( ! (this instanceof EventDispatcher ))
            return new EventDispatcher(source);

        this._listeners = {};
        this.attach(source);
    };

    MetaPlayer.dispatcher = EventDispatcher;

    EventDispatcher.Event = function () {
        this.cancelBubble = false;
        this.defaultPrevented = false;
    };

    EventDispatcher.Event.prototype = {
        initEvent : function (type, bubbles, cancelable)  {
            this.type = type;
            this.cancelable = cancelable;
        },
        stopPropagation : function () {
            this.cancelBubble  = true;
        },
        stopImmediatePropagation : function () {
            this.cancelBubble  = true;
        },
        preventDefault : function () {
            if( this.cancelable )
                this.defaultPrevented = true;
        }
    },

    EventDispatcher.prototype = {

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
            MetaPlayer.proxy.proxyFunction ( "listen forget dispatch createEvent",
                this, source);

            source.dispatcher = this;
        },

        destroy : function () {
            delete this._listeners;
            delete this.addEventListener;
            delete this.removeEventListener;
            delete this.dispatchEvent;
            this.__destroyed = true; // for debugging / introspection
        },

        listen : function ( eventType, callback, scope) {
            this.addEventListener(eventType, function (e) {
                callback.call(scope, e, e.data);
            })
        },

        forget : function (type, callback) {
            this.removeEventListener(type, callback);
        },

        dispatch : function (eventType, data) {
            var eventObject = this.createEvent();
            eventObject.initEvent(eventType, true, true);
            eventObject.data = data;
            return this.dispatchEvent(eventObject);
        },

        // traditional event apis
        addEventListener : function (eventType, callback) {
            if( ! this._listeners[eventType] )
                this._listeners[eventType] = [];
            this._listeners[eventType].push(callback);
        },

        removeEventListener : function (type, callback) {
            var l = this._listeners[type] || [];
            var i;
            for(i=l.length - 1; i >= 0; i-- ){
                if( l[i] == callback ) {
                    l.splice(i, 1);
                }
            }
        },

        createEvent : function (type) {
            if( document.createEvent )
                return document.createEvent(type || 'Event');

            return new EventDispatcher.Event();
        },

        dispatchEvent : function (eventObject) {

//            if( eventObject.type != "timeupdate")
//                   console.log(eventObject.type, eventObject);

            var l = this._listeners[eventObject.type] || [];
            for(var i=0; i < l.length; i++ ){
                if( eventObject.cancelBubble ) // via stopPropagation()
                    break;
                l[i].call(l[i].scope || this, eventObject, eventObject.data )
            }
            return ! eventObject.defaultPrevented;
        }

    }

})();
