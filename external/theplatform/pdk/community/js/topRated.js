//****************************************************************************
// Copyright (C) thePlatform for Media, Inc. All Rights Reserved.
//****************************************************************************

if (window.addEventListener){
	window.addEventListener("load", tpSetupTopRatedListener, true);
} else if (window.attachEvent){
	window.attachEvent("onload", tpSetupTopRatedListener );
}

// register to listen for category select events
function tpSetupTopRatedListener() {
	tpController.addEventListener("OnCategorySelected", tpHandleTopRated);
}

// if "Top Rated" is selected, get the top rated items
function tpHandleTopRated(evt) {
	if (evt.data == "TopRated") {
		tpCommunityManager.getTopRatings("1.0", tpTotalRatingDataServicePrefix, tpUpdateTopRated);	
	}
}

// take the passed back top ratings, and update the release list to show them
function tpUpdateTopRated(ratings) {
    if(tpCommunityManager.isAuthException(ratings)) {
        alert("Please sign in to see top-rated items.");
        tpCommunityManager.setContentIDs(null);
    } else if (tpCommunityManager.isException(ratings)) {
        this.cmInstance.errorHandler(ratings);
    } else {
	    tpCommunityManager.setContentIDs(ratings.entries);
    }
}

