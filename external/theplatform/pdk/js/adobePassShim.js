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