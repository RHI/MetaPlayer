/*
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */
(function(aM,C){var a=function(aY,aZ){return new a.fn.init(aY,aZ)},n=aM.jQuery,R=aM.$,ab=aM.document,X,P=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,aW=/^.[^:#\[\.,]*$/,ax=/\S/,M=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,e=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,b=navigator.userAgent,u,K=false,ad=[],aG,at=Object.prototype.toString,ap=Object.prototype.hasOwnProperty,g=Array.prototype.push,F=Array.prototype.slice,s=Array.prototype.indexOf;a.fn=a.prototype={init:function(aY,a1){var a0,a2,aZ,a3;if(!aY){return this}if(aY.nodeType){this.context=this[0]=aY;this.length=1;return this}if(aY==="body"&&!a1){this.context=ab;this[0]=ab.body;this.selector="body";this.length=1;return this}if(typeof aY==="string"){a0=P.exec(aY);if(a0&&(a0[1]||!a1)){if(a0[1]){a3=(a1?a1.ownerDocument||a1:ab);aZ=e.exec(aY);if(aZ){if(a.isPlainObject(a1)){aY=[ab.createElement(aZ[1])];a.fn.attr.call(aY,a1,true)}else{aY=[a3.createElement(aZ[1])]}}else{aZ=J([a0[1]],[a3]);aY=(aZ.cacheable?aZ.fragment.cloneNode(true):aZ.fragment).childNodes}return a.merge(this,aY)}else{a2=ab.getElementById(a0[2]);if(a2){if(a2.id!==a0[2]){return X.find(aY)}this.length=1;this[0]=a2}this.context=ab;this.selector=aY;return this}}else{if(!a1&&/^\w+$/.test(aY)){this.selector=aY;this.context=ab;aY=ab.getElementsByTagName(aY);return a.merge(this,aY)}else{if(!a1||a1.jquery){return(a1||X).find(aY)}else{return a(a1).find(aY)}}}}else{if(a.isFunction(aY)){return X.ready(aY)}}if(aY.selector!==C){this.selector=aY.selector;this.context=aY.context}return a.makeArray(aY,this)},selector:"",jquery:"1.4.2",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(aY){return aY==null?this.toArray():(aY<0?this.slice(aY)[0]:this[aY])},pushStack:function(aZ,a1,aY){var a0=a();if(a.isArray(aZ)){g.apply(a0,aZ)}else{a.merge(a0,aZ)}a0.prevObject=this;a0.context=this.context;if(a1==="find"){a0.selector=this.selector+(this.selector?" ":"")+aY}else{if(a1){a0.selector=this.selector+"."+a1+"("+aY+")"}}return a0},each:function(aZ,aY){return a.each(this,aZ,aY)},ready:function(aY){a.bindReady();if(a.isReady){aY.call(ab,a)}else{if(ad){ad.push(aY)}}return this},eq:function(aY){return aY===-1?this.slice(aY):this.slice(aY,+aY+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(aY){return this.pushStack(a.map(this,function(a0,aZ){return aY.call(a0,aZ,a0)}))},end:function(){return this.prevObject||a(null)},push:g,sort:[].sort,splice:[].splice};a.fn.init.prototype=a.fn;a.extend=a.fn.extend=function(){var a3=arguments[0]||{},a2=1,a1=arguments.length,a5=false,a6,a0,aY,aZ;if(typeof a3==="boolean"){a5=a3;a3=arguments[1]||{};a2=2}if(typeof a3!=="object"&&!a.isFunction(a3)){a3={}}if(a1===a2){a3=this;--a2}for(;a2<a1;a2++){if((a6=arguments[a2])!=null){for(a0 in a6){aY=a3[a0];aZ=a6[a0];if(a3===aZ){continue}if(a5&&aZ&&(a.isPlainObject(aZ)||a.isArray(aZ))){var a4=aY&&(a.isPlainObject(aY)||a.isArray(aY))?aY:a.isArray(aZ)?[]:{};a3[a0]=a.extend(a5,a4,aZ)}else{if(aZ!==C){a3[a0]=aZ}}}}}return a3};a.extend({noConflict:function(aY){aM.$=R;if(aY){aM.jQuery=n}return a},isReady:false,ready:function(){if(!a.isReady){if(!ab.body){return setTimeout(a.ready,13)}a.isReady=true;if(ad){var aZ,aY=0;while((aZ=ad[aY++])){aZ.call(ab,a)}ad=null}if(a.fn.triggerHandler){a(ab).triggerHandler("ready")}}},bindReady:function(){if(K){return}K=true;if(ab.readyState==="complete"){return a.ready()}if(ab.addEventListener){ab.addEventListener("DOMContentLoaded",aG,false);aM.addEventListener("load",a.ready,false)}else{if(ab.attachEvent){ab.attachEvent("onreadystatechange",aG);aM.attachEvent("onload",a.ready);var aY=false;try{aY=aM.frameElement==null}catch(aZ){}if(ab.documentElement.doScroll&&aY){x()}}}},isFunction:function(aY){return at.call(aY)==="[object Function]"},isArray:function(aY){return at.call(aY)==="[object Array]"},isPlainObject:function(aZ){if(!aZ||at.call(aZ)!=="[object Object]"||aZ.nodeType||aZ.setInterval){return false}if(aZ.constructor&&!ap.call(aZ,"constructor")&&!ap.call(aZ.constructor.prototype,"isPrototypeOf")){return false}var aY;for(aY in aZ){}return aY===C||ap.call(aZ,aY)},isEmptyObject:function(aZ){for(var aY in aZ){return false}return true},error:function(aY){throw aY},parseJSON:function(aY){if(typeof aY!=="string"||!aY){return null}aY=a.trim(aY);if(/^[\],:{}\s]*$/.test(aY.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){return aM.JSON&&aM.JSON.parse?aM.JSON.parse(aY):(new Function("return "+aY))()}else{a.error("Invalid JSON: "+aY)}},noop:function(){},globalEval:function(a0){if(a0&&ax.test(a0)){var aZ=ab.getElementsByTagName("head")[0]||ab.documentElement,aY=ab.createElement("script");aY.type="text/javascript";if(a.support.scriptEval){aY.appendChild(ab.createTextNode(a0))}else{aY.text=a0}aZ.insertBefore(aY,aZ.firstChild);aZ.removeChild(aY)}},nodeName:function(aZ,aY){return aZ.nodeName&&aZ.nodeName.toUpperCase()===aY.toUpperCase()},each:function(a1,a5,a0){var aZ,a2=0,a3=a1.length,aY=a3===C||a.isFunction(a1);if(a0){if(aY){for(aZ in a1){if(a5.apply(a1[aZ],a0)===false){break}}}else{for(;a2<a3;){if(a5.apply(a1[a2++],a0)===false){break}}}}else{if(aY){for(aZ in a1){if(a5.call(a1[aZ],aZ,a1[aZ])===false){break}}}else{for(var a4=a1[0];a2<a3&&a5.call(a4,a2,a4)!==false;a4=a1[++a2]){}}}return a1},trim:function(aY){return(aY||"").replace(M,"")},makeArray:function(a0,aZ){var aY=aZ||[];if(a0!=null){if(a0.length==null||typeof a0==="string"||a.isFunction(a0)||(typeof a0!=="function"&&a0.setInterval)){g.call(aY,a0)}else{a.merge(aY,a0)}}return aY},inArray:function(a0,a1){if(a1.indexOf){return a1.indexOf(a0)}for(var aY=0,aZ=a1.length;aY<aZ;aY++){if(a1[aY]===a0){return aY}}return -1},merge:function(a2,a0){var a1=a2.length,aZ=0;if(typeof a0.length==="number"){for(var aY=a0.length;aZ<aY;aZ++){a2[a1++]=a0[aZ]}}else{while(a0[aZ]!==C){a2[a1++]=a0[aZ++]}}a2.length=a1;return a2},grep:function(aZ,a3,aY){var a0=[];for(var a1=0,a2=aZ.length;a1<a2;a1++){if(!aY!==!a3(aZ[a1],a1)){a0.push(aZ[a1])}}return a0},map:function(aZ,a4,aY){var a0=[],a3;for(var a1=0,a2=aZ.length;a1<a2;a1++){a3=a4(aZ[a1],a1,aY);if(a3!=null){a0[a0.length]=a3}}return a0.concat.apply([],a0)},guid:1,proxy:function(a0,aZ,aY){if(arguments.length===2){if(typeof aZ==="string"){aY=a0;a0=aY[aZ];aZ=C}else{if(aZ&&!a.isFunction(aZ)){aY=aZ;aZ=C}}}if(!aZ&&a0){aZ=function(){return a0.apply(aY||this,arguments)}}if(a0){aZ.guid=a0.guid=a0.guid||aZ.guid||a.guid++}return aZ},uaMatch:function(aZ){aZ=aZ.toLowerCase();var aY=/(webkit)[ \/]([\w.]+)/.exec(aZ)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(aZ)||/(msie) ([\w.]+)/.exec(aZ)||!/compatible/.test(aZ)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(aZ)||[];return{browser:aY[1]||"",version:aY[2]||"0"}},browser:{}});u=a.uaMatch(b);if(u.browser){a.browser[u.browser]=true;a.browser.version=u.version}if(a.browser.webkit){a.browser.safari=true}if(s){a.inArray=function(aY,aZ){return s.call(aZ,aY)}}X=a(ab);if(ab.addEventListener){aG=function(){ab.removeEventListener("DOMContentLoaded",aG,false);a.ready()}}else{if(ab.attachEvent){aG=function(){if(ab.readyState==="complete"){ab.detachEvent("onreadystatechange",aG);a.ready()}}}}function x(){if(a.isReady){return}try{ab.documentElement.doScroll("left")}catch(aY){setTimeout(x,1);return}a.ready()}function aV(aY,aZ){if(aZ.src){a.ajax({url:aZ.src,async:false,dataType:"script"})}else{a.globalEval(aZ.text||aZ.textContent||aZ.innerHTML||"")}if(aZ.parentNode){aZ.parentNode.removeChild(aZ)}}function an(aY,a6,a4,a0,a3,a5){var aZ=aY.length;if(typeof a6==="object"){for(var a1 in a6){an(aY,a1,a6[a1],a0,a3,a4)}return aY}if(a4!==C){a0=!a5&&a0&&a.isFunction(a4);for(var a2=0;a2<aZ;a2++){a3(aY[a2],a6,a0?a4.call(aY[a2],a2,a3(aY[a2],a6)):a4,a5)}return aY}return aZ?a3(aY[0],a6):C}function aP(){return(new Date).getTime()}(function(){a.support={};var a4=ab.documentElement,a3=ab.createElement("script"),aY=ab.createElement("div"),aZ="script"+aP();aY.style.display="none";aY.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";var a6=aY.getElementsByTagName("*"),a5=aY.getElementsByTagName("a")[0];if(!a6||!a6.length||!a5){return}a.support={leadingWhitespace:aY.firstChild.nodeType===3,tbody:!aY.getElementsByTagName("tbody").length,htmlSerialize:!!aY.getElementsByTagName("link").length,style:/red/.test(a5.getAttribute("style")),hrefNormalized:a5.getAttribute("href")==="/a",opacity:/^0.55$/.test(a5.style.opacity),cssFloat:!!a5.style.cssFloat,checkOn:aY.getElementsByTagName("input")[0].value==="on",optSelected:ab.createElement("select").appendChild(ab.createElement("option")).selected,parentNode:aY.removeChild(aY.appendChild(ab.createElement("div"))).parentNode===null,deleteExpando:true,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};a3.type="text/javascript";try{a3.appendChild(ab.createTextNode("window."+aZ+"=1;"))}catch(a1){}a4.insertBefore(a3,a4.firstChild);if(aM[aZ]){a.support.scriptEval=true;delete aM[aZ]}try{delete a3.test}catch(a1){a.support.deleteExpando=false}a4.removeChild(a3);if(aY.attachEvent&&aY.fireEvent){aY.attachEvent("onclick",function a7(){a.support.noCloneEvent=false;aY.detachEvent("onclick",a7)});aY.cloneNode(true).fireEvent("onclick")}aY=ab.createElement("div");aY.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";var a0=ab.createDocumentFragment();a0.appendChild(aY.firstChild);a.support.checkClone=a0.cloneNode(true).cloneNode(true).lastChild.checked;a(function(){var a8=ab.createElement("div");a8.style.width=a8.style.paddingLeft="1px";ab.body.appendChild(a8);a.boxModel=a.support.boxModel=a8.offsetWidth===2;ab.body.removeChild(a8).style.display="none";a8=null});var a2=function(a8){var ba=ab.createElement("div");a8="on"+a8;var a9=(a8 in ba);if(!a9){ba.setAttribute(a8,"return;");a9=typeof ba[a8]==="function"}ba=null;return a9};a.support.submitBubbles=a2("submit");a.support.changeBubbles=a2("change");a4=a3=aY=a6=a5=null})();a.props={"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var aI="jQuery"+aP(),aH=0,aT={};a.extend({cache:{},expando:aI,noData:{embed:true,object:true,applet:true},data:function(a0,aZ,a2){if(a0.nodeName&&a.noData[a0.nodeName.toLowerCase()]){return}a0=a0==aM?aT:a0;var a3=a0[aI],aY=a.cache,a1;if(!a3&&typeof aZ==="string"&&a2===C){return null}if(!a3){a3=++aH}if(typeof aZ==="object"){a0[aI]=a3;a1=aY[a3]=a.extend(true,{},aZ)}else{if(!aY[a3]){a0[aI]=a3;aY[a3]={}}}a1=aY[a3];if(a2!==C){a1[aZ]=a2}return typeof aZ==="string"?a1[aZ]:a1},removeData:function(a0,aZ){if(a0.nodeName&&a.noData[a0.nodeName.toLowerCase()]){return}a0=a0==aM?aT:a0;var a2=a0[aI],aY=a.cache,a1=aY[a2];if(aZ){if(a1){delete a1[aZ];if(a.isEmptyObject(a1)){a.removeData(a0)}}}else{if(a.support.deleteExpando){delete a0[a.expando]}else{if(a0.removeAttribute){a0.removeAttribute(a.expando)}}delete aY[a2]}}});a.fn.extend({data:function(aY,a0){if(typeof aY==="undefined"&&this.length){return a.data(this[0])}else{if(typeof aY==="object"){return this.each(function(){a.data(this,aY)})}}var a1=aY.split(".");a1[1]=a1[1]?"."+a1[1]:"";if(a0===C){var aZ=this.triggerHandler("getData"+a1[1]+"!",[a1[0]]);if(aZ===C&&this.length){aZ=a.data(this[0],aY)}return aZ===C&&a1[1]?this.data(a1[0]):aZ}else{return this.trigger("setData"+a1[1]+"!",[a1[0],a0]).each(function(){a.data(this,aY,a0)})}},removeData:function(aY){return this.each(function(){a.removeData(this,aY)})}});a.extend({queue:function(aZ,aY,a1){if(!aZ){return}aY=(aY||"fx")+"queue";var a0=a.data(aZ,aY);if(!a1){return a0||[]}if(!a0||a.isArray(a1)){a0=a.data(aZ,aY,a.makeArray(a1))}else{a0.push(a1)}return a0},dequeue:function(a1,a0){a0=a0||"fx";var aY=a.queue(a1,a0),aZ=aY.shift();if(aZ==="inprogress"){aZ=aY.shift()}if(aZ){if(a0==="fx"){aY.unshift("inprogress")}aZ.call(a1,function(){a.dequeue(a1,a0)})}}});a.fn.extend({queue:function(aY,aZ){if(typeof aY!=="string"){aZ=aY;aY="fx"}if(aZ===C){return a.queue(this[0],aY)}return this.each(function(a1,a2){var a0=a.queue(this,aY,aZ);if(aY==="fx"&&a0[0]!=="inprogress"){a.dequeue(this,aY)}})},dequeue:function(aY){return this.each(function(){a.dequeue(this,aY)})},delay:function(aZ,aY){aZ=a.fx?a.fx.speeds[aZ]||aZ:aZ;aY=aY||"fx";return this.queue(aY,function(){var a0=this;setTimeout(function(){a.dequeue(a0,aY)},aZ)})},clearQueue:function(aY){return this.queue(aY||"fx",[])}});var ao=/[\n\t]/g,S=/\s+/,av=/\r/g,aQ=/href|src|style/,d=/(button|input)/i,z=/(button|input|object|select|textarea)/i,j=/^(a|area)$/i,I=/radio|checkbox/;a.fn.extend({attr:function(aY,aZ){return an(this,aY,aZ,true,a.attr)},removeAttr:function(aY,aZ){return this.each(function(){a.attr(this,aY,"");if(this.nodeType===1){this.removeAttribute(aY)}})},addClass:function(a5){if(a.isFunction(a5)){return this.each(function(a8){var a7=a(this);a7.addClass(a5.call(this,a8,a7.attr("class")))})}if(a5&&typeof a5==="string"){var aY=(a5||"").split(S);for(var a1=0,a0=this.length;a1<a0;a1++){var aZ=this[a1];if(aZ.nodeType===1){if(!aZ.className){aZ.className=a5}else{var a2=" "+aZ.className+" ",a4=aZ.className;for(var a3=0,a6=aY.length;a3<a6;a3++){if(a2.indexOf(" "+aY[a3]+" ")<0){a4+=" "+aY[a3]}}aZ.className=a.trim(a4)}}}}return this},removeClass:function(a3){if(a.isFunction(a3)){return this.each(function(a7){var a6=a(this);a6.removeClass(a3.call(this,a7,a6.attr("class")))})}if((a3&&typeof a3==="string")||a3===C){var a4=(a3||"").split(S);for(var a0=0,aZ=this.length;a0<aZ;a0++){var a2=this[a0];if(a2.nodeType===1&&a2.className){if(a3){var a1=(" "+a2.className+" ").replace(ao," ");for(var a5=0,aY=a4.length;a5<aY;a5++){a1=a1.replace(" "+a4[a5]+" "," ")}a2.className=a.trim(a1)}else{a2.className=""}}}}return this},toggleClass:function(a1,aZ){var a0=typeof a1,aY=typeof aZ==="boolean";if(a.isFunction(a1)){return this.each(function(a3){var a2=a(this);a2.toggleClass(a1.call(this,a3,a2.attr("class"),aZ),aZ)})}return this.each(function(){if(a0==="string"){var a4,a3=0,a2=a(this),a5=aZ,a6=a1.split(S);while((a4=a6[a3++])){a5=aY?a5:!a2.hasClass(a4);a2[a5?"addClass":"removeClass"](a4)}}else{if(a0==="undefined"||a0==="boolean"){if(this.className){a.data(this,"__className__",this.className)}this.className=this.className||a1===false?"":a.data(this,"__className__")||""}}})},hasClass:function(aY){var a1=" "+aY+" ";for(var a0=0,aZ=this.length;a0<aZ;a0++){if((" "+this[a0].className+" ").replace(ao," ").indexOf(a1)>-1){return true}}return false},val:function(a5){if(a5===C){var aZ=this[0];if(aZ){if(a.nodeName(aZ,"option")){return(aZ.attributes.value||{}).specified?aZ.value:aZ.text}if(a.nodeName(aZ,"select")){var a3=aZ.selectedIndex,a6=[],a7=aZ.options,a2=aZ.type==="select-one";if(a3<0){return null}for(var a0=a2?a3:0,a4=a2?a3+1:a7.length;a0<a4;a0++){var a1=a7[a0];if(a1.selected){a5=a(a1).val();if(a2){return a5}a6.push(a5)}}return a6}if(I.test(aZ.type)&&!a.support.checkOn){return aZ.getAttribute("value")===null?"on":aZ.value}return(aZ.value||"").replace(av,"")}return C}var aY=a.isFunction(a5);return this.each(function(ba){var a9=a(this),bb=a5;if(this.nodeType!==1){return}if(aY){bb=a5.call(this,ba,a9.val())}if(typeof bb==="number"){bb+=""}if(a.isArray(bb)&&I.test(this.type)){this.checked=a.inArray(a9.val(),bb)>=0}else{if(a.nodeName(this,"select")){var a8=a.makeArray(bb);a("option",this).each(function(){this.selected=a.inArray(a(this).val(),a8)>=0});if(!a8.length){this.selectedIndex=-1}}else{this.value=bb}}})}});a.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(aZ,aY,a4,a7){if(!aZ||aZ.nodeType===3||aZ.nodeType===8){return C}if(a7&&aY in a.attrFn){return a(aZ)[aY](a4)}var a0=aZ.nodeType!==1||!a.isXMLDoc(aZ),a3=a4!==C;aY=a0&&a.props[aY]||aY;if(aZ.nodeType===1){var a2=aQ.test(aY);if(aY==="selected"&&!a.support.optSelected){var a5=aZ.parentNode;if(a5){a5.selectedIndex;if(a5.parentNode){a5.parentNode.selectedIndex}}}if(aY in aZ&&a0&&!a2){if(a3){if(aY==="type"&&d.test(aZ.nodeName)&&aZ.parentNode){a.error("type property can't be changed")}aZ[aY]=a4}if(a.nodeName(aZ,"form")&&aZ.getAttributeNode(aY)){return aZ.getAttributeNode(aY).nodeValue}if(aY==="tabIndex"){var a6=aZ.getAttributeNode("tabIndex");return a6&&a6.specified?a6.value:z.test(aZ.nodeName)||j.test(aZ.nodeName)&&aZ.href?0:C}return aZ[aY]}if(!a.support.style&&a0&&aY==="style"){if(a3){aZ.style.cssText=""+a4}return aZ.style.cssText}if(a3){aZ.setAttribute(aY,""+a4)}var a1=!a.support.hrefNormalized&&a0&&a2?aZ.getAttribute(aY,2):aZ.getAttribute(aY);return a1===null?C:a1}return a.style(aZ,aY,a4)}});var aC=/\.(.*)$/,A=function(aY){return aY.replace(/[^\w\s\.\|`]/g,function(aZ){return"\\"+aZ})};a.event={add:function(a1,a5,ba,a3){if(a1.nodeType===3||a1.nodeType===8){return}if(a1.setInterval&&(a1!==aM&&!a1.frameElement)){a1=aM}var aZ,a9;if(ba.handler){aZ=ba;ba=aZ.handler}if(!ba.guid){ba.guid=a.guid++}var a6=a.data(a1);if(!a6){return}var bb=a6.events=a6.events||{},a4=a6.handle,a4;if(!a4){a6.handle=a4=function(){return typeof a!=="undefined"&&!a.event.triggered?a.event.handle.apply(a4.elem,arguments):C}}a4.elem=a1;a5=a5.split(" ");var a8,a2=0,aY;while((a8=a5[a2++])){a9=aZ?a.extend({},aZ):{handler:ba,data:a3};if(a8.indexOf(".")>-1){aY=a8.split(".");a8=aY.shift();a9.namespace=aY.slice(0).sort().join(".")}else{aY=[];a9.namespace=""}a9.type=a8;a9.guid=ba.guid;var a0=bb[a8],a7=a.event.special[a8]||{};if(!a0){a0=bb[a8]=[];if(!a7.setup||a7.setup.call(a1,a3,aY,a4)===false){if(a1.addEventListener){a1.addEventListener(a8,a4,false)}else{if(a1.attachEvent){a1.attachEvent("on"+a8,a4)}}}}if(a7.add){a7.add.call(a1,a9);if(!a9.handler.guid){a9.handler.guid=ba.guid}}a0.push(a9);a.event.global[a8]=true}a1=null},global:{},remove:function(bd,a8,aZ,a4){if(bd.nodeType===3||bd.nodeType===8){return}var bg,a3,a5,bb=0,a1,a6,a9,a2,a7,aY,bf,bc=a.data(bd),a0=bc&&bc.events;if(!bc||!a0){return}if(a8&&a8.type){aZ=a8.handler;a8=a8.type}if(!a8||typeof a8==="string"&&a8.charAt(0)==="."){a8=a8||"";for(a3 in a0){a.event.remove(bd,a3+a8)}return}a8=a8.split(" ");while((a3=a8[bb++])){bf=a3;aY=null;a1=a3.indexOf(".")<0;a6=[];if(!a1){a6=a3.split(".");a3=a6.shift();a9=new RegExp("(^|\\.)"+a.map(a6.slice(0).sort(),A).join("\\.(?:.*\\.)?")+"(\\.|$)")}a7=a0[a3];if(!a7){continue}if(!aZ){for(var ba=0;ba<a7.length;ba++){aY=a7[ba];if(a1||a9.test(aY.namespace)){a.event.remove(bd,bf,aY.handler,ba);a7.splice(ba--,1)}}continue}a2=a.event.special[a3]||{};for(var ba=a4||0;ba<a7.length;ba++){aY=a7[ba];if(aZ.guid===aY.guid){if(a1||a9.test(aY.namespace)){if(a4==null){a7.splice(ba--,1)}if(a2.remove){a2.remove.call(bd,aY)}}if(a4!=null){break}}}if(a7.length===0||a4!=null&&a7.length===1){if(!a2.teardown||a2.teardown.call(bd,a6)===false){ag(bd,a3,bc.handle)}bg=null;delete a0[a3]}}if(a.isEmptyObject(a0)){var be=bc.handle;if(be){be.elem=null}delete bc.events;delete bc.handle;if(a.isEmptyObject(bc)){a.removeData(bd)}}},trigger:function(aY,a2,a0){var a7=aY.type||aY,a1=arguments[3];if(!a1){aY=typeof aY==="object"?aY[aI]?aY:a.extend(a.Event(a7),aY):a.Event(a7);if(a7.indexOf("!")>=0){aY.type=a7=a7.slice(0,-1);aY.exclusive=true}if(!a0){aY.stopPropagation();if(a.event.global[a7]){a.each(a.cache,function(){if(this.events&&this.events[a7]){a.event.trigger(aY,a2,this.handle.elem)}})}}if(!a0||a0.nodeType===3||a0.nodeType===8){return C}aY.result=C;aY.target=a0;a2=a.makeArray(a2);a2.unshift(aY)}aY.currentTarget=a0;var a3=a.data(a0,"handle");if(a3){a3.apply(a0,a2)}var a8=a0.parentNode||a0.ownerDocument;try{if(!(a0&&a0.nodeName&&a.noData[a0.nodeName.toLowerCase()])){if(a0["on"+a7]&&a0["on"+a7].apply(a0,a2)===false){aY.result=false}}}catch(a5){}if(!aY.isPropagationStopped()&&a8){a.event.trigger(aY,a2,a8,true)}else{if(!aY.isDefaultPrevented()){var a4=aY.target,aZ,a9=a.nodeName(a4,"a")&&a7==="click",a6=a.event.special[a7]||{};if((!a6._default||a6._default.call(a0,aY)===false)&&!a9&&!(a4&&a4.nodeName&&a.noData[a4.nodeName.toLowerCase()])){try{if(a4[a7]){aZ=a4["on"+a7];if(aZ){a4["on"+a7]=null}a.event.triggered=true;a4[a7]()}}catch(a5){}if(aZ){a4["on"+a7]=aZ}a.event.triggered=false}}}},handle:function(aY){var a6,a0,aZ,a1,a7;aY=arguments[0]=a.event.fix(aY||aM.event);aY.currentTarget=this;a6=aY.type.indexOf(".")<0&&!aY.exclusive;if(!a6){aZ=aY.type.split(".");aY.type=aZ.shift();a1=new RegExp("(^|\\.)"+aZ.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)")}var a7=a.data(this,"events"),a0=a7[aY.type];if(a7&&a0){a0=a0.slice(0);for(var a3=0,a2=a0.length;a3<a2;a3++){var a5=a0[a3];if(a6||a1.test(a5.namespace)){aY.handler=a5.handler;aY.data=a5.data;aY.handleObj=a5;var a4=a5.handler.apply(this,arguments);if(a4!==C){aY.result=a4;if(a4===false){aY.preventDefault();aY.stopPropagation()}}if(aY.isImmediatePropagationStopped()){break}}}}return aY.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(a1){if(a1[aI]){return a1}var aZ=a1;a1=a.Event(aZ);for(var a0=this.props.length,a3;a0;){a3=this.props[--a0];a1[a3]=aZ[a3]}if(!a1.target){a1.target=a1.srcElement||ab}if(a1.target.nodeType===3){a1.target=a1.target.parentNode}if(!a1.relatedTarget&&a1.fromElement){a1.relatedTarget=a1.fromElement===a1.target?a1.toElement:a1.fromElement}if(a1.pageX==null&&a1.clientX!=null){var a2=ab.documentElement,aY=ab.body;a1.pageX=a1.clientX+(a2&&a2.scrollLeft||aY&&aY.scrollLeft||0)-(a2&&a2.clientLeft||aY&&aY.clientLeft||0);a1.pageY=a1.clientY+(a2&&a2.scrollTop||aY&&aY.scrollTop||0)-(a2&&a2.clientTop||aY&&aY.clientTop||0)}if(!a1.which&&((a1.charCode||a1.charCode===0)?a1.charCode:a1.keyCode)){a1.which=a1.charCode||a1.keyCode}if(!a1.metaKey&&a1.ctrlKey){a1.metaKey=a1.ctrlKey}if(!a1.which&&a1.button!==C){a1.which=(a1.button&1?1:(a1.button&2?3:(a1.button&4?2:0)))}return a1},guid:100000000,proxy:a.proxy,special:{ready:{setup:a.bindReady,teardown:a.noop},live:{add:function(aY){a.event.add(this,aY.origType,a.extend({},aY,{handler:V}))},remove:function(aZ){var aY=true,a0=aZ.origType.replace(aC,"");a.each(a.data(this,"events").live||[],function(){if(a0===this.origType.replace(aC,"")){aY=false;return false}});if(aY){a.event.remove(this,aZ.origType,V)}}},beforeunload:{setup:function(a0,aZ,aY){if(this.setInterval){this.onbeforeunload=aY}return false},teardown:function(aZ,aY){if(this.onbeforeunload===aY){this.onbeforeunload=null}}}}};var ag=ab.removeEventListener?function(aZ,aY,a0){aZ.removeEventListener(aY,a0,false)}:function(aZ,aY,a0){aZ.detachEvent("on"+aY,a0)};a.Event=function(aY){if(!this.preventDefault){return new a.Event(aY)}if(aY&&aY.type){this.originalEvent=aY;this.type=aY.type}else{this.type=aY}this.timeStamp=aP();this[aI]=true};function aR(){return false}function f(){return true}a.Event.prototype={preventDefault:function(){this.isDefaultPrevented=f;var aY=this.originalEvent;if(!aY){return}if(aY.preventDefault){aY.preventDefault()}aY.returnValue=false},stopPropagation:function(){this.isPropagationStopped=f;var aY=this.originalEvent;if(!aY){return}if(aY.stopPropagation){aY.stopPropagation()}aY.cancelBubble=true},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=f;this.stopPropagation()},isDefaultPrevented:aR,isPropagationStopped:aR,isImmediatePropagationStopped:aR};var Q=function(aZ){var aY=aZ.relatedTarget;try{while(aY&&aY!==this){aY=aY.parentNode}if(aY!==this){aZ.type=aZ.data;a.event.handle.apply(this,arguments)}}catch(a0){}},ay=function(aY){aY.type=aY.data;a.event.handle.apply(this,arguments)};a.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(aZ,aY){a.event.special[aZ]={setup:function(a0){a.event.add(this,aY,a0&&a0.selector?ay:Q,aZ)},teardown:function(a0){a.event.remove(this,aY,a0&&a0.selector?ay:Q)}}});if(!a.support.submitBubbles){a.event.special.submit={setup:function(aZ,aY){if(this.nodeName.toLowerCase()!=="form"){a.event.add(this,"click.specialSubmit",function(a2){var a1=a2.target,a0=a1.type;if((a0==="submit"||a0==="image")&&a(a1).closest("form").length){return aA("submit",this,arguments)}});a.event.add(this,"keypress.specialSubmit",function(a2){var a1=a2.target,a0=a1.type;if((a0==="text"||a0==="password")&&a(a1).closest("form").length&&a2.keyCode===13){return aA("submit",this,arguments)}})}else{return false}},teardown:function(aY){a.event.remove(this,".specialSubmit")}}}if(!a.support.changeBubbles){var aq=/textarea|input|select/i,aS,i=function(aZ){var aY=aZ.type,a0=aZ.value;if(aY==="radio"||aY==="checkbox"){a0=aZ.checked}else{if(aY==="select-multiple"){a0=aZ.selectedIndex>-1?a.map(aZ.options,function(a1){return a1.selected}).join("-"):""}else{if(aZ.nodeName.toLowerCase()==="select"){a0=aZ.selectedIndex}}}return a0},O=function O(a0){var aY=a0.target,aZ,a1;if(!aq.test(aY.nodeName)||aY.readOnly){return}aZ=a.data(aY,"_change_data");a1=i(aY);if(a0.type!=="focusout"||aY.type!=="radio"){a.data(aY,"_change_data",a1)}if(aZ===C||a1===aZ){return}if(aZ!=null||a1){a0.type="change";return a.event.trigger(a0,arguments[1],aY)}};a.event.special.change={filters:{focusout:O,click:function(a0){var aZ=a0.target,aY=aZ.type;if(aY==="radio"||aY==="checkbox"||aZ.nodeName.toLowerCase()==="select"){return O.call(this,a0)}},keydown:function(a0){var aZ=a0.target,aY=aZ.type;if((a0.keyCode===13&&aZ.nodeName.toLowerCase()!=="textarea")||(a0.keyCode===32&&(aY==="checkbox"||aY==="radio"))||aY==="select-multiple"){return O.call(this,a0)}},beforeactivate:function(aZ){var aY=aZ.target;a.data(aY,"_change_data",i(aY))}},setup:function(a0,aZ){if(this.type==="file"){return false}for(var aY in aS){a.event.add(this,aY+".specialChange",aS[aY])}return aq.test(this.nodeName)},teardown:function(aY){a.event.remove(this,".specialChange");return aq.test(this.nodeName)}};aS=a.event.special.change.filters}function aA(aZ,a0,aY){aY[0].type=aZ;return a.event.handle.apply(a0,aY)}if(ab.addEventListener){a.each({focus:"focusin",blur:"focusout"},function(a0,aY){a.event.special[aY]={setup:function(){this.addEventListener(a0,aZ,true)},teardown:function(){this.removeEventListener(a0,aZ,true)}};function aZ(a1){a1=a.event.fix(a1);a1.type=aY;return a.event.handle.call(this,a1)}})}a.each(["bind","one"],function(aZ,aY){a.fn[aY]=function(a5,a6,a4){if(typeof a5==="object"){for(var a2 in a5){this[aY](a2,a6,a5[a2],a4)}return this}if(a.isFunction(a6)){a4=a6;a6=C}var a3=aY==="one"?a.proxy(a4,function(a7){a(this).unbind(a7,a3);return a4.apply(this,arguments)}):a4;if(a5==="unload"&&aY!=="one"){this.one(a5,a6,a4)}else{for(var a1=0,a0=this.length;a1<a0;a1++){a.event.add(this[a1],a5,a3,a6)}}return this}});a.fn.extend({unbind:function(a2,a1){if(typeof a2==="object"&&!a2.preventDefault){for(var a0 in a2){this.unbind(a0,a2[a0])}}else{for(var aZ=0,aY=this.length;aZ<aY;aZ++){a.event.remove(this[aZ],a2,a1)}}return this},delegate:function(aY,aZ,a1,a0){return this.live(aZ,a1,a0,aY)},undelegate:function(aY,aZ,a0){if(arguments.length===0){return this.unbind("live")}else{return this.die(aZ,null,a0,aY)}},trigger:function(aY,aZ){return this.each(function(){a.event.trigger(aY,aZ,this)})},triggerHandler:function(aY,a0){if(this[0]){var aZ=a.Event(aY);aZ.preventDefault();aZ.stopPropagation();a.event.trigger(aZ,a0,this[0]);return aZ.result}},toggle:function(a0){var aY=arguments,aZ=1;while(aZ<aY.length){a.proxy(a0,aY[aZ++])}return this.click(a.proxy(a0,function(a1){var a2=(a.data(this,"lastToggle"+a0.guid)||0)%aZ;a.data(this,"lastToggle"+a0.guid,a2+1);a1.preventDefault();return aY[a2].apply(this,arguments)||false}))},hover:function(aY,aZ){return this.mouseenter(aY).mouseleave(aZ||aY)}});var aw={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};a.each(["live","die"],function(aZ,aY){a.fn[aY]=function(a7,a4,a9,a2){var a8,a5=0,a6,a1,ba,a3=a2||this.selector,a0=a2?this:a(this.context);if(a.isFunction(a4)){a9=a4;a4=C}a7=(a7||"").split(" ");while((a8=a7[a5++])!=null){a6=aC.exec(a8);a1="";if(a6){a1=a6[0];a8=a8.replace(aC,"")}if(a8==="hover"){a7.push("mouseenter"+a1,"mouseleave"+a1);continue}ba=a8;if(a8==="focus"||a8==="blur"){a7.push(aw[a8]+a1);a8=a8+a1}else{a8=(aw[a8]||a8)+a1}if(aY==="live"){a0.each(function(){a.event.add(this,m(a8,a3),{data:a4,selector:a3,handler:a9,origType:a8,origHandler:a9,preType:ba})})}else{a0.unbind(m(a8,a3),a9)}}return this}});function V(aY){var a8,aZ=[],bb=[],a7=arguments,ba,a6,a9,a1,a3,a5,a2,a4,bc=a.data(this,"events");if(aY.liveFired===this||!bc||!bc.live||aY.button&&aY.type==="click"){return}aY.liveFired=this;var a0=bc.live.slice(0);for(a3=0;a3<a0.length;a3++){a9=a0[a3];if(a9.origType.replace(aC,"")===aY.type){bb.push(a9.selector)}else{a0.splice(a3--,1)}}a6=a(aY.target).closest(bb,aY.currentTarget);for(a5=0,a2=a6.length;a5<a2;a5++){for(a3=0;a3<a0.length;a3++){a9=a0[a3];if(a6[a5].selector===a9.selector){a1=a6[a5].elem;ba=null;if(a9.preType==="mouseenter"||a9.preType==="mouseleave"){ba=a(aY.relatedTarget).closest(a9.selector)[0]}if(!ba||ba!==a1){aZ.push({elem:a1,handleObj:a9})}}}}for(a5=0,a2=aZ.length;a5<a2;a5++){a6=aZ[a5];aY.currentTarget=a6.elem;aY.data=a6.handleObj.data;aY.handleObj=a6.handleObj;if(a6.handleObj.origHandler.apply(a6.elem,a7)===false){a8=false;break}}return a8}function m(aZ,aY){return"live."+(aZ&&aZ!=="*"?aZ+".":"")+aY.replace(/\./g,"`").replace(/ /g,"&")}a.each(("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error").split(" "),function(aZ,aY){a.fn[aY]=function(a0){return a0?this.bind(aY,a0):this.trigger(aY)};if(a.attrFn){a.attrFn[aY]=true}});if(aM.attachEvent&&!aM.addEventListener){aM.attachEvent("onunload",function(){for(var aZ in a.cache){if(a.cache[aZ].handle){try{a.event.remove(a.cache[aZ].handle.elem)}catch(aY){}}}});
/*
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
}(function(){var a9=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,ba=0,bc=Object.prototype.toString,a4=false,a3=true;[0,0].sort(function(){a3=false;return 0});var a0=function(bl,bg,bo,bp){bo=bo||[];var br=bg=bg||ab;if(bg.nodeType!==1&&bg.nodeType!==9){return[]}if(!bl||typeof bl!=="string"){return bo}var bm=[],bi,bt,bw,bh,bk=true,bj=a1(bg),bq=bl;while((a9.exec(""),bi=a9.exec(bq))!==null){bq=bi[3];bm.push(bi[1]);if(bi[2]){bh=bi[3];break}}if(bm.length>1&&a5.exec(bl)){if(bm.length===2&&a6.relative[bm[0]]){bt=bd(bm[0]+bm[1],bg)}else{bt=a6.relative[bm[0]]?[bg]:a0(bm.shift(),bg);while(bm.length){bl=bm.shift();if(a6.relative[bl]){bl+=bm.shift()}bt=bd(bl,bt)}}}else{if(!bp&&bm.length>1&&bg.nodeType===9&&!bj&&a6.match.ID.test(bm[0])&&!a6.match.ID.test(bm[bm.length-1])){var bs=a0.find(bm.shift(),bg,bj);bg=bs.expr?a0.filter(bs.expr,bs.set)[0]:bs.set[0]}if(bg){var bs=bp?{expr:bm.pop(),set:a8(bp)}:a0.find(bm.pop(),bm.length===1&&(bm[0]==="~"||bm[0]==="+")&&bg.parentNode?bg.parentNode:bg,bj);bt=bs.expr?a0.filter(bs.expr,bs.set):bs.set;if(bm.length>0){bw=a8(bt)}else{bk=false}while(bm.length){var bv=bm.pop(),bu=bv;if(!a6.relative[bv]){bv=""}else{bu=bm.pop()}if(bu==null){bu=bg}a6.relative[bv](bw,bu,bj)}}else{bw=bm=[]}}if(!bw){bw=bt}if(!bw){a0.error(bv||bl)}if(bc.call(bw)==="[object Array]"){if(!bk){bo.push.apply(bo,bw)}else{if(bg&&bg.nodeType===1){for(var bn=0;bw[bn]!=null;bn++){if(bw[bn]&&(bw[bn]===true||bw[bn].nodeType===1&&a7(bg,bw[bn]))){bo.push(bt[bn])}}}else{for(var bn=0;bw[bn]!=null;bn++){if(bw[bn]&&bw[bn].nodeType===1){bo.push(bt[bn])}}}}}else{a8(bw,bo)}if(bh){a0(bh,br,bo,bp);a0.uniqueSort(bo)}return bo};a0.uniqueSort=function(bh){if(bb){a4=a3;bh.sort(bb);if(a4){for(var bg=1;bg<bh.length;bg++){if(bh[bg]===bh[bg-1]){bh.splice(bg--,1)}}}}return bh};a0.matches=function(bg,bh){return a0(bg,null,null,bh)};a0.find=function(bn,bg,bo){var bm,bk;if(!bn){return[]}for(var bj=0,bi=a6.order.length;bj<bi;bj++){var bl=a6.order[bj],bk;if((bk=a6.leftMatch[bl].exec(bn))){var bh=bk[1];bk.splice(1,1);if(bh.substr(bh.length-1)!=="\\"){bk[1]=(bk[1]||"").replace(/\\/g,"");bm=a6.find[bl](bk,bg,bo);if(bm!=null){bn=bn.replace(a6.match[bl],"");break}}}}if(!bm){bm=bg.getElementsByTagName("*")}return{set:bm,expr:bn}};a0.filter=function(br,bq,bu,bk){var bi=br,bw=[],bo=bq,bm,bg,bn=bq&&bq[0]&&a1(bq[0]);while(br&&bq.length){for(var bp in a6.filter){if((bm=a6.leftMatch[bp].exec(br))!=null&&bm[2]){var bh=a6.filter[bp],bv,bt,bj=bm[1];bg=false;bm.splice(1,1);if(bj.substr(bj.length-1)==="\\"){continue}if(bo===bw){bw=[]}if(a6.preFilter[bp]){bm=a6.preFilter[bp](bm,bo,bu,bw,bk,bn);if(!bm){bg=bv=true}else{if(bm===true){continue}}}if(bm){for(var bl=0;(bt=bo[bl])!=null;bl++){if(bt){bv=bh(bt,bm,bl,bo);var bs=bk^!!bv;if(bu&&bv!=null){if(bs){bg=true}else{bo[bl]=false}}else{if(bs){bw.push(bt);bg=true}}}}}if(bv!==C){if(!bu){bo=bw}br=br.replace(a6.match[bp],"");if(!bg){return[]}break}}}if(br===bi){if(bg==null){a0.error(br)}else{break}}bi=br}return bo};a0.error=function(bg){throw"Syntax error, unrecognized expression: "+bg};var a6=a0.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(bg){return bg.getAttribute("href")}},relative:{"+":function(bm,bh){var bj=typeof bh==="string",bl=bj&&!/\W/.test(bh),bn=bj&&!bl;if(bl){bh=bh.toLowerCase()}for(var bi=0,bg=bm.length,bk;bi<bg;bi++){if((bk=bm[bi])){while((bk=bk.previousSibling)&&bk.nodeType!==1){}bm[bi]=bn||bk&&bk.nodeName.toLowerCase()===bh?bk||false:bk===bh}}if(bn){a0.filter(bh,bm,true)}},">":function(bm,bh){var bk=typeof bh==="string";if(bk&&!/\W/.test(bh)){bh=bh.toLowerCase();for(var bi=0,bg=bm.length;bi<bg;bi++){var bl=bm[bi];if(bl){var bj=bl.parentNode;bm[bi]=bj.nodeName.toLowerCase()===bh?bj:false}}}else{for(var bi=0,bg=bm.length;bi<bg;bi++){var bl=bm[bi];if(bl){bm[bi]=bk?bl.parentNode:bl.parentNode===bh}}if(bk){a0.filter(bh,bm,true)}}},"":function(bj,bh,bl){var bi=ba++,bg=be;if(typeof bh==="string"&&!/\W/.test(bh)){var bk=bh=bh.toLowerCase();bg=aY}bg("parentNode",bh,bi,bj,bk,bl)},"~":function(bj,bh,bl){var bi=ba++,bg=be;if(typeof bh==="string"&&!/\W/.test(bh)){var bk=bh=bh.toLowerCase();bg=aY}bg("previousSibling",bh,bi,bj,bk,bl)}},find:{ID:function(bh,bi,bj){if(typeof bi.getElementById!=="undefined"&&!bj){var bg=bi.getElementById(bh[1]);return bg?[bg]:[]}},NAME:function(bi,bl){if(typeof bl.getElementsByName!=="undefined"){var bh=[],bk=bl.getElementsByName(bi[1]);for(var bj=0,bg=bk.length;bj<bg;bj++){if(bk[bj].getAttribute("name")===bi[1]){bh.push(bk[bj])}}return bh.length===0?null:bh}},TAG:function(bg,bh){return bh.getElementsByTagName(bg[1])}},preFilter:{CLASS:function(bj,bh,bi,bg,bm,bn){bj=" "+bj[1].replace(/\\/g,"")+" ";if(bn){return bj}for(var bk=0,bl;(bl=bh[bk])!=null;bk++){if(bl){if(bm^(bl.className&&(" "+bl.className+" ").replace(/[\t\n]/g," ").indexOf(bj)>=0)){if(!bi){bg.push(bl)}}else{if(bi){bh[bk]=false}}}}return false},ID:function(bg){return bg[1].replace(/\\/g,"")},TAG:function(bh,bg){return bh[1].toLowerCase()},CHILD:function(bg){if(bg[1]==="nth"){var bh=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(bg[2]==="even"&&"2n"||bg[2]==="odd"&&"2n+1"||!/\D/.test(bg[2])&&"0n+"+bg[2]||bg[2]);bg[2]=(bh[1]+(bh[2]||1))-0;bg[3]=bh[3]-0}bg[0]=ba++;return bg},ATTR:function(bk,bh,bi,bg,bl,bm){var bj=bk[1].replace(/\\/g,"");if(!bm&&a6.attrMap[bj]){bk[1]=a6.attrMap[bj]}if(bk[2]==="~="){bk[4]=" "+bk[4]+" "}return bk},PSEUDO:function(bk,bh,bi,bg,bl){if(bk[1]==="not"){if((a9.exec(bk[3])||"").length>1||/^\w/.test(bk[3])){bk[3]=a0(bk[3],null,null,bh)}else{var bj=a0.filter(bk[3],bh,bi,true^bl);if(!bi){bg.push.apply(bg,bj)}return false}}else{if(a6.match.POS.test(bk[0])||a6.match.CHILD.test(bk[0])){return true}}return bk},POS:function(bg){bg.unshift(true);return bg}},filters:{enabled:function(bg){return bg.disabled===false&&bg.type!=="hidden"},disabled:function(bg){return bg.disabled===true},checked:function(bg){return bg.checked===true},selected:function(bg){bg.parentNode.selectedIndex;return bg.selected===true},parent:function(bg){return !!bg.firstChild},empty:function(bg){return !bg.firstChild},has:function(bi,bh,bg){return !!a0(bg[3],bi).length},header:function(bg){return/h\d/i.test(bg.nodeName)},text:function(bg){return"text"===bg.type},radio:function(bg){return"radio"===bg.type},checkbox:function(bg){return"checkbox"===bg.type},file:function(bg){return"file"===bg.type},password:function(bg){return"password"===bg.type},submit:function(bg){return"submit"===bg.type},image:function(bg){return"image"===bg.type},reset:function(bg){return"reset"===bg.type},button:function(bg){return"button"===bg.type||bg.nodeName.toLowerCase()==="button"},input:function(bg){return/input|select|textarea|button/i.test(bg.nodeName)}},setFilters:{first:function(bh,bg){return bg===0},last:function(bi,bh,bg,bj){return bh===bj.length-1},even:function(bh,bg){return bg%2===0},odd:function(bh,bg){return bg%2===1},lt:function(bi,bh,bg){return bh<bg[3]-0},gt:function(bi,bh,bg){return bh>bg[3]-0},nth:function(bi,bh,bg){return bg[3]-0===bh},eq:function(bi,bh,bg){return bg[3]-0===bh}},filter:{PSEUDO:function(bm,bi,bj,bn){var bh=bi[1],bk=a6.filters[bh];if(bk){return bk(bm,bj,bi,bn)}else{if(bh==="contains"){return(bm.textContent||bm.innerText||aZ([bm])||"").indexOf(bi[3])>=0}else{if(bh==="not"){var bl=bi[3];for(var bj=0,bg=bl.length;bj<bg;bj++){if(bl[bj]===bm){return false}}return true}else{a0.error("Syntax error, unrecognized expression: "+bh)}}}},CHILD:function(bg,bj){var bm=bj[1],bh=bg;switch(bm){case"only":case"first":while((bh=bh.previousSibling)){if(bh.nodeType===1){return false}}if(bm==="first"){return true}bh=bg;case"last":while((bh=bh.nextSibling)){if(bh.nodeType===1){return false}}return true;case"nth":var bi=bj[2],bp=bj[3];if(bi===1&&bp===0){return true}var bl=bj[0],bo=bg.parentNode;if(bo&&(bo.sizcache!==bl||!bg.nodeIndex)){var bk=0;for(bh=bo.firstChild;bh;bh=bh.nextSibling){if(bh.nodeType===1){bh.nodeIndex=++bk}}bo.sizcache=bl}var bn=bg.nodeIndex-bp;if(bi===0){return bn===0}else{return(bn%bi===0&&bn/bi>=0)}}},ID:function(bh,bg){return bh.nodeType===1&&bh.getAttribute("id")===bg},TAG:function(bh,bg){return(bg==="*"&&bh.nodeType===1)||bh.nodeName.toLowerCase()===bg},CLASS:function(bh,bg){return(" "+(bh.className||bh.getAttribute("class"))+" ").indexOf(bg)>-1},ATTR:function(bl,bj){var bi=bj[1],bg=a6.attrHandle[bi]?a6.attrHandle[bi](bl):bl[bi]!=null?bl[bi]:bl.getAttribute(bi),bm=bg+"",bk=bj[2],bh=bj[4];return bg==null?bk==="!=":bk==="="?bm===bh:bk==="*="?bm.indexOf(bh)>=0:bk==="~="?(" "+bm+" ").indexOf(bh)>=0:!bh?bm&&bg!==false:bk==="!="?bm!==bh:bk==="^="?bm.indexOf(bh)===0:bk==="$="?bm.substr(bm.length-bh.length)===bh:bk==="|="?bm===bh||bm.substr(0,bh.length+1)===bh+"-":false},POS:function(bk,bh,bi,bl){var bg=bh[2],bj=a6.setFilters[bg];if(bj){return bj(bk,bi,bh,bl)}}}};var a5=a6.match.POS;for(var a2 in a6.match){a6.match[a2]=new RegExp(a6.match[a2].source+/(?![^\[]*\])(?![^\(]*\))/.source);a6.leftMatch[a2]=new RegExp(/(^(?:.|\r|\n)*?)/.source+a6.match[a2].source.replace(/\\(\d+)/g,function(bh,bg){return"\\"+(bg-0+1)}))}var a8=function(bh,bg){bh=Array.prototype.slice.call(bh,0);if(bg){bg.push.apply(bg,bh);return bg}return bh};try{Array.prototype.slice.call(ab.documentElement.childNodes,0)[0].nodeType}catch(bf){a8=function(bk,bj){var bh=bj||[];if(bc.call(bk)==="[object Array]"){Array.prototype.push.apply(bh,bk)}else{if(typeof bk.length==="number"){for(var bi=0,bg=bk.length;bi<bg;bi++){bh.push(bk[bi])}}else{for(var bi=0;bk[bi];bi++){bh.push(bk[bi])}}}return bh}}var bb;if(ab.documentElement.compareDocumentPosition){bb=function(bh,bg){if(!bh.compareDocumentPosition||!bg.compareDocumentPosition){if(bh==bg){a4=true}return bh.compareDocumentPosition?-1:1}var bi=bh.compareDocumentPosition(bg)&4?-1:bh===bg?0:1;if(bi===0){a4=true}return bi}}else{if("sourceIndex" in ab.documentElement){bb=function(bh,bg){if(!bh.sourceIndex||!bg.sourceIndex){if(bh==bg){a4=true}return bh.sourceIndex?-1:1}var bi=bh.sourceIndex-bg.sourceIndex;if(bi===0){a4=true}return bi}}else{if(ab.createRange){bb=function(bj,bh){if(!bj.ownerDocument||!bh.ownerDocument){if(bj==bh){a4=true}return bj.ownerDocument?-1:1}var bi=bj.ownerDocument.createRange(),bg=bh.ownerDocument.createRange();bi.setStart(bj,0);bi.setEnd(bj,0);bg.setStart(bh,0);bg.setEnd(bh,0);var bk=bi.compareBoundaryPoints(Range.START_TO_END,bg);if(bk===0){a4=true}return bk}}}}function aZ(bg){var bh="",bj;for(var bi=0;bg[bi];bi++){bj=bg[bi];if(bj.nodeType===3||bj.nodeType===4){bh+=bj.nodeValue}else{if(bj.nodeType!==8){bh+=aZ(bj.childNodes)}}}return bh}(function(){var bh=ab.createElement("div"),bi="script"+(new Date).getTime();bh.innerHTML="<a name='"+bi+"'/>";var bg=ab.documentElement;bg.insertBefore(bh,bg.firstChild);if(ab.getElementById(bi)){a6.find.ID=function(bk,bl,bm){if(typeof bl.getElementById!=="undefined"&&!bm){var bj=bl.getElementById(bk[1]);return bj?bj.id===bk[1]||typeof bj.getAttributeNode!=="undefined"&&bj.getAttributeNode("id").nodeValue===bk[1]?[bj]:C:[]}};a6.filter.ID=function(bl,bj){var bk=typeof bl.getAttributeNode!=="undefined"&&bl.getAttributeNode("id");return bl.nodeType===1&&bk&&bk.nodeValue===bj}}bg.removeChild(bh);bg=bh=null})();(function(){var bg=ab.createElement("div");bg.appendChild(ab.createComment(""));if(bg.getElementsByTagName("*").length>0){a6.find.TAG=function(bh,bl){var bk=bl.getElementsByTagName(bh[1]);if(bh[1]==="*"){var bj=[];for(var bi=0;bk[bi];bi++){if(bk[bi].nodeType===1){bj.push(bk[bi])}}bk=bj}return bk}}bg.innerHTML="<a href='#'></a>";if(bg.firstChild&&typeof bg.firstChild.getAttribute!=="undefined"&&bg.firstChild.getAttribute("href")!=="#"){a6.attrHandle.href=function(bh){return bh.getAttribute("href",2)}}bg=null})();if(ab.querySelectorAll){(function(){var bg=a0,bi=ab.createElement("div");bi.innerHTML="<p class='TEST'></p>";if(bi.querySelectorAll&&bi.querySelectorAll(".TEST").length===0){return}a0=function(bm,bl,bj,bk){bl=bl||ab;if(!bk&&bl.nodeType===9&&!a1(bl)){try{return a8(bl.querySelectorAll(bm),bj)}catch(bn){}}return bg(bm,bl,bj,bk)};for(var bh in bg){a0[bh]=bg[bh]}bi=null})()}(function(){var bg=ab.createElement("div");bg.innerHTML="<div class='test e'></div><div class='test'></div>";if(!bg.getElementsByClassName||bg.getElementsByClassName("e").length===0){return}bg.lastChild.className="e";if(bg.getElementsByClassName("e").length===1){return}a6.order.splice(1,0,"CLASS");a6.find.CLASS=function(bh,bi,bj){if(typeof bi.getElementsByClassName!=="undefined"&&!bj){return bi.getElementsByClassName(bh[1])}};bg=null})();function aY(bh,bm,bl,bp,bn,bo){for(var bj=0,bi=bp.length;bj<bi;bj++){var bg=bp[bj];if(bg){bg=bg[bh];var bk=false;while(bg){if(bg.sizcache===bl){bk=bp[bg.sizset];break}if(bg.nodeType===1&&!bo){bg.sizcache=bl;bg.sizset=bj}if(bg.nodeName.toLowerCase()===bm){bk=bg;break}bg=bg[bh]}bp[bj]=bk}}}function be(bh,bm,bl,bp,bn,bo){for(var bj=0,bi=bp.length;bj<bi;bj++){var bg=bp[bj];if(bg){bg=bg[bh];var bk=false;while(bg){if(bg.sizcache===bl){bk=bp[bg.sizset];break}if(bg.nodeType===1){if(!bo){bg.sizcache=bl;bg.sizset=bj}if(typeof bm!=="string"){if(bg===bm){bk=true;break}}else{if(a0.filter(bm,[bg]).length>0){bk=bg;break}}}bg=bg[bh]}bp[bj]=bk}}}var a7=ab.compareDocumentPosition?function(bh,bg){return !!(bh.compareDocumentPosition(bg)&16)}:function(bh,bg){return bh!==bg&&(bh.contains?bh.contains(bg):true)};var a1=function(bg){var bh=(bg?bg.ownerDocument||bg:0).documentElement;return bh?bh.nodeName!=="HTML":false};var bd=function(bg,bn){var bj=[],bk="",bl,bi=bn.nodeType?[bn]:bn;while((bl=a6.match.PSEUDO.exec(bg))){bk+=bl[0];bg=bg.replace(a6.match.PSEUDO,"")}bg=a6.relative[bg]?bg+"*":bg;for(var bm=0,bh=bi.length;bm<bh;bm++){a0(bg,bi[bm],bj)}return a0.filter(bk,bj)};a.find=a0;a.expr=a0.selectors;a.expr[":"]=a.expr.filters;a.unique=a0.uniqueSort;a.text=aZ;a.isXMLDoc=a1;a.contains=a7;return;aM.Sizzle=a0})();var N=/Until$/,Y=/^(?:parents|prevUntil|prevAll)/,aL=/,/,F=Array.prototype.slice;var ai=function(a1,a0,aY){if(a.isFunction(a0)){return a.grep(a1,function(a3,a2){return !!a0.call(a3,a2,a3)===aY})}else{if(a0.nodeType){return a.grep(a1,function(a3,a2){return(a3===a0)===aY})}else{if(typeof a0==="string"){var aZ=a.grep(a1,function(a2){return a2.nodeType===1});if(aW.test(a0)){return a.filter(a0,aZ,!aY)}else{a0=a.filter(a0,aZ)}}}}return a.grep(a1,function(a3,a2){return(a.inArray(a3,a0)>=0)===aY})};a.fn.extend({find:function(aY){var a0=this.pushStack("","find",aY),a3=0;for(var a1=0,aZ=this.length;a1<aZ;a1++){a3=a0.length;a.find(aY,this[a1],a0);if(a1>0){for(var a4=a3;a4<a0.length;a4++){for(var a2=0;a2<a3;a2++){if(a0[a2]===a0[a4]){a0.splice(a4--,1);break}}}}}return a0},has:function(aZ){var aY=a(aZ);return this.filter(function(){for(var a1=0,a0=aY.length;a1<a0;a1++){if(a.contains(this,aY[a1])){return true}}})},not:function(aY){return this.pushStack(ai(this,aY,false),"not",aY)},filter:function(aY){return this.pushStack(ai(this,aY,true),"filter",aY)},is:function(aY){return !!aY&&a.filter(aY,this).length>0},closest:function(a7,aY){if(a.isArray(a7)){var a4=[],a6=this[0],a3,a2={},a0;if(a6&&a7.length){for(var a1=0,aZ=a7.length;a1<aZ;a1++){a0=a7[a1];if(!a2[a0]){a2[a0]=a.expr.match.POS.test(a0)?a(a0,aY||this.context):a0}}while(a6&&a6.ownerDocument&&a6!==aY){for(a0 in a2){a3=a2[a0];if(a3.jquery?a3.index(a6)>-1:a(a6).is(a3)){a4.push({selector:a0,elem:a6});delete a2[a0]}}a6=a6.parentNode}}return a4}var a5=a.expr.match.POS.test(a7)?a(a7,aY||this.context):null;return this.map(function(a8,a9){while(a9&&a9.ownerDocument&&a9!==aY){if(a5?a5.index(a9)>-1:a(a9).is(a7)){return a9}a9=a9.parentNode}return null})},index:function(aY){if(!aY||typeof aY==="string"){return a.inArray(this[0],aY?a(aY):this.parent().children())}return a.inArray(aY.jquery?aY[0]:aY,this)},add:function(aY,aZ){var a1=typeof aY==="string"?a(aY,aZ||this.context):a.makeArray(aY),a0=a.merge(this.get(),a1);return this.pushStack(y(a1[0])||y(a0[0])?a0:a.unique(a0))},andSelf:function(){return this.add(this.prevObject)}});function y(aY){return !aY||!aY.parentNode||aY.parentNode.nodeType===11}a.each({parent:function(aZ){var aY=aZ.parentNode;return aY&&aY.nodeType!==11?aY:null},parents:function(aY){return a.dir(aY,"parentNode")},parentsUntil:function(aZ,aY,a0){return a.dir(aZ,"parentNode",a0)},next:function(aY){return a.nth(aY,2,"nextSibling")},prev:function(aY){return a.nth(aY,2,"previousSibling")},nextAll:function(aY){return a.dir(aY,"nextSibling")},prevAll:function(aY){return a.dir(aY,"previousSibling")},nextUntil:function(aZ,aY,a0){return a.dir(aZ,"nextSibling",a0)},prevUntil:function(aZ,aY,a0){return a.dir(aZ,"previousSibling",a0)},siblings:function(aY){return a.sibling(aY.parentNode.firstChild,aY)},children:function(aY){return a.sibling(aY.firstChild)},contents:function(aY){return a.nodeName(aY,"iframe")?aY.contentDocument||aY.contentWindow.document:a.makeArray(aY.childNodes)}},function(aY,aZ){a.fn[aY]=function(a2,a0){var a1=a.map(this,aZ,a2);if(!N.test(aY)){a0=a2}if(a0&&typeof a0==="string"){a1=a.filter(a0,a1)}a1=this.length>1?a.unique(a1):a1;if((this.length>1||aL.test(a0))&&Y.test(aY)){a1=a1.reverse()}return this.pushStack(a1,aY,F.call(arguments).join(","))}});a.extend({filter:function(a0,aY,aZ){if(aZ){a0=":not("+a0+")"}return a.find.matches(a0,aY)},dir:function(a0,aZ,a2){var aY=[],a1=a0[aZ];while(a1&&a1.nodeType!==9&&(a2===C||a1.nodeType!==1||!a(a1).is(a2))){if(a1.nodeType===1){aY.push(a1)}a1=a1[aZ]}return aY},nth:function(a2,aY,a0,a1){aY=aY||1;var aZ=0;for(;a2;a2=a2[a0]){if(a2.nodeType===1&&++aZ===aY){break}}return a2},sibling:function(a0,aZ){var aY=[];for(;a0;a0=a0.nextSibling){if(a0.nodeType===1&&a0!==aZ){aY.push(a0)}}return aY}});var T=/ jQuery\d+="(?:\d+|null)"/g,Z=/^\s+/,H=/(<([\w:]+)[^>]*?)\/>/g,al=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,c=/<([\w:]+)/,t=/<tbody/i,L=/<|&#?\w+;/,E=/<script|<object|<embed|<option|<style/i,l=/checked\s*(?:[^=]|=\s*.checked.)/i,p=function(aZ,a0,aY){return al.test(aY)?aZ:a0+"></"+aY+">"},ac={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};ac.optgroup=ac.option;ac.tbody=ac.tfoot=ac.colgroup=ac.caption=ac.thead;ac.th=ac.td;if(!a.support.htmlSerialize){ac._default=[1,"div<div>","</div>"]}a.fn.extend({text:function(aY){if(a.isFunction(aY)){return this.each(function(a0){var aZ=a(this);aZ.text(aY.call(this,a0,aZ.text()))})}if(typeof aY!=="object"&&aY!==C){return this.empty().append((this[0]&&this[0].ownerDocument||ab).createTextNode(aY))}return a.text(this)},wrapAll:function(aY){if(a.isFunction(aY)){return this.each(function(a0){a(this).wrapAll(aY.call(this,a0))})}if(this[0]){var aZ=a(aY,this[0].ownerDocument).eq(0).clone(true);if(this[0].parentNode){aZ.insertBefore(this[0])}aZ.map(function(){var a0=this;while(a0.firstChild&&a0.firstChild.nodeType===1){a0=a0.firstChild}return a0}).append(this)}return this},wrapInner:function(aY){if(a.isFunction(aY)){return this.each(function(aZ){a(this).wrapInner(aY.call(this,aZ))})}return this.each(function(){var aZ=a(this),a0=aZ.contents();if(a0.length){a0.wrapAll(aY)}else{aZ.append(aY)}})},wrap:function(aY){return this.each(function(){a(this).wrapAll(aY)})},unwrap:function(){return this.parent().each(function(){if(!a.nodeName(this,"body")){a(this).replaceWith(this.childNodes)}}).end()},append:function(){return this.domManip(arguments,true,function(aY){if(this.nodeType===1){this.appendChild(aY)}})},prepend:function(){return this.domManip(arguments,true,function(aY){if(this.nodeType===1){this.insertBefore(aY,this.firstChild)}})},before:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(aZ){this.parentNode.insertBefore(aZ,this)})}else{if(arguments.length){var aY=a(arguments[0]);aY.push.apply(aY,this.toArray());return this.pushStack(aY,"before",arguments)}}},after:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(aZ){this.parentNode.insertBefore(aZ,this.nextSibling)})}else{if(arguments.length){var aY=this.pushStack(this,"after",arguments);aY.push.apply(aY,a(arguments[0]).toArray());return aY}}},remove:function(aY,a1){for(var aZ=0,a0;(a0=this[aZ])!=null;aZ++){if(!aY||a.filter(aY,[a0]).length){if(!a1&&a0.nodeType===1){a.cleanData(a0.getElementsByTagName("*"));a.cleanData([a0])}if(a0.parentNode){a0.parentNode.removeChild(a0)}}}return this},empty:function(){for(var aY=0,aZ;(aZ=this[aY])!=null;aY++){if(aZ.nodeType===1){a.cleanData(aZ.getElementsByTagName("*"))}while(aZ.firstChild){aZ.removeChild(aZ.firstChild)}}return this},clone:function(aZ){var aY=this.map(function(){if(!a.support.noCloneEvent&&!a.isXMLDoc(this)){var a1=this.outerHTML,a0=this.ownerDocument;if(!a1){var a2=a0.createElement("div");a2.appendChild(this.cloneNode(true));a1=a2.innerHTML}return a.clean([a1.replace(T,"").replace(/=([^="'>\s]+\/)>/g,'="$1">').replace(Z,"")],a0)[0]}else{return this.cloneNode(true)}});if(aZ===true){q(this,aY);q(this.find("*"),aY.find("*"))}return aY},html:function(a0){if(a0===C){return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(T,""):null}else{if(typeof a0==="string"&&!E.test(a0)&&(a.support.leadingWhitespace||!Z.test(a0))&&!ac[(c.exec(a0)||["",""])[1].toLowerCase()]){a0=a0.replace(H,p);try{for(var aZ=0,aY=this.length;aZ<aY;aZ++){if(this[aZ].nodeType===1){a.cleanData(this[aZ].getElementsByTagName("*"));this[aZ].innerHTML=a0}}}catch(a1){this.empty().append(a0)}}else{if(a.isFunction(a0)){this.each(function(a4){var a3=a(this),a2=a3.html();a3.empty().append(function(){return a0.call(this,a4,a2)})})}else{this.empty().append(a0)}}}return this},replaceWith:function(aY){if(this[0]&&this[0].parentNode){if(a.isFunction(aY)){return this.each(function(a1){var a0=a(this),aZ=a0.html();a0.replaceWith(aY.call(this,a1,aZ))})}if(typeof aY!=="string"){aY=a(aY).detach()}return this.each(function(){var a0=this.nextSibling,aZ=this.parentNode;a(this).remove();if(a0){a(a0).before(aY)}else{a(aZ).append(aY)}})}else{return this.pushStack(a(a.isFunction(aY)?aY():aY),"replaceWith",aY)}},detach:function(aY){return this.remove(aY,true)},domManip:function(a4,a9,a8){var a1,a2,a7=a4[0],aZ=[],a3,a6;if(!a.support.checkClone&&arguments.length===3&&typeof a7==="string"&&l.test(a7)){return this.each(function(){a(this).domManip(a4,a9,a8,true)})}if(a.isFunction(a7)){return this.each(function(bb){var ba=a(this);a4[0]=a7.call(this,bb,a9?ba.html():C);ba.domManip(a4,a9,a8)})}if(this[0]){a6=a7&&a7.parentNode;if(a.support.parentNode&&a6&&a6.nodeType===11&&a6.childNodes.length===this.length){a1={fragment:a6}}else{a1=J(a4,this,aZ)}a3=a1.fragment;if(a3.childNodes.length===1){a2=a3=a3.firstChild}else{a2=a3.firstChild}if(a2){a9=a9&&a.nodeName(a2,"tr");for(var a0=0,aY=this.length;a0<aY;a0++){a8.call(a9?a5(this[a0],a2):this[a0],a0>0||a1.cacheable||this.length>1?a3.cloneNode(true):a3)}}if(aZ.length){a.each(aZ,aV)}}return this;function a5(ba,bb){return a.nodeName(ba,"table")?(ba.getElementsByTagName("tbody")[0]||ba.appendChild(ba.ownerDocument.createElement("tbody"))):ba}}});function q(a0,aY){var aZ=0;aY.each(function(){if(this.nodeName!==(a0[aZ]&&a0[aZ].nodeName)){return}var a5=a.data(a0[aZ++]),a4=a.data(this,a5),a1=a5&&a5.events;if(a1){delete a4.handle;a4.events={};for(var a3 in a1){for(var a2 in a1[a3]){a.event.add(this,a3,a1[a3][a2],a1[a3][a2].data)}}}})}function J(a3,a1,aZ){var a2,aY,a0,a4=(a1&&a1[0]?a1[0].ownerDocument||a1[0]:ab);if(a3.length===1&&typeof a3[0]==="string"&&a3[0].length<512&&a4===ab&&!E.test(a3[0])&&(a.support.checkClone||!l.test(a3[0]))){aY=true;a0=a.fragments[a3[0]];if(a0){if(a0!==1){a2=a0}}}if(!a2){a2=a4.createDocumentFragment();a.clean(a3,a4,a2,aZ)}if(aY){a.fragments[a3[0]]=a0?a2:1}return{fragment:a2,cacheable:aY}}a.fragments={};a.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(aY,aZ){a.fn[aY]=function(a0){var a3=[],a6=a(a0),a5=this.length===1&&this[0].parentNode;if(a5&&a5.nodeType===11&&a5.childNodes.length===1&&a6.length===1){a6[aZ](this[0]);return this}else{for(var a4=0,a1=a6.length;a4<a1;a4++){var a2=(a4>0?this.clone(true):this).get();a.fn[aZ].apply(a(a6[a4]),a2);a3=a3.concat(a2)}return this.pushStack(a3,aY,a6.selector)}}});a.extend({clean:function(a0,a2,a9,a4){a2=a2||ab;if(typeof a2.createElement==="undefined"){a2=a2.ownerDocument||a2[0]&&a2[0].ownerDocument||ab}var ba=[];for(var a8=0,a3;(a3=a0[a8])!=null;a8++){if(typeof a3==="number"){a3+=""}if(!a3){continue}if(typeof a3==="string"&&!L.test(a3)){a3=a2.createTextNode(a3)}else{if(typeof a3==="string"){a3=a3.replace(H,p);var bb=(c.exec(a3)||["",""])[1].toLowerCase(),a1=ac[bb]||ac._default,a7=a1[0],aZ=a2.createElement("div");aZ.innerHTML=a1[1]+a3+a1[2];while(a7--){aZ=aZ.lastChild}if(!a.support.tbody){var aY=t.test(a3),a6=bb==="table"&&!aY?aZ.firstChild&&aZ.firstChild.childNodes:a1[1]==="<table>"&&!aY?aZ.childNodes:[];for(var a5=a6.length-1;a5>=0;--a5){if(a.nodeName(a6[a5],"tbody")&&!a6[a5].childNodes.length){a6[a5].parentNode.removeChild(a6[a5])}}}if(!a.support.leadingWhitespace&&Z.test(a3)){aZ.insertBefore(a2.createTextNode(Z.exec(a3)[0]),aZ.firstChild)}a3=aZ.childNodes}}if(a3.nodeType){ba.push(a3)}else{ba=a.merge(ba,a3)}}if(a9){for(var a8=0;ba[a8];a8++){if(a4&&a.nodeName(ba[a8],"script")&&(!ba[a8].type||ba[a8].type.toLowerCase()==="text/javascript")){a4.push(ba[a8].parentNode?ba[a8].parentNode.removeChild(ba[a8]):ba[a8])}else{if(ba[a8].nodeType===1){ba.splice.apply(ba,[a8+1,0].concat(a.makeArray(ba[a8].getElementsByTagName("script"))))}a9.appendChild(ba[a8])}}}return ba},cleanData:function(aZ){var a2,a0,aY=a.cache,a5=a.event.special,a4=a.support.deleteExpando;for(var a3=0,a1;(a1=aZ[a3])!=null;a3++){a0=a1[a.expando];if(a0){a2=aY[a0];if(a2.events){for(var a6 in a2.events){if(a5[a6]){a.event.remove(a1,a6)}else{ag(a1,a6,a2.handle)}}}if(a4){delete a1[a.expando]}else{if(a1.removeAttribute){a1.removeAttribute(a.expando)}}delete aY[a0]}}}});var ar=/z-?index|font-?weight|opacity|zoom|line-?height/i,U=/alpha\([^)]*\)/,aa=/opacity=([^)]*)/,ah=/float/i,az=/-([a-z])/ig,v=/([A-Z])/g,aO=/^-?\d+(?:px)?$/i,aU=/^-?\d/,aK={position:"absolute",visibility:"hidden",display:"block"},W=["Left","Right"],aE=["Top","Bottom"],ak=ab.defaultView&&ab.defaultView.getComputedStyle,aN=a.support.cssFloat?"cssFloat":"styleFloat",k=function(aY,aZ){return aZ.toUpperCase()};a.fn.css=function(aY,aZ){return an(this,aY,aZ,true,function(a1,a0,a2){if(a2===C){return a.curCSS(a1,a0)}if(typeof a2==="number"&&!ar.test(a0)){a2+="px"}a.style(a1,a0,a2)})};a.extend({style:function(a2,aZ,a3){if(!a2||a2.nodeType===3||a2.nodeType===8){return C}if((aZ==="width"||aZ==="height")&&parseFloat(a3)<0){a3=C}var a1=a2.style||a2,a4=a3!==C;if(!a.support.opacity&&aZ==="opacity"){if(a4){a1.zoom=1;var aY=parseInt(a3,10)+""==="NaN"?"":"alpha(opacity="+a3*100+")";var a0=a1.filter||a.curCSS(a2,"filter")||"";a1.filter=U.test(a0)?a0.replace(U,aY):aY}return a1.filter&&a1.filter.indexOf("opacity=")>=0?(parseFloat(aa.exec(a1.filter)[1])/100)+"":""}if(ah.test(aZ)){aZ=aN}aZ=aZ.replace(az,k);if(a4){a1[aZ]=a3}return a1[aZ]},css:function(a1,aZ,a3,aY){if(aZ==="width"||aZ==="height"){var a5,a0=aK,a4=aZ==="width"?W:aE;function a2(){a5=aZ==="width"?a1.offsetWidth:a1.offsetHeight;if(aY==="border"){return}a.each(a4,function(){if(!aY){a5-=parseFloat(a.curCSS(a1,"padding"+this,true))||0}if(aY==="margin"){a5+=parseFloat(a.curCSS(a1,"margin"+this,true))||0}else{a5-=parseFloat(a.curCSS(a1,"border"+this+"Width",true))||0}})}if(a1.offsetWidth!==0){a2()}else{a.swap(a1,a0,a2)}return Math.max(0,Math.round(a5))}return a.curCSS(a1,aZ,a3)},curCSS:function(a4,aZ,a0){var a7,aY=a4.style,a1;if(!a.support.opacity&&aZ==="opacity"&&a4.currentStyle){a7=aa.test(a4.currentStyle.filter||"")?(parseFloat(RegExp.$1)/100)+"":"";return a7===""?"1":a7}if(ah.test(aZ)){aZ=aN}if(!a0&&aY&&aY[aZ]){a7=aY[aZ]}else{if(ak){if(ah.test(aZ)){aZ="float"}aZ=aZ.replace(v,"-$1").toLowerCase();var a6=a4.ownerDocument.defaultView;if(!a6){return null}var a8=a6.getComputedStyle(a4,null);if(a8){a7=a8.getPropertyValue(aZ)}if(aZ==="opacity"&&a7===""){a7="1"}}else{if(a4.currentStyle){var a3=aZ.replace(az,k);a7=a4.currentStyle[aZ]||a4.currentStyle[a3];if(!aO.test(a7)&&aU.test(a7)){var a2=aY.left,a5=a4.runtimeStyle.left;a4.runtimeStyle.left=a4.currentStyle.left;aY.left=a3==="fontSize"?"1em":(a7||0);a7=aY.pixelLeft+"px";aY.left=a2;a4.runtimeStyle.left=a5}}}}return a7},swap:function(a1,a0,a2){var aY={};for(var aZ in a0){aY[aZ]=a1.style[aZ];a1.style[aZ]=a0[aZ]}a2.call(a1);for(var aZ in a0){a1.style[aZ]=aY[aZ]}}});if(a.expr&&a.expr.filters){a.expr.filters.hidden=function(a1){var aZ=a1.offsetWidth,aY=a1.offsetHeight,a0=a1.nodeName.toLowerCase()==="tr";return aZ===0&&aY===0&&!a0?true:aZ>0&&aY>0&&!a0?false:a.curCSS(a1,"display")==="none"};a.expr.filters.visible=function(aY){return !a.expr.filters.hidden(aY)}}var af=aP(),aJ=/<script(.|\s)*?\/script>/gi,o=/select|textarea/i,aB=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,r=/=\?(&|$)/,D=/\?/,aX=/(\?|&)_=.*?(&|$)/,B=/^(\w+:)?\/\/([^\/?#]+)/,h=/%20/g,w=a.fn.load;a.fn.extend({load:function(a0,a3,a4){if(typeof a0!=="string"){return w.call(this,a0)}else{if(!this.length){return this}}var a2=a0.indexOf(" ");if(a2>=0){var aY=a0.slice(a2,a0.length);a0=a0.slice(0,a2)}var a1="GET";if(a3){if(a.isFunction(a3)){a4=a3;a3=null}else{if(typeof a3==="object"){a3=a.param(a3,a.ajaxSettings.traditional);a1="POST"}}}var aZ=this;a.ajax({url:a0,type:a1,dataType:"html",data:a3,complete:function(a6,a5){if(a5==="success"||a5==="notmodified"){aZ.html(aY?a("<div />").append(a6.responseText.replace(aJ,"")).find(aY):a6.responseText)}if(a4){aZ.each(a4,[a6.responseText,a5,a6])}}});return this},serialize:function(){return a.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?a.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||o.test(this.nodeName)||aB.test(this.type))}).map(function(aY,aZ){var a0=a(this).val();return a0==null?null:a.isArray(a0)?a.map(a0,function(a2,a1){return{name:aZ.name,value:a2}}):{name:aZ.name,value:a0}}).get()}});a.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(aY,aZ){a.fn[aZ]=function(a0){return this.bind(aZ,a0)}});a.extend({get:function(aY,a0,a1,aZ){if(a.isFunction(a0)){aZ=aZ||a1;a1=a0;a0=null}return a.ajax({type:"GET",url:aY,data:a0,success:a1,dataType:aZ})},getScript:function(aY,aZ){return a.get(aY,null,aZ,"script")},getJSON:function(aY,aZ,a0){return a.get(aY,aZ,a0,"json")},post:function(aY,a0,a1,aZ){if(a.isFunction(a0)){aZ=aZ||a1;a1=a0;a0={}}return a.ajax({type:"POST",url:aY,data:a0,success:a1,dataType:aZ})},ajaxSetup:function(aY){a.extend(a.ajaxSettings,aY)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:aM.XMLHttpRequest&&(aM.location.protocol!=="file:"||!aM.ActiveXObject)?function(){return new aM.XMLHttpRequest()}:function(){try{return new aM.ActiveXObject("Microsoft.XMLHTTP")}catch(aY){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(bd){var a8=a.extend(true,{},a.ajaxSettings,bd);var bi,bc,bh,bj=bd&&bd.context||a8,a0=a8.type.toUpperCase();if(a8.data&&a8.processData&&typeof a8.data!=="string"){a8.data=a.param(a8.data,a8.traditional)}if(a8.dataType==="jsonp"){if(a0==="GET"){if(!r.test(a8.url)){a8.url+=(D.test(a8.url)?"&":"?")+(a8.jsonp||"callback")+"=?"}}else{if(!a8.data||!r.test(a8.data)){a8.data=(a8.data?a8.data+"&":"")+(a8.jsonp||"callback")+"=?"}}a8.dataType="json"}if(a8.dataType==="json"&&(a8.data&&r.test(a8.data)||r.test(a8.url))){bi=a8.jsonpCallback||("jsonp"+af++);if(a8.data){a8.data=(a8.data+"").replace(r,"="+bi+"$1")}a8.url=a8.url.replace(r,"="+bi+"$1");a8.dataType="script";aM[bi]=aM[bi]||function(bk){bh=bk;a3();a6();aM[bi]=C;try{delete aM[bi]}catch(bl){}if(a1){a1.removeChild(bf)}}}if(a8.dataType==="script"&&a8.cache===null){a8.cache=false}if(a8.cache===false&&a0==="GET"){var aY=aP();var bg=a8.url.replace(aX,"$1_="+aY+"$2");a8.url=bg+((bg===a8.url)?(D.test(a8.url)?"&":"?")+"_="+aY:"")}if(a8.data&&a0==="GET"){a8.url+=(D.test(a8.url)?"&":"?")+a8.data}if(a8.global&&!a.active++){a.event.trigger("ajaxStart")}var bb=B.exec(a8.url),a2=bb&&(bb[1]&&bb[1]!==location.protocol||bb[2]!==location.host);if(a8.dataType==="script"&&a0==="GET"&&a2){var a1=ab.getElementsByTagName("head")[0]||ab.documentElement;var bf=ab.createElement("script");bf.src=a8.url;if(a8.scriptCharset){bf.charset=a8.scriptCharset}if(!bi){var ba=false;bf.onload=bf.onreadystatechange=function(){if(!ba&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){ba=true;a3();a6();bf.onload=bf.onreadystatechange=null;if(a1&&bf.parentNode){a1.removeChild(bf)}}}}a1.insertBefore(bf,a1.firstChild);return C}var a5=false;var a4=a8.xhr();if(!a4){return}if(a8.username){a4.open(a0,a8.url,a8.async,a8.username,a8.password)}else{a4.open(a0,a8.url,a8.async)}try{if(a8.data||bd&&bd.contentType){a4.setRequestHeader("Content-Type",a8.contentType)}if(a8.ifModified){if(a.lastModified[a8.url]){a4.setRequestHeader("If-Modified-Since",a.lastModified[a8.url])}if(a.etag[a8.url]){a4.setRequestHeader("If-None-Match",a.etag[a8.url])}}if(!a2){a4.setRequestHeader("X-Requested-With","XMLHttpRequest")}a4.setRequestHeader("Accept",a8.dataType&&a8.accepts[a8.dataType]?a8.accepts[a8.dataType]+", */*":a8.accepts._default)}catch(be){}if(a8.beforeSend&&a8.beforeSend.call(bj,a4,a8)===false){if(a8.global&&!--a.active){a.event.trigger("ajaxStop")}a4.abort();return false}if(a8.global){a9("ajaxSend",[a4,a8])}var a7=a4.onreadystatechange=function(bk){if(!a4||a4.readyState===0||bk==="abort"){if(!a5){a6()}a5=true;if(a4){a4.onreadystatechange=a.noop}}else{if(!a5&&a4&&(a4.readyState===4||bk==="timeout")){a5=true;a4.onreadystatechange=a.noop;bc=bk==="timeout"?"timeout":!a.httpSuccess(a4)?"error":a8.ifModified&&a.httpNotModified(a4,a8.url)?"notmodified":"success";var bm;if(bc==="success"){try{bh=a.httpData(a4,a8.dataType,a8)}catch(bl){bc="parsererror";bm=bl}}if(bc==="success"||bc==="notmodified"){if(!bi){a3()}}else{a.handleError(a8,a4,bc,bm)}a6();if(bk==="timeout"){a4.abort()}if(a8.async){a4=null}}}};try{var aZ=a4.abort;a4.abort=function(){if(a4){aZ.call(a4)}a7("abort")}}catch(be){}if(a8.async&&a8.timeout>0){setTimeout(function(){if(a4&&!a5){a7("timeout")}},a8.timeout)}try{a4.send(a0==="POST"||a0==="PUT"||a0==="DELETE"?a8.data:null)}catch(be){a.handleError(a8,a4,null,be);a6()}if(!a8.async){a7()}function a3(){if(a8.success){a8.success.call(bj,bh,bc,a4)}if(a8.global){a9("ajaxSuccess",[a4,a8])}}function a6(){if(a8.complete){a8.complete.call(bj,a4,bc)}if(a8.global){a9("ajaxComplete",[a4,a8])}if(a8.global&&!--a.active){a.event.trigger("ajaxStop")}}function a9(bl,bk){(a8.context?a(a8.context):a.event).trigger(bl,bk)}return a4},handleError:function(aZ,a1,aY,a0){if(aZ.error){aZ.error.call(aZ.context||aZ,a1,aY,a0)}if(aZ.global){(aZ.context?a(aZ.context):a.event).trigger("ajaxError",[a1,aZ,a0])}},active:0,httpSuccess:function(aZ){try{return !aZ.status&&location.protocol==="file:"||(aZ.status>=200&&aZ.status<300)||aZ.status===304||aZ.status===1223||aZ.status===0}catch(aY){}return false},httpNotModified:function(a1,aY){var a0=a1.getResponseHeader("Last-Modified"),aZ=a1.getResponseHeader("Etag");if(a0){a.lastModified[aY]=a0}if(aZ){a.etag[aY]=aZ}return a1.status===304||a1.status===0},httpData:function(a3,a1,a0){var aZ=a3.getResponseHeader("content-type")||"",aY=a1==="xml"||!a1&&aZ.indexOf("xml")>=0,a2=aY?a3.responseXML:a3.responseText;if(aY&&a2.documentElement.nodeName==="parsererror"){a.error("parsererror")}if(a0&&a0.dataFilter){a2=a0.dataFilter(a2,a1)}if(typeof a2==="string"){if(a1==="json"||!a1&&aZ.indexOf("json")>=0){a2=a.parseJSON(a2)}else{if(a1==="script"||!a1&&aZ.indexOf("javascript")>=0){a.globalEval(a2)}}}return a2},param:function(aY,a1){var aZ=[];if(a1===C){a1=a.ajaxSettings.traditional}if(a.isArray(aY)||aY.jquery){a.each(aY,function(){a3(this.name,this.value)})}else{for(var a2 in aY){a0(a2,aY[a2])}}return aZ.join("&").replace(h,"+");function a0(a4,a5){if(a.isArray(a5)){a.each(a5,function(a7,a6){if(a1||/\[\]$/.test(a4)){a3(a4,a6)}else{a0(a4+"["+(typeof a6==="object"||a.isArray(a6)?a7:"")+"]",a6)}})}else{if(!a1&&a5!=null&&typeof a5==="object"){a.each(a5,function(a7,a6){a0(a4+"["+a7+"]",a6)})}else{a3(a4,a5)}}}function a3(a4,a5){a5=a.isFunction(a5)?a5():a5;aZ[aZ.length]=encodeURIComponent(a4)+"="+encodeURIComponent(a5)}}});var G={},ae=/toggle|show|hide/,au=/^([+-]=)?([\d+-.]+)(.*)$/,aF,aj=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];a.fn.extend({show:function(aZ,a7){if(aZ||aZ===0){return this.animate(aD("show",3),aZ,a7)}else{for(var a4=0,a1=this.length;a4<a1;a4++){var aY=a.data(this[a4],"olddisplay");this[a4].style.display=aY||"";if(a.css(this[a4],"display")==="none"){var a6=this[a4].nodeName,a5;if(G[a6]){a5=G[a6]}else{var a0=a("<"+a6+" />").appendTo("body");a5=a0.css("display");if(a5==="none"){a5="block"}a0.remove();G[a6]=a5}a.data(this[a4],"olddisplay",a5)}}for(var a3=0,a2=this.length;a3<a2;a3++){this[a3].style.display=a.data(this[a3],"olddisplay")||""}return this}},hide:function(a3,a4){if(a3||a3===0){return this.animate(aD("hide",3),a3,a4)}else{for(var a2=0,aZ=this.length;a2<aZ;a2++){var aY=a.data(this[a2],"olddisplay");if(!aY&&aY!=="none"){a.data(this[a2],"olddisplay",a.css(this[a2],"display"))}}for(var a1=0,a0=this.length;a1<a0;a1++){this[a1].style.display="none"}return this}},_toggle:a.fn.toggle,toggle:function(a0,aZ){var aY=typeof a0==="boolean";if(a.isFunction(a0)&&a.isFunction(aZ)){this._toggle.apply(this,arguments)}else{if(a0==null||aY){this.each(function(){var a1=aY?a0:a(this).is(":hidden");a(this)[a1?"show":"hide"]()})}else{this.animate(aD("toggle",3),a0,aZ)}}return this},fadeTo:function(aY,a0,aZ){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:a0},aY,aZ)},animate:function(a2,aZ,a1,a0){var aY=a.speed(aZ,a1,a0);if(a.isEmptyObject(a2)){return this.each(aY.complete)}return this[aY.queue===false?"each":"queue"](function(){var a5=a.extend({},aY),a7,a6=this.nodeType===1&&a(this).is(":hidden"),a3=this;for(a7 in a2){var a4=a7.replace(az,k);if(a7!==a4){a2[a4]=a2[a7];delete a2[a7];a7=a4}if(a2[a7]==="hide"&&a6||a2[a7]==="show"&&!a6){return a5.complete.call(this)}if((a7==="height"||a7==="width")&&this.style){a5.display=a.css(this,"display");a5.overflow=this.style.overflow}if(a.isArray(a2[a7])){(a5.specialEasing=a5.specialEasing||{})[a7]=a2[a7][1];a2[a7]=a2[a7][0]}}if(a5.overflow!=null&&!/hidden|auto/.test($(this).css("overflow"))){this.style.overflow="hidden"}a5.curAnim=a.extend({},a2);a.each(a2,function(a9,bd){var bc=new a.fx(a3,a5,a9);if(ae.test(bd)){bc[bd==="toggle"?a6?"show":"hide":bd](a2)}else{var bb=au.exec(bd),be=bc.cur(true)||0;if(bb){var a8=parseFloat(bb[2]),ba=bb[3]||"px";if(ba!=="px"){a3.style[a9]=(a8||1)+ba;be=((a8||1)/bc.cur(true))*be;a3.style[a9]=be+ba}if(bb[1]){a8=((bb[1]==="-="?-1:1)*a8)+be}bc.custom(be,a8,ba)}else{bc.custom(be,bd,"")}}});return true})},stop:function(aZ,aY){var a0=a.timers;if(aZ){this.queue([])}this.each(function(){for(var a1=a0.length-1;a1>=0;a1--){if(a0[a1].elem===this){if(aY){a0[a1](true)}a0.splice(a1,1)}}});if(!aY){this.dequeue()}return this}});a.each({slideDown:aD("show",1),slideUp:aD("hide",1),slideToggle:aD("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(aY,aZ){a.fn[aY]=function(a0,a1){return this.animate(aZ,a0,a1)}});a.extend({speed:function(a0,a1,aZ){var aY=a0&&typeof a0==="object"?a0:{complete:aZ||!aZ&&a1||a.isFunction(a0)&&a0,duration:a0,easing:aZ&&a1||a1&&!a.isFunction(a1)&&a1};aY.duration=a.fx.off?0:typeof aY.duration==="number"?aY.duration:a.fx.speeds[aY.duration]||a.fx.speeds._default;aY.old=aY.complete;aY.complete=function(){if(aY.queue!==false){a(this).dequeue()}if(a.isFunction(aY.old)){aY.old.call(this)}};return aY},easing:{linear:function(a0,a1,aY,aZ){return aY+aZ*a0},swing:function(a0,a1,aY,aZ){return((-Math.cos(a0*Math.PI)/2)+0.5)*aZ+aY}},timers:[],fx:function(aZ,aY,a0){this.options=aY;this.elem=aZ;this.prop=a0;if(!aY.orig){aY.orig={}}}});a.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)}(a.fx.step[this.prop]||a.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style){this.elem.style.display="block"}},cur:function(aZ){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var aY=parseFloat(a.css(this.elem,this.prop,aZ));return aY&&aY>-10000?aY:parseFloat(a.curCSS(this.elem,this.prop))||0},custom:function(a2,a1,a0){this.startTime=aP();this.start=a2;this.end=a1;this.unit=a0||this.unit||"px";this.now=this.start;this.pos=this.state=0;var aY=this;function aZ(a3){return aY.step(a3)}aZ.elem=this.elem;if(aZ()&&a.timers.push(aZ)&&!aF){aF=setInterval(a.fx.tick,13)}},show:function(){this.options.orig[this.prop]=a.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());a(this.elem).show()},hide:function(){this.options.orig[this.prop]=a.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(a1){var a6=aP(),a2=true;if(a1||a6>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var a3 in this.options.curAnim){if(this.options.curAnim[a3]!==true){a2=false}}if(a2){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;var a0=a.data(this.elem,"olddisplay");this.elem.style.display=a0?a0:this.options.display;if(a.css(this.elem,"display")==="none"){this.elem.style.display="block"}}if(this.options.hide){a(this.elem).hide()}if(this.options.hide||this.options.show){for(var aY in this.options.curAnim){a.style(this.elem,aY,this.options.orig[aY])}}this.options.complete.call(this.elem)}return false}else{var aZ=a6-this.startTime;this.state=aZ/this.options.duration;var a4=this.options.specialEasing&&this.options.specialEasing[this.prop];var a5=this.options.easing||(a.easing.swing?"swing":"linear");this.pos=a.easing[a4||a5](this.state,aZ,0,1,this.options.duration);this.now=this.start+((this.end-this.start)*this.pos);this.update()}return true}};a.extend(a.fx,{tick:function(){var aZ=a.timers;for(var aY=0;aY<aZ.length;aY++){if(!aZ[aY]()){aZ.splice(aY--,1)}}if(!aZ.length){a.fx.stop()}},stop:function(){clearInterval(aF);aF=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(aY){a.style(aY.elem,"opacity",aY.now)},_default:function(aY){if(aY.elem.style&&aY.elem.style[aY.prop]!=null){aY.elem.style[aY.prop]=(aY.prop==="width"||aY.prop==="height"?Math.max(0,aY.now):aY.now)+aY.unit}else{aY.elem[aY.prop]=aY.now}}}});if(a.expr&&a.expr.filters){a.expr.filters.animated=function(aY){return a.grep(a.timers,function(aZ){return aY===aZ.elem}).length}}function aD(aZ,aY){var a0={};a.each(aj.concat.apply([],aj.slice(0,aY)),function(){a0[this]=aZ});return a0}if("getBoundingClientRect" in ab.documentElement){a.fn.offset=function(a7){var a0=this[0];if(a7){return this.each(function(a8){a.offset.setOffset(this,a7,a8)})}if(!a0||!a0.ownerDocument){return null}if(a0===a0.ownerDocument.body){return a.offset.bodyOffset(a0)}var a2=a0.getBoundingClientRect(),a6=a0.ownerDocument,a3=a6.body,aY=a6.documentElement,a1=aY.clientTop||a3.clientTop||0,a4=aY.clientLeft||a3.clientLeft||0,a5=a2.top+(self.pageYOffset||a.support.boxModel&&aY.scrollTop||a3.scrollTop)-a1,aZ=a2.left+(self.pageXOffset||a.support.boxModel&&aY.scrollLeft||a3.scrollLeft)-a4;return{top:a5,left:aZ}}}else{a.fn.offset=function(a9){var a3=this[0];if(a9){return this.each(function(ba){a.offset.setOffset(this,a9,ba)})}if(!a3||!a3.ownerDocument){return null}if(a3===a3.ownerDocument.body){return a.offset.bodyOffset(a3)}a.offset.initialize();var a0=a3.offsetParent,aZ=a3,a8=a3.ownerDocument,a6,a1=a8.documentElement,a4=a8.body,a5=a8.defaultView,aY=a5?a5.getComputedStyle(a3,null):a3.currentStyle,a7=a3.offsetTop,a2=a3.offsetLeft;while((a3=a3.parentNode)&&a3!==a4&&a3!==a1){if(a.offset.supportsFixedPosition&&aY.position==="fixed"){break}a6=a5?a5.getComputedStyle(a3,null):a3.currentStyle;a7-=a3.scrollTop;a2-=a3.scrollLeft;if(a3===a0){a7+=a3.offsetTop;a2+=a3.offsetLeft;if(a.offset.doesNotAddBorder&&!(a.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(a3.nodeName))){a7+=parseFloat(a6.borderTopWidth)||0;a2+=parseFloat(a6.borderLeftWidth)||0}aZ=a0,a0=a3.offsetParent}if(a.offset.subtractsBorderForOverflowNotVisible&&a6.overflow!=="visible"){a7+=parseFloat(a6.borderTopWidth)||0;a2+=parseFloat(a6.borderLeftWidth)||0}aY=a6}if(aY.position==="relative"||aY.position==="static"){a7+=a4.offsetTop;a2+=a4.offsetLeft}if(a.offset.supportsFixedPosition&&aY.position==="fixed"){a7+=Math.max(a1.scrollTop,a4.scrollTop);a2+=Math.max(a1.scrollLeft,a4.scrollLeft)}return{top:a7,left:a2}}}a.offset={initialize:function(){var aY=ab.body,aZ=ab.createElement("div"),a2,a4,a3,a5,a0=parseFloat(a.curCSS(aY,"marginTop",true))||0,a1="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";a.extend(aZ.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});aZ.innerHTML=a1;aY.insertBefore(aZ,aY.firstChild);a2=aZ.firstChild;a4=a2.firstChild;a5=a2.nextSibling.firstChild.firstChild;this.doesNotAddBorder=(a4.offsetTop!==5);this.doesAddBorderForTableAndCells=(a5.offsetTop===5);a4.style.position="fixed",a4.style.top="20px";this.supportsFixedPosition=(a4.offsetTop===20||a4.offsetTop===15);a4.style.position=a4.style.top="";a2.style.overflow="hidden",a2.style.position="relative";this.subtractsBorderForOverflowNotVisible=(a4.offsetTop===-5);this.doesNotIncludeMarginInBodyOffset=(aY.offsetTop!==a0);aY.removeChild(aZ);aY=aZ=a2=a4=a3=a5=null;a.offset.initialize=a.noop},bodyOffset:function(aY){var a0=aY.offsetTop,aZ=aY.offsetLeft;a.offset.initialize();if(a.offset.doesNotIncludeMarginInBodyOffset){a0+=parseFloat(a.curCSS(aY,"marginTop",true))||0;aZ+=parseFloat(a.curCSS(aY,"marginLeft",true))||0}return{top:a0,left:aZ}},setOffset:function(a3,aZ,a0){if(/static/.test(a.curCSS(a3,"position"))){a3.style.position="relative"}var a2=a(a3),a5=a2.offset(),aY=parseInt(a.curCSS(a3,"top",true),10)||0,a4=parseInt(a.curCSS(a3,"left",true),10)||0;if(a.isFunction(aZ)){aZ=aZ.call(a3,a0,a5)}var a1={top:(aZ.top-a5.top)+aY,left:(aZ.left-a5.left)+a4};if("using" in aZ){aZ.using.call(a3,a1)}else{a2.css(a1)}}};a.fn.extend({position:function(){if(!this[0]){return null}var a0=this[0],aZ=this.offsetParent(),a1=this.offset(),aY=/^body|html$/i.test(aZ[0].nodeName)?{top:0,left:0}:aZ.offset();a1.top-=parseFloat(a.curCSS(a0,"marginTop",true))||0;a1.left-=parseFloat(a.curCSS(a0,"marginLeft",true))||0;aY.top+=parseFloat(a.curCSS(aZ[0],"borderTopWidth",true))||0;aY.left+=parseFloat(a.curCSS(aZ[0],"borderLeftWidth",true))||0;return{top:a1.top-aY.top,left:a1.left-aY.left}},offsetParent:function(){return this.map(function(){var aY=this.offsetParent||ab.body;while(aY&&(!/^body|html$/i.test(aY.nodeName)&&a.css(aY,"position")==="static")){aY=aY.offsetParent}return aY})}});a.each(["Left","Top"],function(aZ,aY){var a0="scroll"+aY;a.fn[a0]=function(a3){var a1=this[0],a2;if(!a1){return null}if(a3!==C){return this.each(function(){a2=am(this);if(a2){a2.scrollTo(!aZ?a3:a(a2).scrollLeft(),aZ?a3:a(a2).scrollTop())}else{this[a0]=a3}})}else{a2=am(a1);return a2?("pageXOffset" in a2)?a2[aZ?"pageYOffset":"pageXOffset"]:a.support.boxModel&&a2.document.documentElement[a0]||a2.document.body[a0]:a1[a0]}}});function am(aY){return("scrollTo" in aY&&aY.document)?aY:aY.nodeType===9?aY.defaultView||aY.parentWindow:false}a.each(["Height","Width"],function(aZ,aY){var a0=aY.toLowerCase();a.fn["inner"+aY]=function(){return this[0]?a.css(this[0],a0,false,"padding"):null};a.fn["outer"+aY]=function(a1){return this[0]?a.css(this[0],a0,false,a1?"margin":"border"):null};a.fn[a0]=function(a1){var a2=this[0];if(!a2){return a1==null?null:this}if(a.isFunction(a1)){return this.each(function(a4){var a3=a(this);a3[a0](a1.call(this,a4,a3[a0]()))})}return("scrollTo" in a2&&a2.document)?a2.document.compatMode==="CSS1Compat"&&a2.document.documentElement["client"+aY]||a2.document.body["client"+aY]:(a2.nodeType===9)?Math.max(a2.documentElement["client"+aY],a2.body["scroll"+aY],a2.documentElement["scroll"+aY],a2.body["offset"+aY],a2.documentElement["offset"+aY]):a1===C?a.css(a2,a0):this.css(a0,typeof a1==="string"?a1:a1+"px")}});aM.jQuery=aM.$=a})(window);
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
