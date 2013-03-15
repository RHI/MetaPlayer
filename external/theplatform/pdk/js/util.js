//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

////// UTIL FUNCTIONS ////////////

function tpSetCssClass(divID, className)
{
        try
        {
                var target = document.getElementById(divID),
                targetClass = target.className;
                targetClass = typeof(targetClass) === "string" ? targetClass : "";
                if(targetClass.match(new RegExp(className)) === null)
                {
                        target.className = className + " " + targetClass;
                }
        }
        catch(e)
        {
        }
}

function tpUnsetCssClass(divID, className)
{
        try
        {
                var target = document.getElementById(divID),
                targetClass = target.className,
                replaceRegEx = new RegExp(className + " ");
                targetClass = typeof(targetClass) === "string" ? targetClass : "";
                target.className = targetClass.replace(replaceRegEx, "", "g");
        }
        catch(e)
        {
        }
}



// dynamically resize an element, for example, the category list
function tpResize(divID, height, width)
{
    var element = document.getElementById(divID);
    element.style.height = height + "px";
    element.style.width = width + "px";
}

// helper function for getting the "top" coordinate of an object
function tpGetTop(obj)
{
    result = 0;
    while (obj)
    {
        result += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return result;
}

// helper function for getting the "left" coordinate of an object
function tpGetLeft(obj)
{
    result = 0;
    while(obj)
    {
        result += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return result;
}

//objname should be fully qualified
tpThisJsObject = function(objName)
{

    return window[objName];    

}

var tpRegisteredGWTWidgets={};

tpThisMovie = function(movieName)
{

    if (movieName=="communicationwidget"||window["tpRegisteredGWTWidgets"]&&tpRegisteredGWTWidgets[movieName]!=undefined)
    {
        var obj = tpThisJsObject("tpGwtCommManager");
        if (obj)
            return obj;
    }

    var oDoc;
    if (window.frame && (window.frame.hasOwnProperty("contentWindow") || window.frame.hasOwnProperty("contentDocument")))
    {
        oDoc = frame.contentWindow.document || frame.contentDocument.document ;
    }
    else
    {
        oDoc = document
    }
    return oDoc.getElementById(movieName);


}
function tpDebug(str, controllerId, className, level)
{
	if (!controllerId) controllerId = "javascript";
    if (!className) className = "utils";
    if (!level) level = tpConsts.INFO;
    tpTrace(str, (new Date()).valueOf(), controllerId, className, level)
}

// open a new pop-up window
function tpOpenNewWindow(URLtoOpen, windowName, windowFeatures)
{
    var newWindow=window.open(URLtoOpen, windowName, windowFeatures);
}

// handle tracking URLs
var tpTrackingImage = new Image();
function tpCallTrackingUrl(url)
{
    url = unescape(url);
    tpTrackingImage.src = url;
    for (i = 0; ((!tpTrackingImage.complete) && (i < 100000)); i++)
    {
    }
}


var tpConsts = new Object();
tpConsts.FATAL = 1000;
tpConsts.ERROR = 8;
tpConsts.WARN = 6;
tpConsts.INFO = 4;
tpConsts.DEBUG = 2;

function tpGetLevel(level)
{
    switch (level)
    {
        case tpConsts.DEBUG:
            return "DEBUG";
        case tpConsts.INFO:
            return "INFO";
        case tpConsts.WARN:
            return "WARN";
        case tpConsts.ERROR:
            return "ERROR";
        case tpConsts.FATAL:
            return "FATAL";

    }
    return "UNKNOWN";
}

function tpTrace(msg, time, controllerId, className, level)
{


    
    if (!(self.console))
        return;

    var date = new Date(Number(time));
    var ms = date.getMilliseconds();
    if (ms.toString().length==2)
        ms="0"+ms;
    else if (ms.toString().length==1)
        ms="00"+ms;

    var prettyTime = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"."+ms;

    var message = prettyTime+" \t"+tpGetLevel(Number(level))+" \t"+controllerId+" \t";
    if (className&&className.length)
        message+=className+" :: ";

    message+=msg;

    switch (Number(level))
    {
        case tpConsts.DEBUG:
            console.log(message);
            break;
        case tpConsts.INFO:
            console.info(message);
            break;
        case tpConsts.WARN:
            console.warn(message);
            break;
        case tpConsts.ERROR:
        case tpConsts.FATAL:
            console.error(message);
            break;

    }
}

///// INIT tpController //////////
function tpGetUseJS() {
    return "true"
}
function tpGetCommManagerID() {
    return tpCommID;
}
tpLogLevel = "warn";
function tpSetLogLevel(level){
    tpLogLevel = level
};
function tpGetLogLevel() {
    return tpLogLevel
}
function tpGetProperties()
{
    //each pdk controller will call this to get the default properties
    var props = new Object();
    props.commManagerId = tpGetCommManagerID();
    props.useJS = tpGetUseJS();
    props.registeredComponents = tpGetRegisteredIDs();
    props.logLevel = tpGetLogLevel();
    return props;
}

var tpRegisteredIDArr;
function tpRegisterID(swfName)
{
    if (!tpRegisteredIDArr) tpRegisteredIDArr = [];
    for (var i = 0; i < tpRegisteredIDArr.length; i++)
    {
        if (tpRegisteredIDArr[i] == swfName) return;
    }
    tpRegisteredIDArr.push(swfName);
}
function tpGetRegisteredIDs()
{
    return tpRegisteredIDArr;
}

// handle references to the communication manager
var tpController;
var tpCommID;
var tpBridgeID;
var tpExternalController;
var tpGwtCommManager;


var useWorkerIfPossible=false;
var gwtWorker;

function tpDoInitGwtCommManager()
{

    try
    {
    
        //need to get this id part working
        if (tpCommID=="communicationwidget")//we call the default constructor, because the non-default doesn't work in hosted mode for some reason
            tpGwtCommManager = new com.theplatform.pdk.CommManager();
        else if (!tryWorker)
            tpGwtCommManager = new com.theplatform.pdk.CommManager(tpCommID);

      

    }
    catch(e)
    {
        if (console!=undefined)
            console.error("CommManager module failed to load!");
        else
        {
            //should we alert?
        }
    }



}

function tpInitGwtCommManager(commId, failOnError)
{

    try
    {


        //we need not wait for onload

        //need to get this id part working
        
       // 
       
       if (useWorkerIfPossible&&Worker!=undefined)
       {
       
            gwtWorker = new Worker("js/commManagerWorker.js");
        
            tpGwtCommManager = new Object();
            
            tpGwtCommManager.executeMessage = function(message){
                
                    gwtWorker.postMessage(message);
                    }
            
            gwtWorker.onmessage = function(obj)
            {
                console.log(obj.data);

                if (obj.data.destination)
                   tpReceiveMessage(obj.data.destination,obj.data.message);
            };
            
            gwtWorker.onerror = function(err)
            {
                if (self.console)
                  console.error(err.message);
            };
            
            
            
       
       
       }
       else
          tpGwtCommManager = new com.theplatform.pdk.CommManager(tpCommID);



    }
    catch (e)
    {

        //wait for onload, depending on how we load our GWT stuff we may need 
        //a special event to listen for
        //window.
        // addEventListener("onCommManagerLoaded",function(){
        //        if (com.theplatform.pdk.CommManager)
        //        {
        //            //we need not wait for onload
        //
        //            //need to get this id part working
        //            tpGwtCommManager = new com.theplatform.pdk.CommManager();
        //
        //        }
        //        else
        if (failOnError==true)
        {
            if (console!=undefined)
                console.error("CommManager module failed to load!");
            else
            {
                //should we alert?
            }
        }

    //},false)
        



    }


}

//the kicks off the creation of the tpController, must be called before any pdk components are set on the page
function tpSetCommManagerID(commID, embed, commManagerUrl, isGwt,useWorker)
{

    if (isGwt&&useWorker)
    {
        useWorkerIfPossible=true;
    }

    // create a unique token for each set of player controls
    if (commID && embed)
    {
        //get rid of any existing commManager
        var divEl = window.document.getElementById("commManagerDiv");
        if (divEl)
        {
            divEl.parentNode.removeChild(divEl);
            divEl = null;
        }
        //create a commManager as the first element in the body
        divEl = window.document.createElement('div');
        divEl.id = "commManagerDiv";
        divEl.style.position = "absolute";
        divEl.style.top = "0";
        divEl.style.left = "0";
        var bodyTag = window.document.getElementsByTagName('body')[0];
        bodyTag.insertBefore(divEl, bodyTag.firstChild);

        if (false&&!isGwt)
        {
            var url = commManagerUrl ? commManagerUrl : "../../pdk/swf/commManager.swf"
            var so = new SWFObject(url, commID, "1", "1", "9.0.0.0");
            so.addParam("allowScriptAccess", "always");
            so.addParam("wmode", "transparent");
            so.write("commManagerDiv");
        }
        else
        {

            if (window['com']&&com.theplatform!==undefined)
            {
                tpInitGwtCommManager(commID);
            }
            else
            {
                window['tpGWTLoadedHandler'] = function(){            
                    window['tpGWTLoadedHandler']=undefined;
                    tpInitGwtCommManager(commID);
                };
                
                tpLoadScript(tpScriptPath+"/app/CommunicationManager/CommunicationManagerSingleScript.nocache.js");
            }

        }
		
	}
	tpController = new tpControllerClass();
	tpCommID = commID;
	tpBridgeID = commID ? commID : "unknown";
	
	if (typeof(window.$pdk) === "undefined") $pdk = {}
	if (!$pdk.controller) $pdk.controller = tpController;

    //connect tracer
    tpController.addEventListener("OnPdkTrace",
        function(e){

            var obj=e.data;
            if (obj)
            {
                tpTrace(obj.message,obj.timestamp,obj.controllerId,obj.className,obj.level);
            }

        }
    );


	//external controller
	//tpCleanupExternal();
}





///// TPCONTROLLER CLASS /////////////

// implementation of the controller proxy in javascript
function tpControllerClass()
{
    //vars loaded at bottom
    /////// Send Messages to the rest of the app //////////////
    ///////////////////////////////////////////////////////////
	
    var me = this;
	
    if (window.addEventListener)
    {
        this.pageLoadListener = function(e)
        {
            window.removeEventListener('load', me.pageLoadListener, true);
            me.callFunction("htmlPageLoaded", [tpGetRegisteredIDs()])
        };
        window.addEventListener('load', this.pageLoadListener, true);
    }
    else if (window.attachEvent)
    {
        this.pageLoadListener = function()
        {
            window.detachEvent('onload', me.pageLoadListener);
            me.callFunction("htmlPageLoaded", [tpGetRegisteredIDs()])
        };
        window.attachEvent("onload", this.pageLoadListener);
    }
    else
    {
        //oops, this won't work;
        alert("this won't work");
    }
	
    //all communication to the communication manager happens here
    this.sendMessage = function(destination, message, skipBus)
    {
        //tpDebug("putting message on queue: " + message.name + " skipBus?" + skipBus + " canMessage?" + this.canMessage + " isLoading?" + this.isLoading);
        var sendObj = new Object();
        sendObj.message = message;
        sendObj.destination = destination;
        if (this.isLoading && !skipBus)
        {


            //these are low priority messages that should be sent only after OnPlayerLoaded is fired
            this.messageQueue.push(sendObj);
        }
        else if (!this.canMessage)
        {
            //these are high priority messages (like addEventListener or registerFunction) that usually need to be sent before OnPlayerLoaded is fired
            //but we still have to wait until after the communication manager has loaded or they'll just disappear
//            if (sendObj.message.name=="dispatchEvent"&&self.console!=undefined)
//            {
//                console.log(sendObj.message.payload.evt.type);
//                console.log(sendObj.message.payload.evt);
//            }
//            else
//                console.log(sendObj.message.name+":"+" was queued");
            this.priorityQueue.push(sendObj);
        }
        else
        {
            this.doSendMessage(sendObj);
        }
    }
    
    //Safari for windows needs a 1ms timeout before calling external interface, otherwise it won't receive any arguments
    //to it's callback functions from javascript 
    var isSafariWin = (navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1);
	
    this.doSendMessage = function(sendObj)//private function
    {
        if (this.isShutDown) return;
        var obj = tpThisMovie(sendObj.destination);

        if (!obj)
            return;
		
        //tpDebug("sending: " + sendObj.message.name + " dest:" + sendObj.destination);
        // Flash ExternalInterface will convert any "" or " " string to null.  However,
        // in the PDK, null and "" mean different things.  So, if there are blank strings,
        // convert to a signal value, and then unconvert on the way out.
        /*for (var i=0; i<sendObj.parameters.length; i++)
		{
			var param = sendObj.parameters[i];
			if (typeof param == "string" && (param.length == 0 || param == " "))
			{
				sendObj.parameters[i] = this.blankString;
			}
		}*/
        //tpDebug("do send message: " + sendObj.message.name);
        
      //  if (sendObj.message.name=="callFunction"&&self.console!=undefined)
      //  {
          //  console.log(sendObj.message.payload.name);
        //    console.log(sendObj.message);
      //  }
//         if (sendObj.message.name=="dispatchEvent"&&self.console!=undefined)
//        {
//            console.log(sendObj.message.payload.evt.type);
//            console.log(sendObj.message);
//        }
//
        if (!isSafariWin)
            obj.executeMessage(sendObj.message);
        else 
            setTimeout(function(){            obj.executeMessage(sendObj.message);},1);
        
    }

    this.checkMessageQueue = function()//private function
    {
        var len = this.messageQueue.length
        while (this.messageQueue.length > 0)
        {
            this.doSendMessage(this.messageQueue.shift());
        }
    }
	
    this.checkPriorityQueue = function()
    {
        while (this.priorityQueue.length > 0)
        {
            var sendObj = this.priorityQueue.shift();
            if (sendObj.destination == "unknown") sendObj.destination = tpBridgeID;
            this.doSendMessage(sendObj);
        }
    }
		
    this.wrapMessage = function(messageName, payload)
    {
        var comm = {
            globalDataType:this.getDataTypeName("CommInfo"),
            id:"javascript"
        }
        var message = {
            globalDataType:this.getDataTypeName("MessageInfo"),
            name:messageName,
            payload:payload,
            comm:comm
        };
        return message;
    }
    this.getDataTypeName = function(shortType)
    {
        switch(shortType)
        {
            case "AdPattern":
                return "com.theplatform.pdk.data::AdPattern";
            case "Banner":
                return "com.theplatform.pdk.data::Banner";
            case "BaseClip":
                return "com.theplatform.pdk.data::BaseClip";
            case "CallInfo":
                return "com.theplatform.pdk.communication::CallInfo";
            case "CategoryInfo":
                return "com.theplatform.pdk.data::CategoryInfo";
            case "Clip":
                return "com.theplatform.pdk.data::Clip";
            case "CommInfo":
                return "com.theplatform.pdk.communication::CommInfo";
            case "CustomData":
                return "com.theplatform.pdk.data::CustomData";
            case "CustomValue":
                return "com.theplatform.pdk.data::CustomValue";
            case "DispatchInfo":
                return "com.theplatform.pdk.communication::DispatchInfo";
            case "FunctionInfo":
                return "com.theplatform.pdk.communication::FunctionInfo";
            case "HandlerInfo":
                return "com.theplatform.pdk.communication::HandlerInfo";
            case "HyperLink":
                return "com.theplatform.pdk.data::HyperLink";
            case "MediaClick":
                return "com.theplatform.pdk.data::MediaClick";
            case "MediaFile":
                return "com.theplatform.pdk.data::MediaFile";
            case "MessageInfo":
                return "com.theplatform.pdk.communication::MessageInfo";
            case "MetricInfo":
                return "com.theplatform.pdk.data::MetricInfo";
            case "Overlay":
                return "com.theplatform.pdk.data::Overlay";
            case "PdkEvent":
                return "com.theplatform.pdk.events::PdkEvent";
            case "ProviderInfo":
                return "com.theplatform.pdk.data::ProviderInfo";
            case "Range":
                return "com.theplatform.pdk.data::Range";
            case "Rating":
                return "com.theplatform.pdk.data::Rating";
            case "Release":
                return "com.theplatform.pdk.data::Release";
            case "ReleaseInfo":
                return "com.theplatform.pdk.data::ReleaseInfo";
            case "ScopeInfo":
                return "com.theplatform.pdk.communication::ScopeInfo";
            case "Sort":
                return "com.theplatform.pdk.data::Sort";
            case "Subtitles":
                return "com.theplatform.pdk.data::Subtitles";
            case "TrackingUrl":
                return "com.theplatform.pdk.data::TrackingUrl";
            case "BandwidthPreferences":
                return "com.theplatform.pdk.data::BandwidthPreferences";
            case "Annotation":
                return "com.theplatform.pdk.data::Annotation";
        }
    }
    this.createScope = function(scope)
    {
        if (scope == undefined) return this.defaultScope;
        else
        {
            scope.push("javascript");
            //tpDebug("creating scopes: " + scope.toString());
            return {
                globalDataType:this.getDataTypeName("ScopeInfo"),
                controlId:"javascript",
                isGlobal:true,
                isAny:false,
                isEmpty:false,
                scopeIds:scope
            };
        }
    }
	
    //////// handle communication to the rest of the app ///////
    ////////////////////////////////////////////////////////////
	
    //register a function
    this.registerFunction = function(funcName, callback, scopes)
    {
        var scopeObj = this.createScope(scopes);
        var informComm = false;
        if (this.functions[funcName] == undefined)
        {
            this.functions[funcName] = new Object();
            informComm = true;
        }
        for (var i = 0; i < scopeObj.scopeIds.length; i++)
        {
            var s = scopeObj.scopeIds[i];
            if (s == "*") return;//can't register a scope of any
            this.functions[funcName][s] = callback;
        }
        if (informComm)
        {
            //send the registered function to the commManager
            var func = {
                globalDataType:this.getDataTypeName("FunctionInfo"),
                name:funcName,
                scope:scopeObj
            };
            var message = this.wrapMessage("registerFunction", func);
            this.sendMessage(tpBridgeID,message,true);
        }
    }
	
    this.unregisterFunction = function(funcName, scope)
    {
        var scopeObj = this.createScope(scopes);
        if (this.functions[funcName] != undefined)
        {
            var funcs = this.functions[funcName];
            for (var i = 0; i < scopeObj.scopeIds.length; i++)
            {
                var s = scopeObj.scopeIds[i];
                if (s == "*")
                {
                    delete funcs;//delete them all
                    break;
                }
                if (funcs[s] != undefined) delete funcs[s];//delete each scope
            }
            var funcsLeft = false;
            if (funcs != undefined)//prune the object
            {
                for (var sc in funcs)
                {
                    funcsLeft = true;
                    break;
                }
                if (!funcsLeft) delete this.functions[funcName];
            }
        }
        if (!funcsLeft)
        {
            var func = {
                globalDataType:this.getDataTypeName("FunctionInfo"),
                name:funcName,
                scope:scopeObj
            };
            var message = this.wrapMessage("unregisterFunction", func);
            this.sendMessage(tpBridgeID,message,true);
        }
    }
	
    this.addEventListener = function(eventName, callback, scope)
    {
        //tpDebug("adding event listener: " + eventName + " callback:" + callback);
        var scopeObj = this.createScope(scope);
        var handler = {
            globalDataType:this.getDataTypeName("HandlerInfo"),
            name:eventName,
            handler:callback,
            scope:scopeObj
        }
        var informComm = false;
        if (this.events[eventName] == undefined)
        {
            this.events[eventName] = new Array();
            informComm = true;
        }
        var evts = this.events[eventName];
        var repeat = false;
        for (var i = 0; i < evts.length; i++)//repeats?
        {
            if (evts[i].handler == callback)
            {
                evts[i] = handler;//replace the scopes
                repeat = true;
                break;
            }
        }
        if (!repeat) evts.push(handler);
        //tpDebug("how many listeners? " + evts.length);
        if (informComm)
        {
            //tpDebug("informing comm of event listener");
            var message = this.wrapMessage("addEventListener", handler);
            this.sendMessage(tpBridgeID,message,true);
        }
    }
    this.removeEventListener = function(eventName, callback, scope)
    {
        if (this.events[eventName] != undefined)
        {
            var scopeObj = this.createScope(scope);
            var handler = {
                globalDataType:this.getDataTypeName("HandlerInfo"),
                name:eventName,
                handler:callback,
                scope:scopeObj
            }
		
            var eventArray = this.events[eventName];
            for (var i = 0; i < eventArray.length; i++)
            {
                var h = eventArray[i];
                if (h.handler == handler.handler)
                {
                    eventArray = eventArray.splice(i, 1);
                    break;
                }
            }
            if (eventArray.length == 0)
            {
                //no callbacks left, zap the variable
                delete this.events[eventName];
                var message = this.wrapMessage("removeEventListener", handler);
                this.sendMessage(tpBridgeID, message, true)
            }
        }
    }
	
    this.dispatchEvent = function(eventName, value, scope)
    {
        var scopeObj = this.createScope(scope);
        var evt = {
            globalDataType:this.getDataTypeName("PdkEvent"),
            type:eventName,
            data:value
        };
        var dispatch = {
            globalDataType:this.getDataTypeName("DispatchInfo"),
            evt:evt,
            scope:scopeObj
        };
        //check local events
        this.doDispatchEvent(dispatch);
		
        var message = this.wrapMessage("dispatchEvent", dispatch);
        this.sendMessage(tpBridgeID, message, true);
    }
		
    this.callFunction = function(funcName, args, scope)
    {
        var scopeObj = this.createScope(scope);
        var call = {
            globalDataType:this.getDataTypeName("CallInfo"),
            name:funcName,
            args:args,
            scope:scopeObj
        };
        this.doCallFunction(call);
		
        var message = this.wrapMessage("callFunction", call);
        this.sendMessage(tpBridgeID, message, true);
    }
	
    this.doDispatchEvent = function(dispatch)
    {
        //tpDebug("do dispatching event: " + dispatch.evt.type);
        if (this.events[dispatch.evt.type] != undefined)
        {
            var handlers = this.events[dispatch.evt.type]
            for (var i = 0; i < handlers.length; i++)
            {
                var handler = handlers[i];
                //tpDebug("checking handler? " + handler.handler)
                if (dispatch.scope.isAny)
                {
                    eval(handler.handler)(dispatch.evt);
                    continue;
                }
                for (var j = 0; j < handler.scope.scopeIds.length; j++)
                {
                    var s = handler.scope.scopeIds[j];
                    var fired = false;
                    if (s == "*")
                    {
                        eval(handler.handler)(dispatch.evt);
                        break;
                    }
                    for (var k = 0; k < dispatch.scope.scopeIds.length; k++)
                    {
                        //tpDebug("running through scopes handler: " + s + " dispatch: " + dispatch.scope.scopeIds[k]);
                        if (s == dispatch.scope.scopeIds[k])
                        {
                            fired = true;
                            eval(handler.handler)(dispatch.evt);
                            break;
                        }
                    }
                    if (fired) break;//go to next handler
                }
            }
        }
    }
	
    this.doCallFunction = function(call)
    {
        if (this.functions[call.name] != undefined)
        {
            //check local functions
            var funcsToCall = new Object();
            for (var i = 0; i < call.scope.scopeIds.length; i++)
            {
                var s = call.scope.scopeIds[i];
                if (this.functions[call.name][s] != undefined)
                {
                    funcsToCall[this.functions[call.name][s]] = "f";//we need lookup
                }
            }
            for (var f in funcsToCall)
            {
                eval(f)(call.args);
            }
        }
    }
	
	
	
	
    //////// RECEIVE CALLS FROM AS //////////////
    ////////////////////////////////////////////
	
    //all communication from the communication manager happens here
    this.receiveMessage = function(destination, message)
    {
        //TODO: take this out later

        if (destination == "javascript")
        {
            //tpDebug("receiving message: " + message.name)
            var messStr = message.name;
            switch(messStr)
            {
				
                case "commReady":
                   
                    tpBridgeID = tpCommID;
                    this.canMessage = true;
                    this.checkPriorityQueue();
                    break;
                case "bridgeReady":
                    tpBridgeID = message.comm.id;
                    this.canMessage = true;
                    this.checkPriorityQueue();
                    break;
                case "dispatchEvent":
                    var dispatch = message.payload;
                    this.receiveEvent(dispatch);
                    break;
                case "callFunction":
                    var call = message.payload;
                    this.doCallFunction(call);
                    break;
                default:
                    break;
            }
        }
        else
        {
            //transfer the message to its final destination
            this.sendMessage(destination, message, true);
        }
    }
    this.receiveEvent = function(dispatch)
    {
        //tpDebug("RECIEVED:" + dispatch.evt.type)

        if (dispatch.evt.type == "OnPlayerLoaded")
        {
            this.isLoading = false;
            this.checkMessageQueue();
        }
        this.doDispatchEvent(dispatch);
    }
	
    //create a list of direct calls
	
    // PLAYER
	
    this.setRelease = function(release, replaceDefault, scope)
    {
        release = this.modRelease(release);
        this.callFunction("setRelease", [release, replaceDefault], scope);
    }
    this.loadRelease = function(release, replaceDefault, scope)
    {
        release = this.modRelease(release);
        this.callFunction("loadRelease", [release, replaceDefault], scope);
    }
    this.loadReleaseURL = function(releaseURL, replaceDefault, scope)
    {
        this.callFunction("loadReleaseURL", [releaseURL, replaceDefault], scope);
    }
    this.setReleaseURL = function(url, replaceDefault, scope)
    {
        this.callFunction("setReleaseURL", [url, replaceDefault], scope);
    }
    this.loadSmil = function(smil, replaceDefault, scope)
    {
        if (replaceDefault == undefined) replaceDefault = true;
        this.callFunction("loadSmil", [smil, replaceDefault], scope);
    }
    this.setSmil = function(smil, scope)
    {
        this.callFunction("setSmil", [smil], scope);
    }
    this.resetPlayer = function(scope)
    {
        this.callFunction("resetPlayer", [], scope);
    }
    this.setPlayerMessage = function(message, showDuration, scope)
    {
        if (showDuration == undefined) showDuration = 5000;
        this.callFunction("setPlayerMessage", [message, showDuration], scope);
    }
    this.clearPlayerMessage = function(scope)
    {
        this.callFunction("clearPlayerMessage", [], scope);
    }
    this.setCurrentReleaseList = function(id, scope)
    {
        this.callFunction("setCurrentReleaseList", [id], scope);
    }
    this.seekToPosition = function(position, scope)
    {
        this.callFunction("seekToPosition", [position], scope);
    }
    this.seekToPercentage = function(percent, scope)
    {
        this.callFunction("seekToPercentage", [percent], scope);
    }
    this.nextClip = function(scope)
    {
        this.callFunction("nextClip", [], scope);
    }
    this.previousClip = function(scope)
    {
        this.callFunction("previousClip", [], scope);
    }
    this.mute = function(muted, scope)
    {
        this.callFunction("mute", [muted], scope);
    }
    this.pause = function(paused, scope)
    {
        this.callFunction("pause", [paused], scope);
    }
    this.setPreviewImageUrl = function(url, scope)
    {
        this.callFunction("setPreviewImageUrl", [url], scope);
    }
    this.showFullScreen = function(isFullScreen, scope)
    {
        if (isFullScreen)
        {
            	tpDebug("Switching to full screen from Javascript is not supported by the Flash run-time. Flash only allows you to go to full screen mode via a click in the player itself.", "tpController", "Controller", "error");        }
        else
        {
            this.callFunction("showFullScreen", [isFullScreen], scope);
        }
    }
    this.showEmailForm = function(visible, scope)
    {
        this.callFunction("showEmailForm", [visible], scope);
    }
    this.showLinkForm = function(visible, scope)
    {
        this.callFunction("showLinkForm", [visible], scope);
    }
    this.trace = function(str, className, level)
    {
        this.callFunction("trace", [str, className, level], null);
    }
    this.useDefaultPlayOverlay = function(useDefault, scope)
    {
        this.callFunction("useDefaultPlayOverlay", [useDefault], scope);
    }
    this.getUseDefaultPlayOverlay = function(scope)
    {
        this.callFunction("getUseDefaultPlayOverlay", [], scope);
    }
    this.useDefaultLinkForm = function(useDefault, scope)
    {
        this.callFunction("useDefaultLinkForm", [useDefault], scope);
    }
    this.useDefaultEmailForm = function(useDefault, scope)
    {
        this.callFunction("useDefaultEmailForm", [useDefault], scope);
    }
    this.getSubtitleLanguage = function(requestor, scope)
    {
        this.callFunction("getSubtitleLanguage", [requestor], scope);
    }
    this.clickPlayButton = function(scope)
    {
        this.callFunction("clickPlayButton", [], scope);
    }
    this.disablePlayerControls = function(disable, exceptions, scope)
    {
        this.callFunction("disablePlayerControls", [disable, exceptions], scope);
    }
    this.hidePlayerRegions = function(hide, exceptions, scope)
    {
        this.callFunction("hidePlayerRegions", [hide, exceptions], scope);
    }
    this.setSubtitleLanguage = function(language, scope)
    {
        this.callFunction("setSubtitleLanguage", [language], scope);
    }
    this.setShowSubtitles = function(show, scope)
    {
        this.callFunction("setShowSubtitles", [show], scope)
    }
    this.getPlayerVariables = function(names, scope)
    {
        this.callFunction("getPlayerVariables", [names], scope);
    }
    this.setVolume = function(volume, scope)
    {
        this.callFunction("setVolume", [volume], scope);
    }
    this.clearAdCookie = function(scope)
    {
        this.callFunction("clearAdCookie", [], scope);
    }
    this.setBandwidthPreferences = function(bandwidthPreferences, scope)
    {
        if (bandwidthPreferences) bandwidthPreferences.globalDataType = this.getDataTypeName("BandwidthPreferences");
        this.callFunction("setBandwidthPreferences", [bandwidthPreferences], scope);
    }
    this.getBandwidthPreferences = function(scope)
    {
        this.callFunction("getBandwidthPreferences", [], scope);
    }
    this.setVideoScalingMethod = function(method, scope)
    {
        this.callFunction("setVideoScalingMethod", [method], scope);
    }
    this.setExpandVideo = function(expand, scope)
    {
        this.callFunction("setExpandVideo", [expand], scope);
    }
    this.showPlayerCard = function(deckId, cardId, otherCardAction, parentCardId, animation, scope)
    {
        this.callFunction("showPlayerCard", [deckId, cardId, otherCardAction, parentCardId, animation], scope)
    }
    this.hidePlayerCard = function(deckId, animation, scope)
    {
        this.callFunction("hidePlayerCard", [deckId, animation], scope)
    }
    this.setVariable = function(widgetId, name, value, componentId)
    {
        //this does nothing except call the setProperty function to obviate
        //any syntactical errors. Our doc writers thought there might be
        //confusion because we use the term 'flashvars' a lot.

        this.setProperty(widgetId, name, value, componentId);
    }
    this.setProperty = function(widgetId, name, value, componentId)
    {
        //alert("setProperty: " + componentId + ", " + name + ", " + value);
        this.callFunction("setProperty", [widgetId, name, value, componentId], null)
    }
    this.getNextClip = function(scope)
    {
        this.callFunction("getNextClip", [], scope);
    }

    this.addAnnotation = function(annotation)
    {
        if (annotation)
            annotation.globalDataType = this.getDataTypeName("Annotation");
        this.callFunction("addAnnotation",[annotation])
    }

    this.removeAnnotation = function(annotation)
    {
        if (annotation)
            annotation.globalDataType = this.getDataTypeName("Annotation");
        this.callFunction("removeAnnotation",[annotation])
    }

    this.clearAnnotations = function()
    {
        this.callFunction("clearAnnotations",[])
    }

    this.getAnnotations = function()
    {
        return this.callFunction("getAnnotations",[]);
    }
	
    // RELEASE MODEL
	
    this.refreshReleaseModel = function(category, search, sort, range, params, secondaryParams, scope, mediaIds, feedUrl)
    {
        if (sort) sort.globalDataType = this.getDataTypeName("Sort");
        if (range) range.globalDataType = this.getDataTypeName("Range");
        this.callFunction("refreshReleaseModel", [category, search, sort, range, params, secondaryParams, mediaIds, feedUrl], scope);
    }
    this.previewRefreshReleaseModel = function(category, search, sort, range, params, secondaryParams, scope, mediaIds, feedUrl)
    {
        if (sort) sort.globalDataType = this.getDataTypeName("Sort");
        if (range) range.globalDataType = this.getDataTypeName("Range");
        this.callFunction("previewRefreshReleaseModel", [category, search, sort, range, params, secondaryParams, mediaIds, feedUrl], scope);
    }
    this.previewNextRefreshReleaseModel = function(scope)
    {
        this.callFunction("previewNextRefreshReleaseModel", [], scope);
    }
	

    // CATEGORY MODEL
	
    this.refreshCategoryModel = function(params, scope, feedUrl)
    {
        this.callFunction("refreshCategoryModel", [params, feedUrl], scope);
    }
	
    // NAVIGATION
	
    this.nextRange = function(scope)
    {
        this.callFunction("nextRange", [], scope);
    }
    this.previousRange = function(scope)
    {
        this.callFunction("previousRange", [], scope);
    }
    this.getCurrentRange = function(scope)
    {
        this.callFunction("getCurrentRange", [], scope);
    }
	
	
    // CLIP INFO
	
    this.setClipInfo = function(clip, isDefault, scope)
    {
        clip = this.modClip(clip);
        this.callFunction("setClipInfo", [clip, isDefault], scope);
    }
	
    // CATEGORY LIST

    this.clearCategorySelection = function(scope)
    {
        this.callFunction("clearCategorySelection", [], scope);
    }

    // RELEASE LIST
	
    this.suspendPlayAll = function(suspend, scope)
    {
        this.callFunction("suspendPlayAll", [suspend], scope);
    }
    this.playNext = function(wrapAround, naturalEnd, scope)
    {
        this.callFunction("playNext", [wrapAround, naturalEnd], scope);
    }
    this.playPrevious = function(wrapAround, scope)
    {
        this.callFunction("playPrevious", [wrapAround], scope);
    }
    this.getNextRelease = function(wrapAround, naturalEnd, scope)
    {
        this.callFunction("getNextRelease", [wrapAround, naturalEnd], scope);
    }
	
    // GENERAL
    this.modRelease = function(release)
    {
        if (release)
        {
            release.globalDataType = this.getDataTypeName("Release");
            if (release.categories) release.categories = this.modCategories(release.categories);
            if (release.thumbnails)
            {
                for (var i = 0; i < release.thumbnails.length; i++)
                {
                    release.thumbnails[i].globalDataType = this.getDataTypeName("MediaFile");
                    if (release.thumbnails[i].customValues) release.thumbnails[i].customValues = this.modCustomValues(release.thumbnails[i].customValues);
					
                }
            }
            if (release.customValues) release.customValues = this.modCustomValues(release.customValues);
            if (release.metrics)
            {
                for (var i = 0; i < release.metrics.length; i++)
                {
                    release.metrics[i].globalDataType = this.getDataTypeName("MetricInfo");
                }
            }
            if (release.provider)
            {
                release.provider.globalDataType = this.getDataTypeName("ProviderInfo");
                if (release.provider.customValues) release.provider.customValues = this.modCustomValues(release.provider.customValues);
            }
            if (release.ratings)
            {
                for (var i = 0; i < release.ratings.length; i++)
                {
                    release.ratings[i].globalDataType = this.getDataTypeName("Rating");
                }
            }
            // backwards compatibility helper
            if (release.URL)
            {
                release.url = release.URL;
            }
        }
        return release;
    }
    this.modCustomValues = function(customValues)
    {
        for (var i = 0; i < customValues.length; i++)
        {
            customValues[i].globalDataType = this.getDataTypeName("CustomValue");
        }
        return customValues;
    }
    this.modCategories = function(categories)
    {
        for (var i = 0; i < categories.length; i++)
        {
            categories[i].globalDataType = this.getDataTypeName("CategoryInfo");
        }
        return categories;
    }
    this.modClip = function(clip)
    {
        if (clip)
        {
            //set the class names correctly for casting in as3.
            clip.globalDataType = this.getDataTypeName("Clip");
            var baseClip = clip.baseClip;
            if (!baseClip) baseClip = new Object();
            if (clip.banners) baseClip.banners = clip.banners;
            if (clip.overlays) baseClip.overlays = clip.overlays;
            clip.baseClip = this.modBaseClip(baseClip);
            if (clip.chapter) clip.chapter.globalDataType = this.getDataTypeName("Chapter");
        }
        return clip;
    }
    this.modBaseClip = function(baseClip)
    {
        if (!baseClip) baseClip = new Object();
        baseClip.globalDataType = this.getDataTypeName("BaseClip");
        if (baseClip.moreInfo)
        {
            baseClip.moreInfo.globalDataType = this.getDataTypeName("HyperLink");
            if (baseClip.moreInfo.clickTrackingUrls) baseClip.moreInfo.clickTrackingUrls = this.modTracking(baseClip.moreInfo.clickTrackingUrls);
        }
        if (baseClip.banners)
        {
            for (var i = 0; i < baseClip.banners.length; i++)
            {
                baseClip.banners[i].globalDataType = this.getDataTypeName("Banner");
                if (baseClip.banners[i].clickTrackingUrls) baseClip.banners[i].clickTrackingUrls = this.modTracking(baseClip.banners[i].clickTrackingUrls)
            }
        }
        if (baseClip.overlays)
        {
            for (var i = 0; i < baseClip.overlays.length; i++)
            {
                baseClip.overlays[i].globalDataType = this.getDataTypeName("Overlay");
                if (baseClip.overlays[i].clickTrackingUrls) baseClip.overlays[i].clickTrackingUrls = this.modTracking(baseClip.overlays[i].clickTrackingUrls)
            }
        }
        if (baseClip.availableSubtitles)
        {
            for (var i = 0; i < baseClip.availableSubtitles; i++)
            {
                baseClip.availableSubtitles[i].globalDataType = this.getDataTypeName("Subtitles");
            }
        }
        if (baseClip.categories) baseClip.categories = this.modCategories(baseClip.categories);
        if (baseClip.adPattern) baseClip.adPattern.globalDataType = this.getDataTypeName("AdPattern");
        if (baseClip.trackingURLs) baseClip.trackingURLs = this.modTracking(baseClip.trackingURLs);
        if (baseClip.contentCustomData) baseClip.contentCustomData.globalDataType = this.getDataTypeName("CustomData");
        if (baseClip.ownerCustomData) baseClip.ownerCustomData.globalDataType = this.getDataTypeName("CustomData");
        if (baseClip.outletCustomData) baseClip.outletCustomData.globalDataType = this.getDataTypeName("CustomData");
        return baseClip;
    }
    this.modTracking = function(trackingUrls)
    {
        for (var i = 0; i < trackingUrls.length; i++)
        {
            trackingUrls.globalDataType = this.getDataTypeName("TrackingUrl")
        }
        return trackingUrls
    }
    this.shutDown = function()
    {
        var args = [];
        this.callFunction("shutDown", args, ["*"]);
        this.isShutDown = true;//prevent any more messages
    }
    //vars initialized
    this.events = new Object();
    this.functions = new Object();
    this.isLoading = true;
    this.canMessage = false;
    this.messageQueue = new Array();
    this.priorityQueue = new Array();
    this.sendQueue = new Array();//yet another queue for timing externalInterface calls
    this.isSending = false;
    this.sendInterval;
    this.shutdownIDs;//array to keep all the controller ids for shutdown
    this.isShutDown = false;
    this.blankString = "__blank_string__";
    this.defaultScope = {
        globalDataType:this.getDataTypeName("ScopeInfo"),
        controlId:"javascript",
        isGlobal:true,
        isAny:false,
        isEmpty:false,
        scopeIds:["javascript","default"]
        };
	
}

function tpReceiveMessage(destination, message)
{
	tpController.receiveMessage(destination, message);
}


//functions for controlling external players

var tpHolderName = "pdkHolder";
var tpExternalJS;

function tpSetPlayerIDForExternal(playerName){};//no longer needed

function tpSetHolderIDForExternal(holderName)//needed
{
    tpHolderName = holderName;
}

var tpPdkBaseDirectory = "";

function tpSetPdkBaseDirectory(dir)
{
    if (typeof(window.$pdk) === "undefined" && tpPdkBaseDirectory === "")
    {
        tpPdkBaseDirectory = dir;
    }
}

function tpLoadExternalMediaJS()
{
    tpExternalJS = tpLoadExternalMediaJS.arguments;
	
    for (var i = 0; i < tpExternalJS.length; i++)
    {
        tpLoadScript(tpExternalJS[i]);
    }
}

function tpCleanupExternal()
{
    if (tpExternalJS)//if there's no external js, then nothing was loaded in
    {
        var scripts = window.document.getElementsByTagName('head')[0].getElementsByTagName('script');
        for (var i = 0; i < scripts.length;i++)
        {
            for (var j = 0; j < tpExternalJS.length; j++)
            {
                if (scripts[i].src == tpExternalJS[j])
                {
                    window.document.getElementsByTagName('head')[0].removeChild(scripts[i]);
                    break;
                }
            }
        }
        tpExternalJS.length = 0;
    }
    if (tpExternalController)
    {
        tpExternalController.cleanup();
    }
}


/////////////////////////////////////////////////////////////////////

tpScriptLoader = new ScriptLoader();

// called from flash via ExternalInterface
function tpLoadJScript(scriptFile, callback, id, atts)
{
    tpScriptLoader.addScript(scriptFile, callback, id, atts);
}

// need to wrap method to fix scoping issue on callback
function callbackDispatcher(loadObj) {
    tpScriptLoader.callbackDispatcher(loadObj)
}
function invokeCallbacks(loadObj) {
    tpScriptLoader.invokeCallbacks()
}

/////////////////////////////////////////////////////////////////////
//					L O A D   O B J E C T
/////////////////////////////////////////////////////////////////////
function LoadObj(scriptFile, callback, id, atts)
{
    this.script = scriptFile;
    this.callback = callback;
    this.id = id;
    this.atts = atts;
}

/////////////////////////////////////////////////////////////////////
//					S C R I P T   L O A D E R
/////////////////////////////////////////////////////////////////////


// constructor
function ScriptLoader()
{
    // queued up for loading scripts
    this.scriptQueue = new Array();
	
    // queued up for invoking callbacks
    this.callbackQueue = new Array();
}

/////////////////////////////////////////////////////////////////////
ScriptLoader.prototype.addScript = function(scriptFile, callback, id, atts)
{
    var loadObj = new LoadObj( scriptFile, callback, id, atts );
    this.scriptQueue.push(loadObj);
	
    // if the queue was empty, we need to kick
    // off the queue processing again.
	
    if (this.scriptQueue.length == 1)
        this.checkScriptQueue();
}

/////////////////////////////////////////////////////////////////////
ScriptLoader.prototype.checkScriptQueue = function()
{
    if (this.scriptQueue.length)
    {
        var loadObj = this.scriptQueue.shift();
        this.loadScript(loadObj);
    }
    else
    {
        // as a timing precaution, we wait until the queue
        // empties out before we invoke callbacks
        interval_id = setInterval("invokeCallbacks()",100) // more timing precautions :-/
    //this.invokeCallbacks();
    }
}
	
/////////////////////////////////////////////////////////////////////
ScriptLoader.prototype.callbackDispatcher = function(loadObj)
{
    for (var i in this.callbackQueue)
    {
        if (this.callbackQueue[i] == loadObj)
        {
            this.checkScriptQueue();
            return;
        }
    }
    this.callbackQueue.push(loadObj);
    this.checkScriptQueue();
}

/////////////////////////////////////////////////////////////////////
ScriptLoader.prototype.invokeCallbacks = function()
{
    clearInterval(interval_id);
    while (this.callbackQueue.length)
    {
        var loadObj = this.callbackQueue.shift();
        eval(loadObj.callback)(loadObj.script);
    }
}

/////////////////////////////////////////////////////////////////////
ScriptLoader.prototype.loadScript = function(loadObj)
{
    var scriptFilename = loadObj.script;
    var callbackFunction = loadObj.callback;
    var id = loadObj.id;
    var atts = loadObj.atts;
	
    // Create script element and set it to load the requested script
    var scriptEl = window.document.createElement('script');
    scriptEl.charset = "utf-8";
    if (id) scriptEl.id = id;
    scriptEl.type = "text/javascript";
    //scriptEl.defer = true;
    if (atts)
    {
        for (var i = 0; i < atts.length; i++)
            scriptEl.setAttribute(atts[i].att, atts[i].value);
    }
    scriptEl.src = scriptFilename;
	
    if (callbackFunction)
    {
        // Function to be called when script has finished loading
        var _onFinished = function(_loadObj, _callback)
        {
            // Invoke the callback function
            _callback(_loadObj)

            // Clean up event handlers
            this.onreadystatechange = null;
            this.onload = null;
            this.onerror = null;
        };

        // Set callback for IE
        // In defiance of MSDN documentation IE's script object has no onload handler
        scriptEl.onreadystatechange = function()
        {
            _onFinished(loadObj, callbackDispatcher);
        };

        // Set callback for W3C-compatible browsers
        scriptEl.onload = function()
        {
            _onFinished(loadObj, callbackDispatcher);
        };
        // Set another callback for W3C-compatible browsers
        // since onreadystatechange for IE also fires in case of an error
        scriptEl.onerror = function()
        {
            _onFinished(loadObj, callbackDispatcher);
        };
    }

    // Add script element to the document
    window.document.getElementsByTagName('head')[0].appendChild(scriptEl);
}

/////////////////////////////////////////////////////////////////////
// ORIGINAL LOADSCRIPT - USED BY MOVENETWORKS 
/////////////////////////////////////////////////////////////////////
function tpLoadScript(scriptFilename, callbackFunction, id, atts)
{
    // Create script element and set it to load the requested script
    var scriptEl = window.document.createElement('script');
    scriptEl.charset = "utf-8";
    if (id) scriptEl.id = id;
    scriptEl.type = "text/javascript";
    //scriptEl.defer = true;
    if (atts)
    {
        for (var i = 0; i < atts.length; i++)
        {
            scriptEl.setAttribute(atts[i].att, atts[i].value);
        }
    }
    scriptEl.src = scriptFilename;
    if (callbackFunction)
    {
        // Function to be called when script has finished loading
        var _onFinished = function(_callbackFunction, _scriptFilename)
        {
            // Invoke the callback function
            _callbackFunction(_scriptFilename);
   
            // Clean up event handlers
            this.onreadystatechange = null;
            this.onload = null;
            this.onerror = null;
        };
   
        // Set callback for IE
        // In defiance of MSDN documentation IE's script object has no onload handler
        scriptEl.onreadystatechange = function()
        {
            _onFinished(callbackFunction, scriptFilename);
        };
   
        // Set callback for W3C-compatible browsers
        scriptEl.onload = function()
        {
            _onFinished(callbackFunction, scriptFilename);
        };
        // Set another callback for W3C-compatible browsers
        // since onreadystatechange for IE also fires in case of an error
        scriptEl.onerror = function()
        {
            _onFinished(callbackFunction, scriptFilename);
        };
    }
   
    // Add script element to the document
    window.document.getElementsByTagName('head')[0].appendChild(scriptEl);
}

/////////////////////////////////////////////////////////////////////



//constructor for tpExternalControl
function tpExternalControllerClass()
{
    this.playerTypes = new Object();//keep a lookup of classes
    this.extPlayers = new Object();//keep the instances here
	
    this.registerExternalPlayer = function(type, playerClass)
    {
        this.playerTypes[type] = playerClass;//keep the class as a string
    }
	
    this.routeMessage = function(swfId, controllerId, streamType, funcName, args)
    {
        var curController = this.extPlayers[controllerId];//see if we have the existing controller lookup
        if (!curController) curController = this.extPlayers[controllerId] = {};//make a lookup for the controller
        var curPlayer = curController[streamType];//now see if we have the actual player object instantiated
        if (!curPlayer)
        {
            var playerClass = this.playerTypes[streamType];
            if (!playerClass) return; //we don't have the correct stream type on hand
            curPlayer = eval("new " + playerClass + "('" + swfId + "', '" + controllerId + "');");//create a new instance of the class
            if (!curPlayer) return;//abort here, too
            curController[streamType] = curPlayer;
        }
        curPlayer[funcName](args);
    }
	
    this.returnMessage = function(swfId, controllerId, funcName, args)
    {
        var obj = tpThisMovie(swfId);
        obj.receiveJSMessage(controllerId, funcName, args);
    }
	
    this.cleanup = function()
    {
        for (var controllerId in this.extPlayers)
        {
            var players = this.extPlayers[controllerId];
            for (var player in players)
            {
                players[player].cleanup();
                delete players[player];
            }
            delete this.extPlayers[controllerId];
        }
    }
}

function tpExternalMessage(swfId, controllerId, streamType, funcName, args)
{
    tpExternalController.routeMessage(swfId, controllerId, streamType, funcName, args);
}

//build this without needing the commManager
tpExternalController = new tpExternalControllerClass();

function tpShowAlert(alertCode) 
{
    switch(alertCode)
    {
        case "FULLSCREEN_DISABLED":
            //if (deconcept.SWFObjectUtil.getPlayerVersion().major < 9)
            alert("Full screen is only available with Flash 9 or later")
            break;
    }
}

function tpGetScriptPath(name)
{

    var scripts = document.getElementsByTagName("script");


    var item=scripts[scripts.length-1].src;

    //need to remove *.js from the path
    if (item.indexOf('/')==-1)
        return "";//no path
        
    item = item.substring(0,item.lastIndexOf('/'));


    return item;

}

function tpGetScriptPath(name)
{

    if (name===undefined&&tpScriptPath!==undefined)
        return tpScriptPath;

    var scripts = document.getElementsByTagName("script");

    var item;

    if (name!==undefined)
    {
    for (var i=0;i<scripts.length;i++)
    {
        if (scripts[i].src.indexOf(name)>=0)
        {
            item = scripts[i].src;
            break;
        }
    }
    }
    else
    {
        item = scripts[scripts.length-1].src;
    }


    if (!item)
        item=scripts[scripts.length-1].src;

    //need to remove *.js from the path
    if (item.indexOf('/')==-1)
        return "";//no path

    item = item.substring(0,item.lastIndexOf('/'));


    return item;

}

if (typeof(window.$pdk) === "undefined")
    tpScriptPath=tpGetScriptPath("util.js");
else
    tpScriptPath=$pdk.scriptRoot+"/js";;









