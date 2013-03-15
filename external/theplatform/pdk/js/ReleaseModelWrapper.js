function MyReleaseModel(loadObj)
{

//    this.element = loadObj;//loadObj.element;
//
////    this.element = loadObj.element;
////
////    this.properties = loadObj.properties;


     this.element = loadObj.element;

//    this.element = loadObj.element;
//
    this.properties = loadObj.properties;


    this.eventBus = loadObj.eventBus;




}

MyReleaseModel.prototype.init = function()
{

    this.releaseModel = new tpReleaseModel("releasemodel");

    // the base feed to use.

    // for (key in this.properties)
    //                  {
    //                      if (this.releaseModel[key]===undefined)
    //                          this.releaseModel[key]=this.properties[key];
    //                  }

    this.releaseModel.feedsServiceUrl = this.properties["feedsserviceurl"] !== undefined ? this.properties.feedsserviceurl : undefined;

    // the start of the range to fetch; this is 1-based, not 0-based
    this.releaseModel.startIndex = this.properties["startindex"] !== undefined ? parseInt(this.properties.startindex) : 1;

    // the end of the range to fetch; like startIndex, this is 1-based

    this.releaseModel.endIndex = this.properties["endindex"] !== undefined && !isNaN(this.properties["endindex"]) ? parseInt(this.properties.endindex) : 4;

    /*var mimetypes= ["video/mp4", "video/webm", "video/ogg"]
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

     // any additional run-time parameters; here, we only ask for formats that can
     // play in the current player
     //for some reason the bootloader sticks in FLV here??
     this.releaseModel.params = "byContent=byFormat%3D"+getPlayerFormat();*/
    for (prop in this.properties)
    {
        if (this.releaseModel[prop] === undefined)
        {
            this.releaseModel[prop] = this.properties[prop];
        }
    }

    if (this.releaseModel.scopes === undefined || this.releaseModel.scopes === "")
    {
        this.releaseModel.scopes = this.properties.id + ",default,javascript";
    }

    delete this.properties;

    this.releaseModel.write();

    //not really a view, but do this anyway
    this.eventBus.dispatchEvent("viewReady", {});
    // this.ready=false;

};

MyReleaseModel.prototype.getDOMElement = function()
{
    return this.element;
}

$PdkInterfaces.IGenericScriptableView.bind("*", "tpPdkReleaseModel", MyReleaseModel);
$PdkInterfaces.IGenericScriptableView.bind("releasemodelwidget", "tpPdkReleaseModel", MyReleaseModel);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetreleasemodel", "tpPdkReleaseModel", MyReleaseModel);

$PdkInterfaces.IGenericScriptableView.bind("*", "tpReleaseModel", MyReleaseModel);
$PdkInterfaces.IGenericScriptableView.bind("releasemodelwidget", "tpReleaseModel", MyReleaseModel);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetreleasemodel", "tpReleaseModel", MyReleaseModel);

