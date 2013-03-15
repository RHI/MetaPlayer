$pdk.ns("$pdk.plugin.comScore");
$pdk.plugin.comScore = $pdk.extend(function(){},
{
	VERSION : "1.0",
	URL : "http://b.scorecardresearch.com/b?",
	PRE : 0,
	MID : 1,
	POST : 2,
	
	_c2: "",  		// comScore  ID for the distribution platform
	_c3: "",		// The owner-level custom field to map to the comScore ID for the content owner
	_c4: "",  		// comScore  ID for location/site where content was viewed

	 // Optional
	_c5: "",	// The content-level custom field to map to the "c5" field
	_c6: "", 	// The content-level custom field to map to the "c6" field
	_c10: "",
	
	_longForm: false,
	_longFormGUID: "",
	_trackEachChapter: false,
	_baseClip:null,
	_currentAdState : -1,
	_chapters : 0,
	/**
	 * What is the event that is fired after initial loading but before playing? 
	 * How to determine midroll? 
	 * How to determine longForm content? 
	 */
	
	constructor : function(beaconFactory)
	{
        	tpDebug("ComScore Plugin instantiated.");
		this._beaconFactory = beaconFactory;
		this._currentAdState = this.PRE;
	},

	getCurrentAdState : function()
	{
		return this._currentAdState;
	},
	
	/**
	 * Initialize the plugin with the load object
	 * @param lo load object
	 */ 
	initialize:function(lo)
	{
		var that = this;
			
		this._lo = lo;
		this._controller = this._lo.controller;
		tpDebug("ComScorePlugin loading");
		
		// get various required loadvars
		
		this._c2 = this._lo.vars['c2'];
		if(this._c2 == null || this._c2.length == 0) {
			tpDebug("*** ERROR: missing 'c2' parameter");
			return;
		}
		this._c3 = this._lo.vars['c3Field'];
		if(this._c3 == null || this._c3.length == 0) {
			this._c3 = this._c2;
		}
		this._c4 = this._lo.vars['c4'];
		if(this._c4 == null || this._c4.length == 0) {
			tpDebug("*** ERROR: missing 'c4' parameter");
			return;
		}			

		this._c5 = this._lo.vars['c5Field'];
		this._c6 = this._lo.vars['c6Field'];
		
		this._trackEachChapter = (lo.vars['trackEachChapter'] == "true" ? true : false);

		this._controller.addEventListener(PdkEvent.OnReleaseStart, function(e) {
			that.onReleaseStart(e);
		});

		this._controller.addEventListener(PdkEvent.OnMediaStart, function(e) {
			that.onMediaStart(e);
		});

		this._controller.addEventListener(PdkEvent.OnReleaseEnd, function(e) {
			that.onReleaseEnd(e);
		});
		
		tpDebug("*** ComScorePlugin LOADED *** version:[" + this.VERSION + "]");
		tpDebug("params: "+ this.getParams(),"ComScore");
	},
			
	onReleaseStart:function(e)
	{	
		var playlist = e.data;
		var chapterList = playlist.chapters;

		this._currentAdState = this.PRE;
		
		if(chapterList.chapters || chapterList.chapters.length > 0)  {
			this._longForm = true;
			this._chapters = chapterList.chapters.length;
		}
	
		tpDebug("onReleaseStart, longForm="+ this._longForm);

	},
	
	onMediaStart: function(e)
	{
		this._clip = e.data;
		this._baseClip = this._clip.baseClip;

		if (!this._baseClip.isAd)
		{
			// if we're playing content chapter, next ad is midroll
			if (this._currentAdState === this.PRE)
			{
				this._currentAdState = this.MID;
			}
			// if we're playing last chapter, next ad is postroll
			else if (this._clip.clipIndex === this._chapters - 1)
			{
				this._currentAdState = this.POST;
			}
		}


		this._c5 = this._lo.vars['c5Field'];
		this._c6 = this._lo.vars['c6Field'];
		this._c10 = "";
		
		tpDebug("onMediaStart, longForm=" + this._longForm + " guid=" + this._longFormGUID);

		if(this._longForm && !this._longFormGUID) {
			tpDebug("long form, copying guid");
			this._longFormGUID = this._baseClip.guid;
			this.dispatchBeacon();
		}
		else if (this._trackEachChapter) {
			tpDebug("long form, tracking successive chapters");
			this.dispatchBeacon();
		}
		
		else if(this._longFormGUID != this._baseClip.guid) {
			tpDebug("already had a guid");
			this.dispatchBeacon();
		}
	},
	
	onReleaseEnd: function(e)
	{
		// FIXME : reactivate after GWT player impl is complete
		/*if(this._longForm)  {
			this._longForm = false;
			this._longFormGUID = null;
		}*/
	},
	
	getParams: function()
	{
		
		if(this._baseClip) {
			this._c3 = this.getProperty(this._baseClip, this._c3);
			this._c5 = (this._c5 ? this.getProperty(this._baseClip, this._c5) : this.getCategorizationCode());
			this._c6 = this.getProperty(this._baseClip, this._c6);
		}
		
		if (!this._c3)
			this._c3 = this._c2;

		if(!this._c5)
			this._c5 = "";
		
		if(!this._c6)
			this._c6 = "";

		var params = "c1=1";
		params += "&c2=" +this._c2;
		params += "&c3=" +this._c3;
		params += "&c4=" +this._c4;
		params += "&c5=" +this._c5;
		params += "&c6=" +this._c6;
		
		if (this._longForm)
		{
			this._c10 = (this._clip.clipIndex+1) + "-" + this._chapters;
		}
		else
		{
			this._c10 = undefined;
		}
		
		return params;
	},
	
	getCategorizationCode:function() {
 		var code = "";

		if (this._baseClip.isAd)
		{
			if (this._currentAdState === this.PRE)
			{
				code = "09";
			}
			else if (this._currentAdState === this.MID)
			{
				code = "11";
			}
			else
			{
				code = "10";
			}
		}
		else {
			code = (this._longForm ? "03" : "02");
		}

		return code;
	},
	
	getProperty:function(bc, prop, recursive)
	{
		if (recursive === undefined) recursive = true;
		
		if (typeof(prop) === "string" && recursive && prop.match(/\{([a-zA-Z0-1]+)\}/))
		{
			var result = prop;
			var parts = result.match(/\{([a-zA-Z0-1]+)\}/g);
			var value;
			
			for (var i=0; i<parts.length; i++)
		   	{
				value = this.getProperty(bc, result.match(/\{([a-zA-Z0-1]+)\}/)[1], false);
				tpDebug("replacing " + parts[i] + " with " + value);
				result = result.replace(/\{([a-zA-Z0-1]+)\}/, value);
			}

			return result;
		}
		
		if(typeof(prop) === "string" && bc.contentCustomData && bc.contentCustomData.hasOwnProperty(prop))
		{
			return bc.contentCustomData[prop];
		}
		else if(typeof(prop) === "string" && bc.ownerCustomData && bc.ownerCustomData.hasOwnProperty(prop))
		{
			return bc.ownerCustomData[prop];
		}
		else {
			tpDebug("getProperty returning null");
			return null;
		}
	},
	
	dispatchBeacon:function()
	{
		tpDebug("dispatchBeacon, isAd=" + this._baseClip.isAd);

		if (this._baseClip.isAd && this._baseClip.trackingURLs && this._baseClip.trackingURLs.length > 0)
		{
			var alreadyTracked = false;
			
			for (var trackingURL in this._baseClip.trackingURLs)
			{
				if (String(trackingURL.URL).search(this.URL) >= 0)
					alreadyTracked = true;
			}
			
			if(alreadyTracked)
				return;

		}
		
		var params = this.getParams();

		this.comScoreBeacon("1", this._c2, this._c3, this._c4, this._c5, this._c6, this._c10);
	},
	
	comScoreBeacon:function(c1, c2, c3, c4, c5, c6, c10) {
		var page = "", referrer = "", title = "";

		page = document.location.href;
		referrer = document.referrer;
		title = document.title;
		if (typeof(page) == "undefined" || page == "null") { page = loaderInfo.url; };
		if (typeof(referrer) == "undefined" || referrer == "null") { referrer = ""; }
		if (typeof(title) == "undefined" || title == "null") { title = ""; }
		if (page != null && page.length > 512) { page = page.substr(0, 512); }
		if (referrer.length > 512) { referrer = referrer.substr(0, 512); }

		var url = [
		page.indexOf("https:") == 0 ? "https://sb" : "http://b",
			".scorecardresearch.com/p",
			"?c1=", c1,
			"&c2=", escape(c2),
			"&c3=", escape(c3),
			"&c4=", escape(c4),
			"&c5=", escape(c5),
			"&c6=", escape(c6),
			"&c10=", escape(c10),
			"&c7=", escape(page),
			"&c8=", escape(title),
			"&c9=", escape(referrer),
			"&rn=", Math.random(),
			"&cv=2.0"
		].join("");

		if (url.length > 2080) { url = url.substr(0, 2080); }
                                                                

		var beacon = this._beaconFactory.create(function() {
			tpDebug("dispatch success: " + url);
		});
		beacon.fire(url);

		return url;
	}
	
});
$pdk.plugin.BeaconFactoryMainImpl = $pdk.extend(function(){},
{
	create : function(callback)
	{
		return new $pdk.plugin.BeaconFactoryMainImpl._class(callback);
	}
});

$pdk.plugin.BeaconFactoryMainImpl._class = $pdk.extend(function(){},
{
	constructor : function(callback)
	{
		this._callback = callback;
	},

	fire : function(url)
	{
		var that = this,
		loader = new Image();

		tpDebug("dispatching beacon: " + url);

		loader.onload = function()
		{
			that._callback();
		};
		loader.src = url;
	}
});

var comscorePlugIn = new $pdk.plugin.comScore(new $pdk.plugin.BeaconFactoryMainImpl());
tpController.plugInLoaded(comscorePlugIn, null);
