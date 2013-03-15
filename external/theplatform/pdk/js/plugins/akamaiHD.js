// This plug-in will handle AkamaiHD for iOS, by requesting manifest=m3u.
// You will need to have your server definition set up in MPX to use this.
AkamaiHDPlugIn = Class.extend({

	init: function() {	
		
	},

	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;     
		// Grab the manifest type, in case we support more in the future
		// but default to m3u, which is the only one that makes sense currently
		this.manifest = (loadObj.vars['manifest'] ? loadObj.vars['manifest'] : "m3u");

		// Finally, register the plug-in with the controller
		// to be able to accept URL rewriting requests. 
		this.controller.registerMetadataUrlPlugIn(this,loadObj.type, loadObj.priority);
		
		this.formats = $pdk.env.Detect.getInstance().getSupportedRuntimes();
	},
	
	// This method must be implemented on the class. It does the actual work
	// of inspecting the URL and making the necessary changes. 
	rewriteMetadataUrl: function(url, isPreview) {
	    	    
	    var me = this;

		// if this is a preview URL, we don't want to touch it.
		if (isPreview) return false;
		
		// let's be safe and check if there's even a URL.
		if (!url) return false;
	    
		// Only iOS can handle M3U, at the moment, and maybe Android, so we'll try
		if (this.isManifestCompatible())
		{
			// if there'a already a manifest, replace it
		    if (url.match(/(\?|\&)manifest\=[^\&]*/i))
			{
				url = url.replace(/(\?|\&)manifest\=[^\&]*/i, "$1manifest=" + this.manifest);
			}   
			// there's no manifest param, let's add one
			else if (url.indexOf("?") >= 0)
			{
				url += "&manifest=" + this.manifest;
			}
			else
			{
				url += "?manifest=" + this.manifest;
			}
		}
		// if it's not an m3u compatible device, strip off any manifest
		// Because the only other manifest is F4M which won't work in JS
		else
		{
			// if there'a already a manifest, replace it
		    if (url.match(/(\?|\&)manifest\=[^\&]*/i))
			{
				url = url.replace(/(\?|\&)manifest\=[^\&]*/i, "");
			}   
		}
		
		this.controller.setMetadataUrl(url);

	    return true;
	},
	
	isManifestCompatible: function()
	{
		for (var i=0; i<this.formats.length; i++)
		{
			if (this.formats[i].match(/html5\:m3u/i))
			{
				return true;
			}
		}
		return false;
//		return (tpIsIOS() || tpIsAndroid());
	}
});

// Create an instance of the plug-in.
var AkamaiHDPlugIn = new AkamaiHDPlugIn();
// And add it to the collection of plug-ins to be loaded. 
tpController.plugInLoaded(AkamaiHDPlugIn);