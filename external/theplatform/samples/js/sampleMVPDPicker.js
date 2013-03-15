function onTrackingData(trackingEventType, trackingData)
{
    if (trackingEventType == "authenticationDetection" && trackingData[1] == "Dish") {
		var channel = "fbc-fox";
        adobePassShim.setResourceId(channel);
    }
}

function onSetProvider(providerId)
{
    if (providerId == "Dish")
    {
        var channel = "fbc-fox";
        adobePassShim.setResourceId(channel);
    }
}

function onAuthenticationStatus(authenticated, error)
{
	if (authenticated == 1)
	{
		document.getElementById("login").style.display = "none";
		document.getElementById("logout").style.display = "block";
	}
	else
	{
		document.getElementById("login").style.display = "block";
		document.getElementById("logout").style.display = "none";
	}
}

function tokenFailed(resource, code)
{
	//alert("[" + code + "] Token request failed for resource: " + resource);
}

var mvpdPickerCreated = false;

function displayMVPDPicker(arr)
{

	var width = 400;
	var height = 40 * arr.length + 50;

	_adobePassLightBox();
 
	if (!document.getElementById("mvpdList")) {
		var mvpdList = document.createElement("iframe");
		mvpdList.id = "mvpdList";
	}
	else {
		var mvpdList = document.getElementById("mvpdList");
	}

    document.getElementById("mvpddiv").appendChild(mvpdList);

    mvpdList.style.width = "100%";
    mvpdList.style.height = "100%";
    mvpdList.style.display = "block";

    document.getElementById("mvpdList").style.display = "block";
    document.getElementById("mvpddiv").style.display = "block";
    document.getElementById("closer").style.display = "block";
    document.getElementById("lightbox").style.display = "block";

    //create the iframe
    document.getElementById("mvpddiv").style.width = width + "px";
    document.getElementById("mvpddiv").style.height = height + "px";
    document.getElementById("mvpddiv").style.top = (document.body.offsetHeight - height) / 2 + "px";
    document.getElementById("mvpddiv").style.left = (document.body.offsetWidth - width) / 2 + "px";

	document.getElementById("closer").style.top = (document.body.offsetHeight - height) / 2 - 20 + "px";
	document.getElementById("closer").style.left = document.getElementById("mvpddiv").style.left;

    if (!mvpdPickerCreated)
    {
        for(var i = 0; i < arr.length; i++)
        {
			var div = document.createElement("DIV");
			div.className = "providerDiv";

            var img = document.createElement("IMG");
            img.id = arr[i].ID;
            img.src = arr[i].logoURL;
            img.onclick = function(){onSelectMVPD(this);};
			div.appendChild(img);
            document.getElementById("mvpdList").appendChild(div);
        }
        mvpdPickerCreated = true;
    }


    document.getElementById("mvpdList").style.display = "block";    
}


function  onSelectMVPD(link)
{
	adobePassShim.setSelectedProvider(link.id);

    closeMVPD();
}

function closeMVPD()
{
    document.getElementById("mvpddiv").style.display = "none";
    document.getElementById("mvpdList").style.display = "none";
    document.getElementById("lightbox").style.display = "none";
    document.getElementById("closer").style.display = "none";
}

// Use the logout method even when a user starts the login process but then 
// aborts it even without attempting to login (if they realize they forgot their
// password or they don't have an account with any of the available MVPDs, for example).
// Failing to do so will leave Adobe Pass in an unusable state. 
function closeSession()
{
    logout();//logging out allows the user to try to log in again, otherwise it will throw an error
    adobePassShim.setSelectedProvider(null);//setting the provider to null prevents the pdk from opening the picker every time there's a new release
}

function createMVPDIFrame(width,height)
{
	_adobePassLightBox();
	
	if (!document.getElementById("mvpdframe")) {
		var mvpdframe = document.createElement("iframe");
		mvpdframe.id = "mvpdframe";
		mvpdframe.style.display = "none";
	}
	else
	{
		var mvpdframe = document.getElementById("mvpdframe");
	}

	document.getElementById("mvpdframe").style.display = "block";
    document.getElementById("mvpddiv").style.display = "block";
    document.getElementById("lightbox").style.display = "block";
    document.getElementById("closer").style.display = "block";

	mvpdframe.style.width = "100%";
	mvpdframe.style.height = "100%";
    
    //create the iframe
    document.getElementById("mvpddiv").style.width = width + "px";
    document.getElementById("mvpddiv").style.height = height + "px";
	document.getElementById("mvpddiv").style.top = (document.body.offsetHeight - height) / 2 + "px";
	document.getElementById("mvpddiv").style.left = (document.body.offsetWidth - width) / 2 + "px";
	
	document.getElementById("closer").style.top = (document.body.offsetHeight - height) / 2 - 20 + "px";
	document.getElementById("closer").style.left = document.getElementById("mvpddiv").style.left;
}

function _adobePassLightBox()
{

	if (!document.getElementById("lightbox"))
	{
		var lightbox = document.createElement("div");
		lightbox.id = "lightbox";
		document.body.appendChild(lightbox);
		
		var closer = document.createElement("a");
		closer.href="#";
		closer.id = "closer";
		closer.style.position = "absolute";
		closer.style.padding = "4px";
		closer.style.color = "white";
		closer.style.textDecoration = "none";
		closer.backgroundColor = "#666666";
		
		closer.onclick = function(e) { closeMVPD(); closeSession(); } 
		closer.innerHTML = "X";
		closer.style.zIndex = "1001";
		closer.style.display = "none";
		document.body.appendChild(closer);
	}
	else {
		var lightbox = document.getElementById("lightbox");
	}
	
	lightbox.style.position = "absolute";
	lightbox.style.width = "100%";
	lightbox.style.height = "100%";
	lightbox.style.display = "none";
	lightbox.style.top = "0";
	lightbox.style.left = "0"
	lightbox.style.backgroundColor = "#000000";
	lightbox.style.opacity = "0.6";
	lightbox.style.filter = "alpha(opacity=60)";
	lightbox.style.zIndex = "1000";

	if (!document.getElementById("mvpddiv"))
	{
		var mvpddiv = document.createElement("div");
		mvpddiv.id = "mvpddiv";
		document.body.appendChild(mvpddiv);
	}
	else {
		var mvpddiv = document.getElementById("mvpddiv");
	}
	mvpddiv.style.position = "absolute";
	mvpddiv.style.display = "none";
	mvpddiv.style.backgroundColor = "#FFFFFF";
	mvpddiv.style.zIndex = "1001";	
	
	if (document.getElementById("mvpddiv")) {
		document.getElementById("mvpddiv").style.display = "none";
	}

	if (document.getElementById("mvpdList")) {
		document.getElementById("mvpdList").style.display = "none";
	}

	if (document.getElementById("mvpdframe")) {
		document.getElementById("mvpdframe").style.display = "none";
	}

}

// Use the logout method even when a user starts the login process but then 
// aborts it even without attempting to login (if they realize they forgot their
// password or they don't have an account with any of the available MVPDs, for example).
// Failing to do so will leave Adobe Pass in an unusable state. 
function logout()
{
    adobePassShim.logout();
}

function login()
{
    adobePassShim.getAuthentication();
}


