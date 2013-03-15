// The PDK provides simple class inheritance based on the 
// ideas demonstrated at http://ejohn.org/blog/simple-javascript-inheritance/

SampleUrlPlugIn = Class.extend({

	// Any non-PDK related initialization can go here. 
	init: function() {	
		
	},
	// This method is called by the PDK when the plug-in code is loaded into the player
	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;     
		// A simple option to demonstrate asynchronous operation 
		// (should the plug-in need to reach out for the new URL) 
		this.asynchronous = loadObj.vars['asynchronous'] === 'true';
		// In this example we're not going to actually modify the URL, 
		// but we will change the title to demonstrate that something did happen.
		this.newTitle = loadObj.vars['newTitle'];
		
		// Finally, register the plug-in with the controller
		// to be able to accept URL rewriting requests. 
		this.controller.registerURLPlugIn(this,loadObj.type,loadObj.priority);      

	},
	
	// This method must be implemented on the class. It does the actual work
	// of inspecting the clip data and making the necessary changes. 
	rewriteURL: function(clip){
	    	    
	    var me = this;
	    
		// In this example we just change the title, but in real example
		// you'd modify the url. 
	    if (clip.title != undefined)
	        clip.baseClip.title += " "+this.newTitle;
	    else
	        clip.baseClip.title = this.newTitle;
			
		// We can change the clip information within the function...
		if (!this.asynchronous)
		{
	        this.controller.setClip(clip);
	    }	
	    else
		{
			// Or we can do so afterwards. 
			setTimeout(function(){
				me.controller.setClip(clip);
			},250);
		}
	    
	    // Return true if you'll be modifying the URL. 
		// Otherwise return false to have the player use the original data.
		// But if you do return true, you must call setClip to resume playback. 
		// The player will wait until you do. 
	    return true;
	}		
});

// Create an instance of the plug-in.
var sampleUrlPlugIn = new SampleUrlPlugIn();
// And add it to the collection of plug-ins to be loaded. 
tpController.plugInLoaded(sampleUrlPlugIn);