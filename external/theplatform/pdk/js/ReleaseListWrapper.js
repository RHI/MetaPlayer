function MyReleaseList(loadObj)
{

  //  this.element = loadObj;//loadObj.element;

//    this.element = loadObj.element;
//
//    this.properties = loadObj.properties;

     this.element = loadObj.element;

//    this.element = loadObj.element;
//
    this.properties = loadObj.properties;


    this.eventBus = loadObj.eventBus;


}

MyReleaseList.prototype.init = function()
{
    //tpRegisterID(this.properties.id);
    this.releaseList = new tpReleaseList(this.properties.id, "100%", "100%");

    // for (key in this.properties)
    //          {
    //              if (this.releaseList[key]===undefined)
    //              this.releaseList[key]=this.properties[key];
    //          }

    // don't automatically start playback of the first clip; just load it in the player
    this.releaseList.autoPlay = this.properties["autoplay"] !== undefined ? this.properties.autoplay == "true" : true;
    this.releaseList.autoLoad = this.properties["autoload"] !== undefined ? this.properties.autoload == "true" : true;

    // when the current clip finishes, don't automatically start playing the next clip
    this.releaseList.playAll = this.properties["playall"] !== undefined ? this.properties.playall == "true" : true;

    this.releaseList.showTitle = this.properties["showtitle"] !== undefined ? this.properties.showtitle == "true" : true;

    this.releaseList.showLength = this.properties["showlength"] !== undefined ? this.properties.showlength == "true" : true;

    this.releaseList.showDescription = this.properties["showdescription"] !== undefined ? this.properties.showdescription == "true" : true;

    this.releaseList.showThumbnail = this.properties["showthumbnail"] !== undefined ? this.properties.showthumbnail == "true" : true;

    for (prop in this.properties)
    {
        if (this.releaseList[prop] === undefined)
        {
            this.releaseList[prop] = this.properties[prop];
        }
    }

    this.releaseList.itemsPerPage = this.properties["itemsperpage"] !== undefined ? this.properties.itemsperpage : 4;

    if (this.releaseList.scopes === undefined || this.releaseList.scopes === "")
    {
        this.releaseList.scopes = this.properties.id + ",default,javascript";
    }

    delete this.properties;

    this.releaseList.write(this.element);

    this.eventBus.dispatchEvent("viewReady", {});

};

MyReleaseList.prototype.getDOMElement = function()
{
    return this.element;
}

$PdkInterfaces.IGenericScriptableView.bind("*", "tpPdkReleaseList", MyReleaseList);
$PdkInterfaces.IGenericScriptableView.bind("releaselistwidget", "tpPdkReleaseList", MyReleaseList);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetreleaselist", "tpPdkReleaseList", MyReleaseList);
$PdkInterfaces.IGenericScriptableView.bind("*", "tpReleaseList", MyReleaseList);
$PdkInterfaces.IGenericScriptableView.bind("releaselistwidget", "tpReleaseList", MyReleaseList);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetreleaselist", "tpReleaseList", MyReleaseList);
