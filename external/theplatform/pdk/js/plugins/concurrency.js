//opted to go with pure javascript prototypal inheritence, to avoid depending on a particular framework for inheritence
ConcurrencyPlugIn = function(){}

ConcurrencyPlugIn.prototype.initialize = function(loadObj)
{
	
	this.controller = loadObj.controller;
	
	this.priority = loadObj.priority;

	var randStr = [Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)].join("");

	this.clientId = this.controller.id+randStr;
	
	this.isReady = false;

    this.isBeating = false;
    this.heartBeat = 0;
    this.lockId = "";
    this.lockSequenceToken = "";
    this.lock = "";

    this.heartBeatInterval;
	
	try
	{
		this.controller.registerMetadataUrlPlugIn(this, this.priority);

	}
	catch(e)
	{
		tpDebug("WARN: couldn't register ConcurrencyPlugIn: " + e.message);
	}


	var me=this;
	var doneListener = function()
	{
		this.isReady = true;
		$pdk.platformConcurrency.removeEventListener("OnReady",doneListener);
		me.continueInitialize(loadObj);
	}
	
	//this will need to change if we make a bootloader thing...it'd need to add the eventlistener because the symbols will always exist
	//just may not be ready yet
	if ($pdk.platformConcurrency !== null && typeof($pdk.platformConcurrency) === "object")
	{
		if($pdk.platformConcurrency.isReady)
		{
			doneListener();
		}
		else
		{
			$pdk.platformConcurrency.addEventListener("OnReady",doneListener);
		}
	}
	else
	{
		tpLoadScript(tpGetScriptPath()+"/libs/concurrency/platformConcurrency.js",function(){
        		$pdk.platformConcurrency.addEventListener("OnReady",doneListener);
		});
	}
	
	setTimeout(function()
	{
		if (!me.isReady&&me.lastUnhandledRewriteUrl)
		{
			me.controller.setMetadataUrl(me.lastUnhandledRewriteUrl);
			me.lastUnhandledRewriteUrl = undefined;
		}
	},15000);//wait 15 secs for it to load, if not, timeout
	
}

ConcurrencyPlugIn.prototype.continueInitialize = function(loadObj)
{
	this.isReady = true;
	
	var me=this;
	
	this.releaseStartListener = function(){me.onReleaseStart.apply(me,arguments);};
	this.mediaEndListener = function(){me.onMediaEnd.apply(me,arguments);};
	this.mediaErrorListener = function(){me.onMediaError.apply(me,arguments);};
	
	//most of the events we care about will trigger this function
	this.releaseEndListener = function(){me.onReleaseEnd.apply(me,arguments);};

	// this.releaseEndListener = 
	// this.setReleaseHandler = function(){me.unlockCurrentRelease()};
	
	this.controller.addEventListener("OnReleaseStart", this.releaseStartListener);
    this.controller.addEventListener("OnReleaseEnd", this.releaseEndListener);
    this.controller.addEventListener("OnMediaEnd", 	this.mediaEndListener);
    this.controller.addEventListener("OnMediaError", 	this.mediaErrorListener);
	
	if (this.lastUnhandledRewriteUrl)
	{
		this.doRewrite(this.lastUnhandledRewriteUrl);
		this.lastUnhandledRewriteUrl = undefined;
	}
	
};

ConcurrencyPlugIn.prototype.startHeartbeat = function()
{
	//we need to hook up listeners
	var that = this;

	that.doUpdateLock();

	this.isBeating = true;

	this.heartBeatInterval = setInterval(
		function()
		{
			that.doUpdateLock();
		},
		this.heartBeat
	);
};

ConcurrencyPlugIn.prototype.endHeartbeat = function()
{
    this.isBeating = false;
    clearInterval(this.heartBeatInterval);
};



ConcurrencyPlugIn.prototype.doUpdateLock = function()
{
	var that = this;
	tpDebug("calling updateLock lockId:" + this.lockId + " sequenceToken:" + this.lockSequenceToken);
	$pdk.platformConcurrency.client.updateLock(
		this.concurrencyServiceUrl,
		this.clientId,
		this.lockId,
		this.lockSequenceToken,
		this.lock,
		function(value)
		{
			if (value.isException)
			{
				tpDebug("updateLock exception thrown:" + value.exception + " title:" + value.title + " description:" + value.description + " responseCode:" + value.responseCode,  "ConcurrencyPlugIn");
				that.controller.resetRelease();
			}
			else
			{
				tpDebug("updateLock success id: " + value.id + ", sequenceToken: " + value.sequenceToken + ", encryptedLock: " + value.encryptedLock,  "ConcurrencyPlugIn");
				that.lockId = value.id;
				that.lockSequenceToken = value.sequenceToken;                
				that.lock = value.encryptedLock;
			}
		}
	);
}

ConcurrencyPlugIn.prototype.doUnlock = function()
{
	var that = this;
	tpDebug("unlocking concurrency lockId:" + this.lockId + " sequenceToken:" + this.lockSequenceToken);
	$pdk.platformConcurrency.client.unlock(
		this.concurrencyServiceUrl,
		this.clientId,
		this.lockId,
		this.lockSequenceToken,
		this.lock,
		function(value)
		{
			if (value.isException)
			{
				tpDebug("unlock exception thrown: " + value.exception + ", title:" + value.title + ", description:" + value.description + ", responseCode:" + value.responseCode);
			}
			else
			{
				tpDebug("unlock success: " + value.success);
				that.lockId = value.id;
				that.lockSequenceToken = value.sequenceToken;                
				that.lock = value.encryptedLock;
			}
		}
	);
}

ConcurrencyPlugIn.prototype.onReleaseStart = function(e)
{
	var 
	i = 0,
	metaTag,
	metaTags,
	metaTags_l;

	//here we check if the data is coming down from the smil
	this.currentPlaylist = e.data;

	if (typeof(this.currentPlaylist) === "object")
	{
		metaTags = this.currentPlaylist.metaTags;
		if (typeof(metaTags) === "object")
		{
			metaTags_l = metaTags.length;
			for(i = 0; i < metaTags_l; i++)
			{
				metaTag = metaTags[i];
				if(metaTag.name === "updateLockInterval")
				{
					try {
						this.heartBeat = parseInt(metaTag.content) * 1000;
					}
					catch(e) {
						this.heartBeat = 0;
					}
				}
				if(metaTag.name === "concurrencyServiceUrl")
				{
					this.concurrencyServiceUrl = metaTag.content;
				}
				if(metaTag.name === "lockId")
				{
					this.lockId = metaTag.content;
				}
				if(metaTag.name === "lockSequenceToken")
				{
					this.lockSequenceToken = metaTag.content;
				}
				if(metaTag.name === "lock")
				{
					this.lock = metaTag.content;
				}
			}
		}
	}

	if (
		this.heartBeat > 0
		&& typeof(this.concurrencyServiceUrl) === "string" && this.concurrencyServiceUrl.length > 0
		&& typeof(this.lockId) === "string" && this.lockId.length > 0
		&& typeof(this.lockSequenceToken) === "string" && this.lockSequenceToken.length > 0
		&& typeof(this.lock) === "string" && this.lock.length > 0)
	{
		tpDebug("concurrency start heartbeat interval:" + this.heartBeat + " lockId:" + this.lockId)

		//we know we need to turn the heartbeat on
		this.startHeartbeat();
	}
	else
	{
		tpDebug("concurrency heartbeat wasn't set");
	}
}

ConcurrencyPlugIn.prototype.onMediaError = function(e)
{
	if(this.isBeating)
	{
		this.endHeartbeat();
		this.doUnlock();
	}
}

ConcurrencyPlugIn.prototype.onMediaEnd = function(e)
{
	/*
	 * Probably unreliable. For now, we're only going to unlock at OnReleaseEnd
	 */

/*
	if (this.isBeating)
    {
        var clip = e.data;

        if (clip.clipIndex===this.currentPlaylist.length-1)
        {
            this.unlockcurrentPlaylist();
            return;
        }

        //otherwise, we want to see that there are only ads after us

        for (var i=clip.clipIndex+1;i<this.currentPlaylist.length;i++)
        {
            if (this.currentPlaylist.baseClip[i].isAd!==true)
            {
                return;
            }
        }
        //if we got here
        this.endHeartbeat();
        this.doUnlock();
    }
	*/
}

ConcurrencyPlugIn.prototype.onReleaseEnd = function()
{
	if (this.isBeating)
	{
		this.endHeartbeat();
		this.doUnlock();
	}
}

ConcurrencyPlugIn.prototype.doRewrite = function(url)
{
	if (this.isBeating)
	{
		this.endHeartbeat();
		this.doUnlock();
	}
    //clear values
    this.currentPlaylist = undefined;
    this.heartBeat = 0;
    this.concurrencyServiceUrl = "";
    this.lockId = "";
    this.lockSequenceToken = "";
    this.lock = "";

	var u = [
		url,
		url.indexOf("?") >= 0 ? "&" : "?",
		"clientId",
		"=",
		window.encodeURIComponent(this.clientId)
	].join("");

	this.controller.setMetadataUrl(u);
}



ConcurrencyPlugIn.prototype.rewriteMetadataUrl = function(releaseUrl, isPreview)
{
	if (this.isReady)
	{
		//we weren't torn down properly, so do it now
		this.doRewrite(releaseUrl);
	}
	else
	{
		this.lastUnhandledRewriteUrl = url;
	}
	return true;
	
};

tpController.plugInLoaded(new ConcurrencyPlugIn());

