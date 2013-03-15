var tpNumberOfPlayers = 0;

function MyPlayer(loadObj)
{

//    this.element = loadObj;//loadObj.element;

 //   this.properties = loadObj.properties;

     this.element = loadObj.element;

//    this.element = loadObj.element;
//
    this.properties = loadObj.properties;


    this.eventBus = loadObj.eventBus;


}

MyPlayer.prototype.init = function()
{

    // instantiate a Flash player or an HTML5 player

    this.player = new tpPlayer("player" + tpNumberOfPlayers, this.properties["width"], this.properties["height"], this.properties.id);

    tpNumberOfPlayers++;

    // add a plug-in to the player; in this case, a LiveRail ad plug-in
//				this.player.plugin1 = "type=adcomponent|URL=../../pdk/4.2.9/js/plugins/tpVastPlugIn.js|staticxml=VAST2xml.js|priority=1|hosts=delivery.theplatform.com,demoau.adbureau.net|mimeTypes=" + (getPlayerFormat() == "MPEG4" ? "video/x-mp4" : "video/ogg");

    // //this copies over all the properties
    // for (var key in this.properties)
    // {
    //     if (this.player[key]===undefined)
    //         this.player[key]=this.properties[key];
    // }

    //this.player.plugin1 = "type=adcomponent|URL=../js/plugins/tpVastPlugIn.js|staticxml=../VAST2xml.js|hosts=../VAST2xml.js|priority=1|mimeTypes=" + (getPlayerFormat() == "MPEG4" ? "video/x-mp4" : "video/ogg");
    //	this.player.plugin1 = this.properties["plugin1"]!==undefined? this.properties.plugin1 : "type=adcomponent|URL=../js/plugins/tpVastPlugIn.js|staticxml=../VAST2xml.js|hosts=../VAST2xml.js|priority=1|mimeTypes=video/x-mp4";

    //this will only work for props with no uppercase letters...
    for (var prop in this.properties)
    {
        if (this.player[prop] === undefined)
        {
            this.player[prop] = this.properties[prop];
        }
    }

        if (this.properties['autoplay'])
        {
            this.player.autoPlay = this.properties['autoplay'] !== "false";
        }
        else
            this.player.autoPlay = true;

    if (this.properties['releaseurl'])
    {
        this.player.releaseUrl = this.properties['releaseurl'];
    }

    if (this.properties['safemode'])
    {
        this.player.safeMode = this.properties['safemode'];
    }

    if (this.player.scopes === undefined || this.player.scopes === "")
    {
        this.player.scopes = this.properties.id + ",default,javascript";
    }



    /*if (window.$pdk!==undefined)
     {
     $pdk.env.Detect.getInstance().removePreloadStylesheet("tpPlayer");

     }*/

    delete this.properties;

    // write out the player to the page
    this.player.write(this.element);

    this.eventBus.dispatchEvent("viewReady", {});

};

MyPlayer.prototype.getDOMElement = function()
{
    return this.element;
}

//var instance = $pdk.Entrypoint.getInstance();
//
//instance.addCallback(function()
//{
//    $PdkInterfaces.IGenericScriptableView.bind("*", "tpPdkPlayer", MyPlayer);
//});
//
//if (window["tpPlayerWrapperCallBack"] !== undefined)
//{
//    try
//    {
//        $PdkInterfaces.IGenericScriptableView.bind("*", "tpPdkPlayer", MyPlayer);
//        $PdkInterfaces.IGenericScriptableView.bind("*", "tpPlayer", MyPlayer);
//        $PdkInterfaces.IGenericScriptableView.bind("playerwidget", "tpPdkPlayer", MyPlayer);
//        $PdkInterfaces.IGenericScriptableView.bind("PdkWidgetPlayer", "tpPdkPlayer", MyPlayer);
//        $PdkInterfaces.IGenericScriptableView.bind("playerwidget", "tpPlayer", MyPlayer);
//        $PdkInterfaces.IGenericScriptableView.bind("PdkWidgetPlayer", "tpPlayer", MyPlayer);
//
//        tpPlayerWrapperCallBack();
//    }
//    catch(e)
//    {
//        tpDebug(e);
//    }
//
//}

$PdkInterfaces.IGenericScriptableView.bind("*", "tpPdkPlayer", MyPlayer);
$PdkInterfaces.IGenericScriptableView.bind("*", "tpPlayer", MyPlayer);
$PdkInterfaces.IGenericScriptableView.bind("playerwidget", "tpPdkPlayer", MyPlayer);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetPlayer", "tpPdkPlayer", MyPlayer);
$PdkInterfaces.IGenericScriptableView.bind("playerwidget", "tpPlayer", MyPlayer);
$PdkInterfaces.IGenericScriptableView.bind("PdkWidgetPlayer", "tpPlayer", MyPlayer);

