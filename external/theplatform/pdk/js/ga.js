//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

// a map of trackers, keyed by instance ID
var tpGaPageTrackers;

// a map of tracking queues, keyed by instance ID
var tpGaTrackingQueues;

// this is the callback for when this file is loaded.
function tpGaWrapperLoaded(s)
{
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	tpScriptLoader.addScript(gaJsHost + "google-analytics.com/ga.js", "tpGaLoaded");
}

// this is the callback for the scripts used by this file are loaded.
function tpGaLoaded()
{
	tpController.dispatchEvent("OnJavascriptLoaded", "tpGaLoaded");
}

// initialize tracking
function tpGaInit(instanceID, trackingID)
{
	if (!tpGaPageTrackers)
	{
		tpGaPageTrackers = new Object();
	}
	tpGaPageTrackers[instanceID] = _gat._getTracker(trackingID);
	tpGaPageTrackers[instanceID]._initData();
}

// post a URL directly; should only be called privately
function tpGaTrack(instanceID, url)
{
	tpGaPageTrackers[instanceID]._trackPageview(url);
}

// add a URL to a queue of usage to be sent; this is to handle page close events
function tpGaUpdateTracking(instanceID, clipID, url)
{
	if (!tpGaTrackingQueues)
	{
		tpGaTrackingQueues = new Object();
	}
	if (!tpGaTrackingQueues[instanceID])
	{
		tpGaTrackingQueues[instanceID] = new Object();
	}
	tpGaTrackingQueues[instanceID][clipID] = url;
}

// commit pending tracking for a particular instance
function tpGaCommit(instanceID, clipID)
{
	var url = tpGaTrackingQueues[instanceID][clipID];
	if (url)
	{
		tpGaTrack(instanceID, url);
		tpGaTrackingQueues[instanceID][clipID] = null;
	}
}

// commit all pending tracking for all trackers; used on unload
function tpGaCommitAll()
{
	for (var instanceID in tpGaTrackingQueues)
	{
		var queue = tpGaTrackingQueues[instanceID];
		for (var clipID in queue)
		{
			var url = queue[clipID];
			if (url != null)
			{
				tpGaTrack(instanceID, url);
			}
		}
	}
	tpGaTrackingQueues = new Object();
}

// set up the onunload event handler
if(window.attachEvent)
{
	window.attachEvent("onunload", tpGaCommitAll);
}
else if(window.addEventListener)
{
	window.addEventListener("unload", tpGaCommitAll, false);
}
else
{
	window.onunload = tpGaCommitAll;
}

