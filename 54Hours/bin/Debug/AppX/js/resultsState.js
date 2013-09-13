(function () {
    "use strict";

    function resultsState(oneUpStateObject) {
        //CONTROLLER CALLBACKS
        this.drawUI = drawUI;
        this.clearUI = clearUI;
        this.getActiveItineraryIdString = getActiveItineraryIdString;
        this.getActiveItinerary = getActiveItinerary;
        this.configureAppBar = configureAppBar;
        this.shouldEnableAppBar = shouldEnableAppBar;
        this.returnElementsToOriginalPosition = returnElementsToOriginalPosition;

        //Data Listeners
        this.dataListenerIdArray = new Array();
        this.handleUserDataCallback = handleUserDataCallback;

        //MEMBER VARIABLES
        this.currentResult = 0;
        this.resultsCount = 0;
        this.resultsList = null;

        //MEMBER FUNCTIONS
        this.configureUI = configureUI;
        this.positionGrid = positionGrid;
        this.reset = reset;

        //WORKER
        this.worker = new Worker("/js/worker.js");
        oneUpStateObject.AttachOnMessage(this.worker, "handleLoad");

        //Providing the correct scope for event handlers
        //WHY THIS IS NECESSARY:
        //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
        //http://ejohn.org/apps/learn/
        //http://www.digital-web.com/articles/scope_in_javascript/
        this.AttachOnClick = AttachOnClick;
        this.AttachOnMessage = AttachOnMessage;

        //EVENT HANDLERS
        this.drawPopulatedResultsUI = drawPopulatedResultsUI;
        this.drawEmptyResultsUI = drawEmptyResultsUI;
        this.handleSearch = handleSearch;
        this.buildLeftResultPane = buildLeftResultPane;
        this.buildRightResultGrid = buildRightResultGrid;
        this.buildRightResultPane = buildRightResultPane;
        this.RESULTSGRID_next_click = RESULTSGRID_next_click;
        this.RESULTSGRID_previous_click = RESULTSGRID_previous_click;
        this.RESULTSGRID_details_button_click = RESULTSGRID_details_button_click;
        this.RESULTSGRID_save_button_click = RESULTSGRID_save_button_click;
        this.empty_result_highlight_click = empty_result_highlight_click;
        this.getSaveRemoveButtonText = getSaveRemoveButtonText;
    };

    //ATTACH ON CLICK
    //WHY THIS IS NECESSARY:
    //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
    //http://ejohn.org/apps/learn/
    //http://www.digital-web.com/articles/scope_in_javascript/
    function AttachOnClick(element, eventName) {
        var self = this;

        switch (eventName) {
            case "RESULTSGRID_details_button_click":
                element.onclick = function () { self.RESULTSGRID_details_button_click(this); };
                break;
            case "RESULTSGRID_next_click":
                element.onclick = function () { self.RESULTSGRID_next_click(this); };
                break;
            case "RESULTSGRID_previous_click":
                element.onclick = function () { self.RESULTSGRID_previous_click(this); };
                break;
            case "RESULTSGRID_save_button_click":
                element.onclick = function () { self.RESULTSGRID_save_button_click(this); };
                break;
            case "empty_result_highlight_click":
                element.onclick = function () { self.empty_result_highlight_click(this); };
                break;
        };

        element = null;
    };

    //ATTACH ON MESSAGE
    //WHY THIS IS NECESSARY:
    //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
    //http://ejohn.org/apps/learn/
    //http://www.digital-web.com/articles/scope_in_javascript/
    //OK, here is what this is doing:
    // - tempWorker = the worker from the searchStateObject (or whatever worker we wait on)
    // This method wraps the handler for the worker from the search state object
    // such that when it's called, it's called in the context of the resultsStateObject
    // and not the worker
    function AttachOnMessage(tempWorker, eventName) {
        var self = this;

        switch (eventName) {
            case "handleSearch":
                tempWorker.onmessage = function (event) { self.handleSearch(event, this); };
                break;
        };

        tempWorker = null;
    };

    function shouldEnableAppBar() {
        return true;
    };

    function handleUserDataCallback(itineraryId, property){
        switch(property){
            case "saveState":
                //Animated out the previous text
                WinJS.UI.executeTransition(
                    document.getElementById("RESULTSGRID_savep_" + itineraryId.toString()),
                    [
                        {
                            property: "opacity",
                            delay: 0,
                            duration: 250,
                            timing: "linear",
                            from: "1",
                            to: "0"
                        }
                    ]
                ).done(
                    function (){
                        var buttonElement = document.getElementById("RESULTSGRID_savep_" + itineraryId.toString());
                        buttonElement.innerText = AppGlobals.resultsStateObject.getSaveRemoveButtonText(itineraryId);

                        WinJS.UI.executeTransition(
                            document.getElementById("RESULTSGRID_savep_" + itineraryId.toString()),
                            [
                                {
                                    property: "opacity",
                                    delay: 0,
                                    duration: 250,
                                    timing: "linear",
                                    from: "0",
                                    to: "1"
                                }
                            ]
                        );

                    }
                );
                break;
        }
    };

    function configureUI() {
        /**********************************************/
        /************* POSITION ELEMENTS **************/
        /**********************************************/
        this.returnElementsToOriginalPosition();

        /**********************************************/
        /************ SET EVENT HANDLERS **************/
        /**********************************************/
        this.AttachOnClick(document.getElementById("RESULTSGRID_next"), "RESULTSGRID_next_click");
        this.AttachOnClick(document.getElementById("RESULTSGRID_previous"), "RESULTSGRID_previous_click");
    };

    function returnElementsToOriginalPosition() {
        document.getElementById("RESULTSGRID").style.left = (window.innerWidth).toString() + "px";
        document.getElementById("RESULTSGRID_next").style.left = (window.innerWidth).toString() + "px";
        document.getElementById("RESULTSGRID_next").style.top = (window.innerHeight / 2 - 50).toString() + "px";
        document.getElementById("RESULTSGRID_next").classList.add("icon-chevron-right");
        document.getElementById("RESULTSGRID_next").classList.add("icon-2x");

        document.getElementById("RESULTSGRID_previous").style.left = "-50px";
        document.getElementById("RESULTSGRID_previous").style.top = (window.innerHeight / 2 - 50).toString() + "px";
        document.getElementById("RESULTSGRID_previous").classList.add("icon-chevron-left");
        document.getElementById("RESULTSGRID_previous").classList.add("icon-2x");
    };

    //Resets the object state
    function reset() {
        //Reset the member variables
        this.currentResult = 0;
        this.resultsCount = 0;
        this.resultsList = null;
    };

    function handleSearch(event, tempWorker) {
        //reset
        this.reset();

        //Clear the old UI
        this.clearUI();

        //Set the current state
        Controller.setCurrentState(this);

        //Set the resultsObject count
        if (event.data.hr == true) {
            this.resultsCount = event.data.response.length;
        } else {
            this.resultsCount = 0;
        }

        //Set the results list array
        this.resultsList = event.data.response;

        //Hide the searching div
        document.getElementById("SEARCHINGGRID").style.opacity = "0";

        this.drawUI();
    };

    function buildLeftResultPane(response) {
        //Create the Left-Hand Div
        var tempLeftDiv = document.createElement("div");
        tempLeftDiv.classList.add("RESULTSGRID_item_leftDiv");
        tempLeftDiv.style.backgroundImage = "url('" + response.resultsImage + "')";

        //Create the "72 Hours" title
        var tempH1 = document.createElement("h1");
        tempH1.classList.add("RESULTSGRID_item_lefttitle");
        tempH1.innerText = "Seventy Two Hours";
        tempLeftDiv.appendChild(tempH1);

        //Create the location sub-title ("In <Location>")
        var tempH2 = document.createElement("h2");
        tempH2.classList.add("RESULTSGRID_item_leftsubtitle");
        tempH2.innerText = "In " + response.location;
        tempLeftDiv.appendChild(tempH2);

        return tempLeftDiv;
    };

    function buildRightResultGrid(response, i) {
        //Create the grid for the HOWMUCH and WHO data
        var tempRightDivInfoGrid = document.createElement("div");
        tempRightDivInfoGrid.classList.add("RESULTSGRID_item_infogrid");

        //Create and append the HOWMUCH data
        var tempRightDivInfoGridCost = document.createElement("div");
        tempRightDivInfoGridCost.classList.add("RESULTSGRID_item_infogrid_howmuch");

        var tempRightDivInfoGridCostH1 = document.createElement("h1");
        tempRightDivInfoGridCostH1.classList.add("RESULTSGRID_item_infogrid_h1");
        tempRightDivInfoGridCostH1.innerText = "How Much";
        tempRightDivInfoGridCost.appendChild(tempRightDivInfoGridCostH1);

        var tempRightDivInfoGridCostH2 = document.createElement("h2");
        tempRightDivInfoGridCostH2.classList.add("RESULTSGRID_item_infogrid_h2");
        tempRightDivInfoGridCostH2.innerText = response.howmuch;
        tempRightDivInfoGridCost.appendChild(tempRightDivInfoGridCostH2);

        tempRightDivInfoGrid.appendChild(tempRightDivInfoGridCost);

        //Create and Append the WHO data
        var tempRightDivInfoGridWho = document.createElement("div");
        tempRightDivInfoGridWho.classList.add("RESULTSGRID_item_infogrid_who");

        var tempRightDivInfoGridWhoH1 = document.createElement("h1");
        tempRightDivInfoGridWhoH1.classList.add("RESULTSGRID_item_infogrid_h1");
        tempRightDivInfoGridWhoH1.innerText = "What";
        tempRightDivInfoGridWho.appendChild(tempRightDivInfoGridWhoH1);

        var tempRightDivInfoGridWhoH2 = document.createElement("div");
        tempRightDivInfoGridWhoH2.classList.add("RESULTSGRID_item_infogrid_div");
        Utilities.buildWhoHorizontalLayout(tempRightDivInfoGridWhoH2, response.who, "70");
        tempRightDivInfoGridWho.appendChild(tempRightDivInfoGridWhoH2);

        tempRightDivInfoGrid.appendChild(tempRightDivInfoGridWho);

        return tempRightDivInfoGrid;
    }

    function getSaveRemoveButtonText(id){
        if(userData.itineraryNotSaved(id)){
            return "Save";
        } else {
            return "Forget";
        }
    };

    function buildRightResultPane(response, i) {
        //Create the Right-Hand Div
        var tempRightDiv = document.createElement("div");
        tempRightDiv.classList.add("RESULTSGRID_item_rightDiv");

        //Create the "itinerary i of N text
        var tempRightDivItineraryCounter = document.createElement("h3");
        tempRightDivItineraryCounter.classList.add("RESULTSGRID_item_rightCounterH3");
        tempRightDivItineraryCounter.innerText = "Itinerary " + (i + 1).toString() + " of " + this.resultsCount.toString();
        tempRightDiv.appendChild(tempRightDivItineraryCounter);

        //Create the right-hand div title
        var tempRightDivTitle = document.createElement("h1");
        tempRightDivTitle.classList.add("RESULTSGRID_item_righttitle");
        tempRightDivTitle.innerText = response.title;
        tempRightDiv.appendChild(tempRightDivTitle);

        //Create the right-hand div paragraph
        var tempRightDivParagraph = document.createElement("p");
        tempRightDivParagraph.classList.add("RESULTSGRID_item_rightp");
        tempRightDivParagraph.innerText = response.summary;
        tempRightDiv.appendChild(tempRightDivParagraph);

        //Create the grid that shows how much it costs and what activity types it includes
        tempRightDiv.appendChild(this.buildRightResultGrid(response, i));

        //Create the sample activities section
        var tempRightDivSampleH1 = document.createElement("h1");
        tempRightDivSampleH1.classList.add("RESULTSGRID_item_sample_h1");
        tempRightDivSampleH1.innerText = "Highlights";
        tempRightDiv.appendChild(tempRightDivSampleH1);

        var tempRightDivSampleList = document.createElement("ul");
        tempRightDivSampleList.classList.add("RESULTSGRID_item_sample_ul");
        for (var j = 0; j < response.highlights.length; j++) {
            var tempRightDivSampleLi = document.createElement("li");
            tempRightDivSampleLi.classList.add("RESULTSGRID_item_sample_li");
            tempRightDivSampleLi.innerText = response.highlights[j];
            tempRightDivSampleList.appendChild(tempRightDivSampleLi);
        }

        tempRightDiv.appendChild(tempRightDivSampleList);

        //Create the Action Buttons at the bottom
        var tempRightDivActionGrid = document.createElement("div");
        tempRightDivActionGrid.classList.add("RESULTSGRID_item_action_grid");

        var tempRightDivSave = document.createElement("div");
        tempRightDivSave.classList.add("RESULTSGRID_item_button");
        tempRightDivSave.classList.add("RESULTSGRID_item_save_div");
        tempRightDivSave.id = "RESULTSGRID_savediv_" + response.id.toString();
        this.AttachOnClick(tempRightDivSave, "RESULTSGRID_save_button_click");

        var tempRightDivSaveP = document.createElement("p");
        tempRightDivSaveP.classList.add("RESULTSGRID_item_save_p");
        tempRightDivSaveP.id = "RESULTSGRID_savep_" + response.id.toString();
        tempRightDivSaveP.innerText = this.getSaveRemoveButtonText(response.id);
        
        tempRightDivSave.appendChild(tempRightDivSaveP);
        tempRightDivActionGrid.appendChild(tempRightDivSave);

        var tempRightDivDetails = document.createElement("div");
        tempRightDivDetails.classList.add("RESULTSGRID_item_button");
        tempRightDivDetails.classList.add("RESULTSGRID_item_details_div");
        tempRightDivDetails.innerText = "View Details";
        tempRightDivDetails.id = "RESULTSGRID_detailsdiv_" + response.id.toString();
        this.AttachOnClick(tempRightDivDetails, "RESULTSGRID_details_button_click");
        tempRightDivActionGrid.appendChild(tempRightDivDetails);

        tempRightDiv.appendChild(tempRightDivActionGrid);

        return tempRightDiv;
    };

    function RESULTSGRID_next_click(e) {
        var currentElement = e.target;

        //TODO: Animate the next button - tap on and off animation

        //Move the results div left
        this.currentResult++;
        document.getElementById("RESULTSGRID").style.left = (-1 * window.innerWidth * this.currentResult).toString() + "px";

        //Fade in the next div
        document.getElementById("RESULTSGRID_item_" + (this.currentResult).toString()).style.opacity = "1";

        //Fade out the previous div
        document.getElementById("RESULTSGRID_item_" + (this.currentResult - 1).toString()).style.opacity = "0";

        //If we've reached the end of the results list, hide the next button
        if (this.currentResult == this.resultsCount - 1) {
            document.getElementById("RESULTSGRID_next").style.left = window.innerWidth.toString() + "px";
        }

        //If we now need to show the previous button, show it!
        if (this.currentResult == 1) {
            document.getElementById("RESULTSGRID_previous").style.left = "0px";
        }

        //Redraw the app bar
        this.configureAppBar();
    };

    function RESULTSGRID_previous_click(e) {
        //TODO: Animate the previous button - tap on and off animation

        //Move the results div right
        this.currentResult--;
        document.getElementById("RESULTSGRID").style.left = (-1 * window.innerWidth * this.currentResult).toString() + "px";

        //Fade in the next div
        document.getElementById("RESULTSGRID_item_" + (this.currentResult).toString()).style.opacity = "1";

        //Fade out the previous div
        document.getElementById("RESULTSGRID_item_" + (this.currentResult + 1).toString()).style.opacity = "0";

        //If we've reached the beginning of the results list, hide the previous button
        if (this.currentResult == 0) {
            document.getElementById("RESULTSGRID_previous").style.left = "-50px";
        }

        //If we now need to show the next button, show it!
        if (this.currentResult < this.resultsCount - 1) {
            document.getElementById("RESULTSGRID_next").style.left = (window.innerWidth - 50).toString() + "px";
        }

        //Configure the app bar
        this.configureAppBar();
    };

    //Function to handle the click of the details button
    //from a results item 
    function RESULTSGRID_details_button_click(element) {
        //Hide the next and previous buttons
        document.getElementById("RESULTSGRID_previous").style.left = "-50px";
        document.getElementById("RESULTSGRID_next").style.left = window.innerWidth.toString() + "px";

        //Load the one-up state
        this.worker.postMessage({ action: "load", source: 1, id: element.id.split("_")[2].toString() });

    };

    //Function to handle the save button click from a results item
    function RESULTSGRID_save_button_click(element) {
        //Check to see if it's a save, or a forget
        if (userData.itineraryNotSaved(this.resultsList[this.currentResult].id)) {
            userData.addItinerary(this.resultsList[this.currentResult]);
        } else {
            userData.removeItinerary(this.resultsList[this.currentResult].id);
        }
    };

    function positionGrid() {
        document.getElementById("RESULTSGRID").style.left = (-1 * window.innerWidth * this.currentResult).toString() + "px";
    };

    function drawPopulatedResultsUI() {
        //For each result, create a div and append it to the results div
        for (var i = 0; i < this.resultsCount; i++) {
            //Create a div for the result entry
            var tempDiv = document.createElement("div");
            tempDiv.id = "RESULTSGRID_item_" + i.toString();
            tempDiv.style.width = (window.innerWidth).toString() + "px";
            tempDiv.classList.add("RESULTSGRID_item");

            //Append the left div to the results item
            tempDiv.appendChild(this.buildLeftResultPane(this.resultsList[i]));

            //Append the right div to the results item
            tempDiv.appendChild(this.buildRightResultPane(this.resultsList[i], i));

            //Add the result div to the resultsGrid (really a flexbox)
            document.getElementById("RESULTSGRID").appendChild(tempDiv);

            //Register the listeners for each ID
            var listenerId = userData.registerListener(this.resultsList[i].id, this.handleUserDataCallback);
            this.dataListenerIdArray.push(
                {
                    itineraryId: this.resultsList[i].id,
                    listenerId: listenerId
                }
            );
        }

        //Set the width on the resultsgrid
        document.getElementById("RESULTSGRID").style.width = (this.resultsCount * window.innerWidth).toString() + "px";

        //Display the Results Grid
        document.getElementById("RESULTSGRID").style.opacity = "1";
        document.getElementById("RESULTSGRID").style.top = "0px";
        document.getElementById("RESULTSGRID").style.left = this.positionGrid();
        document.getElementById("RESULTSGRID").style.display = "-ms-flexbox";

        //Display the RESULTSGRID_next button
        if (this.currentResult != (this.resultsCount - 1)) {
            document.getElementById("RESULTSGRID_next").style.left = (window.innerWidth - 50).toString() + "px";
        }

        //Display the RESULTSGRID_previous button
        if (this.currentResult > 0) {
            document.getElementById("RESULTSGRID_previous").style.left = "0px";
        }
    };

    function empty_result_highlight_click(element) {
        //Load the one-up state
        //Note: Source is 0 (highlights) since the user is loading a highlight)
        this.worker.postMessage({ action: "load", source: 0, id: element.id.split("_")[4].toString() });
    };

    function drawEmptyResultsUI() {
        //Create an empty results div
        var emptydiv = document.createElement("div");
        emptydiv.id = "RESULTSGRID_empty_div";

        //Create the title
        var title = document.createElement("h1");
        title.classList.add("RESULTSGRID_empty_h1");
        title.innerText = "We didn't find any itineraries that seemed like a good fit for you";

        //Create the subtitle
        var subtitle = document.createElement("h2");
        subtitle.classList.add("RESULTSGRID_empty_h2");
        subtitle.innerText = "But here are some other itineraries that users similar to you enjoy:";

        //Create the div to hold the highlights
        var highlightsContainer = document.createElement("div");
        highlightsContainer.id = "RESULTSGRID_empty_highlights_container";

        //Add the highlights
        //Note: this.resultsList.length should always be 4
        for (var i = 0; i < this.resultsList.length; i++) {
            var tempHighlightDiv = document.createElement("div");
            tempHighlightDiv.classList.add("RESULTSGRID_empty_highlights_div");
            tempHighlightDiv.id = "RESULTSGRID_empty_highlights_div_" + this.resultsList[i].id.toString();
            this.AttachOnClick(tempHighlightDiv, "empty_result_highlight_click");
            tempHighlightDiv.addEventListener("click", "empty_result_highlight_click");
            tempHighlightDiv.style.backgroundImage = "url('" + this.resultsList[i].highlightBackgroundImageUrl + "')";
            
            var tempHighlightH1 = document.createElement("h1");
            tempHighlightH1.classList.add("RESULTSGRID_empty_highlights_h1");
            tempHighlightH1.id = "RESULTSGRID_empty_highlights_h1_" + this.resultsList[i].id.toString();
            tempHighlightH1.innerText = this.resultsList[i].title;

            var tempHighlightH2 = document.createElement("h2");
            tempHighlightH2.classList.add("RESULTSGRID_empty_highlights_h2");
            tempHighlightH2.id = "RESULTSGRID_empty_highlights_h2_" + this.resultsList[i].id.toString();
            tempHighlightH2.innerText = this.resultsList[i].location;

            tempHighlightDiv.appendChild(tempHighlightH1);
            tempHighlightDiv.appendChild(tempHighlightH2);
            highlightsContainer.appendChild(tempHighlightDiv);
        }

        emptydiv.appendChild(title);
        emptydiv.appendChild(subtitle);
        emptydiv.appendChild(highlightsContainer);
        document.getElementById("RESULTSGRID").appendChild(emptydiv);

        //Set the width on the resultsgrid
        document.getElementById("RESULTSGRID").style.width = window.innerWidth.toString() + "px";

        //Display the Results Grid
        document.getElementById("RESULTSGRID").style.opacity = "1";
        document.getElementById("RESULTSGRID").style.top = "0px";
        document.getElementById("RESULTSGRID").style.left = "0px";
        document.getElementById("RESULTSGRID").style.display = "-ms-flexbox";
    };

    /******************************************************
    *************** CONTROLLER CALLBACKS ******************
    ******************************************************/
    function drawUI() {
        
        if (this.resultsCount > 0) {
            this.drawPopulatedResultsUI();
        } else {
            this.drawEmptyResultsUI();
        }

        //Configure the app bar
        this.configureAppBar();
    };

    function configureAppBar() {
        //Enable the app bar
        document.getElementById("theAppBar").winControl.disabled = false;

        //Enable the commands we care about
        appBarManager.showResultsCommands(this.resultsCount);
    };

    function clearUI() {
        //Hide the results grid
        document.getElementById("RESULTSGRID").style.opacity = "0";

        //Empty the content from the results grid
        document.getElementById("RESULTSGRID").innerHTML = "";

        //Hide the next and previous buttons
        document.getElementById("RESULTSGRID_next").style.left = window.innerWidth.toString() + "px";
        document.getElementById("RESULTSGRID_previous").style.left = "-50px";

        //Hide and disable the app bar
        document.getElementById("theAppBar").winControl.hide();
        document.getElementById("theAppBar").winControl.disabled = true;

        //Deregister the listeners
        for (var i = 0; i < this.dataListenerIdArray.length; i++) {
            userData.deRegisterListener(this.dataListenerIdArray[i].itineraryId, this.dataListenerIdArray[i].listenerId);
        }
    };

    function getActiveItineraryIdString() {
        return this.resultsList[this.currentResult].id.toString();
    };

    function getActiveItinerary() {
        return this.resultsList[this.currentResult];
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define("resultsState", { resultsState: resultsState });
})();