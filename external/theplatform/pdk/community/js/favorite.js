//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

// a reliable global variable that holds the widget
var tpFavoritesWidget;

// A constant that holds the name of the "Favorites" category in the CategoryList control.
var tpFavoritesCategoryName = "Favorites";

if (window.addEventListener){
	window.addEventListener("load", setupFavoriteWidget, true);
} else if (window.attachEvent){
	window.attachEvent("onload", setupFavoriteWidget );
}

function checkFavorites(evt) {
	tpFavoritesWidget.handleMediaChange(evt);
}
function showFavorites(evt){
	tpFavoritesWidget.handleCategoryChange(evt);
}
function clearFavorites(evt){
	tpFavoritesWidget.handleReleaseChange(evt);
}
function setupFavoriteWidget() {
	
	// Set up widget and register it with the widget manager.
	tpFavoritesWidget = new CommunityManagerFavorite( tpCommunityWidgetManager.getCommunityManager() );
	tpCommunityWidgetManager.registerWidget( tpCommunityWidgetManager.favoritesWidget);
	
	// Load it up with data.
	tpFavoritesWidget.activate();
	
	// Register for changes to other state on the page.
	tpCommunityWidgetManager.getCommunityManager().registerForSignIn(tpFavoritesWidget.handleSignIn.bindTo(tpFavoritesWidget));
	tpCommunityWidgetManager.getCommunityManager().registerForSignOut(tpFavoritesWidget.handleSignOut.bindTo(tpFavoritesWidget));
	
	// Register for PDK player events.
	tpController.addEventListener("OnMediaStart", checkFavorites);
    tpController.addEventListener("OnLoadReleaseUrl", checkFavorites);
	tpController.addEventListener("OnCategorySelected", showFavorites);
	tpController.addEventListener("OnReleaseStart", clearFavorites);
}

/* FAVORITES WIDGET OBJECT */
CommunityManagerFavorite = function() {
	this._initialize.apply(this, arguments);
}

CommunityManagerFavorite.prototype = {
	
	_initialize: function( communityManagerInstance ) {
		this.ratingsContainer = j$(tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.ratingWidgetTypeName ))[0];
		this.cmInstance = communityManagerInstance;
	},
	/*
	* Puts the favorites icon into the Release widget. Loads the UserList for this user.
	*/
	activate: function() {
		this.favoriteURIs = new Array();
		this.cmInstance.getUserList("tp_favorites", "1.0", tpUserListDataServicePrefix, this.receiveUserList.bindTo( this ));
	},
	/* 
	* Process the data service response
	*/
	receiveUserList: function( userListObject ) {
        this._rights = "read_write";
        this.hasFavoriteList = false;
        this.favoriteURIs = new Array();
        if (this.cmInstance.isAuthException(userListObject)) {
            this._rights = "none";
        } else if(this.cmInstance.isException(userListObject)) {
			this.cmInstance.errorHandler(userListObject);
		} else if ( userListObject.entries.length > 0) {
			this.hasFavoriteList = true;
			this.favoriteListURI = userListObject.entries[0].id;
            for (var i = 0; i < userListObject.entries[0].items.length; i++) {
                this.favoriteURIs.push(userListObject.entries[0].items[i].aboutId);
            }
		}

		// Detect if we've arleady loaded, if so, update the UI.
		if ( j$("#communityManagerFavoriteIcon").length > 0 )
			this.setFavoritesIcon(j$("#communityManagerFavoriteIcon")[0].name);
		
		if ( this.currentCategory == tpFavoritesCategoryName ) {
			this.updateReleaseModel();
		}
	},
	handleReleaseChange: function(evt) {
		if( j$("#communityManagerFavoriteIcon").length > 0) {
			var contentIndex = this.cmInstance.getContentIndex(evt);
			if (contentIndex >= 0) {
				this.clip = evt.data.clips[contentIndex];
				var mediaID = tpMediaDataServicePrefix + tpMediaDataServicePath + "/" + evt.data.clips[contentIndex].baseClip.contentID;
				this.setFavoritesIcon(mediaID);
				j$("#communityManagerFavoriteIcon").show();
			} else {
				j$("#communityManagerFavoriteIcon").hide();
			}	
		}
	},
	handleSignIn: function(evt) {
		this.cmInstance.getUserList("tp_favorites", "1.0", tpUserListDataServicePrefix, this.receiveUserList.bindTo( this ));
	},
	handleSignOut: function(evt) {
		this.cmInstance.getUserList("tp_favorites", "1.0", tpUserListDataServicePrefix, this.receiveUserList.bindTo( this ));
	},
	/*
	* As the Media that is playing back changes we'll need to update the favorites icon to be a plus or a minus.
	*/
	handleMediaChange: function(evt) {
		var mediaID = null;
        if (evt.type == "OnLoadReleaseUrl") {
            // TODO turn into a clip format?
            this.clip = evt.data;
            mediaID = evt.data.id;
        } else if (evt.type == "OnMediaStart" && !evt.data.baseClip.isAd) {
			this.clip = evt.data;
			mediaID = tpMediaDataServicePrefix + tpMediaDataServicePath + "/" + evt.data.baseClip.contentID;
        }
        if (mediaID) {
			this.setFavoritesIcon(mediaID);
			j$("#communityManagerFavoriteIcon").show();			
		}
	},
	/*
	* Tracks the state of the categories widget.
	*/
	handleCategoryChange: function(evt) {
		var oldCategory = this.currentCategory;
		this.currentCategory = evt.data;
		
		if (this.currentCategory == tpFavoritesCategoryName ) {
			this.updateReleaseModel();
		}
	},
	handleAddFavorite: function (evt) {
		var self = evt.data;
		var target = evt.currentTarget||evt.target;
		tpFavoritesWidget.addMediaToFavorites( target.name );
	},
	handleRemoveFavorite: function (evt) {
		var self = evt.data;
		var target = evt.currentTarget||evt.target;
		tpFavoritesWidget.removeMediaFromFavorites( target.name );
	},

	/*
	* If the Favorites Category is currently showing, update the underlying release model, otherwise noop.
	*/
	updateReleaseModel: function() {
		if (this._rights == "none") {
            alert("Please sign in to see your favorites.");
        }
        var IDArray = this.getFavoritesAsMediaIDs();
		var contentIDs = new Array();
		if ( IDArray.length > 0 ) {
			for ( var i = 0; i < IDArray.length; i++) {
				contentIDs.push(IDArray[i].substring(IDArray[i].lastIndexOf("/")+1));
			}
		} else {
			contentIDs.push(0);
		}
		tpController.refreshReleaseModel("", "", null, null, null, null, null, contentIDs);
	},
	/*
	* Updates the icon for whatever is appropriate given URI passed in.
	*/
	setFavoritesIcon: function( objectURI ) {
		var inFavorites = this.getFavoritesAsURIs( objectURI ).length != 0;
		if ( inFavorites ) {
			favoritesIcon = DomFragment("div", {
				title: "Remove from Favorites",
				id: "communityManagerFavoriteIcon",
				name: objectURI,
				className: "removeFromFavorites"
			});
		} else {
			favoritesIcon = DomFragment("div", {
				title: "Add to Favorites",
				id: "communityManagerFavoriteIcon",
				name: objectURI,
				className: "addToFavorites"
			});
		}
		if( j$("#communityManagerFavoriteIcon").length > 0) {
			j$("#communityManagerFavoriteIcon").replaceWith(favoritesIcon);
		} else {
			this.ratingsContainer.appendChild( favoritesIcon );
		}
		
		if ( inFavorites ) {
			j$("#communityManagerFavoriteIcon").bind( "click", this, this.handleRemoveFavorite );
		} else {
			j$("#communityManagerFavoriteIcon").bind( "click", this, this.handleAddFavorite );
		}
	},
	/*
	* Looks for the URI in the current Favorites model and removes it in memory and then sends the call to the data service to delete the item.
	*/
	removeMediaFromFavorites: function( objectURI ) {
        this.aboutId = objectURI;
		this.cmInstance.deleteUserListItem(objectURI, "1.0", tpUserListItemDataServicePrefix, this.handleRemoveFavoriteListItemResponse);
	},
    handleRemoveFavoriteListItemResponse: function ( response ) {
        if(tpCommunityManager.isAuthException(response)) {
            alert("Please sign in to remove favorites.");
        } else if (tpCommunityManager.isException(response)) {
           tpCommunityManager.errorHandler(response);
        } else {
            tpFavoritesWidget.favoriteURIs = jQuery.grep(tpFavoritesWidget.favoriteURIs, function (a) { return a.indexOf(tpFavoritesWidget.aboutId) == -1; });
            tpFavoritesWidget.setFavoritesIcon(tpFavoritesWidget.aboutId);
		    if ( tpFavoritesWidget.currentCategory == tpFavoritesCategoryName ) {
                tpFavoritesWidget.updateReleaseModel();
            }
            tpController.dispatchEvent("OnDeleteFavorite", {clip: tpFavoritesWidget.clip});
        }
    },
	/*
	* Looks for the URI in the current Favorites model and adds it in memory and then sends the call to the data service to add the item to the UserList.
	*/
	addMediaToFavorites: function( objectURI ) {
		tpFavoritesWidget.aboutId = objectURI;
		// update persistence.
		if ( this.hasFavoriteList ) {
			this.cmInstance.addUserListItem( this.favoriteListURI, objectURI, "1.0", tpUserListItemDataServicePrefix, this.handleCreateFavoriteListItemResponse)
		} else {
			this.cmInstance.addUserList( "Favorites", "tp_favorites", "1.0", tpUserListDataServicePrefix, this.handleCreateFavoriteListResponse)
		}
	},
    handleCreateFavoriteListResponse: function( response ) {
        if(tpCommunityManager.isAuthException(response)) {
            alert("Please sign in to add favorites.");
        } else if (tpCommunityManager.isException(response)) {
            tpCommunityManager.errorHandler(response);
        } else {
			tpFavoritesWidget.hasFavoriteList = true;
			tpFavoritesWidget.favoriteListURI = response.id;
            tpFavoritesWidget.favoriteURIs = new Array();
            tpCommunityManager.addUserListItem( tpFavoritesWidget.favoriteListURI, tpFavoritesWidget.aboutId, "1.0", tpUserListItemDataServicePrefix, tpFavoritesWidget.handleCreateFavoriteListItemResponse)
        }
	},
    handleCreateFavoriteListItemResponse: function ( response ) {
        if(tpCommunityManager.isAuthException(response)) {
            alert("Please sign in to add favorites.");
        } else if (tpCommunityManager.isException(response)) {
            tpCommunityManager.errorHandler(response);
        } else {
            tpFavoritesWidget.favoriteURIs = [ tpFavoritesWidget.aboutId ].concat( tpFavoritesWidget.favoriteURIs );
            tpFavoritesWidget.setFavoritesIcon(tpFavoritesWidget.aboutId);
		    if ( tpFavoritesWidget.currentCategory == tpFavoritesCategoryName ) {
                tpFavoritesWidget.updateReleaseModel();
            }
            tpController.dispatchEvent("OnAddFavorite", {clip: tpFavoritesWidget.clip});
        }
    },
	/*
	* Return back an  array of object URIs. Returns all the URIs if the filterPrefix param is null.
	*/
	getFavoritesAsURIs: function( filterPrefix ) {
		if ( filterPrefix != null && this.favoriteURIs && this.favoriteURIs.length > 0) {
			var returnArray = jQuery.grep(this.favoriteURIs, function (a) { return a.indexOf(filterPrefix) == 0; });
			return returnArray;
		} 
		return this.favoriteURIs;
	},
	/*
	* Return back an  array of content IDs for Media objects in the currently loaded favorites list.
	*/
	getFavoritesAsMediaIDs: function() {
		return this.getFavoritesAsURIs( tpMediaDataServicePrefix + tpMediaDataServicePath );
	}
}
	
	
	
	
	