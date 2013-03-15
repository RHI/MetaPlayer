SampleOverlayPlugIn = Class.extend({

	init: function() {
		this.canPlay = false;
		this.isPlaying = false;
		this.overlay = document.createElement("div");
		this.overlay.innerHTML = "";
		this.overlay.style.textAlign = "center";
		this.overlay.style.position = "relative";
		this.overlay.style.top = "0px";
		this.overlay.style.left = "0px";
		this.overlay.style.color = "yellow";
		this.overlay.style.background = "blue";
		this.overlay.style.zIndex = 150;
		this.overlay.style.opacity = "0.5";
	},
	
	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;
		this.overlay.innerHTML = loadObj.vars.welcome;
		this.overlay.onclick = function()
        {
            me.toggle.apply(me, arguments);
            return false;
        };
		this.controller.addEventListener("OnMediaPlaying", function(){ me.handleMediaPlaying.apply(me, arguments);});
		this.controller.addEventListener("OnMediaStart", function(){ me.handleMediaStart.apply(me, arguments); });
		this.controller.addEventListener("OnMediaEnd", function(){ me.handleMediaEnd.apply(me, arguments); });
		this.controller.addEventListener("OnMediaError", function(){ me.handleMediaError.apply(me, arguments); });
		this.controller.addEventListener("OnMediaPause", function(){ me.handleMediaPause.apply(me, arguments); });
		this.controller.addEventListener("OnMediaUnpause", function(){ me.handleMediaUnpause.apply(me, arguments); });		
	},

	handleMediaPlaying: function(e) {    
		var time = Math.round(e.data.currentTime * 100) / 100;
		this.overlay.innerHTML = "Current position: " + time + " second" + (time == 1 ? "" : "s");
	},
	
	handleMediaStart: function(e) {
		this.canPlay = true;
		this.isPlaying = true;
		this.overlay.style.cursor = "pointer";
		this.overlay.title = "Click to Pause";
	},
		
	handleMediaEnd: function(e) {
		this.canPlay = false;
		this.isPlaying = false;
		this.overlay.title = "";
		this.overlay.style.cursor = "";
	},

	handleMediaPause: function(e) {
		this.isPlaying = false;
		this.overlay.title = "Click to Play";
	},
		
	handleMediaUnpause: function(e) {
		this.isPlaying = true;
		this.overlay.title = "Click to Pause";
	},
	
	handleMediaError: function(e) {
		this.overlay.innerHTML = "There was an error";
	},
	
	toggle: function() {
		if (this.canPlay)
		{
			this.controller.pause(this.isPlaying);
		}
	}	
	
});
                                                      
// create an instance of the plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's layer (any html element)
var sampleOverlayPlugIn = new SampleOverlayPlugIn();
tpController.plugInLoaded(sampleOverlayPlugIn, sampleOverlayPlugIn.overlay);