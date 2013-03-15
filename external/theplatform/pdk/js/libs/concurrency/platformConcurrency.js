function com_theplatform_concurrency_api_client(){
  var $wnd_0 = window, $doc_0 = document, $stats = $wnd_0.__gwtStatsEvent?function(a){
    return $wnd_0.__gwtStatsEvent(a);
  }
  :null, $sessionId_0 = $wnd_0.__gwtStatsSessionId?$wnd_0.__gwtStatsSessionId:null, gwtOnLoad, bodyDone, base = '', metaProps = {}, values = [], providers = [], answers = [], softPermutationId = 0, onLoadErrorFunc, propertyErrorFunc;
  $stats && $stats({moduleName:'platformConcurrency', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'begin'});
  if (!$wnd_0.__gwt_stylesLoaded) {
    $wnd_0.__gwt_stylesLoaded = {};
  }
  if (!$wnd_0.__gwt_scriptsLoaded) {
    $wnd_0.__gwt_scriptsLoaded = {};
  }
  function isHostedMode(){
    var result = false;
    try {
      var query = $wnd_0.location.search;
      return (query.indexOf('gwt.codesvr=') != -1 || (query.indexOf('gwt.hosted=') != -1 || $wnd_0.external && $wnd_0.external.gwtOnLoad)) && query.indexOf('gwt.hybrid') == -1;
    }
     catch (e) {
    }
    isHostedMode = function(){
      return result;
    }
    ;
    return result;
  }

  function maybeStartModule(){
    if (gwtOnLoad && bodyDone) {
      gwtOnLoad(onLoadErrorFunc, 'platformConcurrency', base, softPermutationId);
      $stats && $stats({moduleName:'platformConcurrency', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'end'});
    }
  }

  function computeScriptBase(){
    function getDirectoryOfFile(path){
      var hashIndex = path.lastIndexOf('#');
      if (hashIndex == -1) {
        hashIndex = path.length;
      }
      var queryIndex = path.indexOf('?');
      if (queryIndex == -1) {
        queryIndex = path.length;
      }
      var slashIndex = path.lastIndexOf('/', Math.min(queryIndex, hashIndex));
      return slashIndex >= 0?path.substring(0, slashIndex + 1):'';
    }

    function ensureAbsoluteUrl(url){
      if (url.match(/^\w+:\/\//)) {
      }
       else {
        var img = $doc_0.createElement('img');
        img.src = url + 'clear.cache.gif';
        url = getDirectoryOfFile(img.src);
      }
      return url;
    }

    function tryMetaTag(){
      var metaVal = __gwt_getMetaProperty('baseUrl');
      if (metaVal != null) {
        return metaVal;
      }
      return '';
    }

    function tryNocacheJsTag(){
      var scriptTags = $doc_0.getElementsByTagName('script');
      for (var i = 0; i < scriptTags.length; ++i) {
        if (scriptTags[i].src.indexOf('platformConcurrency.js') != -1) {
          return getDirectoryOfFile(scriptTags[i].src);
        }
      }
      return '';
    }

    function tryMarkerScript(){
      var thisScript;
      if (typeof isBodyLoaded == 'undefined' || !isBodyLoaded()) {
        var markerId = '__gwt_marker_platformConcurrency';
        var markerScript;
        $doc_0.write('<script id="' + markerId + '"><\/script>');
        markerScript = $doc_0.getElementById(markerId);
        thisScript = markerScript && markerScript.previousSibling;
        while (thisScript && thisScript.tagName != 'SCRIPT') {
          thisScript = thisScript.previousSibling;
        }
        if (markerScript) {
          markerScript.parentNode.removeChild(markerScript);
        }
        if (thisScript && thisScript.src) {
          return getDirectoryOfFile(thisScript.src);
        }
      }
      return '';
    }

    function tryBaseTag(){
      var baseElements = $doc_0.getElementsByTagName('base');
      if (baseElements.length > 0) {
        return baseElements[baseElements.length - 1].href;
      }
      return '';
    }

    var tempBase = tryMetaTag();
    if (tempBase == '') {
      tempBase = tryNocacheJsTag();
    }
    if (tempBase == '') {
      tempBase = tryMarkerScript();
    }
    if (tempBase == '') {
      tempBase = tryBaseTag();
    }
    if (tempBase == '') {
      tempBase = getDirectoryOfFile($doc_0.location.href);
    }
    tempBase = ensureAbsoluteUrl(tempBase);
    base = tempBase;
    return tempBase;
  }

  function processMetas(){
    var metas = document.getElementsByTagName('meta');
    for (var i = 0, n = metas.length; i < n; ++i) {
      var meta = metas[i], name_0 = meta.getAttribute('name'), content_0;
      if (name_0) {
        name_0 = name_0.replace('platformConcurrency::', '');
        if (name_0.indexOf('::') >= 0) {
          continue;
        }
        if (name_0 == 'gwt:property') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            var value, eq = content_0.indexOf('=');
            if (eq >= 0) {
              name_0 = content_0.substring(0, eq);
              value = content_0.substring(eq + 1);
            }
             else {
              name_0 = content_0;
              value = '';
            }
            metaProps[name_0] = value;
          }
        }
         else if (name_0 == 'gwt:onPropertyErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              propertyErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onPropertyErrorFn"');
            }
          }
        }
         else if (name_0 == 'gwt:onLoadErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              onLoadErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onLoadErrorFn"');
            }
          }
        }
      }
    }
  }

  function __gwt_getMetaProperty(name_0){
    var value = metaProps[name_0];
    return value == null?null:value;
  }

  function unflattenKeylistIntoAnswers(propValArray, value){
    var answer = answers;
    for (var i = 0, n = propValArray.length - 1; i < n; ++i) {
      answer = answer[propValArray[i]] || (answer[propValArray[i]] = []);
    }
    answer[propValArray[n]] = value;
  }

  function computePropValue(propName){
    var value = providers[propName](), allowedValuesMap = values[propName];
    if (value in allowedValuesMap) {
      return value;
    }
    var allowedValuesList = [];
    for (var k in allowedValuesMap) {
      allowedValuesList[allowedValuesMap[k]] = k;
    }
    if (propertyErrorFunc) {
      propertyErrorFunc(propName, allowedValuesList, value);
    }
    throw null;
  }

  providers['user.agent'] = function(){
    var ua = navigator.userAgent.toLowerCase();
    var makeVersion = function(result){
      return parseInt(result[1]) * 1000 + parseInt(result[2]);
    }
    ;
    if (function(){
      return ua.indexOf('opera') != -1;
    }
    ())
      return 'opera';
    if (function(){
      return ua.indexOf('webkit') != -1;
    }
    ())
      return 'safari';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 9;
    }
    ())
      return 'ie9';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 8;
    }
    ())
      return 'ie8';
    if (function(){
      var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
      if (result && result.length == 3)
        return makeVersion(result) >= 6000;
    }
    ())
      return 'ie6';
    if (function(){
      return ua.indexOf('gecko') != -1;
    }
    ())
      return 'gecko1_8';
    return 'unknown';
  }
  ;
  values['user.agent'] = {gecko1_8:0, ie6:1, ie8:2, ie9:3, opera:4, safari:5};
  com_theplatform_concurrency_api_client.onScriptLoad = function(gwtOnLoadFunc){
    com_theplatform_concurrency_api_client.onScriptLoad = null;
    gwtOnLoad = gwtOnLoadFunc;
    maybeStartModule();
  }
  ;
  if (isHostedMode()) {
    alert('Cross-site hosted mode not yet implemented. See issue ' + 'http://code.google.com/p/google-web-toolkit/issues/detail?id=2079');
    return;
  }
  processMetas();
  computeScriptBase();
  $stats && $stats({moduleName:'platformConcurrency', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'selectingPermutation'});
  var strongName;
  try {
    unflattenKeylistIntoAnswers(['opera'], '0CFD06EAD3277C996833043E10F023F0');
    unflattenKeylistIntoAnswers(['ie9'], '1E5E6BBC76DF176DDF5FEC9C4272A706');
    unflattenKeylistIntoAnswers(['safari'], '2CF2B70E11C8FC66DC8911DEFAA6DC03');
    unflattenKeylistIntoAnswers(['gecko1_8'], 'AF48C90C0701A9D707E5E246655CC32F');
    unflattenKeylistIntoAnswers(['ie8'], 'DD8A640F9615FF0BD47D8B204645FC76');
    unflattenKeylistIntoAnswers(['ie6'], 'F591BB670AD908675A1F034DD4EE95E7');
    strongName = answers[computePropValue('user.agent')];
    var idx = strongName.indexOf(':');
    if (idx != -1) {
      softPermutationId = Number(strongName.substring(idx + 1));
      strongName = strongName.substring(0, idx);
    }
  }
   catch (e) {
    return;
  }
  var onBodyDoneTimerId;
  function onBodyDone(){
    if (!bodyDone) {
      bodyDone = true;
      maybeStartModule();
      if ($doc_0.removeEventListener) {
        $doc_0.removeEventListener('DOMContentLoaded', onBodyDone, false);
      }
      if (onBodyDoneTimerId) {
        clearInterval(onBodyDoneTimerId);
      }
    }
  }

  if ($doc_0.addEventListener) {
    $doc_0.addEventListener('DOMContentLoaded', function(){
      onBodyDone();
    }
    , false);
  }
  var onBodyDoneTimerId = setInterval(function(){
    if (/loaded|complete/.test($doc_0.readyState)) {
      onBodyDone();
    }
  }
  , 50);
  $stats && $stats({moduleName:'platformConcurrency', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'end'});
  $stats && $stats({moduleName:'platformConcurrency', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'begin'});
  if (/loaded|complete|interactive/.test(document.readyState) === false) {
    var compiledScriptTag = '"<script src=\\"' + base + strongName + '.cache.js\\"><\/scr" + "ipt>"';
    $doc_0.write('<scr' + 'ipt><!-' + '-\n' + 'window.__gwtStatsEvent && window.__gwtStatsEvent({' + 'moduleName:"platformConcurrency", sessionId:window.__gwtStatsSessionId, subSystem:"startup",' + 'evtGroup: "loadExternalRefs", millis:(new Date()).getTime(),' + 'type: "end"});' + 'window.__gwtStatsEvent && window.__gwtStatsEvent({' + 'moduleName:"platformConcurrency", sessionId:window.__gwtStatsSessionId, subSystem:"startup",' + 'evtGroup: "moduleStartup", millis:(new Date()).getTime(),' + 'type: "moduleRequested"});' + 'document.write(' + compiledScriptTag + ');' + '\n-' + '-><\/scr' + 'ipt>');
  }
   else {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    var head = document.getElementsByTagName('head')[0];
    if (!head)
      head = document.body;
    window.__gwtStatsEvent && window.__gwtStatsEvent({moduleName:'platformConcurrency', sessionId:window.__gwtStatsSessionId, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'end'});
    window.__gwtStatsEvent && window.__gwtStatsEvent({moduleName:'platformConcurrency', sessionId:window.__gwtStatsSessionId, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'moduleRequested'});
    script.src = base + strongName + '.cache.js';
    head.appendChild(script);
  }
}

if (window['$pdk'] === null || typeof window['$pdk'] !== 'object' && typeof window['$pdk'] !== 'function') {
  window['$pdk'] = {};
}
if (typeof window['$pdk']['platformConcurrency'] === 'undefined') {
  (function(){
    var _class = function(){
      this.listeners = {};
    }
    ;
    _class.prototype.addEventListener = function(type, listener){
      if (type === 'OnReady' && this.isReady)
        listener();
      if (this.listeners[type] === undefined) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }
    ;
    _class.prototype.removeEventListener = function(type, listener){
      if (this.listeners[type] === undefined) {
        return;
      }
      var array = this.listeners[type];
      if (array !== undefined) {
        for (var i = 0; i < array.length; i++) {
          if (array[i] === listener) {
            this.listeners[type].splice(i, 1);
            return;
          }
        }
      }
    }
    ;
    _class.prototype.dispatchEvent = function(type, data){
      var array = this.listeners[type];
      if (array !== undefined) {
        for (var i = 0; i < array.length; i++) {
          array[i].call(this, {type:type, data:data});
        }
      }
    }
    ;
    window['$pdk']['platformConcurrency'] = new _class;
  }
  ());
}
com_theplatform_concurrency_api_client();
