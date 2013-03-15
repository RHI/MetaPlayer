//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************


CommunityWidgetManager = function() {
	this._initialize.apply(this, arguments);
}

CommunityWidgetManager.prototype = {
	ratingWidgetTypeName: "ratings",
	commentWidgetTypeName: "comments",
	profileWidgetTypeName: "profile",
	
	_initialize: function() {
		// no op
	},
	// Save the CommunityManager object that the widgets should use.
	setCommunityManager: function( communityManager ) {
		this.communityManager = communityManager;
	},
	
	getCommunityManager: function() {
		return this.communityManager;
	},
	
	// Holds the map of WidgetTypes to Divs and Objects
	widgetMap: new Object(),
	
	// This the ID of a DOM Element that the widget of the specified type can build itself inside.
	// There can only be one widget of each type on the page.
	registerWidgetDiv: function( widgetType, divID ) {
		if ( typeof this.widgetMap[widgetType] == "undefined" )
		{
			this.widgetMap[widgetType] = { divID: null, widget: null, config: null };
		}
		this.widgetMap[widgetType].divID = divID;
	},
	
	// Called by widgets as they are loaded and check to see if there is a location for them to add themselves to.
	getWidgetDiv: function( widgetType ) {
		return this.widgetMap[widgetType].divID;
	},
		
	// Called by the Widget once it has loaded into the div.
	registerWidget: function( widgetType, widget ) {
		if ( typeof this.widgetMap[widgetType] == "undefined" )
		{
			this.widgetMap[widgetType] = { divID: null, widget: null, config: null };
		}
		this.widgetMap[widgetType].widget = widget
	},
	
	// A simple way to get a reference to another widget.
	getWidget: function( widgetType ) {
		return this.widgetMap[widgetType].widget;
	},
	// Allows users to preset configurations and the widgets to load the configurations at the appropriate time.
	setWidgetConfiguration: function (widgetType, configurationObject) {
		if ( typeof this.widgetMap[widgetType] == "undefined" )
		{
			this.widgetMap[widgetType] = { divID: null, widget: null, config: null };
		}
		this.widgetMap[widgetType].config = configurationObject
	},
	// A simple way to get a config object for a widget.
	getWidgetConfiguration: function( widgetType ) {
		return this.widgetMap[widgetType].config;
	}
}

var tpCommunityWidgetManager = new CommunityWidgetManager();
	