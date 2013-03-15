

var alertOnce = false;


function tpExternal_SMF(swfId, controllerId)
{

	this.timer;
    this.offset = 0;
	this.duration = 0;
	this.position = 0;
	this.url = "";
	this.playTO;
    this.slLoaded = false;
	this.starting = true;
	this.playing = false;
	this.isHidden = false;
	this.isPaused = false;
	this.isClosed = true;
	this.isFullScreen = false;
    this.isBuffering = false;
    this.useNativeControls = false;
    this.customData;
	this.swfId = swfId;
	this.controllerId = controllerId;
	this.SMFID = "tpSMF_" + controllerId;
	this.SMFDivID = this.SMFID + "Div";
    this.SMFBridgeID = this.SMFID + "_bridge"
	this.SMF;//reference media player itself
	this.SMFDiv;//div inside which the media player rests
	this.SMFisInvalid = false;
	this.instanceID = Math.random() * 10000;
    this.startLoadTime = 0;
    this.isLive = false;
    this.liveStartTime = -1;
    this.pauseTimeout = null;

    this.visibleRect;
    this.hiddenRect = [null, 2, 2, 1, 1];

    eval(this.SMFBridgeID + " = this");

	// dynamically resize an external media element... the top and left

	// deltas are adjustments on the current position

	this.resizeMP = function(args)
	{
	    //tpDebug("resizeMP called", "tpExternalSMF", this.SMFID);
		this.checkDiv();
		var height = args[1];
		var width = args[2];
		var leftDelta = args[3];
		var topDelta = args[4];
		var element = tpThisMovie(this.SMFDivID);
		element.style.height = height + "px";
		element.style.width = width + "px";
		var offsetTop = tpGetTop(tpThisMovie(this.swfId));
		element.style.top = (offsetTop + topDelta) + "px";
		var offsetLeft = tpGetLeft(tpThisMovie(this.swfId));
		element.style.left = (offsetLeft + leftDelta) + "px";
        if (args[0] == "windowsMedia") this.visibleRect = args;
		element.style.position = "absolute";
		tpDebug("h: " + element.style.height + " w:" + element.style.width + " top:" + element.style.top + " left:" + element.style.left + " id:" + this.controllerId, "tpExternalSMF", this.SMFID);

	};


    this.init = function(args)
    {

        this.slLoaded = true;
        var smfEl = tpThisMovie(this.SMFID);
        this.SMF = smfEl.content["PDKSMF"];

        //handle any queued requests?

        if (this.starting && this.url)
        {
            this.startPlay();
        }
    };

	

	this.showDIV = function(args)
	{
		this.checkDiv();
		var isShown = args[0];
		if (isShown && this.isHidden)
		{
			this.isHidden = false;
			this.resizeMP(this.visibleRect)
			tpDebug("show", "tpExternalSMF", this.SMFID);
		}
		else if(!isShown && !this.isHidden)
		{
			this.isHidden = true;
            this.SMFDiv.style.left = "-2000px";
			if (this.SMF) this.startCheckFS();
			tpDebug("hide", "tpExternalSMF", this.SMFID);
		}
	};

    this.startCheckFS = function()
    {
        setTimeout("tpSMFCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'checkFS', [])", 100);
    };

    this.checkFS = function()
    {
        if (this.isFullScreen)
        {
            //if the media is still hidden, then it must not be playing it's own type
            this.SMF.CloseFullScreen();
        }
    };



    //SL Player Events

    this.onVideoInit = function (totalDur)
    {
        tpDebug("onVideoInit=> totalDuration:" + totalDur, "tpExternalSMF", this.SMFID);
        var totalDuration = this.isLive ? -1 : totalDur;
        var currentTime = new Date().valueOf();
        if (this.isLive) this.liveStartTime = currentTime;
        this.delayMessage("currentBitrate", [this.SMF.CurrentBitrate]);
        this.delayMessage("mediaBegins", [totalDuration, (currentTime - this.startLoadTime)]);
		this.starting = false;
        this.runTimer();
    };

    this.onStateChange = function (state)
    {
        tpDebug("onStateChange: " + state, "tpExternalSMF", this.SMFID);
        switch (state)
        {

            case "Opening":
            case "Buffering":
                this.playing = true;
                this.isBuffering = true;
				this.delayMessage("buffering");
                break;

            case "Playing":
                if(!this.starting && this.isBuffering)
				{
					this.offset = 0;
                    if (this.isBuffering)
                    {
                        this.delayMessage("playing");
                    }
				}
                if (this.isPaused)
                {
                    this.isPaused = false;
                    this.delayMessage("togglePause");
                }

		        this.playing = true;
                this.runTimer();

                //to fix a bug with some content not playing after a second resume
                this.resumeFix();
                break;

            case "Paused":
                this.clearPauseTimeout();
                this.pauseTimeout = setTimeout("tpSMFCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'pauseBeforeEndFix', [])", 50)
                break;

            case "Closed":
            case "Stopped":
                this.clearPauseTimeout();
                this.playing = false;
				this.report();
				this.clearTimer();
                break;

            case "Individualizing":
            case "AcquiringLicense":
                this.delayMessage("initializing", ["suspend"]);
                break;

            case "ClipPlaying":

                break;

            default:

                //do nothing, shouldn't be hit

        }

    };

    this.pauseBeforeEndFix = function()
    {
        if (!this.isPaused)
        {
            this.delayMessage("togglePause");//pause was called from the SMF
            this.isPaused = true;
        }

        this.clearTimer();
    };

    this.clearPauseTimeout = function()
    {
        if (this.pauseTimeout)
        {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }
    };

    this.resumeFix = function ()
    {
        //put a bit of work into finding the minimum interval possible without getting a false positive: 300
        setTimeout("tpSMFCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'checkResumeFix', [" + this.SMF.CurrentTime + "])", 300);
    };

    this.checkResumeFix = function(args)
    {

        if (!this.playing || this.isClosed) return;//just ignore

        var lastTime = args[0];
        if (lastTime == this.SMF.CurrentTime)//give it a little kick, it isn't moving
        {
            tpDebug("SMF is not continuing after resume, kick it with a seek call", "tpExternalSMF", this.SMFID);
            this.SMF.Seek(lastTime);
        }
    };

    this.onVideoFailed = function (errorMessage)
    {

        tpDebug("onVideoFailed: " + errorMessage, "tpExternalSMF", this.SMFID);
        this.delayMessage("mediaError", [errorMessage]);
    };

    this.onVolumeChange = function (vol)
    {
        tpDebug("onVolumeChange: " + vol, "tpExternalSMF", this.SMFID);
    };

    this.onBitrateChange = function (bitRate)
    {
        tpDebug("onBitrateChange: " + bitRate + "bps", "tpExternalSMF", this.SMFID);
        this.delayMessage("currentBitrate", [bitRate]);
    };

    this.onMute = function (isMute)
    {
        tpDebug("onMute: " + isMute, "tpExternalSMF", this.SMFID);
    };

    this.onSeek = function (position)
    {
        tpDebug("onSeek: " + position, "tpExternalSMF", this.SMFID);
        this.report();

    };

    this.onMediaEnd = function ()

    {

        tpDebug("onMediaEnd", "tpExternalSMF", this.SMFID);

        this.playing = false;

	    this.clearTimer();

        this.isClosed = true;

        this.delayMessage("setPlayerDone");

    };

    this.onFullScreen = function (isFullScreen)
    {
        tpDebug("fullScreen: " + isFullScreen, "tpExternalSMF", this.SMFID);
        this.isFullScreen = isFullScreen;
        if (isFullScreen)
        {
            this.delayMessage("fullScreenOn");
        }
        else
        {
            this.delayMessage("fullScreenOff")
        }

    };

	this.delayMessage = function(message, args)
    {
	    var argParams = [];
        argParams.push(this.url);
        if (args) argParams = argParams.concat(args);
        var argParamStr = "['" + argParams.join("','") + "']";

        tpDebug("send delay message: " + message + " args:" + argParamStr);

		setTimeout("tpSMFSendDelayMessage('" + message + "', '" + this.swfId + "', '" + this.controllerId + "', " + argParamStr + " )", 1);
	};

	

	// called from flash handle setting the URL in Windows Media Player
	this.playURL = function(args)
	{
		var url = args[0];
		if (url == undefined) return;

		this.isClosed = false;
		this.url = url;//this.url has to be set before this.checkDiv;

        this.checkDiv();

        tpDebug("playURL:" + this.url, "tpExternalSMF", this.SMFID);
        this.starting = true;
		this.isPaused = false;

        if (args[1])
		{
			this.offset = args[1];//convert to seconds
		}

        if (args[2])
        {
            this.customData = args[2];
        }
        else
        {
            this.customData = null;
        }

        this.useNativeControls = this.checkUseNativeControls(this.url);

        this.delayMessage("acknowledge", [(this.useNativeControls ? "useNativeControls" : "usePDKControls"), "disableFullScreen"]);//send acknowledge so it doesn't time out if the player takes a while

        if (this.slLoaded)
        {
            this.startPlay();
        }

	};

    this.startPlay = function()
    {
        if (this.isHidden)
        {
            this.showDIV([true]);
        }

        this.SMF.SetControlsVisible(this.useNativeControls);
        this.SMF.Controls = "Timeline,FullScreenToggle,Volume";//TODO: set from default array

        this.parseCustomData(this.customData);

        this.startLoadTime = (new Date()).valueOf();
        this.isLive = this.url.toLowerCase().indexOf("isml/manifest") > 0 ? true : false;

        this.SMF.Source = this.url;
        if (this.offset > 0) this.SMF.Seek(this.offset);
    };

    this.checkUseNativeControls = function(url)
    {
        //ignore the url now, we're just getting the value from the customData
        return this.customData ? this.customData["useNativeControls"] : false;
    };

    this.parseCustomData = function(data)
    {
        var licenseServer = data ? data["licenseServer"] : "";
        var auth = data ? data["token"] : "";
        var accountId = data ? data["accountId"] : "";
        var releasePids = data ? data["pid"] : "";
        if (licenseServer)
        {
            this.SMF.LicenseServer = licenseServer;
        }
        else
        {
            this.SMF.LicenseServer = "";
        }
        var customDataStr= "schema=1.0 ";
        if (auth) customDataStr += "auth=" + auth + " ";
        if (accountId) customDataStr += "account=" +  accountId + " ";
        if (releasePids) customDataStr += "releasePid=" + releasePids;
        if (customDataStr != "")
        {
            this.SMF.CustomData = customDataStr;
        }
        else
        {
            this.SMF.CustomData = "";
        }

    };
    

	this.seek = function(args)
    {
		var seekPos = args[0] * 1000;
		tpDebug("seek to: " + seekPos, "tpExternalSMF", this.SMFID);
        if (this.slLoaded)
        {
            this.SMF.Seek(seekPos);
        }
	};

	this.runTimer = function()
	{
		this.clearTimer(true);
        tpDebug("runTimer", "tpExternalSMF", this.SMFID);
		this.timer = setInterval("tpSMFCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'report')", 500);
	};

	this.clearTimer = function(internal)
	{
		if (!internal) tpDebug("clearTimer", "tpExternalSMF", this.SMFID);
        clearInterval(this.timer);
	};

	this.report = function()
	{
        var duration = this.isLive ? -1 : this.SMF.TotalTime/1000;
        var position = this.isLive ? (new Date().valueOf() - this.liveStartTime)/1000 : this.SMF.CurrentTime/1000;
        var url = this.SMF.Source;

        if(url && duration !== 0)
		{
            tpExternalController.returnMessage(this.swfId, this.controllerId, "synchPosition", [url, duration, position]);
		}

	};

    this.closePlayer = function (args)
    {
        tpDebug("closing player playing? " + this.playing + " temp: " + args[0], "tpExternalSMF", this.SMFID);
	    this.isClosed = true;
        this.isLive = false;
        this.liveStartTime = -1;

	    if (this.playing)
        {
	        this.SMF.Source = "";
	        this.playing = false;
	    }

	    this.url = null;

	    this.clearTimer();
	    //tpDebug("hide : " + !this.isHidden);

	    if (!this.isHidden)
        {
	        this.showDIV([false]);
	    }
	};

	this.pauseMovie = function(args)
	{
		var state = args[0];
		tpDebug("pause!!! " + state, "tpExternalSMF", this.SMFID);
	    this.isPaused = state;
		if(state)
		{
			this.SMF.Pause();
		}
		else
		{
			this.SMF.Play();
		}

	};

	this.setSoundLevel = function(args)
	{
		var level = args[0];
		this.SMF.Volume = level/100;
	};

	this.mutePlayer = function(args)
	{
		var isMute = args[0];
		this.SMF.Mute = isMute;
	};

	this.fullScreen = function(args)
	{
	    var isFull = args[0];
        if (!isFull)
        {
            this.SMF.CloseFullScreen();
        }//ignore true, we can't go full screen externally
	};

	this.cleanup = function()
	{
		if (this.SMFDiv)
		{
			if (this.SMF) this.closePlayer();
			this.SMFDiv.innerHTML = "";
			window.document.getElementsByTagName('body')[0].removeChild(this.SMFDiv);
		}
	};

	this.attachSMF = function()
	{
        var sr = typeof($pdk) !== "undefined" ? $pdk.scriptRoot : (typeof(tpPdkBaseDirectory) !== undefined ? tpPdkBaseDirectory : "");
        if (sr !== "" && sr.charAt(sr.length -1) !== "/") sr += "/";
        var playercode = '<object id="' + this.SMFID + '" name="' + this.SMFID + '" data="data:application/x-silverlight-2," type="application/x-silverlight-2" width="100%" height="100%">' +

		  '<param name="source" value="' + sr  + 'xap/PDKSMF.xap"/>' +

		  '<param name="onError" value="tpSilverLightError" />' +

          '<param name="onLoad" value="tpInitSMFBridge" />' +

		  '<param name="background" value="white" />' +

		  '<param name="minRuntimeVersion" value="5.0.61118.0" />' +

		  '<param name="autoUpgrade" value="true" />' +

          '<param name="initParams" value="swfId=' + this.swfId + ',controllerId=' + this.controllerId + ',bridge=' + this.SMFBridgeID + '"/>' +

		  '<a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=5.0.61118.0" style="text-decoration:none">' +

 			  '<img src="http://go.microsoft.com/fwlink/?LinkId=161376" alt="Get Microsoft Silverlight" style="border-style:none"/>' +

		  '</a>';
        this.SMFDiv.innerHTML = playercode;

	};

	this.checkDiv = function () {
	    // create the div
	    if (!this.SMFDiv) {
	        //code to create the player div
	        var divEl = window.document.createElement('div');
	        divEl.id = this.SMFDivID;
	        window.document.getElementsByTagName('body')[0].appendChild(divEl);
	        this.SMFDiv = tpThisMovie(this.SMFDivID);

	        // set the default positioning
	        this.SMFDiv.style.position = "absolute";
	        this.SMFDiv.style.top = "0px";
	        this.SMFDiv.style.left = "0px";
	        this.SMFDiv.style.zIndex = "100";

	        this.attachSMF();

	        this.showDIV([false]); //make sure it isn't visible at startup
	    }

	};


}
//all the functions are set up, register with utils.js
tpExternalController.registerExternalPlayer("windowsMedia", "tpExternal_SMF");

function tpSMFCallFunction(swfId, id, funcName, params)
{
    tpExternalController.routeMessage(swfId, id, "windowsMedia", funcName, params);
}

function tpSMFSendDelayMessage(message, swfId, id, params)
{
	tpExternalController.returnMessage(swfId, id, message, params);
}

function tpSilverlightError(sender, args)
{
    var appSource = "";
    if (sender != null && sender != 0) {
      appSource = sender.getHost().Source;
    }

    var errorType = args.ErrorType;
    var iErrorCode = args.ErrorCode;

    if (errorType == "ImageError" || errorType == "MediaError") {
      return;
    }

    var errMsg = "Unhandled Error in Silverlight Application " +  appSource + "\n" ;

    errMsg += "Code: "+ iErrorCode + "    \n";
    errMsg += "Category: " + errorType + "       \n";
    errMsg += "Message: " + args.ErrorMessage + "     \n";

    if (errorType == "ParserError") {
        errMsg += "File: " + args.xamlFile + "     \n";
        errMsg += "Line: " + args.lineNumber + "     \n";
        errMsg += "Position: " + args.charPosition + "     \n";
    }
    else if (errorType == "RuntimeError") {
        if (args.lineNumber != 0) {
            errMsg += "Line: " + args.lineNumber + "     \n";
            errMsg += "Position: " +  args.charPosition + "     \n";
        }
        errMsg += "MethodName: " + args.methodName + "     \n";
    }

    tpDebug(errMsg, "tpExternalPlayerSMF", appSource)
}

function tpInitSMFBridge(sender)
{
    var host = sender.getHost();
    var initParams = {};
    var ip = host.InitParams;
    var ipArr = ip.split(",");
    for (var i = 0; i < ipArr.length; i++)
    {
        var initString = ipArr[i];
        var paramArr = initString.split("=");
        initParams[paramArr[0]] = paramArr[1];
    }
    var swfId = initParams["swfId"];
    var controllerId = initParams["controllerId"];
    tpExternalController.routeMessage(swfId, controllerId, "windowsMedia", "init", [initParams])

}
