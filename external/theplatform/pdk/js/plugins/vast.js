//this can probably be static
VastParser = Class.extend({

    init:function()
    {
        tpDebug("VastPlugin instantiated.", "", "VAST");
    },


    parse:function(xml)
    {


        var vastXml;
        if (xml instanceof window.Document)
        {
            tpRemoveWhiteSpace(xml);
            vastXml = xml;
        }
        else if (xml['xml'] !== undefined)
        {
            vastXml = tpParseXml(xml.xml);
        }
        else
        {
            vastXml = tpParseXml(xml);
        }


        //vast = vast.replace(/[\n\r]/g, "");

        // tpDebug(vastXml);

        //this would be the first ad node(s)
        return this.parseVast(vastXml.childNodes[0].childNodes);


    },

    parseVast:function(nodes)
    {
        var result = new Object();
        result.ads = new Array();
        for (var i = 0; i < nodes.length; i++)
        {
            if (nodes[i] instanceof Element)
            {
                result.ads.push(this.parseAd(nodes[i]));
            }
        }
        return result;

    },

    parseUrls:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var results = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                results.push(this.parseUrl(xml.childNodes[i]));
            }
            return results;
        }
        return null;
    },

    parseUrl:function(xml)
    {
        var result = new Object();
        result.url = this.parseSimpleUrl(xml);
        if (xml.attributes && xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        else
        {
            result.id = null;
        }
        return result;

    },

    parseSimpleUrl:function(xml)
    {
        if (xml && xml.nodeValue != null)
        {
            return xml.nodeValue;
        }
        else if (xml && xml.childNodes[0])
        {
            return xml.childNodes[0].nodeValue;
        }
        else
        {
            return null;
        }

    },

    parseAd:function(xml)
    {

        var subXml = xml.childNodes[0];

        if (!(subXml instanceof Element))
        {
            return null;
        }

        if (subXml.tagName == "InLine")
        {
            var result = this.parseInLine(subXml);
			
			if (!result)
				return null;

            result.adType = "InLine";
            return result;
        }
        else if (subXml.tagName == "Wrapper")
        {
            var result = new Object();
            result.id = xml.attributes.getNamedItem("id").nodeValue;
			
			var addSystem = subXml.getElementsByTagName("AddSystem")[0]; 
			//some bogus-ish xml won't have this
			if (addSystem!==undefined)
            	result.adSystem = addSystem.childNodes.nodeValue;

            result.error = this.parseSimpleUrl(subXml.getElementsByTagName("Error")[0]);
            result.extensions = subXml.getElementsByTagName("Extensions")[0];
            result.impressions = this.parseUrls(subXml.getElementsByTagName("Impression")[0]);

            //TODO: this stuff
            result.trackingEvents = this.parseTrackingEvents(subXml.getElementsByTagName("TrackingEvents")[0]);

            result.adType = "Wrapper";

            return this.parseWrapper(subXml, result);
        }
        else
        {
            throw new Error("Unrecognized ad type: \"" + subXml.tagName + "\"");
        }

        return null;
    },

    parseTrackingEvents:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseTrackingEvent(xml.childNodes[i]));
            }
            return result;
        }
        return null;

    },

    parseTrackingEvent:function(xml)
    {
        var result = new Object();
        if (xml.attributes["event"])
        {
            result.event = xml.attributes["event"].nodeValue;
        }
        result.urls = this.parseUrls(xml);
        return result;
    },

    parseWrapper:function(xml, ad)
    {
        var result = new Object();

        result.vastAdTagURL = this.parseSimpleUrl(xml.getElementsByTagName("VASTAdTagURI")[0]);
        result.videoClicks = this.parseVideoClicks(xml.getElementsByTagName("VideoClicks")[0]);
        return result;

    },



    parseInLine:function(xml)
    {
        var ad = new Object();

        if (xml.attributes["id"])
        {
            ad.id = xml.attributes["id"].nodeValue;
        }

        ad.adSystem = xml.getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue;
        ad.error = this.parseSimpleUrl(xml.getElementsByTagName("Error")[0]);
        ad.extensions = xml.getElementsByTagName("Extensions")[0];
        ad.impressions = this.parseUrls(xml.getElementsByTagName("Impression")[0]);

        var result = this.parseCreatives(xml, ad);
        return result;
    },

    parseCreatives:function(xml, ad)
    {
        var result = ad;//we just dynamicall add extra props to it
        if (xml.getElementsByTagName("AdTitle")[0] && xml.getElementsByTagName("AdTitle")[0].childNodes[0])
        {
            result.adTitle = xml.getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("Description")[0] && xml.getElementsByTagName("Description")[0].childNodes[0])
        {
            result.description = xml.getElementsByTagName("Description")[0].childNodes[0].nodeValue;
        }

        var creativesXML = xml.getElementsByTagName("Creatives")[0];

		if (!creativesXML)
			return null;

        for (var i = 0; i < creativesXML.childNodes.length; i++)
        {

            var creativeXML = creativesXML.childNodes[i];

            if (creativeXML.getElementsByTagName("CompanionAds").length > 0)
            {
                var companionAdsXML = creativeXML.getElementsByTagName("CompanionAds")[0];
                if (companionAdsXML != null)
                {
                    result.companionAds = this.parseCompanionAds(companionAdsXML);
                }
            }
            else if (creativeXML.getElementsByTagName("Linear")[0] != null)
            {
                var linearXML = creativeXML.getElementsByTagName("Linear")[0];
                if (linearXML != null)
                {
                    result.video = this.parseVideo(linearXML);
                }
            }
            else if (creativeXML.getElementsByTagName("NonLinearAds").length > 0)
            {
                var nonLinearAdsXML = creativeXML.getElementsByTagName("NonLinearAds")[0];
                if (nonLinearAdsXML != null)
                {
                    result.nonLinearAds = this.parseNonLinearAds(nonLinearAdsXML);
                }
            }
        }

        return result;

    },

    parseCompanionAds:function(xml)
    {

        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseCompanion(xml.childNodes[i]));
            }
            return result;
        }
        return null;
    },

    parseCompanion:function(xml)
    {

        var result = new Object();
        if (xml.getElementsByTagName("AltText")[0] && xml.getElementsByTagName("AltText")[0].childNodes[0])
        {
            result.altText = xml.getElementsByTagName("AltText")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("adParameters")[0])
        {
            result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        }
        if (xml.getElementsByTagName("Code")[0] && xml.getElementsByTagName("Code")[0].childNodes[0])
        {
            result.code = xml.getElementsByTagName("Code")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("CompanionClickThrough")[0])
        {
            result.companionClickThrough = this.parseSimpleUrl(xml.getElementsByTagName("CompanionClickThrough")[0]);
        }

        if (xml.attributes["creativeType"])
        {
            result.creativeType = xml.attributes["creativeType"].nodeValue;
        }
        if (xml.attributes["expandedHeight"] != null)
        {
            result.expandedHeight = xml.attributes["expandedHeight"].nodeValue;
        }
        if (xml.attributes["expandedWidth"] != null)
        {
            result.expandedWidth = xml.attributes["expandedWidth"].nodeValue;
        }
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["resourceType"])
        {
            result.resourceType = xml.attributes["resourceType"].nodeValue;
        }
        if (xml.getElementsByTagName("StaticResource")[0])
        {
            result.staticResource = this.parseSimpleUrl(xml.getElementsByTagName("StaticResource")[0]);
        }
        if (xml.getElementsByTagName("IFrameResource")[0])
        {
            result.iFrameResource = this.parseSimpleUrl(xml.getElementsByTagName("IFrameResource")[0]);
        }
        if (xml.getElementsByTagName("HTMLResource")[0])
        {
            result.HTMLResource = xml.getElementsByTagName("HTMLResource")[0];
        }

        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }
        return result;

    },

    parseVideo:function(xml)
    {
        var result = new Object();
        if (xml.getElementsByTagName("Duration")[0])
        {
            result.duration = tpTimeToMillis(xml.getElementsByTagName("Duration")[0].childNodes[0].nodeValue);
        }
        if (xml.getElementsByTagName("AdID")[0])
        {
            result.adId = xml.getElementsByTagName("AdID")[0].childNodes[0].nodeValue;
        }
        if (xml.getElementsByTagName("AdID")[0])
        {
            result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        }
        if (xml.getElementsByTagName("VideoClicks")[0])
        {
            result.videoClicks = this.parseVideoClicks(xml.getElementsByTagName("VideoClicks")[0]);
        }
        if (xml.getElementsByTagName("MediaFiles")[0])
        {
            result.mediaFiles = this.parseMediaFiles(xml.getElementsByTagName("MediaFiles")[0]);
        }

        //need to get tracking events

        if (xml.getElementsByTagName("TrackingEvents")[0])
        {
            result.trackingEvents = this.parseTrackingEvents(xml.getElementsByTagName("TrackingEvents")[0]);
        }

        return result;

    },

    parseAdParameters:function(xml)
    {
        if (xml != null)
        {
            var result = new Object();
            result.apiFramework = xml.attributes["apiFramework"];
            result.parameters = xml.childNodes;
            return result;
        }
        return null;
    },

    parseVideoClicks:function(xml)
    {
        if (xml != null)
        {
            var result = new Object();
            result.clickThrough = this.parseUrls(xml.getElementsByTagName("ClickThrough")[0]);
            result.clickTracking = this.parseUrls(xml.getElementsByTagName("ClickTracking")[0]);
            result.customClick = this.parseUrls(xml.getElementsByTagName("CustomClick")[0]);
            return result;
        }
        return null;
    },

    parseMediaFiles:function(xml)
    {

        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseMediaFile(xml.childNodes[i]));
            }
            return result;
        }
        return null;

    },

    parseMediaFile:function(xml)
    {

        var result = new Object();
        if (xml.attributes["bitrate"] != null)
        {
            result.bitrate = xml.attributes["bitrate"].nodeValue * 1000;
        }
        result.delivery = xml.attributes["delivery"].nodeValue;
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["type"])
        {
            result.type = xml.attributes["type"].nodeValue;
        }

        result.url = this.parseSimpleUrl(xml);
        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }
        return result;


    },

    parseNonLinearAds:function(xml)
    {
        if (xml != null && xml.childNodes != null)
        {
            var result = new Array();
            for (var i = 0; i < xml.childNodes.length; i++)
            {
                result.push(this.parseNonLinear(xml.childNodes[i]));
            }
            return result;
        }
        return null;
    },

    parseNonLinear:function(xml)
    {
        var result = new Object();
        if (xml.attributes["apiFramework"])
        {
            result.apiFramework = xml.attributes["apiFramework"].nodeValue;
        }

        //this was removed for vast 2.0
//        if (xml.getElementsByTagName("Code")[0])
//            result.code = xml.getElementsByTagName("Code")[0].childNodes[0].nodeValue;
//        if (xml.attributes["creativeType"])
//        result.creativeType = xml.attributes["creativeType"].nodeValue

        if (xml.attributes["expandedHeight"] != null)
        {
            result.expandedHeight = xml.attributes["expandedHeight"].nodeValue;
        }
        if (xml.attributes["expandedWidth"] != null)
        {
            result.expandedWidth = xml.attributes["expandedWidth"].nodeValue;
        }
        if (xml.attributes["height"] != null)
        {
            result.height = xml.attributes["height"].nodeValue;
        }
        if (xml.attributes["id"])
        {
            result.id = xml.attributes["id"].nodeValue;
        }
        if (xml.attributes["maintainAspectRatio"] != null)
        {
            result.maintainAspectRatio = xml.attributes["maintainAspectRatio"].nodeValue;
        }

        result.nonLinearClickThrough = this.parseSimpleUrl(xml.getElementsByTagName("NonLinearClickThrough")[0]);
        result.adParameters = this.parseAdParameters(xml.getElementsByTagName("AdParameters")[0]);
        if (xml.attributes["resourceType"] != null)
        {
            result.resourceType = xml.attributes["resourceType"].nodeValue;
        }
        if (xml.attributes["scalable"] != null)
        {
            result.scalable = xml.attributes["scalable"].nodeValue;
        }


        if (xml.getElementsByTagName("StaticResource")[0])
        {
            result.staticResource = this.parseSimpleUrl(xml.getElementsByTagName("StaticResource")[0]);
        }
        if (xml.getElementsByTagName("IFrameResource")[0])
        {
            result.iFrameResource = this.parseSimpleUrl(xml.getElementsByTagName("IFrameResource")[0]);
        }
        if (xml.getElementsByTagName("HTMLResource")[0])
        {
            result.HTMLResource = xml.getElementsByTagName("HTMLResource")[0];
        }


        //was removed for vast 2.0
        //result.url = this.parseSimpleUrl(xml.getElementsByTagName("URL")[0]);

        if (xml.attributes["width"] != null)
        {
            result.width = xml.attributes["width"].nodeValue;
        }
        return result;


    }


});

tpVastParser = new VastParser();

VastPlugIn = Class.extend({


    init:function()
    {
        this.container = document.createElement("div");
        this.container.style.display = "";
        this.container.style.width = "100%";
        this.createPlayer();
    },

    createPlayer:function()
    {
        this.video = document.createElement("video");
        this.container.style.display = "";
        var me = this;

        this.overlayLayer = document.createElement("div");
        this.overlayLayer.id = "overlaylayer";
        this.overlayLayer.style.height = "100%";
        this.overlayLayer.style.width = "100%";
        this.overlayLayer.style.display = "";
        //this.overlayLayer.style.backgroundColor = "red";

        this.container.appendChild(this.overlayLayer);

        // this.background = document.createElement("div");
        // this.background.id = "adbackground";
        // this.background.style.width = "100%";
        // this.background.style.height = "100%";
        // this.background.style.position = "absolute";
        // this.background.style.backgroundColor = "black";
        // this.background.style.display = "";

		var me = this;

        // this.container.appendChild(this.background);
    },

    // TODO: port to trackingUrls
    videoClicked:function()
    {
        if (this.videoClicks)
        {
            //should open the href and sendUrl the tracking
            this.processClickThroughs(this.videoClicks.clickThrough);
            this.processClickTracking(this.videoClicks.clickTracking);
        }
    },

    processClickTracking:function(clicktracking)
    {
        //this is potentially spammy but maybe we have spammy customers
        for (var i = 0; i < clicktracking.length; i++)
        {
            tpSendUrl(clicktracking[i].url);
        }
    },

    processClickThroughs:function(clickthroughs)
    {
        //this is potentially spammy but maybe we have spammy customers
        for (var i = 0; i < clickthroughs.length; i++)
        {
            window.open(clickthroughs[i].url, "_blank");
        }
    },

    handleOnMediaPlaying:function(e)
    {
        if (this.currentClip && this.currentClip.baseClip.isAd)
        {
            this.handleAdPlaying(e);
            return;
        }
    },

	handleMute:function(e)
	{
		if (this.currentClip&&this.currentClip.baseClip.isAd)
		{
			
	        var urls = this.currentTrackingUrls;
		
			//should send pause tracking event
			for (var i = 0; urls && i < urls.length; i++)
	        {
	            //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
	            var currenturl = urls[i];
	
				if (currenturl.triggerValue==="mute")
					tpSendUrl(currenturl.URL);
	
			}
		}
	},
	
	handlePause:function(e)
	{
	    var clip = e.data.clip;
		if (clip && clip.baseClip.isAd)
		{
	        var urls = this.currentTrackingUrls;
			
			//should send pause tracking event
			for (var i = 0; urls && i < urls.length; i++)
	        {
	            //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
	            var currenturl = urls[i];
	
				if (currenturl.triggerValue==="pause")
					tpSendUrl(currenturl.URL);
	
			}
		}
		
	},

    handleAdPlaying:function(e)
    {
        //also need to manage tracking events
        var percentComplete = e.data.currentTime / e.data.duration * 100;


        var urls = this.currentTrackingUrls;

        //TODO: we should probably sort the array by timevalue first, it would be good to use a timer to prevent this loop from occuring so much
        //but in flash it happens onmediaplaying so we'll do the same here
        for (var i = 0; urls && i < urls.length; i++)
        {
            //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
            var currenturl = urls[i];
            if (currenturl && !currenturl.hasFired && (currenturl.triggerValue < percentComplete))
            {
                tpSendUrl(currenturl.URL);
                currenturl.hasFired = true;
//                  urls.splice(i,1);
//                  i--;
            }
        }

    },

    onEnded:function(e)
    {

        var urls = this.currentTrackingUrls;

        if (!urls)
        {
            return;
        }

        //TODO: we should probably sort the array by timevalue first, it would be good to use a timer to prevent this loop from occuring so much
		//apparently this isn't actually needed, since the timer will fire when we pass the end
        for (var i = 0; urls && i < urls.length; i++)
        {
            //this is somewhat naive, if part of the ad is seeked it may trigger unwanted events
            var currenturl = urls[i];
            if (currenturl && !currenturl.hasFired && currenturl.triggerValue == 100)
            {
                tpSendUrl(currenturl.URL);
                currenturl.hasFired = true;
//                  urls.splice(i,1);
//                  i--;
            }
        }

        this.currentTrackingUrls = undefined;

        // this.player.src="";
//        this.player.load();
        this.done();
    },


    onCanPlayThrough:function(e)
    {

        if (this.impressionsRequested)
        {
            return;
        }


        //check if video has been buffered

        tpDebug("got canplaythrough", this.controller.id, "VAST");


        this.sendImpressions();


    },

    showPlayer:function()
    {



        // this.container.style.display="";
//        this.background.style.display = "none";
        this.player.style.display = "";

        this.playerVisible = true;

    },

    hidePlayer:function()
    {



        //this.container.style.display="none";
//        this.player.style.display = "none";
//        this.background.style.display = "";

//        this.playerVisible=false;
    },

    clearTimeOut: function()
    {
        clearTimeout(this.timeoutInterval);
    },

    initialize: function(loadObj)
    {
        var me = this;
        this.controller = loadObj.controller;

        if (!tpIsAndroid())
        {
            this.controller.registerAdPlugIn(this);
        }
        else
        {
            return;
        }

        this.priority = loadObj.priority;

        var hosts = loadObj.vars["hosts"]; // could be array or string
        if (hosts && hosts.length)
        {
            this.hosts = hosts.split(",");
        }
        else
        {
            tpDebug("No hosts parameter, using mime-type for ad recognition", this.controller.id, "VAST", tpConsts.INFO);
            //return;
        }

        var mimeType = loadObj.vars["mimeType"];
        if (mimeType)
        {
            this.mimeTypes.push(mimeType)
        }
        else
        {
            mimeType = loadObj.vars["mimeTypes"];
            if (mimeType)
            {
                this.mimeTypes = mimeType.split(",");
            }
        }

        var callback = loadObj.vars["callback"];
        if (callback)
        {
            this.callback = callback;
        }
        else
        {
            this.callback = "vastJSONHandler"
        }

        window[this.callback] = function(json)
        {
            me.JSONHandler(json);
        };

        tpDebug("*** VAST plugIn LOADED!", this.controller.id, "VAST");

        this.controller.addEventListener("OnMediaLoadStart", function(e)
        {
            me.currentClip = e.data;
        });
        this.controller.addEventListener("OnMute", function(e)
        {
            me.handleMute(e);
        });
        this.controller.addEventListener("OnMediaPause", function(e)
        {
            me.handlePause(e);
        });
        this.controller.addEventListener("OnMediaEnd", function(e)
        {
            me.onEnded(e);
            me.currentClip = null;
        });
        this.controller.addEventListener("OnMediaStart", function(e)
        {
            me.onMediaStart.apply(me, [e]);
        });
        this.controller.addEventListener("OnMediaPlaying", function(e)
        {
            me.handleOnMediaPlaying.apply(me, [e]);
        });
    },

    destroy:function()
    {

        //should kill global listeners and local ones


    },

    onMediaStart:function(e)
    {

        var clip = e.data;

        var lastbc = this.lastAdBaseClip;

        if (!clip.isAd && lastbc && lastbc.overlays)
        {
            for (var i = 0; i < lastbc.overlays.length; i++)
            {
                var overlay = lastbc.overlays[i];
                this.showOverlay(overlay);
            }
        }
    },

    //default behavior is just to show overlay, not worry about time or clicks
    showOverlay:function(overlay)
    {
        //we stick it into this container


        if (!this.overlays) this.overlays = new Array();

        var oldiv = document.createElement("div");

        if (overlay.guid)
        {
            oldiv.id = overlay.guid;
        }
        var ola = document.createElement("a");
        var olimg = document.createElement("img");


        if (overlay.url)
        {
            olimg.src = overlay.url;
        }


        if (overlay.stretchToFit && !overlay.maintainAspectRatio)
        {
            olimg.style.height = "100%";
            olimg.style.width = "100%";
        }
        else if (overlay.stretchToFit && overlay.bannerHeight > overlay.bannerWidth)
        {
            olimg.style.height = "100%";
        }
        else if (overlay.stretchToFit)
        {
            olimg.style.width = "100%";
        }


        //what about click?
        ola.href = overlay.href;
        ola.target = "_blank";


        ola.appendChild(olimg);
        oldiv.appendChild(ola);

        if (overlay.bannerHeight)
        {
            oldiv.style.height = overlay.bannerHeight + "px";
        }

        if (overlay.bannerWidth)
        {
            oldiv.style.width = overlay.bannerWidth + "px";
        }

        //overlay.div = oldiv;

        this.overlays.push(overlay);//keeps track of overlay for deletion purposes
        this.overlayLayer.appendChild(oldiv);
    },

    removeOverlay:function(overlay)
    {

        var oldiv = document.getElementById(overlay.id);

        this.overlayLayer.removeChild(oldiv);

        for (var i = 0; i < this.overlays.length; i++)
        {

            if (this.overlays[i] == overlay)
            {
                this.overlays.splice(i, 1);
                break;
            }

        }


    },

    removeAllOverlays:function()
    {

        this.overlays = undefined;
        this.overlayLayer.innerHTML = "";//nuke the children

    },

    isAd:function(bc)
    {
        return (this.isVastUrl(bc.URL) || this.isVastUrl(bc.baseURL));

    },

    checkAd:function(clip)
    {
        var isHandled = (!clip.mediaLength || clip.mediaLength <= 0) && (this.isVastUrl(clip.baseClip.URL) || clip.baseClip.type=="application/vast+xml");
        if (isHandled)
        {
            //var isHandled=true;
            if (clip.baseClip.type && (clip.baseClip.type.toLowerCase() === "text/javascript" || clip.baseClip.type.toLowerCase() === "application/json"))
            {
                this.loadAdJSON(clip.baseClip.URL);
            }
            else if (!clip.baseClip.type || clip.baseClip.type && (clip.baseClip.type.toLowerCase() === "application/xml" || clip.baseClip.type.toLowerCase() === "application/vast+xml"
                    || clip.baseClip.type.toLowerCase() === "text/xml"))//if clip is ad, try anyway
            {
                this.loadAdXML(clip.baseClip.URL);
            }

        }

        return isHandled;
    },

    loadAdJSON:function(url)
    {
        //TODO: sadly, this calls a global function, we'll try to improve that

        //let's append the callback param, just in case
        if (url.indexOf('?') >= 0)
        {
            url += "&callback=" + this.callback;
        }
        else
        {
            url += "?callback=" + this.callback;
        }

        tpLoadScript(url);

        return true;
    },

    loadAdXML:function(url)
    {

        var useXdomain;
        if (typeof XDomainRequest !== "undefined" && url.indexOf(document.domain) < 0)
        {
            useXdomain = true;
        }
        if (typeof XMLHttpRequest === "undefined")
        {
            XMLHttpRequest = function ()
            {
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                }
                catch (e)
                {
                }
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                }
                catch (e)
                {
                }
                try
                {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e)
                {
                }
                //Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
                throw new Error("This browser does not support XMLHttpRequest.");
            };
        }


        var xhr;

        if (useXdomain)
        {
            xhr = new XDomainRequest();
        }
        else
        {
            xhr = new XMLHttpRequest();
        }

        var me = this;


        var onload = function()
        {
			
            if (this.readyState === 4&& this.status===200 && !me.handled)
            {
				me.handled=true;
				var xml = xhr.responseXML;
				if (xml==null)
					xml = xhr.responseText;
                var result = tpVastParser.parse(xml);
                me.processAd(result.ads[0])
            }
            else if (useXdomain&&!me.handled)
            {
				me.handled=true;
                var result = tpVastParser.parse(tpParseXml(xhr.responseText));
                me.processAd(result.ads[0])
            }

        };

        xhr.onreadystatechange = onload;
        xhr.onload = onload;

        try
        {
			this.handled=false;
            xhr.open("GET", url);
            xhr.send();
        }
        catch(e)
        {
            tpDebug(e.message, this.controller.id, "VAST");
            //console.error(e.message);
            //we need to get out of here and skip the ad
            this.controller.setAds(null);
        }

    },

    addTracking:function(tracking)
    {

    },

    sendImpressions:function()
    {

        tpDebug("sending impressions", this.controller.id, "VAST");

        if (this.currentImpressions)
        {
            for (var i = 0; i < this.currentImpressions.length; i++)
            {
                //send an http get for each?     
                tpSendUrl(this.currentImpressions[i].url);
            }
            this.currentImpressions = undefined;
        }

        this.impressionsRequested = true;
    },

    //not an event listener
    getTrackingUrl:function (event)
    {


        var eventType = event.event;
        var url = event.urls[0].url;

        switch (eventType.toLowerCase())
        {
            case "complete":       return this.setTracking(url, "percentage", 100);
            case "firstquartile": return this.setTracking(url, "percentage", 25);
            case "midpoint":      return this.setTracking(url, "percentage", 50);
            case "start":          return this.setTracking(url, "percentage", 0);
            case "thirdquartile": return this.setTracking(url, "percentage", 75);
            case "mute":          return this.setTracking(url, "event", "mute");
            case "pause":          return this.setTracking(url, "event", "pause");
            case "replay":          return this.setTracking(url, "event", "replay");
            case "stop":          return this.setTracking(url, "event", "stop");
            case "expand":
            case "fullscreen":      return this.setTracking(url, "event", "fullscreen");
            default:
                return null;
        }


    },

    setTracking:function(url, type, value)
    {

        var trackingUrl = new Object();
        trackingUrl.triggerType = type;
        trackingUrl.triggerValue = value;
        trackingUrl.URL = url;
		trackingUrl.globalDataType = "com.theplatform.pdk.data::TrackingUrl";
        return trackingUrl;

    },

    processMediaTrackingEvents:function(video, bc)
    {
        tpDebug("adding Tracking URLs", this.controller.id, "VAST");
        //do we even have any?

        if (!(video.trackingEvents && video.trackingEvents.length))
        {
            return;
        }


        //need to figure out when to dispatch events
        if (!bc.trackingURLs)
        {
            bc.trackingURLs = new Array();
        }

        for (var i = 0; i < video.trackingEvents.length; i++)
        {
            var trackingUrl = this.getTrackingUrl(video.trackingEvents[i]);
            tpDebug("Tracking URL: " + trackingUrl, this.controller.id, "VAST");
            bc.trackingURLs.push(trackingUrl);
        }

        //up to a media player event to worry about sending the tracking

    },


    processVideoClicks:function(video, bc)
    {

        if (video.videoClicks)
        {
            var videoClicks = video.videoClicks;

			

			if (videoClicks.clickThrough&&videoClicks.clickThrough.length>0)
			{
				var hyperlink = {globalDataType:"com.theplatform.pdk.data::HyperLink"};
				
				hyperlink.href = videoClicks.clickThrough[0].url;
				
				if (videoClicks.clickTracking)
				{

					hyperlink.clickTrackingUrls = [];
					var i=0;
					var len = videoClicks.clickTracking.length;
					for (;i<len;i++)
					{
						hyperlink.clickTrackingUrls.push(videoClicks.clickTracking[i].url);
					}
					
				}
				
				bc.moreInfo = hyperlink;
				
			}

			
        }
        else
        {
            this.videoClicks = undefined;
        }

    },


    processMediaFiles:function (video)
    {
        var format = null;

        //need to set up tracking events

        var isPlaying = false;

        var playlist = {};

        playlist.baseClips = [];
		playlist.clips = [];
		
		playlist.globalDataType = "com.theplatform.pdk.data::Playlist";
		
        var bc = {};
		
		var bestFile;

        for (var i = 0; i < video.mediaFiles.length; i++)
        {
            //TODO: should prioritize a preferred media type
            if (this.video.canPlayType(video.mediaFiles[i].type))
            {
                bestFile = video.mediaFiles[i];

				if (bestFile.type=="video/mp4")
                	break;
            }
        }

		if (bestFile)
		{
			isPlaying = true;
            bc.isAd = true;
            bc.noSkip = true;
            bc.streamType = "flashVideoUnknownMP4";
            bc.URL = bestFile.url;
            bc.title = this.currentTitle;
            bc.description = this.currentDescription;
            bc.overlays = this.currentOverlays;
			bc.globalDataType = "com.theplatform.pdk.data::BaseClip";
			//TODO: we should 
			this.processMediaTrackingEvents(video, bc);
	        this.processVideoClicks(video, bc);
			
			
			var clip = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(bc);

			playlist.clips.push(clip);			
            playlist.baseClips.push(bc);
			
		}

//		this.currentClip.baseClip = bc;



        this.currentTrackingUrls = bc.trackingURLs;

        if (!isPlaying)
        {
            this.controller.setAds(null);
        }
        else
        {
            this.controller.setAds(playlist);
        }
    },

    processAd:function(ad)
    {
		if (!ad)
		{
            this.controller.setAds(null);
		}
        else if (ad.adType == "InLine")
        {
            this.processInline(ad);
        }
        else if (ad.adType == "Wrapper")
        {
            //all we're supposed to do here is load the vastTagurl
            //must assume it'll be jsonp or json like how we want it
            tpLoadScript(ad.vastAdTagURL, function()
            {
            });

        }

    },

    //TODO: this will probably only handle an inline ad... need to do wrappers too(?)
    processInline:function(inline)
    {

        // our sample has a hard coded duration of 3 seconds, so we'll call done then
        var me = this;

        this.impressionsRequested = false;

        //TODO: there's a bunch more stuff that needs to happen here for tracking/banners/overlays/impressions

        //we should probably decorate the base clip with this stuff, even though it may not be used yet

        if (inline.adTitle) this.currentTitle = inline.adTitle;
        if (inline.description) this.currentDescription = inline.description;

        //may need to implement a proper ad plugin api for it

        //vast 2.0 doesn't have a concept of top level tracking, only tracking for each creative
        //var tracking = linline.ads[0]

        var video = inline.video;
        var companions = inline.companionAds;

        //according to the spec, we can't process impressions until a creative has been rendered
        var impressions = inline.impressions;

        this.currentImpressions = impressions;


        this.showCompanions(companions);


        //need to deal with non-linears (overlays)

        this.addOverlays(inline);


        //we do this last in case other stuff needs to handle the start of playback
        if (video)
        {
            //this also handles tracking events
            this.processMediaFiles(video);
            //don't do anything, need to use flash
        }
        else
        {
            //we should send back a playlist with the overlays, but the phase 1 pdk doesn't support that anyway
            this.controller.setAds(null);
        }
        


    },

    addOverlays:function(inLine)
    {
        if (inLine.nonLinearAds)
        {
            for (var i = 0; i < inLine.nonLinearAds.length; i++)
            {
                var nonLinearAd = inLine.nonLinearAds[i];
                var overlay = new Object();

                overlay.guid = nonLinearAd.id;

				overlay.globalDataType = "com.theplatform.pdk.data::Overlay";

                if (nonLinearAd.staticResource)
                {
                    overlay.url = nonLinearAd.staticResource;
                }
                else if (nonLinearAd.iFrameResource)
                {
                    overlay.url = nonLinearAd.iFrameResource;
                }


                if (nonLinearAd.nonLinearClickThrough != null) overlay.href = nonLinearAd.nonLinearClickThrough;
                overlay.bannerHeight = nonLinearAd.height;
                if (nonLinearAd.creativeType != null) overlay.bannerType = nonLinearAd.creativeType;
                overlay.stretchToFit = nonLinearAd.scalable;
                if (nonLinearAd.url != null) overlay.src = nonLinearAd.url;
                overlay.bannerWidth = nonLinearAd.width;

                if (nonLinearAd.maintainAspectRatio)
                {
                    overlay.maintainAspectRatio;
                }


                if (this.currentOverlays == null)
                {
                    this.currentOverlays = new Array();
                }
                this.currentOverlays.push(overlay);
            }
        }


    },

    showCompanions:function(ads)
    {

        //we should really have an api for this, right now it's hardcoded to the id for our default html5 canvas
        //actually, we need for the element id to be the same as the id in the companion tag4

        if (!this.bannerImg)
        {

            var banner300x60 = document.getElementById("comp_300x60");
            if (banner300x60)
            {
                this.bannerLink = document.createElement("a");
                this.bannerImg = document.createElement("img");
                this.bannerLink.appendChild(this.bannerImg);
                banner300x60.appendChild(this.bannerLink);
            }
            else
            {
                return;
            }
        }

        for (var i = 0; i < ads.length; i++)
        {
            if (ads[i].staticResource && ads[i].height == 60 && ads[i].width == 300)
            {
                if (ads[i].staticResource)
                {
                    this.bannerImg.src = ads[i].staticResource;
                }
                else if (ads[i].iFrameResource)
                {
                    //we're probably wanting to pop up an iframe in this case?
                    this.bannerImg.src = ads[i].iFrameResource;
                }

                //what about click?
                this.bannerLink.href = ads[i].companionClickThrough;
                this.bannerLink.target = "_blank";

                tpDebug("banner loaded, sending impressions", this.controller.id, "VAST");
                //spec says we can send impressions as soon as one creative has been loaded
                this.sendImpressions();

                break;


            }
        }

        //TODO: this shouldn't be hard-coded, we should let the developer choose the proper size

    },

    done: function()
    {

        //this.hidePlugin();
        this.removeAllOverlays();
        //this.controller.dispatchEvent("OnMediaEnd", this.currentClip);
    },



    //"private"/util type functions

    isVastUrl:function(checkURL)
    {
        if (!checkURL||!this.hosts||this.hosts.length===0) return false;

        for (var i = 0; i < this.hosts.length; i++)
        {
            if (checkURL.match(this.hosts[i]))
            {
                return true;
            }
        }

        return false;
    },

    JSONHandler:function(json)
    {

        var result = tpVastParser.parse(json);

        //now we have our json, let's play the actual ad

        //TODO: need to fix this to proccess the ad first, inline is lower down

        this.processAd(result.ads[0]);

    }

});

var vastPlugIn = new VastPlugIn();
tpController.plugInLoaded(vastPlugIn, vastPlugIn.container);
