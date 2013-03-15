window.__tp_pdk_set_versions = function() {
	$pdk.expectedVersions = {};
	$pdk.version = new $pdk.PdkVersion("4", "5", "0", "252520", "2012-03-01 2:10 PM");
$pdk.expectedVersions.bootloaderVersion = new $pdk.PdkVersion("4", "5", "0", "252520", "2012-03-01 1:59 PM");
$pdk.expectedVersions.gwtVersion = new $pdk.PdkVersion("4", "5", "0", "252520", "2012-03-01 1:59 PM");

$pdk.expectedVersions.flexVersion = new $pdk.PdkVersion("4", "5", "0", "252520", "2012-03-01 1:59 PM");
};
(function(){var t='',D='.',v='/',y='[object Array]',B='boolean',E='js.com.theplatform.pdk',x='js/app',A='number',w='object',u='script',z='string',C='undefined';var j=navigator.userAgent.toLowerCase(),k=function(a){return a.test(j)},l=k(/opera/),m=!l&&k(/msie/),n=m&&k(/trident\/5.0/),o=m&&k(/msie 6/),p=k(/webkit/),q=k(/windows|win32/),r,s=t;try{r=document.getElementsByTagName(u);s=r[r.length-1].src.substr(0,r[r.length-1].src.lastIndexOf(v))}catch(a){s=t}window.$pdk={bootloader_version:1};$pdk.apply=function(a,b,c){if(c){$pdk.apply(a,c)}if(a&&(b&&typeof b==w)){for(var d in b){a[d]=b[d]}}return a};$pdk.apply($pdk,{isOpera:l,isIE:m,isIE9:n,isIE6:o,isWebKit:p,isWindows:q,scriptRoot:s,defaultAppJsRoot:x,isArray:function(a){return Object.prototype.toString.apply(a)===y},isEmpty:function(a,b){return a===null||(a===undefined||($pdk.isArray(a)&&!a.length||(!b?a===t:false)))},isPrimitive:function(a){var b=typeof a;return b==z||(b==A||b==B)},isObject:function(a){return a&&typeof a==w},tupleComp:function(a,b,c){var d=-1,e,f=a.length;for(e=0;e<f;e++){d=c(a[e],b[e]);if(d!==0){break}}return d},each:function(a,b,c){if($pdk.isEmpty(a,true)){return}if(typeof a.length==C||$pdk.isPrimitive(a)){a=[a]}for(var d=0,e=a.length;d<e;d++){if(b.call(c||a[d],a[d],d,a)===false){return d}}},ns:function(){var c,d;$pdk.each(arguments,function(b){d=b.split(D);c=window[d[0]]=window[d[0]]||{};$pdk.each(d.slice(1),function(a){c=c[a]=c[a]||{}})});return c},override:function(a,b){if(b){var c=a.prototype;$pdk.apply(c,b);if($pdk.isIE&&b.toString!=a.toString){c.toString=b.toString}}},extend:function(){var h=function(a){for(var b in a){this[b]=a[b]}};var i=Object.prototype.constructor;return function(b,c,d){if($pdk.isObject(c)){d=c;c=b;b=d.constructor!=i?d.constructor:function(){c.apply(this,arguments)}}var e=function(){},f,g=c.prototype;e.prototype=g;f=b.prototype=new e;f.constructor=b;b.superclass=g;if(g.constructor==i){g.constructor=c}b.override=function(a){$pdk.override(b,a)};f.superclass=f.supr=function(){return g};f.override=h;$pdk.override(b,d);b.extend=function(a){$pdk.extend(b,a)};return b}}()});$pdk.ns(E);js.com.theplatform.pdk=$pdk}());function PDK(){var $='',Ec='\n-',vb='" for "gwt:onLoadErrorFn"',tb='" for "gwt:onPropertyErrorFn"',rc='"<script src=\\"',hb='"><\/script>',Y='#',Dc=');',vc='-\n',Fc='-><\/scr',Kc='.cache.js',sc='.cache.js\\"><\/scr" + "ipt>"',O='/',Rb='09F1027AC60CD563CC71C9CBAC2773D2',Tb='1CF762FB084EB21F57D59E4B5B32B765',Ub='26F883C45CB5B5B3CF031B748AF4E2DE',Vb='3DED78E70F057FF91B61F70C450035B9',Wb='3E1D52C155C94FA3120935D826C70F9A',Xb='3EB531F07EA33E95BB3CD6F35F84E46B',Yb='47113BE747CEC3C704823A28FC478A5E',Zb='4D6A5E409B5E07C17334DF73D07BBF2D',$b='4DD7A7AFDED8ED38A2B26F982BC294D3',_b='652EE1D389AEEC45ED73F04E39570C6B',ac='7D3C25AD65D45F62D72DBC191FE71BFD',bc='7DE7FFA2951BC6353A7CBBF4BB13E203',cc='8EC68089BE9A3D923BFB8634C2950A12',dc='8FBB4A60A604A3B4DD5E18EEDAE3471E',ec='957A7104AFCC861A6A41BBF8866B894B',fc='9AE9BEA9EE2EB72A3F5485981F4BADDF',oc=':',Sb=':1',nb='::',tc='<scr',gb='<script id="',qb='=',Z='?',gc='A217FFD238A9119EB6FD25AE699494AF',hc='A84A2DB66AF2232992C041FB7572AA54',ic='A855C20AC2B976BB9849C4B6FCE8EB04',jc='BC88408F76720F06E6E8C8E33CA0897D',kc='BF1C8DAD7832ED74BE643BC6400CDD6B',sb='Bad handler "',lc='C51D4BEA54A09F65578F410877E91C41',Ob='Cross-site hosted mode not yet implemented. See issue ',mc='DBB63A59F0B66B78493FD508AB735571',nc='DBD1B9659BF004B35A8D88B4BE7B220F',pc='DOMContentLoaded',P='PDK',db='PDK.nocache.js',mb='PDK::',ib='SCRIPT',fb='__gwt_marker_PDK',jb='base',bb='baseUrl',S='begin',R='bootstrap',ab='clear.cache.gif',pb='content',Cc='document.write(',X='end',yc='evtGroup: "loadExternalRefs", millis:(new Date()).getTime(),',Ac='evtGroup: "moduleStartup", millis:(new Date()).getTime(),',Cb='false',Lb='gecko',Mb='gecko1_8',T='gwt.codesvr=',U='gwt.hosted=',V='gwt.hybrid',ub='gwt:onLoadErrorFn',rb='gwt:onPropertyErrorFn',ob='gwt:property',wb='hasFlash',xb='hasJquery',Ic='head',Ab='html5',Pb='http://code.google.com/p/google-web-toolkit/issues/detail?id=2079',Kb='ie6',Jb='ie8',Ib='ie9',_='img',Gc='ipt>',uc='ipt><!-',qc='loadExternalRefs',kb='meta',xc='moduleName:"PDK", sessionId:window.__gwtStatsSessionId, subSystem:"startup",',Jc='moduleRequested',W='moduleStartup',Hb='msie',lb='name',Eb='opera',zb='preferredruntimes',yb='requiresPhase1',Gb='safari',cb='script',Qb='selectingPermutation',Q='startup',Hc='text/javascript',Bb='true',zc='type: "end"});',Bc='type: "moduleRequested"});',eb='undefined',Nb='unknown',Db='user.agent',Fb='webkit',wc='window.__gwtStatsEvent && window.__gwtStatsEvent({';var l=window,m=document,n=l.__gwtStatsEvent?function(a){return l.__gwtStatsEvent(a)}:null,o=l.__gwtStatsSessionId?l.__gwtStatsSessionId:null,p,q,r=$pdk.env.Detect.getInstance().baseDir()+O+$pdk.defaultAppJsRoot+O,s={},t=[],u=[],v=[],w=0,x,y;n&&n({moduleName:P,sessionId:o,subSystem:Q,evtGroup:R,millis:(new Date).getTime(),type:S});if(!l.__gwt_stylesLoaded){l.__gwt_stylesLoaded={}}if(!l.__gwt_scriptsLoaded){l.__gwt_scriptsLoaded={}}function z(){var b=false;try{var c=l.location.search;return (c.indexOf(T)!=-1||(c.indexOf(U)!=-1||l.external&&l.external.gwtOnLoad))&&c.indexOf(V)==-1}catch(a){}z=function(){return b};return b}
function A(){if(p&&q){var a=$pdk.env.Detect.getInstance().baseDir()+O+$pdk.defaultAppJsRoot+O;p(x,P,a,w);n&&n({moduleName:P,sessionId:o,subSystem:Q,evtGroup:W,millis:(new Date).getTime(),type:X})}}
function B(){function e(a){var b=a.lastIndexOf(Y);if(b==-1){b=a.length}var c=a.indexOf(Z);if(c==-1){c=a.length}var d=a.lastIndexOf(O,Math.min(c,b));return d>=0?a.substring(0,d+1):$}
function f(a){if(a.match(/^\w+:\/\//)){}else{var b=m.createElement(_);b.src=a+ab;a=e(b.src)}return a}
function g(){var a=D(bb);if(a!=null){return a}return $}
function h(){var a=m.getElementsByTagName(cb);for(var b=0;b<a.length;++b){if(a[b].src.indexOf(db)!=-1){return e(a[b].src)}}return $}
function i(){var a;if(typeof isBodyLoaded==eb||!isBodyLoaded()){var b=fb;var c;m.write(gb+b+hb);c=m.getElementById(b);a=c&&c.previousSibling;while(a&&a.tagName!=ib){a=a.previousSibling}if(c){c.parentNode.removeChild(c)}if(a&&a.src){return e(a.src)}}return $}
function j(){var a=m.getElementsByTagName(jb);if(a.length>0){return a[a.length-1].href}return $}
var k=g();if(k==$){k=h()}if(k==$){k=i()}if(k==$){k=j()}if(k==$){k=e(m.location.href)}k=f(k);r=k;return k}
function C(){var b=document.getElementsByTagName(kb);for(var c=0,d=b.length;c<d;++c){var e=b[c],f=e.getAttribute(lb),g;if(f){f=f.replace(mb,$);if(f.indexOf(nb)>=0){continue}if(f==ob){g=e.getAttribute(pb);if(g){var h,i=g.indexOf(qb);if(i>=0){f=g.substring(0,i);h=g.substring(i+1)}else{f=g;h=$}s[f]=h}}else if(f==rb){g=e.getAttribute(pb);if(g){try{y=eval(g)}catch(a){alert(sb+g+tb)}}}else if(f==ub){g=e.getAttribute(pb);if(g){try{x=eval(g)}catch(a){alert(sb+g+vb)}}}}}}
function D(a){var b=s[a];return b==null?null:b}
function E(a,b){var c=v;for(var d=0,e=a.length-1;d<e;++d){c=c[a[d]]||(c[a[d]]=[])}c[a[e]]=b}
function F(a){var b=u[a](),c=t[a];if(b in c){return b}var d=[];for(var e in c){d[c[e]]=e}if(y){y(a,d,b)}throw null}
u[wb]=function(){return String($pdk.env.Detect.getInstance().hasFlash())};t[wb]={'false':0,'true':1};u[xb]=function(){return String($pdk.env.Detect.getInstance().hasJquery())};t[xb]={'false':0,'true':1};u[yb]=function(){var a=$pdk.env.Detect.getInstance().getConfigSet(zb);return a&&a.contains(Ab)?Bb:Cb};t[yb]={'false':0,'true':1};u[Db]=function(){var b=navigator.userAgent.toLowerCase();var c=function(a){return parseInt(a[1])*1000+parseInt(a[2])};if(function(){return b.indexOf(Eb)!=-1}())return Eb;if(function(){return b.indexOf(Fb)!=-1}())return Gb;if(function(){return b.indexOf(Hb)!=-1&&m.documentMode>=9}())return Ib;if(function(){return b.indexOf(Hb)!=-1&&m.documentMode>=8}())return Jb;if(function(){var a=/msie ([0-9]+)\.([0-9]+)/.exec(b);if(a&&a.length==3)return c(a)>=6000}())return Kb;if(function(){return b.indexOf(Lb)!=-1}())return Mb;return Nb};t[Db]={gecko1_8:0,ie6:1,ie8:2,ie9:3,opera:4,safari:5};PDK.onScriptLoad=function(a){PDK.onScriptLoad=null;p=a;A()};if(z()){alert(Ob+Pb);return}C();B();n&&n({moduleName:P,sessionId:o,subSystem:Q,evtGroup:R,millis:(new Date).getTime(),type:Qb});var G;try{E([Cb,Cb,Cb,Kb],Rb);E([Cb,Cb,Bb,Kb],Rb);E([Cb,Cb,Cb,Kb],Rb+Sb);E([Cb,Cb,Bb,Kb],Rb+Sb);E([Cb,Cb,Cb,Eb],Tb);E([Cb,Cb,Bb,Eb],Tb);E([Cb,Cb,Cb,Eb],Tb+Sb);E([Cb,Cb,Bb,Eb],Tb+Sb);E([Bb,Cb,Cb,Gb],Ub);E([Bb,Cb,Bb,Gb],Ub);E([Bb,Cb,Cb,Gb],Ub+Sb);E([Bb,Cb,Bb,Gb],Ub+Sb);E([Cb,Cb,Cb,Mb],Vb);E([Cb,Cb,Bb,Mb],Vb);E([Cb,Cb,Cb,Mb],Vb+Sb);E([Cb,Cb,Bb,Mb],Vb+Sb);E([Bb,Cb,Cb,Ib],Wb);E([Bb,Cb,Bb,Ib],Wb);E([Bb,Cb,Cb,Ib],Wb+Sb);E([Bb,Cb,Bb,Ib],Wb+Sb);E([Bb,Bb,Cb,Eb],Xb);E([Bb,Bb,Bb,Eb],Xb);E([Bb,Bb,Cb,Eb],Xb+Sb);E([Bb,Bb,Bb,Eb],Xb+Sb);E([Bb,Cb,Cb,Mb],Yb);E([Bb,Cb,Bb,Mb],Yb);E([Bb,Cb,Cb,Mb],Yb+Sb);E([Bb,Cb,Bb,Mb],Yb+Sb);E([Bb,Cb,Cb,Eb],Zb);E([Bb,Cb,Bb,Eb],Zb);E([Bb,Cb,Cb,Eb],Zb+Sb);E([Bb,Cb,Bb,Eb],Zb+Sb);E([Bb,Bb,Cb,Jb],$b);E([Bb,Bb,Bb,Jb],$b);E([Bb,Bb,Cb,Jb],$b+Sb);E([Bb,Bb,Bb,Jb],$b+Sb);E([Cb,Cb,Cb,Jb],_b);E([Cb,Cb,Bb,Jb],_b);E([Cb,Cb,Cb,Jb],_b+Sb);E([Cb,Cb,Bb,Jb],_b+Sb);E([Bb,Bb,Cb,Mb],ac);E([Bb,Bb,Bb,Mb],ac);E([Bb,Bb,Cb,Mb],ac+Sb);E([Bb,Bb,Bb,Mb],ac+Sb);E([Cb,Cb,Cb,Gb],bc);E([Cb,Cb,Bb,Gb],bc);E([Cb,Cb,Cb,Gb],bc+Sb);E([Cb,Cb,Bb,Gb],bc+Sb);E([Bb,Bb,Cb,Kb],cc);E([Bb,Bb,Bb,Kb],cc);E([Bb,Bb,Cb,Kb],cc+Sb);E([Bb,Bb,Bb,Kb],cc+Sb);E([Cb,Bb,Cb,Eb],dc);E([Cb,Bb,Bb,Eb],dc);E([Cb,Bb,Cb,Eb],dc+Sb);E([Cb,Bb,Bb,Eb],dc+Sb);E([Cb,Cb,Cb,Ib],ec);E([Cb,Cb,Bb,Ib],ec);E([Cb,Cb,Cb,Ib],ec+Sb);E([Cb,Cb,Bb,Ib],ec+Sb);E([Cb,Bb,Cb,Ib],fc);E([Cb,Bb,Bb,Ib],fc);E([Cb,Bb,Cb,Ib],fc+Sb);E([Cb,Bb,Bb,Ib],fc+Sb);E([Bb,Bb,Cb,Gb],gc);E([Bb,Bb,Bb,Gb],gc);E([Bb,Bb,Cb,Gb],gc+Sb);E([Bb,Bb,Bb,Gb],gc+Sb);E([Bb,Bb,Cb,Ib],hc);E([Bb,Bb,Bb,Ib],hc);E([Bb,Bb,Cb,Ib],hc+Sb);E([Bb,Bb,Bb,Ib],hc+Sb);E([Bb,Cb,Cb,Kb],ic);E([Bb,Cb,Bb,Kb],ic);E([Bb,Cb,Cb,Kb],ic+Sb);E([Bb,Cb,Bb,Kb],ic+Sb);E([Bb,Cb,Cb,Jb],jc);E([Bb,Cb,Bb,Jb],jc);E([Bb,Cb,Cb,Jb],jc+Sb);E([Bb,Cb,Bb,Jb],jc+Sb);E([Cb,Bb,Cb,Jb],kc);E([Cb,Bb,Bb,Jb],kc);E([Cb,Bb,Cb,Jb],kc+Sb);E([Cb,Bb,Bb,Jb],kc+Sb);E([Cb,Bb,Cb,Mb],lc);E([Cb,Bb,Bb,Mb],lc);E([Cb,Bb,Cb,Mb],lc+Sb);E([Cb,Bb,Bb,Mb],lc+Sb);E([Cb,Bb,Cb,Kb],mc);E([Cb,Bb,Bb,Kb],mc);E([Cb,Bb,Cb,Kb],mc+Sb);E([Cb,Bb,Bb,Kb],mc+Sb);E([Cb,Bb,Cb,Gb],nc);E([Cb,Bb,Bb,Gb],nc);E([Cb,Bb,Cb,Gb],nc+Sb);E([Cb,Bb,Bb,Gb],nc+Sb);G=v[F(wb)][F(xb)][F(yb)][F(Db)];var H=G.indexOf(oc);if(H!=-1){w=Number(G.substring(H+1));G=G.substring(0,H)}}catch(a){return}var I;function J(){if(!q){q=true;A();if(m.removeEventListener){m.removeEventListener(pc,J,false)}if(I){clearInterval(I)}}}
if(m.addEventListener){m.addEventListener(pc,function(){J()},false)}var I=setInterval(function(){if(/loaded|complete/.test(m.readyState)){J()}},50);n&&n({moduleName:P,sessionId:o,subSystem:Q,evtGroup:R,millis:(new Date).getTime(),type:X});n&&n({moduleName:P,sessionId:o,subSystem:Q,evtGroup:qc,millis:(new Date).getTime(),type:S});var K=$pdk.env.Detect.getInstance().baseDir()+O+$pdk.defaultAppJsRoot+O;if(/loaded|complete|interactive/.test(document.readyState)===false){var L=rc+K+G+sc;m.write(tc+uc+vc+wc+xc+yc+zc+wc+xc+Ac+Bc+Cc+L+Dc+Ec+Fc+Gc)}else{var M=document.createElement(cb);M.type=Hc;var N=document.getElementsByTagName(Ic)[0];if(!N)N=document.body;window.__gwtStatsEvent&&window.__gwtStatsEvent({moduleName:P,sessionId:window.__gwtStatsSessionId,subSystem:Q,evtGroup:qc,millis:(new Date).getTime(),type:X});window.__gwtStatsEvent&&window.__gwtStatsEvent({moduleName:P,sessionId:window.__gwtStatsSessionId,subSystem:Q,evtGroup:W,millis:(new Date).getTime(),type:Jc});M.src=K+G+Kc;N.appendChild(M)}}
$pdk.gwtBootloader=function(a){PDK()};$pdk.Entrypoint=$pdk.apply({},{_class:$pdk.extend(function(){},{constructor:function(){this._complete=false;
this._registry=null;
this._env=null;
this._callBacks=[];
this._postOnLoad=function(){}
},bind:function(a,b){this._registry=a;
this._env=b;
this._insertDefaultStylesheet()
},_loaded:false,_insertDefaultStylesheet:function(){var a=document.createElement("link");
a.type="text/css";
a.rel="stylesheet";
a.href=this._env.baseDir()+"/style/default.css";
a.media="screen";
document.getElementsByTagName("head")[0].insertBefore(a,document.getElementsByTagName("head")[0].firstChild)
},addCallback:function(a){this._callBacks.push(a);
if(this._loaded){a.apply()
}},_injectPhase1JS:function(){var e=this;
if(this._loaded){var c=this._env.baseDir();
var b=document.getElementsByTagName("head")[0];
if(typeof(window.tpPhase1Debug)!=="string"){com.theplatform.pdk.ExternalScriptLoader.loadScript("tpPDK.js",function(){})
}else{var d=document.createElement("script");
d.type="text/javascript";
d.src=this._env.baseDir()+tpPhase1Debug;
b.appendChild(d)
}}else{var a=this._postOnLoad;
this._postOnLoad=function(){a();
e._injectPhase1JS()
}
}},_connectShellsToGwt:function(b){var c=this;
if(this._loaded){this._registry.satisfyShellDeps();
this._registry.connectShellsToGwt();
this._env.setGWTReady(true);
this._complete=true;
tpDoInitGwtCommManager();
var d=this._registry.getShells().toArray();
for(i=0;
i<d.length;
i++){if(d[i].getRuntime()==="flash"){tpRegisterID(d[i].getSwfObjectId())
}}tpController.callFunction("htmlPageLoaded",[tpGetRegisteredIDs()])
}else{var a=this._postOnLoad;
this._postOnLoad=function(){a();
c._connectShellsToGwt(b)
}
}},initialize:function(){var c=this;
$pdk.shell.Factory.generate($pdk.shell.Factory.getNamesFromDomElements($pdk.dom.Helper.findByClass(/^tp/)),this._registry,this._env);
var a=$pdk.env.Detect.getInstance().getConfigSet("preferredruntimes");
var b=(!$pdk.env.Detect.getInstance().hasFlash()||a&&a.contains("html5"))?true:false;
if(!b){var d=c._registry.getShells().toArray();
for(i=0;
i<d.length;
i++){if(d[i].getRuntime()==="html5"||d[i].getRuntime()==="HTML5"){b=true;
break
}}}if(b){window.tpPhase1PDKLoaded=function(){c._connectShellsToGwt(b)
};
this._injectPhase1JS()
}else{this._connectShellsToGwt(b)
}},onLoad:function(){var b=0,a=this._callBacks.length,c=this;
this._loaded=true;
for(;
b<a;
b++){this._callBacks[b].apply()
}if(this._env.getAutoInitialize()){this.initialize()
}this._postOnLoad()
}}),_singleton:null,getInstance:function(){if($pdk.Entrypoint._singleton===null){$pdk.Entrypoint._singleton=new $pdk.Entrypoint._class()
}return $pdk.Entrypoint._singleton
},onLoad:function(){$pdk.Entrypoint.getInstance().onLoad()
}});
$pdk.PdkVersion=$pdk.extend(function(){},{constructor:function(a,d,c,e,b){this.major=a;
this.minor=d;
this.revision=c;
this.build=e;
this.date=b
},toString:function(){return this.major+"."+this.minor+"."+this.revision+"."+this.build+" ("+this.date+")"
},equals:function(a){return this.major===a.major&&this.minor===a.minor&&this.revision===a.revision&&this.build===a.build
}});
$pdk.ns("$pdk.dom");
$pdk.dom.Helper=$pdk.apply({},{findByClass:function(f,e){var d,c,h,a,g=[],b;
if($pdk.isEmpty(f)){f=null
}if($pdk.isEmpty(e)){e=document
}h=e.getElementsByTagName("*");
a=h.length;
for(d=0;
d<a;
d++){c=h[d];
if(c.nodeType===1){if(f===null){g.push(c)
}else{b=c.className;
if(typeof(b)==="string"&&b.match(f)!==null){g.push(c)
}}}}return g
}});
$pdk.ns("$pdk.env.Detect");
$pdk.env.Detect._class=$pdk.extend(function(){},{constructor:function(){$pdk.env.Detect._class.superclass.constructor.call(this);
this._config_sets={};
this._has_jquery=window.jQuery!==null&&typeof(window.jQuery)==="function";
this._flash_version=null;
this._model_urls=this._parseRSS();
this._nonie_flash_test_str=null;
this._nonie_silverlight_test_str=null;
this._has_video=this._detectVideo();
this._has_silverlight=null;
this._default_runtimes=["flash","html5"];
this._preferred_formats=null;
this._default_formats=["mpeg4","webm","ogg","flv"];
this._media_factory=null;
this._playback_format=null;
this._playback_runtime=null;
this._playback_formats=null;
this._supported_runtimes=null;
this._preferred_formats_unfiltered=null;
this._preload_stylesheets={};
this._cookies=this._parseCookies(document.cookie)
},getCookies:function(){return this._cookies
},removePreloadStylesheet:function(a){var b=document.getElementById(a+"Loading");
if(!$pdk.isEmpty(b)&&!$pdk.isEmpty(b.parentNode)){b.parentNode.removeChild(b)
}},config:function(b,a){this._nonie_flash_test_str=b;
this._nonie_silverlight_test_str=a
},getPlaybackFormat:function(){return this._playback_format
},setPlaybackFormat:function(a){this._playback_format=a
},getPlaybackRuntime:function(){return this._playback_runtime
},setPlaybackRuntime:function(a){this._playback_runtime=a
},_parseCookies:function(f){var e={},d,b=f.split(";"),c=b.length,a;
for(d=0;
d<c;
d++){a=b[d].split("=");
e[a[0].replace(/\s/g,"")]=a[1]
}return e
},_detectFlash:function(){var a=[],d=null,b=[0,0,0],f=null;
try{d=this._nonie_flash_test_str===null?navigator.plugins["Shockwave Flash"].description:this._nonie_flash_test_str
}catch(j){d=null
}if(typeof(d)==="string"&&d.length>0){try{f=navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin
}catch(h){f=null
}if(f!==null){d=d.replace(/^.*\s+(\S+\s+\S+$)/,"$1");
b[0]=parseInt(d.replace(/^(.*)\..*$/,"$1"),10);
b[1]=parseInt(d.replace(/^.*\.(.*)\s.*$/,"$1"),10);
b[2]=/[a-zA-Z]/.test(d)?parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0
}}else{try{var c=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
d=c.GetVariable("$version")
}catch(g){a=null
}if(typeof(d)==="string"){a=d.split(" ")[1].split(",");
b=[parseInt(a[0],10),parseInt(a[1],10),parseInt(a[2],10)]
}}return b
},_detectVideo:function(){var c='video/mp4; codecs="avc1.42E01E',d=document.createElement("video"),e=typeof(d.canPlayType)==="function",b={hasVideo:e,codecs:{ogg:false,h264:false,webm:false,m3u:false}},a={ogg:['video/ogg; codecs="theora"'],h264:[c+'"',c+', mp4a.40.2"'],webm:['video/webm; codecs="vp8, vorbis"','video/x-webm; codecs="vp8, vorbis"'],m3u:['audio/x-mpegurl; codecs="mp4a.40.2"','vnd.apple.mpegURL; codecs="mp4a.40.2"','application/x-mpegURL; codecs="mp4a.40.2"']};
if(e){b.codecs={ogg:this._detectVidFormat(d,a.ogg),h264:this._detectVidFormat(d,a.h264),webm:this._detectVidFormat(d,a.webm),m3u:this._detectVidFormat(d,a.m3u)}
}return b
},_detectVidFormat:function(d,a){var e=a.length,c=false;
for(var b=0;
b<e;
b++){c=!($pdk.isEmpty(d.canPlayType(a[b]))||d.canPlayType(a[b]).toLowerCase()==="no");
if(c){break
}}return c
},_detectSilverlight:function(){var j=null,d,a,f,l=false,c,b,k=[4,0,0,0];
if(typeof(window.ActiveXObject)==="function"){try{j=new ActiveXObject("AgControl.AgControl");
l=j.IsVersionSupported(k.join("."))
}catch(g){l=false
}}else{try{f=navigator.plugins["Silverlight Plug-In"];
c=this._nonie_silverlight_test_str!==null?this._nonie_silverlight_test_str:String(f.description);
c=c==="1.0.30226.2"?"2.0.30226.2":c;
b=c.split(".");
for(d=0;
d<4;
d++){a=b[d];
a=typeof(a)==="string"?parseInt(a,10):0;
b[d]=a
}l=$pdk.tupleComp(k,b,function(m,e){var n=e>m?1:0;
return e<m?-1:n
})>=0
}catch(h){l=false
}}return l
},_parseRSS:function(){var k=document.getElementsByTagName("link"),h=k.length,f=false,c=false,a,b,j={releaseurl:null,releasemodel:null,categorymodel:null,rssurl:null},d;
for(d=0;
d<h;
d++){if(!f&&k[d].type=="application/rss+xml"&&k[d].rel=="alternate"&&k[d].href.length>0){a=k[d].href;
j.rssurl=a;
try{b=a.split("?")
}catch(g){b=[]
}if(b.length>0){j.releasemodelbase=b[0];
j.releasemodel=b[0];
j.categorymodelbase=[b[0],"/categories"].join("");
j.categorymodel=[b[0],"/categories/?form=json&fields=fullTitle,id,label,order,title"].join("");
f=true
}}else{if(!c&&(k[d].type=="application/smil+xml"||k[d].type=="application/smil"||k[d].className==="tpRelease")){a=k[d].href;
if(typeof(a)==="string"&&a.length>0&&a!==document.URL){j.releaseurl=a;
c=true
}}}}return j
},_filterSupportedMedia:function(g){var e,b=[],d,c=g.length,f,a=false;
for(d=0;
d<c;
d++){e=g[d].toLowerCase();
switch(e){case"flash":if(this.hasFlash()){b.push("flash:3gpp");
b.push("flash:3gpp2");
b.push("flash:aac");
b.push("flash:actionscript");
b.push("flash:f4m");
b.push("flash:flv");
b.push("flash:mp3");
b.push("flash:mpeg");
b.push("flash:mpeg4");
b.push("flash:qt")
}break;
case"html5":f=this.hasVideo();
if(f.hasVideo){codecs=f.codecs;
if(codecs.ogg){b.push("html5:ogg")
}if(codecs.h264){b.push("html5:mpeg4")
}if(codecs.webm){b.push("html5:webm")
}if(codecs.m3u){b.push("html5:m3u")
}}b.push("html5:javascript");
break;
case"silverlight":if(this.hasFlash()){b.push("silverlight:asx");
b.push("silverlight:ism");
b.push("silverlight:mpeg4");
b.push("silverlight:wm")
}break;
case"windowsmedia":break;
case"move":break;
default:break
}}return b
},getPreferredFormats:function(){if(this._preferred_formats===null){try{this._preferred_formats=this._filterPreferredFormats(this.getConfigSet("preferredformats").toArray())
}catch(a){this._preferred_formats=[]
}if(this._preferred_formats.length<1){this._preferred_formats=this._filterPreferredFormats(this._default_formats)
}}return this._preferred_formats
},getPreferredFormatsUnfiltered:function(){if(this._preferred_formats_unfiltered===null){try{this._preferred_formats_unfiltered=this.getConfigSet("preferredformats").toArray()
}catch(a){this._preferred_formats_unfiltered=[]
}if(this._preferred_formats_unfiltered.length<1){this._preferred_formats_unfiltered=this._default_formats
}}return this._preferred_formats_unfiltered
},_filterPreferredFormats:function(d){var e=d.length,f,a=[],h,b,g=false,c;
h=this.hasVideo();
b=h.codecs;
for(c=0;
c<e;
c++){f=d[c].toLowerCase();
g=false;
switch(f){case"mpeg":case"mpeg4":if(b.h264||this.hasFlash()){g=true
}break;
case"m3u":if(b.m3u||this.hasFlash()){g=true
}break;
case"ogg":if(b.ogg){g=true
}break;
case"webm":if(b.webm){g=true
}break;
case"ism":case"asx":case"wm":case"move":case"flv":case"f4m":if(this.hasFlash()){g=true
}break;
default:break
}if(g){a.push(d[c])
}}return a
},getPlayerFormats:function(a){if(this._playback_formats===null){this._playback_formats=[];
if(this.getPlaybackRuntime()!==null){this._playback_formats=this._filterPlayerFormats(this.getPlaybackRuntime())
}if(this._playback_formats.length<1){if(a===undefined){a="flash"
}this._playback_formats=this._filterPlayerFormats(a)
}}return this._playback_formats
},_filterPlayerFormats:function(g){var e=this.getPreferredFormats(),d=e.length,a=[],f,h,b,c;
h=this.hasVideo();
b=h.codecs;
g=g.toLowerCase();
for(c=0;
c<d;
c++){f=e[c].toLowerCase();
switch(f){case"mpeg":case"mpeg4":if((g==="html5"&&b.h264)||((g==="flash"||g==="silverlight")&&this.hasFlash())){a.push(e[c])
}break;
case"m3u":if(g==="html5"&&b.m3u){a.push(e[c])
}break;
case"ogg":if(g==="html5"&&b.ogg){a.push(e[c])
}break;
case"webm":if(g==="html5"&&b.webm){a.push(e[c])
}break;
case"ism":if((g==="flash"||g==="silverlight")&&this.hasFlash()){a.push(e[c])
}break;
case"asx":case"wm":if((g==="flash"||g==="silverlight"||g==="windowsmedia")&&this.hasFlash()){a.push(e[c])
}break;
case"flv":case"f4m":if((g==="flash")&&this.hasFlash()){a.push(e[c])
}break;
case"move":if((g==="flash"||g==="move")&&this.hasFlash()){a.push(e[c])
}break;
default:break
}}return a
},getModelUrls:function(){return this._model_urls
},getFlashVersion:function(){if(this._flash_version===null){this._flash_version=this._detectFlash()
}return this._flash_version
},hasVideo:function(){return this._has_video
},hasFlash:function(){return $pdk.tupleComp([9,0,115],this.getFlashVersion(),function(d,c){var e=c>d?1:0;
return c<d?-1:e
})>=0
},hasSilverlight:function(){if(this._has_silverlight===null){this._has_silverlight=this._detectSilverlight()
}return this._has_silverlight
},hasJquery:function(){return this._has_jquery
},getAutoInitialize:function(){var a=true;
try{a=this.getConfigSet("initialize").toArray()[0].toLowerCase()!=="false"
}catch(b){a=true
}return a
},GWTReady:function(){return this._gwt_ready
},setGWTReady:function(a){this._gwt_ready=a
},addToConfigSet:function(a,b){var c=this._config_sets[a];
if($pdk.isEmpty(c)){c=new $pdk.util.ArraySet();
this._config_sets[a]=c
}c.add(b)
},getConfigSet:function(a){return this._config_sets[a]
},baseDir:function(){var a=$pdk.scriptRoot;
try{a=this.getConfigSet("baseurl").toArray()[0]
}catch(b){a=$pdk.scriptRoot
}return a
},cachePath:function(){return this.baseDir()+"/js"
},getMediaFactory:function(){if(this._media_factory===null){this._media_factory=new $pdk.env.media.Factory(this.getSupportedRuntimes(),this._filterSupportedMedia(["flash","html5","silverlight","windowsmedia","move"]),new $pdk.env.media.FactoryLoggerTpTraceMainImpl())
}return this._media_factory
},getSupportedRuntimes:function(){if(this._supported_runtimes===null){try{this._supported_runtimes=this._filterSupportedMedia(this.getConfigSet("preferredruntimes").toArray())
}catch(a){this._supported_runtimes=[]
}if(this._supported_runtimes.length<1){this._supported_runtimes=this._filterSupportedMedia(this._default_runtimes)
}}return this._supported_runtimes
},_detectPhase1:function(){var f=false;
var e=false;
var b=document.getElementsByTagName("script");
var d;
var a=b.length;
for(d=0;
d<a;
d++){var c=b[d].innerHTML;
if(!f&&(c.indexOf("tpRegisterID(")>=0)){f=true
}if(!e&&(c.indexOf("Player(")>=0||c.indexOf("ReleaseList(")>=0||c.indexOf("ReleaseModel(")>=0)){e=true
}if(f&&e){return true
}}return false
},isPhase1:function(){if(this._is_phase1===undefined){this._is_phase1=this._detectPhase1()
}return this._is_phase1
}});
$pdk.env.Detect._singleton=null;
$pdk.env.Detect.getInstance=function(){if($pdk.env.Detect._singleton===null){$pdk.env.Detect._singleton=new $pdk.env.Detect._class()
}return $pdk.env.Detect._singleton
};
$pdk.ns("$pdk.env.HttpHead");
$pdk.env.HttpHead.Processor=$pdk.extend(function(){},{constructor:function(a){this._env=a
},process:function(f){var e,a,b,g=this._collectTpMetaTags(f),d=g.length,c;
for(c=0;
c<d;
c++){e=g[c];
if(!$pdk.isEmpty(e.value)){a=e.value.replace(/\s/g,"").toLowerCase().split(",");
b=e.name.replace(/^tp:/,"").toLowerCase();
while(a.length>0){this._env.addToConfigSet(b,a.shift())
}}}},_collectTpMetaTags:function(g){var f,a=[],b,e,h=g.getElementsByTagName("meta"),d=h.length,c;
for(c=0;
c<d;
c++){f=h[c];
b=f.getAttribute("name");
if(typeof(b)==="string"&&b.match(/^tp:/)){e=f.getAttribute("content");
a.push({name:b,value:e})
}}return a
}});
$pdk.ns("$pdk.env.media");
$pdk.env.media.MediaBase=$pdk.extend(function(){},{_eligibleRuntimes:[],constructor:function(){this._satisfiedRuntimes={}
},satisfyRuntime:function(a){this._satisfiedRuntimes[a]=true
},isSatisfied:function(){var b,a=this._eligibleRuntimes.length,c=false;
for(b=0;
b<a&&!c;
b++){c=this._satisfiedRuntimes[this._eligibleRuntimes[b]];
c=typeof(c)==="boolean"?c:false
}return c
},getRuntimes:function(){var b=[],c,a=this._eligibleRuntimes.length;
for(c=0;
c<a;
c++){name=this._eligibleRuntimes[c];
found=this._satisfiedRuntimes[name];
if(typeof(found)==="boolean"?found:false){b.push(name)
}}return b
},getName:function(){return this._name
}});
$pdk.env.media.AacMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"aac",_eligibleRuntimes:["flash:aac"],constructor:function(){$pdk.env.media.AacMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.ActionScriptMedia=$pdk.extend($pdk.env.media.MediaBase,{_eligibleRuntimes:["flash:actionscript"],_name:"actionscript",constructor:function(){$pdk.env.media.ActionScriptMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.AsxMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"asx",_eligibleRuntimes:["flash:asx"],constructor:function(){$pdk.env.media.AsxMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.AviMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"avi",_eligibleRuntimes:["flash:avi"],constructor:function(){$pdk.env.media.AviMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.F4mMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"f4m",_eligibleRuntimes:["flash:f4m"],constructor:function(){$pdk.env.media.F4mMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.Factory=$pdk.extend(function(){},{constructor:function(b,a,c){this._runtimes=b;
this._runtimes_any_supported=a;
this._logger=c
},getBestRuntime:function(a,c,d){var b=new $pdk.env.media.strategy.Context(d,this._logger,this,c,this._runtimes,this._runtimes_any_supported),e;
if(a==="Player"){e=new $pdk.env.media.strategy.CodecComponentStrategy()
}else{e=new $pdk.env.media.strategy.GeneralComponentStrategy()
}return e.getBestRuntime(b)
},createMedia:function(d,c){c=typeof(c)==="boolean"?c:false;
var e,b=c?this._runtimes_any_supported:this._runtimes,a=b.length,f=null;
switch(d){case"actionscript":f=new $pdk.env.media.ActionScriptMedia();
break;
case"flv":f=new $pdk.env.media.FlvMedia();
break;
case"javascript":f=new $pdk.env.media.JavaScriptMedia();
break;
case"mpeg4":f=new $pdk.env.media.Mpeg4Media();
break;
case"mpeg":f=new $pdk.env.media.MpegMedia();
break;
case"ogg":f=new $pdk.env.media.OggMedia();
break;
case"webm":f=new $pdk.env.media.WebMMedia();
break;
case"m3u":f=new $pdk.env.media.M3uMedia();
break;
case"3gpp":f=new $pdk.env.media.ThreeGppMedia();
break;
case"3gpp2":f=new $pdk.env.media.ThreeGpp2Media();
break;
case"aac":f=new $pdk.env.media.AacMedia();
break;
case"asx":f=new $pdk.env.media.AsxMedia();
break;
case"avi":f=new $pdk.env.media.AviMedia();
break;
case"f4m":f=new $pdk.env.media.F4mMedia();
break;
case"m3u":f=new $pdk.env.media.M3uMedia();
break;
case"move":f=new $pdk.env.media.MoveMedia();
break;
case"mp3":f=new $pdk.env.media.Mp3Media();
break;
case"qt":f=new $pdk.env.media.QtMedia();
break;
case"ism":f=new $pdk.env.media.IsmMedia();
break;
case"wm":f=new $pdk.env.media.WmMedia();
break;
default:f=new $pdk.env.media.NoOpMedia();
break
}for(e=0;
e<a;
e++){f.satisfyRuntime(b[e])
}return f
}});
$pdk.env.media.FactoryLoggerConsoleImpl=$pdk.extend(function(){},{constructor:function(){},log:function(a,b){console.log(a)
}});
$pdk.env.media.FactoryLoggerTpTraceMainImpl=$pdk.extend(function(){},{constructor:function(){},log:function(a,b){tpDebug(a,"bootloader","$pdk.env.media.Factory",b)
}});
$pdk.env.media.FlvMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"flv",_eligibleRuntimes:["flash:flv"],constructor:function(){$pdk.env.media.FlvMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.IsmMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"ism",_eligibleRuntimes:["silverlight:ism"],constructor:function(){$pdk.env.media.IsmMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.JavaScriptMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"javascript",_eligibleRuntimes:["html5:javascript"],constructor:function(){$pdk.env.media.JavaScriptMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.M3uMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"m3u",_eligibleRuntimes:["html5:m3u"],constructor:function(){$pdk.env.media.M3uMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.MoveMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"move",_eligibleRuntimes:["flash:move"],constructor:function(){$pdk.env.media.MoveMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.Mp3Media=$pdk.extend($pdk.env.media.MediaBase,{_name:"mp3",_eligibleRuntimes:["flash:mp3"],constructor:function(){$pdk.env.media.Mp3Media.superclass.constructor.apply(this)
}});
$pdk.env.media.Mpeg4Media=$pdk.extend($pdk.env.media.MediaBase,{_name:"mpeg4",_eligibleRuntimes:["flash:mpeg4","html5:mpeg4","silverlight:mpeg4"],constructor:function(){$pdk.env.media.Mpeg4Media.superclass.constructor.apply(this)
}});
$pdk.env.media.MpegMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"mpeg",_eligibleRuntimes:["flash:mpeg"],constructor:function(){$pdk.env.media.Mpeg4Media.superclass.constructor.apply(this)
}});
$pdk.env.media.NoOpMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"noop"});
$pdk.env.media.OggMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"ogg",_eligibleRuntimes:["html5:ogg"],constructor:function(){$pdk.env.media.OggMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.QtMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"qt",_eligibleRuntimes:["flash:qt"],constructor:function(){$pdk.env.media.QtMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.ThreeGpp2Media=$pdk.extend($pdk.env.media.MediaBase,{_name:"3gpp2",_eligibleRuntimes:["flash:3gpp2"],constructor:function(){$pdk.env.media.ThreeGpp2Media.superclass.constructor.apply(this)
}});
$pdk.env.media.ThreeGppMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"3gpp",_eligibleRuntimes:["flash:3gpp"],constructor:function(){$pdk.env.media.ThreeGppMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.WebMMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"webm",_eligibleRuntimes:["html5:webm"],constructor:function(){$pdk.env.media.WebMMedia.superclass.constructor.apply(this)
}});
$pdk.env.media.WmMedia=$pdk.extend($pdk.env.media.MediaBase,{_name:"wm",_eligibleRuntimes:["flash:wm"],constructor:function(){$pdk.env.media.WmMedia.superclass.constructor.apply(this)
}});
$pdk.ns("$pdk.env.media.strategy");
$pdk.env.media.strategy.AbstractStrategy=$pdk.extend(function(){},{_getPossibleFormats:function(f,e){var d,k=f.length,g,c,b=[],j,a=e.length,h;
for(g=0;
g<a;
g++){j=e[g].toLowerCase();
for(c=0;
c<k;
c++){d=f[c].toLowerCase();
if(j===d){b.push(d)
}}}return b
},_searchByFormatThenRuntime:function(o,p,k,a){var r=false,g,b,d,l,q=k.length,f,c=p.length,e,j,m,h;
for(g=0;
g<q&&!r;
g++){l=k[g];
b=o.createMedia(l,a);
j=b.getRuntimes();
m=j.length;
for(h=0;
h<c&&!r;
h++){f=p[h];
for(d=0;
d<m&&!r;
d++){e=j[d];
r=e===f
}}}return{runtime:r?f.replace(/(.*):.*/,"$1"):"none",medium:r?b.getName():"none"}
},_searchByRuntimeThenFormat:function(o,p,k,a){var r=false,g,b,d,l,q=k.length,f,c=p.length,e,j,m,h;
for(h=0;
h<c&&!r;
h++){f=p[h];
for(g=0;
g<q&&!r;
g++){l=k[g];
b=o.createMedia(l,a);
j=b.getRuntimes();
m=j.length;
for(d=0;
d<m&&!r;
d++){e=j[d];
r=e===f
}}}return{runtime:r?f.replace(/(.*):.*/,"$1"):"none",medium:r?b.getName():"none"}
}});
$pdk.env.media.strategy.CodecComponentStrategy=$pdk.extend($pdk.env.media.strategy.AbstractStrategy,{getBestRuntime:function(a){var d,e=a.getComponentSupportedFormats(),j=a.getLogger(),h=a.getMediaFactory(),b=[],f,c=a.getPreferredFormats(),g=a.getRuntimes();
runtimes_any_supported=a.getRuntimesAnySupported();
j.log("searching for best runtime for preferred formats ("+c.join(", ")+") from list of supported formats ("+e.join(", ")+")",tpConsts.INFO);
b=this._getPossibleFormats(e,c);
f=b.length;
j.log("possible formats narrowed to: "+(f>0?b.join(", "):"[none]"),tpConsts.INFO);
d=this._searchByFormatThenRuntime(h,g,b,false);
if(d.medium==="none"){j.log("falling back to any supported runtime",tpConsts.INFO);
d=this._searchByFormatThenRuntime(h,runtimes_any_supported,b,true)
}if(d.runtime==="none"){j.log("no viable runtime found",tpConsts.INFO)
}else{j.log("picked best format/runtime : "+d.medium+"/"+d.runtime,tpConsts.INFO)
}return d
}});
$pdk.env.media.strategy.Context=$pdk.extend(function(){},{constructor:function(f,c,d,e,b,a){this._component_supported_formats=f;
this._logger=c;
this._media_factory=d;
this._preferred_formats=e;
this._runtimes=b;
this._runtimes_any_supported=a
},getComponentSupportedFormats:function(){return this._component_supported_formats
},getLogger:function(){return this._logger
},getMediaFactory:function(){return this._media_factory
},getPreferredFormats:function(){return this._preferred_formats
},getRuntimes:function(){return this._runtimes
},getRuntimesAnySupported:function(){return this._runtimes_any_supported
}});
$pdk.env.media.strategy.GeneralComponentStrategy=$pdk.extend($pdk.env.media.strategy.AbstractStrategy,{getBestRuntime:function(a){var d,e=a.getComponentSupportedFormats(),j=a.getLogger(),h=a.getMediaFactory(),b=[],f,c=a.getPreferredFormats(),g=a.getRuntimes();
runtimes_any_supported=a.getRuntimesAnySupported();
b=this._getPossibleFormats(e,c);
f=b.length;
d=this._searchByFormatThenRuntime(h,g,b,false);
if(d.medium==="none"){d=this._searchByRuntimeThenFormat(h,g,e,false)
}if(d.medium==="none"){d=this._searchByFormatThenRuntime(h,runtimes_any_supported,b,true)
}if(d.medium==="none"){d=this._searchByFormatThenRuntime(h,runtimes_any_supported,e,true)
}if(d.runtime==="none"){j.log("no viable runtime found",tpConsts.INFO)
}else{j.log("picked best format/runtime : "+d.medium+"/"+d.runtime,tpConsts.INFO)
}return d
}});
$pdk.ns("$pdk.queue");
$pdk.queue.Controller=$pdk.extend(function(){},{constructor:function(a){var b=this;
this._env=a;
this._events={};
this._functions={};
this._objects={};
this._isLoading=true;
this._canMessage=false;
this._messageQueue=[];
this._priorityQueue=[];
this._sendQueue=[];
this._isSending=false;
this._isShutDown=false;
this._runtimes=null;
this._blankString="__blank_string__";
this._defaultScope={globalDataType:this._getDataTypeName("ScopeInfo"),controlId:"javascript",isGlobal:true,isAny:false,isEmpty:false,scopeIds:["javascript","default"]}
},ready:function(){this.isHTML5Loading=false;
this._checkMessageQueue();
this._checkPriorityQueue()
},sendMessage:function(a,d,b){if(d.name==="controllerComplete"){this.onControllerComplete()
}var c={message:d,destination:a};
if(this._isLoading&&!b){this._messageQueue.push(c)
}else{if(!this._canMessage){this._priorityQueue.push(c)
}else{this._doSendMessage(c)
}}},_isSafariWin:(navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1),onControllerComplete:function(){},_doSendMessage:function(a){var b=tpThisMovie(a.destination);
if(a.message.name==="callFunction"&&a.message.payload.name==="showFullScreen"&&a.message.payload.args[0]===true&&b.tagName&&(b.tagName.toLowerCase()==="object"||b.tagName.toLowerCase()==="embed")){tpDebug("Switching to full screen from Javascript is not supported by the Flash run-time. Flash only allows you to go to full screen mode via a click in the player itself.","tpController","Controller","error");
return
}if(this._isShutDown){return
}if($pdk.isWebKit&&$pdk.isWindows){setTimeout(function(){b.executeMessage(a.message)
},1)
}else{b.executeMessage(a.message)
}},_checkMessageQueue:function(){var a=this._messageQueue.length;
while(this._messageQueue.length>0){this._doSendMessage(this._messageQueue.shift())
}},_checkPriorityQueue:function(){var a;
while(this._priorityQueue.length>0){a=this._priorityQueue.shift();
if(a.destination==="unknown"){a.destination=tpBridgeID
}this._doSendMessage(a)
}},_wrapMessage:function(a,d){var b={globalDataType:this._getDataTypeName("CommInfo"),id:"javascript"},c={globalDataType:this._getDataTypeName("MessageInfo"),name:a,payload:d,comm:b};
return c
},_getDataTypeName:function(a){var b=null;
switch(a){case"AdPattern":b="com.theplatform.pdk.data::AdPattern";
break;
case"Banner":b="com.theplatform.pdk.data::Banner";
break;
case"BaseClip":b="com.theplatform.pdk.data::BaseClip";
break;
case"CallInfo":b="com.theplatform.pdk.communication::CallInfo";
break;
case"CategoryInfo":b="com.theplatform.pdk.data::CategoryInfo";
break;
case"Clip":b="com.theplatform.pdk.data::Clip";
break;
case"CommInfo":b="com.theplatform.pdk.communication::CommInfo";
break;
case"CustomData":b="com.theplatform.pdk.data::CustomData";
break;
case"CustomValue":b="com.theplatform.pdk.data::CustomValue";
break;
case"DispatchInfo":b="com.theplatform.pdk.communication::DispatchInfo";
break;
case"FunctionInfo":b="com.theplatform.pdk.communication::FunctionInfo";
break;
case"HandlerInfo":b="com.theplatform.pdk.communication::HandlerInfo";
break;
case"HyperLink":b="com.theplatform.pdk.data::HyperLink";
break;
case"MediaClick":b="com.theplatform.pdk.data::MediaClick";
break;
case"MediaFile":b="com.theplatform.pdk.data::MediaFile";
break;
case"MessageInfo":b="com.theplatform.pdk.communication::MessageInfo";
break;
case"MetricInfo":b="com.theplatform.pdk.data::MetricInfo";
break;
case"Overlay":b="com.theplatform.pdk.data::Overlay";
break;
case"PdkEvent":b="com.theplatform.pdk.events::PdkEvent";
break;
case"ProviderInfo":b="com.theplatform.pdk.data::ProviderInfo";
break;
case"Range":b="com.theplatform.pdk.data::Range";
break;
case"Rating":b="com.theplatform.pdk.data::Rating";
break;
case"Release":b="com.theplatform.pdk.data::Release";
break;
case"ReleaseInfo":b="com.theplatform.pdk.data::ReleaseInfo";
break;
case"ScopeInfo":b="com.theplatform.pdk.communication::ScopeInfo";
break;
case"Sort":b="com.theplatform.pdk.data::Sort";
break;
case"Subtitles":b="com.theplatform.pdk.data::Subtitles";
break;
case"TrackingUrl":b="com.theplatform.pdk.data::TrackingUrl";
break;
case"BandwidthPreferences":b="com.theplatform.pdk.data::BandwidthPreferences";
break;
case"Annotation":b="com.theplatform.pdk.data::Annotation";
break;
default:b=null;
break
}return b
},_createScope:function(a){if(a&&a.globalDataType){return a
}var b=this._defaultScope;
if(!$pdk.isEmpty(a)){if(a.length===0){a.push("javascript")
}b={globalDataType:this._getDataTypeName("ScopeInfo"),controlId:"javascript",isGlobal:true,isAny:false,isEmpty:false,scopeIds:a}
}return b
},_checkForExternalPlayers:function(){var f=tpGetPlayerFormats(),e,d,a,c,b;
if(f){f=f.split("|");
e=f.length;
a=this._isWMLoaded();
for(b=0;
b<e;
b++){d=f[b].toLowerCase();
switch(d){case"mpeg":case"mpeg4":if(!a&&this._checkRuntimePreferred(["silverlight","flash"])=="silverlight"){tpLoadScript(this._env.baseDir()+"/js/tpExternal_SMF.js");
a=true
}break;
case"ism":if(!a){tpLoadScript(this._env.baseDir()+"/js/tpExternal_SMF.js");
a=true
}break;
case"asx":case"wm":if(!a){c=this._checkRuntimePreferred(["silverlight","windowsmedia"]);
if(c==="windowsmedia"){tpLoadScript(this._env.baseDir()+"/js/tpExternal_WMP.js");
a=true
}else{tpLoadScript(this._env.baseDir()+"/js/tpExternal_SMF.js");
a=true
}}break;
case"move":break;
default:break
}}}},_isWMLoaded:function(){var b,a;
if(typeof(tpExternalJS)!=="undefined"){for(b=0;
b<tpExternalJS.length;
b++){a=tpExternalJS[b];
if(a.indexOf("/tpExternal_SMF.js")>=0||a.indexOf("/tpExternal_WMP.js")){return true
}}}return false
},_checkRuntimePreferred:function(d){if(this._runtimes===null){this._runtimes=this._env.getSupportedRuntimes()
}var a=d.length,c=this._runtimes.length,f,g,e,b;
for(e=0;
e<c;
e++){f=this._runtimes[e];
for(b=0;
b<a;
b++){g=d[b];
if(f.indexOf(g)===0){return g
}}}return null
},getProperty:function(a){return this.component[a.toLowerCase()]
},registerFunction:function(g,h,j,c){var d=this._createScope(j);
var b=c===undefined?false:c;
var e,l,a,k,f=false;
if($pdk.isEmpty(this._functions[g])){this._functions[g]={};
b=true
}for(e=0;
e<d.scopeIds.length&&!f;
e++){l=d.scopeIds[e];
if(l==="*"){f=true
}else{this._functions[g][l]=h;
b=true
}}if(!f&&b){a={globalDataType:this._getDataTypeName("FunctionInfo"),name:g,scope:d};
k=this._wrapMessage("registerFunction",a);
this.sendMessage(tpBridgeID,k,true)
}},unregisterFunction:function(g,h){var c=this._createScope(scopes),d,k,f,b,a,e=false,j;
if(!$pdk.isEmpty(this._functions[g])){a=this._functions[g];
for(d=0;
d<c.scopeIds.length;
d++){k=c.scopeIds[d];
if(k=="*"){delete this._functions[g];
break
}if(!$pdk.isEmpty(a[k])){delete a[k]
}}e=false;
if(!$pdk.isEmpty(a)){for(f in a){e=true;
break
}if(!e){delete this._functions[g]
}}}if(!$pdk.isEmpty(e)){b={globalDataType:this._getDataTypeName("FunctionInfo"),name:g,scope:c};
j=this._wrapMessage("unregisterFunction",b);
this.sendMessage(tpBridgeID,j,true)
}},addEventListener:function(e,f,g){var d=this._createScope(g),h={globalDataType:this._getDataTypeName("HandlerInfo"),name:e,handler:f,scope:d},b=false,j,a,c,k;
if($pdk.isEmpty(this._events[e])){this._events[e]=[];
b=true
}j=this._events[e];
a=false;
for(c=0;
c<j.length;
c++){if(j[c].handler==f){j[c]=h;
a=true;
break
}}if(!a){j.push(h)
}if(b){k=this._wrapMessage("addEventListener",h);
this.sendMessage(tpBridgeID,k,true)
}},removeEventListener:function(e,f,g){if($pdk.isEmpty(this._events[e])){return
}var b=this._createScope(g),j={globalDataType:this._getDataTypeName("HandlerInfo"),name:e,handler:f,scope:b},a=this._events[e],c,d,k;
for(c=0;
c<a.length;
c++){d=a[c];
if(d.handler==j.handler){a=a.splice(c,1);
break
}}if(a.length===0){delete this._events[e];
k=this._wrapMessage("removeEventListener",j);
this.sendMessage(tpBridgeID,k,true)
}},dispatchEvent:function(b,g,e){var d=this._createScope(e),a={globalDataType:this._getDataTypeName("PdkEvent"),type:b,data:g},c={globalDataType:this._getDataTypeName("DispatchInfo"),evt:a,scope:d};
this._doDispatchEvent(c);
var f=this._wrapMessage("dispatchEvent",c);
this.sendMessage(tpBridgeID,f,true)
},callFunction:function(g,b,e){var d=this._createScope(e),c={globalDataType:this._getDataTypeName("CallInfo"),name:g,args:b,scope:d},f;
var a=this._doCallFunction(c);
f=this._wrapMessage("callFunction",c);
this.sendMessage(tpBridgeID,f,true);
return a
},_doDispatchEvent:function(dispatch){if($pdk.isEmpty(this._events[dispatch.evt.type])){return
}var handlers=this._events[dispatch.evt.type].slice(0),i,j,s,k,fired,handler;
if(dispatch.evt&&dispatch.evt.data){this._parseCustomData(dispatch.evt.data)
}for(i=0;
i<handlers.length;
i++){handler=handlers[i];
if(dispatch.scope.isAny){if(typeof handler.handler==="string"){eval(handler.handler)(dispatch.evt)
}else{if(typeof handler.handler==="function"){handler.handler(dispatch.evt)
}}continue
}for(j=0;
j<handler.scope.scopeIds.length;
j++){s=handler.scope.scopeIds[j];
fired=false;
if(s=="*"){if(typeof handler.handler==="string"){eval(handler.handler)(dispatch.evt)
}else{if(typeof handler.handler==="function"){handler.handler(dispatch.evt)
}}break
}for(k=0;
k<dispatch.scope.scopeIds.length;
k++){if(s==dispatch.scope.scopeIds[k]){fired=true;
if(typeof handler.handler==="string"){eval(handler.handler)(dispatch.evt)
}else{if(typeof handler.handler==="function"){handler.handler(dispatch.evt)
}}break
}}if(fired){break
}}}},_parseCustomData:function(a){for(var e in a){var c=a[e];
if(c&&(c.globalDataType||$pdk.isArray(c))){if(c.globalDataType=="com.theplatform.pdk.data::CustomData"){for(var d in c){var b=d;
if(!b){continue
}if(b.indexOf("__PERIOD__")!=-1){b=b.replace("__PERIOD__",".")
}if(b.indexOf("__DASH__")!=-1){b=b.replace("__DASH__","-")
}if(b.indexOf("__COLON__")!=-1){b=b.replace("__COLON__",":")
}if(b.indexOf("__SPACE__")!=-1){b=b.replace("__SPACE__"," ")
}if(b.indexOf("__LEFT_BRACKET__")!=-1){b=b.replace("__LEFT_BRACKET__","[")
}if(b.indexOf("__RIGHT_BRACKET__")!=-1){b=b.replace("__RIGHT_BRACKET__","]")
}if(b!=d){c[b]=c[d];
delete c[d]
}}}else{this._parseCustomData(c)
}}}},_doCallFunction:function(e){if($pdk.isEmpty(this._functions[e.name])){return
}var a={},c,d,h;
var b;
for(c=0;
c<e.scope.scopeIds.length;
c++){d=e.scope.scopeIds[c];
if(!$pdk.isEmpty(this._functions[e.name][d])){a[this._functions[e.name][d]]=this._functions[e.name][d]
}}for(h in a){var g=a[h];
b=g.apply(this._objects[e.name],e.args)
}return b
},receiveMessage:function(a,b){if(a=="javascript"){switch(b.name){case"commReady":tpBridgeID=tpCommID;
this._canMessage=true;
this._checkPriorityQueue();
break;
case"bridgeReady":tpBridgeID=b.comm.id;
this._canMessage=true;
this._checkPriorityQueue();
break;
case"dispatchEvent":this.receiveEvent(b.payload);
break;
case"callFunction":this._doCallFunction(b.payload);
break;
default:break
}}else{this.sendMessage(a,b,true)
}},receiveEvent:function(a){if(a.evt.type=="OnPlayerLoaded"){this._isLoading=false;
this._checkMessageQueue();
this._checkForExternalPlayers()
}this._doDispatchEvent(a)
},modRelease:function(a){var b;
if(!$pdk.isEmpty(a)){a.globalDataType=this._getDataTypeName("Release");
if(a.categories){a.categories=this.modCategories(a.categories)
}if(a.thumbnails){for(b=0;
b<a.thumbnails.length;
b++){a.thumbnails[b].globalDataType=this._getDataTypeName("MediaFile");
if(a.thumbnails[b].customValues){a.thumbnails[b].customValues=this.modCustomValues(a.thumbnails[b].customValues)
}}}if(a.customValues){a.customValues=this.modCustomValues(a.customValues)
}if(a.metrics){for(b=0;
b<a.metrics.length;
b++){a.metrics[b].globalDataType=this._getDataTypeName("MetricInfo")
}}if(a.provider){a.provider.globalDataType=this._getDataTypeName("ProviderInfo");
if(a.provider.customValues){a.provider.customValues=this.modCustomValues(a.provider.customValues)
}}if(a.ratings){for(b=0;
b<a.ratings.length;
b++){a.ratings[b].globalDataType=this._getDataTypeName("Rating")
}}if(a.URL){a.url=a.URL
}}return a
},modCustomValues:function(a){var b;
for(b=0;
b<a.length;
b++){a[b].globalDataType=this._getDataTypeName("CustomValue")
}return a
},modCategories:function(a){var b;
for(b=0;
b<a.length;
b++){a[b].globalDataType=this._getDataTypeName("CategoryInfo")
}return a
},modClip:function(a){var b;
if(!$pdk.isEmpty(a)){a.globalDataType=this._getDataTypeName("Clip");
b=a.baseClip;
if($pdk.isEmpty(b)){b={}
}if(!$pdk.isEmpty(a.banners)){b.banners=a.banners
}if(!$pdk.isEmpty(a.overlays)){b.overlays=a.overlays
}a.baseClip=this.modBaseClip(b);
if(!$pdk.isEmpty(a.chapter)){a.chapter.globalDataType=this._getDataTypeName("Chapter")
}}return a
},modBaseClip:function(b){var a;
if($pdk.isEmpty(b)){b={}
}b.globalDataType=this._getDataTypeName("BaseClip");
if(!$pdk.isEmpty(b.moreInfo)){b.moreInfo.globalDataType=this._getDataTypeName("HyperLink");
if(!$pdk.isEmpty(b.moreInfo.clickTrackingUrls)){b.moreInfo.clickTrackingUrls=this.modTracking(b.moreInfo.clickTrackingUrls)
}}if(!$pdk.isEmpty(b.banners)){for(a=0;
a<b.banners.length;
a++){b.banners[a].globalDataType=this._getDataTypeName("Banner");
if(!$pdk.isEmpty(b.banners[a].clickTrackingUrls)){b.banners[a].clickTrackingUrls=this.modTracking(b.banners[a].clickTrackingUrls)
}}}if(!$pdk.isEmpty(b.overlays)){for(a=0;
a<b.overlays.length;
a++){b.overlays[a].globalDataType=this._getDataTypeName("Overlay");
if(!$pdk.isEmpty(b.overlays[a].clickTrackingUrls)){b.overlays[a].clickTrackingUrls=this.modTracking(b.overlays[a].clickTrackingUrls)
}}}if(!$pdk.isEmpty(b.availableSubtitles)){for(a=0;
a<b.availableSubtitles;
a++){b.availableSubtitles[a].globalDataType=this._getDataTypeName("Subtitles")
}}if(!$pdk.isEmpty(b.categories)){b.categories=this.modCategories(b.categories)
}if(!$pdk.isEmpty(b.adPattern)){b.adPattern.globalDataType=this._getDataTypeName("AdPattern")
}if(!$pdk.isEmpty(b.trackingURLs)){b.trackingURLs=this.modTracking(b.trackingURLs)
}if(!$pdk.isEmpty(b.contentCustomData)){b.contentCustomData.globalDataType=this._getDataTypeName("CustomData")
}if(!$pdk.isEmpty(b.ownerCustomData)){b.ownerCustomData.globalDataType=this._getDataTypeName("CustomData")
}if(!$pdk.isEmpty(b.outletCustomData)){b.outletCustomData.globalDataType=this._getDataTypeName("CustomData")
}return b
},modTracking:function(a){var b;
for(b=0;
b<a.length;
b++){a.globalDataType=this._getDataTypeName("TrackingUrl")
}return a
},shutDown:function(){this.callFunction("shutDown",[],["*"]);
this._isShutDown=true
},_regFunc:function(a,e,g,d){var b,h,f=$pdk.isEmpty(e)?0:e.length,c;
for(b=0;
b<f;
b++){h=e[b];
c=g[b];
if(!$pdk.isEmpty(g[b])){switch(h){case"com.theplatform.pdk.data.Release":c=tpController.modRelease(c);
break;
case"com.theplatform.pdk.data.Clip":c=tpController.modClip(c);
break;
case"com.theplatform.pdk.data.Range":c.globalDataType=this._getDataTypeName("Range");
break;
case"com.theplatform.pdk.data.Sort":c.globalDataType=this._getDataTypeName("Sort");
break;
case"com.theplatform.pdk.data.Annotation":c.globalDataType=this._getDataTypeName("Annotation");
break;
case"com.theplatform.pdk.data.BandwidthPreferences":c.globalDataType=this._getDataTypeName("BandwidthPreferences");
break;
default:break
}}}this.callFunction(a,g,d)
}});
$pdk.ns("$pdk.shell");
$pdk.shell.DefaultsAbstractImpl=$pdk.extend(function(){},{decorate:function(b,c,a){b.fp.allowscriptaccess="always";
b.fp.menu=true;
b.fp.salign="tl";
b.fp.scale="noscale";
b.fp.wmode="transparent";
b.fa.wmode="transparent"
},configureRuntime:function(b,c){tpDebug("configuring shell "+b.getName(),"bootloader","$pdk.shell.DefaultsAbstractImpl",tpConsts.INFO);
if(!$pdk.isIE6){var a=c.getMediaFactory().getBestRuntime(b.getName(),c.getPreferredFormatsUnfiltered(),b.supportedMedia.split(","));
b.setRuntime(a.runtime);
b.setMedium(a.medium)
}else{b.setRuntime("flash");
b.setMedium(c.getPreferredFormatsUnfiltered()[0])
}this._is_phase1=$pdk.env.Detect.getInstance().isPhase1()
},isPhase1:function(){return this._is_phase1
}});
$pdk.shell.Base=$pdk.extend(function(){},{constructor:function(d,c,b){var a;
$pdk.shell.Base.superclass.constructor.call(this);
this.fp={};
this.fa={};
this.useBootloader="true";
this._markupId=typeof(d)==="string"?d:String(Math.round(Math.random()*100000000000000));
this._width=typeof(c)==="string"||typeof(c)==="number"?String(c):null;
this._height=typeof(b)==="string"||typeof(b)==="number"?String(b):null;
this._write_was_called=false;
this._attach_was_called=false;
this._gwt_component=null;
this._registry.add(this);
this._runtime=null;
this._medium=null;
this._configureProcessor=function(){};
this._config_decorator.decorate(this,this._env,this._registry)
},getWidth:function(){return this._width!==null?String(this._width):null
},getHeight:function(){return this._height!==null?String(this._height):null
},setWidth:function(a){this._width=a
},setHeight:function(a){this._height=a
},getId:function(){return this._markupId
},getSwfObjectId:function(){return this._markupId===null?null:["_",this._markupId,"PdkSwfObject"].join("")
},getName:function(){return this._name
},getMarkupClass:function(){return this._markupClass
},getRuntime:function(){if(typeof(this.runtime)==="string"){this._runtime=this.runtime;
delete this.runtime
}return this._runtime
},setRuntime:function(a){this._runtime=a
},getMedium:function(){return this._medium
},setMedium:function(a){this._medium=a
},asSwf:function(){return this._asSwf
},jsViewImpl:function(){return this._jsViewImpl
},jsViewCallBackName:function(){return this._jsViewCallBackName
},getPriority:function(){return this._priority
},write:function(){this._write_was_called=true;
var a=document.getElementsByTagName("script");
var b=a[a.length-1];
var c=b.parentNode;
this._registry.remove(this);
this._markupId=c.id;
this._registry.add(this);
this.bind()
},attach:function(){this.bind()
},bind:function(){this._attach_was_called=true;
if(this._env.GWTReady()){this._attachToGWT()
}},resyncAttach:function(){if(this._attach_was_called){this._attachToGWT()
}},_attachToGWT:function(){var a;
if(this._gwt_component===null){a=new com.theplatform.pdk.ComponentFactory(this.getName(),this.getConfig());
this._gwt_component=a.create();
this._gwt_component.bind()
}},getConfig:function(){this._prepareConfigure();
var c={id:this._markupId,skinurl:this._env.baseDir()+"/swf/skinGlass.swf"},b;
c=this._normalizeNVP(this,c);
if(this.getName()==="Player"&&c.releaseurl===undefined){c.releaseurl=this._env.getModelUrls().releaseurl
}delete this.fa.height;
delete this.fa.width;
delete this.fp.height;
delete this.fp.width;
delete c.height;
delete c.width;
delete c.engine;
var a=this.jsViewImpl();
if(a&&a!==""&&a.indexOf("@Bundle:")===-1){a=this._env.baseDir()+"/js/"+this.jsViewImpl()
}else{if(a.indexOf("@Bundle:")!==-1){a=a.replace("@Bundle:","")
}}return{as_swf:this._env.baseDir()+"/swf/"+this.asSwf(),js_view_impl:a,markup_class:this.getMarkupClass(),engine:this.getRuntime(),medium:this.getMedium(),markup_id:this.getId(),pdk_swf_object_id:this.getSwfObjectId(),variables:c,width:this.getWidth(),height:this.getHeight(),flash_attributes:this._normalizeNVP(this.fa,{}),flash_parameters:this._normalizeNVP(this.fp,{})}
},setConfigureProcessor:function(a){this._configureProcessor=a
},_prepareConfigure:function(){this._configureProcessor(this)
},_normalizeNVP:function(d,c){var b,a,e;
for(e in d){if(!e.match(/^_/)){b=d[e];
a=typeof(b);
if(a==="number"||a==="boolean"){b=String(b);
a="string"
}if(a==="string"){c[e.toLowerCase()]=b
}}}return c
}});
$pdk.shell.Collection=$pdk.extend(function(){},{constructor:function(){$pdk.shell.Collection.superclass.constructor.call(this);
this._shells={}
},put:function(b,a){this._shells[b]=a
},remove:function(a){delete this._shells[a]
},get:function(a){return this._shells[a]
},keys:function(){var b,a=[];
for(b in this._shells){if(this._shells[b]!==Object.prototype[b]){a.push(b)
}}return a
},toArray:function(){var d=[],c=this.keys(),a=c.length,b;
for(b=0;
b<a;
b++){d.push(this.get(c[b]))
}return d
}});
$pdk.shell.DefaultsCategoryListImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsCategoryListImpl.superclass.decorate.apply(this,arguments);
b.divId=b.getId();
b.supportedMedia="actionscript";
if(typeof(b.expandedcssclass)!=="string"||b.expandedcssclass.length>0){b.expandedcssclass=b.getMarkupClass()+"Expanded"
}this.configureRuntime(b,c);
if(this.isPhase1()){this.setPhase1Defaults(b)
}},setPhase1Defaults:function(a){a.allchoiceindex=1;
a.allchoicelabel="All Videos";
a.backgroundcolor="0x383838";
a.expandedheight=198;
a.expandedwidth=795;
a.expandercolor="0xBEBEBE";
a.expanderhovercolor="0xBEBEBE";
a.expanderselectedcolor="0x00CCFF";
a.framecolor="0x545759";
a.itembackgroundcolor="0x383838";
a.itemframecolor="0x131313";
a.itemshineselectedcolor="0x00CCFF";
a.mostpopularchoiceindex=2;
a.mostpopularchoicelabel="Most Popular";
a.textcolor="0xBEBEBE";
a.textframecolor="0x242424";
a.textframehovercolor="0xBEBEBE";
a.textframeselectedcolor="0x00CCFF";
a.texthovercolor="0xBEBEBE";
a.textselectedcolor="0x00CCFF"
}});
$pdk.shell.DefaultsCategoryModelImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsCategoryModelImpl.superclass.decorate.apply(this,arguments);
b.setWidth(1);
b.setHeight(1);
b.supportedMedia="actionscript";
this.configureRuntime(b,c);
b.setConfigureProcessor(function(d){if(typeof(d.feedpid)==="string"&&d.feedpid.length>0){d.setRuntime("flash");
d.setMedium("javascript")
}})
}});
$pdk.shell.DefaultsClipInfoImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(c,e,b){var a=c.getWidth(),d=c.getHeight();
if(typeof(a)!=="string"||a.length<1){c.setWidth("100%")
}if(typeof(d)!=="string"||d.length<1){c.setHeight("100%")
}$pdk.shell.DefaultsClipInfoImpl.superclass.decorate.apply(this,arguments);
c.supportedMedia="actionscript,javascript";
this.configureRuntime(c,e);
if(this.isPhase1()){this.setPhase1Defaults(c)
}},setPhase1Defaults:function(a){a.backgroundcolor="0xFFFFFF";
a.banneralignment="top";
a.bannerregions="";
a.descriptioncolor="0xF2F2F2";
a.framecolor="0xFFFFFF";
a.titlecolor="0xF2F2F2"
}});
$pdk.shell.DefaultsHeaderImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsHeaderImpl.superclass.decorate.apply(this,arguments);
b.backgroundcolor="0x383838";
b.framecolor="0x545759";
b.supportedMedia="actionscript";
this.configureRuntime(b,c)
}});
$pdk.shell.DefaultsNavigationImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsNavigationImpl.superclass.decorate.apply(this,arguments);
b.supportedMedia="actionscript,javascript";
this.configureRuntime(b,c);
if(this.isPhase1()){this.setPhase1Defaults(b)
}},setPhase1Defaults:function(a){a.backgroundcolor="0x131313";
a.framecolor="0x000000";
a.itembackgroundcolor="0x383838";
a.itemframecolor="0xFF0000";
a.itemshineselectedcolor="0xFF0000";
a.textbackgroundcolor="0x383838";
a.textcolor="0xDFDFDF";
a.textframecolor="0x383838";
a.texthighlighthovercolor="0x00CCFF";
a.texthighlightselectedcolor="0xFFFFFF";
a.texthovercolor="0xDFDFDF";
a.textselectedcolor="0xDFDFDF";
a.thumbnailbackgroundcolor="0x242424";
a.thumbnailframecolor="0x383838";
a.thumbnailhighlighthovercolor="0x00CCFF";
a.thumbnailhighlightselectedcolor="0xFFFFFF";
a.controlbackgroundcolor="0xFF0000";
a.controlcolor="0xF2F2F2";
a.controlframecolor="0xFF0000";
a.controlframehovercolor="0xFF0000";
a.controlframeselectedcolor="0xFF0000";
a.controlhovercolor="0xFFFFFF";
a.controlselectedcolor="0x00CCFF";
a.infocolor="0x1D1D1D";
a.itemsperpage=4;
a.fa.wmode="transparent";
a.fp.wmode="transparent"
}});
$pdk.shell.DefaultsNoOpImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){}});
$pdk.shell.DefaultsPlayerImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(j,g,b){$pdk.shell.DefaultsPlayerImpl.superclass.decorate.apply(this,arguments);
var c=document.getElementById(j.getId()),a,k=j.getWidth(),f=j.getHeight();
if(typeof(k)!=="string"||k.length<1){j.setWidth("100%")
}if(typeof(f)!=="string"||f.length<1){j.setHeight("100%")
}if(c===null){var e=document.getElementsByTagName("script");
var l=e[e.length-1];
var d=l.parentNode;
this._markupId=d.id;
c=d
}if(c.nodeName.toLowerCase()=="video"){a=c.getElementsByTagName("source");
if(a&&a.length&&a[0].src){j.releaseurl=a[0].src.split("?")[0]
}else{if(c.src){j.releaseurl=c.src.split("?")[0]
}}if(c.poster){j.previewimageurl=c.poster
}if(c.autoplay){j.autoplay=c.autoplay
}}if(!g.rssurl&&g.getModelUrls().rssurl){j.rssurl=g.getModelUrls().rssurl
}if(!this.isPhase1()){j.backgroundcolor="0x131313";
j.controlbackgroundcolor="0x131313";
j.controlcolor="0xF2F2F2";
j.controlframecolor="0xE0E0E0";
j.controlhovercolor="0xFFFFFF";
j.controlselectedcolor="0x00CCFF";
j.framecolor="0xE0E0E0";
j.loadprogresscolor="0x7C7C7C";
j.pagebackgroundcolor="0x131313";
j.playprogresscolor="0xE0E0E0";
j.scrubtrackcolor="0x131313";
j.scrubbercolor="0xF2F2F2";
j.scrubberframecolor="0xF2F2F2";
j.textbackgroundcolor="0x383838";
j.textcolor="0xF2F2F2"
}j.allowfullscreen=true;
j.fa.allowfullscreen="true";
j.fp.allowfullscreen="true";
j.fa.wmode="opaque";
j.fp.wmode="opaque";
j.supportedMedia="mpeg4,f4m,flv,m3u,ogg,webm,mpeg,qt,3gpp,ism,wm,3gpp2,aac,asx,avi,move,mp3";
j.releaseUrlFormatResolution=false;
this.configureRuntime(j,g);
g.setPlaybackFormat(j.getMedium());
g.setPlaybackRuntime(j.getRuntime())
}});
$pdk.shell.DefaultsReleaseListImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsReleaseListImpl.superclass.decorate.apply(this,arguments);
b.supportedMedia="actionscript,javascript";
this.configureRuntime(b,c);
if(this.isPhase1()){this.setPhase1Defaults(b)
}},setPhase1Defaults:function(a){a.allowscrolling="false";
a.animation="slideHorizontal";
a.backgroundcolor="0x131313";
a.columns=2;
a.framecolor="0x383838";
a.itembackgroundcolor="0x383838";
a.itemframecolor="0x383838";
a.itemshineselectedcolor="0x383838";
a.itemsperpage=4;
a.textbackgroundcolor="0x383838";
a.textcolor="0xDFDFDF";
a.textframecolor="0x383838";
a.texthighlighthovercolor="0x00CCFF";
a.texthighlightselectedcolor="0xFFFFFF";
a.texthovercolor="0xDFDFDF";
a.textselectedcolor="0xDFDFDF";
a.thumbnailbackgroundcolor="0x242424";
a.thumbnailframecolor="0x383838";
a.thumbnailheight=75;
a.thumbnailhighlighthovercolor="0x00CCFF";
a.thumbnailhighlightselectedcolor="0xFFFFFF";
a.thumbnailwidth=100;
a.showairdate=false;
a.showauthor=false;
a.showbitrate=false;
a.showdescription=true;
a.showformat=false;
a.showlength=true;
a.showthumbnail=true;
a.showtitle=true
}});
$pdk.shell.DefaultsReleaseModelImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsReleaseModelImpl.superclass.decorate.apply(this,arguments);
b.setWidth(1);
b.setHeight(1);
b.params=this._createParams(c);
b.supportedMedia="actionscript,javascript";
b._paramsOriginal=b.params;
this.configureRuntime(b,c);
b.setConfigureProcessor(function(d){if(typeof(d.feedpid)==="string"&&d.feedpid.length>0){d.setRuntime("flash");
d.setMedium("javascript")
}})
},_createParams:function(c){tpDebug("looking up best format for player","bootloader","$pdk.shell.DefaultsReleaseModelImpl",tpConsts.INFO);
var d=null,a=c.getMediaFactory().getBestRuntime("Player",c.getPreferredFormatsUnfiltered(),["mpeg4","f4m","flv","m3u","ogg","webm","mpeg","qt","3gpp","ism","wm","3gpp2","aac","asx","avi","move","mp3"]),b=c.getPlayerFormats(a.runtime);
if(b.length>0){tpDebug("using player formats: "+b.join(", "),"bootloader","$pdk.shell.DefaultsReleaseModelImpl",tpConsts.INFO);
d=b.join("|")
}else{b=c.getPreferredFormatsUnfiltered();
if(b.length>0){tpDebug("Release model could not find viable format for player. Choosing first preferred format from ("+b.join(", ")+")","bootloader","$pdk.shell.DefaultsReleaseModelImpl",tpConsts.INFO);
d=b[0]
}else{tpDebug("Could not find a preferred format. Release model will fetch all formats.","bootloader","$pdk.shell.DefaultsReleaseModelImpl",tpConsts.WARN)
}}return d===null?"":"byContent=byFormat%3D"+d
}});
$pdk.shell.DefaultsSearchImpl=$pdk.extend($pdk.shell.DefaultsAbstractImpl,{decorate:function(b,c,a){$pdk.shell.DefaultsSearchImpl.superclass.decorate.apply(this,arguments);
b.backgroundcolor="0x131313";
b.controlbackgroundcolor="0x242424";
b.controlcolor="0xBEBEBE";
b.controlframecolor="0x545759";
b.controlframehovercolor="0xBEBEBE";
b.controlframeselectedcolor="0x00CCFF";
b.controlhovercolor="0xBEBEBE";
b.controlselectedcolor="0x00CCFF";
b.editbackgroundcolor="0x131313";
b.editcolor="0xBEBEBE";
b.framecolor="0x545759";
b.labelcolor="0xBEBEBE";
b.searchhint="Search...";
b.searchlabel="Search";
b.supportedMedia="actionscript";
this.configureRuntime(b,c)
}});
$pdk.shell.Factory=$pdk.apply({},{generate:function(j,a,f){var e,d,k=j.length,g,h,c,b;
for(e=0;
e<k;
e++){d=j[e];
h=$pdk.shell.Factory.CLASS_TABLE[d.markupClass];
if(d.markupClass=="tpPlayer"){if($pdk.isEmpty(d.tpVars.releaseurl)){c=f.getModelUrls().releaseurl;
if(typeof(c)==="string"&&c.length>0){d.tpVars.releaseurl=c
}}}if(typeof(h)==="function"){g=a.getShells().get(d.markupId);
g=g===null||typeof(g)!=="object"?new h(d.markupId):g;
$pdk.apply(g,d.tpVars);
$pdk.apply(g.fp,d.tpFp);
$pdk.apply(g.fa,d.tpFa);
g.attach()
}}this._generateMissingModels(a,f)
},_generateMissingModels:function(a,g){var h=a.getShells().toArray(),k=[],e=0,c=0,d,b=h.length,f,j;
for(d=0;
d<b;
d++){f=h[d];
switch(f.getName()){case"ReleaseList":c++;
k.push(parseInt(f.itemsperpage,10));
break;
case"ReleaseModel":c--;
break;
case"CategoryList":e++;
break;
case"CategoryModel":e--;
break;
default:break
}}for(d=0;
d<c;
d++){f=this._buildModelShell(g,"releasemodel"+String(d),"tpReleaseModel",$pdk.shell.Factory.CLASS_TABLE.tpReleaseModel,[g.getModelUrls().releasemodel,g.getModelUrls().releasemodelbase],1,k[d])
}for(d=0;
d<e;
d++){f=this._buildModelShell(g,"categorymodel"+String(d),"tpCategoryModel",$pdk.shell.Factory.CLASS_TABLE.tpCategoryModel,[g.getModelUrls().categorymodel,g.getModelUrls().categorymodelbase])
}},_buildModelShell:function(h,c,f,j,k,d,e){var b=document.createElement("div"),g=new j(c,1,1),a;
b.id=c;
b.className=f;
b.setAttribute("style","position:absolute; top:0px; left:0px; width:1px; height:1px;");
document.body.insertBefore(b,document.body.childNodes[0]);
if($pdk.isArray(k)&&k.length>0){a=k[0];
if(typeof(a)==="string"&&a.length>0){g.feedsServiceUrl=a
}a=k[1];
if(typeof(a)==="string"&&a.length>0){g.feedsServiceUrlBase=a
}}if(d){g.startIndex=d
}if(e){g.endIndex=e
}g.attach();
return g
},getNamesFromDomElements:function(h){var q,r,v,k,c,u=h.length,t,p,w,g,x,d,e,l,o,j=[],f={},s={},m={},y,b;
for(t=0;
t<u;
t++){f={};
s={};
m={};
c=h[t];
e=c.attributes;
attributes_l=e.length;
for(w=0;
w<attributes_l;
w++){g=e[w];
d=g.nodeValue;
switch(g.name){case"class":q=d;
break;
case"id":o=d;
break;
default:if(g.name.match(/^tp:/)){x=g.name.replace(/^tp:/,"").toLowerCase();
b=x.match(/^fa\./)!==null?"fa":"var";
b=x.match(/^fp\./)!==null?"fp":b;
switch(b){case"fa":s[x.replace(/^fa\./,"")]=d;
break;
case"fp":m[x.replace(/^fp\./,"")]=d;
break;
case"var":f[x]=d;
break;
default:break
}}break
}}v=typeof(q)==="string"?q.split(" "):[];
k=v.length;
for(p=0;
p<k;
p++){r=v[p];
if(r.match(/^tp/)){j.push({markupClass:r,markupId:o,tpVars:$pdk.apply({},f),tpFp:$pdk.apply({},m),tpFa:$pdk.apply({},s)})
}}}return j
},CLASS_TABLE:{}});
$pdk.ns("$pdk.shell.Registry");
$pdk.shell.Registry._class=$pdk.extend(function(){},{constructor:function(){$pdk.shell.Registry._class.superclass.constructor.call(this);
this._collection=new $pdk.shell.Collection();
this._swfloader=null
},getShells:function(){return this._collection
},bind:function(a){this._swfloader=a
},add:function(a){this._collection.put(a.getId(),a)
},remove:function(a){this._collection.remove(a.getId())
},hasPlayer:function(){var a=this._collection.toArray();
var b=0;
len=a.length;
for(;
b<len;
b++){if(a[b].getName()==="Player"){return true
}}return false
},connectShellsToGwt:function(){var c,b,e=this._collection.toArray().sort(function(g,f){return g.getPriority()>f.getPriority()
}),d=e.length,a;
for(c=0;
c<d;
c++){b=e[c];
if(b.getRuntime()==="flash"){this._swfloader.add(b)
}else{b.resyncAttach()
}}this._swfloader.initializeShells()
},satisfyShellDeps:function(){var w,j,u,m=null,s,E,b,c,d,q,r,f,t,h,a,B,A=false,v,l=this._collection.toArray(),D={},C=l.length,o,k;
for(u=0;
u<C;
u++){v=l[u];
E=v.getName();
if($pdk.isEmpty(D[E])){D[E]=[]
}D[E].push(v)
}try{j=D.ReleaseModel.length;
if(j>0){w=D.Player.length;
for(u=0;
u<w;
u++){D.Player[u].releaseUrlFormatResolution=true
}}var p=D.ReleaseModel;
for(u=0;
u<p.length;
u++){if(p[u].params&&p[u]._paramsOriginal.indexOf("byContent")>=0&&p[u].params.indexOf("byContent")==-1){p[u].params+="&"+p[u]._paramsOriginal;
console.log("Merged Shell and DOM params: "+p[u].params)
}}}catch(g){}try{B=D.ReleaseList.length;
r=D.Navigation.length;
for(u=0;
u<r;
u++){b=D.Navigation[u];
m=b.itemsPerPage;
m=$pdk.isEmpty(m)?null:m;
m=m===null?b.itemsperpage:m;
m=$pdk.isEmpty(m)?null:m;
if(m===null){delete b.itemsPerPage;
d=typeof(b.scopes)==="string"?b.scopes.split(","):[];
q=d.length;
for(s=0;
s<B&&m===null;
s++){f=D.ReleaseList[s];
h=typeof(f.scopes)==="string"?f.scopes.split(","):[];
a=h.length;
if(q<1&&a<1){A=true
}else{A=false;
for(k=0;
k<q&&A===false;
k++){c=d[k];
for(o=0;
o<a&&A===false;
o++){t=h[o];
A=c===t
}}}if(A){m=f.itemsPerPage;
m=$pdk.isEmpty(m)?null:m;
m=m===null?f.itemsperpage:m;
m=$pdk.isEmpty(m)?null:m
}}if(m!==null){b.itemsperpage=m
}}}}catch(y){}}});
$pdk.shell.Registry._singleton=null;
$pdk.shell.Registry.getInstance=function(){if($pdk.shell.Registry._singleton===null){$pdk.shell.Registry._singleton=new $pdk.shell.Registry._class()
}return $pdk.shell.Registry._singleton
};
$pdk.shell.SwfSerializedLoader=$pdk.extend(function(){},{constructor:function(){this._shells_unattached=[];
this._shells_unattached_batched={};
this._batch_index=[];
this._expected_responses=0;
this._timeouts=[]
},add:function(a){this._shells_unattached.push(a)
},initializeShells:function(){while(this._shells_unattached.length>0){this._batch(this._shells_unattached.shift())
}this._processNextBatch()
},onSwfReady:function(){this._expected_responses--;
if(this._expected_responses<1){this._processNextBatch()
}},_processNextBatch:function(){var d=this._batch_index.shift(),c=this._shells_unattached_batched[d],a=0,b=this;
while(this._timeouts.length){window.clearTimeout(this._timeouts.shift())
}if(!$pdk.isEmpty(c)){while(c.length){shell=c.shift();
shell.resyncAttach();
a++
}}this._expected_responses=a;
if(this._expected_responses>0){this._timeouts.push(window.setTimeout(function(){b._onTimeout(d)
},5000))
}},_onTimeout:function(a){this._expected_responses=0;
this._processNextBatch()
},_batch:function(a){var b=String(a.getPriority());
if($pdk.isEmpty(this._shells_unattached_batched[b])){this._shells_unattached_batched[b]=[];
this._batch_index.push(b)
}this._shells_unattached_batched[b].push(a)
}});
$pdk.ns("$pdk.util");
$pdk.util.ArraySet=$pdk.extend(function(){},{constructor:function(){this._members=[]
},add:function(a){var b=!this.contains(a);
if(b){this._members.push(a)
}return b
},remove:function(b){var c=this._find(b),a=false;
if(c>-1){a=delete this._members[c]
}return a
},contains:function(a){return this._find(a)>-1
},toArray:function(){return this._members
},_find:function(c){var b=0,a=this._members.length,d=-1;
for(;
b<a&&d<0;
b++){d=c===this._members[b]?b:-1
}return d
}});
$pdk.bootloaderVersion=new $pdk.PdkVersion("4","5","0","252520","2012-03-01 1:59 PM");
function tpExternalControllerClass(){this.playerTypes=new Object();
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
}function tpExternalMessage(b,d,c,e,a){window.tpExternalController.routeMessage(b,d,c,e,a)
}window.tpExternalController=new tpExternalControllerClass();
function tpShowAlert(a){switch(a){case"FULLSCREEN_DISABLED":alert("Full screen is only available with Flash 9 or later");
break
}}tpScriptLoader=new ScriptLoader();
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
if(b){var a=function(k,j){j(k);
this.onreadystatechange=null;
this.onload=null;
this.onerror=null
};
d.onreadystatechange=function(){a(h,callbackDispatcher)
};
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
var b=false;
if(c){var a=function(j,k){j(k);
this.onreadystatechange=null;
this.onload=null;
this.onerror=null
};
e.onreadystatechange=function(){if((this.readyState==="loaded"||this.readyState==="complete"||this.readyState===4)&&!b){a(c,f);
b=true
}};
e.onload=function(){if(!b){b=true;
a(c,f)
}};
e.onerror=function(){if(!b){a(c,f)
}}
}window.document.getElementsByTagName("head")[0].appendChild(e)
}function tpGetScriptPath(){return $pdk.env.Detect.getInstance().baseDir()
}function tpSetCssClass(a,b){try{var f=document.getElementById(a),c=f.className;
c=typeof(c)==="string"?c:"";
if(c.match(new RegExp(b))===null){f.className=b+" "+c
}}catch(d){}}function tpUnsetCssClass(a,c){try{var g=document.getElementById(a),d=g.className,b=new RegExp(c+" ");
d=typeof(d)==="string"?d:"";
g.className=d.replace(b,"","g")
}catch(f){}}function tpResize(b,a,c){}function tpGetTop(a){result=0;
while(a){result+=a.offsetTop;
a=a.offsetParent
}return result
}function tpGetLeft(a){result=0;
while(a){result+=a.offsetLeft;
a=a.offsetParent
}return result
}tpThisJsObject=function(a){return window[a]
};
var tpRegisteredGWTWidgets={};
tpThisMovie=function(b){if(b=="communicationwidget"||window.tpRegisteredGWTWidgets&&tpRegisteredGWTWidgets[b]!=undefined){var c=tpThisJsObject("tpGwtCommManager");
if(c){return c
}}var a;
if(window.frame&&(window.frame.hasOwnProperty("contentWindow")||window.frame.hasOwnProperty("contentDocument"))){a=frame.contentWindow.document||frame.contentDocument.document
}else{a=document
}return a.getElementById(b)
};
function tpDebug(c,b,a,d){if(!b){b="javascript"
}if(!a){a="utils"
}if(!d){d=tpConsts.INFO
}else{if(typeof d=="string"){d=tpGetLevelNumber(d)
}}if(d<tpGetLevelNumber(tpGetLogLevel())){return
}if(tpController!==undefined){tpController.dispatchEvent("OnPdkTrace",{message:c,timestamp:(new Date().valueOf()),controllerId:b,className:a,level:d})
}else{tpTrace(c,(new Date()).valueOf(),b,a,d)
}}function tpOpenNewWindow(d,b,a){var c=window.open(d,b,a)
}var tpTrackingImage=new Image();
function tpCallTrackingUrl(a){a=unescape(a);
tpTrackingImage.src=a;
for(i=0;
((!tpTrackingImage.complete)&&(i<100000));
i++){}}var tpConsts={};
tpConsts.NONE=2000;
tpConsts.FATAL=1000;
tpConsts.ERROR=8;
tpConsts.WARN=6;
tpConsts.INFO=4;
tpConsts.DEBUG=2;
tpConsts.TEST=1;
function tpGetLevel(a){switch(a){case tpConsts.DEBUG:return"DEBUG";
case tpConsts.INFO:return"INFO";
case tpConsts.WARN:return"WARN";
case tpConsts.ERROR:return"ERROR";
case tpConsts.FATAL:return"FATAL";
case tpConsts.TEST:return"TEST";
case tpConsts.NONE:return"NONE"
}return"UNKNOWN"
}function tpGetLevelNumber(a){switch(a.toUpperCase()){case"DEBUG":return tpConsts.DEBUG;
case"INFO":return tpConsts.INFO;
case"WARN":return tpConsts.WARN;
case"ERROR":return tpConsts.ERROR;
case"FATAL":return tpConsts.FATAL;
case"TEST":return tpConsts.TEST;
case"NONE":return tpConsts.NONE
}return 4
}function tpTrace(c,e,d,g,a){if(typeof(window.console)!=="object"){return
}var f=new Date(Number(e));
var b=f.getMilliseconds();
if(b.toString().length==2){b="0"+b
}else{if(b.toString().length==1){b="00"+b
}}var h=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds()+"."+b;
var j=h+" \t"+tpGetLevel(Number(a))+" \t"+d+" \t";
if(g&&g.length){j+=g+" :: "
}j+=c;
switch(Number(a)){case tpConsts.DEBUG:console.log(j);
break;
case tpConsts.INFO:console.info(j);
break;
case tpConsts.WARN:console.warn(j);
break;
case tpConsts.ERROR:case tpConsts.FATAL:console.error(j);
break
}}function tpGetUseJS(){return"true"
}function tpGetCommManagerID(){return tpCommID
}if(!self.tpLogLevel){tpLogLevel="warn"
}function tpSetLogLevel(a){tpLogLevel=a
}function tpGetLogLevel(){return tpLogLevel
}function tpGetProperties(){var a=new Object();
a.commManagerId=tpGetCommManagerID();
a.useJS=tpGetUseJS();
a.registeredComponents=tpGetRegisteredIDs();
a.logLevel=tpGetLogLevel();
return a
}var tpRegisteredIDArr;
function tpRegisterID(b){if(!tpRegisteredIDArr){tpRegisteredIDArr=[]
}for(var a=0;
a<tpRegisteredIDArr.length;
a++){if(tpRegisteredIDArr[a]==b){return
}}tpRegisteredIDArr.push(b)
}function tpGetRegisteredIDs(){return tpRegisteredIDArr
}var tpController;
var tpCommID;
var tpBridgeID;
var tpExternalController;
var tpGwtCommManager;
var useWorkerIfPossible=false;
var gwtWorker;
function tpDoInitGwtCommManager(){try{if(tpCommID=="communicationwidget"&&window.tpGwtCommManager===undefined){tpGwtCommManager=new com.theplatform.pdk.CommManager()
}else{if((window.tryWorker===undefined||!tryWorker)&&window.tpGwtCommManager===undefined){tpGwtCommManager=new com.theplatform.pdk.CommManager(tpCommID)
}}}catch(a){if(window.console!=undefined){console.error("GwtCommManager module failed to load 1!")
}else{}}}function tpInitGwtCommManager(b,a){try{if(useWorkerIfPossible&&Worker!=undefined){gwtWorker=new Worker("js/commManagerWorker.js");
tpGwtCommManager=new Object();
tpGwtCommManager.executeMessage=function(d){gwtWorker.postMessage(d)
};
gwtWorker.onmessage=function(d){console.log(d.data);
if(d.data.destination){tpReceiveMessage(d.data.destination,d.data.message)
}};
gwtWorker.onerror=function(d){if(self.console){console.error(d.message)
}}
}else{tpGwtCommManager=new com.theplatform.pdk.CommManager(tpCommID)
}}catch(c){if(a==true){if(console!=undefined){console.error("GwtCommManager module failed to load! 2")
}else{}}}}function tpSetCommManagerID(c,e,d,a,b){if(b){useWorkerIfPossible=true
}if(c&&e){tpInitGwtCommManager(c)
}tpCommID=c;
tpBridgeID=c?c:"unknown";
if(window.tpTraceListener===undefined){window.tpTraceListener=function(g){var f=g.data;
if(f){tpTrace(f.message,f.timestamp,f.controllerId,f.className,f.level)
}};
tpController.addEventListener("OnPdkTrace",window.tpTraceListener)
}}function tpReceiveMessage(a,b){tpController.receiveMessage(a,b)
}function tpGetPreferredFormats(){if($pdk!==undefined){return $pdk.env.Detect.getInstance().getPreferredFormats()
}else{return[]
}}function tpGetPlayerFormats(){if($pdk!==undefined){var a=$pdk.env.Detect.getInstance().getPlayerFormats(),b="";
if($pdk.isArray(a)){b=a.join("|")
}return b
}else{return[]
}}var tpHolderName="pdkHolder";
var tpExternalJS;
function tpSetPlayerIDForExternal(a){}function tpSetHolderIDForExternal(a){tpHolderName=a
}function tpSetPdkBaseDirectory(a){}function tpLoadExternalMediaJS(){tpExternalJS=tpLoadExternalMediaJS.arguments;
for(var a=0;
a<tpExternalJS.length;
a++){tpLoadScript(tpExternalJS[a])
}}function tpCleanupExternal(){if(tpExternalJS){var a=window.document.getElementsByTagName("head")[0].getElementsByTagName("script");
for(var c=0;
c<a.length;
c++){for(var b=0;
b<tpExternalJS.length;
b++){if(a[c].src==tpExternalJS[b]){window.document.getElementsByTagName("head")[0].removeChild(a[c]);
break
}}}tpExternalJS.length=0
}if(tpExternalController){tpExternalController.cleanup()
}}$pdk.ns("$pdk.interfaces");
$pdk.interfaces.expose=function(b,a){b.Header=$pdk.extend($pdk.shell.Base,{_name:"Header",_markupClass:"tpHeader",_runtime:"default",_jsViewImpl:"",_markupClass:"tpHeader",_priority:2147483647,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsHeaderImpl(),_asSwf:"header.swf"});
b.Search=$pdk.extend($pdk.shell.Base,{_name:"Search",_markupClass:"tpSearch",_runtime:"default",_jsViewImpl:"",_markupClass:"tpSearch",_priority:2147483647,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsSearchImpl(),_asSwf:"search.swf"});
b.CategoryList=$pdk.extend($pdk.shell.Base,{_name:"CategoryList",_markupClass:"tpCategoryList",_runtime:"default",_jsViewImpl:"",_markupClass:"tpCategoryList",_priority:30,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsCategoryListImpl(),_asSwf:"categoryList.swf"});
b.CategoryModel=$pdk.extend($pdk.shell.Base,{_name:"CategoryModel",_markupClass:"tpCategoryModel",_runtime:"default",_jsViewImpl:"",_markupClass:"tpCategoryModel",_priority:30,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsCategoryModelImpl(),_asSwf:"categoryModel.swf"});
b.ClipInfo=$pdk.extend($pdk.shell.Base,{_name:"ClipInfo",_markupClass:"tpClipInfo",_runtime:"default",_jsViewImpl:"@Bundle:tpClipInfoView.js",_markupClass:"tpClipInfo",_priority:20,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsClipInfoImpl(),_asSwf:"info.swf"});
b.Player=$pdk.extend($pdk.shell.Base,{_name:"Player",_markupClass:"tpPlayer",_runtime:"default",_jsViewImpl:"@Bundle:tpPlayerView.js",_markupClass:"tpPlayer",_priority:10,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsPlayerImpl(),_asSwf:"flvPlayer.swf"});
b.Navigation=$pdk.extend($pdk.shell.Base,{_name:"Navigation",_markupClass:"tpNavigation",_runtime:"default",_jsViewImpl:"@Bundle:tpNavigationView.js",_markupClass:"tpNavigation",_priority:2147483647,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsNavigationImpl(),_asSwf:"nav.swf"});
b.ReleaseList=$pdk.extend($pdk.shell.Base,{_name:"ReleaseList",_markupClass:"tpReleaseList",_runtime:"default",_jsViewImpl:"@Bundle:tpReleaseListView.js",_markupClass:"tpReleaseList",_priority:40,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsReleaseListImpl(),_asSwf:"releaseList.swf"});
b.ReleaseModel=$pdk.extend($pdk.shell.Base,{_name:"ReleaseModel",_markupClass:"tpReleaseModel",_runtime:"default",_jsViewImpl:"@Bundle:tpReleaseModel.js",_markupClass:"tpReleaseModel",_priority:5,_env:$pdk.env.Detect.getInstance(),_registry:$pdk.shell.Registry.getInstance(),_config_decorator:new $pdk.shell.DefaultsReleaseModelImpl(),_asSwf:"releaseModel.swf"});
$pdk.shell.Factory.CLASS_TABLE={tpHeader:b.Header,tpSearch:b.Search,tpCategoryList:b.CategoryList,tpCategoryModel:b.CategoryModel,tpClipInfo:b.ClipInfo,tpPlayer:b.Player,tpNavigation:b.Navigation,tpReleaseList:b.ReleaseList,tpReleaseModel:b.ReleaseModel};
a.getValidRegions=function(c){this._regFunc("getValidRegions",[],[],c)
};
a.getDefaultBanners=function(c){this._regFunc("getDefaultBanners",[],[],c)
};
a.getBandwidthPreferences=function(c){this._regFunc("getBandwidthPreferences",[],[],c)
};
a.setVariable=function(f,d,g,c,e){this._regFunc("setVariable",["java.lang.String","java.lang.String","java.lang.String","java.lang.String"],[f,d,g,c],e)
};
a.clearAdCookie=function(c){this._regFunc("clearAdCookie",[],[],c)
};
a.previewNextRefreshReleaseModel=function(c){this._regFunc("previewNextRefreshReleaseModel",[],[],c)
};
a.clickPlayButton=function(c){this._regFunc("clickPlayButton",[],[],c)
};
a.getNextClip=function(c){this._regFunc("getNextClip",[],[],c)
};
a.refreshReleaseModel=function(c,l,e,f,d,j,k,g,h){this._regFunc("refreshReleaseModel",["java.lang.String","java.lang.String","com.theplatform.pdk.data.Sort","com.theplatform.pdk.data.Range","java.lang.String[]","java.lang.String[]","java.lang.String[]","java.lang.String"],[c,l,e,f,d,j,g,h],k)
};
a.seekToPercentage=function(d,c){this._regFunc("seekToPercentage",["java.lang.Number"],[d],c)
};
a.useDefaultPlayOverlay=function(c,d){this._regFunc("useDefaultPlayOverlay",["java.lang.Boolean"],[c],d)
};
a.loadReleaseURL=function(c,d,e){this._regFunc("loadReleaseURL",["java.lang.String","java.lang.Boolean"],[c,d],e)
};
a.showEmailForm=function(d,c){this._regFunc("showEmailForm",["java.lang.Boolean"],[d],c)
};
a.loadRelease=function(c,d,e){this._regFunc("loadRelease",["com.theplatform.pdk.data.Release","java.lang.Boolean"],[c,d],e)
};
a.cancelMedia=function(c,d){this._regFunc("cancelMedia",["java.lang.Object"],[c],d)
};
a.disablePlayerControls=function(c,d,e){this._regFunc("disablePlayerControls",["java.lang.Boolean","java.lang.String[]"],[c,d],e)
};
a.setClipInfo=function(d,e,c){this._regFunc("setClipInfo",["com.theplatform.pdk.data.Clip","java.lang.Boolean"],[d,e],c)
};
a.playPrevious=function(d,c){this._regFunc("playPrevious",["java.lang.Boolean"],[d],c)
};
a.setProperty=function(f,d,g,c,e){this._regFunc("setProperty",["java.lang.String","java.lang.String","java.lang.String","java.lang.String"],[f,d,g,c],e)
};
a.setVolume=function(d,c){this._regFunc("setVolume",["java.lang.Number"],[d],c)
};
a.getPlayerVariables=function(d,c){this._regFunc("getPlayerVariables",["java.lang.String[]"],[d],c)
};
a.setRelease=function(c,d,e){this._regFunc("setRelease",["com.theplatform.pdk.data.Release","java.lang.Boolean"],[c,d],e)
};
a.addAnnotation=function(c,d){this._regFunc("addAnnotation",["com.theplatform.pdk.data.Annotation"],[c],d)
};
a.getSubtitleLanguage=function(c,d){this._regFunc("getSubtitleLanguage",["java.lang.String"],[c],d)
};
a.setExpandVideo=function(d,c){this._regFunc("setExpandVideo",["java.lang.String"],[d],c)
};
a.trace=function(e,d,f,c){this._regFunc("trace",["java.lang.String","java.lang.String","java.lang.Number"],[e,d,f],c)
};
a.nextClip=function(c){this._regFunc("nextClip",[],[],c)
};
a.mute=function(d,c){this._regFunc("mute",["java.lang.Boolean"],[d],c)
};
a.setSmil=function(c,d){this._regFunc("setSmil",["java.lang.String"],[c],d)
};
a.removeAnnotation=function(c,d){this._regFunc("removeAnnotation",["com.theplatform.pdk.data.Annotation"],[c],d)
};
a.setPlayerMessage=function(e,c,d){this._regFunc("setPlayerMessage",["java.lang.String","java.lang.Number"],[e,c],d)
};
a.clearCategorySelection=function(c){this._regFunc("clearCategorySelection",[],[],c)
};
a.refreshCategoryModel=function(d,c,e){this._regFunc("refreshCategoryModel",["java.lang.String","java.lang.String"],[d,e],c)
};
a.setSubtitleLanguage=function(d,c){this._regFunc("setSubtitleLanguage",["java.lang.String"],[d],c)
};
a.setPreviewImageUrl=function(c,d){this._regFunc("setPreviewImageUrl",["java.lang.String"],[c],d)
};
a.setToken=function(c,e,d){this._regFunc("setToken",["java.lang.String","java.lang.String"],[c,e],d)
};
a.seekToPosition=function(c,d){this._regFunc("seekToPosition",["java.lang.Number"],[c],d)
};
a.clearPlayerMessage=function(c){this._regFunc("clearPlayerMessage",[],[],c)
};
a.getAnnotations=function(c){this._regFunc("getAnnotations",[],[],c)
};
a.getCurrentRange=function(c){this._regFunc("getCurrentRange",[],[],c)
};
a.suspendPlayAll=function(d,c){this._regFunc("suspendPlayAll",["java.lang.Boolean"],[d],c)
};
a.setShowSubtitles=function(c,d){this._regFunc("setShowSubtitles",["java.lang.Boolean"],[c],d)
};
a.resetPlayer=function(c){this._regFunc("resetPlayer",[],[],c)
};
a.playNext=function(e,c,d){this._regFunc("playNext",["java.lang.Boolean","java.lang.Boolean"],[e,c],d)
};
a.showPlayerCard=function(d,g,h,c,f,e){this._regFunc("showPlayerCard",["java.lang.String","java.lang.String","java.lang.String","java.lang.String","java.lang.String"],[d,g,h,c,f],e)
};
a.clearAnnotations=function(c){this._regFunc("clearAnnotations",[],[],c)
};
a.useDefaultEmailForm=function(c,d){this._regFunc("useDefaultEmailForm",["java.lang.Boolean"],[c],d)
};
a.hidePlayerCard=function(c,e,d){this._regFunc("hidePlayerCard",["java.lang.String","java.lang.String"],[c,e],d)
};
a.getNextRelease=function(e,c,d){this._regFunc("getNextRelease",["java.lang.Boolean","java.lang.Boolean"],[e,c],d)
};
a.previousClip=function(c){this._regFunc("previousClip",[],[],c)
};
a.useDefaultLinkForm=function(c,d){this._regFunc("useDefaultLinkForm",["java.lang.Boolean"],[c],d)
};
a.setBandwidthPreferences=function(d,c){this._regFunc("setBandwidthPreferences",["com.theplatform.pdk.data.BandwidthPreferences"],[d],c)
};
a.setCurrentReleaseList=function(d,c){this._regFunc("setCurrentReleaseList",["java.lang.String"],[d],c)
};
a.showFullScreen=function(c,d){this._regFunc("showFullScreen",["java.lang.Boolean"],[c],d)
};
a.loadSmil=function(d,c,e){this._regFunc("loadSmil",["java.lang.String","java.lang.Boolean"],[d,c],e)
};
a.previewRefreshReleaseModel=function(c,l,e,f,d,j,k,g,h){this._regFunc("previewRefreshReleaseModel",["java.lang.String","java.lang.String","com.theplatform.pdk.data.Sort","com.theplatform.pdk.data.Range","java.lang.String[]","java.lang.String[]","java.lang.String[]","java.lang.String"],[c,l,e,f,d,j,g,h],k)
};
a.hidePlayerRegions=function(d,c,e){this._regFunc("hidePlayerRegions",["java.lang.Boolean","java.lang.String[]"],[d,c],e)
};
a.setVideoScalingMethod=function(d,c){this._regFunc("setVideoScalingMethod",["java.lang.String"],[d],c)
};
a.showLinkForm=function(d,c){this._regFunc("showLinkForm",["java.lang.Boolean"],[d],c)
};
a.pause=function(c,d,e){this._regFunc("pause",["java.lang.Boolean","java.lang.Boolean"],[c,e],d)
};
a.setReleaseURL=function(d,c,e){this._regFunc("setReleaseURL",["java.lang.String","java.lang.Boolean"],[d,c],e)
};
a.getUseDefaultPlayOverlay=function(c){this._regFunc("getUseDefaultPlayOverlay",[],[],c)
};
a.nextRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this._regFunc("nextRange",["boolean"],[d],c)
};
a.getCurrentRange=function(c){this._regFunc("getCurrentRange",[],[],c)
};
a.firstRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this._regFunc("firstRange",["boolean"],[d],c)
};
a.previousRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this._regFunc("previousRange",["boolean"],[d],c)
};
a.setClipInfo=function(d,e,c){this._regFunc("setClipInfo",["com.theplatform.pdk.data.Clip","boolean"],[d,e],c)
}
};
(function(g,d){var c,b,e,h,a,f,j;
if(typeof(window.__tp_pdk_set_versions)==="function"){window.__tp_pdk_set_versions();
if(typeof(window.console)==="object"){console.log("thePlatform PDK");
console.log($pdk.version.toString())
}}d=typeof(d)==="boolean"?d:false;
if(!d){e=$pdk.env.Detect.getInstance();
h=new $pdk.env.HttpHead.Processor(e);
h.process(document);
if(typeof(e.baseDir())!=="string"||e.baseDir().length<1){alert("No PDK base URL could be detected. Asynchronous load of PDK requies a tp:baseUrl meta tag.")
}if($pdk.isIE){document.createElement("video")
}window.tpCommID="communicationwidget";
window.tpBridgeID=typeof(window.tpCommID)==="string"?window.tpCommID:"unknown";
b=$pdk.Entrypoint.getInstance();
a=$pdk.shell.Registry.getInstance();
f=new $pdk.shell.SwfSerializedLoader();
a.bind(f);
g.tpController=new $pdk.queue.Controller(e);
$pdk.interfaces.expose(g,g.tpController);
for(c in $pdk.shell.Factory.CLASS_TABLE){document.write(['<style id="',c,'Loading" ',"> .",c,c==="tpPlayer"?" ":" > * ","{ display: none !important; }</style>"].join(""))
}if(window.tpTraceListener===undefined){window.tpTraceListener=function(l){var k=l.data;
if(k){tpTrace(k.message,k.timestamp,k.controllerId,k.className,k.level)
}};
tpController.addEventListener("OnPdkTrace",window.tpTraceListener)
}g.tpController.onControllerComplete=function(){f.onSwfReady()
};
b.bind(a,e);
$pdk.controller=g.tpController;
$pdk.initialize=function(){b.initialize()
};
$pdk.gwtBootloader(e)
}}(window,window._PDK_SUPRESS_AUTOINIT));