/**
 * Created by IntelliJ IDEA.
 * User: andre.desroches
 * Date: Jun 21, 2010
 * Time: 4:10:20 PM
 * To change this template use File | Settings | File Templates.
 */

//this plugin should create an end card to get put into playerDiv.standby ?

/**
 * Created by IntelliJ IDEA.
 * User: andre.desroches
 * Date: Jun 22, 2010
 * Time: 4:04:58 PM
 * To change this template use File | Settings | File Templates.
 */


var MAX_RELATED_ITEMS = 6;
var RELATED_ITEMS_WIDTH = "100%";
var RELATED_ITEMS_HEIGHT = "40%";
var RELATED_ITEMS_COLUMNS = 6;

var THUMB_WIDTH = 90;
var THUMB_HEIGHT = 50;

RelatedItems = Class.extend({

    init:function(id, width, height, parent, controller)
    {


        //initialize constants

        this.columns = RELATED_ITEMS_COLUMNS;

        this.itemsPerPage = MAX_RELATED_ITEMS;

        this.controller = controller;

        this.id = id;

        if (width)
        {
            this.width = width;
        }
        else
        {
            this.width = RELATED_ITEMS_WIDTH;
        }

        if (height)
        {
            this.height = height;
        }
        else
        {
            this.height = RELATED_ITEMS_HEIGHT;
        }

        this.parent = parent;


    },


    createView:function(parent)
    {


        //user agent should garbage collect old view if it exists..i think

        // document.write("<div id=\"" + this.id + "\" class=\"relatedItems\" > </div>");//div to stick everything in

        if (this.view)
        {
            this.view.innerHTML = "";
        }


        this.view = document.createElement("div");

        this.topDiv = document.createElement("div");

        this.topDiv.id = this.id + ".topDiv";

        this.topDiv.className = "relatedItemsTopDiv";
        //            this.topDiv.style.display="inline";


        this.bottomDiv = document.createElement("div");

        this.bottomDiv.id = this.id + ".bottomDiv";

        this.bottomDiv.className = "relatedItemsBottomDiv";


        this.innerDiv = document.createElement("div");


        this.innerDiv.id = this.id + ".relatedItemsInnerDiv";

        this.innerDiv.className = "relatedItemsInnerDiv";

        //this.innerDiv.style.width="auto";
        // this.innerDiv.style['float']="left";

        // this.innerDiv.style.position="relative";

        this.relatedItemsList = document.createElement("ul");

        this.relatedItemsList.id = this.id + ".relatedItemsList";

        this.relatedItemsList.className = "relatedItemsList";


        this.view.align = "center";
        this.view.style.position = "relative";

        this.innerDiv.align = "center";

        this.view.style.textAlign = "center";

        this.innerDiv.style.textAlign = "center";

        this.innerDiv.style.width = "90%";
        this.innerDiv.style.height = "100%";
        //            this.innerDiv.style['float']="left";

        this.view.id = this.id;

        this.view.className = "relatedItems";

        this.view.style.display = "";
        this.view.style.height = this.height;
        this.view.style.width = this.width;

        if (parent)
        {
            this.parent = parent;
        }
        else
        {
            this.parent = document.getElementById("player.standby");
        }//this will go where cards go

        if (this.parent)
        {
            // this.parent.innerHTML="";
            // this.parent.appendChild(this.view);
        }


        //  this.innerDiv.appendChild(this.relatedItemsList);


        var label = document.createElement("h3");

        label.innerHTML = "Related Items";
        label.className = "relatedItemsHeader";

        label.style.marginLeft = "15px";

        //label.style['float'] = "left";

        label.style.width = "auto";
        label.style.color = "white";
        label.style.display = "inline";

        this.pageLabel = document.createElement("h3");

        this.pageLabel.innerHTML = "";
        this.pageLabel.className = "relatedItemsHeader";

        this.pageLabel.style.textAlign = "right";
        this.pageLabel.style.width = "auto";
        this.pageLabel.style.color = "white";
        this.pageLabel.style.display = "inline";
        this.pageLabel.style.marginRight = "15px";


        var outerSpan = document.createElement("span");
        outerSpan.style.display = "inline";
        outerSpan.style.width = "100%";
        var innerSpan1 = document.createElement("span");

        var innerSpan2 = document.createElement("span");

        innerSpan2.className = "relatedItemsRightHeaderSpan";

        innerSpan2.style['float'] = "right";


        innerSpan1.appendChild(label);
        innerSpan2.appendChild(this.pageLabel);
        outerSpan.appendChild(innerSpan1);
        outerSpan.appendChild(innerSpan2);

        this.topDiv.appendChild(outerSpan);

        //            this.topDiv.appendChild(label);
        //            this.topDiv.appendChild(this.pageLabel);

        var hr = document.createElement("hr");

        hr.style.position = "relative";
        hr.style.bottom = "0px";

        this.topDiv.appendChild(hr);


        this.topDiv.style.textAlign = "left";
        this.topDiv.style.marginTop = "5px";

        //put a text field in bottom div

        this.hoverLabel = document.createElement("p");

        this.hoverLabel.className = "relatedItemsHoverLabel";
        this.hoverLabel.style.color = "white";
        this.hoverLabel.style.marginLeft = "15px";
        this.hoverLabel.style.marginTop = "15px";


        //this.bottomDiv.style.position="relative";

        this.bottomDiv.style.textAlign = "left";


        this.bottomDiv.style.position = "absolute";

        this.bottomDiv.style['float'] = "left";
        this.bottomDiv.style.bottom = "15px";

        this.bottomDiv.appendChild(this.hoverLabel);


        this.view.appendChild(this.topDiv);

        this.listContainer = document.createElement("div");

        this.listContainer.style.margin = "0px auto";

        this.listContainer.style.width = "100%";
        this.listContainer.style.height = "auto";
        this.listContainer.style.textAlign = "center";
        this.listContainer.align = "center";
        this.listContainer.style['float'] = "bottom";
        this.listContainer.style.position = "relative";

        this.nextButton = document.createElement("a");
        this.previousButton = document.createElement("a");

        var img = document.createElement("img");
        var img2 = document.createElement("img");
        img.src = $pdk.scriptRoot+"/images/next.png";
        img2.src = $pdk.scriptRoot+"/images/back.png";
        //img.style.height=THUMB_HEIGHT+"px";
        //            img.style.width="8px";
        //            img2.style.width="8px";
        //img2.style.height=THUMB_HEIGHT+"px";;
        //            img.style.top="50%";
        //            img2.style.top="50%";
        img.style.border = "none";
        img2.style.border = "none";

        this.nextButton.appendChild(img);
        this.previousButton.appendChild(img2);

        this.nextButton.style.display = "none";
        this.previousButton.style.display = "none";


        this.nextButton.className = "relatedItemNextButton";
        this.previousButton.className = "relatedItemPreviousButton";

        this.nextButton.href = "#";
        this.previousButton.href = "#";

        var me = this;

        this.nextButton.onclick = function(e)
        {
            tpDebug("got click on button");
            me.controller.dispatchEvent("relatedItemsNextPage");
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

        };
        this.previousButton.onclick = function(e)
        {
            tpDebug("got click on button");
            me.controller.dispatchEvent("relatedItemsPreviousPage");

            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

        };

        var prevDiv = document.createElement("div");
        var nextDiv = document.createElement("div");
        prevDiv.className = "relatedItemsButtonContainer";
        nextDiv.className = "relatedItemsButtonContainer";

        prevDiv.style.left = "1px";
        nextDiv.style.right = "4px";

        prevDiv.appendChild(this.previousButton);
        nextDiv.appendChild(this.nextButton);


        // this.listContainer.appendChild(this.previousButton);

        //this.listContainer.appendChild(this.innerDiv);
        this.listContainer.appendChild(prevDiv);
        this.listContainer.appendChild(this.relatedItemsList);
        this.listContainer.appendChild(nextDiv);


        // this.listContainer.appendChild(this.nextButton);


        this.blocker = document.createElement("div");

        this.blocker.style.height = "100%";
        this.blocker.style.width = "100%";

        this.blocker.id = this.id + ".blocker";
        this.blocker.className = "relatedItemsInnerBlocker";


        this.blocker.style.display = "";

        this.blocker.style.background = "black";
        this.blocker.style.position = "absolute";


        this.blocker.style.display = "";
        this.blocker.style.top = "0px";
        this.blocker.style.left = "0px";

        this.blocker.style.opacity = "0.75";
        this.blocker.style.filter = "alpha(opacity=75)";

        this.blocker.style.zIndex = "1000";


        this.container = document.createElement("div");

        this.container.style.position = "absolute";

        this.container.style.display = "";

        this.container.style.zIndex = "2000";

        this.container.style.height = "100%";
        this.container.style.width = "100%";

        this.view.appendChild(this.blocker);


        this.container.appendChild(this.topDiv);
        this.container.appendChild(this.listContainer);
        this.container.appendChild(this.bottomDiv);

        this.view.appendChild(this.container);

        //            this.view.appendChild(this.listContainer);
        //
        //            this.view.appendChild(this.bottomDiv);


        if (this.releaseFeed)
        {
            //never do this here...should really wait for an event
            this.items = this.createItems(this.releaseFeed);


        }
        else
        {

            tpDebug("no release feed yet");
        }


        return this.view;


    },

    write:function()
    {

        this.createView(this.parent);
    },

    createItems: function(feed)
    {

        //need to add all the children to the list
        var tile;
        var tileWrap;
        var listItem;
        var img;
        var title;
        var a;

        this.feed = feed;
        this.currentIndex = 0;

        this.relatedItemsList.innerHTML = "";
        this.pageLabel.innerHTML = "";

        var itemWidth = -1;
        var itemHeight = -1;

        //TODO: should be hidden, need a getContentArea
        var mediaArea = this.controller.getComponentSize();

        if (false && this.columns && this.itemsPerPage && this.view.offsetWidth && this.view.offsetHeight)
        {

            itemWidth = Math.floor(this.view.offsetWidth / this.columns);
            itemHeight = Math.floor(this.view.offsetHeight / (this.itemsPerPage / this.columns));
            //                    itemWidth = Math.floor(mediaArea.width / this.columns)+"px";
            //                    itemHeight = "100%";//height just fits to parent
            // itemHeight = Math.floor(mediaArea.height / (this.itemsPerPage / this.columns))+"px";
        }
        else
        {
            tpDebug("offsetHeight not ready yet");
            itemWidth = THUMB_WIDTH + "px";
            itemHeight = THUMB_HEIGHT + "px";//height just fits to parent
        }

        tpDebug("itemWidth=" + itemWidth);
        tpDebug("itemHeight=" + itemHeight);

        //            var li1 = document.createElement("li");
        //            var li2 = document.createElement("li");
        //
        //            li1.style.display="inline";
        //            li2.style.display="inline";

        //            li1.appendChild(this.previousButton);
        //            li2.appendChild(this.nextButton);
        //            this.relatedItemsList.appendChild(li1);


        if (feed.range.endIndex >= 0 && feed.range.endIndex < feed.range.totalCount && feed.range.endIndex < feed.range.itemCount)
        {
            this.nextButton.style.display = "inline";
        }
        else
        {
            this.nextButton.style.display = "none";
        }
        if (feed.range.startIndex <= 1)
        {
            this.previousButton.style.display = "none";
        }
        else
        {
            this.previousButton.style.display = "inline";
        }

        //here we configure the page label

        if (feed.range.startIndex >= 0 && feed.range.endIndex >= 0)
        {
            this.pageLabel.innerHTML = feed.range.startIndex + " - " + feed.range.endIndex + " of " + feed.range.itemCount;
        }
        else
        {
            this.pageLabel.innerHTML = "0 - 0 of " + feed.range.itemCount;
        }


        if (feed.entries.length < 1)
        {
            return;
        }//don't add releases


        for (var i = 0; i < MAX_RELATED_ITEMS; i++)
        {
            //for (var i=0; i<feed.entries.length; i++) {

            listItem = document.createElement("li");

            tileWrap = document.createElement("div");


            tile = document.createElement("div");


            image = document.createElement("img");
            //title = document.createElement("div");

            tileWrap.className = "relatedItemWrap";
            tileWrap.style.height = itemHeight;
            tileWrap.style.itemWidth = itemWidth;
            tile.className = "relatedItem";
            //title.className = "releaseListTitle";
            image.className = "relatedItemThumb";
            image.style.border = "1px solid transparent";
            image.style.display = "none";

            listItem.style.height = itemHeight;
            listItem.style.width = itemWidth;

            if (feed.entries[i])
            {

                a = document.createElement("a");

                a.href = "#";
                a.release = feed.entries[i];
                a.index = i;
                a.className = "relatedItemWrap";
                a.image = image;
                a.style.border = "1px solid transparent";
                var me = this;

                a.onclick = function(e)
                {
                    
                    e.preventDefault();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();

                    //TODO: should replace this with an event or call to a registered function
                    if (tpIsAndroid())
                    {
                        me.controller.loadReleaseURL(this.release.url);
                    }
                    else
                    {
                        me.controller.setReleaseURL(this.release.url);
                        //  me.controller.dispatchEvent("OnShowPlayOverlay",false);
                    }
                    return false;
                };
                a.onmouseover = function()
                {

                    //should show release title in another div, and

                    //could try increasing height/width by some percentage, but that would still cause a shift

                    this.image.style.border = "1px solid #FFFFFF";
                    me.hoverLabel.innerHTML = this.release.title;

                };
                a.onmouseout = function()
                {

                    this.image.style.border = "1px solid transparent";
                    me.hoverLabel.innerHTML = "";

                };

                // title.innerHTML = feed.entries[i].title;
                if (feed.entries[i] && feed.entries[i].defaultThumbnailUrl)
                {
                    image.src = feed.entries[i].defaultThumbnailUrl;
                }

//                a.style.width = "100%";
//                a.style.height = "100%";

                a.appendChild(image);

                tile.appendChild(a);


                //we should always do this
                if (true || itemWidth > 0 && itemHeight > 0)
                {


                    image.onload = function()
                    {

                        //"this" is the image, need to size it to fix in a 90x50 box
                        tpScaleImage(this, THUMB_WIDTH, THUMB_HEIGHT);
                        this.style.display = "";
                    }
                }


                //  tileWrap.style['float'] = "left";
                //                    listItem.appendChild(tile);
                // tileWrap.appendChild(tile);

            }
            else
            {
                //still need to force div to take up heightxwidth space
            }

            tileWrap.style.width = itemWidth;
            tileWrap.style.height = itemHeight;

            listItem.appendChild(tile);
            this.relatedItemsList.appendChild(listItem);


            //listItem.appendChild(a);


            tpDebug("item #" + i + " should have been created");

        }

        //   this.relatedItemsList.appendChild(li2);


    },

    show: function(show)
    {

        if (show)
        {
            this.view.style.display = "";

        }
        else
        {
            //hide, and show playoverlay?
            this.view.style.display = "none";
        }

    },

    getView: function(parent)
    {

        if (!this.view)
        {
            this.view = this.createView(parent);

        }

        return this.view;

    }

});



var RELATED_TO_PID_PATTERN = "{releasePID}";


RelatedItemsMediator = Class.extend({


        init: function(id, controller){

    
            //should listen for onmediastart

			this.id = id;

            this.controller = controller;

            //we'll let our creator worry about creating the view

    

            var me = this;

            this.controller.addEventListener(PdkEvent.OnMediaStart,function(e){me.OnMediaStart(e);});

            this.controller.addEventListener("OnReleaseEnd",function(e){me.OnMediaEnd(e);});


            this.controller.addEventListener("relatedItemsNextPage",function(e){me.nextPage();});
            this.controller.addEventListener("relatedItemsPreviousPage",function(e){me.previousPage();});

            //parse params into an array
            var params=this.controller.getProperty("relatedItemsParams");
            if (params)
            this.params=params.split(",");

            this.startIndex=1;

            this.endIndex=MAX_RELATED_ITEMS;




                


        },

        getTitle: function(){
            return this.currentTitle;
        },

        //here we figure out the clip so we can load related items later
        OnMediaStart:function(e){
            var clip=e.data;
            


            if (clip.baseClip.isAd==false)
            {
                this.currentTitle = (clip.baseClip.title ? clip.baseClip.title : clip.chapter && clip.chapter.title ? clip.chapter.title : "");
                this.releasePID = clip.releasePID;
            }

        },

        OnMediaEnd:function(e){

            //should make card visible

            var release=e.data;


            this.releasePID = release.releasePID;


            this.loadItemData();

        },

        setItem: function(item){
            this.card=item;

            if (!this.card.view)
                this.card.getView(item.parent);

            this.card.write();

            if(this.releaseFeed)
            {
                this.card.releaseFeed=this.releaseFeed;
                
            }
            
        },

        loadItemData:function(){

            //use a JSONLoader to get data from feed
            this.relatedItemsURL=this.controller.getProperty("relatedItemsURL");

            if (!this.relatedItemsURL)
                return;

            //need to append stuff to the url (should move the implementation from release model into some helper class and use that to contruct url)
		    var delimeter = "?";

            this.constructedFeedUrl="";

            this.constructedFeedUrl=this.relatedItemsURL;
            
		    for (var key in this.params) {
			    this.constructedFeedUrl += delimeter + this.params[key];
			    delimeter = "&";
		    }

            this.constructedFeedUrl+=delimeter+"startIndex="+this.startIndex+"&endIndex="+this.endIndex;
            //this.constructedFeedUrl+=delimeter+"range="+this.startIndex+"-"+this.endIndex;
            delimeter = "&";
            tpDebug(this.controller.getProperty("relatedItemsShowAllItems"));
            if (!this.controller.getProperty("relatedItemsShowAllItems")||this.controller.getProperty("relatedItemsShowAllItems")=="false")
            {
                this.constructedFeedUrl+=delimeter+"byRelatedReleasePid="+this.releasePID;
                delimeter = "&";
            }
            //need to ensure content is json
            this.constructedFeedUrl+=delimeter+"form=json&count=true";




            var loader = new JSONLoader();
            var me = this;

            try{
                tpDebug("loading feed:" + this.constructedFeedUrl);
                loader.load(this.constructedFeedUrl,function(){me.completeHandler.apply(me,arguments);});
            }
            catch(error){
                tpDebug("RelatedItemsMediator.loadItemData error "+error.message);
            }

        },

        showCard:function(show){

            if (!show)
            {
                this.startIndex=1;
                this.endIndex=MAX_RELATED_ITEMS;
            }

           // this._super(show);

		

        },

        completeHandler:function(json){

            var rfp = new ReleaseFeedParser();

            this.releaseFeed=rfp.processFeed(json);

            tpDebug("got related items data");




            

            //TODO: should dispatch an event to indicate that we have refreshed (to trigger control to show latest data)

            if (this.card)
            {
                //need to ensure we're visible...
                
                this.card.releaseFeed=this.releaseFeed;

				if (this.releaseFeed.entries.length>0)
				{
                	this.card.createItems(this.card.releaseFeed);
            	}
				else
				{
					this.controller.showCard("forms",this.id, "Disable");
				}
                
            }
            else
            {
                tpDebug("no card yet");
            }


        },

        createControl: function(){



        },

        nextPage: function(){

            if (this.releaseFeed.length<MAX_RELATED_ITEMS)
            {
                return; //no next page
            }

            this.startIndex=this.endIndex+1;
            this.endIndex=this.endIndex+MAX_RELATED_ITEMS;
//
//            this.card.startIndex=this.card.endIndex+1;
//            this.card.endIndex=this.card.endIndex+MAX_RELATED_ITEMS;


            this.loadItemData();


        },

        previousPage: function(){

            if (this.startIndex<=MAX_RELATED_ITEMS)
                return;


            this.endIndex=this.startIndex-1;
            this.startIndex=this.startIndex-MAX_RELATED_ITEMS;

//            this.card.endIndex=this.card.startIndex-1;
//            this.card.startIndex=this.card.startIndex-MAX_RELATED_ITEMS;

           this.loadItemData();

        }

});

RelatedItemsCard = SampleCard.extend({

    init:function(id, parent, controller)
    {

        this._super(id, parent, controller);

        this.parentNode = parent;

        //we need to create a related items mediator, and related items child control


        this.relatedItems = new RelatedItems(this.id + ".relatedItems", null, null, this.view, controller);

        this.relatedItemsMediator = new RelatedItemsMediator(this.id, controller);

        this.relatedItemsMediator.setItem(this.relatedItems);

        this.spacer = document.createElement("div");

        this.spacer.style.height = "60%";
        this.spacer.style.position = "relative";

//        this.spacer2 = document.createElement("div");
//
//        this.spacer2.style.height="10%";

        var view = this.getView();

        this.container = document.createElement("div");

        this.container.style.position = "relative";

        this.container.style.display = "";

        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.zIndex = "1500";

        this.headerLabel = document.createElement("h3");

        this.headerLabel.style.marginLeft = "15px";

        this.headerLabel.style.color = "white";

        var spacer = document.createElement("div");
        spacer.style.height = "10px";

        this.spacer.appendChild(spacer);
        this.spacer.appendChild(this.headerLabel);


        view.appendChild(this.container);

        this.container.appendChild(this.spacer);

        this.container.appendChild(this.relatedItems.getView());

//        this.container.appendChild(this.spacer2);

        this.view.style.display = "none";

        //  this.view.style.zIndex="2000";

        this.blocker = document.createElement("div");

        this.blocker.style.height = "100%";
        this.blocker.style.width = "100%";

        this.blocker.id = this.id + ".blocker";
        this.blocker.className = "relatedItemsBlocker";


        this.blocker.style.display = "";

        this.blocker.style.background = "black";
        this.blocker.style.position = "absolute";
        this.blocker.style.top = "0px";
        this.blocker.style.left = "0px";

        this.blocker.style.opacity = "0.50";
        this.blocker.style.filter = "alpha(opacity=50)";

        this.blocker.style.zIndex = "1000";

        tpDebug("this.blocker.style.zIndex =" + this.blocker.style.zIndex);
        tpDebug("this.view.style.zIndex =" + this.view.style.zIndex);


        view.appendChild(this.blocker);


        //should listen to related items mediator for call to hide self


    },
    


    showCard: function(show)
    {

        if (show)
        {

            this.headerLabel.innerHTML = "You just watched '" + this.relatedItemsMediator.getTitle() + "'";
            this.view.style.display = "";
            this.container.style.display = "";
//           this.relatedItems.view.blocker.style.display=""
//           this.relatedItems.view.container.style.display=""
            this.blocker.style.display = "";

        }
        else
        {
            this.headerLabel.innerHTML = "";
            this.relatedItemsMediator.startIndex = 1;
            this.relatedItemsMediator.endIndex = MAX_RELATED_ITEMS;
            this.view.style.display = "none";
            this.container.style.display = "none";
//            this.relatedItems.blocker.style.display="none"
//            this.relatedItems.container.style.display="none"
            this.blocker.style.display = "none";

        }


        this._super(show);
    }



});


RelatedItemsPlugin = Class.extend({

    init: function()
    {

    },

    initialize: function(loadObj)
    {
        this.controller = loadObj.controller;


        var parentNode = document.getElementById(this.controller.id + ".standby");
        //parentNode.style.position="relative"; //why??

        var endCardId = this.controller.getProperty("endCard");
        if (endCardId === undefined)
        {
            endCardId = this.controller.getProperty("endcard");
        }

        var tpRelatedItemsCardMediator = new oldCardMediator("tpRelatedItemsCardMediator", this.controller);

        var tpRelatedItemsCard = new RelatedItemsCard(endCardId, parentNode, this.controller);

        tpRelatedItemsCardMediator.setItem(tpRelatedItemsCard);

        //still need to stick it into a div

        //parentNode.appendChild(tpRelatedItemsCard.getView());

        hasRun = true;

    }

});

var hasRun = false;


var riPlugin = new RelatedItemsPlugin();
tpController.plugInLoaded(riPlugin);
