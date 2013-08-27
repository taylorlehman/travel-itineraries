(function () {
    "use strict";

    function searchState(resultsStateObject) {
        //CONTROLLER CALLBACKS
        this.drawUI = drawUI;
        this.reset = reset;

        //Which step in the setup process the user is in
        //0 = LOCATION
        //1 = WHEN
        //2 = WHO
        //3 = HOW MUCH
        this.currentStep = 1;

        //The div that is currently on the screen
        //Valid Values: "A", "B"
        this.activeDiv = "A";

        //Method to get the active/inactive Div elements
        this.getActiveDivElement = getActiveDivElement;
        this.getInactiveDivElement = getInactiveDivElement;

        //The selection state of the who grid items
        //0 = Not selected
        //1 = Selected
        this.whoItemState = [0, 0, 0, 0, 0, 0, 0, 0];

        //How much the user wants to spend
        //"" = No selection
        this.howMuchSelection = "";
        this.howMuchSelectionElement = "";

        //The "WHERE" selection properties
        //0: Seattle
        //1: SF
        //2: Boston
        //3: NYC
        this.currentLocationSelectionId = "";
        this.currentLocationSelectionString = ""; //Strings
        this.changeLocationSelection = changeLocationSelection;

        //The "WHEN" selection properties
        this.WHENGRID_selected_item_id = "";
        this.WHENGRID_selected_item_string = "";

        //ATTACH ON CLICK
        //WHY THIS IS NECESSARY:
        //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
        //http://ejohn.org/apps/learn/
        //http://www.digital-web.com/articles/scope_in_javascript/
        //http://stackoverflow.com/questions/133973/how-does-this-keyword-work-within-a-javascript-object-literal
        this.AttachOnClick = AttachOnClick;

        //WORKER
        this.worker = new Worker("/js/worker.js");
        resultsStateObject.AttachOnMessage(this.worker, "handleSearch");

        //CALLBACKS
        this.configureUI = configureUI;

        //Methods for getting the search hash values
        this.getWhereSearchHashValue = getWhereSearchHashValue;
        this.getWhenSearchHashValue = getWhenSearchHashValue;
        this.getHowMuchSearchHashValue = getHowMuchSearchHashValue;
        this.getWhatSearchHashValue = getWhatSearchHashValue;

        //EVENT HANDLERS
        this.reposition_inactive_div = reposition_inactive_div;
        this.switchActiveDiv = switchActiveDiv;
        this.advanceSearchState = advanceSearchState;

        this.WHEREGRID_generateWhereHTML = WHEREGRID_generateWhereHTML;
        this.WHEREGRID_plotpoint = WHEREGRID_plotpoint;
        this.WHEREGRID_plotpointOuterDiv_click = WHEREGRID_plotpointOuterDiv_click;

        this.WHENGRID_item_selection_click = WHENGRID_item_selection_click;
        this.WHENGRID_generateWhenHTML = WHENGRID_generateWhenHTML;
        this.WHENGRID_item_untap = WHENGRID_item_untap;
        this.WHENGRID_item_tap = WHENGRID_item_tap;

        this.SEARCHGRID_next_button_click = SEARCHGRID_next_button_click;
        this.SEARCHGRID_next_WHO = SEARCHGRID_next_WHO;
        this.SEARCHGRID_next_WHEN = SEARCHGRID_next_WHEN;

        this.HOWMUCHGRID_generateHowMuchHTML = HOWMUCHGRID_generateHowMuchHTML;
        this.HOWMUCHGRID_item_click = HOWMUCHGRID_item_click;
        this.getHowMuchSelectionValue = getHowMuchSelectionValue;

        this.WHOGRID_generateWhoHTML = WHOGRID_generateWhoHTML;
        this.WHOGRID_item_click = WHOGRID_item_click;
        
        this.SEARCHGRID_header_click = SEARCHGRID_header_click;
        this.EnableHeaderClick = EnableHeaderClick;
        
        this.clearCurrentHighlightedHeader = clearCurrentHighlightedHeader;
        this.highLightHeader = highLightHeader;
        this.hideActiveDiv = hideActiveDiv;
        this.showInactiveDiv = showInactiveDiv;
    };

    //ATTACH ON CLICK
    //WHY THIS IS NECESSARY:
    //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
    //http://ejohn.org/apps/learn/
    //http://www.digital-web.com/articles/scope_in_javascript/
    //http://stackoverflow.com/questions/133973/how-does-this-keyword-work-within-a-javascript-object-literal
    function AttachOnClick(element, eventName) {
        var self = this;

        switch (eventName) {
            case "WHENGRID_item_selection_click":
                element.onclick = function () { self.WHENGRID_item_selection_click(this); };
                break;
            case "SEARCHGRID_next_button_click":
                element.onclick = function () { self.SEARCHGRID_next_button_click(this); };
                break;
            case "HOWMUCHGRID_item_click":
                element.onclick = function () { self.HOWMUCHGRID_item_click(this); };
                break;
            case "WHOGRID_item_click":
                element.onclick = function () { self.WHOGRID_item_click(this); };
                break;
            case "SEARCHGRID_header_click":
                element.onclick = function () { self.SEARCHGRID_header_click(this); };
                break;
            case "WHEREGRID_plotpointOuterDiv_click":
                element.onclick = function () { self.WHEREGRID_plotpointOuterDiv_click(this); };
                break;
        };

        element = null;
    };

    function getActiveDivElement() {
        return document.getElementById("SEARCHCONTENT_" + this.activeDiv);
    };

    function getInactiveDivElement() {
        var inactiveDivLetter = "A";

        if (this.activeDiv == "A") {
            inactiveDivLetter = "B";
        }

        return document.getElementById("SEARCHCONTENT_" + inactiveDivLetter);
    };

    //Called by defaultjs during startup to allow the page to do 
    //any configuration necessary
    function configureUI() {
        this.AttachOnClick(document.getElementById("SEARCHGRID_next_button"), "SEARCHGRID_next_button_click");
        this.AttachOnClick(document.getElementById("SEARCHGRID_who"), "SEARCHGRID_header_click");
        this.AttachOnClick(document.getElementById("SEARCHGRID_howmuch"), "SEARCHGRID_header_click");
    };

    /*******************************************
    *********** EVENT HANDLERS *****************
    *******************************************/
    //A method to move the currently inactive div into position
    //so that it always slides in from the right (instead of sliding in from the lefreposition_inactive_divt)
    function reposition_inactive_div() {
        this.getInactiveDivElement().style.left = window.innerWidth.toString() + "px";
    };

    //Enables the next header
    function EnableHeaderClick(elementName) {
        var element = document.getElementById(elementName);
        element.style.cursor = "pointer";
        
        this.AttachOnClick(document.getElementById(elementName), "SEARCHGRID_header_click");
    };

    //When the user taps one of the "when" boxes, this method gets called
    function WHENGRID_item_selection_click(e) {
        var clickedElement = e;

        //Move the currently inactive div into position
        this.reposition_inactive_div();

        //Clear the previously tapped item
        this.WHENGRID_item_untap();

        //Apply the "tapped" effect"
        this.WHENGRID_item_tap(clickedElement.id);

        //Navigate to the next view
        this.SEARCHGRID_next_WHEN();

        //Setup the who pieces
        this.EnableHeaderClick("SEARCHGRID_who");

        //Switch the activeDiv
        this.switchActiveDiv();

        //Advance the search state
        this.advanceSearchState();
    };

    //Helper method for WHENGRID_item_selection_click
    function WHENGRID_item_untap() {
        switch (this.WHENGRID_selected_item_id) {
            case "WHENGRID_spring":
                document.getElementById("WHENGRID_spring").classList.remove("WHENGRID_spring_selected_class");
                break;
            case "WHENGRID_summer":
                document.getElementById("WHENGRID_summer").classList.remove("WHENGRID_summer_selected_class");
                break;
            case "WHENGRID_fall":
                document.getElementById("WHENGRID_fall").classList.remove("WHENGRID_fall_selected_class");
                break;
            case "WHENGRID_winter":
                document.getElementById("WHENGRID_winter").classList.remove("WHENGRID_winter_selected_class");
                break;
        }
    };

    //Helper method for WHENGRID_item_selection_click
    function WHENGRID_item_tap(id) {
        switch (id) {
            case "WHENGRID_spring":
                document.getElementById("WHENGRID_spring").classList.add("WHENGRID_spring_selected_class");
                break;
            case "WHENGRID_summer":
                document.getElementById("WHENGRID_summer").classList.add("WHENGRID_summer_selected_class");
                break;
            case "WHENGRID_fall":
                document.getElementById("WHENGRID_fall").classList.add("WHENGRID_fall_selected_class");
                break;
            case "WHENGRID_winter":
                document.getElementById("WHENGRID_winter").classList.add("WHENGRID_winter_selected_class");
                break;
        }

        this.WHENGRID_selected_item_id = id;
        this.WHENGRID_selected_item_string = document.getElementById(id).innerHTML;
    };

    function SEARCHGRID_next_button_click(e) {
        var clickedElement = e;

        //Hide the next button
        clickedElement.style.left = window.innerWidth.toString() + "px";

        switch (this.currentStep) {
            case 0: //LOCATION
                break;
            case 1: //WHEN
                this.SEARCHGRID_next_WHEN();

                //Switch the activeDiv
                this.switchActiveDiv();
                break;
            case 2: //WHO
                this.SEARCHGRID_next_WHO(clickedElement);

                this.EnableHeaderClick("SEARCHGRID_howmuch");

                //Switch the activeDiv
                this.switchActiveDiv();

                break;
            case 3: //HOW MUCH
                //Do nothing since this is handled by the if statement below
                break;
        }

        this.advanceSearchState();
    };

    //Advance Search Method
    function advanceSearchState() {
        //Move on to the next step
        this.currentStep++;

        //If the current step is 4, we are done with the search setup
        if (this.currentStep == 4) {
            //Hide the active div by sliding it to the left and reducing opacity
            this.getActiveDivElement().style.left = -window.innerWidth.toString() + "px";
            this.getActiveDivElement().style.opacity = "0";

            //Also hide the top grid
            document.getElementById("SEARCHGRID").style.top = "-75px";

            //Populate the "searching" div
            document.getElementById("SEARCHINGGRID_item_where_h2").innerText = this.currentLocationSelectionString;
            document.getElementById("SEARCHINGGRID_item_when_h2").innerText = this.WHENGRID_selected_item_string;
            document.getElementById("SEARCHINGGRID_item_howmuch_h2").innerText = this.howMuchSelection;
            Utilities.buildWhoHorizontalLayout(document.getElementById("SEARCHINGGRID_item_who_h2"), this.whoItemState);

            //Fade the searching div in
            document.getElementById("SEARCHINGGRID").style.opacity = "1";
            document.getElementById("SEARCHINGGRID").style.display = "-ms-flexbox";

            //Kick off a search (Asynchronously)
            var searchConfigArray = new Array();
            searchConfigArray["where"] = this.getWhereSearchHashValue();
            searchConfigArray["when"] = this.getWhenSearchHashValue();
            searchConfigArray["howmuch"] = this.getHowMuchSearchHashValue();
            searchConfigArray["what"] = this.getWhatSearchHashValue();

            this.worker.postMessage({ action: "search", searchConfigArray: searchConfigArray });
        }
    };

    function getWhereSearchHashValue() {
        switch (this.currentLocationSelectionId) {
            case "0":
                return "SEA";
                break;
            case "1":
                return "SF";
                break;
            case "2":
                return "BOS";
                break;
            case "3":
                return "NY";
                break;
        };
    };

    function getWhenSearchHashValue() {
        return this.WHENGRID_selected_item_id.split("_")[1];
    };

    function getHowMuchSearchHashValue() {
        switch (this.howMuchSelection) {
            case "$":
                return 1;
                break;
            case "$$":
                return 2;
                break;
            case "$$$":
                return 3;
                break;
        }
    };

    function getWhatSearchHashValue() {
        return this.whoItemState;
    };

    //Helped function for the SEARCHGRID next button click handler
    function switchActiveDiv() {
        //If the current active div is "A", switch is to "B"
        if (this.activeDiv == "A") {
            this.activeDiv = "B";
        } else {
            this.activeDiv = "A";
        }
    };

    function SEARCHGRID_next_WHO(clickedElement) {
        //Populate the next screen
        this.HOWMUCHGRID_generateHowMuchHTML(this.getInactiveDivElement());

        //Hide the current screen and show the next
        //0 = LOCATION
        //1 = WHEN
        //2 = WHO
        //3 = HOW MUCH
        this.hideActiveDiv(3);
        this.showInactiveDiv(3);

        //Move the header grid indicator
        document.getElementById("SEARCHGRID_who").innerHTML = "";
        Utilities.buildWhoHorizontalLayout(document.getElementById("SEARCHGRID_who"), this.whoItemState);
        document.getElementById("SEARCHGRID_who").classList.remove("SEARCHGRID_selected_header_class");
        document.getElementById("SEARCHGRID_who").classList.add("SEARCHGRID_completed_header_class");
        document.getElementById("SEARCHGRID_howmuch").classList.add("SEARCHGRID_selected_header_class");
    };

    function SEARCHGRID_next_WHEN() {

        //Populate the next screen
        this.WHOGRID_generateWhoHTML(this.getInactiveDivElement());

        //Hide the current screen and show the next
        //0 = LOCATION
        //1 = WHEN
        //2 = WHO
        //3 = HOW MUCH
        this.hideActiveDiv(2);
        this.showInactiveDiv(2);

        //Move the header grid indicator
        document.getElementById("SEARCHGRID_when").innerText = this.WHENGRID_selected_item_string;
        document.getElementById("SEARCHGRID_when").classList.remove("SEARCHGRID_selected_header_class");
        document.getElementById("SEARCHGRID_when").classList.add("SEARCHGRID_completed_header_class");
        document.getElementById("SEARCHGRID_who").classList.add("SEARCHGRID_selected_header_class");
    };

    function HOWMUCHGRID_item_click(e) {
        var currentElement = e;

        //Move the currently inactive div into position
        this.reposition_inactive_div();

        //Go up the stack until we find the HOWMUCHGRID_item
        var pattern = /^HOWMUCHGRID_item/;
        if (!pattern.test(currentElement.id)) {
            while (!pattern.test(currentElement.id)) {
                currentElement = currentElement.parentElement;
            }
        }

        //We are now at the right element!!!!!!

        //Remove the previous selection
        if (this.howMuchSelectionElement != "") {
            this.howMuchSelectionElement.classList.remove("HOWMUCHGRID_item_selected_class");
            this.howMuchSelectionElement.classList.add("HOWMUCHGRID_item_unselected_class");
        }

        //Update the current selection
        currentElement.classList.remove("HOWMUCHGRID_item_unselected_class");
        currentElement.classList.add("HOWMUCHGRID_item_selected_class");
        this.howMuchSelection = this.getHowMuchSelectionValue(currentElement);
        this.howMuchSelectionElement = currentElement;

        //Advance the search state
        this.advanceSearchState();

        //Show the "next" button
        //document.getElementById("SEARCHGRID_next_button").style.left = (window.innerWidth - 245).toString() + "px";
    };

    function getHowMuchSelectionValue(currentElement) {
        var howMuchNumber = currentElement.id.split("_")[2];
        var returnValue = "";

        switch (howMuchNumber) {
            case "1":
                returnValue = "$";
                break;
            case "2":
                returnValue = "$$";
                break;
            case "3": //WHO
                returnValue = "$$$";
                break;
        }

        return returnValue;
    };

    //Used to generate the HTML for the "HOW MUCH" search experience
    function HOWMUCHGRID_generateHowMuchHTML(parentElement) {
        parentElement.innerHTML = "";

        //Insert the title
        var title = document.createElement("h1");
        title.classList.add("SEARCHCONTENT_h1_class");
        title.innerText = "How much do you want to spend?";
        parentElement.appendChild(title);

        //Insert the HOWMUCHGRID
        var HOWMUCH_grid = document.createElement("div");
        HOWMUCH_grid.id = "HOWMUCHGRID";

        //Create the HOWMUCH items
        var HOWMUCH_titles = ["$", "$$", "$$$"];
        var HOWMUCH_dinner = [
            "<$20/PP",
            "<$40/PP",
            "+$40/PP"
        ];
        var HOWMUCH_total = [
            "<$100/PP",
            "<$200/PP",
            "+$200/PP"
        ];

        //For each section built the appropriate divs
        for (var i = 0; i < 3; i++) {
            var tempDiv = document.createElement("div");
            tempDiv.id = "HOWMUCHGRID_item_" + (i + 1).toString();
            tempDiv.classList.add("HOWMUCHGRID_item_class");
            this.AttachOnClick(tempDiv, "HOWMUCHGRID_item_click");

            //If it's selected, select it
            var compareHowMuch = "";

            switch (i) {
                case 0:
                    compareHowMuch = "$";
                    break;
                case 1:
                    compareHowMuch = "$$";
                    break;
                case 2:
                    compareHowMuch = "$$$";
                    break;
            };

            if (compareHowMuch == this.howMuchSelection) {
                tempDiv.classList.add("HOWMUCHGRID_item_selected_class");
            } else {
                tempDiv.classList.add("HOWMUCHGRID_item_unselected_class");
            }


            //Create and append the Title ($, $$, $$$)
            var tempTitle = document.createElement("h1");
            tempTitle.className = "HOWMUCHGRID_h1_class";
            tempTitle.innerText = HOWMUCH_titles[i];

            tempDiv.appendChild(tempTitle);

            //Create the content Grid (to show the dinner and total price)
            var tempContentGrid = document.createElement("div");
            tempContentGrid.className = "HOWMUCHGRID_content_grid";

            //Create the dinner content
            var tempDinnerContent = document.createElement("div");
            tempDinnerContent.className = "HOWMUCHGRID_content_grid_sub";

            var tempDinnerh1 = document.createElement("h1");
            tempDinnerh1.className = "HOWMUCHGRID_content_grid_h1";
            tempDinnerh1.innerText = "Dinner";

            tempDinnerContent.appendChild(tempDinnerh1);

            var tempDinnerh2 = document.createElement("h2");
            tempDinnerh2.className = "HOWMUCHGRID_content_grid_h2";
            tempDinnerh2.innerText = HOWMUCH_dinner[i];

            tempDinnerContent.appendChild(tempDinnerh2);

            tempContentGrid.appendChild(tempDinnerContent);

            //Create the total content
            var tempTotalContent = document.createElement("div");
            tempTotalContent.className = "HOWMUCHGRID_content_grid_sub";

            var tempTotalh1 = document.createElement("h1");
            tempTotalh1.className = "HOWMUCHGRID_content_grid_h1";
            tempTotalh1.innerText = "Total";

            tempTotalContent.appendChild(tempTotalh1);

            var tempTotalh2 = document.createElement("h2");
            tempTotalh2.className = "HOWMUCHGRID_content_grid_h2";
            tempTotalh2.innerText = HOWMUCH_total[i];

            tempTotalContent.appendChild(tempTotalh2);

            tempContentGrid.appendChild(tempTotalContent);

            tempDiv.appendChild(tempContentGrid);

            HOWMUCH_grid.appendChild(tempDiv);
        }

        parentElement.appendChild(HOWMUCH_grid);
    };

    //Used to generate the HTML for the "WHO" search experience
    function WHOGRID_generateWhoHTML(parentElement) {
        parentElement.innerHTML = "";

        //Insert the title
        var title = document.createElement("h1");
        title.classList.add("SEARCHCONTENT_h1_class");
        title.innerText = "What type of activities do you want included in your vacation?";
        parentElement.appendChild(title);

        var helperText = document.createElement("h2");
        helperText.classList.add("SEARCHCONTENT_h2_class");
        helperText.innerText = "You can select one, or many!";
        parentElement.appendChild(helperText);

        var WHENGRID_div = document.createElement("div");
        WHENGRID_div.id = "WHOGRID";

        var WHOGRID_titles = [
            "Active",
            "Pamper",
            "Kids",
            "Nightlife",
            "Foodie",
            "Sight Seeing",
            "Arts and Culture",
            "Shopping"
        ];

        var showNextButton = 0;

        for (var i = 0; i < 8; i++) {
            //Create the div that holds the picture
            var tempItem = document.createElement("div");
            tempItem.id = "WHOGRID_" + (i + 1).toString();
            tempItem.classList.add("WHOGRID_item");
            this.AttachOnClick(tempItem, "WHOGRID_item_click");

            //Create the title
            var tempH1 = document.createElement("h1");
            tempH1.classList.add("WHOGRID_title");
            tempH1.innerText = WHOGRID_titles[i];
            tempItem.appendChild(tempH1);

            //Create the hidden checkbox div
            var tempItemCheckbox = document.createElement("div");
            tempItemCheckbox.id = "WHOGRID_checkbox_" + (i + 1).toString();
            tempItemCheckbox.classList.add("WHOGRID_checkbox");
            tempItemCheckbox.classList.add("icon-ok");
            tempItemCheckbox.classList.add("icon-4x");
            if (this.whoItemState[i] == 1) { //If this is enabled, show the checkbox
                tempItemCheckbox.style.display = "-ms-flexbox";
                showNextButton = 1;
            }

            tempItem.appendChild(tempItemCheckbox);

            WHENGRID_div.appendChild(tempItem);
        }

        //Show the next button, if appropriate
        if (showNextButton == 1) {
            document.getElementById("SEARCHGRID_next_button").style.left = (window.innerWidth - 245).toString() + "px";
        }

        parentElement.appendChild(WHENGRID_div);
    };

    //This method gets called when one of the items in the WHOGRID
    //gets clicked on
    function WHOGRID_item_click(e) {
        var item_div = null;

        //Move the currently inactive div into position
        this.reposition_inactive_div();

        //Clicked on the parent
        if (e.childNodes.length > 0) {
            item_div = e.childNodes[1];
        } else { //Clicked on the child
            item_div = e;
        }

        var index = item_div.id.toString().split("_")[2];

        //If the item is already selected
        if (this.whoItemState[index - 1] == 1) {
            //Deselect It
            this.whoItemState[index - 1] = 0;
            item_div.style.display = "none";

            //Decide if we need to hide the next button
            var anySelected = 0;
            for (var i = 0; i < 8; i++) {
                if (this.whoItemState[i] == 1) {
                    anySelected = 1;
                }
            }

            //Check to see if any of the items are selected
            if (anySelected == 0) {
                //No items are selected, hide the button
                document.getElementById("SEARCHGRID_next_button").style.left = window.innerWidth.toString() + "px";
            }
        } else {
            //Select It
            this.whoItemState[index - 1] = 1;
            item_div.style.display = "-ms-flexbox";

            //Show the next button
            document.getElementById("SEARCHGRID_next_button").style.left = (window.innerWidth - 245).toString() + "px";
        }
    };

    //Used to generate the HTML for the "WHEN" search experience
    function WHENGRID_generateWhenHTML(parentElement){
        parentElement.innerHTML = "";

        //Generate the Title
        var title = document.createElement("h1");
        title.classList.add("SEARCHCONTENT_h1_class");
        title.innerText = "When are you traveling?";
        parentElement.appendChild(title);

        var WHENGRID_div = document.createElement("div");
        WHENGRID_div.id = "WHENGRID";

        var WHENGRID_spring = document.createElement("div");
        WHENGRID_spring.id = "WHENGRID_spring";
        WHENGRID_spring.classList.add("WHENGRID_item");
        if (this.WHENGRID_selected_item_id == "WHENGRID_spring") {
            WHENGRID_spring.classList.add("WHENGRID_spring_selected_class");
        }
        WHENGRID_spring.innerText = "Spring";
        this.AttachOnClick(WHENGRID_spring, "WHENGRID_item_selection_click");

        var WHENGRID_summer = document.createElement("div");
        WHENGRID_summer.id = "WHENGRID_summer";
        WHENGRID_summer.classList.add("WHENGRID_item");
        if (this.WHENGRID_selected_item_id == "WHENGRID_summer") {
            WHENGRID_summer.classList.add("WHENGRID_summer_selected_class");
        }
        WHENGRID_summer.innerText = "Summer";
        this.AttachOnClick(WHENGRID_summer, "WHENGRID_item_selection_click");


        var WHENGRID_fall = document.createElement("div");
        WHENGRID_fall.id = "WHENGRID_fall";
        WHENGRID_fall.classList.add("WHENGRID_item");
        if (this.WHENGRID_selected_item_id == "WHENGRID_fall") {
            WHENGRID_fall.classList.add("WHENGRID_fall_selected_class");
        }
        WHENGRID_fall.innerText = "Fall";
        this.AttachOnClick(WHENGRID_fall, "WHENGRID_item_selection_click");


        var WHENGRID_winter = document.createElement("div");
        WHENGRID_winter.id = "WHENGRID_winter";
        WHENGRID_winter.classList.add("WHENGRID_item");
        if (this.WHENGRID_selected_item_id == "WHENGRID_winter") {
            WHENGRID_winter.classList.add("WHENGRID_winter_selected_class");
        }
        WHENGRID_winter.innerText = "Winter";
        this.AttachOnClick(WHENGRID_winter, "WHENGRID_item_selection_click");

        WHENGRID_div.appendChild(WHENGRID_spring);
        WHENGRID_div.appendChild(WHENGRID_summer);
        WHENGRID_div.appendChild(WHENGRID_fall);
        WHENGRID_div.appendChild(WHENGRID_winter);

        parentElement.appendChild(WHENGRID_div);
    };

    function changeLocationSelection(containerElement) {
        //Check to make sure the user didn't click on the already selected location
        var targetID = containerElement.id.toString().split("_")[2];
        if (targetID != this.currentLocationSelectionId) {
            //Add the style to the new target
            containerElement.childNodes[1].classList.remove("WHEREGRID_pointLabelDiv");
            containerElement.childNodes[1].classList.add("WHEREGRID_pointLabelDiv_selected");

            //Remove it from the previous one
            if (this.currentLocationSelectionId != "") {
                var previousLabel = document.getElementById("WHEREGRID_POINT_" + this.currentLocationSelectionId.toString()).childNodes[1];
                previousLabel.classList.remove("WHEREGRID_pointLabelDiv_selected");
                previousLabel.classList.add("WHEREGRID_pointLabelDiv");
            }
            
            this.currentLocationSelectionId = targetID;
            this.currentLocationSelectionString = containerElement.childNodes[1].innerText;
        }
    };

    //Click handler for when the user clicks on a city
    //on the where page
    function WHEREGRID_plotpointOuterDiv_click(element) {
        var containerElement = element;

        //Go up until you find the container div
        var pattern = /^WHEREGRID_POINT_/;
        while (!pattern.test(containerElement.id)) {
            containerElement = containerElement.parentElement;
        }

        //Change to the new location
        this.changeLocationSelection(containerElement);

        document.getElementById("SEARCHGRID_where").innerText = this.currentLocationSelectionString;

        //Advance in the search experience
        this.SEARCHGRID_header_click(document.getElementById("SEARCHGRID_when"));
    };

    //Helper function for WHEREGRID_generateWhereHTML
    function WHEREGRID_plotpoint(pointObject, mapDivElement, currentIndex) {
        //Create the outer div
        var plotpointOuterDiv = document.createElement("div");
        plotpointOuterDiv.id = "WHEREGRID_POINT_" + pointObject.id;
        if (pointObject.disabled == true) {
            plotpointOuterDiv.classList.add("WHEREGRID_plotpointOuterDiv_disabled");
        } else {
            plotpointOuterDiv.classList.add("WHEREGRID_plotpointOuterDiv");
            this.AttachOnClick(plotpointOuterDiv, "WHEREGRID_plotpointOuterDiv_click");
        }
        var height = 16; //This ties to the style on WHEREGRID_plotpointOuterDiv
        plotpointOuterDiv.style.top = (pointObject.top - (16 * currentIndex)).toString() + "px";
        plotpointOuterDiv.style.left = pointObject.left;
        
        //Create the point
        var pointDiv = document.createElement("div");
        if (pointObject.disabled == true) {
            pointDiv.classList.add("WHEREGRID_pointDiv_disabled");
        } else {
            pointDiv.classList.add("WHEREGRID_pointDiv");
        }

        plotpointOuterDiv.appendChild(pointDiv);

        //Create the div for the label
        var labelDiv = document.createElement("div");
        if (this.currentLocationSelectionId == currentIndex.toString()) {
            labelDiv.classList.add("WHEREGRID_pointLabelDiv_selected");
        } else {
            if (pointObject.disabled == true) {
                labelDiv.classList.add("WHEREGRID_pointLabelDiv_disabled");
            } else {
                labelDiv.classList.add("WHEREGRID_pointLabelDiv");
            }
        }
        labelDiv.innerHTML = pointObject.string;
        plotpointOuterDiv.appendChild(labelDiv);

        //If it's disabled, say so!
        if (pointObject.disabled == true) {
            var disabledDiv = document.createElement("div");
            disabledDiv.classList.add("WHEREGRID_pointDisabledDiv");
            disabledDiv.innerHTML = "Coming Soon!";
            plotpointOuterDiv.appendChild(disabledDiv);

        }
    
        mapDivElement.appendChild(plotpointOuterDiv);  
    };

    //Used to generate the HTML for the WHERE GRID experience
    function WHEREGRID_generateWhereHTML(parentElement) {
        parentElement.innerHTML = "";

        //Generate the Title
        var title = document.createElement("h1");
        title.classList.add("SEARCHCONTENT_h1_class");
        title.innerText = "Where do you want to go?";
        parentElement.appendChild(title);

        //Create the map div
        var mapdiv = document.createElement("div");
        mapdiv.id = "WHEREGRID_map_div";

        var points =
            [
                {
                    id: 0,
                    left: "70px",
                    top: 53,
                    string: "Seattle, WA",
                    disabled: false
                },
                {
                    id: 1,
                    left: "19px",
                    top: 240,
                    string: "San Francisco, CA",
                    disabled: true
                },
                {
                    id: 2,
                    left: "698px",
                    top: 153,
                    string: "Boston, MA",
                    disabled: true
                },
                {
                    id: 3,
                    left: "671px",
                    top: 192,
                    string: "New York, NY",
                    disabled: true
                }
            ];

        for (var i = 0; i < points.length; i++) {
            this.WHEREGRID_plotpoint(points[i], mapdiv, i);
        }

        parentElement.appendChild(mapdiv);
    };

    function clearCurrentHighlightedHeader() {
        var elementId = "";

        //0: Where
        //1: When
        //2: Who
        //3: How Much
        switch (this.currentStep) {
            case 0:
                elementId = "SEARCHGRID_where";
                break;
            case 1:
                elementId = "SEARCHGRID_when";
                break;
            case 2:
                elementId = "SEARCHGRID_who";
                break;
            case 3:
                elementId = "SEARCHGRID_howmuch";
                break;
        };

        document.getElementById(elementId).classList.remove("SEARCHGRID_selected_header_class");
    };

    function highLightHeader(element) {
        element.classList.add("SEARCHGRID_selected_header_class");
    };

    //Target state is a numeric value from 0->3
    function hideActiveDiv(targetStep) {

        //No-op if the user clicked the currently selected item
        if (targetStep != this.currentStep) {
            var leftPosition = (-window.innerWidth).toString() + "px"; // By default, move it left (advancing)

            //Check to see if it should move right instead
            if (targetStep < this.currentStep) {
                //The current div moves right
                leftPosition = window.innerWidth.toString() + "px";
            }

            WinJS.UI.executeTransition(
                this.getActiveDivElement(),
                [
                    {
                        property: "left",
                        delay: 0,
                        duration: 400,
                        timing: "linear",
                        from: "0px",
                        to: leftPosition
                    },
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 400,
                        timing: "linear",
                        from: 1,
                        to: 0
                    }
                ]
            );
        }

    };

    function showInactiveDiv(targetStep) {
        //No-op if the user clicked the currently selected item
        if (targetStep != this.currentStep) {
            //Correctly Position it to slide in from the correct place
            var leftPosition = window.innerWidth.toString() + "px"; // By default, position it to the right of the screen

            //Check to see if it should be on the left side instead
            if (targetStep < this.currentStep) {
                //The current div moves right
                leftPosition = (-window.innerWidth).toString() + "px";
            }

            WinJS.UI.executeTransition(
                this.getInactiveDivElement(),
                [
                    {
                        property: "left",
                        delay: 0,
                        duration: 400,
                        timing: "linear",
                        from: leftPosition,
                        to: "0px"
                    },
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 400,
                        timing: "linear",
                        from: 0,
                        to: 1
                    }
                ]
            );

        }
    };

    function SEARCHGRID_header_click(element) {
        var newStep = -1;

        //Change the header highlighing
        this.clearCurrentHighlightedHeader();

        //For the item that got clicked on, change the value 
        this.highLightHeader(element);

        //For the who header only, when we click away, we need to recalc
        //the top (since the user could have changed it without advancing)
        document.getElementById("SEARCHGRID_who").innerHTML = "";
        Utilities.buildWhoHorizontalLayout(document.getElementById("SEARCHGRID_who"), this.whoItemState);

        //Build the HTML (in the inactive div) and set the new step value
        switch (element.id) {
            case "SEARCHGRID_where":
                this.WHEREGRID_generateWhereHTML(this.getInactiveDivElement());
                newStep = 0;
                break;
            case "SEARCHGRID_when":
                this.WHENGRID_generateWhenHTML(this.getInactiveDivElement());
                newStep = 1;
                break;
            case "SEARCHGRID_who":
                this.WHOGRID_generateWhoHTML(this.getInactiveDivElement());
                newStep = 2;
                break;
            case "SEARCHGRID_howmuch":
                this.HOWMUCHGRID_generateHowMuchHTML(this.getInactiveDivElement());
                newStep = 3;
                break;
        };
       
        //If the target isn't the who grid, we need to hide the next button
        if (newStep != 2) {
            //Hide the next button
            document.getElementById("SEARCHGRID_next_button").style.left = (window.innerWidth).toString() + "px";
        }

        //Hide the current div
        this.hideActiveDiv(newStep);

        //Show the next one
        this.showInactiveDiv(newStep);

        //Switch Active Div
        this.switchActiveDiv();

        //Move the current state, but only after the right thing is 
        //shown on the screen
        this.currentStep = newStep;
    };

    //Draw the UI, *** ASSUMING WE ARE STARTING A NEW SEARCH ***
    function drawUI(state) {
        //Configure the Search Grid and Search Content
        document.getElementById("SEARCHGRID_where").classList.add("SEARCHGRID_selected_header_class"); 
        document.getElementById("SEARCHGRID_where").innerText = "Where";

        document.getElementById("SEARCHGRID_when").classList.remove("SEARCHGRID_selected_header_class");
        document.getElementById("SEARCHGRID_when").classList.remove("SEARCHGRID_completed_header_class");
        document.getElementById("SEARCHGRID_when").innerText = "When";

        document.getElementById("SEARCHGRID_who").classList.remove("SEARCHGRID_selected_header_class");
        document.getElementById("SEARCHGRID_who").classList.remove("SEARCHGRID_completed_header_class");
        document.getElementById("SEARCHGRID_who").innerText = "What";

        document.getElementById("SEARCHGRID_howmuch").classList.remove("SEARCHGRID_selected_header_class");
        document.getElementById("SEARCHGRID_howmuch").classList.remove("SEARCHGRID_completed_header_class");
        document.getElementById("SEARCHGRID_howmuch").innerText = "How Much";

        this.WHEREGRID_generateWhereHTML(document.getElementById("SEARCHCONTENT_A"));
        this.AttachOnClick(document.getElementById("SEARCHGRID_where"), "SEARCHGRID_header_click");
        document.getElementById("SEARCHGRID_where").style.cursor = "pointer";
        
        //Show the header
        document.getElementById("SEARCHGRID").style.top = "0px";

        //Show the content
        document.getElementById("SEARCHCONTENT_A").style.display = "-ms-flexbox";
        document.getElementById("SEARCHCONTENT_A").style.opacity = "1";
        document.getElementById("SEARCHCONTENT_A").style.left = "0px";
        document.getElementById("SEARCHCONTENT_B").left = window.innerWidth.toString() + "px";
        document.getElementById("SEARCHCONTENT_B").style.display = "-ms-flexbox";
    };

    function reset() {
        this.currentStep = 0;
        this.activeDiv = "A";

        this.whoItemState = [0, 0, 0, 0, 0, 0, 0, 0];

        this.howMuchSelection = "";
        this.howMuchSelectionElement = "";

        this.currentLocationSelectionId = "";
        this.currentLocationSelectionString = "";

        this.WHENGRID_selected_item_id = "";
        this.WHENGRID_selected_item_string = "";
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define("searchState", { searchState: searchState });
})();