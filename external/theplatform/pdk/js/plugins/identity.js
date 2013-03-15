// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.Identity");

$pdk.plugin.Identity = $pdk.extend(function(){},
{
    
    COOKIENAME: "tpIdentityTokens",
    COOKIETIMEOUT: "tpIdentityTimeOut",
    identityServiceUrl: "https://euid.theplatform.com",
    authSigninPath: "/idm/web/Authentication/signIn",
    promptImmediately: false,
    loginFormEnabled: true,

    loginInstructions: "Please enter your username and password to continue",
    errorInstructions: "Invalid username or password, please try again",
    errorColor: "#FF0000",
    instructionsColor: "#FFFFFF",
    contexts: [],
    loginHasFailed: false,
    isGettingToken: false,
	waitingForCredentials: false,
	prompting: false,
    priority: 1,
	cancelLabel: "Cancel",
	loginLabel: "Login",
	usernameLabel: "Username",
	passwordLabel: "Password",

    constructor : function(){
    },
    
    initialize : function(lo){
        this.controller = lo.controller;
        this.username = lo.vars["username"];
        this.password = lo.vars["password"];
        this.directory = lo.vars["directory"];
		this.priority = lo.priority;

		if (lo.vars["contexts"])
		{
			this.contexts = lo.vars["contexts"].split(",");
		}
        if (lo.vars["promptImmediately"])
            this.promptImmediately = lo.vars["promptImmediately"].toString().toLowerCase() =="true";
        if (lo.vars["loginFormEnabled"])
            this.loginFormEnabled = lo.vars["loginFormEnabled"].toString().toLowerCase() =="true";

        this.directory = lo.vars["directory"];
        if (lo.vars["identityServiceUrl"])
            this.identityServiceUrl = lo.vars["identityServiceUrl"];
        if (lo.vars["tokenScope"])
            this.tokenScope = lo.vars["tokenScope"];
        if (lo.vars["loginInstructions"])
            this.loginInstructions = lo.vars["loginInstructions"];
        if (lo.vars["errorInstructions"])
            this.errorInstructions = lo.vars["errorInstructions"];
        if (lo.vars["usernameLabel"])
            this.usernameLabel = lo.vars["usernameLabel"];
        if (lo.vars["passwordLabel"])
            this.passwordLabel = lo.vars["passwordLabel"];
        if (lo.vars["loginLabel"])
            this.loginLabel = lo.vars["loginLabel"];
        if (lo.vars["cancelLabel"])
            this.cancelLabel = lo.vars["cancelLabel"];

        this.token = lo.vars["token"];

        this.video = this.controller.getVideoProxy();//maybe it's a proxy, maybe it's the real deal...

		try
		{
			this.controller.registerMetadataUrlPlugIn(this, this.priority);
		}
		catch(e)
		{
			tpDebug("WARN: " + e.message);
		}

		var me = this;
        this.controller.addEventListener("OnPlayerLoaded", function (e) { me.handlePlayerLoaded(e); }); 
    },

	rewriteMetadataUrl : function(releaseUrl, isPreview)
	{
		if (isPreview) return false;
		
		if (this.token || this.cancelled)
		{
			return false;
		}
		else {
			this.waiting = true;
			this.metadataurl = releaseUrl;
			return true;
		}
	},
	
    shouldPrompt: function()
    {
        return (this.promptImmediately==true&&
                !(this.username&&this.password&&this.username.length&&this.password.length)&&!this.token);
    },

	handlePlayerLoaded: function(e)
    {
        this.controller.removeEventListener("OnPlayerLoaded", this.handlePlayerLoaded);
		this.doGetToken();
    },

    doSetToken: function()
	{
		tpDebug("doSetToken: " + this.token, "IdentityPlugIn");
		if (this.token)
		{
	        this.controller.setToken(this.token, "urn:theplatform:auth:token")
		}
		
		if (this.waiting)
		{
			tpDebug("doSetToken resuming metadata url: " + this.metadataurl, "IdentityPlugIn");
			this.controller.setMetadataUrl(this.metadataurl);
		}
	},
	
   	doGetToken: function()
    {                                                            
        tpDebug("doGetToken()","IdentityPlugIn");

        if (this.token && this.token.length )
        {
	        tpDebug("already had them, sending back","IdentityPlugIn");
			this.doSetToken();
            //_controller.dispatchEvent(new PdkEvent(PdkEvent.OnCredentialsAcquired, {username:_accountId,token:_token}));
        }
        else if (this.identityServiceUrl && this.authSigninPath)
        {
            if (this.directory&&this.directory.length)
                this.token = this.checkCookieForToken(this.directory+"/"+this.username);
            else
                this.token = this.checkCookieForToken(this.username);

            //we're supposed to update the cookie again now with a new idletimeout..
            if (this.token&&this.token.length)
            {
                tpDebug("Got a token for "+this.username+" from a cookie: " + this.token,"IdentityPlugIn");
				this.doSetToken();
            }
            else
            {       
				if (this.username && this.password)
				{
	                tpDebug("Requesting token from service","IdentityPlugIn");
	                this.getToken();
				}
				else {
					this.waitingForCredentials = true;

					var me = this;
					this.promptForLogin(false, function() { me.doSetUsernameAndPass.apply(me, arguments)});
				}
            }
        }
        else
        {
             tpDebug("getCredentials needs an accoundId.","IdentityPlugIn","error");
			return false;
        }   

		return true;
    },

	doSetUsernameAndPass: function(un, pw)
	{
		if (un && pw)
		{
			this.username = un;
			this.password = pw;
			this.doGetToken();
		}
		else 
		{
			// they hit cancel
			this.doSetToken();
		}
	},

	promptForLogin: function(doRetry, callback)
	{
        if (!this.loginFormEnabled)
        {
			return;
        }

        var isRetry=doRetry;

		// is isRetry=true check...

		// if the card is already up, no need to show it again...
		if (this.prompting&&!isRetry)
            return;
        else if (this.prompting&&isRetry)
        {
			// what happens here?
			tpDebug("prompting and retrying...")
//            return;
        }

        // if (isRetry)
        //     initVars = {username:this.username,password:"",instructions:this.errorInstructions,errorInstructions:this.errorInstructions,instructionsColor:_errorColor,errorColor:_errorColor, context:_context};
        // else
        //     initVars = {username:_username,password:"",instructions:_loginInstructions,errorInstructions:_errorInstructions,instructionsColor:_instructionsColor, errorColor:_errorColor, context:_context};

       	tpDebug("Requesting token from tpLoginCard","IdentityPlugIn");

		this.createUI(callback);
		// need UI here...

		this.prompting = true;
	},
	
	checkCookieForToken: function(username)
    {
		tpDebug("Checking cookie for token", "IdentityPlugIn");
		
        this.cookie = this.getCookie(this.COOKIENAME);

        if (this.cookie==null||this.cookie.length<=0)
            return null;

        var pairs = this.cookie.split("%2C");

		var item;
        for (var i=0; i<pairs.length; i++)
        {
			item = pairs[i];
            var pair = item.split("%3A");			

            if (username == null || pair[0]==encodeURIComponent(username))
                return pair[1];
        }

        return null;                 
    },

    storeCookie:function(username,token,expiryDate,directory)
    {
        tpDebug("Saving token to cookie","IdentityPlugIn");
        var newcookie;
        var name;

        if (directory)
        {
            name=encodeURIComponent(directory+"/"+username);
        }
        else
            name = encodeURIComponent(username);


        newcookie = name+encodeURIComponent(":"+token+",");


        if (this.cookie==null)
            this.cookie="";

        var nameColon = name+":"; //encodeURIComponent(":");

        var index = this.cookie.indexOf(nameColon);

        if (index!=-1)
        {
            //we need to replace
            var pairs = this.cookie.split(",");//encodeURIComponent(","));

            this.cookie="";

            for (var item in pairs)
            {
                if (item.indexOf(nameColon)==-1)
                    this.cookie+=item+","; //encodeURIComponent(",");
            }
        }
        //otherwise //we can just append


        this.cookie += newcookie;


        this.setCookie(this.COOKIENAME,this.cookie, expiryDate);
    },

    setCookie: function(name,value,date)
    {
        document.cookie = name+"="+value+"; expires="+date+"; path=/";
    },

   	getCookie: function(name)
    {
		var cookies = document.cookie.split(';');

        if (cookies==null||cookies.length<=0)
            return null;

        var ourcookie;

        var nameEQ = name+"=";

        //look for the substring

        for(var i=0;i<cookies.length;i++) {
            var c = cookies[i];

            while (c.charAt(0)==' ')
                c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length,c.length);
	    }

        return null;
    },

    getToken: function()
    {
        this.isGettingToken = true;


        var request = this.identityServiceUrl + this.authSigninPath;

        var context = "";
        if (this.directory && this.directory.length > 0)
        {
            context = this.directory + "/";
        }

        request += "?username=" + context + this.username
                + "&password=" + this.password + "&form=json&schema=1.0";

		var me = this;
		
        $pdk.jQuery.ajax({
			url: request,

            dataType: 'jsonp json',

            beforeSend: function(jqXhr, settings) {
                return true;
            },

            success: function(json) {
				me.handleTokenData(json);
		 	},
			
			error: function(error) {
				tpDebug("JSON Error getting token", "IdentityPlugIn");
			}});
    },

    handleTokenData: function(json)
    {
        tpDebug("Got response from identity service...","IdentityPlugIn");

        var success = false;
		if (json)
        {
	        tpDebug("Identity Service JSON:\n" + json, "IdentityPlugIn", "debug");
			
	        tpDebug("Identity Service Response: " + json.signInResponse, "IdentityPlugIn");

            if (json && json.signInResponse && json.signInResponse.token)
            {
                this.token = json.signInResponse.token;
		        tpDebug("Identity Service token: " + this.token, "IdentityPlugIn");

                success = true;
                //we need to store the dir/username and token
                var expiry = json.signInResponse.idleTimeout;

				//                var expiryDate:Date = new Date();
				//                expiryDate.setTime(expiryDate.time+expiry);

				var now = new Date();
		        var to = this.getCookie(this.COOKIETIMEOUT);
		        now.setTime(now.getTime()+parseInt(to));

                this.setCookie(this.COOKIETIMEOUT,expiry);
		        this.storeCookie(this.username,this.token,now.toUTCString(),this.directory);
				this.doSetToken();
            }
        }
        if (!success)
        {
	        tpDebug("Identity Service call did not succeed, reprompting...", "IdentityPlugIn");
            //fail
			var me = this;
			this.instructionsDiv.innerHTML = "<span>"+this.errorInstructions+"</span>";
            this.promptForLogin(true, function() { me.doSetUsernameAndPass.apply(me, arguments)});
        }

        this.isGettingToken = false;
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
            
                ".loginCard {}"+
                ".loginButtonContainer {"+
                "text-align:center; margin-left:auto; margin-right:auto; width:100%;"
                +"}"+
                ".loginButton {"+
                "border: none; margin:5px; color:white; height:35px; width:85px; display:inline-block; vertical-align:middle;"+
                "background-image: url('"+$pdk.scriptRoot+"/skins/glass/images/button.png'); background-size:100%;"+
                "}"+
                "a.loginButton:active {"+
                 "color: #00CCFF;"+
                "}"+ 
                ".loginButton span {"+
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

			this.ui = document.createElement("div");
            this.ui.style.zIndex=600;
            this.ui.style['position']="absolute";
            this.ui.style.width="100%"
            this.ui.style.height="100%"
        
			this.instructionsDiv = document.createElement("div");
			this.instructionsDiv.style.color="white";
			this.instructionsDiv.style.marginBottom="25px";
			this.instructionsDiv.innerHTML = "<span>"+this.loginInstructions+"</span>";

			this.formDiv = document.createElement("div");
			this.usernameDiv = document.createElement("div");
			this.passwordDiv = document.createElement("div");
			
			this.formDiv.style.marginLeft = "auto";
			this.formDiv.style.marginRight = "auto";

			this._usernameLabel = document.createElement("div");
			this._usernameLabel.style.color="white";
			this._usernameLabel.style.textAlign = "right";
			this._usernameLabel.style.float = "left";
			this._usernameLabel.style.width = "33%";
			this._usernameLabel.innerHTML = "<span>"+this.usernameLabel+":</span>";
			$(this._usernameLabel).addClass("loginLabel");
			
			this.usernameInputDiv = document.createElement("div");
			this.usernameInputDiv.style.textAlign = "left";
			this.usernameInputDiv.style.float = "left";
			this.usernameInputDiv.style.width = "67%";
			
			this.usernameInput = document.createElement("input");
			this.usernameInput.style.color="white";
			this.usernameInput.style.float = "left";
			this.usernameInput.style.marginLeft = "10px";
			this.usernameInput.style.backgroundColor='black';
			$(this.usernameInput).addClass("loginInput");
			this.usernameInputDiv.appendChild(this.usernameInput);

			this.usernameDiv.appendChild(this._usernameLabel);
			this.usernameDiv.appendChild(this.usernameInputDiv);
			
			this._passwordLabel = document.createElement("div");
			this._passwordLabel.style.color="white";
			this._passwordLabel.style.textAlign = "right";
			this._passwordLabel.style.float = "left";
			this._passwordLabel.style.width = "33%";
			this._passwordLabel.innerHTML = "<span>"+this.passwordLabel+":</span>";
			this._passwordLabel.style.color="white";
			$(this._passwordLabel).addClass("loginLabel");
			
			this.passwordInputDiv = document.createElement("div");
			this.passwordInputDiv.style.textAlign = "left";
			this.passwordInputDiv.style.float = "left";
			this.passwordInputDiv.style.width = "67%";
			this.passwordInputDiv.style.marginBottom = "25px";

			this.passwordInput = document.createElement("input");
			this.passwordInput.type="password";
			this.passwordInput.style.color="white";
			this.passwordInput.style.float = "left";
			this.passwordInput.style.marginLeft = "10px";
			this.passwordInput.style.backgroundColor='black';
			$(this.passwordInput).addClass("loginLabel");
			this.passwordInputDiv.appendChild(this.passwordInput);

			this.passwordDiv.appendChild(this._passwordLabel);
			this.passwordDiv.appendChild(this.passwordInputDiv);

			this.formDiv.appendChild(this.usernameDiv);
			this.formDiv.appendChild(this.passwordDiv);

            this.closeButton = document.createElement("a");
            // this.closeButton.style.height="10%";
            // this.closeButton.style.width="20%";
            this.closeButton.href = "#";
            this.closeButton.innerHTML = "<span>"+this.cancelLabel+"</span>";
            $(this.closeButton).addClass("loginButton");
        
            this.loginButton = document.createElement("a");
            // this.resumeButton.style.height="10%";
            // this.resumeButton.style.width="20%";
            this.loginButton.href = "#";
            this.loginButton.innerHTML = "<span>"+this.loginLabel+"</span>";
            $(this.loginButton).addClass("loginButton");

            this.textSpan = document.createElement("div");
            this.textSpan.style['position']="absolute";
            this.textSpan.style.color="white";
            $(this.textSpan).addClass("loginLabel");
        
            this.btnSpan = document.createElement("div");
            this.btnSpan.style['position'] = "absolute";
            $(this.btnSpan).addClass("loginButtonContainer");
        
			this.btnSpan.appendChild(this.instructionsDiv);
			this.btnSpan.appendChild(this.formDiv);
            this.btnSpan.appendChild(this.closeButton);
            this.btnSpan.appendChild(this.loginButton);

            this.view.appendChild(this.blocker);

            this.ui.appendChild(this.textSpan);
            this.ui.appendChild(this.btnSpan);

			this.view.appendChild(this.ui);

            this.parent.appendChild(this.view);  

    		$(this.loginButton).children().first().css('line-height', $(this.loginButton).height()+"px");
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
            callback();
        }
        
        this.loginButton.onclick = function(e){
            if (!e) 
                var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) 
                e.stopPropagation();
                
            me.view.style.display="none";
            callback(me.usernameInput.value, me.passwordInput.value);
        }

        //on ipad, we have to hide the controls, on iPhone, we have to hide the entire video tag...

        if (tpIsIPhone())
            this.video.style.display="none";        
        else if (tpIsIOS())
        {
            this.video.controls = false;
        }

        this.view.style.display = "";
		this.ui.style.display = "";

		this.centerUI();
    },

	centerUI: function()
	{
			if ($(this.btnSpan).height() == 0)
			{
				var me = this;
				setTimeout(function() { me.centerUI();}, 100);
			}
		            //centering the buttons
		            var ah = $(this.textSpan).height();
		    		var ph = $(this.textSpan).parent().height();
		    		var mh = Math.floor((ph-ah) / 10);
		//    		$(this.textSpan).css('margin-top', mh);


		    		ah = $(this.btnSpan).height();
		    		ph = $(this.btnSpan).parent().height();
		    		mh = Math.floor((ph-ah) / 2);
		    		$(this.btnSpan).css('margin-top', mh);

		    		ah = $(this.btnSpan).width();// - $(this.passwordDiv).width();
		
		$(this.usernameInput).css('width', 0.66 * $(this.usernameInput).parent().width());
		$(this.passwordInput).css('width', 0.66 * $(this.passwordInput).parent().width());
	}

});

var idm = new $pdk.plugin.Identity();
$pdk.controller.plugInLoaded(idm);