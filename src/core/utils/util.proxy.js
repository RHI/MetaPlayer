(function () {
    var $ = jQuery;

    var Proxy = {
        proxyProperty : function (props, source, target ){
            $.each(props.split(/\s+/g), function (i, prop) {
                Proxy.mapProperty(prop, target, source);
            });
        },

        proxyFunction : function (props, source, target ){
            $.each(props.split(/\s+/g), function (i, prop) {
                target[prop] = function () {
                    return source[prop].apply(source, arguments);
                };
            });
        },

        proxyEvent : function (types, source, target ){
            // emulate if old non-standard event model
            if( ! target.addEventListener ) {
                Ramp.dispatcher(target);
            }
            $.each(types.split(/\s+/g), function (i, type) {
                source.addEventListener(type, function (e) {
                    // if emulated, just use type
                    if( target.dispatch ) {
                        target.dispatch(e.type);
                        return;
                    }
                    // else use standard model
                    var evt = document.createEvent("Event");
                    evt.initEvent(e.type, false, false);
                    target.dispatchEvent(evt);
                });
            });
        },

        mapProperty : function (props, target, source, method){
            // example :   map("name" myObject, myObject._name);
            //             map("name" myObject);
            if( ! source )
                source = target;

            $.each(props.split(/\s+/g), function (i, prop) {

                // support _propName
                var sProp = (source[prop] == undefined)
                    ?  "_" + prop
                    : prop;

                var fn;

                if( source[sProp] instanceof Function ){
                    fn = function () {
                        return source[sProp].apply(source, arguments);
                    };
                }
                else {
                    fn = function (val) {
                        if( val !== undefined )
                            source[sProp] = val;
                        return source[sProp];
                    };
                }

                Proxy.define(target, prop, { get : fn, set : fn });
            });
        },

        define : function (obj, prop, descriptor) {
            try {
                // modern browsers
                return Object.defineProperty(obj, prop, descriptor);
            }
            catch(e){
                // ie8 exception if not DOM element
            }

            // older, pre-standard implementations
            if( obj.__defineGetter && descriptor.get )
                obj.__defineGetter__( prop, descriptor.get);
            if( descriptor.set && obj.__defineSetter__ )
                obj.__defineSetter__( prop, descriptor.set);

            // ie7 and other old browsers fail silently
        },

        // returns an object which can safely used with Object.defineProperty
        // IE8: can't do javascript objects
        // iOS: can't do DOM objects
        // use DOM where possible
        getProxyObject : function ( dom ) {

            // All modern browsers (and ie8)
            if( ! dom )
                dom = document.createElement("div");

            try {
                Object.defineProperty(dom, "__proptest", {} );
                return dom;
            }
            catch(e){
            }

            // iOS, fake as best we can, adding props as needed
            var target = {
                _proxyNode : dom,
                parentNode : dom.parentNode,
                tagName : dom.tagName,
                ownerDocument : dom.ownerDocument,
                style : dom.style,
                appendChild : function() { dom.appendChild.apply(dom, arguments) }
            };
            try {
                Object.defineProperty(target, "__proptest", {} );
                return target;
            }
            catch(e){
            }

            throw "Object.defineProperty not defined";
        },

        proxyPlayer : function (source, target) {
            var proxy = Ramp.proxy.getProxyObject(target);

            Proxy.mapProperty("duration currentTime volume muted seeking" +
                " paused controls autoplay preload src ended readyState",
                proxy, source);

            Proxy.proxyFunction("load play pause canPlayType" ,source, proxy);

            Proxy.proxyPlayerEvents(source, proxy);

            return proxy;
        },

        proxyPlayerEvents : function (source, target){
            Proxy.proxyEvent("timeupdate seeking seeked playing play pause " +
                "loadeddata loadedmetadata canplay loadstart durationchange volumechange " +
                "ended error",source, target);
        }
    };

    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.proxy = Proxy;


})();
