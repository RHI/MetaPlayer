$pdk.ns("$pdk.plugin.OmniturePlugin");
$pdk.plugin.OmniturePlugin = $pdk.extend(function(){},
{
	OMNITURETRACKINGMONITOR : "omnitureTrackingMonitor",
	OMNITURETRACKINGEVENT : "OnOmnitureTracking",

    //member var for player reference
    _player: null,

    _isPaused: false,

    constructor : function() {
    },

    initialize: function(loadObj) {


        this.controller = loadObj.controller;

		this._player = this.controller.component;

        //according to spec, default is 25
        this.frequencyPercent = 0;
        //according to spec, default is 5
        this.frequencySeconds = 0;
        this.loadObj = loadObj;

        var omnitureJsUrl = loadObj.vars.hasOwnProperty("omnitureJsUrl") ? loadObj.vars["omnitureJsUrl"] : "../../pdk/js/omniture.sitecatalyst.js";

        if (loadObj.vars.hasOwnProperty("pageName")) {
            omPageName = loadObj.vars["pageName"];
        }

        else if (loadObj.vars.hasOwnProperty("pagename")) {
            omPageName = loadObj.vars["pagename"];
        }


        if (loadObj.vars.hasOwnProperty("pageUrl")) {
            omPageUrl = loadObj.vars["pageUrl"];
        }

        else if (loadObj.vars.hasOwnProperty("pageurl")) {
            omPageUrl = loadObj.vars["pageurl"];
        }
        var me = this;

		if (loadObj.vars["host"])
        {
            s_trackingServer = loadObj.vars["host"];
        }
        if (loadObj.vars["visitorNamespace"])
        {
            s_visitorNamespace = loadObj.vars["visitorNamespace"];
        }
		
        tpLoadScript(omnitureJsUrl, function() {

            if (omniturescriptloaded)
                return;

            omniturescriptloaded = true;

            //this shouldn't be needed, but sometimes IE9 screws up and s isn't defined yet
            if (s===undefined)
                s={};
            else
                s.loadModule("Media");

            // universal actionSource settings

            s.pageName = omGetPageName();
            s.pageURL = omGetPageUrl();
            s.charSet = "UTF-8";
            s.currencyCode = "USD";
            s.trackClickMap = false;
            s.movieID = "";
			s.monitor = function(appMeasurement, media)
			{
				me.monitor(appMeasurement, media);
			};

            // parse all properties
            var loadObj = me.loadObj;

            for (loadVar in loadObj.vars) {

                tpDebug(loadVar + "=[" + loadObj.vars[loadVar] + "]");

                switch (loadVar) {
                    case "host":
                        //s.trackingServer = loadObj.vars[loadVar];
                        break;

                    case "secureHost":
                        //s.trackingServerSecure = loadObj.vars[loadVar];
                        break;

                    case "debug":
                        s.debugTracking = loadObj.vars[loadVar] == "true";
                        s.trackLocal = loadObj.vars[loadVar] == "true";
                        break;

                    case "trackVars":
                        s.Media.trackVars = loadObj.vars[loadVar];
                        break;

                    case "trackEvents":
                        s.Media.trackEvents = loadObj.vars[loadVar];
                        break;

                    case "frequency":
                        me.frequency = loadObj.vars[loadVar];
                        if(typeof(me.frequency) === "string")
                        {
                            if (me.frequency.indexOf("%") == me.frequency.length - 1)
                            {
                                me.frequencyPercent = Number(me.frequency.substr(0, me.frequency.length - 1));
                                if (isNaN(me.frequencyPercent))
                                {
                                    me.frequencyPercent = 25;
                                }
                            }
                            else
                            {
                                me.frequencySeconds = Number(me.frequency);
                                if (isNaN(me.frequencySeconds))
                                {
                                    me.frequencySeconds = 5;
                                }
                                if (me.frequencySeconds < 5)
                                {
                                    tpDebug("Omniture doesn't support a frequency less than 5 seconds; snapping to 5");
                                }
                            }
                        }
                        break;

                    // handles "dc", "account", "visitorNamespace", "Media.x", and any "eVarN" and "propN"

                    default:
                        if (loadVar.indexOf("Media.") == 0) {
                            var subLoadVar = loadVar.substring(6);
                            s.Media[subLoadVar] = loadObj.vars[loadVar];
                        }
                        else {
                            s[loadVar] = loadObj.vars[loadVar];
                        }
                }

                omPageName = s.pageName;
                omPageUrl = s.pageURL;
            }



		// configure Omniture to send tracking information while playing,
		// to deal with cases where people end clips prematurely.
		if (me.frequencyPercent != 0)
		{
			s.Media.trackWhilePlaying = true;
			var milestone = me.frequencyPercent;
			var milestones = "";
			while (milestone < 100)
			{
				milestones += (milestones.length > 0 ? "," : "") + milestone.toString();
				milestone += me.frequencyPercent;
			}
			s.Media.trackMilestones = milestones;
		}
		else if (me.frequencySeconds != 0)
		{
			s.Media.trackWhilePlaying = true;
			s.Media.trackSeconds = me.frequencySeconds;
		}

            var VERSION = "1.4";

            tpDebug("*** OmnitureMedia PLUGIN LOADED *** version:[" + VERSION + "]");
            tpDebug("account=[" + s.account + "] visitorNamespace=[" + s.visitorNamespace + "] dc=[" + s.dc + "] pageName=[" + s.pageName + "] pageURL=[" + s.pageURL + "] debug=[" + s.debugTracking + "] frequency=[" + me.frequency + "] host=[" + s.trackingServer + "]");


            // only send unfinished track records if we're not doing tracking while playing
            // note that this will register as a page view, which might overcount things


		// only send unfinished track records if we're not doing tracking while playing
		// note that this will register as a page view, which might overcount things
		if (!me.frequencyPercent && me.frequencySeconds <= 0)
		{
			tpDebug("Calling track() to send any unclosed sessions");
			s.t();
		}
            me.loadComplete();
        });


    }
    ,

    loadComplete: function() {


        var me = this; //need to grab context

        tpController.addEventListener("OnReleaseStart", function (e) {
            me.onReleaseStart(e)
        });

        tpController.addEventListener("OnMediaStart", function (e) {
            me.onMediaStart(e)
        });

        tpController.addEventListener("OnMediaPause", function (e) {
            me.onMediaPause(e)
        });

        tpController.addEventListener("OnMediaUnpause", function (e) {
            me.onMediaUnpause(e)
        });

        tpController.addEventListener("OnMediaEnd", function (e) {
            me.onMediaEnd(e)
        });

        tpController.addEventListener("OnMediaSeek", function (e) {
            me.onMediaSeek(e)
        });

	tpController.addEventListener(this.OMNITURETRACKINGEVENT, function(e) {
			me.onOmnitureTrackingEvent(e);
	});
    }
    ,


    onReleaseStart: function(e) {
	var playlist = e.data;
    },

	onMediaStart: function(e)
	{
		var clip = e.data,
		mediaLength = Math.floor((clip.baseClip.trueLength > 0 ? clip.baseClip.trueLength : clip.baseClip.releaseLength) / 1000),
		media =
		{
			name: this._clipTitle,
			timePlayed: 0,
			event: ""
		};

		this._clipTitle = "undefined";

		if (clip)
		{
			if (!clip.title)
			{
				this._clipTitle = (clip.isAd ? "Untitled Advertisement" : "Untitled Content");
			}
			else
			{
				this._clipTitle = clip.title;
			}
		}

		this.monitor(s, media, clip);

		if (mediaLength == 0)
		{
			tpDebug("Couldn't get clip media length");
		}

		if (clip.clipIndex == 0 || clip.isAd)
		{
			tpDebug("Media.open: chapter=[" + clip.clipIndex + " / " + this._chapters + "] title=[" + this._clipTitle + "] length=[" + mediaLength + "] player=[" + this._player.id + "]");
			s.Media.open(this._clipTitle, mediaLength, this._player.id);
		}
		this.onMediaUnpause(e);
	},

    onMediaPause: function(e) {

        var clip = e.data;

        if (!clip || !clip.baseClip)
            return; // do nothing if we don't have a valid clip

        var clipTitle = !clip.title ? clip.baseClip.title : clip.title;

        if (!clipTitle)
            return;

        var position = Math.floor(clip.currentMediaTime / 1000);

        tpDebug("Media.stop: title=[" + clipTitle + "]  position=[" + position + "]");

        s.Media.stop(clipTitle, position);

        this._isPaused = true;

    }
    ,


    onMediaUnpause: function(e) {

        var clip = e.data;


        // when the release ends while in paused state (ie, user hits forward button while the player

        // is paused), the player will send an onMediaUnpause event to "reset" the state for the next clip.

        // The result is a null clip in the payload. We should ignore this event.

		if (!clip || !clip.baseClip)
            return; // do nothing if we don't have a valid clip

        var clipTitle = !clip.title ? clip.baseClip.title : clip.title;

        if (!clipTitle)
            return;

        var position = Math.floor(clip.currentMediaTime / 1000);

        tpDebug("Media.play: title=[" + clipTitle + "]  position=[" + position + "]");

	try
	{
        	s.Media.play(clipTitle, position);
	}
	catch(e)
	{
	}

        this._isPaused = false;

    }
    ,


    onMediaEnd: function(e) {

        var clip = e.data;

        if (!clip || !clip.baseClip)
            return; // do nothing if we don't have a valid clip

        var clipTitle = !clip.title ? clip.baseClip.title : clip.title;

        if (!clipTitle)
            return;

        tpDebug("Media.close: title=[" + clipTitle + "]");

        if(typeof(clipTitle) === "string")
        {
                s.Media.close(clipTitle);
        }
    }
    ,


    onMediaSeek: function(e) {

        var position;

        var seekObj = e.data.clip;


        //var clipTitle = seekObj.baseClip.title;


        if (!this._isPaused) {


            //we don't have access to seekObj.start or end
//            position = Math.floor(seekObj.start.currentTimeAggregate / 1000);
//
//            tpDebug("Media.stop: (seek start) title=[" + clipTitle + "]  position=[" + position + "]");
//
//            s.Media.stop(clipTitle, position);
//
//
//            position = Math.floor(seekObj.end.currentTimeAggregate / 1000);
//
//            tpDebug("Media.play: (seek end) title=[" + clipTitle + "]  position=[" + position + "]");
//
//            s.Media.play(clipTitle, position);

        }

    },

	onOmnitureTrackingEvent: function(e) {
		var props = e.data;

		// copy eVars and props to AppMeasurement object
		for (var prop in props) {
			if (prop.toLowerCase().indexOf("evar")==0 || prop.toLowerCase().indexOf("prop")==0) {
				s[prop] = props[prop];
			}
		}

		// copy events
		s.events = props.events;
		tpDebug("Calling track() for custom OmnitureTrackingEvent");
		s.t();
	},

	monitor : function(appMeasurement, media, clip)
	{
		this.controller.callFunction(this.OMNITURETRACKINGMONITOR, [appMeasurement, media, clip]);
	}


})
        ;

//Non-OO stuff


// create an instance of the plugin and tell the controller we're ready.

// optionally you can pass a second param to add to the plugin's layer (any html element)

var omOmniturePlugin;

var omIsPaused;

var omPageName;

var omPageUrl;

//here we dynmically load the script required by omniture (maybe it should be a js module?)
omInitPlugin();

var omniturescriptloaded = false;

function omInitPlugin() {

    //script exists
    if (self.Omniture && self.s) {
        // callBack(loadObj);
        return;
    }

	if (window['useFlashPlayer']===undefined)
	{
		//it's gotta be false then..
		window.useFlashPlayer = function(){return false;};
	}


    //here we dynamically inject the omniture script tag
    if (navigator.appVersion.indexOf('MSIE') >= 0&&useFlashPlayer())
         document.write(unescape('%3C') + '\!-' + '-');

    //we create an instance here, after the script is ready

    omOmniturePlugin = new $pdk.plugin.OmniturePlugin();
    tpController.plugInLoaded(omOmniturePlugin);
}


function omGetPageName() {

    if (omPageName) {

        return omPageName;

    } else {

        try {

            return document.title;

        }

        catch (e) {

            tpDebug("unable to determine page name, JS access not available.");

        }

        return "Unknown";

    }

}


function omGetPageUrl() {

    if (omPageUrl) {

        return omPageUrl;

    } else {

        try {

            return window.location.href;

        }

        catch (e) {

            tpDebug("unable to determine page url, JS access not available.");

        }

        return "Unknown";

    }

}
