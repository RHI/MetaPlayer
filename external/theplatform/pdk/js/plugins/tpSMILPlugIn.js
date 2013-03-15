SMILPlugIn = Class.extend({

	init: function() {
	},
	
	initialize: function(loadObj) {
		this.controller = loadObj.controller;
		this.controller.registerAdPlugIn(this);
		this.hostsArray = new Array();
		
		if (loadObj.vars && loadObj.vars["hosts"]) {
			this.hostsArray = loadObj.vars["hosts"].split(",");
		}
	},
	
	isAd: function(clip) {
		if (clip.type == "text/xml" || clip.type == "application/smil" || clip.type == "application/smil+xml")
			return true;
		else
			return this.isExternalSmilURL(clip.URL);
	},
	
	isExternalSmilURL: function(checkURL) 
	{
		var EXTERNAL_FLAVORS = [	"247realmedia.com",
									"release.theplatform.com",
									"ad.doubleclick.net",
									"search.spotxchange.com",
									"view.atdmt.com"];
		
		var isExternal = false;
		
		for (var i=0; i<EXTERNAL_FLAVORS.length; i++) {
			if (checkURL.indexOf(EXTERNAL_FLAVORS[i]) >= 0)
				isExternal = true;
		}
		
		if (!isExternal && this.hostsArray.length > 0) {
			for (i=0; i<this.hostsArray.length; i++) {
				if (checkURL.indexOf(this.hostsArray[i]) >= 0)
					isExternal = true;
			}
		}

		return isExternal;
	},
	
	checkAd: function(clip) {
		if (!clip.URL)
			return false; // BAIL - we have no URL
			
		var isHandled = false;
		if (!this.isExternalSmilURL(clip.URL) && clip.type != "text/xml")
		{
			// not SMIL! SMIL needs release.theplatform or a specified ad provider
//			_controller.trace("clip \"" + clip.URL + "\" of type \"" + clip.baseClip.type + "\" is not a registered SMIL reference", "SMIL", Debug.INFO);
		}
		else
		{
			var url = this.findPOS(clip); 
			var me = this;
			var loader = new XMLLoader();
			loader.load(url, function(xml) {me.smil(xml,clip);}, function(){tpDebug("Error loading SMIL XML")});
			isHandled = true;
		}
		return isHandled;
	},
	
	findPOS: function(clip)
	{
		var url = clip.URL;
		var posRegEx = /POS|<position>|{position}/;
		if (url.match(posRegEx))
		{
			var position = 1;
			if (clip.clipIndex > 0)//if the position == 0, then it must be the first, otherwise check
			{
				var pl = clip.playlistRef;
				for (var i = 0; i < clip.playlistRef.indexOf(clip); i++)
				{
					if (pl[i].isAd)
					{
						position++;
					}
				}
			}
			url = url.replace(posRegEx, position);
		}
		return url;
	},
	
	smil: function(xml, clip)
    {
		var parser = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString());
		var playlist = parser.parsePlaylist(xml,this.releaseUrl);
		
		var i=0;
		var len = playlist.clips.length;
		for (;i<len;i++)
		{
			playlist.clips[i].baseClip.isAd = clip.baseClip.isAd;
			playlist.clips[i].baseClip.noSkip = clip.baseClip.noSkip;
			this.controller.updateClip(playlist.clips[i]);

		}
		
		this.controller.updatePlaylist(playlist);

		this.controller.setAds(playlist);
	}
	
});

var smilPlugIn = new SMILPlugIn();
tpController.plugInLoaded(smilPlugIn);