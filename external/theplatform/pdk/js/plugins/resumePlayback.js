// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.ResumePlayback");

$pdk.plugin.ResumePlayback = $pdk.extend(function()
{
}, {
    
    URN_PREFIX: "urn:theplatform:pdk:media:",

    constructor : function()
    {

    },

    initialize : function(loadObj)
    {

        this.controller = loadObj.controller;

        this.priority = loadObj.priority;

        this.token = loadObj.vars['token'];
        this.context = loadObj.vars['context'];
        this.accountId = loadObj.vars['accountId'];
        this.accountId = typeof(this.accountId) !== "string" ? "" : this.accountId; 
        
        this.firstRelease = true;
        
        this.resumeLabel = loadObj.vars['resumeLabel']!==undefined ? loadObj.vars['resumeLabel'] : "Resume";
        this.restartLabel = loadObj.vars['restartLabel']!==undefined ? loadObj.vars['restartLabel'] : "Restart";

        this.autoResume = loadObj.vars['autoResume']==="true" ? true : false;
		this.threshold = loadObj.vars['threshold']!==undefined ? parseInt(loadObj.vars['threshold']) : 0;

        //defaults to true
        this.useCache = true;//loadObj.vars['useCache'] !== "false" ? true : false;

        if (!this.token||this.token.length===0)
        {
            this.setTokenListener = function(e)
            {
                me.onSetToken(e);
            }
            this.controller.addEventListener("OnSetToken", this.setTokenListener);
        }
        
        var me = this;
        var doneListener = function()
        {
            me.isReady = true;
            $pdk.bookmarks.removeEventListener("OnReady", doneListener);
            me.continueInitialize(loadObj);
        }

        if ($pdk['bookmarks'] !== undefined)
        {
            //is it ready? (evt will fire even if it is, so just do it this way)
            $pdk.bookmarks.addEventListener("OnReady", doneListener);
        }
        else
        {
            //need to load in script, then do the same thing
            //may also need to load the "core", but we should really just concat the two js files...
            tpLoadScript(tpGetScriptPath() + "/libs/bookmarks/bookmarks.js", function()
            {
                $pdk.bookmarks.addEventListener("OnReady", doneListener);
            });
        }
        
        try
        {
            this.controller.registerMetadataUrlPlugIn(this, this.priority);

        }
        catch(e)
        {
            tpDebug("WARN: couldn't register ConcurrencyPlugIn: " + e.message);
        }

    },

    continueInitialize: function(loadObj)
    {

        var me = this;

        this.releaseSelectedListener = function(e)
        {
            me.onReleaseSelected(e);
        };
        this.mediaPlayingListener = function(e)
        {
            me.onMediaPlaying(e);
        };
        this.mediaPauseListener = function(e)
        {
            me.onMediaPause(e);
        };
        this.mediaStartListener = function(e)
        {
            me.onMediaStart(e);
        };
        
        this.mediaEndListener = function(e)
        {
            me.onMediaEnd(e);
        };
        
        this.mediaErrorListener = function(e)
        {
            me.onMediaError(e);
        };
        
        this.setReleaseListener = function(e)
        {
            me.onSetRelease(e);
        };
        
        this.releaseStartListener = function(e)
        {
            me.onReleaseStart(e);
        };
        
        this.releaseEndListener = function(e)
        {
            me.onReleaseEnd(e);
        };

        this.controller.addEventListener("OnReleaseSelected", this.releaseSelectedListener);
        
        this.controller.addEventListener("OnReleaseStart", this.releaseStartListener);


        
        this.controller.addEventListener("OnMediaPlaying", this.mediaPlayingListener);
        this.controller.addEventListener("OnMediaPause", this.mediaPauseListener);
        this.controller.addEventListener("OnMediaStart", this.mediaStartListener);
        this.controller.addEventListener("OnMediaError", this.mediaErrorListener);
        this.controller.addEventListener("OnMediaEnd", this.mediaEndListener);
        
        this.controller.addEventListener("OnReleaseEnd", this.releaseEndListener);
        
        this.controller.addEventListener("OnSetRelease", this.setReleaseListener);

        this.controller.addEventListener("OnSetReleaseUrl", this.setReleaseListener);
        
        this.video = this.controller.getVideoProxy();//maybe it's a proxy, maybe it's the real deal...
        

        
        if (this.lastUnhandledRewriteUrl)
        {
            this.doResume(this.lastUnhandledRewriteUrl);
            //this.controller.setMetadataUrl(this.lastUnhandledRewriteUrl);
            this.lastUnhandledRewriteUrl = undefined;            
        }        
        
        this.doneLoading = true;

    },

    onSetToken: function(e)
    {
        this.token = e.data.token;

       // tpDebug({token:e.data.token, type:e.data.type},this.controller.id,"resumePlayback",tpConsts.TEST);
    },

    onMediaError: function(e)
    {
        if (this.view)
            this.view.style.display="none";
    
    },
    
    onReleaseStart: function(e)
    {
        
        //tpDebug(e);
        this.currentPlaylist = e.data;
        var url = e.data.releaseURL;
        this.releaseUrl = url;
        
        this.releaseStarted = true;
        this.wasDeleted = false;
        
        this.lastSavedTime = undefined;
        
        //to go along with the flash way of doing things, we should change the playlist object's offset on the current clip
        
        if (tpIsIPhone())
            this.video.style.display="";
            
    },
    
    onReleaseEnd: function(e)
    {
        
        // this.releaseStarted = false;
	var isException = this.clipHasException(e.data);
        if (!isException && !this.wasError()&&!this.wasDeleted&&this.releaseStarted&&Math.abs(this.lastKnownPosition-this.currentPlaylist.chapters.chapters[this.currentPlaylist.chapters.chapters.length-1].endTime)<=500)
        {
            this.wasDeleted = true;
            this.releaseStarted = false;
            this.removeBookmark();
        }
        
    },

    doResume: function(releaseUrl)
    {
        tpDebug("Bookmark plugin calling setMetaDataUrl");
        
            
        this.controller.setMetadataUrl(releaseUrl);
    },

    errorHandler: function(error)
    {
        tpDebug("bookmarks service got error: " + error);
        this.doResume(this.releaseUrl);
    },

    successHandler: function(result)
    {
        //sometimes the service can return a null result
        if (result&&result.position !== 0 && result.position !== null)
        {
            var me = this;
            this.showUIPrompt(result.position, function(resume)
            {
                
                //this got moved up the the metadataurlmanager
                if (tpIsIOS())
                {
                    //this is to force ios to let us play/seek, because we're going to make an async call based on this user input and do nothing more
                    //until it returns
                    tpDebug("This is an iOS device, we need to set src to '' to get it to let us play things later.");
                    me.controller.writePlayer("", true);
                }
                

                if (resume)//then we seek if the user wanted to...
                {
                    var listener = function(e){
                        me.controller.removeEventListener("OnReleaseStart",listener);
                        
                        //need to ensure this seek is on the playlist, not just current media...                        
                        me.controller.markOffset(e.data, result.position*1000);
                    }
                    
                    me.controller.addEventListener("OnReleaseStart",listener);
                }
                else
                {
                    me.removeBookmark();//nuke the bookmark, they don't want to use it
                }

                //either way we call the same url...
                me.doResume(me.releaseUrl);


            });
        }
        else
        {
            this.doResume(this.releaseUrl);
        }
    },
    


    checkForBookmark: function()
    {
        var me = this;

        //this way the closure won't get different values than when we started
        var context = this.context;
        var token = this.token;
        var mediaId =  this.mediaId;
        
        tpDebug({testId:"RESUME_PLAYBACK_CHECK_FOR_BOOKMARK",data:{token:token, mediaId:mediaId}},this.controller.id,"resumePlayback",tpConsts.TEST);

        //i'm assuming we want to use the cache? (otherwise what's it there for?)
        $pdk.bookmarks.hasBookmark(context, token, this.accountId, this.URN_PREFIX+mediaId , this.useCache ,
            {
                onSuccess:function(result)
                {

                    if (result)
                    {
                        $pdk.bookmarks.getBookmark(context, token, me.accountId, me.URN_PREFIX+mediaId , {
                            onSuccess: function(result){me.successHandler(result);} ,
                            onFailure: function(error){me.errorHandler(error);}  
                            });
                    }
                    else
                    {
                        tpDebug("We have no bookmark, just use existing url")
                        me.doResume(me.releaseUrl);
                    }

                },

                onFailure: function(error){me.errorHandler(error);}  
            });
            
        this.wasUserGenerated = false;
        
    },
    
    checkMediaID:function(json)
    {
        
        if (!json||!json.id)
            this.doResume(this.releaseUrl)
        
        this.mediaId = json.id.substring(json.id.lastIndexOf("/")+1);
        
        this.currentTitle = json.title;
        
        this.checkForBookmark();
        
    },

    rewriteMetadataUrl: function(releaseUrl, isPreview)
    {

        if (!this.doneLoading)
        {
            this.lastUnhandledRewriteUrl = releaseUrl;   
            this.mediaIsAutoPlay = true;
                     
            return true;            
        }

        //if the previous onReleaseSelected was not user generated, return false...

        this.releaseUrl = releaseUrl;
        
        if (this.mediaIsAutoPlay===undefined)
            this.mediaIsAutoPlay = this.firstRelease;//we would have got an onReleaseSelected otherwise
        
        this.firstRelease = false;

        if (!this.mediaIsAutoPlay)
        {
            
            var me = this;
            
            //We have to make this async, because otherwise the release will get switched before the previous bookmark is done saving.
            //firefox doesn't hoist function defs inside blocks, so it needs to be above where it's referenced...
            function doBookmarkCheck(){
            
                me.releaseStarted=false;
            
                //we load the format=preview version of the releaseUrl
                var loader = new JSONLoader();                        

                loader.load(me.releaseUrl.split("?")[0]+"?format=preview",
                    function(json){me.checkMediaID(json);},null,null,null,function(){me.doResume(me.releaseUrl);});

                //this got moved up the the metadataurlmanager
                if (tpIsIOS())
                {
                    //this is to force ios to let us play/seek, because we're going to make an async call based on this user input and do nothing more
                    //until it returns
                    tpDebug("This is an iOS device, we need to set src to '' to get it to let us play things later.");
                    me.controller.writePlayer("", true);
                }


            }            
            
            if (this.releaseStarted&&this.mediaId&&!this.wasError())
            {
                this.saveCurrentTime(doBookmarkCheck);            
            }
            else
            {
                doBookmarkCheck();
            }
            
            return true;

        }
        else
        {
            return false;
        }

    },




    onReleaseSelected : function(e)
    {
        this.wasUserGenerated = e.data.userInitiated;
        
        this.mediaIsAutoPlay = (!this.wasUserGenerated&&this.firstRelease);
        
        this.releaseUrl = e.data.releaseUrl;        

        //this is too late too...
        // if (this.releaseStarted&&this.wasUserGenerated&&this.mediaId)
        // {
        //     this.saveCurrentTime();
        // }

    },

    onMediaPlaying : function(e)
    {
        //we save it in ms, instead of seconds like the spec says, since it makes more sense to divide by 1000 once instead of many times
        this.lastKnownPosition = e.data.currentTimeAggregate;
    },
    
    onMediaEnd : function(e)
    {
        //we don't want to do this in this case, the user must have clicked to another release so we don't want to delete their bookmark
        if (this.wasUserGenerated||!this.currentPlaylist)
            return;
            
        var clip = e.data;
        var moreContent = false;

        if (clip.clipIndex===this.currentPlaylist.baseClips.length-1)
        {
            moreContent = false;//last clip, so no more content...
        }

            //otherwise, we want to see that there are only ads after us

        for (var i=clip.clipIndex+1;i<this.currentPlaylist.baseClips.length;i++)
        {
            if (this.currentPlaylist.baseClips[i].isAd!==true)
            {
                moreContent = true;
                break;
            }
        }
        
	var isException = this.clipHasException(clip);
        if (!isException && !this.wasError()&&!this.wasDeleted&&!moreContent&&Math.abs(this.lastKnownPosition-this.currentPlaylist.chapters.chapters[this.currentPlaylist.chapters.chapters.length-1].endTime)<=500)
        {
            this.wasDeleted = true;
            this.releaseStarted = false;
            this.removeBookmark();
        }
            
    },
    
    clipHasException : function(clip)
    {
        var r = false;
        if($pdk.isArray(clip.baseClips) && !$pdk.isEmpty(clip.baseClips[0].contentCustomData))
        {
                r = clip.baseClips[0].contentCustomData["isException"] === "true";
        }
        if(!$pdk.isEmpty(clip.baseClip) && !$pdk.isEmpty(clip.baseClip.contentCustomData))
        {
                r = clip.baseClip.contentCustomData["isException"] === "true";
        }
        return r;
    },
	
    wasError: function()
    {
        return isNaN(this.video.duration);
    },
    
    removeBookmark : function()
    {
        $pdk.bookmarks.removeBookmark(this.context, this.token, this.accountId, this.URN_PREFIX+this.mediaId,{ 
        onSuccess:function(result)                    
        {
            tpDebug("Bookmark removed sucessfully");
        },onFailure:function(errorMsg)
        {
            tpDebug("Bookmark remove unsucessful");
        }
        });
    },

    onMediaPause : function(e)
    {
        if (this.releaseStarted&&!this.wasDeleted&&!this.wasError())
            this.saveCurrentTime();
        else
            tpDebug("Not saving bookmark, release hasn't started or has already ended");
    },

    saveCurrentTime: function(callback)
    {

        //this prevents us from double-saving because we get extra pause events from the video tag sometimes
        if (this.mediaIsAutoPlay||Math.abs(this.lastKnownPosition-this.total)<=500||this.lastSavedTime!==undefined&&(Math.ceil(this.lastSavedTime / 1000)===Math.ceil(this.lastKnownPosition / 1000)))
        {
            if (typeof(callback)==='function')
                  callback();
            
            return;
        }
            
        var time =  Math.ceil(this.lastKnownPosition / 1000)

		// don't save bookmarks if we're within the threshold
		if (time < this.threshold || time > (this.total/1000 - this.threshold))
		{
            if (typeof(callback)==='function')
                  callback();
            
			return;
		}

        this.lastSavedTime = this.lastKnownPosition;

        $pdk.bookmarks.updateBookmark(this.context, this.token, this.accountId, this.URN_PREFIX+this.mediaId, time, this.total/1000,
                { onSuccess:function(result)                    
                {
                    tpDebug("Bookmark saved sucessfully for "+time);
                    if (typeof(callback)==='function')
                          callback();
                },onFailure:function(errorMsg)
                {
                    tpDebug("Bookmark save unsucessful for "+time);
                    if (typeof(callback)==='function')
                        callback();
                }
                });
    },

    onMediaStart : function(e)
    {
        var clip = e.data;
        
        this.total = clip.baseClip.releaseLength;

        if (!clip.baseClip.isAd)
        {
        this.mediaId = clip.baseClip.contentID;
        }

        if (!clip.baseClip.isAd && clip.chapter.index > 0)
        {
            this.lastKnownPosition = clip.currentMediaTime;
            this.saveCurrentTime();
        }
        
        this.releaseStarted = true;

        if (this.view)
            this.view.style.display = "none";

    },

    onSetRelease : function(e)
    {

        //we're supposed to save the last known position of the current release
        //but this is too late, the rewriteMetaDataUrl call will have already changed the vars
        // if (this.wasUserGenerated&&this.mediaId)
        // {
        //     this.saveCurrentTime();
        // }

        if (e.type === "OnSetRelease")
        {
            this.lastKnownPosition = 0;
            this.releaseUrl = e.data.url;
        }
        else if (e.type === "OnSetReleaseUrl")
        {
            this.releaseUrl = e.data;
        }
        // else //this way
        //      this.currentRelease = undefined;

    },

    showUIPrompt: function(time, callback)
    {
        //at some point, we should improve this...
        // var r = confirm("Do you want to resume playback of "+this.releaseUrl+" at " + time + "?")
        // 
        // callback(r);
        
        //just in case
        this.releaseStarted = false;
            
        this.controller.pause(true);

		if (this.autoResume)
		{
			callback(true);
			return;
		}
        
        this.createUI(callback);
            
        //TODO: shouldn't this be localizable too?
        this.textSpan.innerHTML = "Would you like to resume watching \""+this.currentTitle+"\" from where you left off?";        

        tpDebug({testId:'RESUME_PLAYBACK_FORM_DISPLAYED',data:{token:this.token,mediaId:this.mediaId}}, this.controller.id, "resumePlayback", tpConsts.TEST);

    },

    createUI:function(callback)
    {
        //we'll use jquery for this...
        if (window["$"]!==undefined)
        {
            //we might have it anyway
            // if (window.jQuery)
            //     $ = window.jQuery;
                
            this.completeUI(callback);
        }
        else //we need to load in jquery
        {
            var me = this;
            //we could probably improve this by going through gwt's scriptloader...
            tpLoadScript($pdk.scriptRoot+"/js/jquery-1.5.2.min.js",function(){
                me.completeUI(callback);
            });
        }
    },
    
    completeUI:function(callback)
    {
        
        if (!this.view)
        {
            
            $("head").append("<style>"+
            
                ".bookmarkCard {}"+
                ".bookmarkLabel { margin:15px; text-align:center; }"+
                ".bookmarkButtonContainer {"+
                "text-align:center; margin-left:auto; margin-right:auto; width:100%;"
                +"}"+
                ".bookmarkButton {"+
                "border: none; margin:5px; color:white; height:35px; width:85px; display:inline-block; vertical-align:middle;"+
                "background-image: url('"+$pdk.scriptRoot+"/skins/glass/images/button.png'); background-size:100%;"+
                "}"+
                "a.bookmarkButton:active {"+
                 "color: #00CCFF;"+
                "}"+ 
                ".bookmarkButton span {"+
                 "vertical-align:middle;text-align:center;"+
                "}"+                           
            "</style>");
        
            //i supposed all this could be jquery too, but it's not
        
            this.view = document.createElement("div");
        
            this.parent = document.getElementById(this.controller.id+".standby");
        
            // this.view.style.backgroundColor = "black";
            
            // this.view.style.opacity = "0.75";
            //       this.view.style.filter = "alpha(opacity=75)";
            
            this.blocker = document.createElement("div");
            this.blocker.style.backgroundColor = "black";
            
            this.blocker.style.opacity = "0.75";
            this.blocker.style.filter = "alpha(opacity=75)";
            this.blocker.style['position']="absolute";
            this.blocker.style.width="100%"
            this.blocker.style.height="100%"
        
            this.view.style.zIndex=600;
            this.view.style['position']="absolute";
            this.view.style.width="100%"
            this.view.style.height="100%"
        
            this.view.style.display = "none";
        
            this.closeButton = document.createElement("a");
            // this.closeButton.style.height="10%";
            // this.closeButton.style.width="20%";
            this.closeButton.href = "#";
            this.closeButton.innerHTML = "<span>"+this.restartLabel+"</span>";
            $(this.closeButton).addClass("bookmarkButton");
        
            this.resumeButton = document.createElement("a");
            // this.resumeButton.style.height="10%";
            // this.resumeButton.style.width="20%";
            this.resumeButton.href = "#";
            this.resumeButton.innerHTML = "<span>"+this.resumeLabel+"</span>";
            $(this.resumeButton).addClass("bookmarkButton");

            this.textSpan = document.createElement("div");
            this.textSpan.style['position']="absolute";
            this.textSpan.style.color="white";
            $(this.textSpan).addClass("bookmarkLabel");
        
            this.btnSpan = document.createElement("div");
            this.btnSpan.style['position'] = "absolute";
            $(this.btnSpan).addClass("bookmarkButtonContainer");
        
            this.btnSpan.appendChild(this.closeButton);
            this.btnSpan.appendChild(this.resumeButton);


            this.view.appendChild(this.blocker);

            this.view.appendChild(this.textSpan);
        
            this.view.appendChild(this.btnSpan);
            

        
            this.parent.appendChild(this.view);  
            
            
            //centering the buttons
            var ah = $(this.textSpan).height();
    		var ph = $(this.textSpan).parent().height();
    		var mh = Math.floor((ph-ah) / 5);
    		$(this.textSpan).css('margin-top', mh);
            
            
    		ah = $(this.btnSpan).height();
    		ph = $(this.btnSpan).parent().height();
    		mh = Math.floor((ph-ah) / 2);
    		$(this.btnSpan).css('margin-top', mh);
    		

    		$(this.resumeButton).children().first().css('line-height', $(this.resumeButton).height()+"px");
    		$(this.closeButton).children().first().css('line-height', $(this.closeButton).height()+"px");
            	
                  
        
        }
        
        var me = this;
        
        this.closeButton.onclick = function(e){
            if (!e) 
                var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) 
                e.stopPropagation();
            me.view.style.display="none";
            callback(false);
        }
        
        this.resumeButton.onclick = function(e){
            if (!e) 
                var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) 
                e.stopPropagation();
                
            me.view.style.display="none";
            callback(true);
        }
        
        //on ipad, we have to hide the controls, on iPhone, we have to hide the entire video tag...

        if (tpIsIPhone())
            this.video.style.display="none";        
        else if (tpIsIOS())
        {
            this.video.controls = false;
        }
        
        
        this.view.style.display = "";
        
        
        
        
    }

});

tpController.plugInLoaded(new $pdk.plugin.ResumePlayback());
