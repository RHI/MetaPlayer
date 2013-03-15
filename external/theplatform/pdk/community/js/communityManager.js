//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

/*
	This js file provides a convenient way to interact with Community Data, Identity, and Access Services. 
	
	It has no dependencies when the constructor is called without the deprecated 'DivID' arguments and may be used without the PDK widgets.
*/

// note that all of these paths _must not_ end with "/".
var tpMediaDataServicePath = "data/Media";
var tpRatingDataServicePath = "data/Rating";
var tpTotalRatingDataServicePath = "data/TotalRating";
var tpCommentDataServicePath = "data/Comment";
var tpUserListDataServicePath = "data/UserList";
var tpUserListItemDataServicePath = "data/UserListItem";
var tpUserProfileDataServicePath = "data/UserProfile";

// create a mapping for the jQuery "$" operator, to avoid conflicts with other
// frameworks that are also trying to map "$"
var j$ = jQuery.noConflict();

// make sure that jQuery doesn't include a "_" cache buster on calls
j$.ajaxSetup({"cache": true});

CommunityManager = function() {
	this._initialize.apply(this, arguments);
}

CommunityManager.index = 1;

CommunityManager.prototype = {

	// The ratingDivID, commentsDivID, and profileDivID arguments are deprecated.
	_initialize: function(accountURI, userContext, ratingDivID, commentsDivID, profileDivID) {
		// validate the accountURI
		if(accountURI == null || accountURI.length == 0) {
			alert("You need to provide the Account URI.");
			return false;
		} else {
			this.accountURI = accountURI;
		}
	
		// validate the userContext. It describes which adapter the identity service will use to authenticate the user.
		if(userContext == null || userContext.length == 0) {
			this.anonymousUser = true;
			this.userContext = null;
		} else {
			// add a trailing "/" if it's missing
			if (userContext.lastIndexOf("/") < (userContext.length-1)) {
  				userContext += "/";
			}
			this.anonymousUser = false;
			this.userContext = userContext;
		}
		
		// determine the ID for this script
		this.scriptID = "CommunityManager" + CommunityManager.index++;
		
		
		// For backwards compatibility, we'll remember various control div IDs and also set them up on the newer Community Manager Widget.
		if ( typeof ratingDivID != "undefined" && ratingDivID != null ) {
			this.ratingID = ratingDivID;
			tpCommunityWidgetManager.registerWidgetDiv(tpCommunityWidgetManager.ratingWidgetTypeName, ratingDivID);
		}
		if ( typeof commentsDivID != "undefined" && commentsDivID != null ){
			this.commentsID = commentsDivID;
			tpCommunityWidgetManager.registerWidgetDiv(tpCommunityWidgetManager.commentWidgetTypeName, commentsDivID);
		}
		if (typeof profileDivID != "undefined" && profileDivID != null ) {
			this.profileID = profileDivID;
			tpCommunityWidgetManager.registerWidgetDiv(tpCommunityWidgetManager.profileWidgetTypeName, profileDivID);
		}
		if ( typeof tpCommunityWidgetManager.getCommunityManager() == "undefined" ||  tpCommunityWidgetManager.getCommunityManager() == null )
			tpCommunityWidgetManager.setCommunityManager( this ) ;
		
		// track whether the user is signed in or not
		this.isAuthenticated = false;		
	},
	//get div selectors
	getRatingDivID: function () {
		return this.ratingID;
	},
	getCommentsDivID: function () {
		return this.commentsID;
	},
	getProfileDivID: function(){
		return this.profileID;
	},
	
	//profile events
	_userProfile: undefined,
	_setProfileEvents: [],
	registerForProfileChange: function(handler) {
		this._setProfileEvents.push(handler);
	},
	getProfile: function() {
		return this._userProfile;
	},
	setProfile: function(profile) {
		this._userProfile = profile;
		if (profile != undefined) {
		    tpController.dispatchEvent("OnUserProfileLoaded", profile);
		}
		if (this._setProfileEvents.length > 0) {
			for (var h=0; h<this._setProfileEvents.length; h++) {
				this._setProfileEvents[h](profile);
			}
		}
	},
	clearProfile: function() {
		this.setProfile(undefined);
	},
		
	//authentication functions	
	_signInEvents: [],
	_signOutEvents: [],
	registerForAuthentication: function(handler, authEvent){
		switch(authEvent||"") {
			case "signIn":
				this.registerForSignIn(handler);
				break;
			case "signOut":
				this.registerForSignOut(handler);
				break;
			default:
				this.registerForSignIn(handler);
				this.registerForSignOut(handler);
				break;
		}
	},
	registerForSignIn: function(handler){
		this._signInEvents.push(handler);
	},
	registerForSignOut: function(handler) {
		this._signOutEvents.push(handler);
	},
	signIn: function(userName, password, callback) {
		// set the user name
		this.userName = userName;
		// make the sign-in call
		var params = {
			username: this.userContext+userName,
			password: password
		}
		if (callback) {
			this.secondarySignInCallback = callback;
		} else {
			this.secondarySignInCallback = undefined;
		}
		// create a timer in case we don't hear back from the sign-in service
		this._signInTimeoutInterval = setInterval(this._signInTimeout.bindTo(this), 5000);
		this._makeJsonServiceCall(params, tpIdentityServicePrefix + "web/Authentication/signIn", false, "1.0", null, this._signInCallback.bindTo(this));
	},
	_signInTimeout: function() {
		// the sign in JSON call didn't fire a callback.  this can happen when the
		// sign-in servers are offline or refusing connection.  generate a exception
		// message, and make the callback
		clearInterval(this._signInTimeoutInterval);
		if (this.secondarySignInCallback) {
			this.secondarySignInCallback({isException:true,message:"Sign in is not currently available."});
		}	
	},
	_signInCallback: function(response) {
		clearInterval(this._signInTimeoutInterval);
		// if sign in was successful, get the canonical user name
		if (this.isException(response) != true) {
			this.isAuthenticated = true;
			this.token = response.signInResponse.token;
			if (response.signInResponse.idleTimeout > 0) {
				this.tokenRefreshInterval = setInterval(this._refreshToken.bindTo(this), response.signInResponse.idleTimeout);
			} else {
				clearInterval(this.tokenRefreshInterval);
			}
			this._getSelfID(this._getSelfIDCallback.bindTo(this));
		// if sign in failed, send the exception message to the immediate caller
		} else {
			if(this.secondarySignInCallback) {
				this.secondarySignInCallback(response);
			}
		}
	},			
	_getSelfID: function(callback) {
		var params = {
			token: this.token
		};
		// TODO: same notes as above
		this._makeJsonServiceCall(params, tpIdentityServicePrefix + "web/Self/getSelfId", false, "1.0", null, callback||this.errorHandler.bindTo(this));
	},
	_getSelfIDCallback: function(response){
		// if we could get the self ID, update info on the current user, and send this
		// response out to all event subscribers
		if (!this.isException(response)) {
			this.selfID = response.getSelfIdResponse.userId;
			tpController.dispatchEvent("OnSignIn", {userID: this.selfID, userName: this.userName});
			if(this._signInEvents.length > 0) {
				for(var h=0; h<this._signInEvents.length; h++) {
					this._signInEvents[h](response);
				}
			}
		}
		// if get self ID failed, send that message back to the caller
		if(this.secondarySignInCallback) {
			this.secondarySignInCallback(response);
		}
	},	
	_refreshToken: function(){
		this.getSelfID()
	},
	signInWithToken: function(token) {
		this.token = token;
	},
	signOut: function(callback) {
		// clear local sign-in info immediately.  even if the call below fails, we still want
		// to clear out the user's info
		var params = {
			"_token": this.token
		}
		this.token = undefined;
		this.selfID = undefined;
		this.isAuthenticated = false;
		this.clearProfile();
		if(typeof callback != "undefined") {
			this.secondarySignOutCallback = callback;
		} else {
			this.secondarySignOutCallback = undefined;
		}
		// TODO: same notes as above
		this._makeJsonServiceCall(params, tpIdentityServicePrefix + "web/Authentication/signOut", false, "1.0", null, this._signOutCallback.bindTo(this));
		clearInterval(this.tokenRefreshInterval);
	},
	_signOutCallback: function(response){
		if (!this.isException(response)) {
			tpController.dispatchEvent("OnSignOut", {});
			if(this._signOutEvents.length > 0) {
				for(var h=0; h<this._signOutEvents.length; h++) {
					this._signOutEvents[h](response);
				}
			}
		}
		if(this.secondarySignOutCallback) {
			this.secondarySignOutCallback(response);
		}
	},
	
	// add
	addRating: function(aboutID, rating, schemaVersion, serviceUrl, errorCallback) {
		var params = {
			_aboutId: aboutID,
			_value: rating
		}
		this._makeJsonServiceCall(params, serviceUrl + tpRatingDataServicePath, true, schemaVersion, "post", errorCallback||this.errorHandler.bindTo(this));
	},
	addComment: function(aboutID, name, text, url, schemaVersion, serviceUrl, errorCallback) {
		var params = {
			_aboutId: aboutID,
			_text: text,
			_author: name
		}
		if (url != null && url.length > 0) {
			params._url = url;
		}
		this._makeJsonServiceCall(params, serviceUrl + tpCommentDataServicePath, true, schemaVersion, "post", errorCallback||this.errorHandler.bindTo(this));
	},
	addUserList: function ( name, context, schemaVersion, serviceUrl, errorCallback)
	{
		var params = {
			_title: name,
			_context: context
		}
		this._makeJsonServiceCall(params, serviceUrl + tpUserListDataServicePath, true, schemaVersion, "post", errorCallback||this.errorHandler.bindTo(this));
	},
    addUserListItem: function ( userListID, aboutID, schemaVersion, serviceUrl, errorCallback)
    {
 		var params = {
			_userListId: userListID,
			_aboutId: aboutID,
			_title: "Media"
		}
        this._makeJsonServiceCall(params, serviceUrl + tpUserListItemDataServicePath, true, schemaVersion, "post", errorCallback||this.errorHandler.bindTo(this));
    },
	addUserProfile: function ( displayName, website, avatar, schemaVersion, serviceUrl, errorCallback)
	{
		var params = {
			"_avatar.href": avatar,
			_displayName: displayName,
			_website: website
		}
		this._makeJsonServiceCall(params, serviceUrl + tpUserProfileDataServicePath, true, schemaVersion, "post", errorCallback||this.errorHandler.bindTo(this));
	},	

	// update
	updateUserProfile: function ( displayName, website, avatar, schemaVersion, serviceUrl, errorCallback)
	{
		var params = {
			_avatar: avatar,
			_displayName: displayName,
			_website: website
		}
		this._makeJsonServiceCall(params, serviceUrl + tpUserProfileDataServicePath, true, schemaVersion, "put", errorCallback||this.errorHandler.bindTo(this));
	},
	
	// get
	getRating: function(aboutID, schemaVersion, serviceUrl, callback) {
		var params = {
			byAboutId: aboutID,
			fields: "value"
		}
		this._makeJsonServiceCall(params, serviceUrl + tpRatingDataServicePath, true, schemaVersion, null, callback);
	},
	getComments: function(aboutID, schemaVersion, serviceUrl, callback, startIndex, endIndex) {
		var params = {
			byAboutId: aboutID,
			fields: "id,added,approved,author,url,text,userId",
			sort: "added|desc"
		}		
		if(typeof startIndex != "undefined" && startIndex != null) {
			params.startIndex = startIndex;
			params.count = true;
		}
		if(typeof endIndex != 'undefined') {
			params.endIndex = endIndex;
			params.count = true;
		}		
		this._makeJsonServiceCall(params, serviceUrl + tpCommentDataServicePath, true, schemaVersion, null, callback);
	},
	getTotalRating: function(aboutID, schemaVersion, serviceUrl, callback) {
		var params = {
			byAboutId: aboutID,
			fields: "average,count"
		}
		this._makeJsonServiceCall(params, serviceUrl + tpTotalRatingDataServicePath, true, schemaVersion, null, callback);
	},
	getTopRatings: function(schemaVersion, serviceUrl, callback) {
		var params = {
			fields: "aboutId",
			sort: "average|desc",
            range: "1-500"
		}
		this._makeJsonServiceCall(params, serviceUrl + tpTotalRatingDataServicePath, true, schemaVersion, null, callback);
	},
	getUserList: function(contextString, schemaVersion, serviceUrl, callback) {
		var params = {
			byContext: contextString,
			fields: "id,items.aboutId"
		};
		this._makeJsonServiceCall(params, serviceUrl + tpUserListDataServicePath, true, schemaVersion, null, callback);
	},
	getUserProfile: function(userName, schemaVersion, serviceUrl, callback) {	
		var params = {
			byUserId: userName,
			fields: "avatar,displayName,website,userId"
		};
		this._makeJsonServiceCall(params, serviceUrl + tpUserProfileDataServicePath, true, schemaVersion, null, callback);
	},
	getUserProfiles: function(userIDQuery, schemaVersion, serviceUrl, callback) {	
		// note that userIDQuery will be "byUserId=abc&byUserId=def&byUserId=ghi", etc.
		var params = {
			fields: "avatar,displayName,website,userId"
		};
		this._makeJsonServiceCall(params, serviceUrl + tpUserProfileDataServicePath + "?" + userIDQuery, true, schemaVersion, null, callback);
	},
	
	// delete
	deleteComment: function(objectURI, schemaVersion, errorCallback) {
		var params = {
		}
		this._makeJsonServiceCall(params, objectURI, true, "1.0", "delete", errorCallback||this.errorHandler.bindTo(this));
	},
    deleteUserListItem: function(objectURI, schemaVersion, serviceUrl, errorCallback) {
		var params = {
            byAboutId: objectURI
		}
		this._makeJsonServiceCall(params, serviceUrl + tpUserListItemDataServicePath, true, "1.0", "delete", errorCallback||this.errorHandler.bindTo(this));
	},

	// make a JSON call
	_makeJsonServiceCall: function(params, serviceUrl, useCompactJson, version, method, callback, includeAccount) {
		if ( typeof includeAccount == "undefined" ) {
			includeAccount = true;
		}
		// set the token if available
		if (!this.anonymousUser && typeof this.token != "undefined") {
			params.token = this.token;
		}
		
		if (includeAccount) {
			// set the account
			params.account = this.accountURI;
		}
		
		// figure out the format to return
        if ( useCompactJson ) {
            format = "cjson";
        } else {
            format = "json";
        }

		// specify the format and schema
		params.form = format;
		params.schema = version;
		
		// specify the method, if provided.  note in JSON the HTTP method is always "get", so
		// to allow for deletes, etc., we allow the action to be passed in via a parameter
		if (method != null && method.length > 0) {
			params.method = method;
		}		
				
		// make the call using the jQuery library
		serviceUrl += (serviceUrl.indexOf("?") != -1 ? "&" : "?") + "callback=?";
		return j$.getJSON(serviceUrl, params, callback);			
	},
	
	// error handling
	_errors: [],
	errorHandler: function(response) {
		if(response != null )
		{
			if ( response.isException == true) {
				this._errors.push(response);
				if(typeof this._customErrorHandler == "undefined") {
					alert((response.type ? response.type : response.title)+": "+(response.message ? response.message : response.description));
				} else {
					this._customErrorHandler(response);
				}
			} else if(typeof response == "string") {
				alert(response);
			}
		}
	},
	isException: function(response){
		return (response != null && typeof response.isException != 'undefined')?Boolean(response.isException):false;
	},
	isAuthException: function(response){
		return (response != null && response.responseCode == 403 && response.description == "Anonymous access is not allowed.");
	},

	// helpers
	sanitize: function(originalText, useNBSPs){
        if (!originalText) return "";
		var sanitizedText = originalText.replace(/&/g, "&amp;")
		var sanitizedText = sanitizedText.replace(/>/g, "&gt;");
		var sanitizedText = sanitizedText.replace(/</g, "&lt;");
		if (useNBSPs) {
			sanitizedText = sanitizedText.replace(/ /g, "&nbsp;");
		}
		return sanitizedText;
	},
	unsanitize: function(sanitizedText, useNBSPs){
        if (!sanitizedText) return "";
		var unsanitizedText = sanitizedText.replace(/&amp;/g, "&")
		var unsanitizedText = unsanitizedText.replace(/&gt;/g, ">");
		var unsanitizedText = unsanitizedText.replace(/&lt;/g, "<");
		if (useNBSPs) {
			unsanitizedText = unsanitizedText.replace(/&nbsp;/g, " ");
		}
		return unsanitizedText;
	},
	// returns the index of the first non-ad clip in the playlist.  if all
	// the clips are ads, returns -1.
	getContentIndex: function(evt){
		if (typeof evt.data.clips != "undefined") {
			for(var i=0; i<evt.data.clips.length; i++) {
				if(evt.data.clips[i].baseClip.isAd == false) {
					return i;
				}
			}
		}
		return -1;	
	},
	setContentIDs: function(items){
		var contentIDs = new Array();
		var prefix = tpMediaDataServicePrefix + "data/Media/";
		if (items && items.length > 0) {
			contentIDCount = 0;
			for (var item in items) {
				var aboutID = items[item].aboutId;
				var IDStart = aboutID.indexOf(prefix);
				if (IDStart == 0) {
					var ID = aboutID.substr(IDStart + prefix.length, aboutID.length - prefix.length);
					var isNumeric = true;
					for (var i = 0; i < ID.length; i++) {
						if (ID.charAt(i) < '0' || ID.charAt(i) > '9') {
							isNumeric = false;
							break;
						}
					}					
					if (isNumeric) {
						contentIDs.push(ID);
						// because of URL length limits, cap the total # of content IDs at 100
						if (++contentIDCount == 100) {
							break;
						}
					}
				}
			}
		} else {
			contentIDs.push(0);		
		}
		tpController.refreshReleaseModel("", "", null, null, null, null, null, contentIDs);	
	},
	_uriPattern: undefined,
	isUri: function(uri) {
		// a valid URL starts with "http://" or "https://", and then has at least one alphanumeric character
		if (this._uriPattern == undefined) {
			this._uriPattern = new RegExp();
			this._uriPattern.compile("^(http|https):\/\/[A-Za-z0-9]+");
		}
		return this._uriPattern.test(uri);
	}
}

DomFragment = function(fragmentType, propertiesObject) {
	if(typeof fragmentType == "string") {
		var fragment = document.createElement(fragmentType);
	} else {
		var fragment = fragmentType;
	}
	if(typeof propertiesObject != "undefined") {
		for(var p in propertiesObject) {
			if(typeof propertiesObject[p] == "object") {
				if(typeof fragment[p] == "undefined" && p != "toAppend") {
					fragment[p] = propertiesObject[p];
				} else if(p == "toAppend") {
					fragment._cFrag = {};
					for(var ta in propertiesObject[p]) {
						if(typeof propertiesObject[p][ta].appendChild != "undefined") {
							fragment.appendChild(propertiesObject[p][ta]);
							fragment._cFrag[ta] = propertiesObject[p][ta];
						} else if(typeof propertiesObject[p][ta][0] != "undefined") {
							for(var i=0; i<propertiesObject[p][ta].length; i++) {
								if(typeof propertiesObject[p][ta][0].appendChild != "undefined") {
									fragment.appendChild(propertiesObject[p][ta][0]);
									fragment._cFrag[ta] = propertiesObject[p][ta][0];
								}
							}
						}
					}
				} else {
					for(var np in propertiesObject[p]) {
						fragment[p][np] = propertiesObject[p][np];
					}
				}
			} else {
				if(p.toLowerCase() != "class") {
					fragment[p] = propertiesObject[p];
				} else {
					fragment.className = propertiesObject[p];
				}
			}
		}
	}
	return fragment;
}

Function.prototype.bindTo = function (object) {
	var method = this;
	return function () {
		return method.apply(object, arguments);
	};
}
