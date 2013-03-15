
var alertOnce = false;

function tpExternal_WMP(swfId, controllerId)
{
	this.timer;
	this.offset = 0;
	this.duration = 0;
	this.position = 0;
	this.backupUrl = "";
	this.playTO;
	this.starting = true;
	this.playing = false;
	this.isHidden = false;
	this.isPaused = false;
	this.isPauseSeek = false;
	this.isClosed = true;
	this.isFullScreen = false;
	this.fullScreenInterval;
	this.swfId = swfId;
	this.controllerId = controllerId;
	this.WMPID = "tpWMP_" + controllerId;
	this.WMPDivID = this.WMPID + "Div";
	this.WMP;//reference media player itself
	this.WMPDiv;//div inside which the media player rests
	this.WMPisInvalid = false;
		
	// dynamically resize an external media element... the top and left
	// deltas are adjustments on the current position
	this.resizeMP = function(args)
	{
		//tpDebug("resizeMP called");
		this.checkDiv();
		var height = args[1];
		var width = args[2];
		var leftDelta = args[3];
		var topDelta = args[4];
		var element = tpThisMovie(this.WMPID); 
		element.style.height = height + "px";
		element.style.width = width + "px";
		var offsetTop = tpGetTop(tpThisMovie(this.swfId));
		element.style.top = (offsetTop + topDelta) + "px";
		var offsetLeft = tpGetLeft(tpThisMovie(this.swfId));
		element.style.left = (offsetLeft + leftDelta) + "px";
		element.style.position = "absolute";
		//tpDebug("h: " + element.style.height + " w:" + element.style.width + " top:" + element.style.top + " left:" + element.style.left + " id:" + this.controllerId);
		this.WMP = element;
		
	}
	
	this.showDIV = function(args)
	{
		this.checkDiv();
		var isShown = args[0];
		if (isShown && this.isHidden)
		{
			this.isHidden = false;
			this.WMPDiv.style.visibility = "visible";
			//tpDebug("show");
		}
		else if(!isShown && !this.isHidden)
		{
			this.isHidden = true;
			this.WMPDiv.style.visibility = "hidden";
			//tpDebug("hide");
		}
		
	}
	
	this.stateChanged = function(playerState)
	{
		//tpDebug("stateChanged: " + playerState + " isClosed?" + this.isClosed + " id:" + this.controllerId);
		if (this.isClosed) return;
		switch(playerState)
		{
			case 0:
				// "undefined";
				this.clearTimer();
				break;
			case 1:
				// "Stopped";
				this.playing = false;
				this.report();
				if (!this.isPaused)
				{
					this.delayMessage("togglePause");//stop must have been called from the wmp
					this.isPaused = true;
				}
				this.clearTimer();
				break;
			case 2:
				// "Paused";
				this.playing = false;
				if (!this.isPaused)
				{
					this.delayMessage("togglePause");//pause was called from the wmp
					this.isPaused = true;
				}
				this.clearTimer();
				break;
			case 3:
				// "Playing";
				if(this.starting)
				{
					this.delayMessage("mediaBegins");
					this.starting = false;
				}
				else
				{
					if (this.WMP.controls.currentPosition < this.offset)
					{
						this.WMP.controls.currentPosition = this.offset;
					}
					this.offset = 0;
					this.delayMessage("playing");
				}
				if (!this.isPauseSeek) this.isPaused = false;
				this.runTimer();
				this.playing = true;
				clearTimeout(this.playTO);
				break;
			case 4:
				// "ScanForward";
				break;
			case 5:
				// "ScanReverse";
				break;
			case 6:
				// "Buffering";
				this.playing = true;
				this.delayMessage("buffering");
				clearTimeout(this.playTO);
				break;
			case 7:
				// "Waiting";
				break;
			case 8:
				// "Playbackdone";
				this.playing = false;
				this.clearTimer();
				this.isClosed = true;
				this.delayMessage("setPlayerDone");
				break;
			case 9:
				// "Transitioning";
				this.clearTimer();
				break;
			case 10:
				// "Ready";
				break;
			case 11:
				// "Reconnecting";
				this.clearTimer();
				break;
			default:
				this.clearTimer();
				// "invalid"
		}
	}
	
	this.delayMessage = function(message, url)
	{
		//tpDebug("send delay message: " + message + " url: " + this.WMP.URL);
        url = typeof(url) === "undefined" ? (this.WMP ? this.WMP.URL : "") : url;

		setTimeout("tpWMPSendDelayMessage('" + message + "', '" + this.swfId + "', '" + this.controllerId + "', ['" + url + "'] )", 1);
	}
	
	this.timedPlay = function ()
	{	
		if (this.WMP.status != 3 || this.WMP.status != 6 && this.backupUrl != "")
		{
			this.WMP.URL = this.backupUrl;
		}
	}
	
	// called from flash handle setting the URL in Windows Media Player
	this.playURL = function(args)
	{
		var url = args[0];
		if (url == undefined) return;

        this.delayMessage("acknowledge", url);//send acknowledge so it doesn't time out if the player takes a while

        this.checkDiv();
        if (this.WMPisInvalid)
		{
			alert("This clip is a Windows Media clip, and playback is not supported with your current combination of browser and operating system. Windows Media can only be played with Microsoft Internet Explorer, running on Microsoft Windows.")
			this.delayMessage("mediaError", url);
			return;
		}
		//tpDebug("play URL::" + url);

	    this.isClosed = false;
		this.backupUrl = url;
		this.WMP.URL = url;
		this.starting = true;
		this.isPaused = false;
		this.setFSCheck(true);
		
		if (args[1])
		{
			this.offset = args[1] / 1000;//convert to seconds
			//tpDebug("setting to offset " + this.offset);
			this.WMP.controls.currentPosition = this.offset;
		}
		
		//this.setFSCheck(true);
		if (this.isHidden)
		{
			this.showDIV([true]);
		}
		
	}
	
	
	// handle seek in Windows Media Player
	this.seek = function(args)
	{
		var seekPos = args[0];
		//tpDebug("seek to: " + seekPos)
		this.WMP.controls.currentPosition = seekPos;
		if(!this.playing)
		{
			this.isPauseSeek = true;
			this.WMP.controls.play();
			setTimeout("tpWMPCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'pausedSeek')", 1);
		}
		
	}
	
	this.pausedSeek = function()
	{
		this.isPauseSeek = false;
		this.report();
		if (this.WMP.controls.isAvailable("Pause"))
		{
			this.WMP.controls.pause();
		}
		else
		{
			this.WMP.controls.stop();
		}
	}
	
	this.runTimer = function()
	{
		this.clearTimer();
		this.timer = setInterval("tpWMPCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'report')", 500);
	}
	
	this.clearTimer = function()
	{
		clearInterval(this.timer);
	}
	
	this.report = function()
	{
		if(this.WMP.currentMedia != null)
		{
			this.duration = this.getDuration();
			this.position = this.getPosition();
			tpExternalController.returnMessage(this.swfId, this.controllerId, "synchPosition", [this.WMP.URL, this.duration, this.position]);
		}
	}
	
	this.getDuration = function()
	{
		if(this.WMP.currentMedia.duration > 0)
		{
			return this.WMP.currentMedia.duration;
		}
		
	}
	
	this.getPosition = function()
	{
		return this.WMP.controls.currentPosition;
	}
	
	this.closePlayer = function(args)
	{
		//tpDebug("closing player playing? " + this.playing + " temp: " + args[0]);
		this.isClosed = true;
		if (this.playing)
		{
			this.WMP.controls.stop();
			this.playing = false;
		}
		this.backupUrl = "";
		this.clearTimer();
		var temp = args[0];
		if (temp)
		{
			this.setFSCheck(false);
		}
		//tpDebug("hide : " + !this.isHidden);
		if (!this.isHidden)
		{
			this.showDIV([false]);
		}
	}
	
	
	this.pauseMovie = function(args)
	{
		var state = args[0];
		//tpDebug("pause!!! " + state);
		if(state)
		{
			this.isPaused = true;
			if (this.WMP.controls.isAvailable("Pause"))
			{
				this.WMP.controls.pause();
			}
			else
			{
				this.WMP.controls.stop();
			}
		}
		else
		{
			this.isPaused = false;
			this.WMP.controls.play();
		}
	}
	
	this.setSoundLevel = function(args)
	{
		var level = args[0];
		this.WMP.settings.volume = level;
		//tpDebug("setting sound level: " + level + " set? " + this.WMP.settings.volume);
	}
	
	this.mutePlayer = function(args)
	{
		var isMute = args[0];
		this.WMP.settings.mute = isMute;
		//tpDebug("setting mute: " + isMute + " set? " + this.WMP.settings.mute );
	}
	
	this.fullScreen = function(args) 
	{
		if (!this.WMP || (this.WMP.playState < 2 && this.WMP.playState > 6)) return;//ignore fullscreen if we're in a non-play state
		var isFull = args[0];
		if (isFull)
		{
			this.WMP.uiMode = "mini";
			this.WMP.fullScreen = true;
			this.delayMessage("fullScreenOn");
			this.isFullScreen = true;
		}
		else
		{
			this.WMP.uiMode = "none";
			this.WMP.fullScreen = false;
			this.delayMessage("fullScreenOff");
			this.isFullScreen = false;
		}
	}
	
	this.setFSCheck = function(start)
	{
		clearInterval(this.fullScreenInterval);
		if (start)
		{
			this.fullScreenInterval = setInterval("tpWMPCallFunction('" + this.swfId + "', '" + this.controllerId + "', 'checkFullScreen')", 300);
		}
	}
	
	this.checkFullScreen = function()
	{
		if (this.WMP.fullScreen != this.isFullScreen)
		{
			if (this.WMP.fullScreen)
			{
				//probably can't do anything about uiMode, the user must have double-clicked on the player, or used the right-click menu
				this.delayMessage("fullScreenOn");
			}
			else
			{
				this.delayMessage("fullScreenOff");
				this.WMP.uiMode = "none";
			}
			this.isFullScreen = this.WMP.fullScreen;
		}
	}
	
	this.cleanup = function()
	{
		if (this.WMPDiv)
		{
			if (this.WMP) this.closePlayer();
			this.WMPDiv.innerHTML = "";
			window.document.getElementsByTagName('body')[0].removeChild(this.WMPDiv);
		}
	}
	
	this.attachWMP = function()
	{
		if (this.checkValid())
		{
			var playercode = '<OBJECT ID="' + this.WMPID + '" WIDTH="100%" HEIGHT="100%" CODEBASE="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,5715" TYPE="application/x-oleobject" STANDBY="Loading Microsoft Windows Media Player components..." CLASSID="CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6">' +
			'<PARAM NAME="AutoSize" VALUE="1" />' +
			'<PARAM NAME="StretchToFit" VALUE="1" />' +
			'<param name="SendPlayStateChangeEvents" VALUE="true">' + 
			'<param name="AutoSize" value="false">' + 
			'<param name="uiMode" value="none" />' +
			'<param name="Autostart" value="1" />' +
			'<param name="Loop" value="False" />' +
			'</OBJECT>'
			//set up callback methods
			playercode += '<SCR' + 'IPT ID="tpWMPEvent" LANGUAGE = "../pdk/jscript"  FOR = "' + this.WMPID + '" EVENT = "PlayStateChange(NewState)">\n';
			playercode += 'var id = "' + this.controllerId + '";';
			playercode += 'var swfId = "' + this.swfId + '";';
			playercode += 'tpWMPStateChanged(NewState, id, swfId);';
			playercode += '</SCR' + 'IPT>';
			this.WMPDiv.innerHTML = playercode;
		}
		else
		{
			this.WMPisInvalid = true;
		}
	}
	
	this.checkValid = function()
	{
		var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
		var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
		return isIE && isWin;
	}
	
	this.checkDiv = function()
	{
		// create the div
		if (!this.WMPDiv)
		{
			//code to create the player div
			var divEl = window.document.createElement('div');
			divEl.id = this.WMPDivID;
			window.document.getElementsByTagName('body')[0].appendChild(divEl);
			this.WMPDiv = tpThisMovie(this.WMPDivID);

			// set the default positioning
			this.WMPDiv.style.position = "absolute";
			this.WMPDiv.style.top = "0px";
			this.WMPDiv.style.left = "0px";

			this.attachWMP();

			this.showDIV([false]);//make sure it isn't visible at startup	
		}
	
	}
	
	
}

//all the functions are set up, register with utils.js
tpExternalController.registerExternalPlayer("windowsMedia", "tpExternal_WMP");

function tpWMPCallFunction(swfId, id, funcName, params)
{
	tpExternalController.routeMessage(swfId, id, "windowsMedia", funcName, params);
}

function tpWMPStateChanged(playerState, id, swfId)
{
	tpExternalController.routeMessage(swfId, id, "windowsMedia", "stateChanged", playerState);
}

function tpWMPSendDelayMessage(message, swfId, id, params)
{
	tpExternalController.returnMessage(swfId, id, message, params);
}


