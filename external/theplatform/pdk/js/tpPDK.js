(function(){var a=false,b=/xyz/.test(function(){xyz
})?/\b_super\b/:/.*/;
this.Class=function(){};
Class.extend=function(g){var f=this.prototype;
a=true;
var e=new this();
a=false;
for(var d in g){e[d]=typeof g[d]=="function"&&typeof f[d]=="function"&&b.test(g[d])?(function(h,i){return function(){var l=this._super;
this._super=f[h];
var k=i.apply(this,arguments);
this._super=l;
return k
}
})(d,g[d]):g[d]
}function c(){if(!a&&this.init){this.init.apply(this,arguments)
}this.instanceOf=function(k){for(var i in k){if(typeof k[i]==="function"&&typeof this[i]!="function"){return false
}return true
}};
if(this["implements"]&&this["implements"].length>0){for(var h=0;
h<this["implements"].length;
h++){if(!this.instanceOf(this["implements"][h])){throw new Error("Interface not fully implemented")
}}}}c.prototype=e;
c.constructor=c;
c.extend=arguments.callee;
return c
}
})();
EventDispatcher=Class.extend({buildListenerChain:function(){if(!this.listenerChain){this.listenerChain={}
}},addEventListener:function(a,b){if(!b instanceof Function){throw {message:"Listener isn't a function"}
}this.buildListenerChain();
if(!this.listenerChain[a]){this.listenerChain[a]=[b]
}else{this.listenerChain[a].push(b)
}},hasEventListener:function(a){if(this.listenerChain){return(typeof this.listenerChain[a]!="undefined")
}else{return false
}},removeEventListener:function(b,c){if(!this.hasEventListener(b)){return false
}for(var a=0;
a<this.listenerChain[b].length;
a++){if(this.listenerChain[b][a]==c){this.listenerChain[b].splice(a,1)
}}},dispatchEvent:function(c,a){this.buildListenerChain();
if(!this.hasEventListener(c)){return false
}for(var b=0;
b<this.listenerChain[c].length;
b++){var d=this.listenerChain[c][b];
if(d.call){d.call(this,a)
}}}});
PDKComponent=Class.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'"></div>'
},write:function(){document.write(this._generateExportedMarkup(this.id));
try{var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},bind:function(d){try{var c=document.getElementById(d);
c.innerHTML=this._generateExportedMarkup();
var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},_bindElement:function(a){return this.container=a
},init:function(){},ready:function(){this.controller.registerFunction("getComponentSize",this,this.getComponentSize);
this.controller.registerFunction("addChild",this,this.addChild);
this.pluginManager=new PlugInManager(this.controller);
for(prop in this){if(!prop.toLowerCase().match(/plugin|wrapper/)){continue
}var o=this[prop];
if(typeof o!="string"){continue
}var d;
if(prop.toLowerCase().indexOf("plugin")==0){d=prop.substr(6)
}else{if(prop.toLowerCase().indexOf("wrapper")==0){d=prop.substr(7)
}}var m;
var n=Number.MAX_VALUE;
var a;
var h;
var f;
var k=new Object();
var c=o.split("|");
for(var g=0;
g<c.length;
g++){var e=c[g];
if(e.indexOf("=")==-1){continue
}var b=[e.substr(0,e.indexOf("=")),e.substr(e.indexOf("=")+1)];
var l=b[0];
var p=b[1];
p=unescape(p);
switch(l.toLowerCase()){case"type":m=p;
break;
case"priority":n=parseInt(p);
break;
case"url":a=p;
break;
case"suburl":h=p;
break;
case"runtime":f=p;
break;
default:k[l]=p;
break
}}if(!a){return null
}this.pluginManager.addPlugIn(d,m,n,a,h,k,null,f)
}this.pluginManager.ready()
},getComponentSize:function(){return{width:this.container.offsetWidth,height:this.container.offsetHeight,id:this.id}
},addChild:function(a){if(this.pluginLayer){this.pluginLayer.appendChild(a)
}else{if(this.container){this.container.appendChild(a)
}}},addPlugIn:function(h,c,b,a,g,f,e){if(!this.plugins){this.plugins=new Array()
}var d={id:h,type:c,priority:b,url:a,subUrl:g,vars:f,plugIn:e};
this.pluginManager.addPlugIn(d)
}});
oldController=EventDispatcher.extend({init:function(){this.functions=new Object();
this.objects=new Object();
this.pluginQueue=new Array();
this.waitingForPlugIn=false
},dispatchEvent:function(b,a){this._super(b,{type:b,data:a})
},doDispatchEvent:function(a){this.dispatchEvent(a.type,a.data)
},removeEventListener:function(a,b){this._super(a,b)
},addEventListener:function(a,b){this._super(a,b)
},loadPlugIn:function(b,a){b.controller=a;
this.pluginQueue.push(b);
if(this.waitingForPlugIn){return
}this.loadNextPlugIn()
},loadNextPlugIn:function(){this.waitingForPlugIn=true;
this.currentPlugIn=this.pluginQueue.shift();
if(this.currentPlugIn){var a=document.getElementsByTagName("head")[0];
var b=document.createElement("script");
b.type="text/javascript";
b.src=this.currentPlugIn.url;
a.appendChild(b)
}else{this.dispatchEvent(PdkEvent.OnPlugInsComplete,null);
if(tpLegacyController){tpLegacyController.ready()
}}},addChild:function(b,a){return this.callFunction("addChild",[b],a)
},plugInLoaded:function(a,b){a.initialize({controller:this.currentPlugIn.controller,vars:this.currentPlugIn.vars,priority:this.currentPlugIn.priority});
if(b){this.addChild(b)
}this.dispatchEvent(PdkEvent.OnPlugInLoaded,a);
this.waitingForPlugIn=false;
this.loadNextPlugIn()
},clickPlayButton:function(a){return this.callFunction("clickPlayButton",[],a)
},setRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("setRelease",[a,b],c)
},setSmil:function(a,b){this.callFunction("setSmil",[a],b)
},loadRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("loadRelease",[a,b],c)
},setReleaseURL:function(a,b,c){return this.callFunction("setReleaseURL",[a,b],c)
},loadReleaseURL:function(a,b,c){return this.callFunction("loadReleaseURL",[a,b],c)
},pause:function(b,a){return this.callFunction("pause",[b],a)
},endRelease:function(a){return this.callFunction("endRelease",[],a)
},resetRelease:function(a){return this.callFunction("resetRelease",[],a)
},mute:function(b,a){return this.callFunction(PdkFunctions.mute,[b],a)
},seekToPosition:function(a,b){return this.callFunction("seekToPosition",[a],b)
},registerMetadataUrlPlugIn:function(c,a,b){return this.callFunction("registerMetadataUrlPlugIn",[c,a],b)
},setMetadataUrl:function(a,b){return this.callFunction("setMetadataUrl",[a],b)
},registerAdPlugIn:function(b){var a=null;
return this.callFunction("registerAdPlugIn",[b],a)
},registerClipWrapperPlugIn:function(b){var a=null;
return this.callFunction("registerClipWrapperPlugIn",[b],a)
},registerURLPlugIn:function(d,c,a){var b=null;
return this.callFunction("registerURLPlugIn",[d,c,a],b)
},setClip:function(b){var a=null;
return this.callFunction("setClip",[b],a)
},registerControlPlugIn:function(c,a){var b=null;
this.callFunction(PdkFunctions.registerControlPlugIn,[c,a],b)
},setAds:function(b,a){return this.callFunction("setAds",[b],a)
},injectPlaylist:function(b,a){return this.callFunction("injectPlaylist",[b],a)
},insertPlaylist:function(b,a){return this.callFunction("insertPlaylist",[b],a)
},insertClip:function(b,a){return this.callFunction("insertClip",[b],a)
},wrapClip:function(c,b,a){return this.callFunction("wrapClip",[c,b],a)
},setClipWrapper:function(a,b){return this.callFunction("setClipWrapper",[a],b)
},playNext:function(c,a,b){return this.callFunction("playNext",[c,a],b)
},playPrevious:function(b,a){this.callFunction("playPrevious",[b],a)
},updateMediaTime:function(a,b){this.callFunction("updateMediaTime",[a],b)
},updateClip:function(b,a){this.callFunction("updateClip",[b],a)
},updatePlaylist:function(b,a){this.callFunction("updatePlaylist",[b],a)
},getDataTypeName:function(a){switch(a){case"AdPattern":return"com.theplatform.pdk.data::AdPattern";
case"Banner":return"com.theplatform.pdk.data::Banner";
case"BaseClip":return"com.theplatform.pdk.data::BaseClip";
case"CallInfo":return"com.theplatform.pdk.communication::CallInfo";
case"CategoryInfo":return"com.theplatform.pdk.data::CategoryInfo";
case"Clip":return"com.theplatform.pdk.data::Clip";
case"CommInfo":return"com.theplatform.pdk.communication::CommInfo";
case"CustomData":return"com.theplatform.pdk.data::CustomData";
case"CustomValue":return"com.theplatform.pdk.data::CustomValue";
case"DispatchInfo":return"com.theplatform.pdk.communication::DispatchInfo";
case"FunctionInfo":return"com.theplatform.pdk.communication::FunctionInfo";
case"HandlerInfo":return"com.theplatform.pdk.communication::HandlerInfo";
case"HyperLink":return"com.theplatform.pdk.data::HyperLink";
case"MediaClick":return"com.theplatform.pdk.data::MediaClick";
case"MediaFile":return"com.theplatform.pdk.data::MediaFile";
case"MessageInfo":return"com.theplatform.pdk.communication::MessageInfo";
case"MetricInfo":return"com.theplatform.pdk.data::MetricInfo";
case"Overlay":return"com.theplatform.pdk.data::Overlay";
case"PdkEvent":return"com.theplatform.pdk.events::PdkEvent";
case"ProviderInfo":return"com.theplatform.pdk.data::ProviderInfo";
case"Range":return"com.theplatform.pdk.data::Range";
case"Rating":return"com.theplatform.pdk.data::Rating";
case"Release":return"com.theplatform.pdk.data::Release";
case"ReleaseInfo":return"com.theplatform.pdk.data::ReleaseInfo";
case"ScopeInfo":return"com.theplatform.pdk.communication::ScopeInfo";
case"Sort":return"com.theplatform.pdk.data::Sort";
case"Subtitles":return"com.theplatform.pdk.data::Subtitles";
case"TrackingUrl":return"com.theplatform.pdk.data::TrackingUrl";
case"BandwidthPreferences":return"com.theplatform.pdk.data::BandwidthPreferences";
case"Annotation":return"com.theplatform.pdk.data::Annotation"
}},refreshReleaseModel:function(a,i,c,d,b,g,h,e,f){if(c){c.globalDataType=this.getDataTypeName("Sort")
}if(d){d.globalDataType=this.getDataTypeName("Range")
}return this.callFunction("refreshReleaseModel",[a,i,c,d,b,g,e,f],h)
},getRelease:function(a,b){return this.callFunction("getRelease",[a],b)
},getMediaArea:function(){var a=null;
return this.callFunction("getMediaArea",[],a)
},getVideoProxy:function(a){return this.callFunction(PdkFunctions.getVideoProxy,[],a)
},ready:function(){this.isHTML5Loading=false;
this.checkMessageQueue()
},callFunction:function(b,e,c,d){if(c==null&&this.scopes!=undefined){c=this.scopes.concat()
}var a=this.functions[b];
if(a){return this.functions[b].apply(this.objects[b],e)
}else{if(tpLegacyController&&!d){return tpLegacyController.callFunction(b,e,c)
}else{return null
}}},doCallFunction:function(a){this.callFunction(a.name,a.args,a.scope)
},registerFunction:function(b,a,d){var c=this.functions[b]===undefined;
this.functions[b]=d;
this.objects[b]=a;
if(tpLegacyController){tpLegacyController.registerFunction(b,function(){return d.apply(a,arguments)
},(this.scopes?this.scopes.concat():undefined),c)
}},isSafeMode:function(){return this.callFunction("isSafeMode",[])
},isPrefetch:function(){return this.callFunction("isPrefetch",[])
},endMedia:function(){return this.callFunction("endMedia",[])
},markOffset:function(c,a,b){return this.callFunction("markOffset",[c,a,b])
},getReleaseState:function(){return this.callFunction(PlayerFunctions.getReleaseState,[])
},setToken:function(a,c,b){this.callFunction("setToken",[a,c],b)
},getOverlayArea:function(a){return this.callFunction("getOverlayArea",[],a)
},setOverlayArea:function(b,a){return this.callFunction("setOverlayArea",[b],a)
},setSubtitleLanguage:function(b,a){this.callFunction("setSubtitleLanguage",[b],a)
},getSubtitleLanguage:function(a,b){this.callFunction("getSubtitleLanguage",[a],b)
},nextClip:function(a){return this.callFunction(PdkFunctions.nextClip,[],a)
},previousClip:function(a){return this.callFunction(PdkFunctions.previousClip,[],a)
},showFullScreen:function(b,a){return this.callFunction(PdkFunctions.showFullScreen,[b],a)
},writePlayer:function(b,a,c){return this.callFunction("writePlayer",[b,a],c)
},isFlashPlayer:function(b){var a=this.callFunction("isFlashPlayer",[],b);
if(a===undefined){return true
}else{return a
}},modRelease:function(a){if(a){a.globalDataType=this.getDataTypeName("Release");
if(a.categories){a.categories=this.modCategories(a.categories)
}if(a.thumbnails){for(var b=0;
b<a.thumbnails.length;
b++){a.thumbnails[b].globalDataType=this.getDataTypeName("MediaFile");
if(a.thumbnails[b].customValues){a.thumbnails[b].customValues=this.modCustomValues(a.thumbnails[b].customValues)
}}}if(a.customValues){a.customValues=this.modCustomValues(a.customValues)
}if(a.metrics){for(var b=0;
b<a.metrics.length;
b++){a.metrics[b].globalDataType=this.getDataTypeName("MetricInfo")
}}if(a.provider){a.provider.globalDataType=this.getDataTypeName("ProviderInfo");
if(a.provider.customValues){a.provider.customValues=this.modCustomValues(a.provider.customValues)
}}if(a.ratings){for(var b=0;
b<a.ratings.length;
b++){a.ratings[b].globalDataType=this.getDataTypeName("Rating")
}}if(a.URL){a.url=a.URL
}}return a
},modCustomValues:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CustomValue")
}return a
},modCategories:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CategoryInfo")
}return a
},modClip:function(a){if(a){a.globalDataType=this.getDataTypeName("Clip");
var b=a.baseClip;
if(!b){b=new Object()
}if(a.banners){b.banners=a.banners
}if(a.overlays){b.overlays=a.overlays
}a.baseClip=this.modBaseClip(b);
if(a.chapter){a.chapter.globalDataType=this.getDataTypeName("Chapter")
}}return a
},modBaseClip:function(b){if(!b){b=new Object()
}b.globalDataType=this.getDataTypeName("BaseClip");
if(b.moreInfo){b.moreInfo.globalDataType=this.getDataTypeName("HyperLink");
if(b.moreInfo.clickTrackingUrls){b.moreInfo.clickTrackingUrls=this.modTracking(b.moreInfo.clickTrackingUrls)
}}if(b.banners){for(var a=0;
a<b.banners.length;
a++){b.banners[a].globalDataType=this.getDataTypeName("Banner");
if(b.banners[a].clickTrackingUrls){b.banners[a].clickTrackingUrls=this.modTracking(b.banners[a].clickTrackingUrls)
}}}if(b.overlays){for(var a=0;
a<b.overlays.length;
a++){b.overlays[a].globalDataType=this.getDataTypeName("Overlay");
if(b.overlays[a].clickTrackingUrls){b.overlays[a].clickTrackingUrls=this.modTracking(b.overlays[a].clickTrackingUrls)
}}}if(b.availableSubtitles){for(var a=0;
a<b.availableSubtitles;
a++){b.availableSubtitles[a].globalDataType=this.getDataTypeName("Subtitles")
}}if(b.categories){b.categories=this.modCategories(b.categories)
}if(b.adPattern){b.adPattern.globalDataType=this.getDataTypeName("AdPattern")
}if(b.trackingURLs){b.trackingURLs=this.modTracking(b.trackingURLs)
}if(b.contentCustomData){b.contentCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.ownerCustomData){b.ownerCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.outletCustomData){b.outletCustomData.globalDataType=this.getDataTypeName("CustomData")
}return b
},modTracking:function(a){for(var b=0;
b<a.length;
b++){a.globalDataType=this.getDataTypeName("TrackingUrl")
}return a
}});
if(window.tpController===undefined){tpController=new oldController()
}else{var tempController=tpController;
tpController=new oldController();
for(var prop in tempController){tpController[prop]=tempController[prop]
}if(window["$pdk"]!==undefined){$pdk.controller=tpController
}}ComponentController=oldController.extend({init:function(b,a){this.id=b;
this.component=a;
this.scopes=[];
this._super()
},getComponentSize:function(a){return this.callFunction("getComponentSize",[],a)
},dispatchEvent:function(b,a){if(this.scopes&&this.scopes.length){tpController.dispatchEvent(b,a,this.scopes.concat())
}else{tpController.dispatchEvent(b,a)
}},removeEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.removeEventListener(a,b,this.scopes.concat())
}else{tpController.removeEventListener(a,b)
}},addEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.addEventListener(a,b,this.scopes.concat())
}else{tpController.addEventListener(a,b)
}},getProperty:function(b){var a=this.component[b];
if(a===undefined){a=this.component[b.toLowerCase()]
}return a
},setProperty:function(a,b){this.component[a]=b
}});
function printStackTrace(){var l=[];
var c=false;
try{d.dont.exist+=0
}catch(g){if(g.stack){var m=g.stack.split("\n");
for(var d=0,f=m.length;
d<f;
d++){if(m[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){l.push(m[d])
}}l.shift();
c=true
}else{if(window.opera&&g.message){var m=g.message.split("\n");
for(var d=0,f=m.length;
d<f;
d++){if(m[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){var k=m[d];
if(m[d+1]){k+="at"+m[d+1];
d++
}l.push(k)
}}l.shift();
c=true
}}}if(!c){var b=arguments.callee.caller;
while(b){var h=b.toString();
var a=h.substring(h.indexOf("function")+8,h.indexOf("("))||"anonymous";
l.push(a);
b=b.caller
}}output(l)
}function output(a){alert(a.join("\n\n"))
}ViewController=ComponentController.extend({init:function(b,c,a){this._super(c,a)
},instantiateCard:function(a){return this.callFunction(PdkFunctions.instantiateCard,[a])
},showCard:function(c,e,f,b,d,a){this.callFunction(PdkFunctions.showCard,[c,e,f,b,d,a])
},hideCard:function(a,b){this.callFunction(PdkFunctions.hideCard,[a,b])
},getCard:function(a,b){return this.callFunction(PdkFunctions.getCard,[a,b])
},getCurrentCard:function(a){return this.callFunction(PdkFunctions.getCurrentCard,[a])
}});
PlayerController=ViewController.extend({init:function(b,a){this._super(ComponentTypes.PLAYER,b,a)
},getReleaseState:function(){return this.callFunction(PlayerFunctions.getReleaseState,[])
},getMuteState:function(){return this.callFunction(PlayerFunctions.getMuteState,[])
},getFullScreenState:function(){return this.callFunction(PlayerFunctions.getFullScreenState,[])
}});
Card=Class.extend({init:function(b,a){this._controller=a;
this._localDispatcher=new EventDispatcher();
this._cardDispatcher=null;
this._cardFunctions={};
this._area=null;
this._isActive=false;
this._isCreating=false;
this._layout=null;
this._startUp=true;
this._initVars=null;
this.id=b;
this.deckId="";
this.container=null;
this._dom=null;
this.priority=1;
this.initialized=false
},instantiate:function(b,a){if(this._isActive||this._isCreating){throw new Error("a Card cannot be instantiated when it is already active")
}this._isActive=this._layout?true:false;
this._isCreating=true;
this._area=b;
this._parent=a;
if(!this.container){this.container=new CssObject(this.id)
}this.container.percentHeight(100);
this.container.percentWidth(100);
this._localDispatcher.dispatchEvent(CardEvent.OnCardCreationStart,this);
if(!this._isActive){this._cleanUp();
this._localDispatcher.dispatchEvent(CardEvent.OnCardDestroyed,this);
return null
}this._dom=this._controller.instantiateCard(this);
return this._dom
},call:function(a,b){return this._callFunction(a,b)
},hasFunction:function(a){if(this._cardFunctions){return(this._cardFunctions[a]?true:false)
}else{return false
}},_callFunction:function(b,c){if(!this._isActive){throw new Error("cannot call a Card function on an inactive Card")
}if(this._cardFunctions){var a=this._cardFunctions[b];
if(!a){return null
}else{return a.func.apply(a.object,c)
}}else{throw new Error("a Card function: "+b+" was called that doesn't exist")
}},registerFunction:function(b,a,c){if(!this._isActive){throw new Error("cannot register a Card function on an inactive Card")
}var d={name:b,object:a,func:c};
if(!this._cardFunctions){this._cardFunctions={}
}this._cardFunctions[b]=d
},unRegisterFunction:function(a){delete this._cardFunctions[a]
},destroy:function(){delete this._layout;
delete this._localDispatcher;
this._cleanUp()
},_cleanUp:function(){delete this._area;
this._isCreating=false;
delete this._initVars;
if(this._cardFunctions){for(var a in this._cardFunctions){delete this._cardFunctions[a]
}delete this._cardFunctions
}if(this._cardDispatcher){delete this._cardDispatcher
}if(this.container){while(this.container.numChildren>0){this.container.removeChildAt(0)
}}},uninstantiate:function(){this._isActive=false;
this._localDispatcher.dispatchEvent(CardEvent.OnCardDestroyStart,this);
if(this._dom){this._dom.destroy()
}this._localDispatcher.dispatchEvent(CardEvent.OnCardDestroyed,this);
this._cleanUp()
},area:function(a){if(this._area!=undefined){this._area=a;
this._localDispatcher.dispatchEvent(CardEvent.OnCardAreaChanged,this._area)
}return this._area
},dom:function(){return this._dom
},isActive:function(a){if(a!=undefined){if(this._isCreating){this._isActive=a
}else{throw new Error("isActive can only be set inside the OnCardCreationStart event handler")
}}return this._isActive
},initVars:function(b){if(b!=undefined){if(this._initVars){for(var a in b){this._initVars[a]=b[a]
}}else{this._initVars=b
}}return this._initVars
},layout:function(a){if(a!=undefined){if(this._isActive&&!this._isCreating){throw new Error("layout cannot be set while the Card is active")
}this._layout=a
}if(this._layout){return this._layout
}},addEventListener:function(a,b){if(!this._localDispatcher){return
}if(this._isLocalEvent(a)){this._localDispatcher.addEventListener(a,b)
}else{if(!this._isActive){throw new Error("Card events cannot be added to an inactive Card")
}else{if(!this._cardDispatcher){this._cardDispatcher=new EventDispatcher()
}this._cardDispatcher.addEventListener(a,b)
}}},_isLocalEvent:function(a){switch(a){case CardEvent.OnCardAreaChanged:case CardEvent.OnCardCreated:case CardEvent.OnCardCreationStart:case CardEvent.OnCardDestroyed:case CardEvent.OnCardDestroyStart:case CardEvent.OnCardEnabled:case CardEvent.OnCardVisible:case CardEvent.OnDeckCreated:return true;
default:return false
}},removeEventListener:function(a,b){if(!this._localDispatcher){return
}if(this._isLocalEvent(a)){this._localDispatcher.removeEventListener(a,b)
}else{if(this._cardDispatcher){this._cardDispatcher.removeEventListener(a,b)
}}},dispatchEvent:function(a,b){if(!this._localDispatcher){return false
}if(this._isLocalEvent(a)){return this._localDispatcher.dispatchEvent(a,b)
}if(!this._isActive){throw new Error("cannot dispatch an event on an inactive Card")
}if(this._cardDispatcher){return this._cardDispatcher.dispatchEvent(a,b)
}return false
},hasEventListener:function(a){if(!this._localDispatcher){return false
}if(this._isLocalEvent(a)){return this._localDispatcher.hasEventListener(a)
}if(!this._isActive){throw new Error("cannot check an event on an inactive Card")
}if(this._cardDispatcher){return this._cardDispatcher.hasEventListener(a)
}return false
}});
CssObject=EventDispatcher.extend({init:function(a){this._id=a;
this._x=0;
this._y=0;
this._height=0;
this._width=0;
this._top=0;
this._bottom=0;
this._left=0;
this._right=0;
this._position="relative";
this._display="none";
this._float="";
this._units="px";
this._overflow="hidden";
this._backgroundColor="";
this._color="";
this._opacity="";
this._elementType="div";
this._enabled=false;
this._visible=false;
this._percentHeight=-1;
this._percentWidth=-1;
this.write()
},getView:function(){if(!this.element){return null
}else{return this.element
}},setView:function(a){this.element=a
},contains:function(a){for(var b in this.element.children){if(this.element.children[b]==a.element){return true
}}return false
},width:function(b,a){if(b==undefined){return this._width
}else{if(a!=undefined){this._width=b;
this.element.style.width=b+a
}else{this._width=b;
this.element.style.width=b+this._units
}}},height:function(b,a){if(b==undefined){return this._height
}else{if(a!=undefined){this._height=b;
this.element.style.height=b+a
}else{this._height=b;
this.element.style.height=b+this._units
}}},fontSize:function(b,a){if(b==undefined){return this._fontSize
}else{if(a!=undefined){this._fontSize=b;
this.element.style.fontSize=b+a
}else{this._height=b;
this.element.style.fontSize=b+this._units
}}},left:function(b,a){if(b==undefined){return this._left
}else{if(a!=undefined){this._left=b;
this.element.style.left=b+a
}else{this._left=b;
this.element.style.left=b+this._units
}}},right:function(b,a){if(b==undefined){return this._right
}else{if(a!=undefined){this._right=b;
this.element.style.right=b+a
}else{this._right=b;
this.element.style.right=b+this._units
}}},bottom:function(b,a){if(b==undefined){return this._bottom
}else{if(a!=undefined){this._bottom=b;
this.element.style.bottom=b+a
}else{this._bottom=b;
this.element.style.bottom=b+this._units
}}},top:function(b,a){if(b==undefined){return this._top
}else{if(a!=undefined){this._top=b;
this.element.style.top=b+a
}else{this._top=b;
this.element.style.top=b+this._units
}}},x:function(a){this.left(a,"px")
},y:function(a){this.top(a,"px")
},percentWidth:function(a){if(a==undefined){return this._percentWidth
}else{this._percentWidth=a;
this._width=-1;
this.element.style.width=a+"%"
}},percentHeight:function(a){if(a==undefined){return this._percentHeight
}else{this._percentHeight=a;
this._height=-1;
this.element.style.height=a+"%"
}},visible:function(a){if(a==undefined){return this._visible
}else{if(a==true){this._visible=true;
this.element.style.visibility="visible"
}else{this._visible=false;
this.element.style.visibility="hidden"
}}},cssFloat:function(a){if(a==undefined){return this._float
}else{this._float=a;
this.element.style["float"]=a;
this.element.style.cssFloat=a
}},units:function(a){if(a==undefined){return this._units
}else{this._units=a
}},display:function(a){if(a==undefined){return this._display
}else{this._display=a;
this.element.style.display=a
}},alpha:function(a){if(a!=undefined){this.opacity(a)
}else{return this.opacity(a)
}},opacity:function(a){if(a==undefined){return this._opacity
}else{this._opacity=a;
this.element.style.opacity=a;
this.element.style["-moz-opacity"]=a;
this.element.style.filter="alpha(opacity="+(a*100)+")"
}},backgroundColor:function(a){if(a==undefined){return this._backgroundColor
}else{this._backgroundColor=a;
this.element.style.backgroundColor=a
}},color:function(a){if(a==undefined){return this._color
}else{this._color=a;
this.element.style.color=a
}},position:function(a){if(a==undefined){return this._position
}else{this._position=a;
this.element.style.position=a
}},overflow:function(a){if(a==undefined){return this._overflow
}else{this._overflow=a;
this.element.style.overflow=a
}},enabled:function(a){if(a==undefined){return this._enabled
}else{if(a==true){this._enabled=true
}else{this._enabled=false
}}},offsetHeight:function(){return this.getView().offsetHeight
},offsetWidth:function(){return this.getView().offsetWidth
},offsetLeft:function(){return this.getView().offsetLeft
},offsetTop:function(){return this.getView().offsetTop
},write:function(){if(!this.element){this.element=document.createElement(this._elementType)
}if(this._id){this.element.id=this._id
}},validateLayout:function(){},invalidateLayout:function(){}});
var CardEvent=new Object();
CardEvent.OnCardAreaChanged="OnCardAreaChanged";
CardEvent.OnCardCreationStart="OnCardCreationStart";
CardEvent.OnCardCreated="OnCardCreated";
CardEvent.OnCardDestroyStart="OnCardDestroyStart";
CardEvent.OnCardDestroyed="OnCardDestroyed";
CardEvent.OnCardEnabled="OnCardEnabled";
CardEvent.OnCardVisible="OnCardVisible";
CardEvent.OnDeckCreated="OnDeckCreated";
var PlayerEvent=new Object();
PlayerEvent.OnUpdateOverlays="OnUpdateOverlays";
PlayerEvent.OnCheckAdFailed="OnCheckAdFailed";
PlayerEvent.OnStandbyRelease="OnStandbyRelease";
PlayerEvent.OnMediaAreaChanged="OnMediaAreaChanged";
PlayerEvent.onContentAreaChanged="onContentAreaChanged";
PlayerEvent.OnOverlayAreaChanged="OnOverlayAreaChanged";
PlayerEvent.OnReleaseStop="OnReleaseStop";
PlayerEvent.OnBandwidthPreferencesSet="OnBandwidthPreferencesSet";
PlayerEvent.OnFormShown="OnFormShown";
PlayerEvent.OnFlashFullScreen="OnPlayerFullScreen";
PlayerEvent.OnExternalFullScreen="OnExternalFullScreen";
PlayerEvent.OnPlayerPause="OnPlayerPause";
PlayerEvent.OnPlayerUnPause="OnPlayerUnPause";
PlayerEvent.OnNetConnectionClosed="OnNetConnectionClosed";
PlayerEvent.OnTrackActivated="OnTrackActivated";
PlayerEvent.OnPlugInsAboveControlsChanged="OnPlugInsAboveControlsChanged";
PlayerEvent.OnDebug="OnDebug";
PlayerEvent.OnVideoSized="OnVideoSized";
PlayerEvent.OnRelatedContentIdsReceived="OnRelatedContentIdsReceived";
Interface=Class.extend({init:function(){},isInstanceOf:function(b){for(var a in b){if(typeof b[a]==="function"){if(typeof this[a]!="function"){return false
}}}return true
}});
SampleCard=EventDispatcher.extend({init:function(d,b,a){var c=this;
this.id=d;
this.controller=a;
this.write()
},write:function(){if(this.view){this.view.innerHTML=""
}this.view=document.createElement("div");
this.view.id=this.id;
this.view.className="cardOverlay";
this.view.style.position="absolute";
this.view.style.top="0px";
this.view.style.left="0px";
this.view.style.height="100%";
this.view.style.width="100%";
this.view.style.background="";
this.view.style.zIndex="1000";
this.view.style.display="none";
if(parent){this.parent=parent
}},cardClicked:function(){},getView:function(){return this.view
},showCard:function(a){if(a){this.view.style.display=""
}else{this.view.style.display="none"
}}});
$pdk.ns("$pdk.subtitles");
$pdk.subtitles.SubtitlesView=$pdk.extend(function(){},{TEXT_CLASS:"tpSubtitlesContent",constructor:function(d){this.fullscreenSubtitleScale=d.properties.fullscreenSubtitleScale!==undefined?parseFloat(d.properties.fullscreenSubtitleScale):2;
this.overlayRect=d.properties.overlayRect;
var b=$pdk.jQuery;
var a=b("head").get(0);
this.style=document.createElement("style");
this.style.setAttribute("type","text/css");
var c=".tpSubtitles { color: white;font-family: Calibri, Helvetica, Arial;font-size: 20px;font-weight: bold;text-shadow:black 1px 1px 1px;position: absolute;pointer-events:none;background:transparent;line-height:20px;z-index:1;} ."+this.TEXT_CLASS+" {bottom: -1px;cursor:default;position: absolute;text-align:center;background:transparent;pointer-events:none;margin-left: 20px;margin-right: 20px;margin-bottom:4px;}.tpSubtitles p {padding: 0;margin: 0;}.tpSubtitles.tpSubtitlesShadow * {color: black;}";
if(this.style.styleSheet){this.style.styleSheet.cssText=c
}else{this.style.appendChild(document.createTextNode(c))
}a.insertBefore(this.style,a.firstChild);
this._targets=$pdk.jQuery([d.element]);
this._targets.append(['<div class="',this.TEXT_CLASS,'"></div>'].join(""));
this._targets=this.doTextShadow(d.element);
this.updateLayout(this.overlayRect)
},doTextShadow:function(c){var f=c;
var e=document.createElement(f.nodeName);
var a=document.createElement(f.nodeName);
var d=document.createElement(f.nodeName);
var b=document.createElement(f.nodeName);
e.className=f.className+" tpSubtitlesShadow";
b.className=f.className+" tpSubtitlesShadow";
d.className=f.className+" tpSubtitlesShadow";
a.className=f.className+" tpSubtitlesShadow";
e.innerHTML=f.innerHTML;
b.innerHTML=f.innerHTML;
a.innerHTML=f.innerHTML;
d.innerHTML=f.innerHTML;
$pdk.jQuery(e).children().css("color","black");
$pdk.jQuery(b).children().css("color","black");
$pdk.jQuery(d).children().css("color","black");
$pdk.jQuery(a).children().css("color","black");
e.style.top="-1px";
e.style.left="-1px";
b.style.top="-1px";
b.style.left="1px";
d.style.top="1px";
d.style.left="-1px";
a.style.top="1px";
a.style.left="1px";
f.parentNode.insertBefore(e,f);
f.parentNode.insertBefore(b,f);
f.parentNode.insertBefore(d,f);
f.parentNode.insertBefore(a,f);
return $pdk.jQuery([f,e,b,d,a])
},_initialize:function(){},updateLayout:function(c){var a=c.height;
var e=c.top;
var d=c.left;
var b=c.width;
this.overlayRect=c;
$pdk.jQuery(this._targets).each(function(f){var i=0;
var g=0;
switch(f){case 1:i=-1;
g=-1;
break;
case 2:i=1;
g=-1;
break;
case 3:i=-1;
g=1;
break;
case 4:i=1;
g=1;
break
}var h=$pdk.jQuery(this);
h.css("height",a+"px");
h.css("top",e+g+"px");
h.css("left",d+i+"px");
h.css("width",b+"px");
h.children().css("width",(b-40)+"px")
})
},update:function(){var a=this;
this._targets.find([".",this.TEXT_CLASS].join("")).each(function(b){this.innerHTML=a._textString
})
},setText:function(a){this._textString=a;
this.update()
},show:function(){this._targets.show()
},hide:function(){this._targets.hide()
},setFullScreen:function(c){if(c&&document.webkitIsFullScreen){if(!this.hasGoneFullScreen){var b=$pdk.jQuery(this._targets.first().get(0)).css("font-size");
var a;
if(b.indexOf("px")>=0){a=(parseFloat(b.replace("px",""))*this.fullscreenSubtitleScale)+"px"
}else{if(b.indexOf("em")>=0){a=(parseFloat(b.replace("me",""))*this.fullscreenSubtitleScale)+"em"
}}var d=this.style.innerHTML;
d+=".tpFullScreen ."+this.TEXT_CLASS+" {	font-size: "+a+";	line-height: "+a+";}";
if(this.style.styleSheet){this.style.styleSheet.cssText=d
}else{this.style.innerHTML="";
this.style.appendChild(document.createTextNode(d))
}this.hasGoneFullScreen=true
}$(this._targets).each(function(e){$(this).addClass("tpFullScreen")
})
}else{$(this._targets).each(function(e){$(this).removeClass("tpFullScreen")
})
}}});
if("4"!=$pdk.bootloaderVersion.major||"5"!=$pdk.bootloaderVersion.minor||"0"!=$pdk.bootloaderVersion.revision){alert("Error: Bootloader Version and PDK-JS Version do not match.\n\nSomething is seriously wrong.")
}var PdkFunctions=new Object();
PdkFunctions.getCommandChain="getCommandChain";
PdkFunctions.insertCommand="insertCommand";
PdkFunctions.setRelease="setRelease";
PdkFunctions.setReleaseURL="setReleaseURL";
PdkFunctions.loadRelease="loadRelease";
PdkFunctions.loadReleaseURL="loadReleaseURL";
PdkFunctions.fetchReleaseData="fetchReleaseData";
PdkFunctions.loadSmil="loadSmil";
PdkFunctions.setSmil="setSmil";
PdkFunctions.resetPlayer="resetPlayer";
PdkFunctions.setCurrentReleaseList="setCurrentReleaseList";
PdkFunctions.nextClip="nextClip";
PdkFunctions.previousClip="previousClip";
PdkFunctions.seekToPosition="seekToPosition";
PdkFunctions.seekToPercentage="seekToPercentage";
PdkFunctions.pause="pause";
PdkFunctions.mute="mute";
PdkFunctions.setVolume="setVolume";
PdkFunctions.setPlayerMessage="setPlayerMessage";
PdkFunctions.clearPlayerMessage="clearPlayerMessage";
PdkFunctions.disablePlayerControls="disablePlayerControls";
PdkFunctions.setPreviewImageUrl="setPreviewImageUrl";
PdkFunctions.showFullScreen="showFullScreen";
PdkFunctions.showEmailForm="showEmailForm";
PdkFunctions.showLinkForm="showLinkForm";
PdkFunctions.getSubtitleLanguage="getSubtitleLanguage";
PdkFunctions.setSubtitleLanguage="setSubtitleLanguage";
PdkFunctions.useDefaultEmailForm="useDefaultEmailForm";
PdkFunctions.submitForm="submitForm";
PdkFunctions.setFormSubmission="setFormSubmission";
PdkFunctions.useDefaultLinkForm="useDefaultLinkForm";
PdkFunctions.getPlayerVariables="getPlayerVariables";
PdkFunctions.useDefaultPlayOverlay="useDefaultPlayOverlay";
PdkFunctions.getUseDefaultPlayOverlay="getUseDefaultPlayOverlay";
PdkFunctions.showPlayOverlay="showPlayOverlay";
PdkFunctions.clickPlayButton="clickPlayButton";
PdkFunctions.clearAdCookie="clearAdCookie";
PdkFunctions.hidePlayerRegions="hidePlayerRegions";
PdkFunctions.setBandwidthPreferences="setBandwidthPreferences";
PdkFunctions.getBandwidthPreferences="getBandwidthPreferences";
PdkFunctions.setVideoScalingMethod="setVideoScalingMethod";
PdkFunctions.setExpandVideo="setExpandVideo";
PdkFunctions.showPlayerCard="showPlayerCard";
PdkFunctions.hidePlayerCard="hidePlayerCard";
PdkFunctions.registerControlPlugIn="registerControlPlugIn";
PdkFunctions.registerViewFactory="registerViewFactory";
PdkFunctions.createConcreteControl="createConcreteControl";
PdkFunctions.refreshCategoryModel="refreshCategoryModel";
PdkFunctions.clearCategorySelection="clearCategorySelection";
PdkFunctions.refreshReleaseModel="refreshReleaseModel";
PdkFunctions.setClipInfo="setClipInfo";
PdkFunctions.nextRange="nextRange";
PdkFunctions.previousRange="previousRange";
PdkFunctions.firstRange="firstRange";
PdkFunctions.playPrevious="playPrevious";
PdkFunctions.playNext="playNext";
PdkFunctions.suspendPlayAll="suspendPlayAll";
PdkFunctions.loadSkin="loadSkin";
PdkFunctions.getAsset="getAsset";
PdkFunctions.getImageAsset="getImageAsset";
PdkFunctions.getFont="getFont";
PdkFunctions.getTextFormat="getTextFormat";
PdkFunctions.getTextFieldAttributes="getTextFieldAttributes";
PdkFunctions.getDefaultStyles="getDefaultStyles";
PdkFunctions.getSkinProperties="getSkinProperties";
PdkFunctions.getComponentSize="getComponentSize";
PdkFunctions.localToGlobal="localToGlobal";
PdkFunctions.globalToLocal="globalToLocal";
PdkFunctions.colorizeAsset="colorizeAsset";
PdkFunctions.setColor="setColor";
PdkFunctions.getBackgroundPadding="getBackgroundPadding";
PdkFunctions.getStage="getStage";
PdkFunctions.getImageLoaderAsset="getImageLoaderAsset";
PdkFunctions.createITextField="createITextField";
PdkFunctions.createILabel="createILabel";
PdkFunctions.registerMetadataUrlPlugIn="registerMetadataUrlPlugIn";
PdkFunctions.processMetadataUrl="processMetadataUrl";
PdkFunctions.setMetadataUrl="setMetadataUrl";
PdkFunctions.instantiateCard="instantiateCard";
PdkFunctions.addCard="addCard";
PdkFunctions.showCard="showCard";
PdkFunctions.hideCard="hideCard";
PdkFunctions.getCard="getCard";
PdkFunctions.getCurrentCard="getCurrentCard";
PdkFunctions.addMediator="addMediator";
PdkFunctions.addItem="addItem";
PdkFunctions.getMediator="getMediator";
PdkFunctions.getItem="getItem";
PdkFunctions.setDefaultFont="setDefaultFont";
PdkFunctions.registerTextField="registerTextField";
PdkFunctions.setText="setText";
PdkFunctions.setHtmlText="setHtmlText";
PdkFunctions.getColorFromString="getColorFromString";
PdkFunctions.setDefaultStyle="setDefaultStyle";
PdkFunctions.setPreferredStyle="setPreferredStyle";
PdkFunctions.setFont="setFont";
PdkFunctions.setStyleParameter="setStyleParameter";
PdkFunctions.showTooltip="showTooltip";
PdkFunctions.registerCompanionAdPlugIn="registerCompanionAdPlugIn";
PdkFunctions.setCompanionAd="setCompanionAd";
PdkFunctions.getAnimationManager="getAnimationManager";
ComponentTypes=new Object();
ComponentTypes.CATEGORY_LIST="categoryList";
ComponentTypes.CATEGORY_MODEL="categoryModel";
ComponentTypes.CLIP_INFO="clipInfo";
ComponentTypes.COMM_MANAGER="commManager";
ComponentTypes.HEADER="header";
ComponentTypes.JAVASCRIPT="javascript";
ComponentTypes.NAVIGATION="navigation";
ComponentTypes.PLAYER="player";
ComponentTypes.RELEASE_LIST="releaseList";
ComponentTypes.RELEASE_MODEL="releaseModel";
ComponentTypes.SEARCH="search";
ComponentTypes.EXTERNAL="external";
ComponentTypes.LOCAL_ALL="localAll";
ComponentTypes.GLOBAL_ALL="globalAll";
Rectangle=Class.extend({init:function(b,d,c,a){this._x=b?b:0;
this._y=d?d:0;
this._width=c?c:0;
this._height=a?a:0;
this._top=this._y;
this._bottom=this._y+this._height;
this._left=this._x;
this._right=this._x+this._width
},clone:function(){return new Rectangle(this._x,this._y,this._width,this._height)
},x:function(a){if(a!=undefined){if(a<0){a=0
}this._x=a;
this._left=a;
this._right=a+this._width
}return this._x
},y:function(a){if(a!=undefined){if(a<0){a=0
}this._y=a;
this._top=a;
this._bottom=a+this._height
}return this._y
},width:function(a){if(a!=undefined){if(a<0){a=0
}this._width=a;
this._right=a+this._x
}return this._width
},height:function(a){if(a!=undefined){if(a<0){a=0
}this._height=a;
this._bottom=a+this._y
}return this._height
},top:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._height=0
}else{this._height=this._bottom-a
}this._top=this._y=a
}return this._top
},left:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._width=0
}else{this._width=this._right-a
}this._left=this._x=a
}return this._left
},bottom:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._bottom=this._y=a;
this._height=0
}else{this._bottom=a;
this._height=a-this._y
}}return this._bottom
},right:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._right=this._x=a;
this._width=0
}else{this._right=a;
this._width=a-this._x
}}return this._right
}});
var CardEvent=new Object();
CardEvent.OnCardAreaChanged="OnCardAreaChanged";
CardEvent.OnCardCreationStart="OnCardCreationStart";
CardEvent.OnCardCreated="OnCardCreated";
CardEvent.OnCardDestroyStart="OnCardDestroyStart";
CardEvent.OnCardDestroyed="OnCardDestroyed";
CardEvent.OnCardEnabled="OnCardEnabled";
CardEvent.OnCardVisible="OnCardVisible";
CardEvent.OnDeckCreated="OnDeckCreated";
var PlayerEvent=new Object();
PlayerEvent.OnUpdateOverlays="OnUpdateOverlays";
PlayerEvent.OnCheckAdFailed="OnCheckAdFailed";
PlayerEvent.OnStandbyRelease="OnStandbyRelease";
PlayerEvent.OnMediaAreaChanged="OnMediaAreaChanged";
PlayerEvent.onContentAreaChanged="onContentAreaChanged";
PlayerEvent.OnOverlayAreaChanged="OnOverlayAreaChanged";
PlayerEvent.OnReleaseStop="OnReleaseStop";
PlayerEvent.OnBandwidthPreferencesSet="OnBandwidthPreferencesSet";
PlayerEvent.OnFormShown="OnFormShown";
PlayerEvent.OnFlashFullScreen="OnPlayerFullScreen";
PlayerEvent.OnExternalFullScreen="OnExternalFullScreen";
PlayerEvent.OnPlayerPause="OnPlayerPause";
PlayerEvent.OnPlayerUnPause="OnPlayerUnPause";
PlayerEvent.OnNetConnectionClosed="OnNetConnectionClosed";
PlayerEvent.OnTrackActivated="OnTrackActivated";
PlayerEvent.OnPlugInsAboveControlsChanged="OnPlugInsAboveControlsChanged";
PlayerEvent.OnDebug="OnDebug";
PlayerEvent.OnVideoSized="OnVideoSized";
PlayerEvent.OnRelatedContentIdsReceived="OnRelatedContentIdsReceived";
var PlayerFunctions=new Object();
PlayerFunctions.getContentArea="getContentArea";
PlayerFunctions.getMediaArea="getMediaArea";
PlayerFunctions.setMediaArea="setMediaArea";
PlayerFunctions.setMediaPadding="setMediaPadding";
PlayerFunctions.getMediaPadding="getMediaPadding";
PlayerFunctions.setOverlayArea="setOverlayArea";
PlayerFunctions.getOverlayArea="getOverlayArea";
PlayerFunctions.getNetStreamData="getNetStreamData";
PlayerFunctions.addNetStreamClient="addNetStreamClient";
PlayerFunctions.removeNetStreamClient="removeNetStreamClient";
PlayerFunctions.attachNetStream="attachNetStream";
PlayerFunctions.removeOverlay="removeOverlay";
PlayerFunctions.endRelease="endRelease";
PlayerFunctions.getUsingPlayOverlay="getUsingPlayOverlay";
PlayerFunctions.getReleaseState="getReleaseState";
PlayerFunctions.getCurrentRelease="getCurrentRelease";
PlayerFunctions.getCurrentPlaylist="getCurrentPlaylist";
PlayerFunctions.getCurrentClip="getCurrentClip";
PlayerFunctions.getPreviousClip="getPreviousClip";
PlayerFunctions.getCurrentPosition="getCurrentPosition";
PlayerFunctions.hideMedia="hideMedia";
PlayerFunctions.setFlashFullScreen="setFlashFullScreen";
PlayerFunctions.getFullScreenState="getFullScreenState";
PlayerFunctions.createClipFromBaseClip="createClipFromBaseClip";
PlayerFunctions.getPlugInsAboveControls="getPlugInsAboveControls";
PlayerFunctions.setPlugInsAboveControls="setPlugInsAboveControls";
PlayerFunctions.restartCurrentClip="restartCurrentClip";
PlayerFunctions.addExpandee="addExpandee";
PlayerFunctions.removeExpandee="removeExpandee";
PlayerFunctions.addPopUp="addPopUp";
PlayerFunctions.removePopUp="removePopUp";
PlayerFunctions.validateItemId="validateItemId";
PlayerFunctions.getMuteState="getMuteState";
PlayerFunctions.getSoundLevel="getSoundLevel";
PlayerFunctions.getPauseState="getPauseState";
PlayerFunctions.setPauseState="setPauseState";
PlayerFunctions.setVideoVisible="setVideoVisible";
PlayerFunctions.sizeVideo="sizeVideo";
PlayerFunctions.injectPlaylist="injectPlaylist";
PlayerFunctions.insertClip="insertClip";
PlayerFunctions.setMediaHyperlink="setMediaHyperlink";
PlayerFunctions.getCurrentBandwidthPreferences="getCurrentBandwidthPreferences ";
PlayerFunctions.getActiveTrack="getActiveTrack";
PlayerFunctions.setActiveTrack="setActiveTrack";
PlayerFunctions.setPrimaryMediaWrapper="setPrimaryMediaWrapper";
PlayerFunctions.getPrimaryMediaWrapper="getPrimaryMediaWrapper";
PlayerFunctions.registerNetConnectionPlugIn="registerNetConnectionPlugIn";
PlayerFunctions.registerClipWrapperPlugIn="registerClipWrapperPlugIn";
PlayerFunctions.setClipWrapper="setClipWrapper";
PlayerFunctions.wrapClip="wrapClip";
PlayerFunctions.registerAdPlugIn="registerAdComponent";
PlayerFunctions.getTimeSinceLastAd="getTimeSinceLastAd";
PlayerFunctions.getContentSinceLastAd="getContentSinceLastAd";
PlayerFunctions.setAds="setAds";
PlayerFunctions.registerRelatedItemsPlugIn="registerRelatedItemsPlugIn";
PlayerFunctions.setRelatedContentIds="setRelatedContentIds";
PlayerFunctions.checkRelatedContentIds="checkRelatedContentIds";
PlayerFunctions.registerURLPlugIn="registerURLPlugIn";
PlayerFunctions.setClip="setClip";
PlayerFunctions.parseReleaseXML="parseReleaseXml";
PlayerFunctions.parseSmil="parseSmil";
PlayerFunctions.registerFormSubmitPlugIn="registerFormSubmitPlugIn";
PlayerFunctions.addSharingSite="addSharingSite";
PlayerFunctions.getSharingSite="getSharingSite";
PlayerFunctions.postSharingSite="postSharingSite";
var RegionFunctions=new Object();
RegionFunctions.setHideState="setHideState";
RegionFunctions.setDefaultInitialHideDelay="setDefaultInitialHideDelay";
RegionFunctions.setDefaultAutoHideDelay="setDefaultAutoHideDelay";
RegionFunctions.registerRegionFullScreen="registerRegionFullScreen";
RegionFunctions.unRegisterRegionFullScreen="unRegisterRegionFullScreen";
RegionFunctions.disableRegionFullScreen="disableRegionFullScreen";
FullScreenManager=Class.extend({init:function(b,a){this._controller=b;
this._pbm=a;
this._controller.registerFunction(PdkFunctions.showFullScreen,this,this.doShowFullScreen);
this._controller.registerFunction(PlayerFunctions.getFullScreenState,this,this.getFullScreenState);
var c=this;
this.flashFullScreenListener=function(d){c.flashFullScreen(d)
};
this._controller.addEventListener(PlayerEvent.OnFlashFullScreen,this.flashFullScreenListener);
this._controller.addEventListener("OnMediaError",function(){c.doShowFullScreen(false)
});
this._allowFullScreen=this._controller.getProperty("allowFullScreen")=="false"?false:true
},doShowFullScreen:function(a){if(!this._allowFullScreen&&a){return
}if(this.isFullScreen()!=a){this._isFullScreen=a;
var b=new Object();
b.data=this._isFullScreen;
tpDebug("Going fullscreen");
this.setWebkitFullScreen(b)
}},isFullScreen:function(){var a=this._pbm.video;
var b=a.parentNode.parentNode;
if(document.webkitIsFullScreen||a.webkitDisplayingFullscreen){return true
}else{return false
}},setWebkitFullScreen:function(g){var b=g.data;
this._isFullScreen=b;
var a=(navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1&&navigator.userAgent.toLowerCase().indexOf("chrome")===-1);
var d=this._pbm.video;
var f=d.parentNode.parentNode;
if(f.webkitRequestFullScreen&&!a){if(document.webkitIsFullScreen){document.webkitCancelFullScreen()
}else{try{f.webkitRequestFullScreen()
}catch(g){tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error")
}this.sendEvt();
var c=this;
f.addEventListener("webkitfullscreenchange",function(){c._isFullScreen=document.webkitIsFullScreen;
if(!c._isFullScreen){f.removeEventListener("webkitfullscreenchange",this)
}c.sendEvt()
})
}return
}else{if(d.webkitSupportsFullscreen){if(d.webkitDisplayingFullscreen){d.webkitExitFullScreen()
}else{if(!d.webkitDisplayingFullscreen){d.webkitEnterFullScreen()
}}}else{this._isFullScreen=false
}}this.sendEvt()
},sendEvt:function(){this._controller.dispatchEvent(PdkEvent.OnShowFullScreen,this._isFullScreen)
},getFullScreenState:function(){if(tpIsAndroid()||this._pbm.video.webkitDisplayingFullscreen){this._isFullScreen=true
}else{this._isFullScreen=false
}return this._isFullScreen
}});
var PlayerStyleFactory=new Object();
PlayerStyleFactory.PLAYER_COUNTDOWN_FONT="PlayerCountdownFont";
PlayerStyleFactory.PLAYER_CONTROL_LABEL_FONT="PlayerControlLabelFont";
PlayerStyleFactory.PLAYER_CONTROL_LANGUAGE_FONT="PlayerControlLanguageFont";
PlayerStyleFactory.PLAYER_CONTROL_TOOLTIP_FONT="PlayerControlTooltipFont";
PlayerStyleFactory.PLAYER_FORM_TITLE_FONT="PlayerFormTitleFont";
PlayerStyleFactory.PLAYER_FORM_BUTTON_FONT="PlayerFormButtonFont";
PlayerStyleFactory.PLAYER_FORM_INPUT_FONT="PlayerFormInputFont";
PlayerStyleFactory.PLAYER_FORM_LABEL_FONT="PlayerFormLabelFont";
PlayerStyleFactory.PLAYER_FORM_MESSAGE_FONT="PlayerFormMessageFont";
PlayerStyleFactory.PLAYER_FORM_DESCRIPTION_FONT="PlayerFormDescriptionFont";
PlayerStyleFactory.PLAYER_MESSAGE_FONT="PlayerMessageFont";
PlayerStyleFactory.PLAYER_SUBTITLE_FONT="PlayerSubtitleFont";
PlayerStyleFactory.PLAYER_TITLE_FONT="PlayerTitleFont";
PlayerStyleFactory.DEFAULT_FONT="PlayerControlLabelFont";
$pdk.ns("$pdk.plugin");
$pdk.plugin.MetadataUrlManager=$pdk.extend(function(){},{constructor:function(a){this._plugins=[];
this._currentQueue=[];
this._context={complete:false,found:false};
this._controller=a;
this._controller.registerFunction("registerMetadataUrlPlugIn",this,this.registerMetadataUrlPlugIn);
this._controller.registerFunction("setMetadataUrl",this,this.setMetadataUrl)
},setUrl:function(c,a,b){this._context={releaseUrl:c,isPreview:a,callback:b,complete:false,found:false};
this._currentQueue=this._plugins.concat();
if(this._currentQueue.length===0){b(c)
}else{if(!this._processNextPlugin()){b(c)
}}},setMetadataUrl:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.releaseUrl=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.releaseUrl=a;
if(!this._processNextPlugin()){this._context.callback(this._context.releaseUrl);
this._context.complete=true
}}},registerMetadataUrlPlugIn:function(b,a){if(typeof(b.rewriteMetadataUrl)!=="function"){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface (plugin method "rewriteMetadataUrl" does not exist or is not a real method)')
}else{if(b.rewriteMetadataUrl.length!==2){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface ("rewriteMetadataUrl" method does not take 2 parameters)')
}}this._plugins.push({plugin:b,priority:Number(a)});
this._plugins=this._sortPluginsByPriority(this._plugins)
},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.plugin.rewriteMetadataUrl(this._context.releaseUrl,this._context.isPreview)
}this._context.found=b?true:this._context.found;
return b
},_sortPluginsByPriority:function(a){return a.sort(function(d,c){return d.priority-c.priority
})
}});
$pdk.ns("$pdk.connection");
$pdk.connection.VideoProxy=$pdk.extend(function(){},{_e:null,constructor:function(a){this._e=a
},load:function(a){this._e.load(a)
},pause:function(){this._e.pause()
},play:function(){this._e.play()
},canPlayType:function(a){return this._e.canPlayType(a)
},addEventListener:function(a,b){return this._e.addEventListener(a,b)
},removeEventListener:function(a,b){return this._e.removeEventListener(a,b)
},webkitEnterFullscreen:function(){this._e.webkitEnterFullscreen()
},webkitExitFullscreen:function(){this._e.webkitExitFullscreen()
}});
if(!$pdk.isIE){var tpVPProt=$pdk.connection.VideoProxy.prototype;
tpVPProt.__defineGetter__("style",function(){return this._e.style
});
tpVPProt.__defineGetter__("offsetWidth",function(){return this._e.offsetWidth
});
tpVPProt.__defineGetter__("offsetHeight",function(){return this._e.offsetHeight
});
tpVPProt.__defineGetter__("autoplay",function(){return this._e.autoplay
});
tpVPProt.__defineSetter__("autoplay",function(a){this._e.autoplay=a
});
tpVPProt.__defineSetter__("buffered",function(a){this._e.buffered=a
});
tpVPProt.__defineGetter__("buffered",function(){return this._e.buffered
});
tpVPProt.__defineSetter__("className",function(a){this._e.className=a
});
tpVPProt.__defineGetter__("className",function(){return this._e.className
});
tpVPProt.__defineSetter__("controls",function(a){this._e.controls=a
});
tpVPProt.__defineGetter__("controls",function(){return this._e.controls
});
tpVPProt.__defineSetter__("currentSrc",function(a){this._e.currentSrc=a
});
tpVPProt.__defineGetter__("currentSrc",function(){return this._e.currentSrc
});
tpVPProt.__defineSetter__("currentTime",function(a){this._e.currentTime=a
});
tpVPProt.__defineGetter__("currentTime",function(){return this._e.currentTime
});
tpVPProt.__defineSetter__("defaultPlaybackRate",function(a){this._e.defaultPlaybackRate=a
});
tpVPProt.__defineGetter__("defaultPlaybackRate",function(){return this._e.defaultPlaybackRate
});
tpVPProt.__defineSetter__("duration",function(a){this._e.duration=a
});
tpVPProt.__defineGetter__("duration",function(){return this._e.duration
});
tpVPProt.__defineSetter__("ended",function(a){this._e.ended=a
});
tpVPProt.__defineGetter__("ended",function(){return this._e.ended
});
tpVPProt.__defineSetter__("id",function(a){this._e.id=a
});
tpVPProt.__defineGetter__("id",function(){return this._e.id
});
tpVPProt.__defineSetter__("lang",function(a){this._e.lang=a
});
tpVPProt.__defineGetter__("lang",function(){return this._e.lang
});
tpVPProt.__defineSetter__("muted",function(a){this._e.muted=a
});
tpVPProt.__defineGetter__("muted",function(){return this._e.muted
});
tpVPProt.__defineSetter__("loop",function(a){this._e.loop=a
});
tpVPProt.__defineGetter__("loop",function(){return this._e.loop
});
tpVPProt.__defineSetter__("networkState",function(a){this._e.networkState=a
});
tpVPProt.__defineGetter__("networkState",function(){return this._e.networkState
});
tpVPProt.__defineSetter__("paused",function(a){this._e.paused=a
});
tpVPProt.__defineGetter__("paused",function(){return this._e.paused
});
tpVPProt.__defineSetter__("playbackRate",function(a){this._e.playbackRate=a
});
tpVPProt.__defineGetter__("playbackRate",function(){return this._e.playbackRate
});
tpVPProt.__defineSetter__("played",function(a){this._e.played=a
});
tpVPProt.__defineGetter__("played",function(){return this._e.played
});
tpVPProt.__defineSetter__("poster",function(a){this._e.poster=a
});
tpVPProt.__defineGetter__("poster",function(){return this._e.poster
});
tpVPProt.__defineSetter__("preload",function(a){this._e.preload=a
});
tpVPProt.__defineGetter__("preload",function(){return this._e.preload
});
tpVPProt.__defineSetter__("readyState",function(a){this._e.readyState=a
});
tpVPProt.__defineGetter__("readyState",function(){return this._e.readyState
});
tpVPProt.__defineSetter__("seekable",function(a){this._e.seekable=a
});
tpVPProt.__defineGetter__("seekable",function(){return this._e.seekable
});
tpVPProt.__defineSetter__("seeking",function(a){this._e.seeking=a
});
tpVPProt.__defineGetter__("seeking",function(){return this._e.seeking
});
tpVPProt.__defineSetter__("src",function(a){this._e.src=a
});
tpVPProt.__defineGetter__("src",function(){return this._e.src
});
tpVPProt.__defineSetter__("startTime",function(a){this._e.startTime=a
});
tpVPProt.__defineGetter__("startTime",function(){return this._e.startTime
});
tpVPProt.__defineSetter__("videoHeight",function(a){this._e.videoHeight=a
});
tpVPProt.__defineGetter__("videoHeight",function(){return this._e.videoHeight
});
tpVPProt.__defineSetter__("videoWidth",function(a){this._e.videoWidth=a
});
tpVPProt.__defineGetter__("videoWidth",function(){return this._e.videoWidth
});
tpVPProt.__defineSetter__("volume",function(a){this._e.volume=a
});
tpVPProt.__defineGetter__("volume",function(){return this._e.volume
});
tpVPProt.__defineGetter__("webkitDisplayingFullScreen",function(){return this._e.webkitDisplayingFullScreen
});
tpVPProt.__defineGetter__("webkitSupportsFullscreen",function(){return this._e.webkitSupportsFullscreen
})
}AdCountdownHolder=Class.extend({init:function(b){this.controller=b;
var d=this;
b.addEventListener("OnMediaStart",function(){d.handleMediaStart.apply(d,arguments)
});
b.addEventListener("OnMediaEnd",function(){d.handleMediaEnd.apply(d,arguments)
});
this.playingHandler=function(){d.handleMediaPlaying.apply(d,arguments)
};
var a=document.getElementById(b.id);
var c=document.getElementById(b.id+".standby");
if(!c){c=document.createElement("div");
c.id=b.id+".standby";
c.style.width="100%";
c.style.height="100%";
a.appendChild(c)
}c.width=this.controller.getMediaArea().width;
c.height=this.controller.getMediaArea().height;
var e=document.createElement("div");
e.className="adCountdownOverlay";
e.style.position="absolute";
e.style.top="0";
e.style.left="0";
e.style.textAlign="left";
e.style.width="100%";
e.style.background="#555555";
e.style.opacity="0.75";
e.style.display="none";
e.style.color="white";
this.textLabel=document.createElement("span");
this.textLabel.align="left";
this.textLabel.style.color="white";
this.textLabel.style.marginLeft="4px";
this.textLabel.style.marginTop="0";
this.textLabel.style.position="relative";
this.textLabel.style.textAlign="left";
this.textLabel.style.height="auto";
e.appendChild(this.textLabel);
c.appendChild(e);
this.div=e
},handleMediaStart:function(b){var a=b.data;
if(a.baseClip.noSkip||a.baseClip.isAd){this.div.innerHTML="";
this.div.style.display="";
this.controller.addEventListener("OnMediaPlaying",this.playingHandler)
}else{this.div.style.display="none"
}},handleMediaEnd:function(b){var a=b.data;
this.div.style.display="none";
if(a.baseClip.isAd){this.controller.removeEventListener("OnMediaPlaying",this.playingHandler)
}},handleMediaPlaying:function(b){var a=b.data;
var c=Math.floor((a.duration-a.currentTime)/1000);
this.textLabel.innerHTML="";
if(!isNaN(c)){this.div.innerHTML="Advertisement: Your content will play in "+c+(c=="1"?" second.":" seconds.")
}else{this.div.innerHTML=""
}}});
AdManager=Class.extend({init:function(a){this.controller=a;
a.registerFunction("setAds",this,this.setAds);
a.registerFunction("registerAdPlugIn",this,this.registerAdPlugIn);
a.registerFunction("getTimeSinceLastAd",this,this.getTimeSinceLastAd);
this.timeSinceLastAd=0;
this.plugins=new Array()
},setAds:function(a){if((tpIsIOS()||tpIsAndroid()&&this.controller.isPrefetch())){a.isAd=true
}this.controller.insertPlaylist(a)
},registerAdPlugIn:function(a,b,c){this.plugins.push({adPlugIn:a,adType:b,priority:c});
function d(f,e){if(f.priority<e.priority){return -1
}else{if(f.priority>e.priority){return 1
}else{return 0
}}}this.plugins.sort(d)
},getTimeSinceLastAd:function(){return this.timeSinceLastAd
},isAd:function(b){if(b.baseClip.isAd){return true
}else{var a=this.adPlugInsIsAd(b);
b.baseClip.isAd=a;
return a
}},checkAd:function(b){for(var a=0;
a<this.plugins.length;
a++){var c=this.plugins[a].adPlugIn.checkAd.apply(this.plugins[a].adPlugIn,[b]);
if(c){return true
}}return false
},adPlugInsIsAd:function(b){for(var a=0;
a<this.plugins.length;
a++){if(this.plugins[a].adPlugIn.isAd(b)){return true
}}return false
},validateAd:function(a){if(a.hasPlayed){return false
}return true
}});
oldCardMediator=Class.extend({init:function(g,b,c,f){this.controller=b;
var d=this;
this.cardID=g;
var a=document.getElementById(b.id);
this.standby=document.getElementById(b.id+".standby");
if(!this.standby){this.standby=document.createElement("div");
this.id=b.id+".standby";
this.style.width="100%";
this.style.height="100%";
a.appendChild(standby)
}var e;
if(e){this.setItem(e)
}this.controller.registerFunction("showCard",this,this.doShowCard);
this.controller.addEventListener("OnMediaStart",function(h){d.showCard(false)
});
this.controller.addEventListener("OnMediaStart",function(h){d.showCard(false)
});
this.controller.addEventListener("OnReleaseEnd",function(h){d.showCard(true)
});
this.controller.addEventListener("OnLoadRelease",function(h){d.showCard(false)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(h){});
this.controller.addEventListener("OnMediaComplete",function(h){d.handleMediaComplete(h)
})
},setItem:function(a){if(this.card){if(this.card.parentNode){this.card.parentNode.innerHTML=""
}this.card=undefined
}this.div=a.getView();
this.standby.appendChild(this.div);
this.card=a;
this.cardID=a.id;
var b=this;
this.card.view.addEventListener("click",function(){tpDebug("got click on card");
b.controller.showCard("forms",b.cardID,"Disable");
b.controller.playNext(false,true)
},false)
},doShowCard:function(d,f,c,b,e,a){if(f==this.cardID){if(c=="Enable"){this.showCard(true);
this.controller.dispatchEvent(PdkEvent.OnShowPreviewImageOverlay,true);
this.controller.dispatchEvent(PdkEvent.OnShowPlayButtonOverlay,false)
}else{this.showCard(false);
this.controller.dispatchEvent(PdkEvent.OnShowPreviewImageOverlay,true)
}}else{}},showCard:function(a){if(this.card){this.card.showCard(a);
this.controller.dispatchEvent(PdkEvent.OnShowPreviewImageOverlay,true)
}},handleMediaComplete:function(a){this.card.clipinfotext=a.data.baseClip.title
}});
ClipWrapperManager=Class.extend({init:function(a){this.controller=a;
this.initialize()
},initialize:function(){this.controller.registerFunction("registerClipWrapperPlugIn",this,this.registerCWPlugin);
this.controller.registerFunction("setClipWrapper",this,this.setClipWrapper)
},registerCWPlugin:function(d,b){if(!b){b=0
}if(!this.plugIns){this.plugIns=new Array()
}var f={plugin:d,priority:b};
var c=false;
for(var a=0;
a<this.plugIns.length;
a++){var e=this.plugIns[a];
if(f.priority<=e.priority){this.plugIns.splice(a,0,f);
c=true;
break
}}if(!c){this.plugIns.push(f)
}},processClip:function(b){if(this.currentClip){throw"the clipWrapperManager did not complete wrapping one clip before another was started"
}if(b.isWrappingClip||!this.plugIns){return false
}if(b.wasWrapped){b.wasWrapped=false;
return false
}var d=false;
var e={clip:b};
this.currentClip=b;
for(var a=0;
a<this.plugIns.length;
a++){var c=this.plugIns[a];
if(c.plugin.wrapClip(e)){d=true;
break
}}if(!d){this.currentClip=null
}return d
},setClipWrapper:function(a){this.currentClip.wasWrapped=true;
this.controller.updateClip(this.currentClip);
this.currentClip=null;
this.controller.wrapClip(a.preRolls,a.postRolls)
}});
ErrorHolder=Class.extend({init:function(b){this.controller=b;
var d=this;
b.addEventListener("OnMediaStart",function(){d.handleMediaStart.apply(d,arguments)
});
b.addEventListener("OnReleaseEnd",function(){d.handleReleaseEnd.apply(d,arguments)
});
b.addEventListener("OnMediaError",function(){d.handleMediaError.apply(d,arguments)
});
var a=document.getElementById(b.id);
var c=document.getElementById(b.id+".standby");
if(!c){c=document.createElement("div");
c.id=b.id+".standby";
c.style.width="100%";
c.style.height="100%";
a.appendChild(c)
}c.width=this.controller.getMediaArea().width;
c.height=this.controller.getMediaArea().height;
var e=document.createElement("div");
e.style.position="relative";
e.style.overflow="hidden";
e.style.top="0";
e.style.left="0";
e.style.zIndex=200;
e.style.display="none";
e.width=c.width;
e.height=c.height;
e.className="error";
c.appendChild(e);
this.errorHolder=e
},handleMediaError:function(b){this.started=false;
var a=this;
setTimeout(function(){if(!a.started&&!a.ended){a.errorHolder.style.display=""
}},3000)
},handleReleaseEnd:function(a){this.started=false;
this.ended=true
},handleMediaStart:function(a){this.started=true;
this.ended=false;
this.errorHolder.style.display="none"
}});
HelloWorldEndCard=SampleCard.extend({init:function(b,a){this._super(b,a);
this.clipinfotext="No Clip"
},write:function(){if(!this.view){this._super()
}this.view.style.backgroundColor="blue";
this.view.style.width="100%";
this.view.style.height="100%";
this.view.innerHTML="<p>Hello World<br/>"+this.clipinfotext+"</p>"
},showCard:function(a){this.view.innerHTML="<p>Hello World<br/>"+this.clipinfotext+"</p>";
this._super(a)
}});
var tpJsonContexts=new Object();
function tpRegisterJsonContext(b){var a=(((1+Math.random())*65536)|0).toString(16).substring(1);
tpJsonContexts[a]=b;
return a
}function tpJSONLoaderCallback(b,a){tpJsonContexts[a](b)
}JSONLoader=Class.extend({init:function(){},load:function(a,i,b,g,e,f){if(!b){b="callback"
}if(!e){e="context"
}if(!g){g="tpJSONLoaderCallback"
}var c=tpRegisterJsonContext(function(){i(arguments[0],a)
});
if(a.indexOf("?")>=0){a+="&"+b+"="+g+"&"+e+"="+c
}else{a+="?"+b+"="+g+"&"+e+"="+c
}var d=document.getElementsByTagName("head")[0];
var h=document.createElement("script");
h.type="text/javascript";
h.src=a;
h.onerror=function(k){tpDebug("Failed to load "+h.src);
if(typeof(f)==="function"){f(k)
}};
d.appendChild(h)
}});
LoadReleaseManager=Class.extend({init:function(a){this.controller=a;
this.controller.registerFunction("loadReleaseURL",this,this.loadReleaseURL);
this.playbackManager=null
},loadReleaseURL:function(c,b){if(!c){if(self.console){console.error("ERROR: This release has no URL")
}return
}if(c.url){c=c.url
}if(b===false){var e=this.controller.getProperty("releaseUrl");
if(e!==undefined){return
}}this.currentUrl=c;
this.playbackManager.setCurrentReleaseUrl(c);
var g=c;
if(c.toLowerCase().indexOf("format=script")<0){if(c.toLowerCase().match(/format=[^\&]+/)){c=c.replace(/format=[^\&]+/i,"")
}if(c.indexOf("?")>=0){c+="&format=Script"
}else{c+="?format=Script"
}}var d=this.controller.getComponentSize();
if(d){c+="&width="+d.width;
c+="&height="+d.height
}else{c+="&width=640";
c+="&height=480"
}var f=this;
tpDebug("LoadReleaseManager loading "+c);
var a=new JSONLoader();
if(c.indexOf(".xml")!==-1||c.indexOf(".smi")!==-1){return
}a.load(c,function(h){f.selector(h,g)
})
},selector:function(c,b){var a=c.defaultThumbnailUrl;
c.globalDataType="com.theplatform.pdk.data::Release";
c.url=b;
this.controller.dispatchEvent("OnLoadReleaseUrl",c);
this.doSendClip(c)
},doSendClip:function(a){var g={globalDataType:"com.theplatform.pdk.data::BaseClip"};
var b={globalDataType:"com.theplatform.pdk.data::Clip"};
b.length=0;
g.lengthPlayed=0;
g.clipBegin=-1;
g.clipEnd=-1;
g.title=a.title;
g.author=a.author;
g.description=a.description;
g.copyright=a.copyright;
g.categories=a.categories;
g.keywords=a.keywords;
g.ratings=a.ratings;
if(g.copyright&&!g.copyright.match(/^(c)/)){g.copyright="(c) "+g.copyright
}g.banners=[];
var h={globalDataType:"com.theplatform.pdk.data::Playlist"};
h.releasePID=a.pid;
g.playlistRef=h;
b.baseClip=g;
tpController.setClipInfo(b);
var f={globalDataType:"com.theplatform.pdk.data::TimeObject"};
var d=0;
if(b.startTime>=0&&b.endTime>sclip.tartTime){d=b.endTime-b.startTime
}else{try{d=a.length
}catch(c){this.controller.trace("Error getting duration: "+c.message,"LoadReleaseManager",tpConsts.WARN)
}}f.currentTime=0;
f.duration=d;
f.percentComplete=0;
f.currentTimeAggregate=0;
f.durationAggregate=d;
f.percentCompleteAggregate=0;
f.isAggregate=false;
this.controller.dispatchEvent("OnMediaTime",f)
}});
LoadingIndicatorHolder=Class.extend({init:function(b){this.controller=b;
var d=this;
b.addEventListener("OnShowPlayOverlay",function(){d.hide(true)
});
b.addEventListener("OnMediaError",function(){d.handleMediaStart.apply(d,arguments)
});
b.addEventListener("OnMediaStart",function(){d.handleMediaStart.apply(d,arguments)
});
b.addEventListener("OnMediaSeek",function(){d.handleMediaStart.apply(d,arguments)
});
b.addEventListener("OnMediaEnd",function(){d.handleMediaEnd.apply(d,arguments)
});
this.playingListener=function(){d.hide(true)
};
var a=document.getElementById(b.id);
var c=document.getElementById(b.id+".standby");
if(!c){c=document.createElement("div");
c.id=b.id+".standby";
c.style.width="100%";
c.style.height="100%";
a.appendChild(c)
}c.width=this.controller.getMediaArea().width;
c.height=this.controller.getMediaArea().height;
var e=document.createElement("div");
var d=this;
e.innerHTML="Loading...";
e.className="loadingIndicator";
e.style.position="absolute";
e.style.top="50%";
e.style.left="50%";
e.style.zIndex=500;
e.style.textAlign="center";
e.style.display="none";
c.appendChild(e);
this.div=e
},handleSetReleaseUrl:function(b){tpDebug(b.type+" fired, setting timer");
this.started=false;
var a=this;
this.timer=setTimeout(function(){if(!a.started){tpDebug(b.type+" Got timer should be showing loading indicator");
a.div.style.display=""
}},300)
},handleMediaStart:function(a){this.controller.removeEventListener("OnMediaPlaying",this.playingListener);
this.controller.addEventListener("OnMediaPlaying",this.playingListener);
tpDebug(a.type+" Got call should be hiding loading indicator");
this.started=true;
this.div.style.display="none"
},hide:function(a){tpDebug("Got hide call should be hiding loading indicator");
this.started=a;
a?this.div.style.display="none":this.div.style.display="";
this.controller.removeEventListener("OnMediaPlaying",this.playingListener)
},handleMediaEnd:function(a){tpDebug(a.type+" Got call should be hiding loading indicator");
this.started=false;
this.div.style.display="none";
this.controller.removeEventListener("OnMediaPlaying",this.playingListener);
this.controller.addEventListener("OnMediaPlaying",this.playingListener)
}});
OverlayManager=Class.extend({init:function(a,b){this.controller=a;
this.playerElement=b;
var c=this;
this.controller.registerFunction("getOverlayArea",this,this.getOverlayArea);
this.controller.registerFunction("setOverlayArea",this,this.setOverlayArea);
this.controller.addEventListener("OnMediaAreaChanged",function(d){c.mediaAreaChanged(d)
})
},getBrowserOffset:function(){if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){return 32
}if(navigator.userAgent.toLowerCase().indexOf("msie")>-1){return 42
}if(tpIsIOS()){return 54
}if(navigator.userAgent.toLowerCase().indexOf("safari")>-1){return 24
}if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){return 28
}return 35
},setOverlayArea:function(a){this.useNativeDefaults=false;
this.overlayArea=a;
this.controller.dispatchEvent("OnOverlayAreaChanged",this.getOverlayArea())
},getOverlayArea:function(b){if(this.overlayArea){return this.overlayArea
}var a={};
var c=!this.useNativeDefaults?this.getBrowserOffset():0;
a.height=this.playerElement.clientHeight-c;
a.width=this.playerElement.clientWidth;
a.top=this.playerElement.clientTop;
a.left=this.playerElement.clientLeft;
a.bottom=a.top+a.height;
a.right=a.left+a.width;
a.topLeft={x:a.left,y:a.top};
a.bottomRight={x:a.right,y:a.bottom};
a.size={x:a.width,y:a.height};
a.x=a.left;
a.y=a.top;
if(b){a.x+=$pdk.jQuery(this.playerElement).offset().left;
a.y+=$pdk.jQuery(this.playerElement).offset().top
}return a
},mediaAreaChanged:function(a){this.controller.dispatchEvent("OnOverlayAreaChanged",this.getOverlayArea())
}});
var PdkEvent=new Object();
PdkEvent.OnPlayerLoaded="OnPlayerLoaded";
PdkEvent.OnResetPlayer="OnResetPlayer";
PdkEvent.OnPlayerShutdown="OnPlayerShutdown";
PdkEvent.OnCommandChainComplete="OnCommandChainComplete";
PdkEvent.OnPlugInLoaded="OnPlugInLoaded";
PdkEvent.OnPlugInsComplete="OnPlugInsComplete";
PdkEvent.OnPropertiesChanged="OnPropertiesChanged";
PdkEvent.OnBackgroundPadding="OnBackgroundPadding";
PdkEvent.OnControlsRefreshed="OnControlsRefreshed";
PdkEvent.OnSetVideoScalingMethod="OnSetVideoScalingMethod";
PdkEvent.OnSetExpandVideo="OnSetExpandVideo";
PdkEvent.OnMediaLoadStart="OnMediaLoadStart";
PdkEvent.OnMediaPlay="OnMediaPlay";
PdkEvent.OnMediaClick="OnMediaClick";
PdkEvent.OnMediaRollOver="OnMediaRollOver";
PdkEvent.OnMediaRollOut="OnMediaRollOut";
PdkEvent.OnMediaBuffer="OnMediaBuffer";
PdkEvent.OnMediaEnd="OnMediaEnd";
PdkEvent.OnMediaError="OnMediaError";
PdkEvent.OnMediaComplete="OnMediaComplete";
PdkEvent.OnMediaLoading="OnMediaLoading";
PdkEvent.OnMediaPause="OnMediaPause";
PdkEvent.OnMediaTime="OnMediaTime";
PdkEvent.OnMediaPlaying="OnMediaPlaying";
PdkEvent.OnMediaStart="OnMediaStart";
PdkEvent.OnMediaUnpause="OnMediaUnpause";
PdkEvent.OnReleaseEnd="OnReleaseEnd";
PdkEvent.OnReleaseStart="OnReleaseStart";
PdkEvent.OnReleaseSelected="OnReleaseSelected";
PdkEvent.OnSetCurrentReleaseList="OnSetCurrentReleaseList";
PdkEvent.OnVersionError="OnVersionError";
PdkEvent.OnMediaSeek="OnMediaSeek";
PdkEvent.OnMute="OnMute";
PdkEvent.OnSetVolume="OnSetVolume";
PdkEvent.OnSetRelease="OnSetRelease";
PdkEvent.OnSetReleaseUrl="OnSetReleaseUrl";
PdkEvent.OnFetchReleaseData="OnFetchReleaseData";
PdkEvent.OnLoadRelease="OnLoadRelease";
PdkEvent.OnLoadReleaseUrl="OnLoadReleaseUrl";
PdkEvent.OnSetSmil="OnSetSmil";
PdkEvent.OnLoadSmil="OnLoadSmil";
PdkEvent.OnSetPlayerMessage="OnSetPlayerMessage";
PdkEvent.OnClearPlayerMessage="OnClearPlayerMessage";
PdkEvent.OnShowEmailForm="OnShowEmailForm";
PdkEvent.OnShowFullScreen="OnShowFullScreen";
PdkEvent.OnShowLinkForm="OnShowLinkForm";
PdkEvent.OnUseDefaultEmailForm="OnUseDefaultEmailForm";
PdkEvent.OnUseDefaultLinkForm="OnUseDefaultLinkForm";
PdkEvent.OnUseDefaultPlayOverlay="OnUseDefaultPlayOverlay";
PdkEvent.OnShowPlayOverlay="OnShowPlayOverlay";
PdkEvent.OnShowPreviewImageOverlay="OnShowPreviewImageOverlay";
PdkEvent.OnGetPlayerVariables="OnGetPlayerVariables";
PdkEvent.OnDisablePlayerControls="OnDisablePlayerControls";
PdkEvent.OnShowControls="OnShowControls";
PdkEvent.OnHidePlayerRegions="OnHidePlayerRegions";
PdkEvent.OnStreamSwitched="OnStreamSwitched";
PdkEvent.OnGetBandwidthPreferences="OnGetBandwidthPreferences";
PdkEvent.OnGetSubtitleLanguage="OnGetSubtitleLanguage";
PdkEvent.OnSubtitleCuePoint="OnSubtitleCuePoint";
PdkEvent.OnRefreshCategoryModel="OnRefreshCategoryModel";
PdkEvent.OnRefreshReleaseModel="OnRefreshReleaseModel";
PdkEvent.OnLoadReleaseModel="OnLoadReleaseModel";
PdkEvent.OnSearchComponentsRegistered="OnSearchComponentsRegistered";
PdkEvent.OnRefreshReleaseModelStarted="OnRefreshReleaseModelStarted";
PdkEvent.OnCategorySelected="OnCategorySelected";
PdkEvent.OnSearch="OnSearch";
PdkEvent.OnClipInfoLoaded="OnClipInfoLoaded";
PdkEvent.OnJavascriptLoaded="OnJavascriptLoaded";
PdkEvent.OnSkinComplete="OnSkinComplete";
PdkEvent.OnComponentSized="OnComponentSized";
PdkEvent.OnImageLoaded="OnImageLoaded";
PdkEvent.OnFontChanged="OnFontChanged";
PdkEvent.OnPost="OnPost";
PdkEvent.OnEmail="OnEmail";
PdkEvent.OnEmbedCopy="OnEmbedCopy";
PdkEvent.OnLinkCopy="OnLinkCopy";
PdkEvent.OnRssCopy="OnRssCopy";
PdkEvent.OnAddRating="OnAddRating";
PdkEvent.OnSignIn="OnSignIn";
PdkEvent.OnSignOut="OnSignOut";
PdkEvent.OnUserProfileLoaded="OnUserProfileLoaded";
PdkEvent.OnAddComment="OnAddComment";
PdkEvent.OnDeleteComment="OnDeleteComment";
PdkEvent.OnAddFavorite="OnAddFavorite";
PdkEvent.OnDeleteFavorite="OnDeleteFavorite";
PdkEvent.OnAddTag="OnAddTag";
PdkEvent.OnDeleteTag="OnDeleteTag";
PlayButtonHolder=Class.extend({init:function(d){this.controller=d;
var f=this;
d.addEventListener(PdkEvent.OnShowPlayOverlay,function(){f.showOverlay.apply(f,arguments)
});
d.addEventListener("OnMediaStart",function(){f.playing=true;
f.handleSetReleaseUrl.apply(f,arguments)
});
d.addEventListener("OnMediaPause",function(a){f.playing=false
});
d.addEventListener("OnMediaUnPause",function(a){f.playing=false
});
d.addEventListener("OnReleaseEnd",function(){f.playing=false
});
d.addEventListener("OnMediaError",function(){f.handleMediaError.apply(f,arguments)
});
d.addEventListener("OnForceShowVideo",function(){f.hidePlayButton()
});
var c=document.getElementById(d.id);
var e=document.getElementById(d.id+".standby");
if(!e){e=document.createElement("div");
e.id=d.id+".standby";
e.style.width="100%";
e.style.height="100%";
c.appendChild(e)
}e.width=this.controller.getMediaArea().width;
e.height=this.controller.getMediaArea().height;
var b=document.createElement("a");
b.href="#";
var f=this;
b.onclick=function(){f.controller.clickPlayButton();
return false
};
b.className="overlayPlayButton";
b.style.position="absolute";
b.style.top="50%";
b.style.left="50%";
b.style.zIndex=400;
b.style.marginLeft="-50px";
b.style.marginTop="-50px";
b.style.lineHeight="100px";
b.style.textAlign="center";
b.style.display="none";
e.appendChild(b);
this.a=b;
this.playing=false
},handleMediaError:function(b){this.playing=false;
var a=this;
this.errorHandler=setTimeout(function(){if(!a.playing){a.a.style.display=""
}},3000)
},handleLoadReleaseUrl:function(a){clearTimeout(this.errorHandler);
this.a.style.display="none"
},hidePlayButton:function(){tpDebug("forcing to hide play button");
clearTimeout(this.errorHandler);
this.a.style.display="none"
},showOverlay:function(a){clearTimeout(this.errorHandler);
tpDebug("Showing play button from"+a.type+" show="+a.data);
if(a.data==true&&this.playing==false){this.a.style.display=""
}else{this.a.style.display="none"
}},handleSetReleaseUrl:function(a){this.playing=true;
this.a.style.display="none"
}});
PlayButtonMediator=Class.extend({init:function(a){this.controller=a;
this.paused=false;
this.warming=false;
var b=this;
a.addEventListener("OnLoadRelease",function(){b.handleLoadRelease.apply(b,arguments)
});
a.addEventListener("OnLoadReleaseUrl",function(){b.handleLoadRelease.apply(b,arguments)
});
a.addEventListener("OnMediaStart",function(){b.handleMediaStart.apply(b,arguments)
});
a.addEventListener("OnMediaPause",function(){b.handleMediaPause.apply(b,arguments)
});
a.addEventListener("OnMediaUnpause",function(){b.handleMediaUnpause.apply(b,arguments)
})
},setItem:function(a){this.button=a;
a.setIcon("img/play.png");
var b=this;
a.onclick=function(){if(b.warming){b.controller.clickPlayButton()
}else{b.controller.pause(!b.paused)
}}
},handleLoadRelease:function(a){this.warming=true
},handleMediaStart:function(a){this.warming=false;
this.button.setIcon("img/pause.png");
this.paused=false
},handleMediaPause:function(a){this.button.setIcon("img/play.png");
this.paused=true
},handleMediaUnpause:function(a){this.button.setIcon("img/pause.png");
this.paused=false
}});
PlaybackManager=Class.extend({init:function(b,a){this.player=b;
this.controller=a;
var c=this;
a.addEventListener("OnLoadReleaseUrl",function(){c.handleLoadReleaseUrl.apply(c,arguments)
});
this.releaseEndHandler=function(){c.handleReleaseEnd.apply(c,arguments)
};
this.mediaSeekHandler=function(){c.handleMediaSeek.apply(c,arguments)
};
a.addEventListener("OnMediaSeek",this.mediaSeekHandler);
this.mediaErrorHandler=function(){c.handleMediaError.apply(c,arguments)
};
a.addEventListener("OnMediaError",this.mediaErrorHandler);
this._metadataUrlManager=new $pdk.plugin.MetadataUrlManager(this.controller);
this.urlManager=new UrlManager(this.controller);
this.loadReleaseManager=new LoadReleaseManager(this.controller);
this.loadReleaseManager.playbackManager=this;
this.tokenManager=new TokenManager(this.controller);
this.overlayManager=new OverlayManager(this.controller,this.player.container);
if(self.StandbyManager){this.standbyManager=new StandbyManager(this.controller,this)
}this.subtitlesManager=new SubtitlesManager(this.controller);
this.plugins=new Array();
this.pluginsComplete=false;
a.registerFunction("setRelease",this,this.setRelease);
a.registerFunction("setReleaseURL",this,this.setReleaseURL);
a.registerFunction("pause",this,this.pause);
a.registerFunction("endRelease",this,this.endRelease);
a.registerFunction("resetRelease",this,this.resetRelease);
a.registerFunction("injectPlaylist",this,this.injectPlaylist);
a.registerFunction("insertPlaylist",this,this.insertPlaylist);
a.registerFunction("wrapClip",this,this.wrapClip);
a.registerFunction("insertClip",this,this.insertClip);
a.registerFunction(PdkFunctions.mute,this,this.doMute);
a.registerFunction("setSmil",this,this.setSmil);
a.registerFunction("updateMediaTime",this,this.updateMediaTime);
a.registerFunction("updateClip",this,this.updateClip);
a.registerFunction("updatePlaylist",this,this.updatePlaylist);
a.registerFunction("endMedia",this,this.endMedia);
a.registerFunction("markOffset",this,this.markOffset);
a.registerFunction(PdkFunctions.nextClip,this,this.nextClip);
a.registerFunction(PdkFunctions.previousClip,this,this.previousClip);
var c=this;
a.addEventListener("OnPlugInsComplete",function(){c.pluginsComplete=true;
c.controller.removeEventListener("OnPlugInsComplete",this)
});
this.adManager=new AdManager(a);
this.clipWrapperManager=new ClipWrapperManager(a);
this.fullScreenManager=new FullScreenManager(a,this)
},handleLoadReleaseUrl:function(b){var a=b.data;
if(this.releaseProcess&&this.playlist){this.endRelease();
this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined;
this.playlist=undefined
}if((tpIsIOS()||tpIsAndroid())&&this.isPrefetch()){a.url=this.releaseUrl;
this.setRelease(a)
}},isPrefetch:function(){return this.controller.isPrefetch()
},setCurrentReleaseUrl:function(a){this.releaseUrl=a
},handleReleaseEnd:function(a){if((this.isPrefetch()&&(tpIsAndroid()||tpIsIOS()))){}},getChapterFromOffset:function(b,d){if(d<=b.aggregateLength){for(var a=0;
a<b.chapters.length;
a++){var e=b.chapters[a];
if(e.aggregateStartTime+e.length>=d){e.offset=d-e.aggregateStartTime;
return e
}}}if(b.chapters.length==1){return b.chapters[0]
}return null
},markOffset:function(e,a,b){if(b===undefined){b=true
}var c=this.getChapterFromOffset(e.chapters,a);
var d;
if(!c||c.contentIndex==e.currentIndex){}else{e.currentIndex=c.contentIndex
}d=e.clips[e.currentIndex];
if(c){d.offset=c.offset;
if(c.adIndex>=0&&b){e.currentIndex=c.adIndex
}}else{if(a<d.length){d.offset=a
}else{d.offset=d.length
}}},playCurrentRelease:function(){if(this.playlist&&this.playlist.releaseURL==this.releaseUrl){this.playlist.currentClipIndex=-1;
tpDebug("playCurrentRelease.nextClip()");
this.nextClip();
this.clipEnded=false;
this.controller.dispatchEvent("OnReleaseStart",this.playlist)
}else{if(this.playlist&&this.playlist.isAd===true&&this.isPrefetch()&&(tpIsIOS()||tpIsAndroid())){tpDebug("playCurrentRelease.isAd");
this.nextClip();
this.clipEnded=false
}else{if(this.releaseUrl){this.currentClip=undefined;
this.playlist=undefined;
this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.releaseUrl,userInitiated:true});
this.setReleaseURL(this.releaseUrl)
}else{if(self.console){console.error("ERROR: No release to play!")
}}}}},setRelease:function(a,b){var c=this;
if(this.currentClip&&this.currentClip.isAd){return
}tpDebug("setRelease:"+a.url);
this.currentRelease=a;
try{this._metadataUrlManager.setUrl(a.url,false,function(e){a.url=e;
tpDebug("setRelease, new url:"+e);
c.controller.dispatchEvent("OnSetRelease",a);
c.doSetReleaseUrl(a.url,b)
})
}catch(d){tpDebug("WARN: "+d.message);
this.controller.dispatchEvent("OnSetRelease",a);
c.doSetReleaseUrl(a.url,b)
}},setReleaseURL:function(b,a){var c=this;
if(this.currentClip&&this.currentClip.isAd){return
}if(this.pluginsComplete===false){this.controller.addEventListener("OnPlugInsComplete",function(){c.pluginsComplete=true;
c.setReleaseURL(b,a);
c.controller.removeEventListener("OnPlugInsComplete",this)
});
setTimeout(function(){if(c.pluginsComplete){return
}c.pluginsComplete=true;
c.setReleaseURL(b,a)
},2000);
this.controller.writePlayer("",true);
return
}tpDebug("setReleaseURL (pre rewrite): "+b);
if(!((tpIsIOS()||tpIsAndroid())&&this.isPrefetch())){tpDebug("setReleaseURL: calling doSetReleaseUrl()");
try{this._metadataUrlManager.setUrl(b,false,function(e){c.controller.dispatchEvent("OnSetReleaseUrl",e);
tpDebug("setReleaseURL, new url:"+e);
c.doSetReleaseUrl(e,a)
})
}catch(d){tpDebug("WARN: "+d.message);
this.controller.dispatchEvent("OnSetReleaseUrl",b);
c.doSetReleaseUrl(b,a)
}}else{if(tpIsAndroid()){this.controller.dispatchEvent("OnSetReleaseUrl",b);
this.controller.writePlayer(b)
}}},doSetReleaseUrl:function(d,c){if((tpIsIOS()||tpIsAndroid())&&this.controller.isSafeMode()){tpDebug("doSetReleaseUrl: calling writePlayer()");
this.controller.writePlayer("",true)
}tpDebug("doSetReleaseUrl: constructing url for SMIL");
if(!d||d===""){this.dispatchReleaseError(null,d);
return
}if(d.url){var b=d;
d=d.url
}if(d.toLowerCase().indexOf("form=")<0){if(d.toLowerCase().indexOf("format=smil")<0){if(d.indexOf("?")>=0){d+="&format=SMIL"
}else{d+="?format=SMIL"
}}if(d.toLowerCase().indexOf("tracking=true")<0){if(d.indexOf("?")>=0){d+="&Tracking=true"
}else{d+="?Tracking=true"
}}if(d.toLowerCase().indexOf("embedded=true")<0){if(d.indexOf("?")>=0){d+="&Embedded=true"
}else{d+="?Embedded=true"
}}}tpDebug("Setting release url to "+d);
this.releaseUrl=d;
var e=this;
var a=new XMLLoader();
a.load(d,function(){e.selector.apply(e,arguments)
},function(f){e.dispatchReleaseError(f,d)
})
},dispatchReleaseError:function(b,a){tpDebug("Error loading SMIL XML");
this.controller.dispatchEvent("OnReleaseError",a)
},setSmil:function(a){if(this.pluginsComplete===false){var b=this;
this.controller.addEventListener("OnPlugInsComplete",function(){b.pluginsComplete=true;
b.setSmil(a);
b.controller.removeEventListener("OnPlugInsComplete",this)
});
setTimeout(function(){if(b.pluginsComplete){return
}b.pluginsComplete=true;
b.setSmil(a)
},2000);
return
}if((this.currentClip&&this.currentClip.isAd)||this.pluginsComplete===false){return
}this.doParseSelector(a)
},pause:function(a){if(this.video){if(a){this.doPauseVideo()
}else{this.doUnPauseVideo()
}}},doPauseVideo:function(){if(this.video.paused==false){this.video.pause();
this.controller.dispatchEvent(PlayerEvent.OnPlayerPause)
}},doUnPauseVideo:function(){this.play();
this.controller.dispatchEvent(PlayerEvent.OnPlayerUnPause)
},play:function(){tpDebug("PBM calling play!");
this.video.play();
if(this._isMuted){this.doMute(false);
this.doMute(true)
}},doMute:function(a){if(this._isMuted==undefined){this._isMuted=false
}if(a!=this._isMuted){this._isMuted=a;
this.video.muted=this._isMuted;
if(this._isMuted){this._oldVolume=this.video.volume;
this.video.volume=0
}else{if(this._oldVolume){this.video.volume=this._oldVolume;
this.oldVolume=undefined
}}this.controller.dispatchEvent(PdkEvent.OnMute,this._isMuted)
}},selector:function(a){this.doParseSelector(a)
},doParseSelector:function(a){tpDebug("selector: parsing smil");
var c=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString());
var b=c.parsePlaylist(a,this.releaseUrl);
if(this.releaseProcess){this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined
}if(!b||b.isError){this.dispatchReleaseError(null,this.releaseUrl);
return
}this.releaseProcess=this.createReleaseProcess();
if(!(this.isPrefetch()&&(tpIsIOS()||tpIsAndroid()))){tpDebug("selector: playing current release");
this.controller.dispatchEvent("OnReleaseStart",b);
this.releaseProcess.setPlaylist(b);
this.playlist=b
}},createReleaseProcess:function(){var a=com.theplatform.pdk.ReleaseProcessExported.getReleaseProcess(this.controller.id,this.controller.scopes.toString());
a.addEventListener("OnClipFromPlaylist",this,this.clipFromPlaylist);
return a
},destroyReleaseProcess:function(a){if(a){a.removeEventListener("OnClipFromPlaylist",this.clipFromPlaylist);
a.destroy()
}},clipFromPlaylist:function(b){var a=b.data;
if(!a){this.endRelease();
this.playlist=undefined;
if(!this.standbyManager.checkIfEndCardExists()){this.controller.playNext(false,true)
}}else{tpDebug("release process is telling us to play clip with clipIndex "+a.clipIndex+" and src:"+a.URL);
this.processClip(a);
a.offset=0;
this.releaseProcess.updateClip(a)
}},endRelease:function(){if(!this.video.paused){this.video.pause()
}this.controller.dispatchEvent("OnReleaseEnd",this.playlist)
},resetRelease:function(){this.video.currentTime=0;
this.video=this.player.resetVideoElement();
this.endRelease()
},seekToClip:function(a){},previousClip:function(){},handleMediaError:function(a){this.wasError=true;
tpDebug("PlaybackManager got error for "+this.video.src+" trying to go to next clip");
if(this.releaseProcess){this.releaseProcess.nextClip()
}},handleMediaSeek:function(d){var c=d.data;
tpDebug("Got OnMediaSeek");
if(!this.currentClip){return
}var a=c.end.mediaTime;
if(a>=this.currentClip.endTime||a<this.currentClip.startTime){tpDebug("Telling releaseProcess to seek to "+c.end.currentTimeAggregate);
if(this.releaseProcess.seekToPosition(c.end.currentTimeAggregate)){tpDebug("ReleaseProcess is providing a new clip")
}else{tpDebug("releaseProcess.seekToPosition returned false");
var b=this;
if(a<=this.currentClip.startTime){if(Math.abs(this.video.currentTime*1000-this.currentClip.startTime)>300){tpDebug("targetTime is "+a+", need to seek to "+this.currentClip.startTime);
setTimeout(function(){b.controller.seekToPosition(b.currentClip.startTime)
},1)
}}else{tpDebug("currentTime is already "+a+", no need to seek to "+this.currentClip.startTime)
}}}else{if(a<=this.currentClip.startTime&&Math.abs(this.video.currentTime*1000-this.currentClip.startTime)>300){var b=this;
tpDebug("targetTime is "+a+", need to seek to "+this.currentClip.startTime);
setTimeout(function(){b.controller.seekToPosition(b.currentClip.startTime)
},1)
}else{tpDebug("seekObj was within clip boundaries: "+this.currentClip.startTime+"<"+c.end.mediaTime+"<"+this.currentClip.endTime)
}}},nextClip:function(){if(this.releaseProcess){tpDebug("PBM calling releaseProcess.nextClip");
this.releaseProcess.nextClip()
}},processClip:function(g,a){var c=this.adManager.isAd(g);
var h=false;
if(c){if(!this.adManager.validateAd(g)){this.nextClip();
return
}h=this.adManager.checkAd(g)
}var d=false;
if(this.currentClip){d=g.clipIndex<this.currentClip.clipIndex;
this.doEndMedia(this.currentClip)
}this.currentClip=g;
if(!h){var b=false;
if(!d){b=this.clipWrapperManager.processClip(g)
}var e=false;
var f=this;
e=this.urlManager.checkClip(g,function(i){if(g.id===i.id){if(!b&&a!==true){tpDebug("processClip.!wrapped: "+g.URL);
f.urlRewritten(i)
}}});
g.wasProcessed=true
}},urlRewritten:function(a){this.updateClip(a);
this.player.doMediaLoadStart(a)
},insertPlaylist:function(a){if(this.releaseProcess){this.releaseProcess.insertPlaylist(a)
}},insertClip:function(a){if(this.releaseProcess){this.releaseProcess.insertClip(a)
}},injectPlaylist:function(b){if(this.releaseProcess){var a=this.currentClip.currentMediaTime==0&&this.currentClip.startTime>0?this.currentClip.startTime:this.currentClip.currentMediaTime;
this.releaseProcess.injectPlaylist(b,a)
}},updateMediaTime:function(a){if(this.releaseProcess){this.releaseProcess.updateMediaTime(a)
}},updateClip:function(a){if(this.releaseProcess){this.releaseProcess.updateClip(a)
}},updatePlaylist:function(a){if(this.releaseProcess){this.releaseProcess.updatePlaylist(a)
}},endMedia:function(a){if(!a){a=this.currentClip
}this.doEndMedia(a);
if(this.releaseProcess){tpDebug("Media ended, PBM calling nextClip()");
this.releaseProcess.nextClip()
}},doEndMedia:function(a){this.currentClip=undefined;
if(!this.wasError){this.controller.dispatchEvent("OnMediaEnd",a)
}this.wasError=false
},wrapClip:function(b,a){this.releaseProcess.wrapClip(b,a)
},executeCurrentRelease:function(){}});
tpPlayer=PDKComponent.extend({_generateExportedMarkup:function(){var a="";
a+='<div id="'+this.id+'" >';
a+='  <div id="'+this.id+'.player" ></div>';
a+='  <div id="'+this.id+'.controlBlocker" ></div>';
a+='  <div id="'+this.id+'.blocker" ></div>';
a+='  <div id="'+this.id+'.plugins" ></div>';
a+='  <div id="'+this.id+'.controls" ></div>';
a+='  <div id="'+this.id+'.subtitles" class="tpSubtitles" ></div>';
a+="</div>";
return a
},init:function(e,c,a,b,d){this.width=c;
this.height=a;
this.id=e;
this.firstTime=true;
this.pluginsComplete=false;
if(d===undefined){d=e
}this.controller=new PlayerController(d,this)
},setProperty:function(a,b){if(this.controller){this.controller.setProperty(a,b)
}},getProperty:function(a){if(this.controller){return this.controller.getProperty(a)
}else{return null
}},attach:function(a){this.initialize();
this.video=document.getElementById(a);
this.setSeekHandler();
this.ready()
},setSeekHandler:function(){if(this.seekHandler){this.seekHandler.destroy()
}this.seekHandler=new SeekHandler(this.video);
var a=this;
this.userSeekedListener=function(b){a.userSeeked(b)
};
this.seekErrorListener=function(b){a.seekFailed(b)
};
this.seekHandler.addEventListener(SeekEvents.USERSEEKED,this.userSeekedListener);
this.seekHandler.addEventListener(SeekEvents.SEEKFAILED,this.seekErrorListener)
},seekFailed:function(a){this.onError(a)
},userSeeked:function(a){if(this.currentClip.baseClip.noSkip&&!tpIsIOS()){this.seekHandler.doSeek(this.currentClip.startTime/1000)
}else{if(this.currentClip.baseClip.noSkip&&tpIsIOS()){}else{tpDebug("got userSeeked: showing controls");
this.showControls(true);
this.onSeeked()
}}},progSeeked:function(a){tpDebug("progSeeked fired");
this.onSeeked()
},resetVideoElement:function(){var a=document.createElement("video");
a.setAttribute("id",this.video.getAttribute("id"));
a.setAttribute("class",this.video.getAttribute("class"));
a.setAttribute("style",this.video.getAttribute("style"));
a.setAttr("autoplay",false);
a.setAttr("x-webkit-airplay","allow");
this.video.parentNode.replaceChild(a,this.video);
this.video=a;
this.setSeekHandler();
this.startedPlaying=false;
this.currentClip=undefined;
this.attachListeners();
return this.video
},createContainer:function(c){var f=this.framecolor?this.framecolor:"#000000";
var b=this.backgroundcolor?this.backgroundcolor:"#ffffff";
f=f.replace("0x","#");
b=b.replace("0x","#");
var a="";
a+="<div class='tpBackground' style=\"background-color: "+b+"; border-color: "+f+'"></div>';
a+='<div id="'+this.id+'" >';
a+='  <div id="'+this.id+'.player" ></div>';
a+='  <div id="'+this.id+'.controlBlocker" ></div>';
a+='  <div id="'+this.id+'.blocker" ></div>';
a+='  <div id="'+this.id+'.plugins" ></div>';
a+='  <div id="'+this.id+'.controls" ></div>';
a+='  <div id="'+this.id+'.subtitles" class="tpSubtitles" ></div>';
a+="</div>";
if(c){c.innerHTML=a
}else{document.write(a)
}this.container=document.getElementById(this.id);
this.pluginLayer=document.getElementById(this.id+".plugins");
this.player=document.getElementById(this.id+".player");
this.controlBlocker=document.getElementById(this.id+".controlBlocker");
var d=document.createElement("a");
d.style.width="100%";
d.style.height="100%";
d.style.zIndex=1;
d.style.background="transparent";
d.style.display="block";
d.href="#";
var g=this;
var h=function(k){var i=g.videoClicked(k);
if(i){if(!k){var k=window.event
}k.cancelBubble=true;
if(k.stopPropagation){k.stopPropagation()
}if(k.preventDefault){k.preventDefault()
}return false
}};
d.onclick=h;
this.controlBlocker.appendChild(d);
this.blocker=document.getElementById(this.id+".blocker");
var e=this.backgroundcolor;
if(e){idx=e.indexOf("0x");
if(idx!==-1){e=e.substring(idx+2);
e="#"+e
}this.blocker.style.backgroundColor=e
}else{this.blocker.style.backgroundColor="black"
}this.blocker.style.position="absolute";
this.blocker.top=0;
this.blocker.left=0;
this.blocker.style.display="";
this.blocker.style.overflow="hidden";
this.blocker.style.height="100%";
this.blocker.style.width="100%";
this.controlsLayer=document.getElementById(this.id+".controls");
this.controlsLayer.className="controlsLayer";
this.controlsLayer.style.backgroundColor="transparent";
this.controlsLayer.style.cssFloat="left";
this.controlsLayer.style["float"]="left";
this.controlBlocker.style.position="absolute";
this.controlBlocker.style.display="none";
this.blocker.top=0;
this.blocker.left=0;
this.controlBlocker.style.backgroundColor="transparent";
this.controlBlocker.style.height="100%";
this.controlBlocker.style.width="100%";
this.controlBlocker.style.overflow="hidden";
this.player.style.width="100%";
this.player.style.height="100%";
this.player.style.position="absolute";
this.pluginLayer.style.width="100%";
this.pluginLayer.style.position="absolute";
this.controlsLayer.style.width="100%";
this.controlsLayer.style.height="100%";
this.container.className="player";
this.hideVideo();
return c
},isSafeMode:function(){return this.safeMode
},isPrefetch:function(){return !this.safeMode&&(tpIsIOS()||tpIsAndroid())
},isFlashPlayer:function(){return false
},writePlayer:function(b,a){if(b===""&&a&&this.iOSEnabled){return
}var g=b;
if(!a){tpDebug("writePlayer calling pause()");
this.video.pause();
tpDebug("writing player src="+b+"&format=redirect");
tpDebug("writePlayer original url:"+b);
var e=g.indexOf("format=");
tpDebug("formatIndex="+e);
if(e>=0){tpDebug("found a format in original");
var c=g.substring(e+7,g.length);
var f="format=";
var d=c.indexOf("&");
if(d>=0){tpDebug("found & at index:"+d);
c=c.substring(0,d)
}f=f+c;
tpDebug("target="+f);
g=g.replace(f,"format=redirect")
}else{if(g.indexOf("?")>=0){g=g+"&format=redirect"
}else{g=g+"?format=redirect"
}}}tpDebug("writePlayer newUrl:"+g);
this.video.src=g;
if(!this.iOSEnabled){this.video.load();
this.iOSEnabled=true
}this.showVideo()
},createVideo:function(){if(this.video){this.destroyVideo()
}this.video=document.createElement("video");
this.video.setAttribute("autoplay",false);
this.setSeekHandler();
this._hideNativeControls=this.controller.getProperty("overrideNativeControls");
if(tpIsAndroid()){tpDebug("showing controls");
this.showControls(true)
}if(this._hideNativeControls){this.showControls(false)
}this.video.id=this.id+".content";
if(this.height){this.video.setAttribute("height",this.height)
}if(this.width){this.video.setAttribute("width",this.width)
}this.video.style.width="100%";
this.video.style.height="100%";
this.video.autoplay="false";
this.video.preload="none";
if(this.backgroundcolor){this.video.style.backgroundColor="#"+this.backgroundcolor.substr(2)
}if((tpIsIOS()||tpIsAndroid())&&!this.controller.isPrefetch()){this.video.src=""
}this.player.appendChild(this.video)
},getVideoProxy:function(){return new $pdk.connection.VideoProxy(this.video)
},destroyVideo:function(){if(this.video){this.video.pause();
this.video.src="";
this.player.removeChild(this.video);
this.video=null
}},videoClicked:function(c){if(this.currentClip&&this.currentClip.baseClip.moreInfo){window.open(this.currentClip.baseClip.moreInfo.href,"_blank");
var d=this.currentClip.baseClip.moreInfo.clickTrackingUrls;
if(d){var b=0;
var a=d.length;
for(;
b<a;
b++){this.track(d[b])
}}return true
}return false
},track:function(b){var c=this,a=new Image();
tpDebug("Tracking click: "+b);
a.src=b
},attachListeners:function(){if(!this.listeners){this.listeners=new Object()
}var a=this;
if($pdk.jQuery.isIE){this.video.addEventListener("click",this.listeners.clickHandler=function(c){var b=a.videoClicked(c);
if(b){if(!c){var c=window.event
}c.cancelBubble=true;
if(c.stopPropagation){c.stopPropagation()
}if(c.preventDefault){c.preventDefault()
}return false
}},false)
}this.video.addEventListener("canplay",this.listeners.canplay=function(b){tpDebug("Video tag dispatched "+b.type)
},false);
this.video.addEventListener("ended",this.listeners.ended=function(b){tpDebug("Video tag dispatched "+b.type);
a.onEnded(b)
},false);
this.video.addEventListener("play",this.listeners.play=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlay(b)
},false);
this.video.addEventListener("pause",this.listeners.pause=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPause(b)
},false);
this.video.addEventListener("volumechange",this.listeners.volumechange=function(b){tpDebug("Video tag dispatched "+b.type);
a.onVolumeChange(b)
},false);
this.video.addEventListener("playing",this.listeners.playing=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlaying(b)
},false);
this.video.addEventListener("progress",this.listeners.progress=function(b){tpDebug("Video tag dispatched "+b.type);
a.onProgress(b)
},false);
this.video.addEventListener("error",this.listeners.error=function(b){tpDebug("Video tag dispatched "+b.type);
a.onError(b)
},false);
this.video.addEventListener("loadeddata",this.listeners.loadeddata=function(b){tpDebug("Video tag dispatched "+b.type)
},false);
this.video.addEventListener("loadstart",this.listeners.loadstart=function(b){tpDebug("Video tag dispatched "+b.type)
},false);
this.video.addEventListener("loadedmetadata",this.listeners.loadedmetadata=function(b){tpDebug("Video tag dispatched "+b.type)
},false);
this.video.addEventListener("waiting",this.listeners.waiting=function(b){tpDebug("Video tag dispatched "+b.type)
},false);
this.video.addEventListener("stalled",this.listeners.stalled=function(b){tpDebug("Video tag dispatched "+b.type)
},false)
},removeListeners:function(){var a=this;
this.video.removeEventListener("canplay",this.listeners.canplay);
this.video.removeEventListener("ended",this.listeners.ended);
this.video.removeEventListener("play",this.listeners.play);
this.video.removeEventListener("pause",this.listeners.pause);
this.video.removeEventListener("volumechange",this.listeners.volumechange);
this.video.removeEventListener("playing",this.listeners.playing);
this.video.removeEventListener("progress",this.listeners.progress);
this.video.removeEventListener("seeked",this.listeners.seeked);
this.video.removeEventListener("loadeddata",this.listeners.loadeddata);
this.video.removeEventListener("waiting",this.listeners.waiting);
this.video.removeEventListener("stalled",this.listeners.stalled);
this.video.removeEventListener("seeking",this.listeners.seeking);
this.video.removeEventListener("loadedmetadata",this.listeners.loadedmetadata)
},_bindElement:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var b=this;
window.onresize=function(){b.onResize()
};
window.onload=function(){b.onResize()
};
if(this.width){}else{}if(this.height){}else{}this.ready()
},write:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var b=this;
window.onresize=function(){b.onResize()
};
if(this.width){}else{}if(this.height){}else{}this.initialize();
this.ready()
},initialize:function(){if(this.scopes){this.controller.scopes=this.scopes.split(",")
}if(this.safeMode==="true"){this.controller.setProperty("safeMode",true);
this.safeMode=true
}else{if(this.safeMode==="prefetch"){this.controller.setProperty("safeMode","prefetch");
this.prefetch=true;
this.safeMode=false
}else{if(tpIsIOS()||tpIsAndroid()){this.controller.setProperty("safeMode",true);
this.safeMode=true
}else{this.controller.setProperty("safeMode",false);
this.safeMode=false
}}}var a=this;
this.controller.addEventListener("OnPluginsComplete",function(){a.pluginsComplete=true;
a.controller.removeEventListener("OnPluginsComplete",this)
});
this.playbackManager=new PlaybackManager(this,this.controller);
this.controller.registerFunction(PdkFunctions.clickPlayButton,this,this.clickPlayButton);
this.controller.registerFunction("getMediaArea",this,this.getMediaArea);
this.controller.registerFunction("writePlayer",this,this.writePlayer);
this.controller.registerFunction("isPrefetch",this,this.isPrefetch);
this.controller.registerFunction("isSafeMode",this,this.isSafeMode);
this.controller.registerFunction("isFlashPlayer",this,this.isFlashPlayer);
this.controller.registerFunction(PdkFunctions.getVideoProxy,this,this.getVideoProxy)
},ready:function(){this._super();
this.playbackManager.video=this.video;
if(this.layout||this.layoutUrl){this.controls=document.createElement("div");
this.controls.className="controlLayoutArea";
this.controls.style.height="40px";
this.controls.style.width="100%";
this.controls.style.background="#555555";
this.setMediaArea({width:document.getElementById(this.id).offsetWidth,height:document.getElementById(this.id).offsetHeight-40})
}this.video.style.padding="0";
this.video.style.margin="0";
this.previewImage=new PreviewImageHolder(this.controller);
this.playButtonHolder=new PlayButtonHolder(this.controller);
this.loadingIndicatorHolder=new LoadingIndicatorHolder(this.controller);
var a=this.controller.getProperty("endCard");
if(self.CardMediator&&a=="HelloWorldEndCard"){this.cardHolder=new oldCardMediator(a,this.controller)
}if(this.controller.getProperty("relatedItemsURL")){}this.errorHolder=new ErrorHolder(this.controller);
if(this.showAdCountdown==null){this.showAdCountdown=true
}if(this.showAdCountdown){this.adCountdownHolder=new AdCountdownHolder(this.controller)
}var d=this;
this.controller.addEventListener("OnPlayerLoaded",function(){d.handlePlayerLoaded.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseSelected",function(){d.handleReleaseSelected.apply(d,arguments)
});
this.controller.addEventListener("OnSetRelease",function(){d.handleSetRelease.apply(d,arguments)
});
this.controller.addEventListener("OnSetReleaseUrl",function(){d.handleSetReleaseUrl.apply(d,arguments)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){d.handleLoadRelease.apply(d,arguments)
});
this.controller.addEventListener("OnMediaLoadStart",function(){});
this.controller.addEventListener("OnReleaseStart",function(){d.handleReleaseStart.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){d.handleReleaseEnd.apply(d,arguments)
});
this.controller.registerFunction("seekToPosition",this,this.seekToPosition);
this.controller.registerFunction("seekToPercentage",this,this.seekToPercentage);
if(this.pluginsComplete===false){var c=d;
var b=function(){if(c.pluginsComplete){return
}c.pluginsComplete=true;
c.controller.removeEventListener("OnPlugInsComplete",b);
c.controller.dispatchEvent("OnPlayerLoaded",[this.id])
};
this.controller.addEventListener("OnPlugInsComplete",b);
return
}else{this.controller.dispatchEvent("OnPlayerLoaded",[this.id])
}},handlePlayerLoaded:function(c){if(!this.releaseUrl){return
}var a=tpGetPid(this.releaseUrl);
if(a){var b=this;
tpDebug("scheduling default null OnGetRelease");
this.OnGetReleaseTimeout=setTimeout(function(){tpDebug("Dispatching default null OnGetRelease");
b.handleGetRelease({data:null})
},1);
this.controller.addEventListener("OnGetReleaseStarted",this.OnGetReleaseStartedListener=function(d){tpDebug("canceling default null OnGetRelease");
clearTimeout(b.OnGetReleaseTimeout)
});
this.controller.addEventListener("OnGetRelease",this.OnGetReleaseListener=function(d){b.handleGetRelease(d)
});
this.controller.getRelease(a)
}},handleReleaseSelected:function(a){if(a.data.userInitiated==true){this.ignoreGetRelease=true
}},handleGetRelease:function(c){this.controller.removeEventListener("OnGetRelease",this.OnGetReleaseListener);
if(this.ignoreGetRelease){this.ignoreGetRelease=false;
return
}var a=c.data;
var b=(a&&a.url)?a.url:this.releaseUrl;
if(this.autoPlay&&!(tpIsIOS()||tpIsAndroid())){tpDebug("Autoplaying releaseUrl:"+b);
this.setReleaseURL(b)
}else{this.controller.loadReleaseURL(b)
}},seekToPosition:function(a){this.doSeek(a/1000)
},doSeek:function(a){if(this.currentClip){this.seekTimeObject=this.createCurrentTimeObject();
if(this.progSeekListener){this.seekHandler.removeEventListener(SeekEvents.PROGRAMATICALLYSEEKED,this.progSeekListener)
}var b=this;
this.progSeekListener=function(){tpDebug("progSeekListener fired");
b.onSeeked();
b.progSeekListener=undefined
};
this.seekHandler.addEventListener(SeekEvents.PROGRAMATICALLYSEEKED,this.progSeekListener);
this.delaySeek=undefined;
this.delaySeekPercentage=undefined;
this.seekHandler.doSeek(a)
}else{this.delaySeek=a
}},seekToPercentage:function(a){a=isNaN(a)?0:a;
a=a<0?0:a;
a=a>100?100:a;
if(isNaN(this.video.duration)&&this.currentClip){return this.doSeek(this.currentClip.baseClip.trueLength/1000*(a/100))
}else{if(!isNaN(this.video.duration)){return this.doSeek(this.video.duration*(a/100))
}else{this.delaySeekPercentage=a;
return false
}}},handleLoadRelease:function(b){clearTimeout(this.nextClipTimerId);
var a=b.data;
this.currentReleaseUrl=a.url;
if(tpIsIOS()){this.hideVideo()
}},handleSetRelease:function(b){this.controller.removeEventListener("OnGetRelease",this.OnGetReleaseListener);
clearTimeout(this.OnGetReleaseTimeout);
var a=b.data;
this.currentReleaseUrl=a.url;
clearTimeout(this.nextClipTimerId);
tpDebug("setting release");
this.showVideo();
if(tpIsAndroid()){tpDebug("Player.handleSetRelease: setting poster");
this.video.poster=a.defaultThumbnailUrl
}},handleSetReleaseUrl:function(b){var a=b.data;
tpDebug("setting release url");
this.currentReleaseUrl=a;
this.showVideo();
if(tpIsAndroid()){this.video.poster=""
}},handleReleaseStart:function(a){this.newRelease=true;
this.currentVideoTime=0;
this.wasPaused=false;
this.playlist=a.data;
if(!tpIsIOS()||(this.currentClip&&(!this.currentClip.isAd&&this.video.readyState>=2))){tpDebug("Handle release start showing video");
this.showVideo()
}else{if(this.video.readyState<2){this.waitforcanplay=true
}}if(tpIsIOS()||(this.currentClip&&this.currentClip.isAd==true)){}},doMediaLoadStart:function(c){var c=c;
this.clipEnded=false;
this.startedPlaying=false;
clearTimeout(this.nextClipTimerId);
clearInterval(this.timeUpdateTimer);
this.jumpTime=undefined;
this.needsJump=false;
this.startedBuffer=false;
tpDebug("handleMediaLoadStart fired, newRelease="+this.newRelease);
this.wasPaused=this.video.paused&&this.newRelease==false;
this.newRelease=false;
if(c.URL!==this.currentURL&&c.streamType!=="empty"){tpDebug("handleMediaLoadStart calling pause() due to url change to "+c.URL);
this.suppressPause=true;
this.video.pause();
this.showBlocker(true);
this.currentURL=c.URL;
var b=this;
setTimeout(function(){b.controller.dispatchEvent("OnMediaLoadStart",c)
},1)
}if(c.streamType=="empty"){this.showBlocker(false);
this.currentClip=c;
this.controller.dispatchEvent("OnMediaLoadStart",c)
}else{if(c.isAd){tpDebug("current clip is ad, why are we in player??");
c.hasPlayed=true
}tpDebug("showing video");
this.showVideo();
tpDebug("setting offset:"+c.offset+" startTime: "+c.startTime+" mediaTime:"+c.currentMediaTime,"tpPlayer");
var d=c.startTime+c.offset;
c.currentMediaTime=d;
c.offset=0;
if(this.video&&this.currentClip&&this.currentClip.baseClip.id===c.baseClip.id&&d>0){this.currentVideoTime=this.video.currentTime*1000;
if(Math.abs(this.currentVideoTime-d)<300){this.currentClip=c;
this.setTimer();
tpDebug("starting new clip");
this.jumpTime=undefined;
tpDebug("playing video, readyState is "+this.video.readyState);
if(!this.wasPaused){tpDebug("Calling video.play()");
this.video.play()
}}else{this.currentClip=c;
var a=d/1000;
this.needsJump=true;
tpDebug("doing jump if ready");
if(this.progSeekListener){this.seekHandler.removeEventListener(SeekEvents.PROGRAMATICALLYSEEKED,this.progSeekListener)
}var b=this;
this.progSeekListener=function(){tpDebug("Seeked programatically");
b.showBlocker(false);
b.jumpTime=undefined;
b.needsJump=false;
b.seekHandler.removeEventListener(SeekEvents.PROGRAMATICALLYSEEKED,b.progSeekListener);
b.setTimer();
if(!b.wasPaused){tpDebug("Calling video.play()");
b.video.play()
}b.progSeekListener=undefined
};
this.seekHandler.addEventListener(SeekEvents.PROGRAMATICALLYSEEKED,this.progSeekListener);
tpDebug("Player loading "+c.URL+" to seek to "+a);
this.seekHandler.doSeek(a)
}}else{tpDebug("loading video at "+c.baseClip.URL);
c.wasProcessed=false;
this.currentClip=c;
var b=this;
this.simulateClick(function(){tpDebug('got the "click"');
if(c.URL!==undefined&&c.URL!==null&&c.URL!==""){if(d===0){b.suppressPause=true;
tpDebug("Player pausing, about to change clip to "+c.URL+" , wasPaused="+b.wasPaused);
if(!b.video.paused){b.video.pause()
}b.video.src=c.URL;
b.video.load();
setTimeout(function(){tpDebug("Calling video.play()");
b.video.load();
b.video.play()
},1);
setTimeout(function(){if(c.baseClip.noSkip){b.showControls(false)
}else{tpDebug("showing controls");
b.showControls(true)
}},500)
}else{var f=d/1000;
var g=c.URL;
var e=b.wasPaused;
tpDebug("Pausing before jump to "+d);
b.video.pause();
tpDebug("loading "+c.URL+" so we can seek to "+d);
if(b.progSeekListener){tpDebug("removing progSeekListener because we're changing clips");
b.seekHandler.removeEventListener(SeekEvents.PROGRAMATICALLYSEEKED,b.progSeekListener)
}b.progSeekListener=function(){tpDebug("removing progSeekListener because it fired");
b.seekHandler.removeEventListener(SeekEvents.PROGRAMATICALLYSEEKED,b.progSeekListener);
b.showBlocker(false);
b.progSeekListener=undefined;
if(!e||c.baseClip.noSkip){tpDebug("Done seek to "+f+" resuming playback");
b.video.play()
}};
b.seekHandler.addEventListener(SeekEvents.PROGRAMATICALLYSEEKED,b.progSeekListener);
b.video.pause();
if(c.URL!==b.video.src){b.video.src=c.URL;
b.showBlocker(true)
}tpDebug("Calling doSeek before load for time "+f+", wasPaused="+e);
b.seekHandler.doSeek(f,true,!e);
tpDebug("Calling video.load() for "+b.video.src);
setTimeout(function(){b.video.load()
},1);
setTimeout(function(){if(c.baseClip.noSkip){b.showControls(false)
}else{tpDebug("showing controls");
b.showControls(true)
}},500)
}}else{b.onError()
}});
this.playOnCanPlay=true
}if(!this._hideNativeControls&&!c.baseClip.noSkip){tpDebug("showing controls");
this.showControls(true)
}}},handleReleaseEnd:function(c){var b=c.data;
var a=this;
this.showBlocker(true);
var e=this.currentReleaseUrl;
function d(){if(e&&e===a.currentReleaseUrl){a.controller.loadReleaseURL(a.currentReleaseUrl)
}}this.nextClipTimerId=setTimeout(function(){d()
},1000);
this.hideVideo()
},showControls:function(a){if(this._hideNativeControls){this.video.controls=false;
return
}if(tpIsSafari()&&!tpIsIOS()){this.showControlBlocker(!a);
this.video.controls=true
}else{this.showControlBlocker(!a);
this.video.controls=a
}},onResize:function(){this.controller.dispatchEvent("OnMediaAreaChanged",{top:0,left:0,width:this.container.offsetWidth,height:this.container.offsetHeight})
},setTimer:function(){var a=this;
this.timeUpdateTimer=setInterval(function(){a.onTimeUpdate()
},250)
},onPlay:function(b){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}var a=this;
this.setTimer();
if(this.paused){if(this.currentClip.baseClip.isAd&&tpIsIOS()){this.showControls(false)
}this.paused=false;
if(!this.suppressPause){this.controller.dispatchEvent("OnMediaUnpause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:false})
}else{this.suppressPause=false
}}},onPlaying:function(a){if(!this.currentClip){return
}if(this.needsJump){}else{if(this.currentClip&&this.currentClip.baseClip.isAd==false){this.showVideo()
}else{if(this.currentClip&&this.currentClip.streamType=="empty"){this.showVideo()
}}}},onPause:function(a){if(Math.abs(this.video.currentTime*1000-this.currentClip.endTime)<300||this.video.ended||this.suppressPause){tpDebug("Ignoring native pause event suppressPause:"+this.suppressPause);
return
}this.paused=true;
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}tpDebug("Dispatching OnMediaPause");
this.controller.dispatchEvent("OnMediaPause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:false});
tpDebug("isAd:"+this.currentClip.baseClip.isAd);
if(this.currentClip.baseClip.isAd){this.controller.dispatchEvent("OnShowPlayOverlay",true)
}},onVolumeChange:function(a){if(this.video.muted===true){this.controller.dispatchEvent("OnMute",true)
}},onSeeked:function(c){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(!this.seekTimeObject&&this.currentTimeObject&&this.currentTimeObject.currentTime!=this.video.currentTime){this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
}var b={globalDataType:"com.theplatform.pdk.data::SeekObject"};
b.end=this.createCurrentTimeObject();
if(b.end!=undefined&&this.seekTimeObject!=undefined&&b.end.currentTime!=this.seekTimeObject.currentTime){b.start=this.seekTimeObject
}else{var a=this.previousTime;
var f=b.end.duration;
b.start={globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a,currentTime:a,currentTimeAggregate:a,duration:b.end.duration,durationAggregate:b.end.durationAggregate,percentComplete:(a/f)*100,percentCompleteAggregate:(a/f)*100,isAggregate:false,isLive:false}
}b.clip=this.currentClip;
this.controller.dispatchEvent("OnMediaSeek",b);
this.seekTimeObject=undefined
},onSeeking:function(a){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
},onProgress:function(c){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(!this.startedBuffer){this.startedBuffer=true;
this.controller.dispatchEvent("OnMediaBuffering",this.currentClip)
}var b=0;
var a=0;
if(this.video.buffered&&this.video.buffered.length>0){b=this.video.buffered.end(0)/this.video.duration;
a=Math.floor((this.video.buffered.end(0)-this.video.buffered.start(0))*1000)
}tpDebug("onProgress: We've buffered "+b*100+"%");
if(b>=1){clearInterval(this.progressUpdateTimer)
}this.controller.dispatchEvent("OnMediaLoading",{ratioLoaded:b,isLoadComplete:b>=1,globalDataType:"com.theplatform.pdk.data::LoadMediaData",loadedMilliseconds:a,bytesLoaded:-1,bytesTotal:-1})
},onEnded:function(a){if(!this.currentClip||this.currentClip.streamType=="empty"||this.clipEnded===true){return
}if(this.controller.getFullScreenState()===true){}this.showBlocker(true);
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.jumpTime=undefined;
this.needsJump=false;
this.currentVideoTime=undefined;
this.startedPlaying=false;
tpDebug("Dispatching OnMediaEnd at "+this.video.currentTime+" for src:"+this.video.src);
if(Math.abs(this.video.currentTime*1000-this.currentClip.endTime)<300||this.video.ended){this.endMedia()
}},endMedia:function(){var a=this;
var c=b();
function b(){if(a.currentClip&&a.currentClip.mediaLength-1000<=a.currentClip.currentMediaTime){a.video.controls=false;
return true
}return false
}this.playbackManager.endMedia(this.currentClip);
if(c){tpDebug("Firing OnMediaComplete");
this.controller.dispatchEvent("OnMediaComplete",a.currentClip)
}if(this.controller.getFullScreenState()==true){this.controller.showFullScreen(false)
}},onTimeUpdate:function(d){if(this.currentClip===undefined||(this.currentClip.streamType=="empty")){return
}if(this.currentClip&&!this.startedPlaying){this.startedPlaying=true;
var b=tpGetPid(this.currentReleaseUrl);
this.currentClip.releasePID=b;
this.currentClip.trueLength=Math.floor(this.video.duration*1000);
this.currentClip.baseClip.loadTime=0;
if(this.currentClip.baseClip.isAd){this.currentClip.mediaLength=this.currentClip.trueLength;
this.currentClip.length=this.currentClip.trueLength;
this.currentClip.baseClip.trueLength=this.currentClip.trueLength
}this.previousTime=0;
tpDebug("Player dispatching OnMediaStart paused="+this.video.paused);
this.suppressPause=false;
this.controller.dispatchEvent("OnMediaStart",this.currentClip)
}if(this.jumpTime){}else{if(this.delaySeek){if(this.doSeek(this.delaySeek)){this.delaySeek=undefined;
this.delaySeekPercentage=undefined
}}else{if(this.delaySeekPercentage){if(this.seekToPercentage(this.delaySeekPercentage)){this.delaySeekPercentage=undefined
}}else{if(this.currentVideoTime&&Math.abs(this.currentVideoTime-(this.video.currentTime*1000))<250){}else{if(!this.clipEnded){var a=true;
if(this.currentClip&&!this.currentClip.isAd&&this.video.ended){a=false
}if(this.video.playing){this.showBlocker(false)
}else{if(this.blockerShowing===true&&this.video.readyState===4){this.showBlocker(false)
}}this.currentTimeObject=this.createCurrentTimeObject();
if(this.currentClip){this.currentClip.currentMediaTime=Math.floor(this.video.currentTime*1000);
this.currentClip.mediaTime=this.currentClip.currentMediaTime;
this.currentClip.mediaLength=!isNaN(this.video.duration)?Math.round(this.video.duration*1000):this.currentClip.mediaLength;
this.controller.updateMediaTime(this.currentClip.currentMediaTime)
}this.controller.dispatchEvent("OnMediaPlaying",this.currentTimeObject);
this.showBlocker(false);
var c=this.video.currentTime*1000;
if(this.currentVideoTime){c=this.currentVideoTime
}this.currentVideoTime=undefined;
if(!this.video.seeking&&this.seekHandler.seekState!=SeekStates.USERSEEKING&&this.currentClip&&this.currentClip.endTime&&this.currentClip.endTime>0&&Math.abs(c-this.currentClip.endTime)<300){this.currentVideoTime=this.video.currentTime;
this.clipEnded=true;
if(this.currentClip.isAd){this.currentClip.hasPlayed=true
}tpDebug("Dispatching OnMediaEnd at "+this.video.currentTime+" for src:"+this.video.src);
this.endMedia(this.currentClip)
}else{if(!this.video.seeking&&this.currentClip&&this.currentClip.startTime&&(c<(this.currentClip.startTime-1))){}}this.previousTime=c
}}}}}},createCurrentTimeObject:function(){if(!this.video){return undefined
}var f=Math.round(this.video.currentTime*1000);
var a=this.currentClip.chapter;
if(a&&!(this.currentClip.noSkip||this.currentClip.isAd)&&(f<a.startTime||f>a.endTime)){var c=0;
var g=this.playlist.chapters.chapters.length;
for(;
c<g;
c++){var k=this.playlist.chapters.chapters[c];
var e=this.playlist.chapters.chapters[c+1];
if(k&&f>=k.startTime&&f<=k.endTime){tpDebug("selecting chapter "+c);
a=k;
break
}else{if(e&&f>=k.endTime&&f<=e.startTime){tpDebug("selecting chapter "+(c+1));
a=e;
f=a.startTime;
break
}}}}if(a&&a.chapters&&(a.chapters.isAggregate||a.chapters.isRelative)){var b={globalDataType:"com.theplatform.pdk.data::TimeObject"};
b.mediaTime=f;
b.currentTime=f-a.startTime;
b.currentTimeAggregate=a.aggregateStartTime+b.currentTime;
b.duration=a.length;
b.durationAggregate=a.chapters.aggregateLength;
b.percentComplete=(b.currentTime/a.length)*100;
b.percentCompleteAggregate=(b.currentTimeAggregate/b.durationAggregate)*100,b.isAggregate=a.chapters.isAggregate,b.isLive=false;
return b
}else{var l=Math.round(this.video.currentTime*1000);
var h=Math.round(this.video.duration*1000);
return{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:l,currentTime:l,currentTimeAggregate:l,duration:h,durationAggregate:h,percentComplete:(l/h)*100,percentCompleteAggregate:(l/h)*100,isAggregate:false,isLive:false}
}},cloneTimeObject:function(a){return a?{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a.mediaTime,currentTime:a.currentTime,currentTimeAggregate:a.currentTimeAggregate,duration:a.duration,durationAggregate:a.durationAggregate,percentComplete:a.percentComplete,percentCompleteAggregate:a.percentCompleteAggregate,isAggregate:a.isAggregate,isLive:a.isLive}:undefined
},onError:function(a){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}clearTimeout(this.nextClipTimerId);
this.showControls(false);
this.showBlocker(true);
tpDebug("tpPlayer got error with src:"+this.video.src);
if(this.video.src&&this.video.src.length>0&&document.location.href.indexOf(this.video.src)!=0){if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}if(this.video.readyState>=0){var b={location:this.id,context:null,clip:this.currentClip,message:"The media cannot be played",friendlyMessage:"The media cannot be played",globalDataType:"com.theplatform.pdk.data::PlaybackError"};
this.controller.dispatchEvent("OnMediaError",b)
}}else{tpDebug("But it's an ignorable error!")
}},showVideo:function(){tpDebug("request to show main video with readyState="+this.video.readyState);
if(this.waitToShowVideoFunction){tpDebug("showVideo triggered by timeout");
clearTimeout(this.waitToShowVideoFunction);
this.waitToShowVideoFunction=undefined
}tpDebug("showing main video");
this.player.style.marginLeft="";
this.player.style.display="";
this.waitforcanplay=false;
if(!tpIsIOS()){this.controller.dispatchEvent("OnForceShowVideo",null)
}},hideVideo:function(){tpDebug("hiding video");
this.player.style.marginLeft="-1000px"
},simulateClick:function(d){tpDebug("simulateClick");
var c=document.createElement("a");
c.id="clickSimulator";
c.href="#";
document.body.appendChild(c);
c.addEventListener("click",function(a){a.preventDefault();
d()
},false);
var b;
if(document.createEvent){b=document.createEvent("MouseEvents");
if(b.initMouseEvent){b.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
c.dispatchEvent(b)
}}document.body.removeChild(c)
},setMediaArea:function(a){this.video.width=a.width;
this.video.height=a.height;
this.controller.dispatchEvent("OnMediaAreaChanged",this.getMediaArea())
},getMediaArea:function(){return{top:0,left:0,x:0,y:0,width:this.video.offsetWidth,height:this.video.offsetHeight}
},getComponentSize:function(){return tpGetComponentSize(this.container)
},clickPlayButton:function(){if(this.paused&&this.currentClip&&this.currentClip.baseClip.isAd){this.controller.dispatchEvent("OnShowPlayOverlay",false);
this.controller.pause(false);
return
}tpDebug("got clickPlayButton, calling this.playbackManager.playCurrentRelease()");
this.currentClip=undefined;
this.playbackManager.playCurrentRelease()
},setReleaseURL:function(a){this.controller.setReleaseURL(a)
},showControlBlocker:function(a){if(this._hideNativeControls){this.video.controls=false;
return
}this.controlBlockerShowing=a;
a?this.controlBlocker.style.display="":this.controlBlocker.style.display="none"
},showBlocker:function(a){this.blockerShowing=a;
a?this.blocker.style.display="":this.blocker.style.display="none"
}});
if(typeof(Player)==="undefined"){Player=tpPlayer
}PlugInManager=Class.extend({init:function(a){this.controller=a;
this.plugins=new Array()
},addPlugIn:function(b,h,i,a,e,f,g,c){if((c==undefined&&a.indexOf(".swf")<0)||(c&&c.toLowerCase().indexOf("html")>=0)){var d={id:b,type:h,priority:i,url:a,subUrl:e,vars:f,plugIn:g};
this.plugins.push(d)
}},ready:function(){if(!this.plugins||this.plugins.length===0){var b=this;
setTimeout(function(){b.controller.dispatchEvent(PdkEvent.OnPlugInsComplete,null)
},1)
}for(var a=0;
a<this.plugins.length;
a++){tpController.loadPlugIn(this.plugins[a],this.controller)
}}});
PreviewImageHolder=Class.extend({init:function(b){this.controller=b;
var d=this;
var a=document.getElementById(b.id);
var c=document.getElementById(b.id+".standby");
if(!c){c=document.createElement("div");
c.id=b.id+".standby";
c.style.width="100%";
c.style.height="100%";
a.appendChild(c)
}var e=document.createElement("img");
e.style.position="absolute";
e.style.top="0";
e.style.left="0";
e.style.zIndex=100;
e.style.width="100%";
e.style.height="auto";
e.className="preview";
e.onload=function(){d.handleImageLoaded()
};
c.appendChild(e);
this.image=e;
this.standby=c;
this.controller.addEventListener(PdkEvent.OnShowPreviewImageOverlay,function(f){d.showOverlay(f)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){d.handleLoadReleaseUrl.apply(d,arguments)
});
this.controller.addEventListener("OnSetRelease",function(){d.handleLoadReleaseUrl.apply(d,arguments)
});
this.controller.addEventListener("OnMediaStart",function(){d.handleMediaStart.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseStart",function(){d.handleMediaStart.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){d.handleMediaEnd.apply(d,arguments)
});
this.controller.addEventListener("OnMediaAreaChanged",function(){d.handleMediaAreaChanged.apply(d,arguments)
});
this.controller.addEventListener("OnForceShowVideo",function(){d.hideOverlay()
})
},handleImageLoaded:function(){this.resize()
},handleMediaAreaChanged:function(){this.resize()
},handleMediaEnd:function(){this.started=false
},resize:function(){var b=this.image.naturalHeight;
var c=this.image.naturalWidth;
var a=c/b;
var d=this.standby.offsetWidth/this.standby.offsetHeight;
if(a<d){this.image.style.height="100%";
this.image.style.width="auto";
this.image.style.marginLeft=Math.abs((this.standby.offsetWidth-(this.standby.offsetWidth/(d/a)))/2)+"px";
this.image.style.marginTop=""
}else{this.image.style.width="100%";
this.image.style.height="auto";
this.image.style.marginTop=(Math.abs(this.standby.offsetHeight*(d/a)-this.standby.offsetHeight)/2)+"px";
this.image.style.marginLeft=""
}},handleLoadReleaseUrl:function(a){this.release=a.data
},hideOverlay:function(){tpDebug("hideOverlay called!");
this.image.style.display="none"
},showOverlay:function(b){if(b.data==true){if(this.release&&this.release.defaultThumbnailUrl&&this.release.defaultThumbnailUrl.length>0){this.imageLoaded=false;
if(this.imageLoaded){var a=this;
this.image.onload=function(){if(!a.started){a.image.style.display=""
}a.image.onload=undefined
}
}else{if(!this.started){this.image.style.display="";
this.imageLoaded=true
}}this.image.src=this.release.defaultThumbnailUrl
}else{this.image.style.display="none"
}}else{this.image.style.display="none"
}},handleMediaError:function(b){console.error("Got media error in imageHolder");
this.started=false;
var a=this;
setTimeout(function(){if(!a.started){a.image.style.display=""
}},3000)
},handleMediaStart:function(a){this.started=true;
this.image.style.display="none"
}});
QOS=Class.extend({init:function(a){this.MILESTONE_START=0;
this.MILESTONE_FIRST_QUARTILE=25;
this.MILESTONE_MID_POINT=50;
this.MILESTONE_THIRD_QUARTILE=75;
this.controller;
this.currentTracker;
this.currentPlaylist;
this.currentClip;
this.clipLoadStart;
this.clipBeginning=false;
this.clipBufferStart=0;
this.clipMilestone;
_controller=a;
_controller.addEventListener(PdkEvent.OnReleaseStart,playlistBegin)
},playlistBegin:function(a){_currentTracker=new MpsTracker(a.data,_controller);
if(_currentTracker&&_currentTracker.canTrack()){_controller.addEventListener(PdkEvent.OnMediaLoadStart,beginLoadMedia);
_controller.addEventListener(PdkEvent.OnMediaStart,beginMedia);
_controller.addEventListener(PdkEvent.OnReleaseEnd,playlistEnd)
}else{_controller.trace("Not tracking QOS for current playlist","QOS",Debug.WARN)
}},playlistEnd:function(a){_currentTracker=null;
_controller.removeEventListener(PdkEvent.OnMediaLoadStart,beginLoadMedia);
_controller.removeEventListener(PdkEvent.OnMediaStart,beginMedia);
_controller.removeEventListener(PdkEvent.OnReleaseEnd,playlistEnd);
_controller.removeEventListener(PdkEvent.OnMediaError,mediaError)
},beginLoadMedia:function(b){_currentClip=b.data;
var a=_currentTracker.findTrackingInfo(_currentClip);
if(a){if(a.loadTime==0){_clipBeginning=true;
_clipLoadStart=getTimer();
_clipBufferStart=0
}else{_clipBeginning=false;
_clipBufferStart=getTimer()
}_clipMilestone=computeMilestone(a.percentPlayed,a.length);
_controller.addEventListener(PdkEvent.OnMediaPlay,playMedia);
_controller.addEventListener(PdkEvent.OnMediaBuffer,bufferMedia);
_controller.addEventListener(PdkEvent.OnMediaPlaying,clipTime);
_controller.addEventListener(PdkEvent.OnMediaError,mediaError)
}else{_controller.trace("Not tracking QOS for current media; release ID "+_currentClip.baseClip.releaseID+" and SMIL index "+_currentClip.baseClip.smilIndex+" didn't match an original playlist clip","QOS",Debug.WARN);
_currentClip=null
}},beginMedia:function(b){if(_currentClip!=null){if(_clipBeginning){var a=getTimer()-_clipLoadStart;
_currentClip.loadTime=a;
_controller.trace("setting loadTime: "+a,"QOS",Debug.INFO);
_clipBeginning=false;
_controller.trace("Sending tracking for clip start","QOS",Debug.INFO);
_currentTracker.sendTracking(_currentClip)
}else{updateBuffering()
}_controller.addEventListener(PdkEvent.OnMediaEnd,endMedia)
}},playMedia:function(a){updateBuffering()
},updateBuffering:function(){if(_clipBufferStart>0){var a=getTimer()-_clipBufferStart;
_currentClip.rebufferingTime+=a;
_controller.trace("clip has just buffered "+a+" total: "+_currentClip.rebufferingTime,"QOS",Debug.INFO);
_clipBufferStart=0
}},bufferMedia:function(a){if(_clipBufferStart==0){_clipBufferStart=getTimer()
}},endMedia:function(a){_controller.trace("Sending tracking for clip end","QOS",Debug.INFO);
_currentTracker.sendTracking(_currentClip);
_controller.removeEventListener(PdkEvent.OnMediaPlay,playMedia);
_controller.removeEventListener(PdkEvent.OnMediaBuffer,bufferMedia);
_controller.removeEventListener(PdkEvent.OnMediaPlaying,clipTime);
_controller.removeEventListener(PdkEvent.OnMediaEnd,endMedia);
_controller.removeEventListener(PdkEvent.OnMediaError,mediaError)
},mediaError:function(a){_controller.removeEventListener(PdkEvent.OnMediaPlay,playMedia);
_controller.removeEventListener(PdkEvent.OnMediaBuffer,bufferMedia);
_controller.removeEventListener(PdkEvent.OnMediaPlaying,clipTime);
_controller.removeEventListener(PdkEvent.OnMediaEnd,endMedia);
_controller.removeEventListener(PdkEvent.OnMediaError,mediaError)
},clipTime:function(b){var a=b.data;
var c=computeMilestone(a.percentComplete,a.duration);
if(c>_clipMilestone){_clipMilestone=c;
_controller.trace("Sending tracking for "+_clipMilestone+"% milestone","QOS",Debug.INFO);
_currentTracker.sendTracking(_currentClip)
}},computeMilestone:function(b,a){if(a<15000){return MILESTONE_START
}else{if(a<=30000){if(b<MILESTONE_MID_POINT){return MILESTONE_START
}else{return MILESTONE_MID_POINT
}}else{if(b<MILESTONE_FIRST_QUARTILE){return MILESTONE_START
}else{if(b<MILESTONE_MID_POINT){return MILESTONE_FIRST_QUARTILE
}else{if(b<MILESTONE_THIRD_QUARTILE){return MILESTONE_MID_POINT
}else{return MILESTONE_THIRD_QUARTILE
}}}}}}});
MpsTracker=Class.extend({init:function(f,b){this.controller=b;
this.baseUrl=MpsTrackingUrl.getBaseUrl(f,b);
this.clipTrackingInfo=new Array();
this.firstUpdate=true;
for(var d=0;
d<f.clips.length;
d++){a(f.clips[d])
}if(f.playlistID&&f.playlistID.length>0){this.playlistTrackingInfo=new MpsTrackingInfo();
this.playlistTrackingInfo.releaseId=f.playlistID
}var e=this;
function a(k){if(!k.releaseID||k.releaseID.length==0){return
}var g=c(k);
for(var h=0;
h<e.clipTrackingInfo.length;
h++){if(e.clipTrackingInfo[h].releaseId==k.releaseID&&e.clipTrackingInfo[h].smilIndex==k.smilIndex){if(k.isAd){g.requestCount=1;
break
}else{return
}}}e.clipTrackingInfo.push(g)
}function c(h){var g=new MpsTrackingInfo();
g.smilIndex=h.smilIndex;
g.releaseId=h.releaseID;
g.clipIndex=h.clipIndex;
g.title=h.title;
g.length=h.releaseLength;
return g
}},canTrack:function(){return this.clipTrackingInfo&&this.clipTrackingInfo.length>0
},sendTracking:function(f){var e=this.findTrackingInfo(f);
if(e){var g=e.clone();
this.setStats(g,f);
var c=MpsTrackingUrl.buildClipParams(g,e,0);
e.copyStats(g);
var b=1;
if(this.firstUpdate){for(var d=0;
d<this.clipTrackingInfo.length;
d++){if(this.clipTrackingInfo[d]!=e&&this.clipTrackingInfo[d].requestCount==0){c+=MpsTrackingUrl.buildUncountClipParams(this.clipTrackingInfo[d],b);
this.clipTrackingInfo[d].requestCount=1;
b++
}}}if(this.playlistTrackingInfo){var a=MpsTrackingInfo.aggregate(this.clipTrackingInfo);
if(!this.firstUpdate){a.trackingCount=0
}a.releaseId=this.playlistTrackingInfo.releaseId;
c+=MpsTrackingUrl.buildClipParams(a,this.playlistTrackingInfo,b);
this.playlistTrackingInfo.copyStats(a)
}if(c.length>0){sendUrl(this.baseUrl+c)
}this.firstUpdate=false;
e.requestCount=0;
e.trackingCount=0
}},setStats:function(a,b){if(b.trueBitrate>0&&b.trueBitrate!=a.bitrate){a.bitrate=b.trueBitrate
}if(b.baseClip.trueLength>0&&b.baseClip.trueLength!=a.length){a.length=b.baseClip.trueLength
}if(a.lengthPlayed<b.lengthPlayed){a.lengthPlayed=b.lengthPlayed
}a.loadTime=b.loadTime;
a.computePercentBandwidth(b.connectionBitrate);
a.computePercentPlayed();
a.computePercentRebuffering(b.rebufferingTime)
},findTrackingInfo:function(d){var b=(d.linkedClip?d.linkedClip:d);
for(var c=0;
c<this.clipTrackingInfo.length;
c++){var a=this.clipTrackingInfo[c];
if(a.releaseId==b.baseClip.releaseID&&a.smilIndex==b.baseClip.smilIndex&&(!b.baseClip.isAd||b.clipIndex==a.clipIndex)){return a
}}return null
},sendUrl:function(c){var e=new URLRequest();
e.method=URLRequestMethod.POST;
e.url=c;
e.data="";
var a=new URLLoader();
a.addEventListener(Event.COMPLETE,b);
a.addEventListener(IOErrorEvent.IO_ERROR,d);
a.load(e);
function b(f){}function d(f){}}});
MpsTrackingInfo=Class.extend({init:function(){this.smilIndex=0;
this.releaseId="";
this.clipIndex=0;
this.bitrate=0;
this.length=0;
this.title="";
this.requestCount=0;
this.trackingCount=1;
this.lengthPlayed=0;
this.loadTime=0;
this.percentPlayed=0;
this.percentRebuffering=0;
this.percentBandwidth=0
},copyStats:function(a){this.length=a.length;
this.bitrate=a.bitrate;
this.lengthPlayed=a.lengthPlayed;
this.loadTime=a.loadTime;
this.percentBandwidth=a.percentBandwidth;
this.percentPlayed=a.percentPlayed;
this.percentRebuffering=a.percentRebuffering
},clone:function(){var a=new MpsTrackingInfo();
a.bitrate=this.bitrate;
a.clipIndex=this.clipIndex;
a.length=this.length;
a.lengthPlayed=this.lengthPlayed;
a.loadTime=this.loadTime;
a.percentBandwidth=this.percentBandwidth;
a.percentPlayed=this.percentPlayed;
a.percentRebuffering=this.percentRebuffering;
a.releaseId=this.releaseId;
a.requestCount=this.requestCount;
a.smilIndex=this.smilIndex;
a.title=this.title;
a.trackingCount=this.trackingCount;
return a
},computePercentBandwidth:function(a){if(a>0&&bitrate>0){percentBandwidth=(a/bitrate)*100;
if(!isNaN(percentBandwidth)){if(percentBandwidth>100){percentBandwidth=100
}}}else{percentBandwidth=100
}},computePercentPlayed:function(){if(lengthPlayed>0&&length>0){percentPlayed=(lengthPlayed/length)*100;
if(percentPlayed>100){percentPlayed=100
}}},computePercentRebuffering:function(a){if(a>0&&lengthPlayed>0){percentRebuffering=(a/(a+lengthPlayed))*100
}},aggregate:function(e){var c=new MpsTrackingInfo();
c.percentBandwidth=0;
for(var b=0;
b<e.length;
b++){var a=e[b];
c.loadTime+=a.loadTime;
c.length+=a.length;
c.lengthPlayed+=a.lengthPlayed;
var d=a.percentBandwidth;
if(d==0){d=100
}c.percentBandwidth+=d*a.length;
c.percentPlayed+=a.percentPlayed*a.length;
c.percentRebuffering+=a.percentRebuffering*a.length
}if(c.length>0){c.percentBandwidth/=c.length;
c.percentPlayed/=c.length;
c.percentRebuffering/=c.length
}if(c.percentBandwidth==0){c.percentBandwidth=100
}return c
}});
ReleaseFeedParser=Class.extend({_namespaces:new Object(),processFeed:function(c,e){var d=new Object();
d.globalDataType="com.theplatform.pdk.data::ReleaseFeed";
d.entries=new Array();
if(!c){d.isError=true;
d.error=c.toString();
return d
}this.processNamespaces(c);
if(c.entries){for(var b=0;
b<c.entries.length;
b++){a=new Object();
a.globalDataType="com.theplatform.pdk.data::Release";
this.processEntry(c.entries[b],a,e);
d.entries.push(a)
}d.range=new Object();
d.range.globalDataType="com.theplatform.pdk.data::Range";
d.range.startIndex=-1;
d.range.endIndex=-1;
if(c.startIndex){d.range.startIndex=c.startIndex
}if(c.entryCount){d.range.endIndex=d.range.startIndex+c.entryCount-1
}if(c.entryCount){d.range.itemCount=c.entryCount
}else{d.range.itemCount=d.entries.length
}if(c.totalResults){d.range.totalCount=c.totalResults
}}else{if(c.isException&&c.responseCode==404){d.range.startIndex=0;
d.range.endIndex=0;
d.range.itemCount=0;
d.range.totalCount=0
}else{if(c.hasOwnProperty("entryCount")&&c.entryCount==0){d.range.startIndex=0;
d.range.endIndex=0;
d.range.itemCount=0;
d.range.totalCount=0
}else{if(c.isException){d.isError=true;
d.error="["+c.responseCode+"] "+c.title+": "+c.description;
d.range=new Object();
d.range.globalDataType="com.theplatform.pdk.data::Range";
d.range.startIndex=0;
d.range.endIndex=0;
d.range.itemCount=0;
d.range.totalCount=0
}else{var a=new Object();
this.processEntry(c,a,e);
d.entries.push(a);
d.range=new Object();
d.range.globalDataType="com.theplatform.pdk.data::Range";
d.range.startIndex=1;
d.range.endIndex=1;
d.range.itemCount=1;
d.range.totalCount=1
}}}}return d
},processEntry:function(n,k,m){this.processNamespaceEntry(n,k);
var h=k;
if(n.pubDate!=null){h.airdate=new Date(n.pubDate)
}if(n.plmedia$approved!=null){h.approved=n.plmedia$approved
}if(n.media$thumbnails!=null){h.thumbnails=new Array(n.media$thumbnails.length);
for(f=0;
f<n.media$thumbnails.length;
f++){var e=n.media$thumbnails[f];
var a=new Object();
if(e.assetType&&e.assetType.length>0){a.assetTypes=new Array(1);
a.assetTypes[0]=e.assetType
}a.height=e.height;
a.url=e.url;
a.width=e.width;
h.thumbnails[f]=a
}}if(!n.media$content){n.media$content=new Array();
n.media$content[0]=new Object()
}var g;
if(n.media$content.length>1&&m&&m.length>0){for(var l in m){for(var f=0;
f<n.media$content.length;
f++){if(n.media$content[f].plfile$format.toLowerCase()==m[l].toLowerCase()){if(g&&n.media$content[f].plfile$isDefault){g=n.media$content[f]
}else{if(!g){g=n.media$content[f]
}}}}if(g!==undefined){break
}}}if(!g){g=n.media$content[0]
}if(g.plfile$assetTypes!=null){h.assetTypes=new Array();
for(f=0;
f<g.plfile$assetTypes.length;
f++){h.assetTypes.push(g.plfile$assetTypes[f])
}}if(g.plfile$assetTypeIds!=null){h.assetTypeIds=new Array();
for(f=0;
f<g.plfile$assetTypeIds.length;
f++){h.assetTypeIds.push(g.plfile$assetTypeIds[f])
}}if(n.availableDate){h.availableDate=new Date(n.availableDate)
}if(n.author!=null){h.author=n.author
}if(g.plfile$bitrate!=null){h.bitrate=g.plfile$bitrate
}if(n.media$categories!=null){h.categories=new Array();
for(j=0;
j<n.media$categories.length;
j++){category=new Object();
if(n.media$categories[j].media$scheme){category.scheme=n.media$categories[j].media$scheme
}if(n.media$categories[j].media$label){category.label=n.media$categories[j].media$label
}if(n.media$categories[j].media$name){category.name=n.media$categories[j].media$name
}h.categories[j]=category
}}if(n.plmedia$categoryIds!=null){h.categoryIds=new Array(n.plmedia$categoryIds.length);
for(f=0;
f<n.plmedia$categoryIds.length;
f++){h.categoryIds[f]=n.plmedia$categoryIds[f]
}}if(g.plfile$contentType!=null){h.contentType=g.plfile$contentType.toLowerCase()
}if(n.media$copyright!=null){h.copyright=n.media$copyright
}if(g.plfile$releases){if(g.plfile$releases[0].plrelease$delivery!=null){h.delivery=g.plfile$releases[0].plrelease$delivery.toLowerCase()
}}if(n.description!=null){h.description=n.description
}if(g.plfile$transformId!=null){h.transformId=g.plfile$transformId
}if(n.media$excludeCountries!=null){h.excludeCountries=n.media$excludeCountries
}if(n.media$expirationDate!=null){h.expirationDate=new Date(n.media$expirationDate)
}if(g.plfile$format!=null){h.format=g.plfile$format
}if(g.plfile$height!=null){h.height=g.plfile$height
}if(n.media$keywords!=null){h.keywords=n.media$keywords
}if(g.plfile$language!=null){h.language=g.plfile$language
}if(g.plfile$duration!=null){h.length=g.plfile$duration*1000
}if(n.link!=null){h.link=n.link
}if(g.plfile$releases&&g.plfile$releases[0].plrelease$pid!=null){h.pid=g.plfile$releases[0].plrelease$pid
}else{h.pid=this.getPIDFromUrl(g.plfile$url)
}if(g.plfile$playerUrl!=null){h.playerUrl=g.plfile$playerUrl
}if(g.plfile$isProtected!=null){h.isProtected=Boolean(g.plfile$isProtected)
}if(n.media$ratings!=null){h.ratings=n.media$ratings
}if(n.media$credits!=null){h.credits=new Array();
for(f=0;
f<n.media$credits.length;
f++){var d=n.media$credits[f];
var b=new Object();
b.role=d.media$role;
b.scheme=d.media$scheme;
b.value=d.media$value;
h.credits.push(b)
}}if(n.requestCount!=null){var c=new Object();
c.type="viewCount";
c.value=n.requestCount
}if(n.serverID!=null){h.serverId="http://mps.theplatform.com/data/Server/"+n.serverID
}if(g.plfile$fileSize!=null){h.fileSize=g.plfile$fileSize
}if(n.media$countries!=null){h.countries=new Array(n.media$countries.length);
for(f=0;
f<n.media$countries.length;
f++){h.countries[f]=n.media$countries[f].toString()
}}if(n.plmedia$defaultThumbnailUrl!=null){h.defaultThumbnailUrl=n.plmedia$defaultThumbnailUrl
}if(n.title!=null){h.title=n.title
}if(n.text!=null){h.text=n.text
}if(g.plfile$url!=null){h.url=g.plfile$url
}if(g.plfile$width!=null){h.width=g.plfile$width
}return h
},getPIDFromUrl:function(b){if(!b){return null
}var f=b.split("?")[1];
var g=f.split("&");
for(var c=0;
c<g.length;
c++){var h=g[c].split("=");
if(h[0]=="pid"){return h[1]
}}var d=/.*?\/?[^\/]+\/[^\/]+\/[^\/]+\/([a-zA-Z0-9_]+)/;
var e=b.match(d);
var a;
if(e&&e.length>1){return e[1]
}else{return null
}},processNamespaces:function(a){this._namespaces=new Object();
if(a.$xmlns){for(var b in a.$xmlns){this._namespaces[b]=a.$xmlns[b];
if(this._namespaces[b].toString().charAt(this._namespaces[b].toString().length-1)!="/"){this._namespaces[b]=this._namespaces[b].toString()+"/"
}}}},processNamespaceEntry:function(c,f){if(c.added!=null){f.added=new Date(c.added)
}if(c.guid!=null){f.guid=c.guid
}if(c.id!=null){f.id=c.id
}if(c.updated!=null){f.updated=new Date(c.updated)
}var a=c["$xmlns"];
for(var e in c){if(e.indexOf("$")>0){var d=e.split("$")[0];
var g=this._namespaces[d];
if(!g&&a){g=a[d]
}if(g!="http://search.yahoo.com/mrss/"&&g!="http://purl.org/dc/terms/"&&g!="http://xml.theplatform.com/data/object/admin/"&&g!="http://xml.theplatform.com/media/data/MediaFile/"&&g!="http://xml.theplatform.com/media/data/Media/"&&g!="http://xml.theplatform.com/media/data/Release/"&&g!="http://xml.theplatform.com/media/data/Category/"){var b=new Object();
if(g){b.namespaceUri=g;
b.fieldName=e.split("$")[1]
}else{b.namespaceUri="";
b.fieldName=e
}b.value=c[e].toString();
if(f.customValues==undefined){f.customValues=new Array()
}f.customValues.push(b)
}}}}});
tpReleaseList=PDKComponent.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'" class="releaseList"></div>'
},init:function(c,b,a){this.width=b;
this.height=a;
this.id=c;
if(tpReleaseList.first===undefined){tpReleaseList.first=this
}this.controller=new ComponentController(c);
this.hasAutoPlayed=false;
this.hasAutoLoaded=false;
this.playing=false
},initialize:function(){var a=this;
if(this.scopes){this.controller.scopes=this.scopes.split(",")
}this.controller.addEventListener("OnRefreshReleaseModelStarted",function(){a.handleRefreshStarted.apply(a,arguments)
});
this.controller.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.controller.addEventListener("OnSetReleaseUrl",function(){a.handleSetReleaseUrl.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseSelected",function(){a.handleOnReleaseSelected.apply(a,arguments)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){a.handleLoadReleaseUrl.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseStart",function(){a.handleReleaseStart.apply(a,arguments)
});
this.controller.addEventListener("OnGetRelease",function(){a.handleGetRelease.apply(a,arguments)
});
this.controller.addEventListener("OnGetReleaseStarted",function(){a.handleGetReleaseStarted.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){a.handleReleaseEnd.apply(a,arguments)
});
this.controller.addEventListener("OnMediaStart",function(){a.handleMediaStart.apply(a,arguments)
});
this.controller.addEventListener("OnMediaEnd",function(){a.handleMediaEnd.apply(a,arguments)
});
this.controller.registerFunction("playNext",this,this.playNext);
this.controller.registerFunction("playPrevious",this,this.playPrevious);
this.currentIndex=-1;
if(this.showtitle===undefined){this.showtitle=true
}if(this.showdescription===undefined){this.showdescription=true
}if(this.showlength===undefined){this.showlength=true
}if(this.showthumbnail===undefined){this.showthumbnail=true
}if(this.defaultthumbnailheight===undefined){this.defaultthumbnailheight=100
}if(this.thumbnailwidth===undefined){this.thumbnailwidth=160
}if(this.thumbnailheight===undefined){this.thumbnailheight=90
}if(this.showtitle==="false"){this.showtitle=false
}if(this.showdescription==="false"){this.showdescription=false
}if(this.showlength==="false"){this.showlength=false
}if(this.showthumbnail==="false"){this.showthumbnail=false
}this.showTitle=this.showtitle;
this.showDescription=this.showdescription;
this.showLength=this.showlength;
this.showThumbnail=this.showthumbnail;
this.thumbnailWidth=this.thumbnailwidth;
this.thumbnailHeight=this.thumbnailheight;
this.defaultThumbnailHeight=this.defaultthumbnailheight
},write:function(c){if(this.autoLoad===undefined){this.autoLoad=true
}if(this.autoPlay===undefined&&!(tpIsAndroid()||tpIsIOS())){this.autoPlay=true
}else{if(tpIsAndroid()||tpIsIOS()){this.autoPlay=false;
if(this.autoLoad==false){this.autoLoad=true
}}}if(this.playAll===undefined){this.playAll=true
}if(!this.columns){this.columns=2
}else{this.columns=parseInt(this.columns)
}if(!this.rows&&this.itemsPerPage!==undefined){this.rows=this.itemsPerPage/this.columns
}else{if(!this.rows){this.rows=2
}}if(tpIsIOS()){var a=document.createElement("style");
a.type="text/css";
var d=" .releaseListItem a:hover { border: 1px solid #383838; }.releaseListItem a:hover .releaseListThumbDiv { border: 1px solid #383838; } ";
a.appendChild(document.createTextNode(d));
document.getElementsByTagName("head")[0].appendChild(a)
}if(c){this.container=c
}else{document.write('<div id="'+this.id+'" class="releaseList"></div>');
this.container=document.getElementById(this.id);
this.container.style.width=this.width;
this.container.style.height=this.height
}this.style=document.createElement("style");
var b=document.getElementsByTagName("head")[0];
this.style.setAttribute("type","text/css");
b.appendChild(this.style);
this.initialize();
if(tpLegacyController){tpLegacyController.ready()
}},_bindElement:function(a){if(this.autoLoad==null){this.autoLoad=true
}if(this.autoPlay===undefined&&!(tpIsAndroid()||tpIsIOS())){this.autoPlay=true
}else{if(tpIsAndroid()||tpIsIOS()){this.autoPlay=false
}}if(this.playAll==null){this.playAll=true
}this.container=a;
this.container.style.width=this.width;
this.container.style.height=this.height;
tpLegacyController.ready();
return this.container
},handleGetRelease:function(a){if(a.data){this.currentReleaseUrl=a.data.releaseURL
}},handleGetReleaseStarted:function(a){this.getReleaseCalled=true
},handleReleaseStart:function(a){this.currentReleaseUrl=a.data.releaseURL
},handleReleaseEnd:function(a){this.currentClip=undefined;
this.enable()
},getCurrentIndex:function(){currentIndex=-1;
if(!this.wasSetByReleaseList){return -1
}var a=this.currentReleaseUrl;
for(var b=0;
b<this.feed.entries.length;
b++){if(a.substring(0,a.indexOf("?"))==this.feed.entries[b].url.substring(0,a.indexOf("?"))||a.indexOf(this.feed.entries[b].pid)>=0){currentIndex=b
}}return currentIndex
},playNext:function(c,a){this.currentIndex=this.getCurrentIndex();
this.currentIndex++;
if(this["feed"]===undefined||this.feed.entries.length<=0){this.controller.loadReleaseURL(this.currentReleaseUrl,true);
return
}var b=this.feed.entries[this.currentIndex];
if(c==undefined){c=false
}if(a==undefined){a=false
}this.wasSetByReleaseList=true;
if(a==false||(this.playAll&&this.autoPlay)){if(b){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.setRelease(b,true);
return
}}else{if(b){var d=this.currentClip;
if(!this.playing||a||!d||!(d.noSkip||(d.baseClip&&d.baseClip.noSkip))){if(this.playing===true){this.controller.pause(true);
this.controller.loadReleaseURL(b.url,true);
return
}else{if(tpIsIOS()||this.playAll===false&&a===false){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.loadReleaseURL(b.url,true);
return
}else{if(this.playAll===true&&a===false){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.setRelease(b,true);
return
}else{if(this.playAll===true&&a===true){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:b.url,userInitiated:false});
this.controller.loadReleaseURL(b.url,true);
return
}else{this.controller.loadReleaseURL(this.currentReleaseUrl,true)
}}}}this.wasSetByReleaseList=true
}else{return
}}}},playPrevious:function(a){if(this.currentIndex>0){this.currentIndex--
}else{if(this.currentIndex==0&&a){this.currentIndex=this.feed.entries.length-1
}}var c=this.feed.entries[this.currentIndex];
if(!c){return
}if(this.autoPlay){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true);
return
}else{var b=this.currentClip;
if(!this.playing||!b||!(b.noSkip||(b.baseClip&&b.baseClip.noSkip))){if(this.playing){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true)
}else{if(this.controller.isPrefetch()){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true);
return
}else{if(this.controller.isFlashPlayer()){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:c.url,userInitiated:false});
this.controller.setRelease(c,true);
return
}}}}else{return
}}},handleLoadReleaseUrl:function(d){this.currentReleaseUrl=d.data.url;
if(!this.feed){this.currentIndex=-1;
return
}var a=d.data.pid;
this.currentPid=a;
this.currentIndex=-1;
for(var b=0;
b<this.feed.entries.length;
b++){if(a==this.feed.entries[b].pid){var c=this.items[b];
if(c!==undefined){c.className="releaseListItemSelected"
}}else{var c=this.items[b];
if(c!==undefined){c.className="releaseListItem"
}}}},handleOnReleaseSelected:function(d){var a=d.data.releaseUrl;
if(this["feed"]===undefined){return
}this.currentReleaseUrl=a;
this.currentIndex=-1;
for(var b=0;
b<this.feed.entries.length;
b++){if(a.substring(0,a.indexOf("?"))==this.feed.entries[b].url.substring(0,a.indexOf("?"))||a.indexOf(this.feed.entries[b].pid)>=0){this.currentIndex=b;
var c=this.items[b];
if(c!==undefined){c.className="releaseListItemSelected"
}}else{var c=this.items[b];
if(c!==undefined){c.className="releaseListItem"
}}}},handleSetReleaseUrl:function(d){var a=d.data;
if(this["feed"]===undefined){return
}this.currentIndex=-1;
for(var b=0;
b<this.feed.entries.length;
b++){if(a.substring(0,a.indexOf("?"))==this.feed.entries[b].url.substring(0,a.indexOf("?"))||a.indexOf(this.feed.entries[b].pid)>=0){var c=this.items[b];
if(c!==undefined){c.className="releaseListItemSelected"
}}else{var c=this.items[b];
if(c!==undefined){c.className="releaseListItem"
}}}},handleRefreshStarted:function(a){this.refresh();
this.blocker=undefined;
this.loadingIndicator=document.createElement("div");
this.loadingIndicator.className="loadingIndicator";
this.loadingIndicator.style.position="absolute";
this.loadingIndicator.style.top="50%";
this.loadingIndicator.style.left="50%";
this.loadingIndicator.innerHTML="Loading...";
this.container.appendChild(this.loadingIndicator);
this.loadingIndicator.style.display=""
},refresh:function(){var c=document.createElement("div");
var b=this.framecolor?this.framecolor:"#000000";
var a=this.backgroundcolor?this.backgroundcolor:"#ffffff";
b=b.replace("0x","#");
a=a.replace("0x","#");
c.className="tpBackground";
c.style.backgroundColor=a;
c.style.borderColor=b;
this.container.innerHTML="";
this.container.appendChild(c)
},isPrefetch:function(){return this.controller.isPrefetch()
},handleReleaseModelRefreshed:function(w){var l=w.data;
var G;
var m;
var r;
var C;
var c;
var H;
var E;
this.feed=l;
this.refresh();
var e=-1;
var u=-1;
var s=0;
if(this.hasoverlay){var t=document.createElement("div");
t.className="tpReleaseListOverlay";
this.container.appendChild(t);
s=t.clientHeight
}this.items=[];
var b=(this.container.clientWidth/this.columns);
var h;
if(this.rows<(this.container.clientHeight/10)){h=(this.container.clientHeight-s)/this.rows
}else{h=parseInt(this.defaultThumbnailHeight)
}var e=b-10;
var u=h-10;
var v=b-12;
var k=h-12;
var d=((h)-12);
var g;
var D=this.thumbnailWidth/this.thumbnailHeight;
if(this.showTitle||this.showLength||this.showDescription){g=Math.floor(((h)-12)*(D))
}else{g=Math.floor(((b)-12))
}for(var y=0;
y<l.entries.length;
y++){m=document.createElement("div");
G=document.createElement("div");
r=document.createElement("img");
C=document.createElement("div");
c=document.createElement("div");
H=document.createElement("div");
m.className="releaseListItemHolder";
G.className="releaseListItem";
G.style.width=e+"px";
G.style.height=u+"px";
H.className="releaseListText";
var o=document.createElement("div");
o.className="releaseListTextHolder";
r.className="releaseListThumbImage";
C.className="releaseListThumb";
E=document.createElement("a");
E.href="#";
E.release=l.entries[y];
E.index=y;
E.style.width=v+"px";
E.style.height=k+"px";
E.tile=G;
E.titleHolder=o;
E.imageHolder=C;
E.imageBox=c;
r.imageBox=c;
r.tile=G;
if(this.itembackgroundcolor){G.style.backgroundColor="#"+this.itembackgroundcolor.substr(2);
c.style.backgroundColor="#"+this.itembackgroundcolor.substr(2)
}if(this.thumbnailbackgroundcolor){c.style.backgroundColor="#"+this.thumbnailbackgroundcolor.substr(2)
}if(this.itemframecolor){o.style.borderColor="#"+this.itemframecolor.substr(2);
C.style.borderColor="#"+this.itemframecolor.substr(2)
}if(this.thumbnailframecolor){C.style.borderColor="#"+this.thumbnailframecolor.substr(2)
}if(this.textframecolor){o.style.borderColor="#"+this.textframecolor.substr(2)
}if(this.textbackgroundcolor){}var F=this;
E.onclick=function(){if(F.currentClip&&F.currentClip.isAd){return
}if(this.playImage!==undefined){this.playImage.src=tpGetScriptPath()+"/../images/playOverlay.png"
}F.currentIndex=this.index;
if(F.isPrefetch()){F.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.release.url,userInitiated:true});
F.controller.loadReleaseURL(this.release.url,false)
}else{F.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.release.url,userInitiated:true});
F.controller.setRelease(this.release,false)
}return false
};
E.onmouseover=function(){if(this.playImage!==undefined&&this.parentNode.className!=="releaseListItemSelected"&&(!F.thumbnailhighlighthovercolor||F.thumbnailhighlighthovercolor.toLowerCase()=="0x00ccff")){this.playImage.src=tpGetScriptPath()+"/../images/playOverlayHover.png"
}if(F.itembackgroundhovercolor){this.tile.style.backgroundColor="#"+F.itembackgroundhovercolor.substr(2)
}if(F.texthovercolor){}if(F.texthighlighthovercolor){this.titleHolder.style.borderColor="#"+F.texthighlighthovercolor.substr(2)
}if(F.thumbnailhighlighthovercolor){this.imageHolder.style.borderColor="#"+F.thumbnailhighlighthovercolor.substr(2)
}};
E.onmouseout=function(){if(this.playImage!==undefined){this.playImage.src=tpGetScriptPath()+"/../images/playOverlay.png"
}this.style.borderColor=null;
if(F.itembackgroundcolor){this.tile.style.backgroundColor="#"+F.itembackgroundcolor.substr(2)
}if(F.itemframecolor){this.titleHolder.style.borderColor="#"+F.itemframecolor.substr(2);
this.imageHolder.style.borderColor="#"+F.itemframecolor.substr(2)
}else{this.titleHolder.style.borderColor=null;
this.imageHolder.style.borderColor=null
}if(F.thumbnailframecolor){this.imageHolder.style.borderColor="#"+F.thumbnailframecolor.substr(2)
}else{this.imageHolder.style.borderColor=null
}if(F.textframecolor){this.titleHolder.style.borderColor="#"+F.textframecolor.substr(2)
}else{this.titleHolder.style.borderColor=null
}if(F.textcolor){}else{this.titleHolder.style.color=null
}if(F.textbackgroundcolor){}else{this.titleHolder.style.backgroundColor=null
}};
H.innerHTML="";
if(this.showTitle){if(this.titleColor){H.innerHTML+='<span class="releaseListTitle" style="color: #'+this.titleColor.substr(2)+'"><b>'+l.entries[y].title+"</b> </span>"
}else{H.innerHTML+='<span class="releaseListTitle"><b>'+l.entries[y].title+"</b> </span>"
}}if(this.showLength){var z=l.entries[y].length;
if(z>0){H.innerHTML+='<span class="releaseListLength">('+tpMillisToStr(z)+")</span>"
}}if(this.showDescription){H.innerHTML+='<div class="releaseListDescription">'+l.entries[y].description+"</div>"
}if(this.showThumbnail&&l.entries[y]&&l.entries[y].defaultThumbnailUrl){r.style.display="none";
r.style.visibility="hidden";
r.onload=r.onerror=function(){this.style.display="";
this.style.visibility="visible";
tpScaleImage(this,g,d);
var I=(d-(this.offsetHeight?this.offsetHeight:this.height))/2;
var a=(g-(this.offsetWidth?this.offsetWidth:this.width))/2;
var i=this;
if(this.offsetWidth<g){this.imageBox.style.paddingLeft=a+"px";
this.imageBox.style.paddingRight=a+"px"
}else{if(this.offsetHeight<d){this.imageBox.style.paddingTop=I+"px";
this.imageBox.style.paddingBottom=I+"px"
}}setTimeout(function(){i.tile.style.display=""
},100)
};
r.tile.style.display="none";
r.src=l.entries[y].defaultThumbnailUrl;
var n=document.createElement("div");
if(tpGetIEVersion()<=7){n.style.display="inline-block"
}else{n.style.display="table"
}n.style.height="100%";
c.className="releaseListThumbDiv";
r.imageBox=c;
n.appendChild(c);
c.appendChild(r);
C.appendChild(n);
var q=document.createElement("div");
q.className="releaseListPlay";
var x=document.createElement("img");
x.src=tpGetScriptPath()+"/../images/playOverlay.png";
x.className="releaseListPlayImage";
x.style.height="100%";
x.style.width="100%";
q.appendChild(x);
C.appendChild(q);
E.playImage=x;
E.appendChild(C)
}o.appendChild(H);
if(this.showTitle||this.showLength||this.showDescription){E.appendChild(o)
}G.appendChild(E);
if(e>0&&u>0){m.style["float"]="left";
m.appendChild(G);
this.container.appendChild(m)
}else{this.container.appendChild(G)
}this.items.push(G)
}var F=this;
setTimeout(function(){F.doInitialLoad(l)
},1);
if(this.style){var p="";
if(this.textcolor){p+=".releaseListItem a .releaseListTextHolder .releaseListText { color: #"+this.textcolor.substr(2)+"}\n"
}if(this.texthovercolor){p+=".releaseListItem a:hover .releaseListTextHolder .releaseListText { color: #"+this.texthovercolor.substr(2)+"}\n"
}if(this.texthighlighthovercolor){p+=".releaseListItem a:hover { border-color: #"+this.texthighlighthovercolor.substr(2)+"}\n"
}if(this.thumbnailhighlighthovercolor){p+=".releaseListItem a:hover .releaseListThumbDiv { border-color: #"+this.thumbnailhighlighthovercolor.substr(2)+"}\n"
}if(this.textselectedcolor){p+=".releaseListItemSelected .releaseListText { color: #"+this.textselectedcolor.substr(2)+"}\n"
}if(this.texthighlightselectedcolor){p+=".releaseListItemSelected a { border-color: #"+this.texthighlightselectedcolor.substr(2)+"}\n"
}if(this.thumbnailhighlightselectedcolor){p+=".releaseListItemSelected .releaseListThumbDiv { border-color: #"+this.thumbnailhighlightselectedcolor.substr(2)+"}\n"
}if(this.style.styleSheet){this.style.styleSheet.cssText=p
}else{this.style.appendChild(document.createTextNode(p))
}}var f=this.currentReleaseUrl;
if(f!==undefined){this.currentIndex=-1;
for(var y=0;
y<this.feed.entries.length;
y++){if(f.substring(0,f.indexOf("?"))==this.feed.entries[y].url.substring(0,f.indexOf("?"))||f.indexOf(this.feed.entries[y].pid)>=0){var B=this.items[y];
if(B!==undefined){B.className="releaseListItemSelected"
}}else{var B=this.items[y];
if(B!==undefined){B.className="releaseListItem"
}}}}var A=this.currentClip;
if(A&&(A.baseClip&&(A.baseClip.isAd||A.baseClip.noSkip))){this.disable()
}else{if(this.blocker){this.enable()
}}},doInitialLoad:function(a){if(this.getReleaseCalled){return
}if(tpReleaseList.first===this&&!this.currentReleaseUrl&&this.autoPlay&&!this.hasAutoPlayed&&a.entries&&a.entries.length>0){this.hasAutoPlayed=true;
if(false){this.controller.loadReleaseURL(a.entries[0].url,false)
}else{if(!this.currentReleaseUrl){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:a.entries[0].url,userInitiated:false});
this.controller.setReleaseURL(a.entries[0].url,false)
}}this.wasSetByReleaseList=true
}else{if(tpReleaseList.first===this&&!this.currentReleaseUrl&&this.autoLoad&&!this.hasAutoLoaded&&a.entries&&a.entries.length>0){this.hasAutoLoaded=true;
this.controller.loadReleaseURL(a.entries[0].url,false);
this.wasSetByReleaseList=true
}}},handleMediaStart:function(b){this.playing=true;
var a=b.data;
if(a.baseClip&&(a.baseClip.isAd||a.baseClip.noSkip)){this.disable()
}else{if(this.blocker){this.enable()
}}this.currentClip=a
},disable:function(){if(!this.blocker){this.blocker=document.createElement("div");
this.blocker.style.width="100%";
this.blocker.style.height="100%";
this.blocker.style.position="absolute";
this.blocker.style.top="0";
this.blocker.style.left="0";
this.blocker.style.background="black";
this.blocker.style.opacity="0.75";
this.blocker.style.filter="alpha(opacity=75)";
this.blocker.innerHTML="&nbsp;";
this.blocker.style.zIndex="500";
this.container.appendChild(this.blocker)
}this.blocker.style.display="";
for(child in this.container){if(child.style){child.style.opacity="0.75";
child.style.filter="alpha(opacity=75)"
}}},enable:function(){if(this.blocker){this.blocker.style.display="none"
}for(child in this.container){if(child.style){child.style.opacity="";
child.style.filter=""
}}},handleMediaEnd:function(a){this.playing=false;
this.enable()
},output:function(b){var a="";
for(prop in b){a+=prop+": "+b[prop]+"\n"
}alert(a)
}});
ReleaseList=tpReleaseList;
tpReleaseModel=PDKComponent.extend({init:function(a){this.id=a;
this.controller=new ComponentController(a);
this.parser=new ReleaseFeedParser();
tpDebug("ReleaseModel instantiated with id:"+a)
},write:function(){var a=this;
if(this.scopes){this.controller.scopes=this.scopes.split(",")
}this.controller.registerFunction("refreshReleaseModel",this,this.refreshReleaseModel);
this.controller.registerFunction("getRelease",this,this.getRelease);
this.playerReady=false;
this.doInitialLoad();
tpDebug("ReleaseModel written with id:"+this.controller.id)
},doInitialLoad:function(){if(!this.feedsServiceUrl&&this.feedsserviceurl){this.feedsServiceUrl=this.feedserviceurl;
delete this.feedserviceurl
}if(this.startIndex===undefined&&this["startindex"]!==undefined){this.startIndex=this.startindex;
delete this.startindex
}if(this.endIndex===undefined&&this["endindex"]!==undefined){this.endIndex=this.endindex;
delete this.endindex
}this.defaultFeedsUrl=this.feedsServiceUrl;
this.currentFeedsUrl=this.feedsServiceUrl;
var c;
var b;
var e;
var d;
var a;
if(this.sortField||this.sortDescending){c=new Object()
}if(this.startIndex||this.endIndex){b=new Object()
}if(this.params){e=this.params.split("&")
}if(this.secondaryParams){d=this.secondaryParams.split("&")
}if(this.mediaIds){a=this.mediaIds.split(",")
}if(this.sortField){c.field=this.sortField
}if(this.sortDescending){c.descending=this.sortDescending
}if(this.startIndex){b.startIndex=parseInt(this.startIndex)
}if(this.endIndex){b.endIndex=parseInt(this.endIndex)
}if(this.currentFeedsUrl){this.refreshReleaseModel(this.category,this.search,c,b,e,d,a)
}},_bindElement:function(a){var b=this;
this.container=a;
var b=this;
setTimeout(function(){b.doInitialLoad()
},1);
tpDebug("ReleaseModel bound with id:"+this.controller.id);
return a
},callback:function(b,a){var c=this.parser.processFeed(b,this.preferredFormats);
c.requestUrl=a;
c.search=this.search;
if(this.shuffle==="true"&&!this.sortField){c.entries.sort(function(){return 0.5-Math.random()
})
}this.controller.dispatchEvent("OnRefreshReleaseModel",c)
},getReleaseCallback:function(b,a){var c=this.parser.processFeed(b,this.preferredFormats);
if(c&&c.entries&&c.entries.length==1){this.controller.dispatchEvent("OnGetRelease",c.entries[0])
}else{this.controller.dispatchEvent("OnGetRelease",null)
}},refreshReleaseModel:function(a,k,c,d,b,i,e,f){this.updateCurrentFeedsUrl(f);
if(!b&&this.params){b=this.params.split("&")
}if(!i&&this.secondaryParams){i=this.secondaryParams.split("&")
}if((d&&this.search!==undefined)||k){this.category=undefined
}if(!d){d={startIndex:this.startIndex,endIndex:this.endIndex}
}if(c&&this.search!==undefined){this.search=undefined
}if((a===null||a===undefined)&&this.category&&k){a=this.category
}this.category=a;
if(k===null||k==undefined){k=this.search
}this.search=k;
this.lastRequestUrl=this.constructUrl(a,k,c,d,b,i,e,this.currentFeedsUrl,this.fields);
this.controller.dispatchEvent("OnRefreshReleaseModelStarted",null);
var g=this;
var h=new JSONLoader();
h.load(this.lastRequestUrl,function(){g.callback.apply(g,arguments)
},null,null,null,function(){g.controller.dispatchEvent("OnRefreshReleaseModel",{entries:[],globalDataType:"com.theplatform.pdk.data::ReleaseFeed"})
})
},getRelease:function(b){var d=this;
d.controller.dispatchEvent("OnGetReleaseStarted",null);
if(this.defaultFeedsUrl){var a=new JSONLoader();
var c=this.constructUrl(null,null,null,null,["byReleasePid="+b],null,null,this.defaultFeedsUrl,null);
a.load(c,function(){d.getReleaseCallback.apply(d,arguments)
},null,null,null,function(){d.controller.dispatchEvent("OnGetRelease",null)
})
}else{d.controller.dispatchEvent("OnGetRelease",null)
}},checkPreferredFormats:function(b,c){if(b=="byContent"){if(c.indexOf("byFormat")>=0){var a=c.substring(c.indexOf("byFormat%3D")+11,c.length);
this.preferredFormats=a.split("|")
}}},constructUrl:function(b,q,k,l,e,p,m,n,h){var d=new Object();
var g=n;
var f;
g=this.parseUrlParams(g,d);
g=this.addStandardMercuryParams(g,d);
if(e){for(f=0;
f<e.length;
f++){var a=e[f].split("=")[0];
var o=e[f].split("=")[1];
this.mergeMercuryParameter(d,a,o);
this.checkPreferredFormats(a,o)
}}if(p){for(f=0;
f<p.length;
f++){var a=p[f].split("=")[0];
var o=p[f].split("=")[1];
this.mergeMercuryParameter(d,a,o);
this.checkPreferredFormats(a,o)
}}if(!d.fields){this.mergeMercuryParameter(d,"fields","author,content,defaultThumbnailUrl,description,pubDate,title")
}if(!d.fileFields){this.mergeMercuryParameter(d,"fileFields","bitrate,duration,format,url")
}if(m&&m.length){g+=m.join(",")+"/"
}else{if(m){g+="0,0/"
}}this.mergeMercuryParameter(d,"count","true");
if(b&&b!="Most Popular"){this.mergeMercuryParameter(d,"byCategories",b)
}if(q&&m==null){this.mergeMercuryParameter(d,"q",q)
}if(k&&k.field){var c=k.field;
if(k.descending){c+="|desc"
}if(k.field=="RequestCount"){c="metrics.viewCount.lastDay|desc"
}this.mergeMercuryParameter(d,"sort",c)
}if(l){if(l.startIndex&&l.endIndex){this.mergeMercuryParameter(d,"range",l.startIndex+"-"+l.endIndex)
}else{if(l.endIndex){this.mergeMercuryParameter(d,"range","-"+l.endIndex)
}else{if(l.startIndex){this.mergeMercuryParameter(d,"range",l.startIndex+"-")
}}}}if(h){h=h.replace(":","%3A");
this.mergeMercuryParameter(d,"fields",h)
}g=this.addUrlParamsToConstructedUrl(g,d);
return g
},parseUrlParams:function(e,b){var a;
if(e.indexOf("?")!=-1){a=e.split("?")[1];
e=e.split("?")[0];
var d=a.split("&");
for(var c=0;
c<d.length;
c++){this.mergeMercuryParameter(b,d[c].split("=")[0],d[c].split("=")[1])
}}return e
},addStandardMercuryParams:function(b,a){this.mergeMercuryParameter(a,"form","json");
this.mergeMercuryParameter(a,"validFeed","false");
this.mergeMercuryParameter(a,"types","none");
if(b.charAt(b.length-1)!="/"){b+="/"
}return b
},mergeMercuryParameter:function(c,a,l){if(c[a]){if(a=="byContent"||a=="contentFilter"||a=="thumbnailFilter"){var g=c[a].split("%26");
var k=l.split("%26");
var d;
var m;
var h;
var b;
var n;
for(var e=0;
e<k.length;
e++){n=false;
for(var f=0;
f<g.length;
f++){d=g[f].toString().split("%3D")[0];
h=k[e].toString().split("%3D")[0];
if(d==h){n=true;
m=g[f].toString().split("%3D")[1];
b=k[e].toString().split("%3D")[1];
m+=","+b;
g[f]=d+"%3D"+m
}}if(!n){g.push(k[e])
}}c[a]=g.join("%26")
}else{if(a.indexOf("by")==0||a=="q"){c[a]+=","+l
}else{c[a]=l
}}}else{c[a]=l
}},addUrlParamsToConstructedUrl:function(d,a){var b="?";
for(var c in a){d+=b+c+"="+a[c];
b="&"
}return d
},updateCurrentFeedsUrl:function(a){if(a==""){this.currentFeedsUrl=this.defaultFeedsUrl
}else{if(a){this.currentFeedsUrl=a
}}}});
ReleaseModel=tpReleaseModel;
SampleCard=EventDispatcher.extend({init:function(d,b,a){var c=this;
this.id=d;
this.controller=a;
this.write()
},write:function(){if(this.view){this.view.innerHTML=""
}this.view=document.createElement("div");
this.view.id=this.id;
this.view.className="cardOverlay";
this.view.style.position="absolute";
this.view.style.top="0px";
this.view.style.left="0px";
this.view.style.height="100%";
this.view.style.width="100%";
this.view.style.background="";
this.view.style.zIndex="1000";
this.view.style.display="none";
if(parent){this.parent=parent
}},cardClicked:function(){},getView:function(){return this.view
},showCard:function(a){if(a){this.view.style.display=""
}else{this.view.style.display="none"
}}});
var SeekEvents={USERSEEKED:"userseeked",PROGRAMATICALLYSEEKED:"programaticallyseeked",SEEKFAILED:"seekfailed"};
var SeekStates={PAUSED:"paused",PLAYING:"playing",USERSEEKING:"userseeking",PROGRAMATICALLYSEEKING:"programaticallyseeking",ERROR:"error"};
SeekHandler=EventDispatcher.extend({init:function(a){this.video=a;
this.seekInterval=350;
this.seekState=this.video.paused?SeekStates.PAUSED:SeekStates.PLAYING;
var b=this;
if(!tpIsIOS()){this.seekingListener=function(c){b.onSeeking(c)
};
this.seekedListener=function(c){tpDebug("Native seek event");
if(Math.abs(b.video.currentTime-b.lastTime)*1000>b.seekInterval*2){b.onSeeked(c)
}};
this.video.addEventListener("seeking",this.seekingListener);
this.video.addEventListener("seeked",this.seekedListener)
}else{this.startTimer()
}this.lastTime=this.video.currentTime;
this.lastSrc=this.video.src
},stopTimer:function(){clearInterval(this.seekTimer)
},startTimer:function(){var a=this;
this.lastTime=0;
this.seekTimer=setInterval(function(){a.onTimer()
},this.seekInterval)
},onSeeked:function(b){tpDebug("got seeked event from "+this.lastTime+" to"+this.video.currentTime+" with src:"+this.video.src+" with ended="+this.video.ended);
this.lastTime=this.video.currentTime;
if(this.video.seeking===true||this.video.ended===true){return
}if(this.seeking&&Math.abs(this.video.currentTime-this.seekingTo)<=300){tpDebug("This was a programatic seek");
this.seeking=false;
this.seekingTo=-1;
var a=this;
setTimeout(function(){if(a.wasPlaying){tpDebug("seekhandler calling play()");
a.video.play()
}else{tpDebug("seekhandler not calling play, media was paused")
}a.dispatchEvent(SeekEvents.PROGRAMATICALLYSEEKED,a.lastTime)
},1)
}else{tpDebug("This was a user seek");
var a=this;
setTimeout(function(){if(a.wasPlaying){tpDebug("seekhandler calling play()");
a.video.play()
}else{tpDebug("seekhandler not calling play, media was paused")
}a.dispatchEvent(SeekEvents.USERSEEKED,a.lastTime)
},1)
}this.seekState=this.video.paused?SeekStates.PAUSED:SeekStates.PLAYING
},onSeeking:function(a){},onTimer:function(){if(this.video.ended||this.video.seeking||(this.video.paused&&!this.seeking)){return
}if(this.lastSrc===this.video.src&&this.lastTime!==undefined&&!this.seeking&&!this.video.seeking&&Math.abs(this.video.currentTime-this.lastTime)*1000>this.seekInterval*2){tpDebug("user seeked from "+this.lastTime+"to "+this.video.currentTime);
this.onSeeked()
}else{if(this.lastSrc===this.video.src&&this.seeking&&Math.abs(this.video.currentTime-this.seekingTo)*1000<=this.seekInterval*2){tpDebug("programatically seeked to "+this.video.currentTime);
this.onSeeked()
}}this.lastTime=this.video.currentTime;
this.lastSrc=this.video.src
},doSeek:function(e,a,f){this.seeking=true;
this.seekingTo=e;
this.seekState=SeekStates.PROGRAMATICALLYSEEKING;
this.wasPlaying=!this.video.paused||f;
if(!a&&(this.checkSeekable(e)||this.checkBuffered(e))){tpDebug("doSeek: synchronously seeking to "+e);
this.video.currentTime=(+(e).toFixed(1))
}else{var d=this;
var b=false;
var c=0;
this.progressListener=function(g){tpDebug("Got progress with readyState="+d.video.readyState);
c++;
if(d.checkPlayable()&&(d.checkSeekable(e)||d.checkBuffered(e))){d.removeProgressListeners();
tpDebug("seekHandler doing seek to "+e);
d.video.currentTime=(+(e).toFixed(1));
tpDebug("video.time is "+d.video.currentTime)
}else{tpDebug("got "+g.type+" , but "+e+" not yet seekable")
}};
this.video.addEventListener("canplay",this.progressListener);
this.video.addEventListener("canplaythrough",this.progressListener);
this.video.addEventListener("durationchange",this.progressListener);
this.progTimer=setInterval(function(){if(d.video.error!==null||(d.video.currentTime>0&&isNaN(d.video.duration))){d.removeProgressListeners();
d.dispatchEvent(SeekEvents.SEEKFAILED,d.lastTime)
}else{d.progressListener({type:"timer tick"})
}},100);
if(a){this.video.load()
}}},removeProgressListeners:function(){clearInterval(this.progTimer);
this.progTimer=undefined;
this.video.removeEventListener("canplay",this.progressListener);
this.video.removeEventListener("canplaythrough",this.progressListener);
this.video.removeEventListener("durationchange",this.progressListener)
},checkPlayable:function(){return this.video.readyState>=3
},checkSeekable:function(c){var b=this.video.seekable;
if(b&&b.length){for(var a=0;
a<b.length;
a++){if(c>=b.start(a)&&c<=b.end(a)){return true
}}}return false
},checkBuffered:function(c){var b=this.video.buffered;
if(b&&b.length){for(var a=0;
a<b.length;
a++){if(c>=b.start(a)&&c<=b.end(a)){return true
}}}return false
},destroy:function(){this.buildListenerChain();
this.removeProgressListeners();
this.video.removeEventListener("seeking",this.seekingListener);
this.video.removeEventListener("seeked",this.seekedListener);
clearInterval(this.seekTimer)
}});
var RELEASE_WAIT_TIME=250;
var STANDBY_WAIT_TIME=100;
StandbyManager=Class.extend({init:function(b,a){this.controller=b;
this.pbm=a;
var c=this;
this.controller.addEventListener("OnLoadRelease",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnReleaseSelected",function(f){c.checkStandbyRS(f)
});
this.controller.addEventListener("OnPlugInsComplete",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnLoadSmil",function(f){c.checkStandby(f)
});
this.controller.addEventListener("OnMediaEnd",function(f){c.playing=false
});
this.controller.addEventListener("OnMediaStart",function(f){c.playing=true
});
this.controller.addEventListener("OnReleaseEnd",function(f){tpDebug("StandbyManager got "+f.type);
c.playing=false;
c.checkStandbyRE(f)
});
this.controller.addEventListener("OnSetReleaseUrl",function(f){c.endStandby(f)
});
this.controller.addEventListener("OnResetPlayer",function(f){c.endStandby(f)
});
this.timerdelay=RELEASE_WAIT_TIME;
this.timerrunning=true;
this.startTimer();
this.releaseEnded=false;
this.lastClip=null;
var d=this.controller.getProperty("endCard");
if(d){this.endCardID=d
}},checkStandby:function(a){this.toWarm=false;
this.stopTimer();
this.timerdelay=STANDBY_WAIT_TIME;
tpDebug("Starting standby timer for "+a.type);
this.startTimer();
this.setStandby(true)
},checkStandbyRS:function(a){tpDebug("release selected "+a);
this.releaseEnded=false;
this.stopTimer()
},checkStandbyRE:function(a){this.lastClip=a.data;
this.toWarm=true;
this.releaseEnded=true;
this.stopTimer();
var b=(this.controller.getProperty("relateditemsURL")!=null||this.controller.getProperty("endCard")!=null);
if(!b){this.timerdelay=RELEASE_WAIT_TIME;
tpDebug("Starting timer for "+a.type);
this.startTimer();
this.setStandby(true)
}},endStandby:function(a){this.toWarm=false;
this.releaseEnded=false;
this.setStandby(false)
},startTimer:function(){var a=this;
this.timerrunning=true;
this.timer=setTimeout(function(){a.standbyTick()
},this.timerdelay)
},stopTimer:function(){clearTimeout(this.timer);
this.timerrunning=false
},setStandby:function(a){if(a){if(!this.timerrunning){tpDebug("Starting timer because it was running");
this.startTimer()
}}else{this.doRemoveStandby()
}},checkIfEndCardExists:function(c){var b=this.controller.getProperty("endCard");
if(b){this.endCardID=b
}var a=(this.controller.getProperty("relateditemsURL")!=null||b!=null);
if(a&&b){return true
}else{return false
}},doStartStandby:function(){tpDebug("doing startStandby");
if(this.playing==true){return
}this.isStandBy=true;
var e=this.controller.getProperty("endCard");
if(e){this.endCardID=e
}var a=(this.controller.getProperty("relateditemsURL")!=null||e!=null);
var d=this.controller.getCard("forms",this.endCardId);
if((this.endCardID==null||!this.releaseEnded||!a||!d)){tpDebug("dispatching OnShowPlayOverlay");
this.controller.dispatchEvent(PdkEvent.OnShowPlayOverlay,true);
this.controller.dispatchEvent(PdkEvent.OnShowPreviewImageOverlay,true)
}else{this.controller.dispatchEvent(PdkEvent.OnShowPreviewImageOverlay,true);
this.controller.dispatchEvent(PdkEvent.OnShowPlayOverlay,true);
tpDebug("call to show card");
this.controller.showCard("forms",this.endCardID,"Enable")
}var b;
var c=this;
this.playingListener=function(f){c.controller.removeEventListener("OnMediaPlaying",c.playingListener);
if(c.isStandBy){tpDebug("playingListener hiding overlay");
c.isStandBy=false
}};
this.controller.addEventListener("OnMediaPlaying",this.playingListener,true)
},doShowCard:function(d,f,c,b,e,a){if(f==this.cardID&&c!="Enable"){this.controller.dispatchEvent(PdkEvent.OnShowPlayOverlay,true)
}},doRemoveStandby:function(){if(this.timerrunning){this.stopTimer();
tpDebug("Starting timer because it was running");
this.startTimer()
}if(this.isStandby){this.isStandby=false;
this.controller.dispatchEvent("OnShowPlayOverlay",false)
}},standbyTick:function(){this.doStartStandby()
},clickPlayButton:function(){this.pbm.executeCurrentRelease()
}});
SubtitlesManager=Class.extend({init:function(a){this.controller=a;
this.controller.registerFunction("setSubtitleLanguage",this,this.setSubtitleLanguage);
this.controller.registerFunction("getSubtitleLanguage",this,this.getSubtitleLanguage);
this.controller.registerFunction("setShowSubtitles",this,this.setShowSubtitles);
this.realManager=com.theplatform.pdk.SubtitlesManagerExported.createSubtitlesManagerInstance();
this.showSubtitles=this.controller.getProperty("showSubtitles");
if(this.showSubtitles===undefined){this.showSubtitles=true
}var b=this;
this.controller.addEventListener("OnPlayerLoaded",function(){b.setShowSubtitles(b.showSubtitles)
});
this.mediaLoadStartListener=function(c){b.onMediaLoadStart(c)
};
this.mediaStartListener=function(c){b.onMediaStart(c)
};
this.mediaEndListener=function(c){b.onMediaEnd(c)
};
this.mediaPlayingListener=function(c){b.onMediaPlaying(c)
};
this.mediaSeekListener=function(c){b.onMediaSeek(c)
};
this.mediaErrorListener=function(c){b.onMediaError(c)
};
this.releaseEndListener=function(c){b.onReleaseEnd(c)
};
this.controller.addEventListener("OnMediaLoadStart",this.mediaLoadStartListener);
this.controller.addEventListener("OnMediaStart",this.mediaStartListener);
this.controller.addEventListener("OnMediaSeek",this.mediaSeekListener);
this.controller.addEventListener("OnMediaPlaying",this.mediaPlayingListener);
this.controller.addEventListener("OnMediaError",this.mediaErrorListener);
this.controller.addEventListener("OnReleaseEnd",this.releaseEndListener);
this.cuePointsListener=function(d,c){b.gotCuePoints(d,c)
};
this.timelineProcesses={}
},setShowSubtitles:function(a){if(!this.presenter&&a){var b=document.getElementById(this.controller.id+".subtitles");
var c=this.controller.getOverlayArea();
this.presenter=new SubtitlesPresenter(this.controller,new $pdk.subtitles.SubtitlesView({element:b,properties:{fullscreenSubtitleScale:this.controller.getProperty("fullscreenSubtitleScale"),overlayRect:c}}))
}if(this.presenter){this.presenter.setShowSubtitles(a)
}},onMediaLoadStart:function(a){},gotCuePoints:function(a,b){if(!a||a.length<=0||b.id!==this.currentBaseClipId){return
}tpDebug({testId:"SUBTITLES_MANAGER_GOT_CUEPOINTS",data:{cuePoints:a}},this.controller.id,"SubtitlesManager",tpConsts.TEST);
if(!this.timelineProcesses){this.timelineProcesses={}
}this.timelineProcesses[this.currentBaseClipId]=com.theplatform.pdk.TimelineProcessExported.createTimelineProcess(a);
if(this.currentTime>=0){this.checkTimeline({mediaTime:this.currentTime})
}this.addListeners()
},onMediaStart:function(g){var f=g.data.baseClip;
this.currentBaseClip=f;
this.currentTime=g.data.mediaTime;
var h=this.realManager.getSubtitleLanguage();
if(h&&h.length>0){var a=this.getSubtitleFromLang(f.availableSubtitles,h)
}if(f.id!==this.currentBaseClipId){this.currentBaseClipId=f.id;
if(!this.timelineProcesses[this.currentBaseClipId]){if(a){var c=this;
this.realManager.getCuePoints(a,function(e){c.cuePointsListener(e,f)
})
}}else{if(a){var b=g.data;
var d=this.timelineProcesses[this.currentBaseClipId].setCurrentTime(b.startTime+b.offset+350);
if(d===null||d===undefined){d=this.timelineProcesses[this.currentBaseClipId].getCurrentCuePoint()
}this.broadcastCuePointData(d);
this.addListeners()
}}}else{if(this.timelineProcesses[this.currentBaseClipId]&&a){var b=g.data;
var d=this.timelineProcesses[this.currentBaseClipId].setCurrentTime(b.startTime+b.offset+350);
if(d===null||d===undefined){d=this.timelineProcesses[this.currentBaseClipId].getCurrentCuePoint()
}this.broadcastCuePointData(d)
}}if(a){this.broadcastSubtitleLanguage(a.language,false)
}},onMediaEnd:function(b){if(this.timelineProcesses[this.currentBaseClipId]){var a={globalDataType:"com.theplatform.pdk.data::CuePoint",start:b.data.mediaTime,content:""};
this.broadcastCuePointData(a)
}this.currentTime=-1
},onMediaSeek:function(a){this.currentTime=a.data.end.mediaTime;
this.checkTimeline(a.data.end)
},checkTimeline:function(b){if(!this.timelineProcesses[this.currentBaseClipId]){return
}var a=this.timelineProcesses[this.currentBaseClipId].setCurrentTime(b.mediaTime+350);
if(a){this.broadcastCuePointData(a)
}else{}},onMediaPlaying:function(a){this.currentTime=a.data.mediaTime;
this.checkTimeline(a.data)
},onReleaseEnd:function(a){this.tearDownProcesses()
},tearDownProcesses:function(){this.removeListeners();
this.currentBaseClip=undefined;
this.currentBaseClipId=undefined;
this.currentTime=-1;
this.timelineProcesses={}
},onMediaError:function(a){this.tearDownProcesses()
},broadcastCuePointData:function(a){tpDebug("sending event: OnSubtitleCuePoint ["+a.start+"]["+a.content+"]","SubtitlesManager");
this.controller.dispatchEvent("OnSubtitleCuePoint",a)
},setSubtitleLanguage:function(e){var c=this.realManager.getSubtitleLanguage();
var d=false;
if(e!==c){this.timelineProcesses={};
this.realManager.setSubtitleLanguage(e);
d=true;
if(this.currentBaseClip){var a=this.getSubtitleFromLang(this.currentBaseClip.availableSubtitles,e);
if(a){var b=this;
this.realManager.getCuePoints(a,function(f){b.cuePointsListener(f,b.currentBaseClip)
})
}else{this.broadcastCuePointData({globalDataType:"com.theplatform.pdk.data::CuePoint",start:this.currentTime,content:""});
this.removeListeners();
this.timelineProcesses[this.currentBaseClipId]=undefined
}}}if(e==null||e===""||e=="none"){e="none";
if(c==null||c==""||c=="none"||c=="null"){d=false
}if(this.currentTime!==-1){this.broadcastCuePointData({globalDataType:"com.theplatform.pdk.data::CuePoint",start:this.currentTime,content:""})
}}this.broadcastSubtitleLanguage(e,d)
},addListeners:function(){this.controller.addEventListener("OnMediaEnd",this.mediaEndListener)
},removeListeners:function(){this.controller.removeEventListener("OnMediaEnd",this.mediaEndListener)
},getSubtitleFromLang:function(b,c){for(var a=0;
a<b.length;
a++){if(b[a].language===c){return b[a]
}}return null
},getSubtitleLanguage:function(a){var b=this.realManager.getSubtitleLanguage();
if(!b||b===""){b="none"
}this.broadcastSubtitleLanguage(b,false,a)
},broadcastSubtitleLanguage:function(d,b,a){tpDebug("sending event:OnGetSubtitleLanguage lang="+d+" wasChanged="+b+" requestor="+a,"Preferences");
if(a===undefined){a=""
}var c={globalDataType:"com.theplatform.pdk.data::SubtitlePref",langCode:d,wasChanged:b,requestor:a};
this.controller.dispatchEvent("OnGetSubtitleLanguage",c)
}});
SubtitlesPresenter=Class.extend({init:function(b,a){this.controller=b;
this.view=a;
var c=this;
this.subtitleCuePointListener=function(d){c.onSubtitleCuePoint(d)
};
this.fullScreenListener=function(d){c.onShowFullScreen(d)
};
this.overlayChangeListener=function(d){c.onOverlayAreaChanged(d)
};
this.controller.addEventListener("OnSubtitleCuePoint",this.subtitleCuePointListener);
this.controller.addEventListener("OnShowFullScreen",this.fullScreenListener);
this.controller.addEventListener("OnOverlayAreaChanged",this.overlayChangeListener)
},setShowSubtitles:function(a){this.showSubtitles=a;
if(!a){this.view.setText("");
this.view.hide()
}else{if(this.currentSub){this.view.setText(this.currentSub)
}this.view.show()
}},setText:function(a){tpDebug({testId:"SUBTITLES_SHOWN_IN_VIEW",data:a},this.controller.id,"SubtitlesPresenter",tpConsts.TEST);
this.view.setText(this.currentSub)
},onSubtitleCuePoint:function(b){this.currentSub=b.data.content;
if(this.showSubtitles){if(this.currentSub&&this.currentSub!=""){this.setText(this.currentSub)
}else{var a=this;
setTimeout(function(){if(!a.currentSub||a.currentSub===""){a.setText("")
}},300)
}}},startClear:function(){},onOverlayAreaChanged:function(a){this.view.updateLayout(a.data)
},onShowFullScreen:function(a){this.view.updateLayout(this.controller.getOverlayArea());
this.view.setFullScreen(a.data)
}});
TokenManager=Class.extend({init:function(a){this.controller=a;
this.controller.registerFunction("setToken",this,this.setToken)
},setToken:function(a,b){this.controller.dispatchEvent("OnSetToken",{token:a,type:b,globalDataType:"com.theplatform.pdk.data::TokenInfo"})
}});
UrlManager=Class.extend({init:function(a){this.controller=a;
this.plugins=[];
this._currentQueue=[];
this.totalUrlPluginsRegistered=0;
this.totalUrlPluginsLoaded=0;
this.controller.registerFunction("registerURLPlugIn",this,this.registerURLPlugIn);
this.controller.registerFunction("setClip",this,this.setClip)
},checkClip:function(a,b){this._context={clip:a,callback:b,complete:false,found:false};
this._currentQueue=this.plugins.concat();
if(this._currentQueue.length===0){b(a);
return true
}else{if(!this._processNextPlugin()){b(a)
}return false
}},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.component.rewriteURL(this._context.clip)
}this._context.found=b?true:this._context.found;
return this._context.found
},registerURLPlugIn:function(b,c,a){a=parseInt(a);
this.plugins.push({component:b,urlType:c,priority:(isNaN(a)?1000:a)});
this.totalUrlPluginsRegistered++;
this.plugins.sort(this.compare)
},setClip:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.clip=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.clip=a;
if(!this._processNextPlugin()){this.setClip(a)
}}},compare:function(d,c){return d.priority-c.priority
}});
function tpGetPreferredFormat(){var b="MPEG4";
var a=document.createElement("video");
if(!a.canPlayType){b="FLV"
}else{if(a.canPlayType("video/mp4")){b="MPEG4"
}else{if(a.canPlayType("video/ogg")){b="Ogg"
}}}return b
}function tpIsAndroid(){if(navigator.userAgent.match(/iPhone/i)){return false
}else{if(navigator.userAgent.match(/Android/i)){return true
}else{return false
}}}function tpIsIOS(){if(navigator.userAgent.match(/iPad/i)){return true
}if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpIsIPhone(){if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpIsIOS4(){if(navigator.userAgent.match(/iPad/i)&&navigator.userAgent.match(/4_/i)){return true
}else{return false
}}function tpGetPid(b){var c=b;
if(c&&c.indexOf("pid=")==-1){c=c.substring(c.lastIndexOf("/")+1);
var a=c.indexOf("?");
if(a>0){c=c.substring(0,a)
}}else{if(c){c=c.substring(c.indexOf("pid=")+4);
var a=c.indexOf("&");
if(a>0){c=c.substring(0,a)
}}}return c
}function tpGetInstanceID(){if(window.tpInstanceID!==undefined){return tpInstanceID
}else{return""
}}function tpIsRegistered(b){for(var a=0;
a<registeredIDs.length;
a++){if(registeredIDs[a]==b){return true
}}return false
}function tpHasReleaseList(){if($pdk!==undefined){var b=$pdk.shell.Registry.getInstance().getShells().toArray();
for(var a=0;
a<b.length;
a++){if(b[a].getName()==="ReleaseList"){return true
}}}if(tpIsRegistered("releaselist")){return true
}return false
}if(window["$pdk"]===undefined){tpControllerClass=function(){this.ready=function(){this.isHTML5Loading=false;
this.checkMessageQueue()
};
this.sendMessage=function(destination,message,skipBus){var sendObj=new Object();
sendObj.message=message;
sendObj.destination=destination;
if((this.isLegacyLoading||this.isHTML5Loading)&&!skipBus){this.messageQueue.push(sendObj)
}else{if(!this.canMessage){this.priorityQueue.push(sendObj)
}else{this.doSendMessage(sendObj)
}}};
var isSafariWin=(navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1);
this.doSendMessage=function(sendObj){if(this.isShutDown){return
}var obj=tpThisMovie(sendObj.destination);
if(sendObj.message.name==="callFunction"&&sendObj.message.payload.name==="showFullScreen"&&sendObj.message.payload.args[0]===true&&obj.tagName&&(obj.tagName.toLowerCase()==="object"||obj.tagName.toLowerCase()==="embed")){tpDebug("Switching to full screen from Javascript is not supported by the Flash run-time. Flash only allows you to go to full screen mode via a click in the player itself.","tpController","Controller","error");
return
}try{if(!isSafariWin){obj.executeMessage(sendObj.message)
}else{setTimeout(function(){obj.executeMessage(sendObj.message)
},1)
}}catch(e){}if(sendObj.message.name=="dispatchEvent"){tpController.doDispatchEvent(sendObj.message.payload.evt)
}};
this.checkMessageQueue=function(){if(this.isLegacyLoading||this.isHTML5Loading){return
}var len=this.messageQueue.length;
while(this.messageQueue.length>0){this.doSendMessage(this.messageQueue.shift())
}};
this.checkPriorityQueue=function(){while(this.priorityQueue.length>0){var sendObj=this.priorityQueue.shift();
if(sendObj.destination=="unknown"){sendObj.destination=tpBridgeID
}this.doSendMessage(sendObj)
}};
this.wrapMessage=function(messageName,payload){var comm={globalDataType:this.getDataTypeName("CommInfo"),id:"javascript"};
var message={globalDataType:this.getDataTypeName("MessageInfo"),name:messageName,payload:payload,comm:comm};
return message
};
this.getDataTypeName=function(shortType){switch(shortType){case"AdPattern":return"com.theplatform.pdk.data::AdPattern";
case"Banner":return"com.theplatform.pdk.data::Banner";
case"BaseClip":return"com.theplatform.pdk.data::BaseClip";
case"CallInfo":return"com.theplatform.pdk.communication::CallInfo";
case"CategoryInfo":return"com.theplatform.pdk.data::CategoryInfo";
case"Clip":return"com.theplatform.pdk.data::Clip";
case"CommInfo":return"com.theplatform.pdk.communication::CommInfo";
case"CustomData":return"com.theplatform.pdk.data::CustomData";
case"CustomValue":return"com.theplatform.pdk.data::CustomValue";
case"DispatchInfo":return"com.theplatform.pdk.communication::DispatchInfo";
case"FunctionInfo":return"com.theplatform.pdk.communication::FunctionInfo";
case"HandlerInfo":return"com.theplatform.pdk.communication::HandlerInfo";
case"HyperLink":return"com.theplatform.pdk.data::HyperLink";
case"MediaClick":return"com.theplatform.pdk.data::MediaClick";
case"MediaFile":return"com.theplatform.pdk.data::MediaFile";
case"MessageInfo":return"com.theplatform.pdk.communication::MessageInfo";
case"MetricInfo":return"com.theplatform.pdk.data::MetricInfo";
case"Overlay":return"com.theplatform.pdk.data::Overlay";
case"PdkEvent":return"com.theplatform.pdk.events::PdkEvent";
case"ProviderInfo":return"com.theplatform.pdk.data::ProviderInfo";
case"Range":return"com.theplatform.pdk.data::Range";
case"Rating":return"com.theplatform.pdk.data::Rating";
case"Release":return"com.theplatform.pdk.data::Release";
case"ReleaseInfo":return"com.theplatform.pdk.data::ReleaseInfo";
case"ScopeInfo":return"com.theplatform.pdk.communication::ScopeInfo";
case"Sort":return"com.theplatform.pdk.data::Sort";
case"Subtitles":return"com.theplatform.pdk.data::Subtitles";
case"TrackingUrl":return"com.theplatform.pdk.data::TrackingUrl";
case"BandwidthPreferences":return"com.theplatform.pdk.data::BandwidthPreferences"
}};
this.createScope=function(scope){if(scope==undefined){return this.defaultScope
}else{if(scope.scopeIds){scope.scopeIds.push("javascript");
return scope
}else{scope.push("javascript");
return{globalDataType:this.getDataTypeName("ScopeInfo"),controlId:"javascript",isGlobal:true,isAny:false,isEmpty:false,scopeIds:scope}
}}};
this.registerFunction=function(funcName,callback,scopes,informCommManager){var scopeObj=this.createScope(scopes);
var informComm=informCommManager===undefined?false:informCommManager;
if(this.functions[funcName]==undefined){this.functions[funcName]=new Object();
informComm=true
}for(var i=0;
i<scopeObj.scopeIds.length;
i++){var s=scopeObj.scopeIds[i];
if(s=="*"){return
}this.functions[funcName][s]=callback
}if(informComm){var func={globalDataType:this.getDataTypeName("FunctionInfo"),name:funcName,scope:scopeObj};
var message=this.wrapMessage("registerFunction",func);
this.sendMessage(tpBridgeID,message,true)
}};
this.unregisterFunction=function(funcName,scope){var scopeObj=this.createScope(scopes);
if(this.functions[funcName]!=undefined){var funcs=this.functions[funcName];
for(var i=0;
i<scopeObj.scopeIds.length;
i++){var s=scopeObj.scopeIds[i];
if(s=="*"){delete funcs;
break
}if(funcs[s]!=undefined){delete funcs[s]
}}var funcsLeft=false;
if(funcs!=undefined){for(var sc in funcs){funcsLeft=true;
break
}if(!funcsLeft){delete this.functions[funcName]
}}}if(!funcsLeft){var func={globalDataType:this.getDataTypeName("FunctionInfo"),name:funcName,scope:scopeObj};
var message=this.wrapMessage("unregisterFunction",func);
this.sendMessage(tpBridgeID,message,true)
}};
this.addEventListener=function(eventName,callback,scope){var scopeObj=this.createScope(scope);
var handler={globalDataType:this.getDataTypeName("HandlerInfo"),name:eventName,handler:callback,scope:scopeObj};
var informComm=false;
if(this.events[eventName]==undefined){this.events[eventName]=new Array();
informComm=true
}var evts=this.events[eventName];
var repeat=false;
for(var i=0;
i<evts.length;
i++){if(evts[i].handler==callback){evts[i]=handler;
repeat=true;
break
}}if(!repeat){evts.push(handler)
}if(informComm){var message=this.wrapMessage("addEventListener",handler);
this.sendMessage(tpBridgeID,message,true)
}};
this.removeEventListener=function(eventName,callback,scope){if(this.events[eventName]!=undefined){var scopeObj=this.createScope(scope);
var handler={globalDataType:this.getDataTypeName("HandlerInfo"),name:eventName,handler:callback,scope:scopeObj};
var eventArray=this.events[eventName];
for(var i=0;
i<eventArray.length;
i++){var h=eventArray[i];
if(h.handler==handler.handler){eventArray=eventArray.splice(i,1);
break
}}if(eventArray.length==0){delete this.events[eventName];
var message=this.wrapMessage("removeEventListener",handler);
this.sendMessage(tpBridgeID,message,true)
}}};
this.dispatchEvent=function(eventName,value,scope){var scopeObj=this.createScope(scope);
var evt={globalDataType:this.getDataTypeName("PdkEvent"),type:eventName,data:value};
var dispatch={globalDataType:this.getDataTypeName("DispatchInfo"),evt:evt,scope:scopeObj};
this.doDispatchEvent(dispatch);
var message=this.wrapMessage("dispatchEvent",dispatch);
this.sendMessage(tpBridgeID,message,true)
};
this.callFunction=function(funcName,args,scope){var scopeObj=this.createScope(scope);
var call={globalDataType:this.getDataTypeName("CallInfo"),name:funcName,args:args,scope:scopeObj};
var ret=this.doCallFunction(call);
var message=this.wrapMessage("callFunction",call);
this.sendMessage(tpBridgeID,message,true);
return ret
};
this.doDispatchEvent=function(dispatch){if(this.events[dispatch.evt.type]!=undefined){var handlers=this.events[dispatch.evt.type];
for(var i=0;
i<handlers.length;
i++){var handler=handlers[i];
if(dispatch.scope.isAny){eval(handler.handler)(dispatch.evt);
continue
}for(var j=0;
j<handler.scope.scopeIds.length;
j++){var s=handler.scope.scopeIds[j];
var fired=false;
if(s=="*"){eval(handler.handler)(dispatch.evt);
break
}for(var k=0;
k<dispatch.scope.scopeIds.length;
k++){tpDebug("running through scopes handler: "+s+" dispatch: "+dispatch.scope.scopeIds[k]);
if(s==dispatch.scope.scopeIds[k]){fired=true;
tpDebug("firing");
eval(handler.handler)(dispatch.evt);
break
}}if(fired){break
}}}}};
this.doCallFunction=function(call){if(this.functions[call.name]!=undefined){var funcsToCall=new Object();
for(var i=0;
i<call.scope.scopeIds.length;
i++){var s=call.scope.scopeIds[i];
if(this.functions[call.name][s]!=undefined){funcsToCall[this.functions[call.name][s]]="f"
}}var ret;
for(var f in funcsToCall){ret=eval(f)(call.args)
}return ret
}};
this.receiveMessage=function(destination,message){if(destination=="javascript"){var messStr=message.name;
switch(messStr){case"commReady":tpBridgeID=tpCommID;
this.canMessage=true;
this.checkPriorityQueue();
break;
case"bridgeReady":tpBridgeID=message.comm.id;
this.canMessage=true;
this.checkPriorityQueue();
break;
case"dispatchEvent":var dispatch=message.payload;
this.receiveEvent(dispatch);
break;
case"callFunction":var call=message.payload;
tpController.doCallFunction(call);
break;
default:break
}}else{this.sendMessage(destination,message,true)
}};
this.receiveEvent=function(dispatch){if(dispatch.evt.type=="OnPlayerLoaded"){this.isLegacyLoading=false;
this.checkMessageQueue()
}this.doDispatchEvent(dispatch)
};
this.setRelease=function(release,replaceDefault,scope){release=this.modRelease(release);
this.callFunction("setRelease",[release,replaceDefault],scope)
};
this.loadRelease=function(release,replaceDefault,scope){release=this.modRelease(release);
this.callFunction("loadRelease",[release,replaceDefault],scope)
};
this.loadReleaseURL=function(releaseURL,replaceDefault,scope){this.callFunction("loadReleaseURL",[releaseURL,replaceDefault],scope)
};
this.setReleaseURL=function(url,replaceDefault,scope){this.callFunction("setReleaseURL",[url,replaceDefault],scope)
};
this.loadSmil=function(smil,replaceDefault,scope){if(replaceDefault==undefined){replaceDefault=true
}this.callFunction("loadSmil",[smil,replaceDefault],scope)
};
this.setSmil=function(smil,scope){this.callFunction("setSmil",[smil],scope)
};
this.resetPlayer=function(scope){this.callFunction("resetPlayer",[],scope)
};
this.setPlayerMessage=function(message,showDuration,scope){if(showDuration==undefined){showDuration=5000
}this.callFunction("setPlayerMessage",[message,showDuration],scope)
};
this.clearPlayerMessage=function(scope){this.callFunction("clearPlayerMessage",[],scope)
};
this.setCurrentReleaseList=function(id,scope){this.callFunction("setCurrentReleaseList",[id],scope)
};
this.seekToPosition=function(position,scope){this.callFunction("seekToPosition",[position],scope)
};
this.seekToPercentage=function(percent,scope){this.callFunction("seekToPercentage",[percent],scope)
};
this.nextClip=function(scope){this.callFunction("nextClip",[],scope)
};
this.previousClip=function(scope){this.callFunction("previousClip",[],scope)
};
this.mute=function(muted,scope){this.callFunction("mute",[muted],scope)
};
this.pause=function(paused,scope){this.callFunction("pause",[paused],scope)
};
this.setPreviewImageUrl=function(url,scope){this.callFunction("setPreviewImageUrl",[url],scope)
};
this.showFullScreen=function(isFullScreen,scope){if(isFullScreen){tpDebug("Switching to full screen from Javascript is not supported by the Flash run-time. Flash only allows you to go to full screen mode via a click in the player itself.","tpController","Controller","error")
}else{this.callFunction("showFullScreen",[isFullScreen],scope)
}};
this.showEmailForm=function(visible,scope){this.callFunction("showEmailForm",[visible],scope)
};
this.showLinkForm=function(visible,scope){this.callFunction("showLinkForm",[visible],scope)
};
this.trace=function(str,className,level){this.callFunction("trace",[str,className,level],null)
};
this.useDefaultPlayOverlay=function(useDefault,scope){this.callFunction("useDefaultPlayOverlay",[useDefault],scope)
};
this.getUseDefaultPlayOverlay=function(scope){this.callFunction("getUseDefaultPlayOverlay",[],scope)
};
this.useDefaultLinkForm=function(useDefault,scope){this.callFunction("useDefaultLinkForm",[useDefault],scope)
};
this.useDefaultEmailForm=function(useDefault,scope){this.callFunction("useDefaultEmailForm",[useDefault],scope)
};
this.getSubtitleLanguage=function(requestor,scope){this.callFunction("getSubtitleLanguage",[requestor],scope)
};
this.clickPlayButton=function(scope){this.callFunction("clickPlayButton",[],scope)
};
this.disablePlayerControls=function(disable,exceptions,scope){this.callFunction("disablePlayerControls",[disable,exceptions],scope)
};
this.hidePlayerRegions=function(hide,exceptions,scope){this.callFunction("hidePlayerRegions",[hide,exceptions],scope)
};
this.setSubtitleLanguage=function(language,scope){this.callFunction("setSubtitleLanguage",[language],scope)
};
this.getPlayerVariables=function(names,scope){this.callFunction("getPlayerVariables",[names],scope)
};
this.setVolume=function(volume,scope){this.callFunction("setVolume",[volume],scope)
};
this.clearAdCookie=function(scope){this.callFunction("clearAdCookie",[],scope)
};
this.setBandwidthPreferences=function(bandwidthPreferences,scope){if(bandwidthPreferences){bandwidthPreferences.globalDataType=this.getDataTypeName("BandwidthPreferences")
}this.callFunction("setBandwidthPreferences",[bandwidthPreferences],scope)
};
this.getBandwidthPreferences=function(scope){this.callFunction("getBandwidthPreferences",[],scope)
};
this.setVideoScalingMethod=function(method,scope){this.callFunction("setVideoScalingMethod",[method],scope)
};
this.setExpandVideo=function(expand,scope){this.callFunction("setExpandVideo",[expand],scope)
};
this.showPlayerCard=function(deckId,cardId,otherCardAction,parentCardId,animation,scope){this.callFunction("showPlayerCard",[deckId,cardId,otherCardAction,parentCardId,animation],scope)
};
this.hidePlayerCard=function(deckId,animation,scope){this.callFunction("hidePlayerCard",[deckId,animation],scope)
};
this.refreshReleaseModel=function(category,search,sort,range,params,secondaryParams,scope,mediaIds,feedUrl){if(sort){sort.globalDataType=this.getDataTypeName("Sort")
}if(range){range.globalDataType=this.getDataTypeName("Range")
}this.callFunction("refreshReleaseModel",[category,search,sort,range,params,secondaryParams,mediaIds,feedUrl],scope)
};
this.refreshCategoryModel=function(params,scope,feedUrl){this.callFunction("refreshCategoryModel",[params,feedUrl],scope)
};
this.nextRange=function(scope){this.callFunction("nextRange",[],scope)
};
this.previousRange=function(scope){this.callFunction("previousRange",[],scope)
};
this.firstRange=function(scope){this.callFunction("firstRange",[],scope)
};
this.setToken=function(token,type,scope){this.callFunction("setToken",[token,type],scope)
};
this.setClipInfo=function(clip,isDefault,scope){clip=this.modClip(clip);
this.callFunction("setClipInfo",[clip,isDefault],scope)
};
this.clearCategorySelection=function(scope){this.callFunction("clearCategorySelection",[],scope)
};
this.suspendPlayAll=function(suspend,scope){this.callFunction("suspendPlayAll",[suspend],scope)
};
this.playNext=function(wrapAround,naturalEnd,scope){this.callFunction("playNext",[wrapAround,naturalEnd],scope)
};
this.playPrevious=function(wrapAround,scope){this.callFunction("playPrevious",[wrapAround],scope)
};
this.modRelease=function(release){if(release){release.globalDataType=this.getDataTypeName("Release");
if(release.categories){release.categories=this.modCategories(release.categories)
}if(release.thumbnails){for(var i=0;
i<release.thumbnails.length;
i++){release.thumbnails[i].globalDataType=this.getDataTypeName("MediaFile");
if(release.thumbnails[i].customValues){release.thumbnails[i].customValues=this.modCustomValues(release.thumbnails[i].customValues)
}}}if(release.customValues){release.customValues=this.modCustomValues(release.customValues)
}if(release.metrics){for(var i=0;
i<release.metrics.length;
i++){release.metrics[i].globalDataType=this.getDataTypeName("MetricInfo")
}}if(release.provider){release.provider.globalDataType=this.getDataTypeName("ProviderInfo");
if(release.provider.customValues){release.provider.customValues=this.modCustomValues(release.provider.customValues)
}}if(release.ratings){for(var i=0;
i<release.ratings.length;
i++){release.ratings[i].globalDataType=this.getDataTypeName("Rating")
}}if(release.URL){release.url=release.URL
}}return release
};
this.modCustomValues=function(customValues){for(var i=0;
i<customValues.length;
i++){customValues[i].globalDataType=this.getDataTypeName("CustomValue")
}return customValues
};
this.modCategories=function(categories){for(var i=0;
i<categories.length;
i++){categories[i].globalDataType=this.getDataTypeName("CategoryInfo")
}return categories
};
this.modClip=function(clip){if(clip){clip.globalDataType=this.getDataTypeName("Clip");
var baseClip=clip.baseClip;
if(!baseClip){baseClip=new Object()
}if(clip.banners){baseClip.banners=clip.banners
}if(clip.overlays){baseClip.overlays=clip.overlays
}clip.baseClip=this.modBaseClip(baseClip);
if(clip.chapter){clip.chapter.globalDataType=this.getDataTypeName("Chapter")
}}return clip
};
this.modBaseClip=function(baseClip){if(!baseClip){baseClip=new Object()
}baseClip.globalDataType=this.getDataTypeName("BaseClip");
if(baseClip.moreInfo){baseClip.moreInfo.globalDataType=this.getDataTypeName("HyperLink");
if(baseClip.moreInfo.clickTrackingUrls){baseClip.moreInfo.clickTrackingUrls=this.modTracking(baseClip.moreInfo.clickTrackingUrls)
}}if(baseClip.banners){for(var i=0;
i<baseClip.banners.length;
i++){baseClip.banners[i].globalDataType=this.getDataTypeName("Banner");
if(baseClip.banners[i].clickTrackingUrls){baseClip.banners[i].clickTrackingUrls=this.modTracking(baseClip.banners[i].clickTrackingUrls)
}}}if(baseClip.overlays){for(var i=0;
i<baseClip.overlays.length;
i++){baseClip.overlays[i].globalDataType=this.getDataTypeName("Overlay");
if(baseClip.overlays[i].clickTrackingUrls){baseClip.overlays[i].clickTrackingUrls=this.modTracking(baseClip.overlays[i].clickTrackingUrls)
}}}if(baseClip.availableSubtitles){for(var i=0;
i<baseClip.availableSubtitles;
i++){baseClip.availableSubtitles[i].globalDataType=this.getDataTypeName("Subtitles")
}}if(baseClip.categories){baseClip.categories=this.modCategories(baseClip.categories)
}if(baseClip.adPattern){baseClip.adPattern.globalDataType=this.getDataTypeName("AdPattern")
}if(baseClip.trackingURLs){baseClip.trackingURLs=this.modTracking(baseClip.trackingURLs)
}if(baseClip.contentCustomData){baseClip.contentCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(baseClip.ownerCustomData){baseClip.ownerCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(baseClip.outletCustomData){baseClip.outletCustomData.globalDataType=this.getDataTypeName("CustomData")
}return baseClip
};
this.modTracking=function(trackingUrls){for(var i=0;
i<trackingUrls.length;
i++){trackingUrls.globalDataType=this.getDataTypeName("TrackingUrl")
}return trackingUrls
};
this.shutDown=function(){var args=[];
this.callFunction("shutDown",args,["*"]);
this.isShutDown=true
};
this.events=new Object();
this.functions=new Object();
this.isLegacyLoading=true;
this.isHTML5Loading=true;
this.canMessage=false;
this.messageQueue=new Array();
this.priorityQueue=new Array();
this.sendQueue=new Array();
this.isSending=false;
this.sendInterval;
this.shutdownIDs;
this.isShutDown=false;
this.blankString="__blank_string__";
this.defaultScope={globalDataType:this.getDataTypeName("ScopeInfo"),controlId:"javascript",isGlobal:true,isAny:false,isEmpty:false,scopeIds:["javascript","default"]}
}
}else{tpControllerClass=$pdk.queue.Controller
}tpScriptLoader=new ScriptLoader();
function tpLoadJScript(a,d,c,b){tpScriptLoader.addScript(a,d,c,b)
}function callbackDispatcher(a){tpScriptLoader.callbackDispatcher(a)
}function invokeCallbacks(a){tpScriptLoader.invokeCallbacks()
}function LoadObj(a,d,c,b){this.script=a;
this.callback=d;
this.id=c;
this.atts=b
}function ScriptLoader(){this.scriptQueue=new Array();
this.callbackQueue=new Array()
}ScriptLoader.prototype.addScript=function(a,e,d,c){var b=new LoadObj(a,e,d,c);
this.scriptQueue.push(b);
if(this.scriptQueue.length==1){this.checkScriptQueue()
}};
ScriptLoader.prototype.checkScriptQueue=function(){if(this.scriptQueue.length){var a=this.scriptQueue.shift();
this.loadScript(a)
}else{interval_id=setInterval("invokeCallbacks()",100)
}};
ScriptLoader.prototype.callbackDispatcher=function(b){for(var a in this.callbackQueue){if(this.callbackQueue[a]==b){this.checkScriptQueue();
return
}}this.callbackQueue.push(b);
this.checkScriptQueue()
};
ScriptLoader.prototype.invokeCallbacks=function(){clearInterval(interval_id);
while(this.callbackQueue.length){var loadObj=this.callbackQueue.shift();
eval(loadObj.callback)(loadObj.script)
}};
ScriptLoader.prototype.loadScript=function(h){var e=h.script;
var b=h.callback;
var g=h.id;
var f=h.atts;
var d=window.document.createElement("script");
d.charset="utf-8";
if(g){d.id=g
}d.type="text/javascript";
if(f){for(var c=0;
c<f.length;
c++){d.setAttribute(f[c].att,f[c].value)
}}d.src=e;
if(b){var a=function(k,i){i(k);
this.onreadystatechange=null;
this.onload=null;
this.onerror=null
};
d.onreadystatechange=function(){if(this.readyState==="complete"){a(h,callbackDispatcher)
}};
d.onload=function(){a(h,callbackDispatcher)
};
d.onerror=function(){a(h,callbackDispatcher)
}
}window.document.getElementsByTagName("head")[0].appendChild(d)
};
function tpLoadScript(f,c,h,g){var e=window.document.createElement("script");
e.charset="utf-8";
if(h){e.id=h
}e.type="text/javascript";
if(g){for(var d=0;
d<g.length;
d++){e.setAttribute(g[d].att,g[d].value)
}}e.src=f;
if(c){var a=function(i,k){i(k);
this.onreadystatechange=null;
this.onload=null;
this.onerror=null
};
var b=false;
e.onreadystatechange=function(){if((this.readyState==="loaded"||this.readyState==="complete"||this.readyState===4)&&!b){a(c,f);
b=true
}};
e.onload=function(){if(!b){b=true;
a(c,f)
}};
e.onerror=function(){if(!b){a(c,f)
}}
}window.document.getElementsByTagName("head")[0].appendChild(e)
}function tpExternalControllerClass(){this.playerTypes=new Object();
this.extPlayers=new Object();
this.registerExternalPlayer=function(type,playerClass){this.playerTypes[type]=playerClass
};
this.routeMessage=function(swfId,controllerId,streamType,funcName,args){var curController=this.extPlayers[controllerId];
if(!curController){curController=this.extPlayers[controllerId]={}
}var curPlayer=curController[streamType];
if(!curPlayer){var playerClass=this.playerTypes[streamType];
if(!playerClass){return
}curPlayer=eval("new "+playerClass+"('"+swfId+"', '"+controllerId+"');");
if(!curPlayer){return
}curController[streamType]=curPlayer
}curPlayer[funcName](args)
};
this.returnMessage=function(swfId,controllerId,funcName,args){var obj=tpThisMovie(swfId);
obj.receiveJSMessage(controllerId,funcName,args)
};
this.cleanup=function(){for(var controllerId in this.extPlayers){var players=this.extPlayers[controllerId];
for(var player in players){players[player].cleanup();
delete players[player]
}delete this.extPlayers[controllerId]
}}
}function tpExternalMessage(b,d,c,e,a){tpExternalController.routeMessage(b,d,c,e,a)
}tpExternalController=new tpExternalControllerClass();
function tpShowAlert(a){switch(a){case"FULLSCREEN_DISABLED":alert("Full screen is only available with Flash 9 or later");
break
}}function tpScaleImage(g,f,e){var b=g.height/g.width;
var a=e/f;
var d=f/g.width;
var c=e/g.height;
if((d-c)>0){g.height=(e);
g.style.width="auto"
}else{if((d-c)<0){g.width=(f);
g.style.height="auto"
}else{g.height=e;
g.width=f
}}}function tpIsChrome(){return(navigator.userAgent.toLowerCase().indexOf("chrome")>-1)
}function tpIsWebKit(){return(navigator.userAgent.toLowerCase().indexOf("webkit")>-1)
}function tpIsSafari(){return(navigator.userAgent.toLowerCase().indexOf("safari")>-1)
}function tpGetRectangle(c){var d=document.getElementById(c);
var b=d.offsetLeft;
var f=d.offsetTop;
var e=d.offsetWidth;
var a=d.offsetHeight;
return new Rectangle(b,f,e,a)
}function tpGetYRelativeTo(c,a){var b=0;
if(c==a){return 0
}else{if(c.offsetParent){b=c.offsetLeft+tpGetXRelativeTo(c.offsetParent,a);
return b
}else{tpDebug(a.id+" is not an ancestor of "+c.id);
return 0
}}}function tpGetXRelativeTo(c,a){var b=0;
if(c==a){return 0
}else{if(c.offsetParent){b=c.offsetLeft+tpGetXRelativeTo(c.offsetParent,a);
return b
}else{tpDebug(a.id+" is not an ancestor of "+c.id);
return 0
}}}function tpGetXYRelativeTo(d,b){var a=new Point(0,0);
if(d==b){return a
}else{if(d.offsetParent){var c=tpGetXYRelativeTo(d.offsetParent,b);
a.x=d.offsetLeft+c.x;
a.y=d.offsetTop+c.y;
return a
}else{throw new Error(b.id+" is not an ancestor of "+d.id)
}}}function tpLocalToGlobal(a){return tpGetXYRelativeTo(a,document.body)
}function tpGetElementById(a){return document.getElementById(a)
}function tpParseXml(b){var a=null;
if(window.DOMParser){var c=new DOMParser();
a=c.parseFromString(b,"text/xml")
}else{a=new ActiveXObject("Microsoft.XMLDOM");
a.async="false";
a.loadXML(b)
}tpRemoveWhiteSpace(a);
return a
}function tpRemoveWhiteSpace(b){var a=/\S/;
for(var c=0;
c<b.childNodes.length;
c++){var d=b.childNodes[c];
if(d.nodeType==3&&(!(a.test(d.nodeValue)))){b.removeChild(d);
c--
}else{if(d.nodeType==1){tpRemoveWhiteSpace(d)
}}}}function tpTimeToMillis(d){var a=0;
if(d){if(d.indexOf("ms")>0){a=d.substr(0,d.indexOf("ms"))
}else{var c=d.split(":");
while(c.length>0){var b=c.shift();
if(c.length==2){a+=((b)*1000*60*60)
}if(c.length==1){a+=((b)*1000*60)
}if(c.length==0){if(b.indexOf(".")){a+=((b)*1000)
}else{a+=(b)*1000
}}}}}return a
}function tpSendUrl(a){var b=document.createElement("img");
b.src=a;
b.style.display="none";
b.width=1;
b.height=1;
b.left=-1111;
b.src=a;
document.body.appendChild(b);
tpDebug("sent tracking/impressiong to  "+a);
document.body.removeChild(b)
}function tpGetIEVersion(){var c=9999;
if(navigator.appName=="Microsoft Internet Explorer"){var a=navigator.userAgent;
var b=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
if(b.exec(a)!=null){c=parseFloat(RegExp.$1)
}}return c
}function tpGetComponentSize(b){var c=false;
var d=b.style.height;
var a=b.style.width;
if(d==="100%"&&b.style.width==="100%"||(!d&&!a)){c=true
}if(c&&b.parentNode&&(b.offsetHeight==0&&b.offsetWidth==0)){return tpGetComponentSize(b.parentNode)
}else{if(!c){d=d.replace("px","");
a=a.replace("px","");
return{width:parseInt(a),height:parseInt(d)}
}}return{width:b.offsetWidth,height:b.offsetHeight}
}function tpGetComponentSize(b){var c=false;
var d=b.style.height;
var a=b.style.width;
if(d==="100%"&&b.style.width==="100%"||(!d&&!a)){c=true
}if(c&&b.parentNode&&(b.offsetHeight==0&&b.offsetWidth==0)){return tpGetComponentSize(b.parentNode)
}else{if(!c){d=d.replace("px","");
a=a.replace("px","");
return{width:parseInt(a),height:parseInt(d)}
}}return{width:b.offsetWidth,height:b.offsetHeight}
}function tpGetScriptPath(b){if(b===undefined&&tpScriptPath!==undefined){return tpScriptPath
}var a=document.getElementsByTagName("script");
var d;
if(b!==undefined){for(var c=0;
c<a.length;
c++){if(a[c].src.indexOf(b)>=0){d=a[c].src;
break
}}}else{d=a[a.length-1].src
}if(!d){d=a[a.length-1].src
}if(d.indexOf("/")==-1){return""
}d=d.substring(0,d.lastIndexOf("/"));
return d
}function tpMillisToStr(d){var c=d/1000;
var a=Math.floor(c/(60*60));
c=c-(a*(60*60));
var b=Math.floor(c/60);
var e=Math.floor(c)%60;
var f="";
if(a>0){f=a.toString()+":";
if(b<10){f+="0"
}}f+=b+":";
if(e<10){f+="0"
}f+=e.toString();
return f
}var tpScriptPath;
if(window["$pdk"]===undefined){tpScriptPath=tpGetScriptPath()
}else{tpScriptPath=$pdk.scriptRoot+"/js"
}XMLLoader=Class.extend({init:function(){},load:function(a,h,c){var g;
if(typeof XDomainRequest!=="undefined"&&a.indexOf(document.domain)<0){g=true
}if(typeof XMLHttpRequest==="undefined"){XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")
}catch(k){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")
}catch(k){}try{return new ActiveXObject("Msxml2.XMLHTTP")
}catch(k){}throw new Error("This browser does not support XMLHttpRequest.")
}
}var i;
if(g){i=new XDomainRequest()
}else{i=new XMLHttpRequest()
}var f=this;
var d=false;
var e=function(k){c(k)
};
var b=function(){if(this.readyState===4&&this.status===200&&!d){d=true;
var k=i.responseXML;
if(k==null||typeof(k)!=="string"){k=i.responseText
}if(typeof(h)==="function"){h(k)
}}else{if(this.readyState===4&&this.status===404&&!d){d=true;
e()
}else{if(g&&!d){d=true;
if(typeof(h)==="function"){h(i.responseText)
}}}}};
i.onreadystatechange=b;
i.onload=b;
i.onerror=e;
i.ontimeout=e;
setTimeout(function(){try{i.open("GET",a);
i.send()
}catch(k){tpDebug(k.message);
if(typeof(c)==="function"){c(k)
}}},1)
}});
Positioning=new (Class.extend({init:function(){this.TOP_RIGHT="topRight";
this.TOP_LEFT="topLeft";
this.ABOVE="above";
this.LEFT="left";
this.RIGHT="right";
this.BELOW="below";
this.AUTO_VERTICAL="autoVertical";
this.AUTO_HORIZONTAL="autoHorizontal";
this.VERTICAL="vertical";
this.HORIZONTAL="horizontal";
this.BOTTOM_RIGHT="bottomRight";
this.BOTTOM_LEFT="bottomLeft";
this.AUTO="auto";
this.MANUAL="manual"
},applyPad:function(d,a){var c=d.clone();
for(var b=0;
b<a.length;
b++){var e=a[b];
c.x()+=e.left;
c.y()+=e.top;
c.right()-=e.right+e.left;
c.bottom()-=e.bottom+e.top
}return c
},getBounds:function(a,d){var b=tpGetXYRelativeTo(a,d);
var c=new Point(a.offsetWidth,a.offsetHeight);
var e=new Rectangle();
e.x(b.x);
e.y(b.y);
e.width(a.offsetWidth);
e.height(a.offsetHeight);
return e
},alignBottom:function(d,c,b){var a=(c.width()-d.width())/2;
var e=this.BELOW;
if(d.x()-a<0){e=this.BOTTOM_RIGHT
}else{if((d.x()+d.width()+a)>b.width()){e=this.BOTTOM_LEFT
}}return e
},alignTop:function(d,c,b){var a=(c.width()-d.width())/2;
var e=this.ABOVE;
if(d.x()-a<0){e=this.TOP_RIGHT
}else{if((d.x()+d.width()+a)>b.width()){e=this.TOP_LEFT
}}return e
},calculatePopUpAlignment:function(d,c,b,a,e){if(e==this.AUTO_VERTICAL){if(d.x()<=b.width()/2){e=this.RIGHT
}else{e=this.LEFT
}}else{if(e==this.AUTO_HORIZONTAL){if(d.y()<=b.height()/2){e=this.alignBottom(d,c,b)
}else{e=this.alignTop(d,c,b)
}}else{if(e==this.ABOVE){e=this.alignTop(d,c,b)
}else{if(e==this.BELOW){e=this.alignBottom(d,c,b)
}}}}return e
},calculatePopUpLocation:function(f,d,i,e,a,g){if(!e){e=this.AUTO_HORIZONTAL
}e=this.calculatePopUpAlignment(f,d,i,false,e);
var c="below";
var b="right";
switch(e){case this.TOP_LEFT:d.x(f.x()-d.width()+f.width());
d.y(f.y()-d.height()-4);
c="above";
break;
case this.ABOVE:d.x(f.x()-(d.width()/2)+(f.width()/2));
d.y(f.y()-d.height()-4);
c="above";
break;
case this.BELOW:d.x(f.x()-(d.width()/2)+(f.width()/2));
d.y(f.y()+f.height()+3);
break;
case this.TOP_RIGHT:d.x(f.x());
d.y(f.y()-d.height()-4);
c="above";
break;
case this.LEFT:d.x(f.x()-d.width());
d.y(f.y()+(f.height()/2)-(d.height()/2));
break;
case this.RIGHT:d.x(f.x()+f.width());
d.y(f.y()+(f.height()/2)-(d.height()/2));
break;
case this.BOTTOM_LEFT:d.x(f.x()-d.width()+f.width());
d.y(f.y()+f.height()+3);
break;
case this.BOTTOM_RIGHT:d.x(f.x());
d.y(f.y()+f.height()+3);
break;
case this.MANUAL:if(a==null){throw new Error("if the alignment is set to MANUAL you must provide a point")
}d.x(a.x());
d.y(a.y());
break
}var h=new Point(d.x(),d.y());
h.verticalalign=c;
return h
}}));
if(window.tpPhase1PDKLoaded){if(window.tpLegacyController===undefined&&tpController===undefined){tpLegacyController=new tpControllerClass()
}else{if(tpController){tpLegacyController=tpController
}}if(window.tpDoInitGwtCommManager){tpDoInitGwtCommManager()
}tpPhase1PDKLoaded()
};