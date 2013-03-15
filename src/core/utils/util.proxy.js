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
                if( !  source[prop] )
                    return;
                target[prop] = function () {
                    return source[prop].apply(source, arguments);
                };
            });
        },

        proxyEvent : function (types, source, target ){
            // emulate if old non-standard event model
            if( ! target.addEventListener ) {
                MetaPlayer.dispatcher(target);
            }
            $.each(types.split(/\s+/g), function (i, type) {
                source.addEventListener(type, function (e) {
                    // if emulated, just use type
                    if( target.dispatch ) {
                        target.dispatch(e.type, e.data);
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
            descriptor.configurable = true;
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
            if( descriptor.set && obj.__defineSetter__ ) {
                obj.__defineSetter__( prop, descriptor.set);
            }

            // ie7 and other old browsers fail silently
        },

        // returns an object which can safely used with Object.defineProperty
        // IE8: can't do javascript objects
        // iOS: can't do DOM objects
        // use DOM where possible
        getProxyObject : function ( source ) {

            // if already a proxy object
            if( source && source._proxyFor )
                return source;

            var dom = document.createElement("div");
            var proxy;

            try {
                // 1) Proxy can be a DOM node (CR/FF4+/IE8+)  !iOS !IE7
                // iOS4 throws error on any dom element
                // iOS4 throws error specifically on parentElement
                // ie7 has no setter support whatsoever
                proxy = dom;
                Object.defineProperty(proxy, "parentElement", {
                    get : function () {
                        return source.parentElement;
                    },
                    configurable : true
                });
            }

            catch(e){
                // 2) Proxy is a JS Object, (CR/FF/IE9/iOS) !IE7, !IE8
                // ie8 only supports getters on DOM elements.
                proxy = {};
                Proxy.mapProperty("children", proxy, dom);
                Proxy.proxyFunction("appendChild removeChild prependChild", dom, proxy);
            }

            if( source ) {
                // proxy the source element in attributes the best we can.
//                we only care about standard dom properties, and FF blows up when you iterate an object tag

//                $.map(dom,  function (val, key) {
                var key, val;
                for( key in dom ) {

                    // skip some, either because we don't want to proxy them (append child, etc)
                    // or because they break (eg. dom["filters"] throws an error in IE8)
                    if( key.match(/filters|child|textContent|nodeName|nodeType/i) )
                        continue;

                    val = undefined;
                    try {
                        val = dom[key];  // document.createElement('p').offsetParent throws exception in ie8
                    }
                    catch(e){}

                    if( val && val instanceof Function )
                        Proxy.proxyFunction(key, source, proxy);
                    else
                        Proxy.mapProperty(key, proxy, source);
                }
            }

            if( proxy !== dom ){
                // map child methods so as not to modify original dom node
                // here we lie to jQuery: it refuses to bind nodeType "object"
                Proxy.mapProperty("nodeName nodeType children textContent", proxy, dom);
                Proxy.proxyFunction("appendChild removeChild prependChild", dom, proxy);
            }

            proxy._proxyFor = source;
            return proxy;
        },

        /**
         *
         * @name Util.ProxyPlayer
         * @class ProxyPlayer contains a substantial a subset of the Media Element properties.  If provided
         * a target DOM node, the media attributes will be applied to that DOM node, if possible.  In iOS, where DOM
         * getters functions cannot be defined, a JavaScript object will be provided with both media element properties and
         * proxyed DOM element properties.
         * @see Documentation ported from: <a href=http://www.w3.org/TR/html5/media-elements.html#media-elements">W3.Org Media Elements</a>
         * @param source A JavaScript object containing an HTML5 MediaController interface.  Getter/setter properties
         * such as currentTime and src can be defined as function (eg: currentTime(time), src(src).
         * @param [target] A DOM element upon which to define the MediaController interface, clobbering any
         * existing properties (such as readyState). If not defined, the iOS fallback JS object is returned.
         * @description
         * This utility function hides browser-specific complexity of mapping a video player wrapper onto a DOM node,
         * and returns an object which can be used as if it were a <code>&lt;video></code> element.  Usually, this is
         * the DOM element passed in, with the exception being iOS in which a JS object is returned.
         * @example
         *         var myWrapper = {
         *              __time : 0,
         *              currenTime : function (val) {
         *                  if( val != null)
         *                      this.__time = val;
         *                  return this.__time;
         *              }
         *         };
         *         var video = MetaPlayer.proxy.proxyPlayer( myWrapoer,
         *              document.getElementById("#myDif") );
         */

        /**
         * @name Util.ProxyPlayer#duration
         * @type Number
         * @description Returns the difference between the earliest playable moment and the latest playable moment (not considering whether the data in question is actually buffered or directly seekable, but not including time in the future for infinite streams). Will return zero if there is no media.
         */

        /**
         * @name Util.ProxyPlayer#currentTime
         * @type Number
         * @description Returns the current playback position, in seconds, as a position between zero time and the
         * current duration. Can be set, to seek to the given time.
         */

        /**
         * @name Util.ProxyPlayer#paused
         * @type Boolean
         * @description Returns true if playback is paused; false otherwise. When this attribute is true, any media element slaved to this controller will be stopped.
         */

        /**
         * @name Util.ProxyPlayer#volume
         * @type Number
         * @description Returns the current playback volume multiplier, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest. Can be set, to change the volume multiplier.
         */

        /**
         * @name Util.ProxyPlayer#muted
         * @type Boolean
         * @description Returns true if all audio is muted (regardless of other attributes either on the controller or on any media elements slaved to this controller), and false otherwise. Can be set, to change whether the audio is muted or not.
         */

        /**
         * @name Util.ProxyPlayer#seeking
         * @type Boolean
         * @description Returns true if the user agent is currently seeking.
         */

        /**
         * @name Util.ProxyPlayer#controls
         * @type Boolean
         * @description If false, render no controls.  If true render the default playback controls.
         */

        /**
         * @name Util.ProxyPlayer#autoplay
         * @type Boolean
         * @description Automatically loads and plays the video when a source is available.
         */

        /**
         * @name Util.ProxyPlayer#preload
         * @type String
         * @description If true, then load() will be invoked automatically upon media selection. Ignored if autoplay is enabled.
         * <ul>
         * <li>none</li>
         * <li>metadata</li>
         * <li>auto</li>
         * </ul>
         */

        /**
         * @name Util.ProxyPlayer#ended
         * @type Boolean
         * @description True if the media has loaded and playback position has progressed to the terminus of the
         * content in the current playback direction.
         */

        /**
         * @name Util.ProxyPlayer#src
         * @type String
         * @description Gives the address of the media resource (video, audio) to show. Can be set to change
         * the current media.
         */

        /**
         * @name Util.ProxyPlayer#readyState
         * @type Integer
         * @description Describes to what degree the media is ready to be rendered at the current playback position.
         * <ul>
         * <li>0 - HAVE_NOTHING</li>
         * <li>1 - HAVE_METADATA</li>
         * <li>2 - HAVE_CURRENT_DATA</li>
         * <li>3 - HAVE_FUTURE_DATA</li>
         * <li>4 - HAVE_ENOUGH_DATA</li>
         * </ul>
         * @see <a href="http://www.w3.org/TR/html5/media-elements.html#ready-states">readyState</a>
         */

        /**
         * @name Util.ProxyPlayer#load
         * @function
         * @description Begins the download, and buffering of the media specified, beginning with media
         * seletion from <code> &lt;source></code> tags if no <code>src</code> is specified.
         */

        /**
         * @name Util.ProxyPlayer#play
         * @function
         * @description Sets the paused attribute to false.
         */

        /**
         * @name Util.ProxyPlayer#pause
         * @function
         * @description Sets the paused attribute to false.
         */

         /**
         * @name Util.ProxyPlayer#canPlayType
         * @function
         * @param {String} type A MIME type string.
         * @description Returns the empty string if type is a type that the user agent knows it cannot render, returns
          * "probably" if the user agent is confident that the type represents a media resource that it can
          * render, "maybe" otherwise.
          * @see <a href="http://www.w3.org/TR/html5/media-elements.html#dom-navigator-canplaytype">canPlayType</a>
          * @see <a href="http://www.w3.org/TR/html5/the-source-element.html#attr-source-type">types</a>
          */

        /**
         * @name Util.ProxyPlayer#event:timeupdate
         * @event
         * @description The current playback position changed as part of normal playback or discontinuously, such as seeking.
         */

        /**
         * @name Util.ProxyPlayer#event:seeking
         * @event
         * @description  The seeking property has been set to true.
         */

        /**
         * @name Util.ProxyPlayer#event:seeked
         * @event
         * @description The seeking property has been set false.
         */

        /**
         * @name Util.ProxyPlayer#event:playing
         * @event
         * @description Playback is ready to start after having been paused or delayed due to lack of media data.
         */

        /**
         * @name Util.ProxyPlayer#event:play
         * @event
         * @description The element is no longer paused. Fired after the play() method has returned, or when the autoplay attribute has caused playback to begin.
         */
        /**
         * @name Util.ProxyPlayer#event:pause
         * @event
         * @description The element has been paused.
         */
        /**
         * @name Util.ProxyPlayer#event:loadeddata
         * @event
         * @description The user agent can render the media data at the current playback position for the first time.
         */
        /**
         * @name Util.ProxyPlayer#event:loadedmetadata
         * @event
         * @description The user agent has just determined the duration and dimensions of the media resource.
         */
        /**
         * @name Util.ProxyPlayer#event:canplay
         * @event
         * @description The user agent can resume playback of the media data.
         */
        /**
         * @name Util.ProxyPlayer#event:loadstart
         * @event
         * @description The element is constructed and is ready for a media source.
         */
        /**
         * @name Util.ProxyPlayer#event:durationchange
         * @event
         * @description The duration attribute has just been updated.
         */
        /**
         * @name Util.ProxyPlayer#event:volumechange
         * @event
         * @description Either the volume attribute or the muted attribute has changed.
         */
        /**
         * @name Util.ProxyPlayer#event:ended
         * @event
         * @description Playback has stopped because the end of the media resource was reached.
         */
        /**
         * @name Util.ProxyPlayer#event:error
         * @event
         * @description An error occurs while fetching the media data.
         */


        /**
         * @name Util.ProxyPlayer#ad
         * @type Boolen
         * @description True if an Ad is currently rendering.
         */

        /**
         * @name Util.ProxyPlayer#event:adstart
         * @event
         * @description Fired when the player begins an ad, indicating that seeking should be disabled.
         */

        /**
         * @name Util.ProxyPlayer#event:adstop
         * @event
         * @description Fired when the player finishes playing an ad, indicating that seeking can be re-enabled.
         */


        proxyPlayer : function (adapter, dom) {
            var proxy = MetaPlayer.proxy.getProxyObject(dom);

            Proxy.mapProperty("duration currentTime volume muted seeking" +
                " paused controls autoplay preload src ended readyState ad",
                proxy, adapter);

            Proxy.proxyFunction("load play pause canPlayType" ,adapter, proxy);

            // MetaPlayer Optional Extensions
            Proxy.proxyFunction("mpf_resize mpf_index", adapter, proxy);

            Proxy.proxyEvent("timeupdate seeking seeked playing play pause " +
                "loadeddata loadedmetadata canplay loadstart durationchange volumechange adstart adstop"
                + " ended error",adapter, proxy);

            return proxy;
        }
    };

    if( ! window.Ramp )
        window.Ramp = {};

    MetaPlayer.proxy = Proxy;


})();
