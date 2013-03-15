//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

if (window.addEventListener){
	window.addEventListener("load", setupRatingWidget, true);
} else if (window.attachEvent){
	window.attachEvent("onload", setupRatingWidget );
}

var tpRatingWidget;

function setupRatingWidget(evt) {
	
	// Only setup the widget if a div has been registered to load the widget into.
	if (tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.ratingWidgetTypeName) != null && tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.ratingWidgetTypeName ).length > 0) {	
		
		// Set up widget and register it with the widget manager.
		tpRatingWidget = new CommunityManagerRating(tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.ratingWidgetTypeName ), tpCommunityWidgetManager.getCommunityManager(), tpMediaDataServicePrefix + "data/Media/", "1.0", tpRatingDataServicePrefix, tpTotalRatingDataServicePrefix);
		tpCommunityWidgetManager.registerWidget( tpCommunityWidgetManager.ratingWidgetTypeName, tpRatingWidget );

		// Register for changes to other state on the page.
		tpCommunityWidgetManager.getCommunityManager().registerForAuthentication(tpRatingWidget.signInRefresh.bindTo(tpRatingWidget));
		
		// Register for PDK player events.
		tpController.addEventListener("OnMediaStart", loadRatings);
		tpController.addEventListener("OnReleaseStart", loadRatings);
        tpController.addEventListener("OnLoadReleaseUrl", loadRatings);

        // Be optimistic, and assume read-write access until we get an exception that tells us otherwise
        tpRatingWidget.setRights("read_write");

        // Activate widget
		tpRatingWidget.activate();
	}
}

function loadRatings(evt) {
	tpCommunityWidgetManager.getWidget( tpCommunityWidgetManager.ratingWidgetTypeName ).activate(evt);
}

CommunityManagerRating = function() {
	this._initialize.apply(this, arguments);
}

CommunityManagerRating.prototype = {
	_initialize: function(widgetSelector, communityManagerInstance, objectURIPrefix, schemaVersion, ratingInstance, totalRatingInstance, darkStarImage, starImage, brightStarImage) {
		this.widgetContainer = j$(widgetSelector)[0];
		j$(this.widgetContainer).hide();
		j$(this.widgetContainer).addClass("communityManagerRatingWidget");		
		this.cmInstance = communityManagerInstance;		
		this.starWrapper = DomFragment("span", {
			style: {
				position: "absolute"
			}
		});
		this.objectURIPrefix = objectURIPrefix;		
		this.schemaVersion = schemaVersion;
		this.ratingInstance = ratingInstance;
		this.totalRatingInstance = totalRatingInstance;		
		this.darkStarImage = darkStarImage;
		this.starImage = starImage;
		this.brightStarImage = brightStarImage;		
		this.ratingSet = false;		
		this._createStars();
		this._createText();
	},
	activate: function(evt){
		if (typeof evt == "undefined") {
			if (this.objectURI) {
				this.refreshRatings();
			}
		} else if (evt.type == "OnReleaseStart") {
			this._clearRatings();
			var contentIndex = this.cmInstance.getContentIndex(evt);
			if (contentIndex >= 0) {
				this.clip = evt.data.clips[contentIndex];
                this.objectURI = this.objectURIPrefix + this.clip.baseClip.contentID;
				this.refreshRatings();
			} else {
				this.objectURI = undefined;
			}
		} else if ( evt.type == "OnMediaStart" ) {
			if (!evt.data.baseClip.isAd) {
				var newObjectURI = this.objectURIPrefix + evt.data.baseClip.contentID;
				if (newObjectURI != this.objectURI ) {
                    this.clip = evt.data;
					this.objectURI = newObjectURI;
					this.refreshRatings();
				}
			}
		} else if ( evt.type == "OnLoadReleaseUrl" ) {
            // TODO this should be a Clip object, but it's a Release object
            this.clip = evt.data;
            this.objectURI = evt.data.id;
            this.refreshRatings();
        }
	},
	refreshRatings: function() {
		this._setTextSpace("loading");
		j$(this.widgetContainer).show();
		this.revertDisplay();
		this.cmInstance.getRating(this.objectURI, this.schemaVersion, this.ratingInstance, this._processRating.bindTo(this));
		this.cmInstance.getTotalRating(this.objectURI, this.schemaVersion, this.totalRatingInstance, this._processTotalRating.bindTo(this));
	},
	signInRefresh: function(){
        this.setRights("read_write");
        this.activate();
	},
    setRights: function(rights) {
    	this._rights = rights;
    	this.stars.unbind("click");
    	this.stars.unbind("mouseover");
    	this.stars.unbind("mouseout");
	if ( rights == "read_write" || rights == "read" ) {
		this.stars.bind("mouseover", this, this._starOver);
		this.stars.bind("mouseout", this, this._starOut);
	}
	if (rights == "read_write" ) {
		this.stars.bind("click", this, this._starClick);	
	}
        if ( rights == "read" || rights == "none" ) {
		this.stars.bind("click", this, this._starClickLoginMessage);
	}
        if ( rights == "none" ) {
            this._setTextSpace("loginToView");
        }
    },
	_clearRatings: function () {
		j$(this.widgetContainer).hide();			
		this._setVisualRating(0, "");
		this.averageRating = undefined;
		this.myRating = undefined;
		this.ratingCount = undefined;
		this.ratingSet = false;
	},
	_createStars: function(){
		this.starContainer = DomFragment("div", {
			className: "cmStarSet",
			_cmData: {
				value: 0
			}
		});
		
		var tempStar;
		for (var s=0; s < 5; s++) {
			tempStar = DomFragment("span", {
				className: "cmRatingStar darkStar",
				innerHTML: s+1,
				_cmData: {
					value: s+1
				}
			});
			this.starContainer.appendChild(tempStar);
		};
		
		this.widgetContainer.appendChild(this.starContainer);
		
		this.stars = j$("span", this.starContainer);
	},
	_createText: function() {
		var spaceNames = [
			"loading",
			"mouseover",
			"starData",
			"ad",
			"loginToRateMessage",
            "loginToView"
		];
		for(var s=0; s<spaceNames.length; s++) {
			this._textSpaces[spaceNames[s]] = j$(DomFragment("span", {
				style: {
					display: "none"
				}
			})).eq(0);
		}
		// TODO: Get _textSpaces.ad to have innerHTML set through DomFragment
		this._textSpaces.loading.html("Loading&#8230;");
		this._textSpaces.ad.html("You can't rate an advertisement.");
		this._textSpaces.loginToRateMessage.html("Please sign in to rate a video.");
        this._textSpaces.loginToView.html("Please sign in to view ratings");
		
		this.textSpaceContainer = DomFragment("div", {
			className: "cmTextSpace",
			toAppend: [
				this._textSpaces.loading[0],
				this._textSpaces.mouseover[0],
				this._textSpaces.loginToRateMessage[0],
                this._textSpaces.loginToView[0],
				DomFragment(this._textSpaces.starData[0], {
					toAppend: {
						totalRating: DomFragment("span"),
						myRating: DomFragment("span")
					}
				}),
				this._textSpaces.ad[0]
			]
		});
		this.widgetContainer.appendChild(this.textSpaceContainer);
	},
	_textSpaces: {},
	_setMouseoverText: function(rating){
		var endText = (rating > 1)?"s.":"."
		this._textSpaces.mouseover.html("Click to rate as "+rating+" star"+endText);
		
	},
	_setTotalRatingText: function(average, count){
        this._textSpaces.starData[0]._cFrag.totalRating.innerHTML = "("+/*average+" star"+(average!=1?"s":"")+" &ndash; "+*/count+" rating"+(count!=1?"s":"")+")";
    },
	_setRatingText: function(value){
		if (value > 0) {
			this._textSpaces.starData[0]._cFrag.myRating.innerHTML = "&nbsp;Your rating: "+value+" star"+(value!=1?"s":"");
		} else {
			this._textSpaces.starData[0]._cFrag.myRating.innerHTML = "";
		}
	},
	_setTextSpace: function(textSpace){
		if(typeof this.textSpaceTimeout != "undefined") {
			clearTimeout(this.textSpaceTimeout);
		}
		for(var s in this._textSpaces) {
			if (s == textSpace) {
				this._textSpaces[s].show();
			} else{
				this._textSpaces[s].hide();
			};
		}
	},
	_clearTextSpace: function() {
		this._setTextSpace("none");
	},
	_setDefaultTextSpace: function() {
		if (this._rights == "none") {
			this._setTextSpace("loginToView");
		} else {
			this._setTextSpace("starData");
		}
	},
	revertDisplay: function() {
		if(typeof this.myRating != "undefined" && this.ratingSet == true) {
			// revert to myRating value
			this._setVisualRating(this.myRating, "myRating");
		} else if(typeof this.averageRating != "undefined") {
			// revert to averageRating value
			this._setVisualRating(this.averageRating, "averageRating");
		} else {
			// revert to blank state
			this._setVisualRating(0, "")
		}
	},
	_setVisualRating: function(rating, typeOfRating){
		if(typeOfRating == "myRating") {
			var removeClass = "star";
			var addClass = "brightStar";
		} else {
			var removeClass = "brightStar";
			var addClass = "star";
		}
		for(var s=0; s<rating; s++) {
			this.stars.eq(s).removeClass("darkStar").removeClass("halfStar").removeClass(removeClass).addClass(addClass)
		}
		if (Math.round(rating) > rating) {
			rating = Math.floor(rating);
			this.stars.eq(rating).removeClass("darkStar").removeClass(removeClass).addClass("halfStar");
			rating++;
		}		
		for(var s=rating; s<5; s++) {
			this.stars.eq(s).removeClass("star").removeClass("brightStar").removeClass("halfStar").addClass("darkStar");
		}
	},
	_starOver: function(evt){
		var self = evt.data;
		var target = evt.currentTarget||evt.target;
		self._setMouseoverText(target._cmData.value);
		self._setTextSpace("mouseover");
		self._setVisualRating(target._cmData.value, "myRating");
	},
	_starOut: function(evt){
		var self = evt.data;
		if(!evt.relatedTarget || (!j$(evt.relatedTarget).hasClass("cmRatingStar") && !j$(evt.relatedTarget.parentNode).hasClass("cmStarSet"))) {
			self.revertDisplay();
			self._setTextSpace("starData");
		}
	},
	_starClick: function(evt){
		var self = evt.data;
		var target = evt.currentTarget||evt.target;
		if(self.isAd != true) {
			self.cmInstance.addRating(self.objectURI, target._cmData.value, self.schemaVersion, self.ratingInstance, self._addRatingCallback.bindTo(self));
		} else {
			this.textSpaceTimeout = setTimeout(self._clearTextSpace.bindTo(self), "3000")
			self._setTextSpace("ad")
		}
	},
	_addRatingCallback: function(response) {
		if(this.cmInstance.isAuthException(response)) {
			alert("Please sign in to rate content.");
			this.setRights("read");
		} else if (this.cmInstance.isException(response)) {
			this.cmInstance.errorHandler(response);
		} else {
			this.ratingSet = true;
			if(typeof this.myRating != "undefined") {
				this.oldRating = this.myRating;
			}
			this.myRating = response.value;			
			tpController.dispatchEvent("OnAddRating", {rating: this.myRating, clip: this.clip});
			this._setRatingText(this.myRating);
			this._afterStarClick();
			this._setTextSpace("starData");
		}
	},
	_starClickLoginMessage: function(evt){
		var self = evt.data;
		self._setTextSpace("loginToRateMessage");
		self.textSpaceTimeout = setTimeout(self._setDefaultTextSpace.bindTo(self), "1500")
	},
	_afterStarClick: function(){
		var baseTotalRating = (this.rawAverageRating*this.ratingCount);
		if(typeof this.oldRating != "undefined" && this.oldRating > 0) {
			this._setAverageRating(((baseTotalRating-this.oldRating)+this.myRating)/this.ratingCount);
			this._setTotalRatingText(this.averageRating, this.ratingCount);
		} else {
			this.ratingCount++;
			this._setAverageRating((baseTotalRating+this.myRating)/this.ratingCount);
			this._setTotalRatingText(this.averageRating, this.ratingCount);
		}
	},
	_processRating: function(ratingObject){
		if(this.cmInstance.isAuthException(ratingObject)) {
            this.setRights("none");
            return false;
        }
        if(this.cmInstance.isException(ratingObject)) {
			this.cmInstance.errorHandler(ratingObject);
			return false;
		}
		if(ratingObject.entries.length > 0) {
			this.myRating = ratingObject.entries[0].value;
		} else {
			this.myRating = 0;
		}
		this._setRatingText(this.myRating);
	},
	_processTotalRating: function(totalRatingObject) {
		if(this.cmInstance.isAuthException(totalRatingObject)) {
            this.setRights("none");
            return false;
        }
        if(this.cmInstance.isException(totalRatingObject)) {
			this.cmInstance.errorHandler(totalRatingObject);
			return false;
		}
		if(totalRatingObject.entries.length > 0) {
			this._setAverageRating(totalRatingObject.entries[0].average);
			this.ratingCount = totalRatingObject.entries[0].count;
		} else {
			this._setAverageRating(0);
			this.ratingCount = 0;
		}
		this._setTotalRatingText(this.averageRating, this.ratingCount);
		this._setTextSpace("starData");
		this._setVisualRating(this.averageRating, "averageRating");
	},
	_setAverageRating: function(rawAverageRating) {
		this.rawAverageRating = rawAverageRating;
		this.averageRating = Math.floor(rawAverageRating);
		// remove this line to show only whole number average ratings
		if (rawAverageRating - this.averageRating >= 0.5) {
			this.averageRating += 0.5;
		}
	}	
}