//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

if (window.addEventListener){
	window.addEventListener("load", setupCommentsWidget, true);
} else if (window.attachEvent){
	window.attachEvent("onload", setupCommentsWidget );
}

var tpCommentsWidget;

function setupCommentsWidget( evt) {

	// Only setup the widget if a div has been registered to load the widget into.
	if (tpCommunityWidgetManager.getWidgetDiv(tpCommunityWidgetManager.commentWidgetTypeName) != null && tpCommunityWidgetManager.getWidgetDiv(tpCommunityWidgetManager.commentWidgetTypeName) .length > 0) {
		
		// Set up widget and register it with the widget manager.
		tpCommentsWidget = new CommunityManagerComments(
								tpCommunityWidgetManager.getWidgetDiv(tpCommunityWidgetManager.commentWidgetTypeName),
								tpCommunityWidgetManager.getCommunityManager(), 
								tpMediaDataServicePrefix + "data/Media/", "1.0", 
								tpCommentDataServicePrefix,
								tpCommunityWidgetManager.getWidgetConfiguration(tpCommunityWidgetManager.commentWidgetTypeName ));
		tpCommunityWidgetManager.registerWidget( tpCommunityWidgetManager.commentWidgetTypeName, tpCommentsWidget );

		// Register for changes to other state on the page.
		tpCommunityWidgetManager.getCommunityManager().registerForAuthentication(tpCommentsWidget.signInRefresh.bindTo(tpCommentsWidget));
		tpCommunityWidgetManager.getCommunityManager().registerForProfileChange(tpCommentsWidget.profileRefresh.bindTo(tpCommentsWidget));
		
		// Register for PDK player events.
		tpController.addEventListener("OnMediaStart", loadComments);
		tpController.addEventListener("OnReleaseStart", loadComments);
        tpController.addEventListener("OnLoadReleaseUrl", loadComments);

        // Load comments
        tpCommentsWidget._clearComments();
        tpCommentsWidget.activate();
	}
}

function loadComments(evt){
	tpCommunityWidgetManager.getWidget( tpCommunityWidgetManager.commentWidgetTypeName ).activate(evt);
}

CommunityManagerComments = function() {
	this._initialize.apply(this, arguments);
}
CommunityManagerComments.prototype = {
	_initialize: function(widgetSelector, communityManagerInstance, objectURIPrefix, apiVersion, commentsInstance, optionalArgs) {
		this.widget = j$(widgetSelector).eq(0);
		this.widget.hide();
		this.widget.addClass("communityManagerCommentsWidget");
		this.cmInstance = communityManagerInstance;
		this.commentsInstance = commentsInstance;
		this.apiVersion = apiVersion;
		this.objectURIPrefix = objectURIPrefix;
		this.commentsLoaded = false;
		this.commentsPerPage = 50;
		this.commentFormState = "OFF";
		this.initialCommentsShown = 10;
		this.activated = false;
		
		if(typeof optionalArgs != "undefined" && optionalArgs != null ) {
			this.commentPageOptionalArgs = {};
			if (typeof optionalArgs.initialCommentsShown != "undefined")
				this.initialCommentsShown = optionalArgs.initialCommentsShown;
			if(typeof optionalArgs.commentFormState != "undefined")
				this.commentFormState = optionalArgs.commentFormState;
		}
		
		this._prepareWidgetSpace();
	},
	activate: function(evt) {
		if (typeof evt == "undefined" ) {
			// if the event is undefined, we're likely switching authentication modes.
			// if the user had been entering a comment, try to preserve the text.
			this.nameFieldLastVal = null;
			this.websiteFieldLastVal = null;
			if (this.objectURI) {
				this.savedComment = this.commentFieldLastVal;
				this.refreshComments();	
			}
		} else if (evt.type == "OnReleaseStart" ) {
			this._clearComments();
			var contentIndex = this.cmInstance.getContentIndex(evt);
			if (contentIndex >= 0) {
				this.clip = evt.data.clips[contentIndex];
				this.objectURI = this.objectURIPrefix + this.clip.baseClip.contentID;
				this.refreshComments();
			} else {
				this.clip = undefined;
				this.objectURI = undefined;
			}
		} else if ( evt.type == "OnMediaStart" ) {
			if (!evt.data.baseClip.isAd) {
				var newObjectURI = this.objectURIPrefix + evt.data.baseClip.contentID;
				if(newObjectURI != this.objectURI) {
					this._clearComments();
					this.clip = evt.data;
					this.objectURI = newObjectURI;
					this.refreshComments();
				}
			}
		} else if ( evt.type == "OnLoadReleaseUrl" ) {
            if (this.objectURI != evt.data.id) {
                // this is a Release object, not a Clip: but better than nothing...
                // TODO: look at a way to map Release to Clip
                this.clip = evt.data;
                this.objectURI = evt.data.id;
                this.refreshComments();
            }
        }
	},
	refreshComments: function() {
		this.cmInstance.getComments(this.objectURI, "1.0", tpCommentDataServicePrefix, this._createCommentsWidget.bindTo(this), 1, this.initialCommentsShown);
	},
	signInRefresh: function(){
		this._rights = "read_write";
        this._clearComments();
        this.activate();
	},
	_rights: "read_write",

	// if the current profile changes, we might need to update all comment avatars, change
	// form field settings, etc., for the current user.
	profileRefresh: function(profile) {
		this._refreshCommentFieldDisplay();
		if (profile != undefined) {
			this._updateAvatar(this.cmInstance.selfID, this._selfComments, profile);
		}
	},
	handleCommentDelete: function ( evt) {
		// Remove "delete-" from the ID of the delete link to get the URI of the comment.
		var target = evt.target;
		var URI = target.id.substring(7);
		if (confirm("Are you sure you want to delete this comment?")) {
			this._totalCommentCount--;
			this._setCommentCountLabel();
			this.cmInstance.deleteComment(URI, "1.0", null);
			tpController.dispatchEvent("OnDeleteComment", {clip: this.clip, ID: URI});
			var comment = target.parentNode.parentNode.parentNode;
			
			// remove this comment from the array of self comments
			if (this._selfComments) {
				for (var i = 0; i < this._selfComments.length; i++) {
					if (this._selfComments[i] == comment) {
						this._selfComments.splice(i, 1);
						break;
					}
				}
			}
			
			comment.parentNode.removeChild( comment );
		}
	},
	_comments: [],
	_commentsIDMapping: {},
	_prepareWidgetSpace: function() {	
	},
	_clearComments: function () {
		this.widget.hide();
		this.activated = false;
		
		// j$(this.moreLessLinkContainer).removeClass("commentsExpanded");
		this.widget.removeClass("commentsExpanded");
		// j$(this.moreLessLinkContainer).removeClass("noAdditionalComments");
		
		this._comments = [];
		this._commentsIDMapping = [];
		this._selfComments = [];
		
		// reset the user ID to profile map.  It's very unlikely you'll be able to take
		// advantage of the cache in a given session; if many people are commenting,
		// you'll be getting new avatars with every page.  We also want to minimize
		// memory usage, and fetch new avatars on clip transitions to show updates
		this._userIDProfileMap = new Object();
		
		for(var c=this.widget[0].childNodes.length-1; c>=0; c--) {
			this.widget[0].removeChild(this.widget[0].childNodes[c])
		}
		//this.contentID = undefined;
		//this.objectURI = undefined;
		
		j$(".communityManagerCommentsPage").empty();
		
		// tpController.suspendPlayAll(true);
	},
	_createCommentsWidget: function(commentObject) {
        // handle errors
        if (this.cmInstance.isAuthException(commentObject)) {
            this._rights = "none";
        } else if (this.cmInstance.isException(commentObject)) {
            this.cmInstance.errorHandler(commentObject);
            return;
        }

		if(typeof commentObject.entries != "undefined") {
            this.widget.show();
			this._createCommentsPage(commentObject);
			j$(".communityManagerCommentsPage").show();
		}
		// If the user has write permissions, we'll show their form.
		if( this._rights == "read_write" ) {
			this._createCommentForm();
			this._refreshCommentFieldDisplay();
			j$(".communityManagerCommentsForm").show();
		}
	},
	_createCommentForm: function(){
		//Build DOM tree for comment form
		var commentForm = DomFragment(this.widget[0], {
			toAppend: [
				DomFragment("div", {
					className: "communityManagerCommentsForm",
					toAppend: [
						DomFragment("div", { className: "communityManagerCommentsFormHeader", innerHTML: "Add a comment" }),
						DomFragment("form", {
							action: "#",
							onSubmit: "return false;",
							toAppend: [
								DomFragment("div", { innerHTML: "My name:", className: "communityManagerCommentsFormLabel" }),
								DomFragment("div", {
									toAppend: [DomFragment("input", { type: "text", className: "communityManagerCommentsFormInput" })]
								}),
								DomFragment("div", { innerHTML: "My website (optional):", className: "communityManagerCommentsFormLabel" }),
								DomFragment("div", {
									toAppend: [DomFragment("input", {type: "text", className: "communityManagerCommentsFormInput" })]
								}),
								DomFragment("div", { innerHTML: "Comment:", className: "communityManagerCommentsFormLabel" }),
								DomFragment("div", {
									toAppend: [DomFragment("textarea", {className: "communityManagerCommentsFormTextArea" })]
								}),
								DomFragment("div", {
									className: "communityManagerCommentsFormLabel",
									toAppend: [
										DomFragment("span", {
											className: "charactersRemaining",
											innerHTML: "(",
											toAppend: [
												DomFragment("span", { innerHTML: "1000" }),
												document.createTextNode(" characters remaining)")
											]
										})
									]
								}),
								DomFragment("div", {
									toAppend: [DomFragment("input", { type: "submit", className: "communityManagerCommentsFormButton", value: "Post Comment" })]
								})						
							]
						})
					]
				})
			]
		});
		
		this.commentForm = j$(commentForm._cFrag[0]._cFrag[1]);
		this.nameLabel = j$(this.commentForm[0]._cFrag[0]);
		this.nameField = j$(this.commentForm[0]._cFrag[1]._cFrag[0]);
		this.websiteLabel = j$(this.commentForm[0]._cFrag[2]);
		this.websiteField = j$(this.commentForm[0]._cFrag[3]._cFrag[0]);
		this.commentField = j$(this.commentForm[0]._cFrag[5]._cFrag[0]);
		this.remainingCommentChars = j$(this.commentForm[0]._cFrag[6]._cFrag[0]._cFrag[0]);
		this.postButton = j$(this.commentForm[0]._cFrag[7]._cFrag[0]);
		
		this.commentForm.bind("submit", this, this._commentFormSubmit);
		this.nameField.bind("focus", this, this._commentFieldFocus);
		this.nameField.bind("blur", this, this._commentFieldBlur);
		this.websiteField.bind("focus", this, this._commentFieldFocus);
		this.websiteField.bind("blur", this, this._commentFieldBlur);
		this.commentField.bind("focus", this, this._commentFieldFocus);
		this.commentField.bind("blur", this, this._commentFieldBlur)
		
		this.nameField.val(this.nameFieldLastVal||"");
		this.websiteField.val(this.websiteFieldLastVal||"");
		this.commentField.val(this.savedComment||"");
		this.savedComment = null;
	},
	_refreshCommentFieldDisplay: function() {
		// check that the form is present... when a person signs in, the event to refresh
		// the comments might arrive before the comment widget has drawn itself.  in that
		// case, skip this update.  it will get made when the comment widget has drawn.
		if (this.nameLabel) {
			if(this.cmInstance.isAuthenticated == true && this.cmInstance.getProfile() != undefined ) {					
				this.nameLabel.hide();
				this.nameField.hide();
				var name = j$.trim(this.cmInstance.getProfile().displayName);
				if (name.length == 0) {
					name = this.cmInstance.userName;
				}
				this.nameField.val(name);
				this.websiteLabel.hide();
				this.websiteField.hide();
				this.websiteField.val(this.cmInstance.getProfile().website);
			} else {
				this.nameLabel.show();
				this.nameField[0].type = "text";
				//this.nameField.val("");
				this.websiteLabel.show();
				this.websiteField[0].type = "text";
				//this.websiteField.val("");
			}
		}
	},
	_createCommentToggleLinks: function(commentCount) {
		var fragment = DomFragment(this.widget[0], {
			toAppend: [
				DomFragment("div", {
					className: "communityManagerCommentsPaging",
					innerHTML: "&nbsp;",
					toAppend: [
						j$(DomFragment("span", {
							className: "moreCommentsLink",
							innerHTML: "Show all comments&#8230;"
						})).bind("click", this, this._toggleFullPage),
						j$(DomFragment("span", {
							className: "lessCommentsLink",
							innerHTML: "Show Less&#8230;"
						})).bind("click", this, this._toggleFullPage)
					]
				})
			]
		});
		this.moreLessLinkContainer = fragment._cFrag[0];
		this.moreCommentsLink = fragment._cFrag[0]._cFrag[0];
		this.lessCommentsLink = fragment._cFrag[0]._cFrag[1];
		if(commentCount <= this.initialCommentsShown) {
			this.widget.addClass("noAdditionalComments");
		} else {
			this.widget.removeClass("noAdditionalComments");
		}
	},
	_loadAvatars: function() {
		// userIDCommentMap is a map of comment arrays by user ID, and after a set of
		// comments are loaded, it only contains user IDs that didn't have profile info
		// available.  Extract out these user IDs.
		var userIDs = new Array();		
		if (!this._userIDProfileMap) {
			this._userIDProfileMap = new Object();
		}
		
		// pull all the users from the comment map, skipping any current user
		for (var userID in this._userIDCommentMap) {
			userIDs.push(userID);
		
			// to avoid re-requesting profiles that don't exist, "salt" the profiles array
			// with false values.  if we don't get back values, we'll use these false
			// values to know not to try to fetch a profile again.
			this._userIDProfileMap[userID] = false;
		}	

		// get the profiles if there are user IDs to fetch
		if (userIDs.length > 0) {
			this._getProfiles(userIDs);
		}
	},			
	// fetch a set of profiles, based on user ID.
	_getProfiles: function(userIDs) {
		var userIDQuery = "";
		for (var i = 0; i < userIDs.length; i++) {
			var userID = userIDs[i];
						
			// check if this user ID would push the URL length over the maximum length of
			// 1024 characters.  This check is approximate, because we don't know what the
			// final length of the URL will be after all additional parameters are added.
			// on average, the complete JSON call adds another 250 characters.  if it is
			// over, throw this comment and all remaining comments to another invocation.
			// note that 1 is the length of "|"
			if (userIDQuery.length + 1 + userID.length > 750) {
				this._getProfiles(commentList.slice(i));
				break;
			} else {						
				userIDQuery += (userIDQuery.length == 0 ? "byUserId=" : "|") + userID;
			}
		}
			
		// get user profiles
		if (userIDQuery.length > 0) {
			this.cmInstance.getUserProfiles(userIDQuery, "1.0", tpUserProfileDataServicePrefix, this._updateAvatars.bindTo(this));
		}
	},		
	_updateAvatars: function(userProfiles) {
		// ignore any exception
		if(this.cmInstance.isException(userProfiles)) {
			return false;
		}		
		for (var i = 0; i < userProfiles.entries.length; i++)
		{
			// the userId on the profile is the associated user
			var userID = userProfiles.entries[i].userId;
			
			// put this profile in the map
			var profile = userProfiles.entries[i];
			this._userIDProfileMap[userID] = profile;
			
			// update the avatar
			this._updateAvatar(userID, this._userIDCommentMap[userID], profile);
		}
	},
	_updateAvatar: function(userID, comments, profile) {
		// get the comment node(s) for the user, and loop through them
		if (comments && comments.length) {
			for (var j = 0; j < comments.length; j++) {
				var commentNode = comments[j];					
				
				// set the avatar
				var avatar = j$(".commentAvatar", commentNode);
				if (profile.avatar && profile.avatar.href && profile.avatar.href.length > 0) {
					avatar.attr("src", profile.avatar.href);
					avatar.show();
				} else {
					avatar.attr("src", "../../pdk/community/images/spacer1x1.gif");
					avatar.hide();
				}					
				
				// replace the existing display name, if we have a display name
				if (jQuery.trim(profile.displayName).length > 0) {				
					var newUserName = this._createUserNameFragment(profile.website, profile.displayName);
					var oldUserName = j$(".communityManagerCommentUserName", commentNode);
					oldUserName.replaceWith(newUserName);
				}
			}
		}
	},	
	_createCommentsPage: function(comments) {		
		if(comments.totalResults > comments.entryCount) {
			this.additionalCommentsLoaded = false;
		}
		this._totalCommentCount = comments.totalResults;
		this.commentCountLabel = j$(DomFragment("span", {
			innerHTML: "Comments"
		}));
		this.widget[0].appendChild(DomFragment("div", {
			className: "communityManagerCommentsWidgetHeader",
			toAppend: [
				this.commentCountLabel
			]
		}));
		this.commentsPage = DomFragment("div", { className: "communityManagerCommentsPage" })
		this.widget[0].appendChild(this.commentsPage);
		this._addCommentCollection(comments);
		this._createCommentToggleLinks(comments.totalResults);
		this._setCommentCountLabel();
	},
	_setCommentCountLabel: function() {
		this.commentCountLabel.html((this._totalCommentCount == 0 ? "No" : this._totalCommentCount) + "&nbsp;comment" + (this._totalCommentCount==1?"":"s"));
		if (this._totalCommentCount == 0) {
			this.commentCountLabel.removeClass("hasComments");
		} else {
			this.commentCountLabel.addClass("hasComments");
		}		
	},
	_addCommentCollection: function(comments, additionalComments) {
		// reset the user ID to comment map.  we only want to update avatars on
		// freshly loaded comments
		this._userIDCommentMap = new Object();
		
		// add comments
		var item;
		for(var c=0; item=comments.entries[c]; c++)
			if(typeof additionalComments == "undefined" || additionalComments == false)
				this._comments.push(new this._comment(this, item));
			else
				this._comments.push(new this._comment(this, item, { additionalComments: true }));
				
		// do a pass to set/update profile info (avatars, etc.)
		this._loadAvatars();		
	},
	// we use this both when we first create the comment, and then later if we need to update
	// user name/URL on a comment once we have profiles
	_createUserNameFragment: function(url, displayName) {
		if (url != "" && url != undefined ) {
			return DomFragment("a", {
				className: "communityManagerCommentUserName",
				target: "_blank",
				href: url,
				innerHTML: this.cmInstance.sanitize(displayName)
			});	
		} else {
			return DomFragment("span", {
				className: "communityManagerCommentUserName",
				innerHTML: this.cmInstance.sanitize(displayName)
			});
		}
	},
	_comment: function(widgetInstance, commentItem, optionalArgs){
		this.widgetInstance = widgetInstance;
		for(var i in commentItem)
			this[i] = commentItem[i];
		this.fullID = this.id;
		this.id = this.id.substring(this.id.lastIndexOf("/")+1, this.id.length);
		this.widgetInstance._commentsIDMapping[this.id] = this.widgetInstance._comments.length;
		var formattedDate = this.widgetInstance._formatCommentDate(this.added);
		
		// see if the comment is explicitly marked as a self comment; this will happen
		// with newly posted anonymous comments
		var isSelf = false;
		if(optionalArgs && optionalArgs.isSelf) {
			isSelf = optionalArgs.isSelf;
		}		
		
		// check if the user is signed in, and this is their comment.
		if (!isSelf && this.widgetInstance.cmInstance.isAuthenticated == true && this.widgetInstance.cmInstance.selfID) {
			if (this.widgetInstance.cmInstance.selfID == this.userId) {
				isSelf = true;
			}
		}
		
		// see if we have a profile available for the current user.		
		var profile = null;
		if (isSelf && this.widgetInstance.cmInstance.getProfile()) {
			profile = this.widgetInstance.cmInstance.getProfile();
		}

		// see if we have a profile for the user from a previous paging.  if we do,
		// use fields from the profile instead of from the comment.  if we don't
		// have a profile now, we'll try to fetch it later
		if (profile == null && this.widgetInstance._userIDProfileMap) {
			profile = this.widgetInstance._userIDProfileMap[this.userId];
		}
		
		// if we found a profile, set the fields for the post
		if (profile) {
			if (jQuery.trim(profile.displayName).length > 0) {
				this.author = profile.displayName;
			}
			this.avatar = profile.avatar.href;
			this.url = profile.website;
		}

		// create an avatar placeholder... if it's not available, we'll fill it in in
		// a later pass
		var avatar = null;
		if (this.avatar && this.avatar.length > 0) {
			avatar = DomFragment("img", {
									src: this.avatar,
									className: "commentAvatar"
								});
		} else {
			avatar = DomFragment("img", {
									src: "../../pdk/community/images/spacer1x1.gif",
									className: "commentAvatar",
									style: {display: "none"}
								});
		}	
						
		// fill out the name
		var userNameFragment = this.widgetInstance._createUserNameFragment(this.url, this.author);
		
		// add a place for commands and status
		var deleteControl = DomFragment("div", {
								innerHTML: "",
								className: "commentCommands"
							});
		
		// if this is a comment for the current user, we'll have more info
		if (isSelf) {
			if (!this.approved) {
                j$(deleteControl).append(
                    DomFragment("span", {
                        innerHTML: "(Private)&nbsp;",
                        title: "This comment is pending approval, and is only visible to you. It will appear publicly when a site administrator has approved it."
                    }));
            }

            j$(deleteControl).append(
                DomFragment("span", {
                    innerHTML: "Delete",
                    id: "delete-" + this.fullID,
                    className: "commentDeleteLink"
                })).bind("click", this.widgetInstance.handleCommentDelete.bindTo(this.widgetInstance));
		}
										
		// build the entire comment
		var newComment = DomFragment("div", {
			id: "communityManagerComments_"+this.id,
			className: "communityManagerComment",
			toAppend: [
				DomFragment("div", {
					className: "communityManagerCommentHeader",
					toAppend: [
						avatar,
						deleteControl,
						userNameFragment,
						DomFragment("span", {
							innerHTML: "&nbsp;" + formattedDate
						})
					]
				}),
				DomFragment("div", {
					className: "communityManagerCommentText",
					innerHTML: this.widgetInstance._formatCommentText(this.text)
				})
			]
		});
		
		// if we don't already have a profile for the user, and we haven't marked the
		// profile as unavailable by setting the map value to false, add the comment to a map of
		// comments by user ID, so we can update data when the avatars are available.  we
		// only need to do this for non-anonymous users, and for comments that we didn't
		// have profile data available for on the first pass, and for non-self comments.
		if (!isSelf && profile == null && this.userId.indexOf("urn:anon") != 0) {
			if (!this.widgetInstance._userIDCommentMap) {
				this.widgetInstance._userIDCommentMap = new Object();
			}
			if (!this.widgetInstance._userIDCommentMap[this.userId]) {
				this.widgetInstance._userIDCommentMap[this.userId] = new Array();
			}
			this.widgetInstance._userIDCommentMap[this.userId].push(newComment);
		}
		
		// if this is a comment for the current user, and the user isn't anonymous, add
		// the comment to an array, so we can easily update it if the profile changes
		if (isSelf && this.userId.indexOf("urn:anon") != 0) {
			if (!this.widgetInstance._selfComments) {
				this.widgetInstance._selfComments = new Array()
			}
			this.widgetInstance._selfComments.push(newComment);
		}
		
		// insert the comment in the right position with the right class
		var positionBefore = undefined;
		if (optionalArgs && optionalArgs.positionBefore) {
			var positionBefore = optionalArgs.positionBefore;
		}
		if (optionalArgs && optionalArgs.additionalComments) {
			j$(newComment).addClass("additionalComment");
		}
		if (positionBefore) {
			this.widgetInstance.commentsPage.insertBefore(newComment, positionBefore);
		} else {
			this.widgetInstance.commentsPage.appendChild(newComment);
		}	
	},
	_getAdditionalComments: function(self) {
		startIndex = self.initialCommentsShown+1
		self.cmInstance.getComments(self.objectURI, "1.0", tpCommentDataServicePrefix, self._additionalCommentsAfter.bindTo(self), startIndex);
		return false;
	},
	_additionalCommentsAfter: function(comments) {
		this._addCommentCollection(comments, true);
		j$(this.moreLessLinkContainer).addClass("commentsExpanded");
		j$(this.moreLessLinkContainer).removeClass("additionalCommentsLoading");
		this.additionalCommentsLoaded = true;
	},
	_formatCommentText: function(text){
		var splitComment = text.split("\n");
		var joinedComment = ""
		for(var p=0; p<splitComment.length; p++) {
			if (joinedComment.length != 0) {
				joinedComment += "<br/>";
			}
			joinedComment += this.cmInstance.sanitize(splitComment[p]);
		}
		return joinedComment;
	},
	_commentFormPoll: function() {
		if(j$.trim(this.nameField.val()).length > 0 || j$.trim(this.websiteField.val()).length > 0 || j$.trim(this.commentField.val()).length > 0) {
			tpController.suspendPlayAll(true);
		} else {
			tpController.suspendPlayAll(false);
		}
		var commentLength = this.commentField.val().length;
		var remainingChars = 1000-commentLength;
		this.remainingCommentChars.html(remainingChars);
	},
	_commentFieldFocus: function(evt) {
		var self = evt.data;
		self.commentPollSetInterval = setInterval(self._commentFormPoll.bindTo(self), 200);
	},
	_commentFieldBlur: function(evt) {
		var self = evt.data;
		self.nameFieldLastVal = self.nameField.val();
		self.websiteFieldLastVal = self.websiteField.val();
		self.commentFieldLastVal = self.commentField.val();
		clearInterval(self.commentPollSetInterval);
	},
	_commentFormSubmit: function(evt){
		var self = evt.data;
		var isValid = true;
		var errorMessage = "";
		if(j$.trim(self.nameField.val()).length == 0) {
			isValid = false;
			errorMessage += "- You must fill in a name\n";
		}
		if(self.commentField.val().length > 1000) {
			isValid = false;
			errorMessage += "- Your comment can not be longer than 1000 characters\n";
		} else if(self.commentField.val().length == 0 || jQuery.trim(self.commentField.val()).length == 0 ) {
			isValid = false;
			errorMessage += "- You must fill in a comment\n";
		}
		if( self.websiteField.val() != "") 
		{
			// var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
			// '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
			// '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
			// '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
			// '(\#[-a-z\d_]*)?$','i'); // fragment locater
			if(!self.cmInstance.isUri(self.websiteField.val())) {
				isValid = false;
				errorMessage += "- Your website must be a valid URL\n";
			}
		}
		 		
		if(isValid == true) {
			self.cmInstance.addComment(self.objectURI, self.nameField.val(), self.commentField.val(), self.websiteField.val(), self.apiVersion, self.commentsInstance, self.handleCommentCreation_GetCreatedComment.bindTo(self));
		} else {
			alert(errorMessage);
		}
		return false;
	},
	handleCommentCreation_GetCreatedComment: function (response) {
		if(this.cmInstance.isException(response)) {
			this.cmInstance.errorHandler(ratingObject);
			return false;
		}
		if(typeof response.id != "undefined" ) {
			// augment the response with the current clip, and send an event
			response.clip = this.clip;
			tpController.dispatchEvent("OnAddComment", response);
			
			// build basic comment
			var additionalArgs = {isSelf:true, positionBefore: this.commentsPage.firstChild};
			
			this._comments.push(new this._comment(this, response, additionalArgs));
				
			this._totalCommentCount++;
			this._setCommentCountLabel();
			this._clearCommentForm(this);			
			
			// scroll to show the new comment
			var targetOffset = j$(".communityManagerCommentsWidgetHeader").offset().top;
			j$('html,body').animate({scrollTop: targetOffset}, 500);
		}
	},
	_toggleFullPage: function(evt){
		var self = evt.data;
		if(typeof self.additionalCommentsLoaded != "undefined") {
			if(self.additionalCommentsLoaded == true) {
				//Comments are already all loaded, show them now
				j$(self.moreLessLinkContainer).toggleClass("commentsExpanded");
				self.widget.toggleClass("commentsExpanded");
			} else {
				//Comments are not loaded, load them now
				//Show loading indicator
				j$(self.moreLessLinkContainer).removeClass("commentsExpanded");
				j$(self.moreLessLinkContainer).addClass("additionalCommentsLoading");
				self.widget.toggleClass("commentsExpanded");
				self._getAdditionalComments(self);
			}
		} else {
			// There are no additional comments to show
		}
		return false;
	},
	_commentAddSuccess: function(responseObj){
		
	},
	_clearCommentForm: function(self){
		self.commentField.val("");
		self.commentFieldLastVal = null;
		self.remainingCommentChars.html("1000");
	},
	_formatCommentDate: function(addedDate) {
		var now = new Date();
		var delta = (now.getTime() - addedDate)/1000;
		var units = "";
		if (delta >= 1) {
			if (delta < 60) {
				units = "second";
			} else if (delta < 3600) {
				delta = delta / 60;
				units = "minute";
			} else if (delta < 86400) {
				delta = delta / 3600;
				units = "hour";
			} else if (delta < 604800) {
				delta = delta / 86400;
				units = "day";
			} else if (delta < 2419200) {
				delta = delta / 604800;
				units = "week";
			} else {
				var nowMonths = (now.getYear() * 12) + now.getMonth();
				var added = new Date(addedDate);
				var addedMonths = (added.getYear() * 12) + added.getMonth();
				var monthDelta = nowMonths - addedMonths;
				if (monthDelta < 12) {
					if (monthDelta < 1) {
						delta = 1;
					} else {
						delta = monthDelta;
					}
					units = "month";
				} else {
					delta = monthDelta / 12;
					units = "year";
				}
			}
			delta = Math.floor(delta);
			return "(" + delta + " " + units + (delta!=1?"s":"") + " ago)";
		} else {
			return "(just added)";
		}
	}
}
