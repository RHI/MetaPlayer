SampleOverlayedAdPlugIn = Class.extend({

	init: function() {
		this.player = document.createElement("div");
		this.player.innerHTML = "Sample Ad Overlay";
		this.player.style.textAlign = "center";
		this.player.style.lineHeight = "100px";
		this.player.id = "jeremy"
		this.player.style.position = "absolute";
		this.player.style.top = "0px";
		this.player.style.left = "0px";
		this.player.style.width = "100%";
		this.player.style.height = "100%";
		this.player.style.background = "red";
		this.player.style.display = "none";
	},
	
	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;           
		this.controller.registerClipWrapperPlugIn(this);
		this.controller.addEventListener("OnMediaLoadStart", function(){ me.handleMediaLoadStart.apply(me, arguments);});
	},

	wrapClip: function(clip) {  
		var adClip = {globalDataType:"com.theplatform.pdk.data::BaseClip"};
		adClip.URL = "http://www.sample.com/params/more/params/";
		adClip.title = "Advertisement"
		adClip.streamType = "empty";
		adClip.isAd = true;
		var playlist = {globalDataType:"com.theplatform.pdk.data::Playlist"};
		playlist.baseClips = new Array();
		playlist.baseClips.push(adClip);

		this.controller.setClipWrapper({clip: clip, preRolls: playlist, postRolls: null})
		return true;
	},
	
	handleMediaLoadStart: function(clip) {
		clearInterval(this.playbackInterval)
		if (clip.streamType == "empty" && clip.URL.match(/www.sample.com/)) {
			this.currentClip = clip;
			this.beginAdExperience();
		}
	},
	
	beginAdExperience: function() {       
		// by setting the display to null, it actually goes back to normal (eg displayed)
		this.player.style.display = null;
		                                                                
		// we need to tell the PDK we've started, or it will think something went wrong and skip us
		this.controller.dispatchEvent("OnMediaStart", this.currentClip);
		
		// our sample has a hard coded duration of 3 seconds, so we'll call done then
		var me = this;
		me.duration = 3;
		me.currentTime = 0;
		setTimeout(function() { me.done(); }, 3000);

		// we want to initialize the time display to 0
		this.mediaPlaying();                            
		// and then update it every 1/3 of a second, so other components know how far we are into the ad.
		clearInterval(this.playbackInterval)
		this.playbackInterval = setInterval(function() {me.mediaPlaying();}, 333)
	},
	
	mediaPlaying: function() {    
		this.controller.dispatchEvent("OnMediaPlaying", {currentTime: this.currentTime, duration: this.duration});  
		this.currentTime+=0.333;
	},
	
	done: function() {
		clearInterval(this.playbackInterval)
		this.player.style.display = "none";
		this.controller.endMedia();
	}
	
});
                                                      
// create an instance of teh plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's layer (any html element)
var overlayedAdPlugIn = new SampleOverlayedAdPlugIn();
tpController.plugInLoaded(overlayedAdPlugIn, overlayedAdPlugIn.player);