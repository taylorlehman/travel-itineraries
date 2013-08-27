(function () {
    "use strict";

    //VARIABLES
    var appBarElement = null;
    var appBar = null;

    var isSavingItem = false;
    var itemBeingSaved = null;

    var isRemovingItem = false;
    var itemBeingRemoved = null;

    //PUBLIC
    function configureAppBar() {
        appBarElement = document.getElementById("theAppBar");
        appBar = appBarElement.winControl;

        //Listen to the edge gesture for the top bar
        var edgeGesture = Windows.UI.Input.EdgeGesture.getForCurrentView();
        edgeGesture.addEventListener("completed", onEdgeGestureCompleted);

        //Listen for the app bar being hidden/shown to hide/show the top bar and curtain
        appBar.onbeforehide = handleonbeforehide;
        appBar.onaftershow = handleaftershow;

        //Make the app bar sticky (light dismiss is via the curtain
        appBar.sticky = true;

        //Attach a click handler to the curtain to simulate light dismiss
        document.getElementById("appBarCurtain").addEventListener("click", handleCurtainClick);

        //Populate the top bar
        populateTopBar();

        //For now, the app bar starts disabled
        appBar.disabled = true;

        //Configure the click handlers for the bottom bar button
        document.getElementById("cmdBackToResults").addEventListener("click", cmdBackToResults_click);
        document.getElementById("cmdSearch").addEventListener("click", cmdSearch_click);
        document.getElementById("cmdMap").addEventListener("click", cmdMap_click);
        document.getElementById("cmdItinerary").addEventListener("click", cmdItinerary_click);
        document.getElementById("cmdSave").addEventListener("click", cmdSave_click);
        document.getElementById("cmdRemove").addEventListener("click", cmdRemove_click);
    };

    //PRIVATE
    function hideCurtain() {
        document.getElementById("appBarCurtain").style.display = "none";
    };

    //PRIVATE
    function showCurtain() {
        document.getElementById("appBarCurtain").style.display = "block";
    };

    //PRIVATE
    function handleaftershow() {
        //Check to see if we are in the process of saving an item
        if (isSavingItem == true) {
            addTempItineraryToTopBarImplementation(itemBeingSaved);

            //Reset isSavingItem
            isSavingItem = false;

            //Reset itemBeingSaved
            itemBeingSaved = null;
        } else if (isRemovingItem == true){
            removeItineraryFromTopBarImplementation(itemBeingRemoved);

            //Reset isSavingItem
            isRemovingItem = false;

            //Reset itemBeingSaved
            itemBeingRemoved = null;
        } else {
            //TODO: We need to handle this case, but I'm not exactly sure how...
        }
    };

    //PRIVATE
    function handleonbeforehide() {
        //Hide the curtain
        hideCurtain();

        //Hide the top bar
        WinJS.UI.Animation.hideEdgeUI(document.getElementById("theAppBarTop"), { top: "-100px", left: "0px" }).then(
            function () {
                document.getElementById("theAppBarTop").style.display = "none";
                document.getElementById("theAppBarTop").style.opacity = "0";
            }
        );
    };

    //PRIVATE
    function handleCurtainClick(e) {
        appBar.hide();
    };

    //PRIVATE
    function topBarDivClick(e) {
        //Parse the ID
        var id = e.target.id.split("_")[2];

        //Load the item from userData
        var itineraryObject = userData.loadObjectsByIds([id])[0];

        //Leverage Controller to clear the current view
        Controller.getCurrentState().clearUI();

        //Load the one up state (via AppGlobals)
        AppGlobals.oneUpStateObject.reset();

        //TODO: Change this to draw UI at some point
        AppGlobals.oneUpStateObject.handleLoad_nonWorker(itineraryObject);
    };

    //PUBLIC
    function generateTopBarDiv(id, title){
        var tempItineraryDiv = document.createElement("div");
        tempItineraryDiv.classList.add("theAppBarTop_div");
        tempItineraryDiv.id = "appBarTop_div_" + id.toString();
        tempItineraryDiv.addEventListener("click", topBarDivClick);

        var tempItineraryP = document.createElement("p");
        tempItineraryP.id = "appBarTop_p_" + id.toString();
        tempItineraryP.innerText = title;

        tempItineraryDiv.appendChild(tempItineraryP);

        return tempItineraryDiv;
    };

    //PUBLIC
    function populateTopBar() {
        //Clear the app bar
        document.getElementById("theAppBarTop").innerHTML = "";

        //Check to see if the user data is ready
        if (userData.getInitializeResultValue() == 1) {
            
            var tempItineraryList = userData.getItineraryList();
            
            if (tempItineraryList.length == 0) {
                document.getElementById("theAppBarTop").innerText = "You haven't saved an itineraries yet, but when you do, they'll appear here";
            } else {
                for (var i = tempItineraryList.length - 1; i > -1; i--) {
                    var tempItineraryDiv = generateTopBarDiv(tempItineraryList[i].id, tempItineraryList[i].title);

                    document.getElementById("theAppBarTop").appendChild(tempItineraryDiv);
                }
            }     
        } else {
            document.getElementById("theAppBarTop").innerText = "Loading your saved itineraries";
        }
    };

    //PRIVATE
    function showTopBar() {
        //Show it
        document.getElementById("theAppBarTop").style.display = "-ms-flexbox";
        document.getElementById("theAppBarTop").style.opacity = "1";

        //Note: You can use .done to do something after the animation is complete (for example, to handle the new item animation)
        WinJS.UI.Animation.showEdgeUI(document.getElementById("theAppBarTop"), { top: "-100px", left: "0px" });
    };

    //PRIVATE
    function onEdgeGestureCompleted() {
        //If the app bar is currently hidden
        if (appBar.hidden == false) {

            //Show the curtain
            showCurtain();

            //Show the top bar
            showTopBar();
            
        } else {
            //DO NOTHING HERE.  This is handled by handleonbeforehide
        }
    };

    //PUBLIC
    //Note: Source of 0 = highlights, 1 = results
    function showOneUpCommands(view, source) {
        var appBarButtons = null;

        var saveOrRemoveString = getSaveOrRemoveString(AppGlobals.oneUpStateObject.item.id);

        //Determine if we are in Map or itinerary view and show the correct items
        switch (view) {
            case "Map":
                appBarButtons = ["cmdSearch", "cmdItinerary", saveOrRemoveString];
                break;
            case "Itinerary":
                appBarButtons = ["cmdSearch", "cmdMap", saveOrRemoveString];
                break;
        }

        //Determine if we need the back to results button or not
        if (source == 1) {
            appBarButtons = ["cmdBackToResults"].concat(appBarButtons);
        }

        appBar.showOnlyCommands(appBarButtons, true);
    };

    //PRIVATE
    function getSaveOrRemoveString(itineraryId) {
        if (userData.itineraryNotSaved(itineraryId)) {
            return "cmdSave";
        } else {
            return "cmdRemove";
        }
    };

    //PUBLIC
    function showResultsCommands(resultsCount) {
        if (resultsCount == 0) {
            appBar.showOnlyCommands(["cmdSearch"], true);
        } else {
            var saveRemoveString = getSaveOrRemoveString(Controller.getCurrentState().getActiveItineraryIdString());
            appBar.showOnlyCommands(["cmdSearch", saveRemoveString], true);
        }
        
    };

    //PRIVATE
    function addTempItineraryToTopBarImplementation(tempItinerary) {
        var topBar = document.getElementById("theAppBarTop");

        //Check to see if there are any elements currently in the topBar
        if (topBar.children.length == 0) {
            topBar.innerHTML = ""; //Clear the text
        }

        //Add the new item at the top
        var newDiv = generateTopBarDiv(tempItinerary.id, tempItinerary.title);
        newDiv.style.display = "-ms-flexbox";
        newDiv.style.width = "0px";
        newDiv.style.opacity = "0";
        topBar.insertBefore(newDiv, topBar.firstChild);

        //Move the other items (start at 1 since we already appended
        //the item to the top bar)
        var elementsToMove = new Array();
        for (var i = 1 ; i < topBar.childNodes.length; i++) {
            elementsToMove.push(topBar.childNodes[i]);
        }

        WinJS.UI.executeAnimation(
            elementsToMove,
            [
                {
                    property: "transform",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: "translate(0px,0px)",
                    to: "translate(170px, 0px)"
                }
            ]
        );

        //Play new item animation
        WinJS.UI.executeTransition(
            topBar.childNodes[0],
            [
                {
                    property: "opacity",
                    delay: 250,
                    duration: 150,
                    timing: "linear",
                    from: 0,
                    to: 1
                },
                {
                    property: "width",
                    delay: 250,
                    duration: 0,
                    timing: "linear",
                    from: "0px",
                    to: "160px"
                }
            ]
        ).done(
            function () {
                appBar.hide();
            }
        );
    };

    //PUBLIC
    function addTempItineraryToTopBar(tempItinerary) {
        //If the app bar isn't up, show it
        if (appBar.hidden == true) {
            isSavingItem = true;
            itemBeingSaved = tempItinerary;

            appBar.show();
            showTopBar();
            showCurtain();

            //Doing something after the app bar is shown ishandled by the 
            //onaftershow handler.  That is where we call
            //addTempItineraryToTopBarImplementation in this case
        } else {
            addTempItineraryToTopBarImplementation(tempItinerary);
        }
    };

    //PRIVATE
    function removeItineraryFromTopBarImplementation(itineraryId) {
        //Find the item to remove
        var topBarChildElements = document.getElementById("theAppBarTop").childNodes;
        var elementToRemove = null;
        var elementsToMove = new Array();
        var haveFoundElementToRemove = false;
        for (var i = 0; i < topBarChildElements.length; i++) {
            if (topBarChildElements[i].id.split("_")[2] == itineraryId) {
                elementToRemove = topBarChildElements[i];
                haveFoundElementToRemove = true;
            } else if (haveFoundElementToRemove == true) {
                elementsToMove.push(topBarChildElements[i]);
            }
        }

        //Check to make sure we found an element
        if (elementToRemove != null) {
            //Remove it
            WinJS.UI.executeTransition(
                elementToRemove,
                [
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 100,
                        timing: "linear",
                        from: 1,
                        to: 0
                    }
                ]
            );
        }

        //Animate the remaining items
        WinJS.UI.executeAnimation(
            elementsToMove,
            [
                {
                    property: "transform",
                    delay: 100,
                    duration: 150,
                    timing: "linear",
                    from: "translate(0px,0px)",
                    to: "translate(-160px, 0px)"
                }
            ]
        ).done(
            function () {
                elementToRemove.style.display = "none";
                document.getElementById("theAppBarTop").removeChild(elementToRemove);

                if (document.getElementById("theAppBarTop").children.length == 0) {
                    document.getElementById("theAppBarTop").innerText = "You haven't saved any itineraries, but when you do, they'll show up here.";
                }

                appBar.hide();
            }
        );
    };

    //PUBLIC
    function removeItineraryFromTopBar(itineraryId) {
        //If the app bar isn't up, show it
        if (appBar.hidden == true) {
            isRemovingItem = true;
            itemBeingRemoved = itineraryId;

            appBar.show();
            showTopBar();
            showCurtain();

            //Doing something after the app bar is shown ishandled by the 
            //onaftershow handler.  That is where we call
            //addTempItineraryToTopBarImplementation in this case
        } else {
            removeItineraryFromTopBarImplementation(itineraryId);
        }
    };

    /**********************************************/
    /*************** APPBAR EVENTS ****************/
    /**********************************************/
    //PRIVATE
    function cmdBackToResults_click() {
        //Clear the current UI
        Controller.getCurrentState().clearUI();

        //Set the new state
        Controller.setCurrentState(Controller.getPreviousState());

        //Draw the new UI
        Controller.getCurrentState().drawUI();
    };

    //PRIVATE
    function cmdSearch_click() {
        //Clear the current UI
        Controller.getCurrentState().clearUI();

        //Set the new state
        Controller.setCurrentState(AppGlobals.searchStateObject);

        //Reset the state
        Controller.getCurrentState().reset();

        //Draw the new UI
        Controller.getCurrentState().drawUI(0);
    };

    //PRIVATE
    function cmdItinerary_click() {
        //Do the generic transition configurations
        AppGlobals.oneUpStateObject.viewTransition("Itinerary", 0);

        //Show the itinerary
        AppGlobals.oneUpStateObject.showItinerary();
    };

    //PRIVATE
    function cmdMap_click() {
        //If the selectedEventId is null, set it to be the first item
        if (AppGlobals.oneUpStateObject.selectedEventId == null) {
            AppGlobals.oneUpStateObject.setSelectedEventId(
                AppGlobals.oneUpStateObject.item.eventsList[0].id);
        }

        //Do the generic transition configurations
        AppGlobals.oneUpStateObject.viewTransition("Map", 2);

        //Show the map
        document.getElementById("ONEUPGRID_map").style.display = "-ms-flexbox";

        //Show the map
        AppGlobals.oneUpStateObject.showMap();
    };

    //PRIVATE
    function cmdSave_click() {
        //Add the itinerary to the list
        userData.addItinerary(Controller.getCurrentState().getActiveItinerary());

        Controller.getCurrentState().configureAppBar();
    };

    //PRIVATE
    function cmdRemove_click() {
        //Remove the itinerary from the list
        userData.removeItinerary(Controller.getCurrentState().getActiveItineraryIdString());

        Controller.getCurrentState().configureAppBar();
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define(
        "appBarManager",
        {
            removeItineraryFromTopBar: removeItineraryFromTopBar,
            addTempItineraryToTopBar: addTempItineraryToTopBar,
            configureAppBar: configureAppBar,
            showOneUpCommands: showOneUpCommands,
            showResultsCommands: showResultsCommands,
            populateTopBar: populateTopBar
        }
    );
})();