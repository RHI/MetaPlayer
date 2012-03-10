
/**
OVP - Javascript Open Video Player for HTML5

Strategy, fallback system and RSS feed player.

Author: James Mutton <jmutton [at] akamai [dot] com>
Version: 1.1


Copyright 2010 Akamai Technologies, Inc.
All rights reserved.
Licensed under the BSD license:

Portions of the code may also be covered under the MIT license where noted:
    http://www.opensource.org/licenses/mit-license.php

Portions of the code may also be covered under the MS-PL license where noted:
    http://www.microsoft.com/opensource/licenses.mspx#Ms-PL

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
- Neither the name of Akamai Technologies nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE


==== GETTING STARTED ====
 
An OVP project to simplify the deployment of multiple video players.  It provides a unified
facade to each OVP technology and frees the user from having to write
dependent code for each individual player-type.  It also provides failover,
to give the best possible experience for the end-user when different
technologies are available.  OVP will use a selective list of possible
technologies depending on the format of the media and the configuration
passed into the player.  It is cross-browser and can utilize the new HTML 5
video tags as well. 

It supports a configurable and pluggable interface and can be extended at
runtime.  Plugins are notified of each step and given the option of
manipulating the result of a call.  Plugins may choose to abort calls to
further plugins or (more typically) will be called sequentially in the order
they are loaded. If an error occurs in a plugin, it may pass the error up to
halt processing all together or it may handle the error and indicate to the
calling function it failure (but allow other plugins to continue).

Basic steps:
1) Include all required files on the page (ovp javascript and css files)
2) Optionally Create a configuration dictionary for the desired behavior
   and call the init method
3a) Optionally call the ovp.adopt method to adopt all video tags on the page
3b) Optionally Call render method to render a player to a specific location
    on the page
 
==== BUILDING ====

This file and several other files will be concatenated together to build the
final product.  This is all controlled by a simple Makefile using GNU make.
To build, "cd" to the top-most directory of the project (probably the
direcory containing this file) and type:

make

If you wish to delete the concatenated versions you can use:

make clean


==== USAGE ====

There are 3 main ways of using OVP.js (adopt, render and renderFeed).  Each
fits a slightly different need.  Always use each of the three examples only
when the DOM is ready.

Using "adopt":
--------------

Use adopt() when you simply want to put a standard HTML5 video tag within the
HTML and have ovp.js replace and enhance the DOM element.  This is useful for
simple HTML-standard pages that will still behave nicely (although maybe not
exactly how you would like) when Javascript is disabled.  To do this you would
place a video tag directly on the page then include the following Javascript

    // We can optionally start with a config object to manipulate our strategy
    var configobj = {"strategy":{
        "order":["HTML5","Silverlight","Flash"]  // Case is important
    }};
    // If we have a config, we init-it to the ovp framework
    ovp.init(configobj);
    // Then we call adopt() to adopt all video tags on the page
    ovp.adopt();


Using "render":
---------------

Use render() when you wish to programatically load the video onto the page
using Javascript.

    // We can optionally start with a config object to manipulate our strategy
    var configobj = {"strategy":{
        "order":["HTML5","Silverlight","Flash"]  // Case is important
    }};
    // If we have a config, we init-it to the ovp framework
    ovp.init(configobj);
	// in this case we need a video config object to describe our videos and
	// their behavior
	var videoconf = {
		"sources":[
			{'src':'http://localhost/video.mp4','type':'video/mp4'}
			{'src':'http://localhost/video/video.ogv', 'type':'video/ogg'},
		],
	'posterimg':'http://localhost/img/poster.png',
	'autobuffer':true,
	'controls':true,
	'height':360,
	'width':640,
	'id':'vplayer'
	};
    // Then we call render() to render the player to the desired location
	ovp.render('vplayer', videoconf);


Using "renderFeed":
-------------------

Use renderFeed() when you have an RSS Feed that defines a list of content you
would like to use for playback.  This will result in a "content-slider" where
the thumbnails are shown and clicking on the thumbnail results in the video
being rendered.  Feeds must be loaded from the same location as the ovp
Javascript for sandboxing.

    // We can optionally start with a config object to manipulate our strategy
    var configobj = {
		"strategy":{ "order":["HTML5","Silverlight","Flash"] }
		"sliderdelay":5000,
		"sliderspeed":"fast",
		"immediately":true	// When the player render fires, start playing immediately, don't wait for poster click.
    };
    // If we have a config, we init-it to the ovp framework
    ovp.init(configobj);
    // Then we call renderFeed to render the feed to the desired location
    ovp.renderFeed('mydivid', 'feed.xml');


==== UNIT TESTS ====

Unit tests are run from a browser in the ./tests directory.  To run the
tests simply navigate your browser to the index.html file that is in
that directory.  Tests are something we hope to improve in the coming
versions as the initial version was rather light on testing.

Writing Unit Tests:
-------------------

Unit tests are each written to correspond to the module being tested.  You
will find several testX.js files in the tests/ directory.  When writing
unit tests you should follow the example of an existing test harness
(testUtil.js is a good one to start with).  Each unique test should test
both the positive and negative of your assertion and each test should be
isolated to its own test() clause.

When creating new test modules ensure that your module starts with:
	$(document).ready(function(){
	    module("The name of the module I am testing");
		test("Description of Test", function(){ "TEST HERE" });
	}

The tests are built using jQuery's QUnit framework.

==== DEVELOPMENT ====

Coding Standards:
----------------

* Use tabs not spaces
* functions are camelCase
* variables are camelCase
* variables you mean to be private begin with an underscore ("_")
* ALWAYS use curlies, unless on a single-line statement

branching
* Open brackets on same line as if [ eg:  if (true) {  ]
* Else's on the same line as closing brackets [ eg: } else {  ]

Classes:
* Classes are stored in their own file for ease of editing
  (be sure to add them into the Makefile)
* ovp is the main class that is exposed to the window objet, all interfaces must
  be defined here.



@TODO:

Documentation:
- Document plugin interfaces
- Styling guide
- Configuration object guide
- Complete Documentation package

Features:
- Inherit with configuration of the parent element to eliminate mucking with
  CSS for proper sizing
- Need a sorting function for the source array so that playlist types (smil,
  m3u8, ism/manifest, etc...) are considered first. (mp4 for idevice)
- Return to the proper scroll position when un-fullscreening a video
- Need a controlled way to get back to the playlist when started with a rendered feed
- Firefox has a core issue with plugin positioning causing the plugin to reload.
  As a result, fullscreen in firefox simply maximizes the video and scrolls there.
  This isn't a todo, just a note of the behavior.
  See: https://bugzilla.mozilla.org/show_bug.cgi?id=90268
  See: https://bugzilla.mozilla.org/show_bug.cgi?id=429428
- Update plugin model to allow insertion of different video objects
- Add the different controls and video objects directly to the OVP object so that
  someone can override them or their prototype? Otherwise, maybe a factory function
  and store the objects in the ovpconfig defaults.
- Document sprite configuration and allow passing sprites to flash/sl
  to promote the use of fullscreen (and therefore hardware acceleration)

*/
(function(window) {
	var PRODUCT_INFO = {
		'__version__':'1.0',
		'__author__':'James Mutton <jmutton [at] akamai [dot] com>',
		'__site__':'http://openvideoplayer.sourceforge.net',
		'__copyright__':'2010, Akamai Technologies, Inc.',
		'__license__':'OVP Code is Licensed under the BSD license, additional licenses apply to contributed code'
	};

	///////////////////////////////////////////////
	// Dependencies
	// support for an "onDomReady" event
	if(!window.addDOMLoadEvent)window.addDOMLoadEvent=(function(){var e=[],t,s,n,i,o,d=document,w=window,r='readyState',c='onreadystatechange',x=function(){n=1;clearInterval(t);while(i=e.shift())i();if(s)s[c]=''};return function(f){if(n)return f();if(!e[0]){d.addEventListener&&d.addEventListener("DOMContentLoaded",x,false);/*@cc_on@*//*@if(@_win32)d.write("<script id=__ie_onload defer src=//0><\/scr"+"ipt>");s=d.getElementById("__ie_onload");s[c]=function(){s[r]=="complete"&&x()};/*@end@*/if(/WebKit/i.test(navigator.userAgent))t=setInterval(function(){/loaded|complete/.test(d[r])&&x()},10);o=w.onload;w.onload=function(){x();o&&o()}}e.push(f)}})();
	// THIS PORTION OF CODE IS COVERED BY THE MS-PL LICENSE AT: http://www.microsoft.com/opensource/licenses.mspx#Ms-PL
	//v4.0.50401.0
	if(!window.Silverlight)window.Silverlight={};Silverlight._silverlightCount=0;Silverlight.__onSilverlightInstalledCalled=false;Silverlight.fwlinkRoot="http://go2.microsoft.com/fwlink/?LinkID=";Silverlight.__installationEventFired=false;Silverlight.onGetSilverlight=null;Silverlight.onSilverlightInstalled=function(){window.location.reload(false)};Silverlight.isInstalled=function(b){if(b==undefined)b=null;var a=false,m=null;try{var i=null,j=false;if(window.ActiveXObject)try{i=new ActiveXObject("AgControl.AgControl");if(b===null)a=true;else if(i.IsVersionSupported(b))a=true;i=null}catch(l){j=true}else j=true;if(j){var k=navigator.plugins["Silverlight Plug-In"];if(k)if(b===null)a=true;else{var h=k.description;if(h==="1.0.30226.2")h="2.0.30226.2";var c=h.split(".");while(c.length>3)c.pop();while(c.length<4)c.push(0);var e=b.split(".");while(e.length>4)e.pop();var d,g,f=0;do{d=parseInt(e[f]);g=parseInt(c[f]);f++}while(f<e.length&&d===g);if(d<=g&&!isNaN(d))a=true}}}catch(l){a=false}return a};Silverlight.WaitForInstallCompletion=function(){if(!Silverlight.isBrowserRestartRequired&&Silverlight.onSilverlightInstalled){try{navigator.plugins.refresh()}catch(a){}if(Silverlight.isInstalled(null)&&!Silverlight.__onSilverlightInstalledCalled){Silverlight.onSilverlightInstalled();Silverlight.__onSilverlightInstalledCalled=true}else setTimeout(Silverlight.WaitForInstallCompletion,3e3)}};Silverlight.__startup=function(){navigator.plugins.refresh();Silverlight.isBrowserRestartRequired=Silverlight.isInstalled(null);if(!Silverlight.isBrowserRestartRequired){Silverlight.WaitForInstallCompletion();if(!Silverlight.__installationEventFired){Silverlight.onInstallRequired();Silverlight.__installationEventFired=true}}else if(window.navigator.mimeTypes){var b=navigator.mimeTypes["application/x-silverlight-2"],c=navigator.mimeTypes["application/x-silverlight-2-b2"],d=navigator.mimeTypes["application/x-silverlight-2-b1"],a=d;if(c)a=c;if(!b&&(d||c)){if(!Silverlight.__installationEventFired){Silverlight.onUpgradeRequired();Silverlight.__installationEventFired=true}}else if(b&&a)if(b.enabledPlugin&&a.enabledPlugin)if(b.enabledPlugin.description!=a.enabledPlugin.description)if(!Silverlight.__installationEventFired){Silverlight.onRestartRequired();Silverlight.__installationEventFired=true}}if(!Silverlight.disableAutoStartup)if(window.removeEventListener)window.removeEventListener("load",Silverlight.__startup,false);else window.detachEvent("onload",Silverlight.__startup)};if(!Silverlight.disableAutoStartup)if(window.addEventListener)window.addEventListener("load",Silverlight.__startup,false);else window.attachEvent("onload",Silverlight.__startup);Silverlight.createObject=function(m,f,e,k,l,h,j){var d={},a=k,c=l;d.version=a.version;a.source=m;d.alt=a.alt;if(h)a.initParams=h;if(a.isWindowless&&!a.windowless)a.windowless=a.isWindowless;if(a.framerate&&!a.maxFramerate)a.maxFramerate=a.framerate;if(e&&!a.id)a.id=e;delete a.ignoreBrowserVer;delete a.inplaceInstallPrompt;delete a.version;delete a.isWindowless;delete a.framerate;delete a.data;delete a.src;delete a.alt;if(Silverlight.isInstalled(d.version)){for(var b in c)if(c[b]){if(b=="onLoad"&&typeof c[b]=="function"&&c[b].length!=1){var i=c[b];c[b]=function(a){return i(document.getElementById(e),j,a)}}var g=Silverlight.__getHandlerName(c[b]);if(g!=null){a[b]=g;c[b]=null}else throw"typeof events."+b+" must be 'function' or 'string'";}slPluginHTML=Silverlight.buildHTML(a)}else slPluginHTML=Silverlight.buildPromptHTML(d);if(f)f.innerHTML=slPluginHTML;else return slPluginHTML};Silverlight.buildHTML=function(a){var b=[];b.push('<object type="application/x-silverlight" data="data:application/x-silverlight,"');if(a.id!=null)b.push(' id="'+Silverlight.HtmlAttributeEncode(a.id)+'"');if(a.width!=null)b.push(' width="'+a.width+'"');if(a.height!=null)b.push(' height="'+a.height+'"');b.push(" >");delete a.id;delete a.width;delete a.height;for(var c in a)if(a[c])b.push('<param name="'+Silverlight.HtmlAttributeEncode(c)+'" value="'+Silverlight.HtmlAttributeEncode(a[c])+'" />');b.push("</object>");return b.join("")};Silverlight.createObjectEx=function(b){var a=b,c=Silverlight.createObject(a.source,a.parentElement,a.id,a.properties,a.events,a.initParams,a.context);if(a.parentElement==null)return c};Silverlight.buildPromptHTML=function(b){var a="",d=Silverlight.fwlinkRoot,c=b.version;if(b.alt)a=b.alt;else{if(!c)c="";a="<a href='javascript:Silverlight.getSilverlight(\"{1}\");' style='text-decoration: none;'><img src='{2}' alt='Get Microsoft Silverlight' style='border-style: none'/></a>";a=a.replace("{1}",c);a=a.replace("{2}",d+"108181")}return a};Silverlight.getSilverlight=function(e){if(Silverlight.onGetSilverlight)Silverlight.onGetSilverlight();var b="",a=String(e).split(".");if(a.length>1){var c=parseInt(a[0]);if(isNaN(c)||c<2)b="1.0";else b=a[0]+"."+a[1]}var d="";if(b.match(/^\d+\056\d+$/))d="&v="+b;Silverlight.followFWLink("149156"+d)};Silverlight.followFWLink=function(a){top.location=Silverlight.fwlinkRoot+String(a)};Silverlight.HtmlAttributeEncode=function(c){var a,b="";if(c==null)return null;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);if(a>96&&a<123||a>64&&a<91||a>43&&a<58&&a!=47||a==95)b=b+String.fromCharCode(a);else b=b+"&#"+a+";"}return b};Silverlight.default_error_handler=function(e,b){var d,c=b.ErrorType;d=b.ErrorCode;var a="\nSilverlight error message     \n";a+="ErrorCode: "+d+"\n";a+="ErrorType: "+c+"       \n";a+="Message: "+b.ErrorMessage+"     \n";if(c=="ParserError"){a+="XamlFile: "+b.xamlFile+"     \n";a+="Line: "+b.lineNumber+"     \n";a+="Position: "+b.charPosition+"     \n"}else if(c=="RuntimeError"){if(b.lineNumber!=0){a+="Line: "+b.lineNumber+"     \n";a+="Position: "+b.charPosition+"     \n"}a+="MethodName: "+b.methodName+"     \n"}alert(a)};Silverlight.__cleanup=function(){for(var a=Silverlight._silverlightCount-1;a>=0;a--)window["__slEvent"+a]=null;Silverlight._silverlightCount=0;if(window.removeEventListener)window.removeEventListener("unload",Silverlight.__cleanup,false);else window.detachEvent("onunload",Silverlight.__cleanup)};Silverlight.__getHandlerName=function(b){var a="";if(typeof b=="string")a=b;else if(typeof b=="function"){if(Silverlight._silverlightCount==0)if(window.addEventListener)window.addEventListener("unload",Silverlight.__cleanup,false);else window.attachEvent("onunload",Silverlight.__cleanup);var c=Silverlight._silverlightCount++;a="__slEvent"+c;window[a]=b}else a=null;return a};Silverlight.onRequiredVersionAvailable=function(){};Silverlight.onRestartRequired=function(){};Silverlight.onUpgradeRequired=function(){};Silverlight.onInstallRequired=function(){};Silverlight.IsVersionAvailableOnError=function(d,a){var b=false;try{if(a.ErrorCode==8001&&!Silverlight.__installationEventFired){Silverlight.onUpgradeRequired();Silverlight.__installationEventFired=true}else if(a.ErrorCode==8002&&!Silverlight.__installationEventFired){Silverlight.onRestartRequired();Silverlight.__installationEventFired=true}else if(a.ErrorCode==5014||a.ErrorCode==2106){if(Silverlight.__verifySilverlight2UpgradeSuccess(a.getHost()))b=true}else b=true}catch(c){}return b};Silverlight.IsVersionAvailableOnLoad=function(b){var a=false;try{if(Silverlight.__verifySilverlight2UpgradeSuccess(b.getHost()))a=true}catch(c){}return a};Silverlight.__verifySilverlight2UpgradeSuccess=function(d){var c=false,b="4.0.50401",a=null;try{if(d.IsVersionSupported(b+".99")){a=Silverlight.onRequiredVersionAvailable;c=true}else if(d.IsVersionSupported(b+".0"))a=Silverlight.onRestartRequired;else a=Silverlight.onUpgradeRequired;if(a&&!Silverlight.__installationEventFired){a();Silverlight.__installationEventFired=true}}catch(e){}return c}
	// END MS-PL PORTION OF CODE
	/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> */
	var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
	//feed parser jquery plugin
	jQuery.getFeed=function(a){a=jQuery.extend({url:null,data:null,success:null},a);if(a.url){$.ajax({type:"GET",url:a.url,data:a.data,dataType:"xml",success:function(b){var c=new JFeed(b);if(jQuery.isFunction(a.success)){a.success(c)}}})}};function JFeed(a){if(a){this.parse(a)}}JFeed.prototype={type:"",version:"",title:"",link:"",description:"",parse:function(a){if(jQuery("channel",a).length==1){this.type="rss";var b=new JRss(a)}if(b){jQuery.extend(this,b)}}};function JFeedItem(){}JFeedItem.prototype={title:"",link:"",description:"",updated:"",id:"",thumbnail:"",reference:{},files:[]};JFeedItem.prototype.getFiles=function(){var a=[];this.reference.find("[nodeName=media:content]").each(function(){var b={};b.src=jQuery(this).attr("url");b.type=jQuery(this).attr("type");b.bitrate=jQuery(this).attr("bitrate");a.push(b)});return a};function JRss(a){this._parse(a)}JRss.prototype={_parse:function(a){if(jQuery("rss",a).length==0){this.version="1.0"}else{this.version=jQuery("rss",a).eq(0).attr("version")}var b=jQuery("channel",a).eq(0);this.title=jQuery(b).find("title:first").text();this.link=jQuery(b).find("link:first").text();this.description=jQuery(b).find("description:first").text();this.language=jQuery(b).find("language:first").text();this.updated=jQuery(b).find("lastBuildDate:first").text();this.items=new Array();var c=this;jQuery("item",a).each(function(){var e=jQuery(this);var d=new JFeedItem();d.title=jQuery(this).find("title").eq(0).text();d.link=jQuery(this).find("link").eq(0).text();d.description=jQuery(this).find("description").eq(0).text();d.updated=jQuery(this).find("pubDate").eq(0).text();d.id=jQuery(this).find("guid").eq(0).text();d.thumbnail=jQuery(this).find("thumbnail").text();if(!d.thumbnail){d.thumbnail=jQuery(this).find("[nodeName=media:thumbnail]").attr("url")}d.reference=e;c.items.push(d)})}};
	//feed slider jquery plugin
	(function(a){a.feedSlider=function(c,b){var d=this;d.$el=a(c);d.el=c;d.currentPage=1;d.timer=null;d.playing=false;d.$el.data("feedSlider",d);d.init=function(){d.options=a.extend({},a.feedSlider.defaults,b);d.$wrapper=d.$el.find("> div").css("overflow","hidden");d.$slider=d.$wrapper.find("> ul");d.$items=d.$slider.find("> li");d.$single=d.$items.filter(":first");if(d.options.buildNavigation){d.buildNavigation()}d.singleWidth=d.$single.outerWidth();d.pages=d.$items.length;d.$items.filter(":first").before(d.$items.filter(":last").clone().addClass("cloned"));d.$items.filter(":last").after(d.$items.filter(":first").clone().addClass("cloned"));d.$items=d.$slider.find("> li");d.buildNextBackButtons();d.startStop(true);if(d.options.pauseOnHover){d.$el.hover(function(){d.clearTimer()},function(){d.startStop(d.playing)})}if((d.options.hashTags==true&&!d.gotoHash())||d.options.hashTags==false){d.setCurrentPage(1)}};d.gotoPage=function(f){if(typeof(f)=="undefined"||f==null){f=1;d.setCurrentPage(1)}if(f>d.pages+1){f=d.pages}if(f<0){f=1}var e=f<d.currentPage?-1:1,h=Math.abs(d.currentPage-f),g=d.singleWidth*e*h;d.$wrapper.filter(":not(:animated)").animate({scrollLeft:"+="+g},d.options.animationTime,d.options.easing,function(){if(f==0){d.$wrapper.scrollLeft(d.singleWidth*d.pages);f=d.pages}else{if(f>d.pages){d.$wrapper.scrollLeft(d.singleWidth);f=1}}d.setCurrentPage(f)})};d.setCurrentPage=function(f,e){if(d.options.buildNavigation){d.$nav.find(".cur").removeClass("cur");a(d.$navLinks[f-1]).addClass("cur")}if(e!==false){d.$wrapper.scrollLeft(d.singleWidth*f)}d.currentPage=f};d.goForward=function(){d.gotoPage(d.currentPage+1)};d.goBack=function(){d.gotoPage(d.currentPage-1)};d.gotoHash=function(){if(/^#?panel-\d+$/.test(window.location.hash)){var f=parseInt(window.location.hash.substr(7));var e=d.$items.filter(":eq("+f+")");if(e.length!=0){d.setCurrentPage(f);return true}}return false};d.buildNavigation=function(){d.$nav=a("<div id='thumbNav'></div>").appendTo(d.$el);d.$items.each(function(f,g){var e=f+1;var h=a("<a href='#'></a>");h.text(e);h.click(function(i){d.gotoPage(e);if(d.options.hashTags){d.setHash("panel-"+e)}i.preventDefault()});d.$nav.append(h)});d.$navLinks=d.$nav.find("> a")};d.buildNextBackButtons=function(){var e=a('<a class="arrow forward">&gt;</a>'),f=a('<a class="arrow back">&lt;</a>');f.click(function(g){d.goBack();g.preventDefault()});e.click(function(g){d.goForward();g.preventDefault()});d.$wrapper.after(f).after(e)};d.startStop=function(e){if(e!==true){e=false}d.playing=e;if(e){d.clearTimer();d.timer=window.setInterval(function(){d.goForward()},d.options.delay)}else{d.clearTimer()}};d.clearTimer=function(){if(d.timer){window.clearInterval(d.timer)}};d.setHash=function(e){if(typeof window.location.hash!=="undefined"){if(window.location.hash!==e){window.location.hash=e}}else{if(location.hash!==e){location.hash=e}}return e};d.init()};a.feedSlider.defaults={easing:"swing",delay:3000,animationTime:600,hashTags:true,buildNavigation:true,pauseOnHover:true};a.fn.feedSlider=function(b){if(typeof(b)=="object"||b==undefined){b=(b)?b:{};return this.each(function(c){(new a.feedSlider(this,b));b.hashTags=false})}else{if(typeof(b)=="number"){return this.each(function(c){var d=a(this).data("feedSlider");if(d){d.gotoPage(b)}})}}}})(jQuery);
	// END MIT LICENSE PORTION OF CODE

	///////////////////////////////////////////////
	// Controls Objects
	/**
	 * The Controls class.  The job of this class is to setup the basic elements
	 * and allow them to be rendered to the screen. It also manages things like seek/
	 * scrubbing.
	 * @param {Object} video - the corresponding video object we're rendering with/controling.
	 */
	var Controls = function(video) {
		this.managedVideo = video;
		var pixel = video.ovpconfig.controls.src_img;
		var mvid = video.getID();
		this.extendedClass = '';  // class extension
		this.controlcontainer = $('<div id="'+mvid+'-controlcontainer"></div>');
		this.controlss = $('<div id="'+mvid+'-controls"></div>');
		this.playpause = $('<div id="'+mvid+'-playpause"><img src="'+pixel+'"></div>');
		this.volumebtn = $('<div id="'+mvid+'-volumebtn"><img src="'+pixel+'"></div>');
		this.fsbtn = $('<div id="'+mvid+'-fullscreenbtn"><img src="'+pixel+'"></div>');
		this.position = $('<div id="'+mvid+'-position"></div>');
		this.scrubber = $('<div id="'+mvid+'-scrubber"></div>');
		this.scrubberp = $('<img id="'+mvid+'-scrubber-playing" src="'+pixel+'" />');
		this.scrubberb = $('<img id="'+mvid+'-scrubber-buffered" src="'+pixel+'" />');
		this.scrubberr = $('<img id="'+mvid+'-scrubber-remaining" src="'+pixel+'" />');
		this.scrubber.append(this.scrubberp);
		this.scrubber.append(this.scrubberb);
		this.scrubber.append(this.scrubberr);
		this.duration = $('<div id="'+mvid+'-duration"></div>');
		//this.returnBtn = $('<img id="'+mvid+'-playlistreturn" src="'+pixel+'" />');

		// attach to video events - play/pause, volume, fullscreen
		var controls = this;
		this.playpause.click(function(){controls.managedVideo.playpause();});
		this.volumebtn.click(function(){controls.managedVideo.mutetoggle();});
		this.fsbtn.click(function(){controls.managedVideo.fullscreentoggle();});
		this.scrubber.click(function(e){controls._onScrubberClick(e);});
		//this.returnBtn.click(function(){controls.managedVideo.playlistReturn();});
	};
	Controls.prototype.setClasses = function() {
		var ext = this.extendedClass;
		var ovpclass = this.managedVideo.ovpconfig['ovp_container_class'];
		var cc = this.controlcontainer; cc.removeClass(); cc.addClass(ovpclass+'-controlcontainer'+ext);
		var cs = this.controlss; cs.removeClass(); cs.addClass(ovpclass+'-controls'+ext);
		var pp = this.playpause; pp.removeClass(); pp.addClass(ovpclass+'-playbtn'+ext); 
		var vb = this.volumebtn; vb.removeClass(); vb.addClass(ovpclass+'-volumebtn'+ext);
		var fsb = this.fsbtn; fsb.removeClass(); fsb.addClass(ovpclass+'-fullscreenbtn'+ext);
		var pos = this.position; pos.removeClass(); pos.addClass(ovpclass+'-position'+ext);
		var scrw = this.scrubber; scrw.removeClass(); scrw.addClass(ovpclass+"-scrubber"+ext);
		var scrp = this.scrubberp; scrp.removeClass(); scrp.addClass(ovpclass+'-scrubber-playing'+ext);
		var scrb = this.scrubberb; scrb.removeClass(); scrb.addClass(ovpclass+'-scrubber-buffered'+ext);
		var scrr = this.scrubberr; scrr.removeClass(); scrr.addClass(ovpclass+'-scrubber-remaining'+ext);
		var dur = this.duration; dur.removeClass(); dur.addClass(ovpclass+'-duration'+ext);
		//var ret = this.returnBtn; ret.removeClass(); ret.addClass(ovpclass+'-playlistbtn'+ext);
	};
	Controls.prototype.setPaused = function() {
		this.playpause.removeClass();
		this.playpause.addClass(this.managedVideo.ovpconfig['ovp_container_class']+'-playbtn'+this.extendedClass);
	}
	Controls.prototype.setPlaying = function() {
		this.playpause.removeClass();
		this.playpause.addClass(this.managedVideo.ovpconfig['ovp_container_class']+'-pausebtn'+this.extendedClass);
	}
	Controls.prototype.setVolumeBtn = function() {
		this.volumebtn.removeClass();
		this.volumebtn.addClass(this.managedVideo.ovpconfig['ovp_container_class']+'-volumebtn'+this.extendedClass);
	}
	Controls.prototype.setMutedBtn = function() {
		this.volumebtn.removeClass();
		this.volumebtn.addClass(this.managedVideo.ovpconfig['ovp_container_class']+'-mutedbtn'+this.extendedClass);
	}
	Controls.prototype.setExtendedClass = function(classext) {
		this.extendedClass = classext;
	}
	Controls.prototype.show = function(fnCallback) {
		if (isIDevice(navigator.userAgent)) return
		var controlcontainer = this.controlcontainer
		//this.returnBtn.fadeIn('fast')
		controlcontainer.fadeIn('fast', fnCallback);
	}
	Controls.prototype.hide = function(fnCallback) {
		if (isIDevice(navigator.userAgent)) return
		var controlcontainer = this.controlcontainer
		//this.returnBtn.fadeOut('fast')
		controlcontainer.fadeOut('fast', fnCallback);
	}
	Controls.prototype.remove = function() {
		var controlcontainer = this.controlcontainer
		controlcontainer.fadeOut('fast', function(){controlcontainer.remove();});
	}
	Controls.prototype.render = function() {
		var vid = this.managedVideo;
		var controlcontainer = this.controlcontainer;
		var controlss = this.controlss;
		//var returnBtn = this.returnBtn;
		this.setClasses();
		this.position.html( this._asTime(vid.getCurrentTime()) );
		this.duration.html( "-"+this._asTime(vid.getDuration()-vid.getCurrentTime()) );
		controlss.append(this.playpause);
		controlss.append(this.volumebtn);
		controlss.append(this.fsbtn);
		controlss.append(this.position);
		controlss.append(this.scrubber);
		controlss.append(this.duration);
		controlcontainer.append(controlss);
		controlcontainer.hide();
		//returnBtn.hide();
		$(vid.getWrapperNode()).append(controlcontainer);
		//$(vid.getWrapperNode()).append(returnBtn);
		controlcontainer.fadeIn('fast');
		//returnBtn.fadeIn('fast');
	};
	Controls.prototype.updateTimeline = function() {
		var mvid = this.managedVideo;
		this.position.html( this._asTime(mvid.getCurrentTime()) );
		this.duration.html( "-"+this._asTime(mvid.getDuration()-mvid.getCurrentTime()) );
		if (mvid.getDuration() > 0) {
			this._onProgress(mvid.getCurrentTime(), mvid.getDuration(), mvid.getBytesLoaded(), mvid.getTotalBytes());
		}
	}
	Controls.prototype._onPlaylistReturnClick = function(e) {
		return null;
	}
	Controls.prototype._onScrubberClick = function(e) {
		var posx = e.pageX;
		var posy = e.pageY;
		var scrubber = this.scrubber;
		var L = posx-scrubber.offset().left;
		var W = scrubber.width();
		if (L==0) { return null;}
		var p = (L/W)*this.managedVideo.getDuration(); // point in timeline to seek to
		this.managedVideo.seekTo(p);
		this.updateTimeline();
	}
	Controls.prototype._onProgress = function(playtime, playtotal, bytesLoaded, totalBytes) {
		var buffered = (bytesLoaded == 0 || totalBytes == 0) ? 0 : bytesLoaded/totalBytes;
		var totalWidth = this.scrubber.width();
		var progWidth = Math.round((totalWidth/playtotal)*playtime);
		var bufferWidth = Math.round( totalWidth*(buffered) )-progWidth;
		bufferWidth = (bufferWidth < 0) ? 0 : bufferWidth; // normalize to 0 in the case of a negative
		var remainWidth = Math.round(totalWidth-progWidth-bufferWidth);
		// Ensure that the total of all of these does not exceed the container width
		this.scrubberp.width( progWidth+'px' );
		this.scrubberb.width( bufferWidth+'px' );
		this.scrubberr.width( remainWidth+'px' );
	}
	Controls.prototype._asTime = function(t) {
		if (!t) return "00:00";
		t = Math.round(t);
		var s = t % 60;
		var m = Math.floor(t / 60);  
		return this._two(m) + ':' + this._two(s);		
	}
	Controls.prototype._two = function(s) {
		s += "";
		if (s.length < 2) s = "0" + s;
		return s;		
	}
	///////////////////////////////////////////////
	// Video Object
	var Video = function(config) {
		this.ovpconfig = config
		this.videoconfig = {"sources":[]};
		this.renderfunc = function(){};
		this.environment = {};
		this.parentNode = undefined;
		this.wrapperNode = undefined;
		this.player = undefined;
		this.controls = undefined;
		this.replacedContent = undefined;
		this.bytesLoaded = 1;
		this.bytesTotal = 1;
		this.controlsCountdown = config['control_keepalive_seconds'];
		this.controlsState = 'NOTRENDERED';
		var self = this;
		this.t = undefined; // update timer
	};
	/**
	 * starts the update timer for the video.
	 */
	Video.prototype._startCount = function() {
		var self = this; // scoping
		this.t = window.setInterval(function() {
	        if (self.isEnded() != true) {
				if (self.controlsState != 'HIDDEN') {
					self.controls.updateTimeline();
				}
	        } else {
				self.controls.setPaused();
	        }
			if ( self.controlsCountdown <= 0 ) {
				if (self.controlsState != 'HIDDEN' && self.controls && self.controls.hide) {
					self.hideControls();
				}
			} else {
				self.controlsCountdown--;
			}
	    }, 1000);		
	}
	/**
	 * retrieves the appropriate controls object
	 */
	Video.prototype._getControlsObject = function() {
		var controls = _pluginCaller(this.ovpconfig, 'getcontrolobj', this);
		if (controls) {
			return controls;
		} else {
			return new Controls(this);	// builtin defalut controls
		}
	}
	/**
	 * stops the update timer for the video
	 */
	Video.prototype._pauseCount = function() {
		window.clearInterval(this.t);
	}
	/**
	 * Returns the id of the video object
	 */
	Video.prototype.getID = function() {
		return this.videoconfig['id'] || generateGuid();
	}
	/**
	 * Returns the video object's parent node reference
	 */
	Video.prototype.getContainer = function() {
		return this.parentNode;
	}
	/**
	 * Gives the video object a standard render function to use for generating
	 * a player.
	 * @param {Function} renderfunc - the render function
	 */
	Video.prototype.setRenderFunction = function(renderfunc) {
		this.renderfunc = renderfunc;
	}
	/**
	 * Parses the configuration of this video from the given video tag
	 * @param {Object} node
	 */
	Video.prototype.parseFromDomNode = function(node) {
		// Parse the video node ourselves
		var sources = node.getElementsByTagName('source');
		for (var i = 0; i < sources.length; i++) {
				var src = {};
				var source = sources[i];
				src['src'] = source.getAttribute('src');
				src['type'] = source.getAttribute('type');
				src['codec'] = source.getAttribute('codec');
				src['bitrate'] = source.getAttribute('bitrate');
				this.videoconfig['sources'].push(src);
		}
		this.videoconfig['posterimg'] = node.getAttribute('poster');
		this.videoconfig['autoplay'] = new Boolean(node.getAttribute('autobuffer'));
		this.videoconfig['autobuffer'] = this.videoconfig['autoplay'];
		this.videoconfig['controls'] = new Boolean(node.getAttribute('controls'));
		this.videoconfig['height'] = node.getAttribute('height');
		this.videoconfig['width'] = node.getAttribute('width');
		this.videoconfig['scalemode'] = 'fit';
		if (!this.videoconfig['id'])
			this.videoconfig['id'] = node.getAttribute('id') || generateGuid();
	}

	/**
	 * retrieves the current timeline position of the player
	 */
	Video.prototype.getCurrentTime = function()	{
		return this.player.currentTime || 0;
	}
	
	/**
	 * retrieves the current duration of the player
	 */
	Video.prototype.getDuration = function() {
		return this.player.duration || 0;
	}
	
	/**
	 * retrieves the number of bytes in the buffer
	 */
	Video.prototype.getBytesLoaded = function() {
		return this.bytesLoaded || 0;
	}
	
	/**
	 * retrieves the total number of bytes of the video
	 */
	Video.prototype.getTotalBytes = function() {
		return this.bytesTotal || 0;
	}
	
	/**
	 * retrieves the div wrapper for the video
	 */
	Video.prototype.getWrapperNode = function() {
		return this.wrapperNode;
	}
	
	/**
	 * Returns a boolean indicating if the video object is currently playing
	 */
	Video.prototype.isPlaying = function() {
	    if (this.player.paused == false) return true;
		else return false;
	}

	/**
	 * Returns a boolean indicated if the video player has "ended"
	 */
	Video.prototype.isEnded = function() {
		return this.player.ended;
	}

	/**
	 * Returns a boolean indicating if the environment supports native fullscreen
	 */
	Video.prototype.supportsNativeFullscreen = function() {
		return this.player.webkitSupportsFullscreen;
	}

	/**
	 * shows the controls object
	 * @TODO: provide hook for user-supplied controls
	 */
	Video.prototype.showControls = function(fnCallback) {
		if (this.controlsState != 'VISIBLE') {
			if (! this.controls) {
				//this.controls = new Controls(this);
				this.controls = this._getControlsObject();
				this.controls.render();			
			} else {
				this.controls.show(fnCallback);
				this.controls.updateTimeline();
			}		
			this._startCount();
			this.controlsState = 'VISIBLE';
		}
	}
	
	Video.prototype.hideControls = function(fnCallback) {
		if (this.controlsState != 'HIDDEN') {
			if (this.controls) {
				this.controls.hide(fnCallback);
			}
			this._pauseCount();
			this.controlsState = 'HIDDEN';			
		}
	}

	/**
	 * Toggles between play and pause for this video
	 */
	Video.prototype.playpause = function() {
	    if ( this.isPlaying() ) {
	        this.player.pause();
	        this.controls.setPaused();
	    } else {
	        this.player.play();
			this.controls.updateTimeline();
			this.controls.setPlaying();
	    }
	}
	
	/**
	 * Seeks to a position in the video
	 * @param {Object} seconds
	 */
	Video.prototype.seekTo = function(seconds) {
		this.player.currentTime = seconds;
		return true;
	}
	
	/**
	 * Toggles between muted and unmuted for this video
	 */
	Video.prototype.mutetoggle = function() {
		if (this.player.volume == 0) {
			this.player.volume = 1.0;
			this.controls.setVolumeBtn();
		} else {
			this.player.volume = 0.0;
			this.controls.setMutedBtn();
		}
	}
	
	/**
	 * Toggles fullscreen on and off
	 */
	Video.prototype.fullscreentoggle = function() {
		//sniff for firefox to turn on/off animation because it's broken in FF
		var userAgent = navigator.userAgent.toLowerCase();
		var ff = (/mozilla/.test (userAgent) && !/(compatible|webkit)/.test(userAgent)) ? true : false;

		if ( this.supportsNativeFullscreen() ) {
			this.player.controls = true;
			this.player.webkitEnterFullScreen();
			return
		}
		var p = $(this.wrapperNode);
		var wind = $(window);
		var self = this;
		var env = this.environment;
		var controls = this.controls;
		this.goingFullScreen = true;

		if (this.environment.inFullscreen != true) {                                    
			this.environment.inFullscreen = true;
			if (!ff) {
				p.css('position', 'absolute');
				p.css('z-index', '99');
			}
			env.playerHeight = p.height();
			env.playerWidth = p.width();
			env.playerLeft = p.offset().left;
			env.playerTop = p.offset().top;
			env.windowHeight = wind.height();
			env.windowWidth = wind.width();
			env.scrollTop = wind.scrollTop();
			env.scrollLeft = wind.scrollLeft();
			this.hideControls(function(){
				var oncomplete = function(){
			        // switch control classes to fullscreen
					controls.setExtendedClass('-fs');
					controls.setClasses();
					if ( self.isPlaying() ) controls.setPlaying();
					else controls.setPaused();
					self.showControls();
					if (!ff) {
						p.removeClass();
						p.addClass(self.ovpconfig.ovp_container_class+'-video-wrapper-fs'); // set fullscreen class on wrapper
					}
					self.goingFullScreen = false;					
				};
				if (ff) {
					p.width(env.windowWidth+'px');
					p.height(env.windowHeight+'px');
					wind.scrollTop(p.offset().top);
					wind.scrollLeft(p.offset().left);
					oncomplete();
				} else {
					p.css('position', 'absolute');
					p.animate({width: '100%', height: '100%', left:0, top:0}, {duration: 400,complete: oncomplete });
				}
			});
	    } else {
			this.environment.inFullscreen = false;
			p.css('position', '');p.css('left', '');p.css('top', '');p.css('z-index','');
			this.hideControls(function(){
				var oncomplete = function() {
					// switch control classes to normal
					controls.setExtendedClass('');
					controls.setClasses();
					if ( self.isPlaying() ) controls.setPlaying();
					else controls.setPaused();
					self.showControls();
					if (!ff) {
						p.removeClass();
						p.addClass(self.ovpconfig.ovp_container_class+'-video-wrapper'); // set normal class on wrapper
					}
					self.goingFullScreen = false;
				};
				if (ff) {
					p.width(env.playerWidth+'px');
					p.height(env.playerHeight+'px');
					wind.scrollTop(env.scrollTop);
					wind.scrollLeft(env.scrollLeft);
					oncomplete();
				} else {
					p.css('position', ''); //reapply the class instead
					p.animate({width:self.environment.playerWidth, height:self.environment.playerHeight}, {duration:'fast',complete:oncomplete});
				}
			});
	    }
	}
	
	/**
	 * sets up fader events on the controls.  This is how the controls fade in/out
	 */
	Video.prototype.setupFader = function() {
		var self = this;
		var controls = this.controls;
		var p = $(this.wrapperNode);
		p.mousemove(function(){
			if ( ! self.goingFullScreen ) {
				self.controlsCountdown = self.ovpconfig['control_keepalive_seconds'];
				self.showControls();
			}
		});
		p.mouseleave(function(){
			if (!self.goingFullScreen) {
				self.hideControls();
			}
		});
	}
	
	/**
	 * determines what, if anything, the video thinks it can play based on what it knows
	 * about the media available. Overridden in each subclass.
	 * @returns Array of objects or false if nothing can be played
	 */
	Video.prototype.canPlay = function() {
		// this will be overridden so just say we'll play everything in the base-class
		var retval = [];
		var sources = this.videoconfig.sources;
		for (var i=0; i<sources.length; i++) {
			var source = sources[i];
			var bitrate = source.bitrate || 0;
			retval.push({'src':source.src, 'ismbr':false, 'bitrate':bitrate, 'type':source.type, 'codecs':source.codecs});
		}
		// return false or an array of objects		
		return ( retval.length ==0 ) ? false : retval;		
	}
	
	/**
	 * renders a player to the given node starting with a poster image
	 */
	Video.prototype._createPoster = function(callbackfn) {
		var self = this;
		var node = this.wrapperNode;
		var ud = $('<div style="height:100%;width:100%;min-height:100%;min-width:100%;background:url('+this.videoconfig.posterimg+') no-repeat center black;"></div>');
		node.append(ud);
		ud.fadeTo('slow', 0.4);
		var playcords = {
			top: ((this.videoconfig['height'] / 2) - 40),
			left: ((this.videoconfig['width'] / 2) - 40)
		}
		var playbtn = $('<img style="top:'+playcords.top+'px;left:'+playcords.left+'px;" id="'+this.videoconfig.id+'-bigplaybtn" class="'+this.ovpconfig.ovp_container_class+'-bigplaybtn" src="'+this.ovpconfig.controls.src_img+'"/>');
		playbtn.mouseenter(function(){ud.fadeTo('fast', 1.0)});
		playbtn.mouseleave(function(){ud.fadeTo('fast',0.4);});
		playbtn.click(callbackfn);
		node.append(playbtn);
	}

	/**
	 * Restores the video element to it's pre-render state
	 */
	Video.prototype.playlistReturn = function() {
		return null;
	}

	/**
	 * renders the poster and calls the object's renderfunc method to render the player
	 */
	Video.prototype.render = function(node) {
		// if it's a browser we'll render a fake poster otherwise no
		node = $(node);
		this.parentNode = node.parent();
		var div = $('<div id="'+this.videoconfig['id']+'" class="'+this.ovpconfig.ovp_container_class+'-video-wrapper'+'"></div>');
		this.wrapperNode = div;
		node.replaceWith(div);
		//if (isIDevice(navigator.userAgent) || this.ovpconfig['immediately']) {
		if (this.ovpconfig['immediately']) {
			this._renderImmediately();
		} else {
			this._renderWithPoster();
		}
	}
	//////////////////////////////////////////////////////////////////
	// HTML5Video Object
	//////////////////////////////////////////////////////////////////
	/**
	 * Create an HTML5Video object, decended from the Base Video class
	 * @param {Object} config
	 */
	var HTML5Video = function(config){
		HTML5Video.baseConstructor.call(this,config);
	};
	extend(HTML5Video, Video);
	
	/**
	 * assigns any events that are specific to the html5 player
	 */
	HTML5Video.prototype._assignEvents = function() {
		var self = this;
		// Track loaded bytes (could also compute and store rate here as well)
		_addEvent(this.player, 'progress', function(evt) {
			self.bytesLoaded = evt.loaded;
			self.bytesTotal = evt.total;
		});
	}

	/**
	 * Determines if ths object can play based on what's in the sources config
	 */	
	HTML5Video.prototype.canPlay = function() {
		var retval = [];
		var sources = this.videoconfig.sources;
		var userAgent = navigator.userAgent.toLowerCase();
		var FF = (/mozilla/.test (userAgent) && !/(compatible|webkit)/.test(userAgent)) ? true : false;
		for (var i=0; i<sources.length; i++) {
			var source = sources[i];
			var src = source.src;
			var bitrate = source.bitrate || 0;
			var url_qs_parts = src.split("?");
			var path_parts = String(url_qs_parts[0]).split('/');
			var extension = String(_getExtension(path_parts[path_parts.length-1]));
			var protocol = src.split('://')[0];
			//check the protocol
			if ( arrayContains(protocol, ['http','https'])) {
				// look for known extensions specific to browsers that support some chosen media types
				if ( (!FF) && arrayContains(extension, ['mp4','m4a','m4v','mp3']) ) {
					retval.push({'src':src,'ismbr':false,'srctype':'mediasource','type':source.type,'codecs':source.codecs});
				} else if ( (FF) && arrayContains(extension, ['ogg','oga','ogv']) ) {
					retval.push({'src':src,'ismbr':false,'srctype':'mediasource','type':source.type,'codecs':source.codecs});
				} else if ( (!FF) && extension == 'm3u8' && (isOSX106OrHigher(navigator.userAgent) || isIDevice(navigator.userAgent)) ) {
					retval.push({'src':src,'ismbr':true,'srctype':'refsource','type':source.type,'codecs':source.codecs});
				}
			}
		}
		// return false or an array of objects		
		return ( retval.length ==0 ) ? false : retval;
	}
	
	/**
	 * Internal render function used to actually create the video tag
	 */
	HTML5Video.prototype._render = function() {
		var vidHTML = '<video id="'+this.videoconfig.id+'" class="'+this.ovpconfig.ovp_container_class+'-video" poster="'+this.videoconfig.posterimg+'" ';
		//vidHTML += ( isIDevice(navigator.userAgent) ) ? 'controls >' : '>';
		vidHTML += '>';
		for (var x=0;x<this.videoconfig.sources.length;x++) {
			var src = this.videoconfig.sources[x];
			vidHTML += '<source src="'+src['src']+'"';
			if (src.type) vidHTML += ' type="'+src['type'];
			vidHTML += '"/>';
		}
		vidHTML += '</video>';
		var video = $(vidHTML);
		video.hide();
		this.wrapperNode.append(video);
		video.fadeIn('fast');
		this.player = video.get(0);				
		return video;
	}
	
	/**
	 * renders a player to the given node starting with a poster image
	 */
	HTML5Video.prototype._renderWithPoster = function() {
		var self = this;
		var node = this.wrapperNode;
		this._createPoster(function(){
			node.children().fadeOut('fast');
			node.empty();	// clear the contents of the node
			self._render();
			self._assignEvents();
			if (self.videoconfig.controls) {
				self.showControls();
				self.setupFader();
			}
			if (self.videoconfig.autobuffer || self.videoconfig.autoplay) {
				self.playpause();
			}
		});
	}
	
	HTML5Video.prototype._renderImmediately = function() {
		this._render();
		//if ( !isIDevice(navigator.userAgent) ) {
		if ( true ) {
			this._assignEvents();
			if (this.videoconfig.controls) {
				this.showControls();
				this.setupFader();
			}
			if (this.videoconfig.autobuffer || this.videoconfig.autoplay) {
				this.playpause();
			}
		}
	}
	//////////////////////////////////////////////////////////////////
	// FlashVideo Object
	//////////////////////////////////////////////////////////////////
	/**
	 * Create an FlashVideo object, decended from the Base Video class
	 * @param {Object} config
	 */
	var FlashVideo = function(config){
		FlashVideo.baseConstructor.call(this,config);
	};
	extend(FlashVideo, Video);

	/**
	 * example of how to override a method in the superclass
	 */	
	FlashVideo.prototype.fullscreentoggle = function() {
		FlashVideo.superClass.fullscreentoggle.call(this);
	}
	
	FlashVideo.prototype.isPlaying = function() {
	    if ( this.player.getFlashMediaProperty('paused') ) return false;
		else return true;
	}

	FlashVideo.prototype.mutetoggle = function() {
		if (this.player.getFlashMediaProperty('volume') == 0) {
			this.player.setFlashMediaProperty("volume", 1.0);
			this.controls.setVolumeBtn();
		} else {
			this.player.setFlashMediaProperty("volume", 0.0);
			this.controls.setMutedBtn();				
		}
	}
	/**
	 * retrieves the current timeline position of the player
	 */
	FlashVideo.prototype.getCurrentTime = function() {
		if (this.player.getFlashMediaProperty) {
			return this.player.getFlashMediaProperty("currentTime");
		} else {
			return 0;
		}
	}
	
	/**
	 * Toggles between play and pause for this video
	 */
	FlashVideo.prototype.playpause = function() {
	    if ( this.isPlaying() ) {
	        this.player.pauseFlashMedia();
	        this.controls.setPaused();
	    } else {
	        this.player.playFlashMedia();
			this.controls.updateTimeline();
			this.controls.setPlaying();
	    }
	}

	/**
	 * retrieves the current duration of the player
	 */
	FlashVideo.prototype.getDuration = function() {
		var d = 0;
		if (this.player.getFlashMediaProperty) {
			return this.player.getFlashMediaProperty("duration");
		} else {
			return 0;
		}
	}
	
	FlashVideo.prototype.seekTo = function(seconds) {
		this.player.setFlashMediaProperty("currentTime", seconds);
		return true;
	}
	
	FlashVideo.prototype.canPlay = function() {
		var retval = [];
		var sources = this.videoconfig.sources;
		for (var i=0; i<sources.length; i++) {
			var source = sources[i];
			var src = source.src;
			var bitrate = source.bitrate || 0;
			var url_qs_parts = src.split("?");
			var path_parts = String(url_qs_parts[0]).split('/');
			var extension = String(_getExtension(path_parts[path_parts.length-1]));

			// look for known extensions
			if ( arrayContains(extension, ['flv','f4v','f4f'])) { retval.push({'src':src,'ismbr':false,'srctype':'mediasource','type':source.type,'codecs':source.codecs});}
			else if ( arrayContains(extension, ['smi','smil'])) { retval.push({'src':src,'ismbr':true,'srctype':'refsource','type':source.type,'codecs':source.codecs});}
			else if ( arrayContains(extension, ['mp4','m4a','m4v','mp3']) ) { retval.push({'src':src,'ismbr':false,'srctype':'mediasource','type':source.type,'codecs':source.codecs}); }
		}
		// return false or an array of objects		
		return ( retval.length ==0 ) ? false : retval;
	}

	/**
	 * internal method call used for rendering the actual player
	 */
	FlashVideo.prototype._render = function(callbackfn) {
		var sources = this.canPlay();
		if (!sources) { return false; } //drop out if sources comes back false
		var div_id = generateGuid();
		var videoconf = this.videoconfig;
		var div = $('<div id="'+div_id+'">');
		var smode = (videoconf.scalemode) ? videoconf.scalemode : "fit";
		var pmode = (videoconf.playlistmode) ? videoconf.playlistmode : "overlay";
		this.wrapperNode.append(div);
		var source = sources[0];		
		//using swfobject new
		var flashvars = {'src':source.src,
						//'autostart':videoconf.autobuffer,
						'mode':pmode,
						'scaleMode':smode };
		var params = {'allowfullscreen':true, 'allowscriptaccess':'always', 'wmode':'transparent'};
		var attributes = {'id':videoconf.id,'class':this.ovpconfig.ovp_container_class+"-video"};
		swfobject.embedSWF(this.ovpconfig.players.Flash.src, div_id, videoconf.width, videoconf.height, this.ovpconfig.players.Flash.minver, '', flashvars, params, attributes, callbackfn);
	}
	
	/**
	 * renders a player/controls starting with a poster image
	 */
	FlashVideo.prototype._renderWithPoster = function() {
		var self = this;
		var sources = this.canPlay();
		if (!sources) { return false; } //drop out if sources comes back false
		var node = this.wrapperNode;
		this._createPoster(function(){
			node.children().fadeOut('fast');
			node.empty();	// clear the contents of the node
			//render the player
			self._render(function(ret){
				var source = sources[0];
				function finishFunc(){
					var player = ret.ref;
					if (!player.setFlashMediaProperty) { // look for flash to have exposed the interface and call ourselves if it has not yet.
						window.setTimeout(finishFunc, 100);
						return false;
					}
					player.setFlashMediaProperty("src", source.src);
					self.player = player;
					if (self.videoconfig.controls) {
						self.showControls();
						self.setupFader();
					}
					if (self.videoconfig.autobuffer || self.videoconfig.autoplay) {
						//Flash starts playing automatically so just set the fact that we're playing into the controls
						self.controls.setPlaying(); 
					}
				}
				window.setTimeout(finishFunc, 100);
			});			
		});
	}
	
	/**
	 * immediately renders a player and possibly controls
	 */
	FlashVideo.prototype._renderImmediately = function() {
		var self = this;
		var sources = this.canPlay();
		if (!sources) { return false; } //drop out if sources comes back false
		self._render(function(ret){
			var source = sources[0];
			//ANOTHER CALLBACK to wait for flash to be ready
			function finishFunc(){
				var player = ret.ref;
				if (!player.setFlashMediaProperty) { // look for flash to have exposed the interface and call ourselves if it has not yet.
					window.setTimeout(finishFunc, 100);
					return false;
				}
				player.setFlashMediaProperty("src", source.src);
				self.player = player;
				if (self.videoconfig.controls) {
					self.showControls();
					self.setupFader();
				}
				if (self.videoconfig.autobuffer || self.videoconfig.autoplay) {
					//Flash starts playing automatically so just set the fact that we're playing into the controls
					self.controls.setPlaying(); 
				}
			}
			window.setTimeout(finishFunc, 100);
		});
	}
	//////////////////////////////////////////////////////////////////
    // SilverlightVideo Object
    //////////////////////////////////////////////////////////////////
    /**
    * Create a SilverlightVideo object, decended from the Base Video class
    * @param {Object} config
    */
    var SilverlightVideo = function (config) {
		this._slPlayer = null;
        SilverlightVideo.baseConstructor.call(this, config);
    };
    extend(SilverlightVideo, Video);

    SilverlightVideo.prototype.fullscreentoggle = function () {
        SilverlightVideo.superClass.fullscreentoggle.call(this);
    }

    SilverlightVideo.prototype.isPlaying = function () {
        if (this._slPlayer.getMediaProperty('paused')) return false;
        else return true;
    }

    SilverlightVideo.prototype.isEnded = function () {
        if (this._slPlayer.getMediaProperty('ended')) {
			return true;
		}
        else return false;
    }

	/**
	 * Returns a boolean indicating if the environment supports native fullscreen
	 */
	SilverlightVideo.prototype.supportsNativeFullscreen = function() {
		return false;
	}

    SilverlightVideo.prototype.mutetoggle = function () {
        if (this._slPlayer.getMediaProperty('volume') == 0) {
            this._slPlayer.setMediaProperty("volume", 1.0);
            this.controls.setVolumeBtn();
        } else {
            this._slPlayer.setMediaProperty("volume", 0.0);
            this.controls.setMutedBtn();
        }
    }
    /**
    * retrieves the current timeline position of the player
    */
    SilverlightVideo.prototype.getCurrentTime = function () {
        //return (this._slPlayer.getMediaProperty) ? this._slPlayer.getMediaProperty("currentTime") || 0 : 0;
		try {
			return this._slPlayer.getMediaProperty("currentTime");
		} catch(error) {
			// should log this
		}
		return 0;
    }

    /**
    * retrieves the current duration of the player
    */
    SilverlightVideo.prototype.getDuration = function () {
		try {
			return this._slPlayer.getMediaProperty("duration");
		} catch(error) {
			// should log this
		}
		return 0;
    }

    SilverlightVideo.prototype.seekTo = function (seconds) {
        this._slPlayer.setMediaProperty("currentTime", seconds);
        return true;
    }

    /**
    * Toggles between play and pause for this video
    */
    SilverlightVideo.prototype.playpause = function () {
        if (this.isPlaying()) {
            this._slPlayer.pauseMedia();
            this.controls.setPaused();
        } else {
            this._slPlayer.playMedia();
            this.controls.updateTimeline();
            this.controls.setPlaying();
        }
    }

    SilverlightVideo.prototype.canPlay = function () {
        var retval = [];
        var sources = this.videoconfig.sources;
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            var src = source.src;
            var bitrate = source.bitrate || 0;
            var url_qs_parts = src.split("?");
            var path_parts = String(url_qs_parts[0]).split('/');
            var extension = String(_getExtension(path_parts[path_parts.length - 1])).toLowerCase();
            // look for known extensions
            if (arrayContains(extension, ['asf', 'wmv', 'wma'])) { retval.push({ 'src': src, 'ismbr': false, 'srctype': 'mediasource', 'type': source.type, 'codecs': source.codecs }); }
            else if (arrayContains(extension, ['asx', 'wvx', 'wax'])) { retval.push({ 'src': src, 'ismbr': false, 'srctype': 'refsource', 'type': source.type, 'codecs': source.codecs }); }
            else if (arrayContains(extension, ['manifest', 'ism\\manifest'])) { retval.push({ 'src': src, 'ismbr': true, 'srctype': 'mediasource', 'type': source.type, 'codecs': source.codecs }); }
            else if (arrayContains(extension, ['mp4', 'm4a', 'm4v', 'mp3'])) {
                //check the protocol
                var protocol = src.split('://');
				if (protocol.length > 1) {
					if (arrayContains(protocol[0], ['http', 'https'])) { retval.push({ 'src': src, 'ismbr': false, 'srctype': 'mediasource', 'type': source.type, 'codecs': source.codecs }); }
				}
            }
        }
        // return false or an array of objects		
        return (retval.length == 0) ? false : retval;
    }

	SilverlightVideo.prototype._getPlayerPluginStr = function() {
		var ret = "";
		if (this.ovpconfig.players['Silverlight'].plugins != undefined && this.ovpconfig.players['Silverlight'].plugins.length ) {
			ret = "smfPlugins=";
			for (var i=0; i<this.ovpconfig.players['Silverlight'].plugins.length; i++) {
				ret += this.ovpconfig.players['Silverlight'].plugins[i]+","
			}
		}
		return ret;
	}

    SilverlightVideo.prototype._render = function (callbackfn) {
        var sources = this.canPlay();
        if (!sources) { return false; } //drop out if sources comes back false
        var div_id = generateGuid();
        var videoconf = this.videoconfig;
        var div = $('<div id="' + div_id + '">');
		var player_plugins = this._getPlayerPluginStr();
        //this.wrapperNode.append(div);
        var source = sources[0];

        var slTag = Silverlight.createObject(
                        this.ovpconfig.players.Silverlight.src, //'OVP.xap',
                        null, //div.parent()[0],	// parent element
                        videoconf.id,
                        {
                            width: "" + videoconf.width,
                            height: "" + videoconf.height,
                            background: '#eeeeee',
                            version: this.ovpconfig.players.Silverlight.minver
                        },
                        { onLoad: callbackfn },
                        "autoplay=true, muted=false, playlistoverlay=false, stretchmode=UniformToFill, stretchmodefullscreen=UniformToFill, type=SupportPlayer, volume=1," +
						player_plugins + "enableOvpHtml5Interface=true, mediasource=" + source.src,
                        null);
		slTag = $(slTag).addClass(this.ovpconfig.ovp_container_class + "-video");				
        this.wrapperNode.append(slTag);
        //div.parent().html(slTag);
    }

    SilverlightVideo.prototype._renderWithPoster = function () {
        var self = this;
        var sources = this.canPlay();
        if (!sources) { return false; } //drop out if sources comes back false
        var node = this.wrapperNode;
        this._createPoster(function () {
            node.children().fadeOut('fast');
            node.empty(); // clear the contents of the node
            //render the player
            self._render(function (ret) {
                var source = sources[0];
                function finishFunc() {
                    self._slPlayer = ret.getHost().content.html5_sl_player;
                    if (!self._slPlayer) { // the player needs to initialize after the sl plugin is loaded...this typically happens after the template has been applied
                        window.setTimeout(finishFunc, 1000);
                        return false;
                    }
                    self.player = ret.getHost();
                    if (self.videoconfig.controls) {
                        self.showControls();
                        self.setupFader();
                    }
                    if (self.videoconfig.autobuffer || self.videoconfig.autoplay) {
                        //Silverlight starts playing automatically so just set the fact that we're playing into the controls
                        self.controls.setPlaying();
                    }
                }
                window.setTimeout(finishFunc, 100);
            });
        });
    }

	/**
    * immediately renders a player and possibly controls
    */
    SilverlightVideo.prototype._renderImmediately = function () {
        var self = this;
        var sources = this.canPlay();
        if (!sources) { return false; } //drop out if sources comes back false
        var node = this.wrapperNode;
        self._render(function (ret) {
            var source = sources[0];
            //ANOTHER CALLBACK to wait for silverlight to be ready
            function finishFunc() {
                self._slPlayer = ret.getHost().content.html5_sl_player;
                if (!self._slPlayer) { // the player needs to initialize after the sl plugin is loaded...this typically happens after the template has been applied
						window.setTimeout(finishFunc, 100);
						return false;
                    }
                self._slPlayer.setMediaProperty("src", source.src);
                self.player = ret.getHost();
                if (self.videoconfig.controls) {
                    self.showControls();
                    self.setupFader();
                }
                if (self.videoconfig.autobuffer || self.videoconfig.autoplay) {
                    //Silverlight starts playing automatically so just set the fact that we're playing into the controls
                    self.controls.setPlaying();
                }
            }
            window.setTimeout(finishFunc, 100);
        });
    }
	
	///////////////////////////////////////////////
	// Utility functions
	/**
	 * extends a subClass type from a baseClass type
	 * @param {Object} subClass
	 * @param {Object} baseClass
	 */
	function extend(subClass, baseClass) {
	   function inheritance() {}
	   inheritance.prototype = baseClass.prototype;
	   subClass.prototype = new inheritance();
	   subClass.prototype.constructor = subClass;
	   subClass.baseConstructor = baseClass;
	   subClass.superClass = baseClass.prototype;
	}

	/**
	 * adds a replace method much like append or prepend but handling the
	 * behavior of a dom-element's replaceChild method
	 */
	jQuery.fn.replace = function() {
	    var stack = [];
	    return this.domManip(arguments, true, 1, function(a){
	        this.parentNode.replaceChild( a, this );
	        stack.push(a);
	    }).pushStack( stack );
	};

	/**
	 * determines if the user-agent is an iDevice such as iPhone/iPod/iPad
	 * returns {boolean} true if it's an idevice
	 */
	function isIDevice(uagent) {
		if ( uagent.match(/iPhone/i) ) return true;
		if ( uagent.match(/iPod/i) ) return true;
		if ( uagent.match(/iPad/i) ) return true;
		return false;
	}
	
	function isOSX106OrHigher(uagent) {
		//var UA = String(uagent.match(/Intel Mac OS X 10_6/));
		var UA = String(uagent.match(/Intel Mac OS X [0-9_]+/));
		if ( !UA ) return false;
		var versmaj = UA.split('_')[0].split(' ')[4];
		var versmin = UA.split('_')[1];
		return ( (versmaj==10 && versmin>=6) || (versmaj>10) ) ? true : false;
	}

	/**
	 * Get the computed style of an element
	 * @param el {Node} the node to query for style information
	 * @param css_style {String} the style value to retrieve
	 */
	function getStyle(el, css_style){
		var current_value = "";
		if(document.defaultView && document.defaultView.getComputedStyle) {
			current_value = document.defaultView.getComputedStyle(el, "").getPropertyValue( cssStyle);
		} else if(oElm.currentStyle) {
			css_style = css_style.replace(/\-(\w)/g, function (x, y){ return y.toUpperCase(); });
			current_value = el.currentStyle[css_style];
		}
		return current_value;
	}

	/**
	 * Event adding.  Produces a dynamic function
	 * @param el {Node} the node to add the event to
	 * @param type {String} the event type to attach to
	 * @param fn {function} the function to execute
	 */
	_addEvent = (function () {
	  if (document.addEventListener) {
	    return function (el, type, fn) {
	      if (el && el.nodeName || el === window) {
	        el.addEventListener(type, fn, false);
	      } else if (el && el.length) {
	        for (var i = 0; i < el.length; i++) { addEvent(el[i], type, fn); }
	      }
	    };
	  } else {
	    return function (el, type, fn) {
	      if (el && el.nodeName || el === window) {
	        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
	      } else if (el && el.length) {
	        for (var i = 0; i < el.length; i++) { addEvent(el[i], type, fn); }
	      }
	    };
	  }
	})();

	/**
	 * Recursively merges two config objects 
	 * @param {Object} base - the base config (default)
	 * @param {Object} ext - the extending config
	 */
	function mergeConfigs(base, ext) {
		for (var p in ext) {
			try {
				// Property in destination object set; update its value.
				if ( ext[p].constructor==Object ) {
					base[p] = mergeConfig(base[p], ext[p]);
				} else {
					base[p] = ext[p];
				}
			} catch(e) {
				// Property in destination object not set; create it and set its value.
				base[p] = ext[p];
			}
		}
		return base;
	}

	/**
	 * Detects if an object is a string
	 * @param {Object} object
	 */
	function isString(object) {
		return Object.prototype.toString.call(object) === '[object String]';
	}


	/**
	 * Determines if the given element is in the given array
	 * @param element {Object} the element to look for in the array
	 * @param arr {array} the array to search
	 * @returns {Boolean}
	 */
	function arrayContains(element, arr) {
		for (var i=0;i<arr.length;i++) {
			if (arr[i] == element) { return true; }
		}
		return false;
	};
	
	/**
	 * Generates a GUID-like string using the most common approach
	 * @returns {String}
	 */
	function generateGuid() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		}
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	/**
	 * accepts a jfeeditem object and returns a video configuration
	 * @param {Object} item
	 */
	function item_to_videoconfig(item) {
		conf = {
			'sources':[],
			'posterimg':'',
			'autoplay':true,
			'autobuffer':true,
			'controls':true,
			'height':'354',
			'width':'640',
			'scalemode':'fit',
			'id':'someid'	
		};
		conf.posterimg = item.thumbnail;
		conf.id = item.id;
		var files = item.getFiles();
		for (var x=0;x<files.length;x++) {
			var file = files[x];
			var src = {'src':file.src,'type':file.type};
			conf.sources.push(src);
		}
		return conf;
	}
	
	/**
	 * parses the file extension from a filename
	 * @param filename {String} the filename
	 * @returns {String} the extension (excluding the .)
	 */
	function _getExtension(filename) {
		var fparts = filename.split('.');
		if (fparts.length == 0) return null;
		return fparts[fparts.length-1];
	}

	/**
	 * Finds the appropriate plugin from the plugins part of the passed config
	 * and manages the calling to/from the plugin.
	 * @param {Object} the standard ovp config object to examine for a plugin
	 * @param {String} hookname The name of the plugin hook to target.
	 * @param {Varient} ... other arguments to pass to the plugin hook call
	 */
	function _pluginCaller() {
		// make the arguments object an actual array so we can strip stuff off it
		var args = Array.prototype.slice.call(arguments);
		var cfg = args.shift();
		var hname = args.shift();
		// now look for our call and return the result of calling the function
		// if available
		for (var i=0;i<cfg.plugins.length;i++){
			var plugin = cfg.plugins[i];
			if (plugin['hook'] == hname) {
				return plugin['ref'](args);
			}
		}
		return null;
	}
	/***********************************************************************/
	/**************************Object***************************************/
	/***********************************************************************/
	///////////////////////////////////////////////
	// OVP Object
	/**
	 * The ovp object constructor, called internally and set as a page global.
	 */
	var _ovp = function(){
		this._config = DEFAULTS;
		this._defaults = DEFAULTS;
		this.product_info = PRODUCT_INFO;
	}
	
	/**
	 * Merges a config into the current config
	 * @param {Object} config - the config variables to pull in
	 */
	_ovp.prototype.init = function(config) {
		this._config = mergeConfigs(mergeConfigs(DEFAULTS, this._config), config);
	};

	/**
	 * Renders the player to the given node ID.  The children of this node will
	 be replaced so be warned.
	 * @param {Object} id The id of where to render the video
	 * @param {Object} videoconf The video configuration to render
	 */
	_ovp.prototype.render = function(element, videoconf){
		if (isString(element)) element = document.getElementById(element);
		if (!element) return;
		if (element) {
			this._playerRender(element, videoconf);
		}
	};

	/**
	 * Adopts all of the video tags on a page
	 * @param {String} selector - the selector syntax of the node(s) to adopt
	 */
	_ovp.prototype.adopt = function(){
		var videos = document.body.getElementsByTagName('video');
		for (var i=0;i<videos.length;i++) {
			this._playerRender(videos[i]);
		}
	};
	
	/**
	 * Renders the Feed Display class to the given node ID.  This will download the
	 * feed url and use its contents to add items to a particular location as a
	 * content-slider.
	 * @param {String} id - the id of the element where you would like to render the feed display
	 * @param {Object} feed - the url of the feed to use (must meet sandbox restrictions)
	 */
	_ovp.prototype.renderFeed = function(id, feed) {
		var self = this;	// scoping this for closure
		if (feed.items) {
			// is it an object, then just render it directly
			this._renderFeedObject(id, feed);
		} else {
			jQuery.getFeed({
				url: feed,
				success: function(feed) {
					self._renderFeedObject(id, feed);
				}
			});
		} 
	}

	_ovp.prototype._renderFeedObject = function(id, feed) {
		var self = this; //scoping this for closure
		var items = $('<ul></ul>');
		var html = '';
		var el = $('#'+id);
		for (var i = 0; i < feed.items.length; i++) {
			html = '';
			var item = feed.items[i];
			var l_item = $('<li style="position:relative;background-image:url('+item.thumbnail+');background-repeat:no-repeat;" id="'+item.id+'" ></li>');
			l_item.bind('click', {'item': item}, function(e){
				el.fadeOut('fast', function(){ //fade out and call render
					self.render(el.get(0), item_to_videoconfig(e.data.item))
				});
			});
			html += '<div style="position:absolute;top:0px;left:0px;height:100%;width:100%;"><img src="'+item.thumbnail+'" style="height:100%;width:100%;"></div><h2 style="background:black;opacity:.6;color:white;margin-bottom:0px;padding:.5em;">'+item.title+'</h2>';
			html += '<h3 style="background:black;opacity:.6;color:white;margin-top:0px;padding:.5em;">'+item.description+'</h3></li>';
			l_item.append($(html));
			items.append(l_item);
		}
		var player = $('<div class="feedSlider"></div>').append($('<div class="wrapper"></div>').append(items));
		el.append(player);
		player.feedSlider();
	}
		
	_ovp.prototype._playerRender = function(node, videoconf) {
		// Attempt any registered plugins for the Video Object
		var player = this._pluginCaller('strategy');
		if ( player && this._getPlayerTestFunction(player)() ) {
			var video = this._getVideoObject(player)
			video.render(node);
		} else {
			//determine a Video Object on our own, the plugin didn't give us one
			for (var x=0;x<this._config.strategy.order.length;x++) {
				player = this._config.strategy.order[x];
				if ( player && this._getPlayerTestFunction(player)(this._config.players[player].minver) ) {
					// The player seems to be able to handle the environment, now what about the video config
					var video = this._getVideoObject(player)
					if (videoconf) {
						video.videoconfig = videoconf;
					} else {
						video.parseFromDomNode(node);
					}
					if ( video.canPlay() ) {
						video.render(node);
						break;
					}
				}
			}
		}
	};
		
	/**
	 * Factory method, returns a testing function for the given type
	 * @param {String} type - the type to check for
	 */
	_ovp.prototype._getPlayerTestFunction = function(type) {
		var plugin_test_func = this._pluginCaller('gettestfunction', type);
		if (plugin_test_func) {
			return plugin_test_func;
		} else if (type == 'Flash') {
			return this.isFlashSupported;
		} else if (type == 'Silverlight') {
			return this.isSilverlightSupported;
		} else if (type == 'HTML5') {
			return this.isHTML5Supported;
		}
		return function(){return false;};
	}
	
	/**
	 * Factory method, returns a video object for the given type
	 * @param {String} type - the type to check for
	 */
	_ovp.prototype._getVideoObject = function(type) {
		var pluginVideoObject = this._pluginCaller('getvideoobject', type);
		if (pluginVideoObject) {
			return pluginVideoObject
		} else if (type == 'Flash') {
			return new FlashVideo(this._config);
		} else if (type == 'Silverlight') {
			return new SilverlightVideo(this._config);
		} else if (type == 'HTML5') {
			return new HTML5Video(this._config);
		}
		return function(){new Video(this._config);};
	}
	
	/**
	 * Detects browser support for the video tag.
	 * @returns {boolean} the result of the test
	 */
	_ovp.prototype.isHTML5Supported = function(minver){
		var vidtest = document.createElement('video');
		return (('controls' in vidtest));
	};
	
	/**
	 * Detects browser support for Flash, uses swfobject's built in detection.
	 * @returns {boolean} the result of the test
	 */
	_ovp.prototype.isFlashSupported = function(minver){
		return swfobject.hasFlashPlayerVersion(minver);
	};
	
	/**
	 * Detects browser support for Silverlight, uses silverlight.js's built in
	 * detection.
	 * @returns {boolean} the result of the test
	 */
	_ovp.prototype.isSilverlightSupported = function(minver){
		return Silverlight.isInstalled(minver);
	};
		
	/**
	 * Finds the appropriate plugin from the plugins config on the object and
	 * manages the calling to/from the plugin.
	 * @param {String} hookname The name of the plugin hook to target.
	 */
	_ovp.prototype._pluginCaller = function(hookname) {
		for (var i=0;i<this._config.plugins.length;i++){
			var plugin = this._config.plugins[i];
			if (plugin['hook'] == hookname) {
				return plugin['ref'](arguments);
			}
		}
		return null;
	}
	
	///////////////////////////////////////////////
	// Default Configuration
	var DEFAULTS = {
		"controls": {
			'src_img':'images/pixel.png'	// the path to a transparent pixel to use for buttons (we set the actual button image with the css background)
		},
		"players": {
			"Flash":{"src":"ovp.swf","minver":"9","controls":true, "plugins":[]},
			// add the path to your SmoothStreamingPlugin.xap file in the plugins array to enable smooth streaming
			"Silverlight":{"src":"ovp.xap","minver":"4.0","controls":true, "plugins":[]},
			"HTML5":{"minver":"0","controls":true}
		},
		"strategy":{
			"order":["HTML5","Flash","Silverlight"]	// Case is important
		},
		"plugins":[
			{"hook":"parsevideotag", "ref":function(){}},
			{"hook":"strategy", "ref":function(){}},
			{"hook":"gettestfunction", "ref":function(){return null;}},
			{"hook":"getrenderfunction", "ref":function(){return null;}},
			{"hook":"getvideoobject", "ref":function(){}},
			{"hook":"addplayer", "ref":function(){}},
			{"hook":"getvideoobj", "ref":function(){return null;}},
			{"hook":"getcontrolobj", "ref":function(){return null;}},
		],
		"ovp_container_class":"ovp",	// this classname is prepended to all css classes
		"control_keepalive_seconds":5,	// The approximate number of seconds until controls fade out with no mouse movement
		"immediately": false			// Will the player render immediately when player-render fires or will it start with a poster image
	};
	
	// Expose OVP to the global window
	window.ovp = new _ovp();
})(window);
