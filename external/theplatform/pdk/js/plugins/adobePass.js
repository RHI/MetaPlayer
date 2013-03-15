// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.AdobePass");

$pdk.plugin.AdobePass = $pdk.extend(function(){},
{
    
    resourceId: "",
    requestorId: "",
    releaseURL: "",
    accessEnablerURL: "",
    authStatus: 0,
    shortTokenName: "auth",
    aeLoaded: false,
    releaseSet: false,
    promptImmediately: false,
    
    //callbacks
    entitlementLoadedCallback: "",
    createIFrameCallback: "",
    setTokenCallback: "",
    displayProviderDialogCallback: "",
    tokenRequestFailedCallback: "",
    setAuthenticationStatusCallback: "",
    setMetadataStatusCallback: "",
    selectedProviderCallback: "",
    setMovieDimensionsCallback: "",
    sendTrackingDataCallback:"",
    
    constructor : function(){
            
            
    },
    
    initialize : function(loadObj){
        

        tpDebug("******initialising adobe pass.....********");
        
        this.priority = loadObj.priority;
        this._controller = loadObj.controller;
        this.accessEnablerURL = loadObj.vars["accessEnablerURL"]; 
        this.requestorId = loadObj.vars["requestorId"];

		if (this.accessEnablerURL.indexOf(".swf") == this.accessEnablerURL.length-4)
		{
			this.accessEnablerURL = this.accessEnablerURL.replace(".swf", ".js");
		}

        if (loadObj.vars["promptImmediately"])
        {
            this.promptImmediately = loadObj.vars["promptImmediately"] == "true" ? true : false;
        }
        
        this.entitlementLoadedCallback = loadObj.vars["entitlementLoadedCallback"];
	this.createIFrameCallback = loadObj.vars["createIFrameCallback"];
        this.setTokenCallback = loadObj.vars["setTokenCallback"];
	this.displayProviderDialogCallback = loadObj.vars["displayProviderDialogCallback"];
        this.tokenRequestFailedCallback = loadObj.vars["tokenRequestFailedCallback"];
        this.setAuthenticationStatusCallback = loadObj.vars["setAuthenticationStatusCallback"];
        this.setMetadataStatusCallback = loadObj.vars["setMetadataStatusCallback"];
        this.selectedProviderCallback = loadObj.vars["selectedProviderCallback"];
        this.setMovieDimensionsCallback = loadObj.vars["setMovieDimensionsCallback"];
        this.sendTrackingDataCallback = loadObj.vars["sendTrackingDataCallback"];
        
        tpDebug("***the accessEnablerURL attribute is " + loadObj.vars["accessEnablerURL"]);
        tpDebug("***the requestorId attribute is " + loadObj.vars["requestorId"]);
        
        try{
            
            this._controller.registerMetadataUrlPlugIn(this, this.priority);
            
        }catch(e){
            
            tpDebug("WARN: " + e.message);
        }
        
        this.loadAccessEnabler();
    },
    
    
    loadAccessEnabler: function(){
        
        //load access enabler
        var script = document.createElement('script');
        script.setAttribute("type","text/javascript");
        script.setAttribute("src", this.accessEnablerURL);
        
        document.getElementsByTagName("head")[0].appendChild(script);
    },
    
    setRequestor: function(){
        
        tpDebug("******set requestor********");
        
        this.getAccessEnabler().setRequestor(this.requestorId);
        
        if (this.promptImmediately || this.releaseURL)
        {
            this.checkAuthentication();
        }

    },
    
    getAccessEnabler: function() {
        return ae;
    },
    
    rewriteMetadataUrl : function(releaseUrl, isPreview){
        
        tpDebug("***inside rewrite metadataURL..." + isPreview);
        
        this.releaseURL = releaseUrl;
        this.releaseSet = false;
        
        if(isPreview){
            
            return false;
            
        }else{
            
	    if(this.aeLoaded){
		
		if(this.authStatus==1){
		    
		    this.getAuthorization();
		    
		}else{
		    
		    this.getAuthentication();
		    
		}
	    }
        }
        
        //this should cause it to work...
        if (tpIsIOS())
            this._controller.writePlayer("",true);
        
        return true;
    },
    
    checkAuthentication: function(){
        
        this.getAccessEnabler().checkAuthentication();
        
    },
    
    getAuthentication: function(){
        
        this.getAccessEnabler().getAuthentication();
        
    },
    
    setSelectedProvider: function(id){
      
      this.getAccessEnabler().setSelectedProvider(id);
        
    },
    
    getSelectedProvider: function(){
        
        this.getAccessEnabler().setSelectedProvider(id);
        
    },
    
    selectedProvider: function(result){
        
        
    },
    
    checkAuthorization: function(){
      
          
    },
    
    getAuthorization: function(){
        
        if(!this.releaseSet){
            
            this.getAccessEnabler().getAuthorization(this.resourceId);
                
        }
        
    },
    
    setToken: function(resourceId, token){
        
        this._controller.setToken(token,"urn:theplatform:auth:adobe");
        
        var escapedToken = encodeURIComponent(token);
        
        if(this.releaseURL!=""){
            
            if (this.releaseURL.indexOf("?") >= 0){
            
                this.releaseURL += "&" + this.shortTokenName + "=" + escapedToken;
                
            }else{
                
                    this.releaseURL += "?" + this.shortTokenName + "=" + escapedToken;
            }
            
            tpDebug("***token received, new url is " + this.releaseURL);
            
            this._controller.setMetadataUrl(this.releaseURL);   
            
        }
    },
    
    tokenRequestFailed: function(inRequestedResourceID, inRequestErrorCode, inRequestDetails){
	
	
    },
    
    logout: function(){
        
        this.getAccessEnabler().logout();
        
    },
    
    setAuthenticationStatus: function(_status){
        
        tpDebug("***setting authentication status...");
        
        this.authStatus = _status;
        
        if(this.authStatus==1){
            
            this.getAuthorization();
                
        }
        
    },
    
    setResourceId: function(id){
        
        tpDebug("***Inside setResrouceId, resource id is " + id);
        this.resourceId = id;
        
    },
    
    setMetadataStatus: function(key, argument, value){
        
           
    },
    
    getMetadata: function(key, inResourceId){
        
        this.getAccessEnabler().getMetadata(key, [id]);
    }
    
});

var ap = new $pdk.plugin.AdobePass();
tpController.plugInLoaded(ap);

var adobePassShim;
if (adobePassShim != null)
{
	adobePassShim.setJSAP(ap);
}
else
{
	window.adobePassShimLoaded = function(aps)
	{
		adobePassShim.setJSAP(ap);
	}
}


//AccessEnabler call backs for Javascript ONLY
function entitlementLoaded(){
    
    ap.aeLoaded = true;
    
    ap.setRequestor(); 
    
    if(ap.entitlementLoadedCallback!=undefined){
        
        eval(ap.entitlementLoadedCallback + '()');
        
    }
}

function setAuthenticationStatus(authenticated, errorCode){
    
     if(authenticated==0){
	
	//not logged in
	ap.getAuthentication();
	
    }else{
	
	//logged in
	ap.setAuthenticationStatus(authenticated);
    }   
    
    if(ap.setAuthenticationStatusCallback!=undefined){
        
        eval(ap.setAuthenticationStatusCallback + '(authenticated, errorCode)');
        
    }
}

function displayProviderDialog(arr){
    
    if(ap.displayProviderDialogCallback!=undefined){
	
	eval(ap.displayProviderDialogCallback + '(arr)');

    }else{
	
	for(var i = 0; i < arr.length; i++){
	    
	    var img = document.createElement("IMG");
	    img.className = "providerDiv"
	    img.id = arr[i].ID
	    img.src = arr[i].logoURL;
	    img.onclick = function(){adobePassShim.onSelectMVPD(this);};
	    
	    document.getElementById("mvpdList").appendChild(img);
	    
	}
	
	document.getElementById("mvpdList").style.display = "block";
	document.getElementById("lightbox").style.display = "block";
    }
}

function createIFrame(width, height){
    
    if(ap.createIFrameCallback!=undefined){
	
	eval(ap.createIFrameCallback + '(width, height)');
	
    }else{
	
	//position the parent div
	
	document.getElementById("mvpddiv").style.display = "block";
	document.getElementById("lightbox").style.display = "block";
	
	//create the iframe
	document.getElementById("mvpddiv").style.width = width + "px";
	document.getElementById("mvpddiv").style.height = height + "px";
	
	//create the iframe
	document.getElementById("mvpdframe").style.width = width + "px";
	document.getElementById("mvpdframe").style.height = height + "px";
	
    }
    
}

function setToken(resourceId, token){
    
    ap.setToken(resourceId, token);
    
    if(ap.setTokenCallback!=undefined){
        
        eval(ap.setTokenCallback + '(resourceId, token)');
        
    }
}

function tokenRequestFailed(inRequestedResourceID, inRequestErrorCode, inRequestDetails){
    
    ap.tokenRequestFailed(inRequestedResourceID, inRequestErrorCode, inRequestDetails);
    
    if(ap.tokenRequestFailedCallback!=undefined){
        
        eval(ap.tokenRequestFailedCallback + '(inRequestedResourceID, inRequestErrorCode, inRequestDetails)');
        
    }
}

function setMetadataStatus(key, argument, value){
    
    ap.setMetadataStatus(key, argument, value);
    
    if(ap.setMetadataStatusCallback!=undefined){
        
        eval(ap.setMetadataStatusCallback + '(key, argument, value)');
        
    }
}

function selectedProvider(result){
    
    ap.selectedProvider(result);
    
    if(ap.selectedProviderCallback!=undefined){
        
        eval(ap.selectedProviderCallback + '(result)'); 
        
    }
}

function setMovieDimensionsCallback(w, h){
    
    
    if(ap.setMovieDimensionsCallback!=undefined){
        
        eval(setMovieDimensionsCallback + '(w, h)');
        
    }else{
        
        
    }
    
}

function sendTrackingData(trackingEventType, trackingData){
    
    if(ap.sendTrackingDataCallback!=undefined){
        
        eval(ap.sendTrackingDataCallback + '(trackingEventType, trackingData)');
        
    }
    
}