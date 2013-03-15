$pdk.ns("$pdk.plugin.mvpdPicker");
$pdk.plugin.mvpdPicker = $pdk.extend(function(){},
{
	VERSION : "1.0",
	
	constructor : function()
	{
        tpDebug("mvpdPicker Plugin instantiated.");
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
		
		try {
			adobePassShim.parseResourceIds(lo.vars["resourceIdMap"]);
			console.log(this.resourceIds);
		}
		catch (error) {
			tpDebug("Error: malformed resource id map!");
		}
		
		if (window.adobePassResourceIds && this.provider)
		{
			adobePassShim.setResourceId(window.adobePassResourceIds[this.provider]);
		}
		
		tpDebug("mvpdPickerPlugin loaded");
	},
	
	getResourceId: function(provider)
	{
		return this.resourceIds[provider];
	}
	
});

var mvpddiv = null;

if (!document.getElementById("mvpddiv"))
{
	mvpddiv = document.createElement("div");
	mvpddiv.id = "mvpddiv";
	document.body.appendChild(mvpddiv);
}
else {
	mvpddiv = document.getElementById("mvpddiv");
}

if (!document.getElementById("mvpdframe")) {
	var mvpdframe = document.createElement("iframe");
	mvpdframe.id = "mvpdframe";
	mvpdframe.style.display = "none";
	mvpddiv.appendChild(mvpdframe);
	tpDebug("mvpd iframe created");
}

var adobePassShim = {
    
    isSwf: true,
    playerLoaded: false,
    adobePassJS: {},
    adobePassSwf: "",
    resourceIdField: "resourceId",
    
    setJSAP: function(_ap)
    {
        this.adobePassJS = _ap;
	    this.isSwf = false;
    },
    
    setSwfAP: function(swf)
    {
	    this.adobePassSwf = swf;
        this.isSwf = true;
    },
    
    init: function()
    {
        tpController.addEventListener("OnPlayerLoaded", adobePassShim.registerAdobePassPlugin);
        //tpController.addEventListener("OnSetRelease", adobePassShim.onSetRelease);
    },
    
	parseResourceIds: function(map)
	{
		window.adobePassResourceIds = {};
		var pairs = unescape(map).split(",");

		for (var i=0; i<pairs.length; i++)
		{
			var pair = pairs[i].split(":");
			
			window.adobePassResourceIds[pair[0]] = pair[1];
		}
	},
	
    registerAdobePassPlugin: function()
    {
        tpDebug("***PLAYER LOADED***", "javascript", "AdobePassShim");

        if(!this.playerLoaded)
        {
            this.playerLoaded = true;
        }
        
    },
    
    //these are methods to the accessEnabler
    setRequestor: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_setRequestor();
            
        }else{
            
            this.adobePassJS.setRequestor();
        }
        
    },
    
    getAuthorization: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_getAuthorization();
            
        }else{
            
            this.adobePassJS.getAuthorization();
        }
    },
    
    checkAuthorization: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_checkAuthorization();
            
        }else{
            
            this.adobePassJS.checkAuthorization();
        }
        
    },
    
    checkAuthentication: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_checkAuthentication();
            
        }else{
            
            this.adobePassJS.checkAuthentication();
        }
    },
    
    setProviderDialogURL: function(url){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_setProviderDialogURL(url);
            
        }
	
	//this is not needed for Javascript AdobePass
    },
    
    getAuthentication: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_getAuthentication();
            
        }else{
            
            this.adobePassJS.getAuthentication();
        }
        
    },
    
    setSelectedProvider: function(id){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_setSelectedProvider(id);
	    
        }else{
            
            //send id back to javascript AccessEnabler
            this.adobePassJS.setSelectedProvider(id);
        }
        
    },
    
    getSelectedProvider: function(){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_getSelectedProvider();
            
        }else{
            
            this.adobePassJS.getSelectedProvider();
        }
        
    },

    selectedProvider: function(data){
	
	    if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_selectedProvider(data);
            
        }else{
            
	    
            this.adobePassJS.selectedProvider(data);
        }
	
    },
    
    getMetadata: function(key, inResourceId){
        
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_getMetadata(key, inResourceId);
            
        }else{
            
            this.adobePassJS.getMetadata(key, inResourceId);
        }
    },			

    setResourceId: function(id){
        if(this.isSwf){
            
            document.getElementById(this.adobePassSwf).ap_setResourceId(id);
            
        }else{
            
	        this.adobePassJS.setResourceId(id);
        }
    },
    
    setAuthenticationStatus: function(code){
	
	    if(this.isSwf){
                
            //this is done directly in the swf
            
        }else{
            
	        this.adobePassJS.setAuthenticationStatus(code);
	    
        }
	
    },
    
    setToken: function(resourceId, token){
	
	    if(this.isSwf){
                
            //this is done directly in the swf
            
        }else{
            
	        this.adobePassJS.setToken(resourceId, token);
	    
        }
	
    }, 
    
    setMetadataStatus: function(key, argument, value){
	
	    if(this.isSwf){
                
            document.getElementById(this.adobePassSwf).ap_setMetadataStatus(key, argument, value);
            
        }else{
            
	        this.adobePassJS.setMetadataStatus(key, argument, value);
        }
	
    },
    
    logout: function(){
	
        if(this.isSwf){

            document.getElementById(this.adobePassSwf).ap_logout();

        }else{

            this.adobePassJS.logout();
	    }
	
    }
}

function onTrackingData(trackingEventType, trackingData)
{
    if (trackingEventType == "authenticationDetection" && trackingData[1]) {
		if (window.adobePassResourceIds)
		{
	        adobePassShim.setResourceId(adobePassResourceIds[trackingData[1]]);
		}
		else
		{
			mvpdPickerPlugIn.provider = trackingData[1];
		}
    }
}

function onSetProvider(providerId)
{
	if (window.adobePassResourceIds)
	{
		adobePassShim.setResourceId(adobePassResourceIds[providerId]);
	}
	else
	{
		mvpdPickerPlugIn.provider = trackingData[1];
	}
}

function onAuthenticationStatus(authenticated, error)
{
	if (authenticated == 1)
	{
//		document.getElementById("login").style.display = "none";
//		document.getElementById("logout").style.display = "block";
	}
	else
	{
//		document.getElementById("login").style.display = "block";
//		document.getElementById("logout").style.display = "none";
	}
}

function tokenFailed(resource, code)
{
	//alert("[" + code + "] Token request failed for resource: " + resource);
}

var mvpdPickerCreated = false;

function displayMVPDPicker(arr)
{

	var width = 400;
	var height = 40 * arr.length + 50;

	_adobePassLightBox();
 
	if (!document.getElementById("mvpdList")) {
		var mvpdList = document.createElement("div");
		mvpdList.id = "mvpdList";
		mvpdList.innerHTML = "<div style='text-align: left; font-family: Helvetica; font-size: 14px; padding: 5px; padding-left: 22px; padding-top: 3px'>Please select your TV service provider from the list below.</div>"
	}
	else {
		var mvpdList = document.getElementById("mvpdList");
	}

    document.getElementById("mvpddiv").appendChild(mvpdList);

//    mvpdList.style.width = "100%";
	mvpdList.style.marginLeft = "auto";
	mvpdList.style.marginRight = "auto";
    mvpdList.style.height = "100%";
    mvpdList.style.display = "block";

    document.getElementById("mvpdList").style.display = "block";
    document.getElementById("mvpddiv").style.display = "block";
    document.getElementById("closer").style.display = "block";
    document.getElementById("lightbox").style.display = "block";

    //create the iframe

	$("#mvpddiv").css($(".tpPlayer").offset());
	$("#mvpddiv").width($(".tpPlayer").width());
	$("#mvpdList").width( Math.floor(($(".tpPlayer").width()-5) / 129) * 129 + 5);
	$("#mvpdList").height( Math.floor(($(".tpPlayer").height()-5) / 35) * 35 + 5);
	$("#mvpddiv").height($(".tpPlayer").height());

	mvpdList.style.backgroundColor = "#FFFFFF";
	mvpdList.style.borderRadius = "9px";


    // document.getElementById("mvpddiv").style.width = width + "px";
    // document.getElementById("mvpddiv").style.height = height + "px";
    // document.getElementById("mvpddiv").style.top = (document.body.offsetHeight - height) / 2 + "px";
    // document.getElementById("mvpddiv").style.left = (document.body.offsetWidth - width) / 2 + "px";

	document.getElementById("closer").style.top = $("#mvpdList").offset().top + 5 + "px";
	document.getElementById("closer").style.left = $("#mvpdList").offset().left + 5 + "px";
	document.getElementById("closer").style.fontFamily = "helvetica";
	document.getElementById("closer").style.fontSize = "12px";
	document.getElementById("closer").style.backgroundColor = "#CCC";
	document.getElementById("closer").style.lineHeight = "12px";
	document.getElementById("closer").style.textAlign = "center";
	document.getElementById("closer").style.borderRadius = "6px";
	document.getElementById("closer").style.width = "12px";
	document.getElementById("closer").style.height = "12px";
	

    if (!mvpdPickerCreated)
    {
        for(var i = 0; i < arr.length; i++)
        {
			var div = document.createElement("div");
			div.className = "providerDiv";
			div.style.padding = "5px";
			div.style.marginLeft = "5px";
			div.style.marginTop = "5px";
			div.style.height = "35px";
			div.style.lineHeight = "35px";
			div.style.border = "1px solid #999";
			div.style.borderRadius = "5px";
			div.style.textAlign = "center";
			div.style.cursor = "pointer";

            var img = document.createElement("IMG");
            img.id = arr[i].ID;
            img.src = arr[i].logoURL;
			div.img = img;
            div.onclick = function(){onSelectMVPD(this.img);};
			div.appendChild(img);
            document.getElementById("mvpdList").appendChild(div);
        }
		$(".providerDiv").css("float", "left");

        mvpdPickerCreated = true;
    }


    document.getElementById("mvpdList").style.display = "block";    
}

if (window.adobePassShimLoaded)
{
	window.adobePassShimLoaded(adobePassShim);
}

function  onSelectMVPD(link)
{
	adobePassShim.setSelectedProvider(link.id);

    closeMVPD();
}

function closeMVPD()
{
    document.getElementById("mvpddiv").style.display = "none";
    document.getElementById("mvpdList").style.display = "none";
    document.getElementById("lightbox").style.display = "none";
    document.getElementById("closer").style.display = "none";
}

// Use the logout method even when a user starts the login process but then 
// aborts it even without attempting to login (if they realize they forgot their
// password or they don't have an account with any of the available MVPDs, for example).
// Failing to do so will leave Adobe Pass in an unusable state. 
function closeSession()
{
    logout();//logging out allows the user to try to log in again, otherwise it will throw an error
    adobePassShim.setSelectedProvider(null);//setting the provider to null prevents the pdk from opening the picker every time there's a new release
}

function createMVPDIFrame(width,height)
{
	_adobePassLightBox();
	
	if (!document.getElementById("mvpdframe")) {
		var mvpdframe = document.createElement("iframe");
		mvpdframe.id = "mvpdframe";
		mvpdframe.style.display = "none";
		document.body.appendChild(mvpdframe);
	}
	else
	{
		var mvpdframe = document.getElementById("mvpdframe");
	}

	document.getElementById("mvpdframe").style.display = "block";
    document.getElementById("mvpddiv").style.display = "block";
    document.getElementById("lightbox").style.display = "block";
    document.getElementById("closer").style.display = "block";

	mvpdframe.style.width = "100%";
	mvpdframe.style.height = "100%";
	mvpdframe.style.background = "#ffffff";
    
    //create the iframe
    document.getElementById("mvpddiv").style.width = width + "px";
    document.getElementById("mvpddiv").style.height = height + "px";
	document.getElementById("mvpddiv").style.top = (Math.max(document.body.offsetHeight, window.offsetHeight) - height) / 2 + "px";
	document.getElementById("mvpddiv").style.left = (document.body.offsetWidth - width) / 2 + "px";
	
	document.getElementById("closer").style.top = (Math.max(document.body.offsetHeight, window.offsetHeight) - height) / 2 - 20 + "px";
	document.getElementById("closer").style.left = $("#mvpddiv").offset().left + 5 + "px";//document.getElementById("mvpddiv").style.left;
}

function _adobePassLightBox()
{

	if (!document.getElementById("lightbox"))
	{
		var lightbox = document.createElement("div");
		lightbox.id = "lightbox";
		document.body.appendChild(lightbox);
		
		var closer = document.createElement("a");
		closer.href="#";
		closer.id = "closer";
		closer.style.position = "absolute";
//		closer.style.padding = "4px";
		closer.style.color = "white";
		closer.style.textDecoration = "none";
		closer.backgroundColor = "#666666";
		
		closer.onclick = function(e) { closeMVPD(); closeSession(); } 
		closer.innerHTML = "X";
		closer.style.zIndex = "1001";
		closer.style.display = "none";
		document.body.appendChild(closer);
	}
	else {
		var lightbox = document.getElementById("lightbox");
	}
	
	lightbox.style.position = "absolute";
	lightbox.style.width = "100%";
	lightbox.style.height = "100%";
	lightbox.style.display = "none";
	lightbox.style.top = "0";
	lightbox.style.left = "0"
	lightbox.style.backgroundColor = "#000000";
	lightbox.style.opacity = "0.6";
	lightbox.style.filter = "alpha(opacity=60)";
	lightbox.style.zIndex = "1000";

	if (!document.getElementById("mvpddiv"))
	{
		var mvpddiv = document.createElement("div");
		mvpddiv.id = "mvpddiv";
		document.body.appendChild(mvpddiv);
	}
	else {
		var mvpddiv = document.getElementById("mvpddiv");
	}
	mvpddiv.style.position = "absolute";
	mvpddiv.style.display = "none";
	mvpddiv.style.zIndex = "1001";	
	
	if (document.getElementById("mvpddiv")) {
		document.getElementById("mvpddiv").style.display = "none";
	}

	if (document.getElementById("mvpdList")) {
		document.getElementById("mvpdList").style.display = "none";
	}

	if (document.getElementById("mvpdframe")) {
		document.getElementById("mvpdframe").style.display = "none";
	}

}

// Use the logout method even when a user starts the login process but then 
// aborts it even without attempting to login (if they realize they forgot their
// password or they don't have an account with any of the available MVPDs, for example).
// Failing to do so will leave Adobe Pass in an unusable state. 
function logout()
{
    adobePassShim.logout();
}

function login()
{
    adobePassShim.getAuthentication();
}

try {
	var mvpdPickerPlugIn = new $pdk.plugin.mvpdPicker();
	tpController.plugInLoaded(mvpdPickerPlugIn, null);
}
catch (error)
{
	tpDebug("Skipping mvpdPicker JS instantiation, because we're running in Flash hosted mode.")
}
