function MyClipInfo(loadObj)
{

    this.element = loadObj.element;

//    this.element = loadObj.element;
//
    this.properties = loadObj.properties;


    this.eventBus = loadObj.eventBus;

}

MyClipInfo.prototype.init = function()
{

    // for (key in this.properties)
    //   {
    //       if (this[key]===undefined)
    //       this[key]=this.properties[key];
    //   }


    var me = this;

    this.scopes = this.properties["scopes"] ? this.properties["scopes"].split(",") : [this.properties.id,"default","javascript"];

    this.element.innerHTML="";//clear out the div

    tpController.addEventListener("OnLoadReleaseUrl", function()
    {
        me.handleRelease.apply(me, arguments)
    }, this.scopes);

    tpController.addEventListener("OnLoadRelease", function()
    {
        me.handleRelease.apply(me, arguments)
    }, this.scopes);

//    tpController.addEventListener("OnSetReleaseUrl", function()
//    {
//        me.handleRelease.apply(me, arguments)
//    }, this.scopes);

    tpController.addEventListener("OnSetRelease", function()
    {
        me.handleRelease.apply(me, arguments)
    }, this.scopes);

    tpController.addEventListener("OnMediaStart", function()
    {
        me.handleClip.apply(me, arguments)
    }, this.scopes);

  	tpController.addEventListener("OnRefreshReleaseModel", function()
    {
        me.flashFallback.apply(me, arguments)
    }, this.scopes);

    this.showTitle = this.properties["showtitle"]!==undefined? this.properties.showtitle=="true":true;
    this.showDescription = this.properties["showdescription"]!==undefined? this.properties.showdescription=="true":true;
    this.showCopyright = this.properties["showcopyright"]!==undefined? this.properties.showcopyright=="true":true;

    this.style = document.createElement("style");

    var head = document.getElementsByTagName("head")[0];
    this.style.setAttribute("type","text/css");
   // this.style.appendChild(document.createTextNode(""));//innerHTML = "";
    head.appendChild(this.style);
    
    // if (this.properties["backgroundcolor"])
    //     this.style.innerHTML += ".tpClipInfo { background-color:"+this.properties["backgroundcolor"].replace("0x","#")+" }"
    //IE7 doesn't like style.innerHTML

    var styleStr="";

    if (this.properties["titlecolor"])
    {
        styleStr += ".clipInfoTitle { color:"+this.properties["titlecolor"].replace("0x","#")+" }"
    }
    if (this.properties["descriptioncolor"])
    {
        styleStr += ".clipInfoDescription { color:"+this.properties["descriptioncolor"].replace("0x","#")+" }"
        //looks like in flash we just make copywrite the same as desc.
        styleStr += ".clipInfoCopyright { color:"+this.properties["descriptioncolor"].replace("0x","#")+" }"
    }
    // if (this.properties["copyrightcolor"])
    // {
    //     this.style.innerHTML += ".clipInfoCopyright { color:"+this.properties["copyrightcolor"].replace("0x","#")+" }"
    // }

    if (this.style.styleSheet)
       this.style.styleSheet.cssText = styleStr;
    else
        this.style.appendChild(document.createTextNode(styleStr));
    

    

    delete this.properties;

	this.eventBus.dispatchEvent("viewReady",{});
}

MyClipInfo.prototype.handleRelease = function(event)
{
    var release = event.data;
    var div = this.element;

    var crStr="";
    if (this.showCopyright)
    {
        crStr = release.copyright ? release.copyright:"";
        if (crStr.length>0&&crStr.indexOf('©')<0&&crStr.indexOf("(c)")<0)
        {
            crStr = "© "+ crStr;
        }
    }
    var titleString = "";
    var descString = "";
    if (this.showTitle)
       titleString = (release.title ? release.title : "");
    if (this.showDescription)
        descString = (release.description ? release.description : "");

    

    div.innerHTML = "<div class='clipInfo'><div class='clipInfoTitle'> " + titleString + "</div>" +
            "<div class='clipInfoDescription'>" + descString + "</div>"
+"<div class='clipInfoCopyright'>"+crStr+"</div></div>";

}

MyClipInfo.prototype.handleClip = function(event)
{

    var clip = event.data;
    var div = this.element;
    if (clip.baseClip)
    {

        var crStr="";
        if (this.showCopyright)
        {
            crStr = clip.baseClip.copyright ? clip.baseClip.copyright:"";
            if (crStr.length>0&&crStr.indexOf('©')<0&&crStr.indexOf("(c)")<0)
            {
                crStr = "© "+ crStr;
            }
        }

        var titleString = "";
        var descString = "";
        if (this.showTitle)
           titleString = (clip.baseClip.title ? clip.baseClip.title : clip.chapter && clip.chapter.title ? clip.chapter.title : "");
        if (this.showDescription)
            descString = (clip.baseClip.description ? clip.baseClip.description : "");

        div.innerHTML = "<div class='clipInfo'><div class='clipInfoTitle'> " + titleString + "</div>" +
            "<div class='clipInfoDescription'>" + descString + "</div>"
        +"<div class='clipInfoCopyright'>"+crStr+"</div></div>";    }

}

MyClipInfo.prototype.getDOMElement = function()
{
    return this.element;
}

MyClipInfo.prototype.flashFallback= function (e) {


			// don't change the format due to a bad search


			if (e.data.search) {

				return;

			}
			else if (!e.data.entries || e.data.entries.length == 0){


				// otherwise, put up an error message

				var mimetypes= ["video/mp4", "video/webm", "video/ogg"]
				var formats = ["MPEG4", "WebM", "Ogg"];

				function getPlayerFormat() {
	           		var testVideoTag = document.createElement("video");
					var format = formats[0];

					if (testVideoTag.canPlayType)
					{
						for (var i=0; i<mimetypes.length; i++)
						{
							if (testVideoTag.canPlayType(mimetypes[i]))
							{
								format = formats[i];
								break;
							}
						}
					}
					return format;
				}


				var format = getPlayerFormat();
				var desc = "This player requires a feed with ";

				for (var i=0; i<formats.length; i++) {
					if (formats[i] == format) {
						desc += "<b>" + mimetypes[i] + "</b>";
						break;
					}
				}

				desc += " encoded videos.";

			    this.handleClip({data: {baseClip: {title: "No playable content in feed", description:desc}}});

				//this is a fatal error, kill the player
				var player = document.getElementById("player1");
                if (player)
                {
                    player.innerHTML="";
                    player.style.backgroundColor="black";
                }
			}
		}



$PdkInterfaces.IGenericScriptableView.bind("*","tpPdkClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("info","tpPdkClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("clipinfowidget","tpPdkClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetclipinfo","tpPdkClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("*","tpClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("clipinfowidget","tpClipInfo",MyClipInfo)
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetclipinfo","tpClipInfo",MyClipInfo);
