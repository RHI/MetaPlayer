$pdk.ns("$pdk.plugin.AuthPlugin");
$pdk.plugin.AuthPlugin = $pdk.extend(function(){},
{
	COOKIE_REGEX : /^"?(?:([0-9]+)\|)(?:([0-9]{3})\|)(?:(.*)\|)(?:(.*))"?$/,

	constructor : function(cookies)
	{
		this._cookies = cookies;
	},

	initialize : function(loadObj)
	{
		this.priority = loadObj.priority;
		this._controller = loadObj.controller;
		this._token = loadObj.vars["token"];
		this._cookie = loadObj.vars["cookie"];
		
		if (!this._token||this._token.length===0)
		{
		    if (this._cookie)
		        this._token = this._checkCookie(this._cookie);
		    else
		        this._token = this._checkCookie("tpUserToken");		        
		}		

	    if (!this._token||this._token.length===0)
        {
            var me = this;
            this.setTokenListener = function(e)
            {
                me.onSetToken(e);
            }
            this._controller.addEventListener("OnSetToken", this.setTokenListener);            
        }
		
		try
		{
			this._controller.registerMetadataUrlPlugIn(this, this.priority);
		}
		catch(e)
		{
			tpDebug("WARN: " + e.message);
		}
	},
	
	onSetToken: function(e)
    {
        this._token = e.data.token;
        
       // tpDebug({token:e.data.token, type:e.data.type},this.controller.id,"resumePlayback",tpConsts.TEST);
    },

	rewriteMetadataUrl : function(releaseUrl, isPreview)
	{
		var auth = null;
		cookieName = "tpUserToken";

		if(typeof(this._token) === "string" && this._token.length > 0) {
			auth = this._token;
		}

		if(auth === null)
		{
			auth = this._checkCookie(this._cookie);
			auth = auth === null ? this._checkCookie("tpUserToken") : auth;
		}

		if(auth !== null)
		{
			this._controller.setMetadataUrl([
				releaseUrl,
				releaseUrl.indexOf("?") >= 0 ? "&" : "?",
				"auth",
				"=",
                    auth
			].join(""));
		}

		return auth !== null;
	},

	_checkCookie : function(cookieName)
	{
		var cookie = null,
		cookieParsed;

		if(typeof(cookieName) === "string" && cookieName.length > 0)
		{
			cookie = this._cookies[cookieName];
			if(typeof(cookie) === "string")
			{
				cookieParsed = this.COOKIE_REGEX.exec(cookie);
				cookie = $pdk.isArray(cookieParsed) && cookieParsed.length >= 3 ? cookieParsed[3] : null;
			}
			else
			{
				cookie = null;
			}
		}

		return cookie;
	}
});

tpController.plugInLoaded(new $pdk.plugin.AuthPlugin($pdk.env.Detect.getInstance().getCookies()));
