//this is the prototype for the js view

function NavView(loadObj)
{

    this.element = loadObj.element;

//    this.element = loadObj.element;
//
    this.properties = loadObj.properties;


    this.eventBus = loadObj.eventBus;
//

 //   this.init();

}

NavView.prototype.init=function()
{
    //might want to ensure jquery is available
    if (window["$"]!==undefined)
        this.initialize(this.element);
    else //we need to load in jquery
    {
        var me = this;
        //we could probably improve this by going through gwt's scriptloader...
        tpLoadScript($pdk.scriptRoot+"/js/jquery-1.5.2.min.js",function(){
            me.initialize(me.element);
        });
    }
}

NavView.isEmptyDiv=function(element){
	var children = $(element).children().not("script").not("link");
	if (children.length===0)
		return true;
	else
	{
		//need to loop through elements, until we find one that's not a script tag

		return false;

	}

	return true;
}

NavView.prototype.verticalAlign=function()
{
    if(this.verticalCenter)
    {
        // $(this.element).css('padding-top','5px');
        //if it was empty, we also need to vertically center...
        $(this.element).children().each(function(i){
            var ah = $(this).height();
            if (ah<=0)
                ah = 15;

            var ph = $(this).parent().height();
            var mh = Math.floor((ph-ah) / 2);
            $(this).css('margin-top', mh);
        });
    }
}

NavView.prototype.initialize=function(newElement)
{

    if (newElement)//need to check it has real childnodes (non-empty text)
        this.element = newElement;//document.createElement("div");
	else
		this.element = document.createElement("div");

	//if we're empty, inject default html

	var wasEmpty = NavView.isEmptyDiv(this.element)

	if (wasEmpty)
    {
         //if they don't supply us an element, they better take ours later..
        var infoStr = this.properties['showinfo']=='false'? "":'<span class=\"tpRangeInfo\">${rangeStart}-${rangeEnd} of ${rangeTotal}</span>';
		var pageLinksStr = this.properties['showPageLinks'] !='true' ? "":'<div class=\"tpPageLinks\"></div>';
		//we stick in the default html if no element was supplied
        this.element.innerHTML = '<a href="#" class="tpPreviousRange"><span>Previous</span></a>'
        +infoStr
		+pageLinksStr
        +'<a href="#" class="tpNextRange" ><span>Next</span></a>';

    }

	this.verticalCenter = this.properties['verticalcenter'] =='true'||wasEmpty ? true:false;

	this.verticalAlign();

    //we need to do a bunch of stuff with styles, where we set css based on the color properties

//    var bgColor = this.properties['backgroundcolor'];
    var infoColor = this.properties['infocolor'];

    // if (bgColor!==undefined)
    // {
    //     bgColor = bgColor.replace("0x","#");
    //     //this.element.style.backgroundColor=bgColor;
    //
    //     //we have to do a ton of extra stuff to make the opacity work...
    //
    // }

    var revs = $(newElement).children(".tpPreviousRange");
    if (revs&&revs[0])
    {
        this.reverseBtn = revs[0];
        if (this.revEnabled===false)
        {
            $(this.reverseBtn).addClass("tpDisabled");
            delete this.revEnabled;
        }
    }
	//if the button isn't there, we don't try to add one


    var labels = $(newElement).children(".tpRangeInfo");//newElement.getElementsByClassName("tpRangeInfo");
    if (labels&&labels[0])
    {
        this.textSpan=labels[0];

		//need to set rangeInfoTemplate
		this.rangeInfoTemplate = this.textSpan.innerHTML;

		this.textSpan.innerHTML = "";//we empty it out, so the template doesn't flash

        if (this.searchText!==undefined)
        {
            this.textSpan.innerHTML=this.searchText;
            delete this.searchText;
        }
        if (infoColor!==undefined)
            this.textSpan.style.color=infoColor.replace("0x","#");

    }
  	//if the text isn't there, we don't try to add one

    //this.textSpan.innerHTML = "0-0 of 0";

    var fwds = $(newElement).children(".tpNextRange");//newElement.getElementsByClassName("tpNextRange");
    if (fwds&&fwds[0])
    {
        this.forwardBtn=fwds[0];
        if (this.fwdEnabled===false)
        {
            $(this.forwardBtn).addClass("tpDisabled");
            delete this.fwdEnabled;
        }


    }
   	//if the button isn't there, we don't try to add one


    var me = this;

	if (this.forwardBtn)
	{
		//using a jquery listener handles the cross-browser issues
	    $(this.forwardBtn).click(function(e)
	    {
			e.preventDefault();
	        if (!$(me.forwardBtn).hasClass('tpDisabled'))
	            me.eventBus.dispatchEvent("forwardClicked", {});
	    });
	}

	if (this.reverseBtn)
	{
	    $(this.reverseBtn).click(function(e)
	    {
			e.preventDefault();
	        if (!$(me.reverseBtn).hasClass('tpDisabled'))
	            me.eventBus.dispatchEvent("reverseClicked", {});
	    });
	}



	this.eventBus.dispatchEvent("viewReady",{});

}




NavView.prototype.enableForwardButton = function()
{
    if (this.forwardBtn)
        $(this.forwardBtn).removeClass("tpDisabled");
    else
        this.fwdEnabled=true;
}
NavView.prototype.enableReverseButton = function()
{
    if (this.reverseBtn)
        $(this.reverseBtn).removeClass("tpDisabled");
    else
        this.revEnabled=true;
}
NavView.prototype.disableForwardButton = function()
{
    if (this.forwardBtn)
        $(this.forwardBtn).addClass("tpDisabled");
    else
        this.fwdEnabled=false;
}
NavView.prototype.disableReverseButton = function()
{
    if (this.reverseBtn)
        $(this.reverseBtn).addClass("tpDisabled");
    else
        this.revEnabled=false;
}
NavView.prototype.setSearchText = function(text)
{
    if (this.textSpan)
        this.textSpan.innerHTML = text;
    else
        this.searchText=text;
}

NavView.prototype.getRangeInfoTemplate = function()
{
	return this['rangeInfoTemplate'];
}

NavView.prototype.getDOMElement = function()
{
    var ret = this.element;
    return ret;
}


$PdkInterfaces.INavigationView.bind("PdkWidgetnavigation", "tpNavigation", NavView, true);
$PdkInterfaces.INavigationView.bind("*", "tpNavigation", NavView, true);


