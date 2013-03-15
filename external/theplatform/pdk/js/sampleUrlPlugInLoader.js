// this is the callback for when this file is loaded.
function tpSampleUrlPlugInLoader_loaded()
{
	tpScriptLoader.addScript("../../pdk/js/sampleUrlPlugIn.js", "tpSampleUrlPlugIn_loaded");
}

// this is the callback for when the scripts used by this file are loaded.
function tpSampleUrlPlugIn_loaded()
{
	tpController.dispatchEvent("OnJavascriptLoaded", "tpSampleUrlPlugin");
}

