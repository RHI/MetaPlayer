//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

if (window.addEventListener){
	window.addEventListener("load", setupProfileWidget, true);
} else if (window.attachEvent){
	window.attachEvent("onload", setupProfileWidget );
}

var tpProfileWidget;

function setupProfileWidget(evt) {

	// Only setup the widget if a div has been registered to load the widget into.
	if (tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.profileWidgetTypeName ) != null && tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.profileWidgetTypeName ).length > 0) {	
	
		// Set up widget and register it with the widget manager.
		tpProfileWidget = new CommunityManagerProfile(tpCommunityWidgetManager.getWidgetDiv( tpCommunityWidgetManager.profileWidgetTypeName ), tpCommunityWidgetManager.getCommunityManager(), tpMediaDataServicePrefix + "data/Media/", "1.0", tpUserProfileDataServicePrefix);
		tpCommunityWidgetManager.registerWidget( tpCommunityWidgetManager.profileWidgetTypeName, tpProfileWidget );
		
		// Register for PDK player events.
		tpController.addEventListener("OnReleaseStart", loadProfile);
		tpController.addEventListener("OnMediaStart", refreshProfile);
	}
}

function loadProfile(evt) {
	tpCommunityWidgetManager.getWidget( tpCommunityWidgetManager.profileWidgetTypeName ).activate(evt);
}

function refreshProfile(evt) {
	tpCommunityWidgetManager.getWidget( tpCommunityWidgetManager.profileWidgetTypeName ).refresh(evt);
}

CommunityManagerProfile = function() {
	this._initialize.apply(this, arguments);
}
CommunityManagerProfile.prototype = {
	_initialize: function(widgetSelector, communityManagerInstance, objectURIPrefix, schemaVersion, userProfileInstance) {
		this.widget = j$(widgetSelector);
		this.widget.addClass("communityManagerProfileWidget");
		this.cmInstance = communityManagerInstance;
		this.objectURIPrefix = objectURIPrefix;
		this.schemaVersion = schemaVersion;
		this.userProfileInstance = userProfileInstance;
		this.signInFormVisible = false;
		this.profileVisible = false;
		this.standardTitleLength = 60;
		this.signInTitleLength = 40;
		this.errorTitleLength = 22;
		
		this._prepareWidgetSpace();
	},
	activate: function(evt){
		var contentIndex = this.cmInstance.getContentIndex(evt);
		if (contentIndex >= 0)
        {
			var title = evt.data.clips[contentIndex].baseClip.title;
            if (!title) title = evt.data.clips[contentIndex].chapter.title;
            if (!title) title = "";
            this.changeTitle(this.cmInstance.sanitize(title));
		} else {
			// it's all ads, show that it's an ad
			this.changeTitle("Advertisement");
		}
	},
	refresh: function(evt){
		if (!evt.data.isAd) {
            var title = evt.data.baseClip.title;
            if (!title) title = evt.data.chapter.title;
			this.changeTitle();
		}
	},
	_prepareWidgetSpace: function(){
		// in firefox, if an input control has focus while the container is hidden, the
		// cursor stops appearing.  this happens in the sign in form when a user signs
		// in by pressing ENTER.  in this case, we need a hidden input field that's always
		// visible that we can transfer focus to.		
		if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
			this.temporaryFocusHolder = j$(DomFragment("input", {
				type: "hidden"
			}));
			this.widget[0].appendChild(this.temporaryFocusHolder[0]);
		}
				
		this._createTitle();
		this._createProfile();
	},
	_createTitle: function(){
		this.titleContainer = j$(DomFragment("span", {
			className: "profileTitle"
		}));
		this.widget[0].appendChild(this.titleContainer[0]);
		this.changeTitle( this.cmInstance.sanitize(document.title) );
	},
	_createProfile: function(){
		var idRandom = Math.round(Math.random()*1000000000);
		// console.log(idRandom);
		
		this.signInForm = j$(DomFragment("form", {
			id: "profileSignInForm",
			toAppend: [
				DomFragment("span", {
					className: "signInStatus",
					innerHTML: "&nbsp;"
				}),										
				DomFragment("label", {
					innerHTML: "User:",
					htmlFor: "communityManagerUserField_"+idRandom
				}),
				DomFragment("input", {
					type: "text",
					value: "",
					className: "communityManagerSignInField",
					id: "communityManagerUserField_"+idRandom
				}),
				DomFragment("label", {
					innerHTML: "Password:",
					htmlFor: "communityManagerPasswordField_"+idRandom
				}),
				DomFragment("input", {
					type: "password",
					value: "",
					className: "communityManagerSignInField",
					id: "communityManagerPasswordField_"+idRandom
				}),
				j$(DomFragment("span", {
					className: "communityManagerSignInLink",
					innerHTML: "Sign&nbsp;In"
				})).bind("click", this._signInClick.bindTo(this)),
				j$(DomFragment("span", {
					className: "communityManagerCancelSignInLink",
					innerHTML: "Cancel"
				})).bind("click", this.toggleSignInForm.bindTo(this))
			]
		}));
		this.signInLoading = j$(this.signInForm[0]._cFrag[0]);
		this.signInUserField = j$(this.signInForm[0]._cFrag[2]).bind("keydown", this._handleSignInKeyDown.bindTo(this));
		this.signInUserField[0].setAttribute("autocomplete", "off");
		this.signInPasswordField = j$(this.signInForm[0]._cFrag[4]).bind("keydown", this._handleSignInKeyDown.bindTo(this));
		
		this.signInToggleLink = j$(DomFragment("span", {
			className: "communityManagerSignInLink",
			innerHTML: "Sign in&#8230;"
		})).bind("click", this.toggleSignInForm.bindTo(this));
		
		this.signInError = j$(DomFragment("span", {
			className: "communityManagerSignInError",
			innerHTML: ""
		}));
				
		this.profileLink = j$(DomFragment("span", {
			className: "communityManagerProfileLink"
		})).bind("click", this.toggleProfile.bindTo(this));
		
		this.signOutLink = j$(DomFragment("span", {
			className: "communityManagerSignOutLink",
			innerHTML: "Sign Out"
		})).bind("click", this._signOut.bindTo(this));
		
		var profileForm = j$(DomFragment("form", {
			id: "profileForm",
			toAppend: [
				DomFragment("label", {
					innerHTML: "My name:"
				}),
				DomFragment("input", {
					type: "text",
					className: "communityManagerMyName",
					id: "communityManagerMyName_"+idRandom,
					disabledd: "disabled"
				}),
				DomFragment("label", {
					innerHTML: "My website:",
					htmlFor: "communityManagerMyWebsite_"+idRandom
				}),
				DomFragment("input", {
					type: "text",
					className: "communityManagerMyWebsite",
					id: "communityManagerMyWebsite_"+idRandom,
					disabledd: "disabled"
				}),
				DomFragment("label", {
					type: "text",
					innerHTML: "My profile image link:",
					htmlFor: "communityManagerMyAvatar_"+idRandom
				}),
				DomFragment("input", {
					type: "text",
					className: "communityManagerMyAvatar",
					id: "communityManagerMyAvatar_"+idRandom,
					disabledd: "disabled"
				}),
				DomFragment("span", {
					className: "communityManagerProfileSave",
					innerHTML: "Save"
				}),
				DomFragment("span", {
					className: "communityManagerProfileCancel",
					innerHTML: "Cancel"
				})
			],
			onsubmit: "return false;"
		})).bind("submit", this._updateProfileData.bindTo(this));
		
		this.profileView = j$(DomFragment("div", {
			className: "communityManagerProfileView",
			style: {
				display: "none"
			},
			toAppend: [
				DomFragment("img", {
					className: "communityManagerAvatar",
					src: "../../pdk/community/images/spacer1x1.gif"
				}),
				profileForm
			]
		}));
		this.profileAvatar = j$(this.profileView[0]._cFrag[0]);
		this.profileNameField = j$(this.profileView[0]._cFrag[1]._cFrag[1]);
		this.profileNameField.bind("keydown", this._handleProfileKeyDown.bindTo(this));
		this.profileWebsiteField = j$(this.profileView[0]._cFrag[1]._cFrag[3]);
		this.profileWebsiteField.bind("keydown", this._handleProfileKeyDown.bindTo(this));
		this.profileWebsiteField.bind("focus", function() {this.select();});
		this.profileAvatarField = j$(this.profileView[0]._cFrag[1]._cFrag[5]);
		this.profileAvatarField.bind("blur", this._updateAvatarImg.bindTo(this));
		this.profileAvatarField.bind("keydown", this._handleProfileKeyDown.bindTo(this));
		this.profileAvatarField.bind("focus", function() {this.select();});
		this.profileOkLink = j$(this.profileView[0]._cFrag[1]._cFrag[6]);
		this.profileOkLink.bind("click", this._updateProfileData.bindTo(this));
		this.profileCancelLink = j$(this.profileView[0]._cFrag[1]._cFrag[7]);
		this.profileCancelLink.bind("click", this.toggleProfile.bindTo(this));
		
		var signInProfile = DomFragment("div", {
			className: "communityManagerProfile",
			toAppend: [
				DomFragment("table", {
					toAppend: [
						DomFragment("tbody", {
							toAppend: [
								j$(DomFragment("tr", {
									toAppend: [
									DomFragment("td", {
									        toAppend: [
												this.signInError
											]
										}),
										DomFragment("td", {
											toAppend: [
												this.signInForm
											]
										}),
										DomFragment("td", {
											toAppend: [
												this.signInToggleLink
											]
										})
									]
								})),
								j$(DomFragment("tr", {
									style: {
										display: "none"
									},
									toAppend: [
										DomFragment("td", {
											toAppend: [
												this.profileLink,
												this.signOutLink
											]
										})
									]
								}))
							]
						})
					]
				}),
				this.profileView[0]
			]
		});
		
		// Assign the DOM nodes to object variables so we can quickly refer to them later. The _cFrag arrays are those of child nodes and the number refers to the position of the element.
		this.signInControls = j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[0]);
		this.profileControls = j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[1]);
		this.signInFormContainer = j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[0]._cFrag[1]);
		this.signInToggleContainer = j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[0]._cFrag[2]);
		this.signInErrorContainer = j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[0]._cFrag[0]);
		// this.profileToggleContainer
		
		this.widget[0].appendChild(signInProfile);
		var currentHeight = this.widget.height()+"px";
		this.signInFormContainer.hide();
		this.signInErrorContainer.hide();
		var tdHeight = j$(signInProfile).height();
		for(var r in signInProfile._cFrag[0]._cFrag[0]._cFrag) {
			for(var d in signInProfile._cFrag[0]._cFrag[0]._cFrag[r]._cFrag) {
				j$(signInProfile._cFrag[0]._cFrag[0]._cFrag[r]._cFrag[d]).height(tdHeight);
			}
		}
		this.widget.height(currentHeight);
	},
	_handleSignInKeyDown: function(evt) {
        if (evt.keyCode == 13) {
            this._signInClick();
            return false;
        } else if (evt.keyCode == 27) {
			this.toggleSignInForm();
			return false;
		}
    },
	// IE won't accept Enter to submit the profile form without a visible submit button,
	// so capture the enter key.  Also use this to have Escape clear edits.
	_handleProfileKeyDown: function(evt) {
        if (evt.keyCode == 13) {
            this._updateProfileData();
            return false;
        } else if (evt.keyCode == 27) {
			this.toggleProfile();
			return false;
		}
    },
	changeMode: function(modeName){
		if (this.temporaryFocusHolder) {
			this.temporaryFocusHolder.focus();
		}
		if (modeName == "signIn") {
			this.profileControls.hide();
			this.signInControls.show();
		} else {
			this.signInControls.hide();
			this.profileControls.show();
		}
	},
	toggleProfile: function(){
		if(this.profileVisible == true) {
			this._restoreProfileData();
			this.profileView.hide();
			this.widget.removeClass("communityManagerProfileOpen");
			this.profileVisible = false;
		} else {
			this.profileView.show();
			this.widget.addClass("communityManagerProfileOpen");
			this.profileNameField.focus();
			this.profileVisible = true;
		}
	},
	changeTitle: function(newTitle){
        if (!newTitle) this.title = "";
		else this.title = (newTitle.length <= this.standardTitleLength)?newTitle:newTitle.substring(0, this.standardTitleLength)+"&#8230;";
		this.titleContainer.html(this.title);
	},
	changeTitleTemporary: function( newTitle, length ) {
		this.titleContainer.html((newTitle.length <= length)?newTitle:newTitle.substring(0, length)+"&#8230;");
	},
	getTitle: function() {
		return this.title;
	},
	toggleSignInForm: function(){
		if(this.signInFormVisible == false) {
			this.signInToggleContainer.hide();
			this.signInErrorContainer.hide();
			//this.signInUserField.val("");
			this.signInPasswordField.val("");
			this.signInFormContainer.show();
			this.signInUserField[0].focus();
			this.signInUserField[0].select();
			this.changeTitleTemporary( this.title, this.signInTitleLength );
			this.signInFormVisible = true;
		} else {
			this.signInFormContainer.hide();
			this.signInErrorContainer.hide();
			this.changeTitleTemporary( this.title, this.standardTitleLength );
			this.signInToggleContainer.show()
			this.signInFormVisible = false;
		}
	},
	toggleSignInError: function(){
		clearInterval(this.errorInterval);
		if(this.signInErrorVisible == true) {
			this.signInErrorContainer.hide();
			this.changeTitleTemporary( this.title, this.signInTitleLength );
			this.signInErrorVisible = false;
		} else {
			this.changeTitleTemporary( this.title, this.errorTitleLength );
			this.signInErrorContainer.show();
			this.signInErrorVisible = true;
		}
	},
	_signInClick: function(evt){
		this.signInLoading.addClass("signingIn");
		this.cmInstance.signIn(this.signInUserField.val(), this.signInPasswordField.val(), this._getProfileData.bindTo(this));
	},
	_signOut: function(){
		// Make sure comment form is hidden
		if(this.profileVisible == true) {
			this.toggleProfile();
		}
		this.toggleSignInForm();
		this.changeMode("signIn");
		
		// we don't need a callback from sign out
		this.cmInstance.signOut(null)
	},
	// This method is used as the callback for a signIn call to the end user authentication system. 
	// If sign in was successful, it will try to load the profile data.
	// If there was an error, it displays a friendly version to the user.
	_getProfileData: function(response) {
		if (this.cmInstance.isException(response)) {
			this.signInLoading.removeClass("signingIn");
			var message = "There was an unknown error.";
			if (response.description) {
				message = response.description;
				if (response.description.indexOf("Could not authenticate user") == 0) {
					message = "Unknown user name or password.";
				}
				if (response.description.indexOf("Must provide 'password' parameter when submitting 'username'") == 0 ) {
					message = "Enter a user name and password.";
				}
			}
			this.signInError.html(message + "&nbsp;");

			// Make sure we show the signIn error.
			this.signInErrorVisible = false;
			this.toggleSignInError();
			this.signInUserField[0].focus();
			this.signInUserField[0].select();
			this.signInPasswordField.val("");
			this.errorInterval = setInterval(this.toggleSignInError.bindTo(this), 3000);		
		}
		else {
			this.cmInstance.getUserProfile(this.cmInstance.selfID, "1.0", this.userProfileInstance, this._getProfileResponse.bindTo(this));
		}
	},
	// Last in the chain of loading the profile data. We'll handle the actual response containing the user's profile.
	_getProfileResponse: function(response){
		this.signInLoading.removeClass("signingIn");
		if(this.cmInstance.isException(response)) {
			this.cmInstance.errorHandler(response);
			return false;
		}
		if(typeof response.entries != "undefined" && response.entries.length > 0) {
			this._userProfile = response.entries[0];
			// set it on the manager, so other widgets who need to watch for profile
			// state changes get a message
			this.cmInstance.setProfile(this._userProfile);
			this._restoreProfileData();
			if (this._userProfile.displayName != "") {
				this.profileLink.html(this.cmInstance.sanitize(this._userProfile.displayName));
			} else {
				this.profileLink.html(this.cmInstance.sanitize(this.cmInstance.userName));
			}			
			this.changeMode("profile");
			this.signInPasswordField.val("");
		} 
		else {
			this._clearProfileData();
			this.changeMode("profile");
			this.profileLink.html(this.cmInstance.userName +" v");
		}
	},
	_updateProfileData: function(){
		var isValid = true;
		var errorMessage = "";
		if (!this.cmInstance.isUri(this.profileAvatarField.val()) && j$.trim(this.profileAvatarField.val()) != '') {
			isValid = false;
			errorMessage = "If you specify a profile image link, it needs to be a URL to an image on a public server.";
		}
		if (!this.cmInstance.isUri(this.profileWebsiteField.val()) && j$.trim(this.profileWebsiteField.val()) != '') {
			isValid = false;
			errorMessage = "If you specify a website, it needs to be a URL to a blog or a home page on a public server.  Make sure to enter the full URL, including any starting \"http://\" sequence."
		}
		if(isValid) {
			if ( typeof this._userProfile != "undefined"  ) {
				this.cmInstance.addUserProfile(this.profileNameField.val(), this.profileWebsiteField.val(), this.profileAvatarField.val(), "1.0", tpUserProfileDataServicePrefix, null);
			} else {
				this.cmInstance.updateUserProfile(this.profileNameField.val(), this.profileWebsiteField.val(), this.profileAvatarField.val(), "1.0", tpUserProfileDataServicePrefix, null);
			}
			if ( this.profileNameField.val() != "" ) {
				this.profileLink.html(this.cmInstance.sanitize(this.profileNameField.val()) + " v");
			} else {
				this.profileLink.html(this.cmInstance.sanitize(this.cmInstance.userName)+" v");
			}
			
			this._userProfile.displayName = this.profileNameField.val();
            this._userProfile.avatar = new Object();
            this._userProfile.avatar.href = this.profileAvatarField.val();
			this._userProfile.website = this.profileWebsiteField.val();

			// set it on the manager, so other widgets who need to watch for profile
			// state changes get a message
			this.cmInstance.setProfile(this._userProfile);
			this.toggleProfile();
			return false;
		} else {
			this.cmInstance.errorHandler(errorMessage);
			return false;
		}
	},
	_updateAvatarImg: function(){
		if (this.profileAvatarField.val().length > 0) {
			this.profileAvatar[0].src = this.profileAvatarField.val();
		} else {
			this.profileAvatar[0].src = "../../pdk/community/images/spacer1x1.gif";
		}
	},
	_restoreProfileData: function(){
		this.profileNameField.val(this._userProfile.displayName);
		this.profileWebsiteField.val(this._userProfile.website);
        this.profileAvatarField.val((!this._userProfile.avatar) ? "" : this._userProfile.avatar.href);
		this._updateAvatarImg();			
	},
	_clearProfileData: function(){
		this.profileNameField.val("");
		this.profileWebsiteField.val("");
		this.profileAvatarField.val("");
		this._updateAvatarImg();	
	},
	_userProfile: {}
}
