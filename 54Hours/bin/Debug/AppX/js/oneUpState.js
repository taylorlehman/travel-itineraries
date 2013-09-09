(function () {
    "use strict";

    function oneUpState(controller) {
        //Controller Call Backs
        this.clearUI = clearUI;
        this.reset = reset;
        this.getActiveItineraryIdString = getActiveItineraryIdString;
        this.getActiveItinerary = getActiveItinerary;
        this.configureAppBar = configureAppBar;
        this.configureUI = configureUI;
        this.shouldEnableAppBar = shouldEnableAppBar;
        this.returnElementsToOriginalPosition = returnElementsToOriginalPosition;

        //Member Variables
        this.item = null;
        this.selectedEventId = null;
        this.loadSource = null; //0 = highlights, 1 = results

        //Member Functions
        this.switchEventStyle = switchEventStyle;
        this.getEventById = getEventById;
        this.showEventDetails = showEventDetails;
        this.setSelectedEventId = setSelectedEventId;
        this.getEventElementById = getEventElementById;
        this.configureDetailsDiv = configureDetailsDiv;
        this.unsetSelectedEventId = unsetSelectedEventId;
        this.clearDetailsDiv = clearDetailsDiv;
        this.RESULTSGRID_buildoneupview = RESULTSGRID_buildoneupview;
        this.drawEvents = drawEvents;
        this.setPositionByTime = setPositionByTime;
        this.drawHeader = drawHeader;
        this.drawGrid = drawGrid;
        this.populateTipsActions = populateTipsActions;
        this.handleLoadCode = handleLoadCode;
        this.handleLoad_nonWorker = handleLoad_nonWorker;
        this.getEventFromPushpinIndex = getEventFromPushpinIndex;

        //Providing the correct scope for event handlers
        this.AttachOnMessage = AttachOnMessage;
        this.AttachOnClick = AttachOnClick;

        //Map Functions
        this.clearMap = clearMap;
        this.InitializeMap = InitializeMap;
        this.showItinerary = showItinerary;
        this.showMap = showMap;
        this.viewTransition = viewTransition;
        this.getMapDotDayClass = getMapDotDayClass;
        this.positionMapEventZoomView = positionMapEventZoomView;
        this.createPushPinOptions = createPushPinOptions;
        this.mapDotClick = mapDotClick;
        this.ONEUPGRID_mapnav_click = ONEUPGRID_mapnav_click;
        this.getFirstEventOnDay = getFirstEventOnDay;
        this.getLastEventOnDay = getLastEventOnDay;
        this.resetMapView = resetMapView;
        
        //Map Variables
        this.northWestBoundingBoxPoint = null;
        this.southEastBoundingBoxPoint = null;
        this.centerPoint = null;
        this.MapState = 0; //0=Not Initialized, 1=Initializing, 2=Initialized
        this.map = null;
        this.selectedNavButton = "ONEUPGRID_mapnav_all";
        this.mapInView = false;
        this.calculatedPoints = new Object();
        this.calculatedPoints["Friday"] = 0;
        this.calculatedPoints["Saturday"] = 0;
        this.calculatedPoints["Sunday"] = 0;
        this.northWestBoundingBoxPoints = new Object();
        this.southEastBoundingBoxPoints = new Object();
        this.centerPoints = new Object();
        this.currentViewFirstEventId = 0;
        this.currentViewLastEventId = null;

        //Details Div Transition Variables 
        this.detailsDivState = 0; //0=Closed, 1=Full, 2=Mini

        //Details Div Transition Functions
        this.transitionDetailsDiv = transitionDetailsDiv;
        this.transitionDetailsFullToMini = transitionDetailsFullToMini;
        this.configureAndPopulateMiniDiv = configureAndPopulateMiniDiv;
        this.transitionDetailsMiniToFull = transitionDetailsMiniToFull;
        this.ONEUPGRID_details_content_mini_previous_div_click = ONEUPGRID_details_content_mini_previous_div_click;
        this.ONEUPGRID_details_content_mini_next_div_click = ONEUPGRID_details_content_mini_next_div_click
        this.populateDetailsMiniDivTitle = populateDetailsMiniDivTitle;
        this.hide_ONEUPGRID_details_content_mini_nav_div = hide_ONEUPGRID_details_content_mini_nav_div;
        this.show_ONEUPGRID_details_content_mini_nav_div = show_ONEUPGRID_details_content_mini_nav_div;
        this.rePopulateMiniDetailsTitleWithAnimation = rePopulateMiniDetailsTitleWithAnimation;
        this.transitionDetailsMiniToMini = transitionDetailsMiniToMini;
        this.transitionDetailsCloseToMini = transitionDetailsCloseToMini;
        this.showMiniDetailsNavArrows = showMiniDetailsNavArrows;

        //EVENT HANDLERS
        this.handleLoad = handleLoad;
        this.ONEUPGRID_details_content_mini_details_button_click = ONEUPGRID_details_content_mini_details_button_click;
        this.ONEUPGRID_details_content_mini_directions_button_click = ONEUPGRID_details_content_mini_directions_button_click;
        this.ONEUPGRID_details_actions_link_click = ONEUPGRID_details_actions_link_click;
        this.ONEUPGRID_itinerary_event_click = ONEUPGRID_itinerary_event_click;
        this.ONEUPGRID_details_close_div_click = ONEUPGRID_details_close_div_click;
        this.ONEUPGRID_details_title_map_click = ONEUPGRID_details_title_map_click;
    };

    //ATTACH ON CLICK
    //WHY THIS IS NECESSARY:
    //http://stackoverflow.com/questions/229080/class-methods-as-event-handlers-in-javascript (ANSWER #2)
    //http://ejohn.org/apps/learn/
    //http://www.digital-web.com/articles/scope_in_javascript/
    function AttachOnClick(element, eventName) {
        var self = this;

        switch (eventName) {
            case "ONEUPGRID_itinerary_event_click":
                element.onclick = function () { self.ONEUPGRID_itinerary_event_click(this); };
                break;
            case "ONEUPGRID_details_close_div_click":
                element.onclick = function () { self.ONEUPGRID_details_close_div_click(this); };
                break;
            case "ONEUPGRID_details_actions_link_click":
                element.onclick = function () { self.ONEUPGRID_details_actions_link_click(this); };
                break;
            case "ONEUPGRID_details_title_map_click":
                element.onclick = function () { self.ONEUPGRID_details_title_map_click(this); };
                break;
            case "ONEUPGRID_details_content_mini_details_button_click":
                element.onclick = function () { self.ONEUPGRID_details_content_mini_details_button_click(this); };
                break;
            case "ONEUPGRID_details_content_mini_directions_button_click":
                element.onclick = function () { self.ONEUPGRID_details_content_mini_directions_button_click(this); };
                break;
            case "ONEUPGRID_details_content_mini_previous_div_click":
                element.onclick = function () { self.ONEUPGRID_details_content_mini_previous_div_click(this); };
                break;
            case "ONEUPGRID_details_content_mini_next_div_click":
                element.onclick = function () { self.ONEUPGRID_details_content_mini_next_div_click(this); };
                break;
            case "ONEUPGRID_mapnav_click":
                element.onclick = function () { self.ONEUPGRID_mapnav_click(this); };
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
            case "handleLoad":
                tempWorker.onmessage = function (event) { self.handleLoad(event, this); };
                break;
        };

        tempWorker = null;
    };

    function shouldEnableAppBar() {
        return true;
    };

    function getFirstEventOnDay(dayString) {
        for (var i = 0; i < this.item.eventsList.length; i++) {
            if (this.item.eventsList[i].day == dayString) {
                return this.item.eventsList[i];
            }
        }
    };

    function getLastEventOnDay(dayString) {
        var foundCurrentDay = false;

        //If it's Sunday, we know what it is, so we can short circuit
        if (dayString == "Sunday") {
            return this.item.eventsList[this.item.eventsList.length - 1];
        }

        //Loop through all the events
        for (var i = 0; i < this.item.eventsList.length; i++) {
            if (foundCurrentDay == false) {
                if (this.item.eventsList[i].day == dayString) {
                    foundCurrentDay = true;
                }
            } else {
                //Note this case won't handle Sunday - that's shortcircuited above
                if (this.item.eventsList[i].day != dayString) {
                    return this.item.eventsList[i - 1];
                }
            }
        }
    };

    function resetMapView(dayString) {
        //First check to see if we've ever calculated this day's view before
        if (!this.calculatedPoints[dayString]) {
            var north = null;
            //Walk through the events calculating the corners
            var north = null;
            var south = null;
            var east = null;
            var west = null;
            for (var i = 0; i < this.item.eventsList.length; i++) {
                //Check to make sure this day is part of the day the user clicked on
                if (this.item.eventsList[i].day == dayString) {
                    //Determine the impact on the bounding box
                    if (north == null) {
                        north = this.item.eventsList[i].lat;
                    } else if (this.item.eventsList[i].lat > north) {
                        north = this.item.eventsList[i].lat;
                    }

                    if (south == null) {
                        south = this.item.eventsList[i].lat;
                    } else if (this.item.eventsList[i].lat < south) {
                        south = this.item.eventsList[i].lat;
                    }

                    if (east == null) {
                        east = this.item.eventsList[i].long;
                    } else if (this.item.eventsList[i].long > east) {
                        east = this.item.eventsList[i].long;
                    }

                    if (west == null) {
                        west = this.item.eventsList[i].long;
                    } else if (this.item.eventsList[i].long < west) {
                        west = this.item.eventsList[i].long;
                    }
                }
            }

            //Set default bounding box
            this.calculatedPoints[dayString] = 1;
            this.northWestBoundingBoxPoints[dayString] = new Microsoft.Maps.Location(north + .01, west - .01);
            this.southEastBoundingBoxPoints[dayString] = new Microsoft.Maps.Location(south - .01, east + .01);
            this.centerPoints[dayString] = new Microsoft.Maps.Location((north + south) / 2, (east + west) / 2);
        } 
        
        //Reset the map view
        this.map.setView({
            bounds:
                Microsoft.Maps.LocationRect.fromCorners
                (this.northWestBoundingBoxPoints[dayString],
                 this.southEastBoundingBoxPoints[dayString]),
            center:
                this.centerPoints[dayString]
        });
    };

    function showMiniDetailsNavArrows() {
        //Configure the previous arrow
        if (this.selectedEventId != this.currentViewFirstEventId) {
            this.show_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_previous_div"), "ONEUPGRID_details_content_mini_previous_div_click", true);
        }

        //Configure the next arrow
        if (this.selectedEventId != this.currentViewLastEventId) {
            this.show_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_next_div"), "ONEUPGRID_details_content_mini_next_div_click", true);
        }
    };

    function ONEUPGRID_mapnav_click(element) {
        //Only take an action if this isn't already the selected nav
        if (this.selectedNavButton != element.id || this.selectedNavButton == "ONEUPGRID_mapnav_all") {
            //Update the previously selected button
            //We don't do this if the previously selected one was the all button since that is never "selected"
            if (this.selectedNavButton != "ONEUPGRID_mapnav_all") {
                document.getElementById(this.selectedNavButton).classList.remove(this.selectedNavButton + "_selected");
                document.getElementById(this.selectedNavButton).classList.add(this.selectedNavButton);
            }

            this.selectedNavButton = element.id;

            //Update the new button
            if (this.selectedNavButton != "ONEUPGRID_mapnav_all") {
                document.getElementById(this.selectedNavButton).classList.remove(this.selectedNavButton);
                document.getElementById(this.selectedNavButton).classList.add(this.selectedNavButton + "_selected");
            } else {
                //Play animation
                WinJS.UI.executeAnimation(
                    document.getElementById("ONEUPGRID_mapnav_all"),
                    [
                        {
                            property: "color",
                            delay: 0,
                            duration: 125,
                            timing: "linear",
                            from: "white",
                            to: "#6d6d6d"
                        },
                        {
                            property: "background-color",
                            delay: 0,
                            duration: 125,
                            timing: "linear",
                            from: "#6d6d6d",
                            to: "white"
                        },
                        {
                            property: "color",
                            delay: 125,
                            duration: 125,
                            timing: "linear",
                            from: "#6d6d6d",
                            to: "white"
                        },
                        {
                            property: "background-color",
                            delay: 125,
                            duration: 125,
                            timing: "linear",
                            from: "white",
                            to: "#6d6d6d"
                        }
                    ]
                );
            }
            
            var selectedNavButtonDay = "";
            switch (this.selectedNavButton) {
                case "ONEUPGRID_mapnav_all":
                    //Note: It's very intentional that we don't change the selected 
                    //item here

                    selectedNavButtonDay = "all";

                    //Reset the map view
                    this.map.setView({
                        bounds:
                            Microsoft.Maps.LocationRect.fromCorners
                            (this.northWestBoundingBoxPoint,
                             this.southEastBoundingBoxPoint),
                        center:
                            this.centerPoint
                    });

                    //Set the first and last event ID for the current view
                    this.currentViewFirstEventId = 0;
                    this.currentViewLastEventId = this.item.eventsList.length - 1;

                    //Do the right thing with the arrows
                    this.showMiniDetailsNavArrows();

                    break;
                case "ONEUPGRID_mapnav_fri":
                    selectedNavButtonDay = "Friday";

                    //Select the first event on Friday
                    this.setSelectedEventId(this.item.eventsList[0].id);

                    //Reset the map view to Friday
                    this.resetMapView("Friday");

                    break;
                case "ONEUPGRID_mapnav_sat":
                    selectedNavButtonDay = "Saturday";

                    //Select the first event on Saturday
                    this.setSelectedEventId(this.getFirstEventOnDay("Saturday").id);

                    //Reset the map view to Saturday
                    this.resetMapView("Saturday");

                    break;
                case "ONEUPGRID_mapnav_sun":
                    selectedNavButtonDay = "Sunday";

                    //Select the first event on Saturday
                    this.setSelectedEventId(this.getFirstEventOnDay("Sunday").id);

                    //Reset the map view to Sunday
                    this.resetMapView("Sunday");

                    break;
            };

            //Do the day specific actions (things that don't apply to all)
            if (this.selectedNavButton != "ONEUPGRID_mapnav_all") {
                //Set the bounds for the first and last day (all is done in the switch statement above)
                this.currentViewFirstEventId = this.getFirstEventOnDay(selectedNavButtonDay).id;
                this.currentViewLastEventId = this.getLastEventOnDay(selectedNavButtonDay).id;

                //Transition the details bar
                this.transitionDetailsDiv(2);
            }

            //Determine what to do with the events
            for (var i = 0; i < this.map.entities.getLength() ; i++) {
                var tempEvent = this.getEventFromPushpinIndex(i);
                var isEventSelected = false;

                //Determine if the event is selected
                if(tempEvent.id == this.selectedEventId){
                    isEventSelected = true;
                }
                
                var ppoptions = "";
                if(selectedNavButtonDay == "all"){
                    //Everything gets shown
                    ppoptions = this.createPushPinOptions(tempEvent.id, tempEvent.day, isEventSelected, true);
                } else {
                    if(tempEvent.day == selectedNavButtonDay){
                        //Make sure it's shown
                        ppoptions = this.createPushPinOptions(tempEvent.id, tempEvent.day, isEventSelected, true);
                    } else {
                        //Make sure it's hidden
                        ppoptions = this.createPushPinOptions(tempEvent.id, tempEvent.day, isEventSelected, false);
                    }
                }

                this.map.entities.get(i).setOptions(ppoptions);
            }
        }       
    };

    function getMapDotDayClass(day) {
        switch (day) {
            case "Friday":
                return "ONEUPGRID_mapdot_friday";
                break;
            case "Saturday":
                return "ONEUPGRID_mapdot_saturday";
                break;
            case "Sunday":
                return "ONEUPGRID_mapdot_sunday";
                break;
        }
    };

    function createPushPinOptions(id, day, selected, visible) {
        var baseClass = "ONEUPGRID_mapdot";
        var zindex = 5;
        if (selected == true) {
            baseClass = "ONEUPGRID_mapdot_selected";
            zindex = 6;
        }

        var innerPushPinDivString = "<div class=\"ONEUPGRID_innermapdot " + Utilities.getIconClassFromWhatId(this.getEventById(id).category) + "\"></div>";
        var classString = baseClass + " " + this.getMapDotDayClass(day);
        var mapString = "<div class=\"" + classString
            + "\" id=\"ONEUPGRID_mapdot_" + id
            + "\">" + innerPushPinDivString + "</div>";
        return { width: null, height: null, htmlContent: mapString, zIndex: zindex, visible: visible };
    };

    function getEventFromPushpinIndex(temppushpinindex) {
        for (var i = 0; i < this.item.eventsList.length; i++) {
            if (temppushpinindex == this.item.eventsList[i].mappushpinindex) {
                return this.item.eventsList[i];
            }
        }

        return null;
    };

    //Handles clicking on a dot on the map
    function mapDotClick(e) {
        var clickedEvent = null;

        //Find the pushpin that matches the target, and then look up the matching event
        //TODO: We may be able to optimize this to assume the pushpin id always matches the event ID - something to look into
        for (var i = 0; i < AppGlobals.oneUpStateObject.map.entities.getLength() ; i++) {
            if (e.target == AppGlobals.oneUpStateObject.map.entities.get(i)) {
                clickedEvent = AppGlobals.oneUpStateObject.getEventFromPushpinIndex(i);
            }
        }

        if (clickedEvent != null) {
            //Set the new selected ID
            AppGlobals.oneUpStateObject.setSelectedEventId(clickedEvent.id);

            AppGlobals.oneUpStateObject.transitionDetailsDiv(2);
        } else {
            //TODO: Blow up
        }
    };

    //Assumption: The event list is already saved
    function InitializeMap() {

        //Clear the map
        this.map.entities.clear();

        //Need to set the ID of the last event in the current view
        this.currentViewLastEventId = this.item.eventsList.length - 1;

        //Position the day buttons
        var borderWidth = 20;
        var buttonSide = 75;

        var left = (window.innerWidth - borderWidth - buttonSide).toString() + "px";
        var suntop = window.innerHeight - borderWidth - buttonSide;
        var sattop = suntop - borderWidth - buttonSide;
        var fritop = sattop - borderWidth - buttonSide;
        var alltop = fritop - borderWidth - buttonSide;

        document.getElementById("ONEUPGRID_mapnav_all").style.left = left;
        document.getElementById("ONEUPGRID_mapnav_all").style.top = alltop.toString() + "px";
        this.AttachOnClick(document.getElementById("ONEUPGRID_mapnav_all"), "ONEUPGRID_mapnav_click");

        document.getElementById("ONEUPGRID_mapnav_fri").style.left = left;
        document.getElementById("ONEUPGRID_mapnav_fri").style.top = fritop.toString() + "px";
        this.AttachOnClick(document.getElementById("ONEUPGRID_mapnav_fri"), "ONEUPGRID_mapnav_click");

        document.getElementById("ONEUPGRID_mapnav_sat").style.left = left;
        document.getElementById("ONEUPGRID_mapnav_sat").style.top = sattop.toString() + "px";
        this.AttachOnClick(document.getElementById("ONEUPGRID_mapnav_sat"), "ONEUPGRID_mapnav_click");

        document.getElementById("ONEUPGRID_mapnav_sun").style.left = left;
        document.getElementById("ONEUPGRID_mapnav_sun").style.top = suntop.toString() + "px";
        this.AttachOnClick(document.getElementById("ONEUPGRID_mapnav_sun"), "ONEUPGRID_mapnav_click");

        //Position the dots
        var north = null;
        var south = null;
        var east = null;
        var west = null;
        for (var i = 0; i < this.item.eventsList.length; i++) {
            //Create and config the map dot
            var pushpinOptions = this.createPushPinOptions(this.item.eventsList[i].id, this.item.eventsList[i].day, false, true);
            var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(this.item.eventsList[i].lat, this.item.eventsList[i].long), pushpinOptions);
            var self = this;
            Microsoft.Maps.Events.addHandler(pushpin, 'click', self.mapDotClick);
            this.map.entities.push(pushpin);
            this.item.eventsList[i].mappushpinindex = this.map.entities.getLength() - 1;

            //Determine the impact on the bounding box
            if (north == null) {
                north = this.item.eventsList[i].lat;
            } else if (this.item.eventsList[i].lat > north) {
                north = this.item.eventsList[i].lat;
            }

            if (south == null) {
                south = this.item.eventsList[i].lat;
            } else if (this.item.eventsList[i].lat < south) {
                south = this.item.eventsList[i].lat;
            }

            if (east == null) {
                east = this.item.eventsList[i].long;
            } else if (this.item.eventsList[i].long > east) {
                east = this.item.eventsList[i].long;
            }

            if (west == null) {
                west = this.item.eventsList[i].long;
            } else if (this.item.eventsList[i].long < west) {
                west = this.item.eventsList[i].long;
            }
        }

        //Set default bounding box
        this.northWestBoundingBoxPoint = new Microsoft.Maps.Location(north+.01, west-.01);
        this.southEastBoundingBoxPoint = new Microsoft.Maps.Location(south-.01, east+.01);
        this.centerPoint = new Microsoft.Maps.Location((north+south)/2, (east+west)/2);

        //Set the map view based on the events in the itinerary
        this.map.setView({
            bounds:
                Microsoft.Maps.LocationRect.fromCorners
                (this.northWestBoundingBoxPoint,
                 this.southEastBoundingBoxPoint),
            center:
                this.centerPoint
        });
    };

    function clearMap() {
        this.map.entities.clear();
    };

    //Helper method for ONEUPGRID_details_close_div_click
    function clearDetailsDiv() {
        //Clear the tips
        document.getElementById("ONEUPGRID_details_tips_ul").innerHTML = "";

        //Clear the website
        for(var i = 0; i < document.getElementById("ONEUPGRID_details_title_div").childNodes.length; i++){
            if(document.getElementById("ONEUPGRID_details_title_div").childNodes[i].id == "ONEUPGRID_details_website"){
                document.getElementById("ONEUPGRID_details_title_div").removeChild(document.getElementById("ONEUPGRID_details_website"));
            }
        }

        //Clear the tip actions
        document.getElementById("ONEUPGRID_details_tips_actions_div").innerHTML = "";
    };

    function ONEUPGRID_details_close_div_click(shouldPreserveSelectedEventId) {
        if (this.mapInView == true) {
            this.transitionDetailsDiv(2);
        } else {
            if (shouldPreserveSelectedEventId != true) {
                //Unset the selectedEventId
                this.unsetSelectedEventId();
            }
            
            //Set the details div state
            this.detailsDivState = 0;

            //Hide the details div
            var height = (window.innerHeight - 80) * .11625 * 4;
            document.getElementById("ONEUPGRID_details").style.top = (-height).toString() + "px";
        }
    };

    function configureUI() {
        this.returnElementsToOriginalPosition();
    };

    function returnElementsToOriginalPosition() {
        var height = (window.innerHeight - 80) * .11625 * 4; //Calculation: The height of the entire flyout

        //Configure ONEUPGRID_details
        document.getElementById("ONEUPGRID_details").style.width = (window.innerWidth).toString() + "px";
        document.getElementById("ONEUPGRID_details").style.height = height.toString() + "px";
        document.getElementById("ONEUPGRID_details").style.top = (-height).toString() + "px";

        //Make sure the map is the correct width
        if (this.map != null) {
            this.map.setOptions({width: window.innerWidth});
        }
    };

    function configureDetailsDiv() {
        var height = (window.innerHeight - 80) * .11625 * 4; //Calculation: The height of the entire flyout
        var functionalContentWidth = window.innerWidth - 30; //Calculation: -30 for the 15 padding on each side
        var functionalContentHeight = height - 30 - 15; //Calculation: 30 for the close div, 15 for the top padding

        //Configure ONEUPGRID_details
        document.getElementById("ONEUPGRID_details").style.width = (window.innerWidth).toString() + "px";
        document.getElementById("ONEUPGRID_details").style.height = height.toString() + "px";
        document.getElementById("ONEUPGRID_details").style.top = (-height).toString() + "px";

        //Set the opacity and the display
        document.getElementById("ONEUPGRID_details").style.opacity = "1";
        document.getElementById("ONEUPGRID_details").style.display = "-ms-flexbox";

        //Configure ONEUPGRID_details_content_div
        var contentDiv = document.getElementById("ONEUPGRID_details_content_div");
        contentDiv.style.height = functionalContentHeight.toString() + "px";
        contentDiv.style.width = functionalContentWidth.toString() + "px";
        
        //Add the click hanlder for the "View Map" button in the title
        this.AttachOnClick(document.getElementById("ONEUPGRID_details_viewonmap_div"), "ONEUPGRID_details_title_map_click");

        //Configure ONEUPGRID_details_categorycost_div
        var catcostdivswidth = functionalContentWidth / 2 - 20; //The divide by two is because it's only half.  The minus 20 is for a padding on the right
        document.getElementById("ONEUPGRID_details_categorycost_div").style.width = catcostdivswidth.toString() + "px";
        document.getElementById("ONEUPGRID_details_category_div").style.width = ((catcostdivswidth/2)-5).toString() + "px";
        document.getElementById("ONEUPGRID_details_cost_div").style.width = (catcostdivswidth/2).toString() + "px";

        //Congfigure the tips div
        document.getElementById("ONEUPGRID_details_tips_div").width = (functionalContentWidth / 2).toString() + "px"
        document.getElementById("ONEUPGRID_details_tips_author_title").innerHTML = this.author.name + "'s Tips";
        document.getElementById("ONEUPGRID_details_tips_author_picture").style.backgroundImage = this.author.imageUrl;

        //Configure the close div
        document.getElementById("ONEUPGRID_details_close_div").classList.add("icon-chevron-up");
        document.getElementById("ONEUPGRID_details_close_div").classList.add("icon-2x");
        document.getElementById("ONEUPGRID_details_close_div").style.height = "30px";
        this.AttachOnClick(document.getElementById("ONEUPGRID_details_close_div"), "ONEUPGRID_details_close_div_click");
    };

    function configureAppBar() {
        //Enable the app bar
        document.getElementById("theAppBar").winControl.disabled = false;

        //Enable the commands we care about
        appBarManager.showOneUpCommands("Itinerary", this.loadSource);
    };

    function handleLoadCode(tempItem, source) {
        //Reset the state
        this.reset();

        //Set the current state
        Controller.setCurrentState(this);

        //Save the current item
        this.item = tempItem;

        //Save the load source
        this.loadSource = source;

        //Configure the appBar
        this.configureAppBar();

        //Save the author
        this.author = Utilities.authorFactory(this.item.authorId);

        //Hide the RESULTSGRID
        document.getElementById("RESULTSGRID").style.top = (-window.innerHeight).toString() + "px";
        document.getElementById("RESULTSGRID").style.opacity = "0";

        //Build the one-up view
        this.RESULTSGRID_buildoneupview(this.item);

        //Populate the map
        this.InitializeMap();

        //Configure the details div
        this.configureDetailsDiv();

        //Ensure the itinerary is shown, not the map
        document.getElementById("ONEUPGRID_itinerary").style.left = "0px";
        document.getElementById("ONEUPGRID_itinerary").style.opacity = "1";
        document.getElementById("ONEUPGRID_map").style.left = window.innerWidth + "px";
        document.getElementById("ONEUPGRID_map").style.opacity = "0";

        //Show the one-up view + header
        document.getElementById("ONEUPGRID_header").style.top = "0px";
        document.getElementById("ONEUPGRID_header").style.display = "-ms-flexbox";
        document.getElementById("ONEUPGRID_header").style.opacity = "1";
        document.getElementById("ONEUPGRID").style.display = "-ms-flexbox";
        document.getElementById("ONEUPGRID").style.opacity = "1";
    };

    function handleLoad_nonWorker(tempItem, source) {
        this.handleLoadCode(tempItem, source);
    };

    function handleLoad(event, worker) {
        this.handleLoadCode(event.data.response, event.data.source);
    };

    function drawHeader(item) {
        //Configure Header - LEFT
        document.getElementById("ONEUPGRID_header_left_h2").innerText = "in " + item.location;

        //Configure Header - CENTER
        document.getElementById("ONEUPGRID_header_center_h1").innerText = item.title;

        //Configure Header - RIGHT
        /* WHO */ Utilities.buildWhoHorizontalLayout(document.getElementById("ONEUPGRID_header_who"), item.who);
        /* HOWMUCH */ document.getElementById("ONEUPGRID_header_howmuch").innerText = item.howmuch;
        //TODO - WHEN (Use the $2 icons from creative market)
    };

    function drawGrid() {
        //Caculation: The viewable area of the grid (from the top line
        //to the bottom of the day titles), is the height of the screen
        //minus 80 px (75 for the header, 5 for the padding)
        var gridHeight = window.innerHeight - 80;

        //Calculation: The total area (including border and padding) of each
        //row in the grid is 10.625%.  1px border at the top, 5px padding at the top
        var elementsArray = document.getElementsByClassName("ONEUPGRID_contentgrid_div");
        for (var i = 0; i < elementsArray.length; i++) {
            elementsArray[i].style.height = ((gridHeight * .11625) - 5 - 1).toString() + "px";
        }

        //Calculation: For each day title at the bottom, the width is 30% of the screen
        elementsArray = document.getElementsByClassName("ONEUPGRID_contentgrid_daytitle_div");
        for (var i = 0; i < elementsArray.length; i++) {
            elementsArray[i].style.width = (window.innerWidth * .3).toString() + "px";
        }

        //Calculation: For the day titles at the bottom, left position each one of them in the following way...
        //Friday: leftIndent
        //Saturday: leftIndent + 30% of window width
        //Sunday: leftIndent + 60% of window width
        var leftIndent = window.innerWidth * .10;
        document.getElementById("ONEUPGRID_contentgrid_friday").style.left = leftIndent.toString() + "px";
        document.getElementById("ONEUPGRID_contentgrid_saturday").style.left = (leftIndent + (window.innerWidth * .3)).toString() + "px";
        document.getElementById("ONEUPGRID_contentgrid_sunday").style.left = (leftIndent + ((window.innerWidth * .3) * 2)).toString() + "px";
        document.getElementById("ONEUPGRID_contentgrid_friday").style.color = "#88d8f5";
        document.getElementById("ONEUPGRID_contentgrid_saturday").style.color = "#93ea58";
        document.getElementById("ONEUPGRID_contentgrid_sunday").style.color = "#f7a373";

        //Caculation: For the day titles at the bottom, need to give them a height
        //Top: 93% of grid height
        elementsArray = document.getElementsByClassName("ONEUPGRID_contentgrid_daytitles_div");
        for (var i = 0; i < elementsArray.length; i++) {
            elementsArray[i].style.top = (gridHeight * .93).toString() + "px";
        }
    };

    //Helper function for RESULTSGIRD_details_button_click
    function RESULTSGRID_buildoneupview(item) {
        //Draw the ONEUP header
        this.drawHeader(item);

        //Draw the time grid and day headers
        this.drawGrid();

        //Draw the elements on the screen
        this.drawEvents(item.eventsList);

        //Set the size of the ONEUPGRID_itinerary
        document.getElementById("ONEUPGRID_itinerary").style.height = (window.innerHeight - 75).toString() + "px";
        document.getElementById("ONEUPGRID_itinerary").style.paddingTop = "80px";
    };

    function drawEvents(eventsList) {
        var oneUpGridElement = document.getElementById("ONEUPGRID_itinerary");

        //For each of the events in the events list
        for (var i = 0; i < eventsList.length; i++) {
            //Create the event div
            var tempElement = document.createElement("div");
            tempElement.classList.add("ONEUPGRID_itinerary_event");
            tempElement.id = "ONEUPGRID_itinerary_event_" + i.toString();
            this.AttachOnClick(tempElement, "ONEUPGRID_itinerary_event_click");

            switch (eventsList[i].day) {
                case "Friday":
                    tempElement.classList.add("ONEUPGRID_itinerary_event_Friday");
                    break;
                case "Saturday":
                    tempElement.classList.add("ONEUPGRID_itinerary_event_Saturday");
                    break;
                case "Sunday":
                    tempElement.classList.add("ONEUPGRID_itinerary_event_Sunday");
                    break;
            };

            //Create the left div
            var tempLeftElement = document.createElement("div");
            tempLeftElement.classList.add("ONEUPGRID_itinerary_event_left");
            tempLeftElement.id = "ONEUPGRID_itinerary_leftevent_" + i.toString();

            //Create the event title
            var tempH1 = document.createElement("h1");
            tempH1.classList.add("ONEUPGRID_itinerary_event_h1");
            tempH1.innerText = eventsList[i].title;
            tempLeftElement.appendChild(tempH1);

            //Create the dash
            var tempH3 = document.createElement("h3");
            tempH3.classList.add("ONEUPGRID_itinerary_event_h3");
            tempH3.innerText = "-";
            tempLeftElement.appendChild(tempH3);

            //Create the icon
            var tempCatIconDiv = document.createElement("div");
            tempCatIconDiv.classList.add("ONEUPGRID_itinerary_event_catIconDiv");
            tempCatIconDiv.classList.add(Utilities.getIconClassFromWhatId(eventsList[i].category));
            tempLeftElement.appendChild(tempCatIconDiv);

            //Create the right div
            var tempRightElement = document.createElement("div");
            tempRightElement.classList.add("ONEUPGRID_itinerary_event_right");
            tempRightElement.id = "ONEUPGRID_itinerary_rightevent_" + i.toString();
            
            //Create the ...
            var tempRightH2 = document.createElement("h2");
            tempRightH2.classList.add("ONEUPGRID_itinerary_event_h2");
            tempRightH2.innerText = "...";
            tempRightElement.appendChild(tempRightH2);

            //Add the left and right boxes to the event element
            tempElement.appendChild(tempLeftElement);
            tempElement.appendChild(tempRightElement);

            //Add the event to the itinerary and position it
            document.getElementById("ONEUPGRID_itinerary").appendChild(tempElement);
            this.setPositionByTime(tempElement, eventsList[i].starttime, eventsList[i].endtime, eventsList[i].day);

        }
    };

    //Correctly positions the event and sets height/width
    function setPositionByTime(element, starttime, endtime, day) {
        var gridHeight = window.innerHeight - 80;
        var hourHeight = (gridHeight * .11625) / 2;
        
        //SET THE TOP
        element.style.top = (80 + (hourHeight * (starttime - 8)) + 5).toString() + "px";

        //SET THE HEIGHT
        //Calculation: The -10 is for the 5px margin on top and bottom, the -2 is
        //for the top and bottom border (1px each)
        element.style.height = (((endtime-starttime)*hourHeight) - 10 - 2).toString() + "px";

        //SET THE LEFT
        var leftIndent = (window.innerWidth * .10) + 5.0;
        var rowWidth = (window.innerWidth * .3);
        if (day == "Friday") {
            element.style.left = leftIndent.toString() + "px";
        } else if (day == "Saturday") {
            element.style.left = (leftIndent + rowWidth).toString() + "px";
        } else if (day == "Sunday") {
            element.style.left = (leftIndent + (rowWidth * 2.0)).toString() + "px";
        }

        //SET THE WIDTH
        //Calculation: The -10 is for the 5px margin on the right and left,
        //the -2 is for the right and left border
        element.style.width = (rowWidth - 10 - 2).toString() + "px";
    };

    //Member function to get an element by id
    function getEventById(id) {
        for (var i = 0; i < this.item.eventsList.length; i++) {
            if (this.item.eventsList[i].id.toString() == id) {
                return this.item.eventsList[i];
            }
        }

        return null;
    };

    //Member function to populate the details div for a particular event
    //Note: This is for showing the eventDetails for the full event
    function showEventDetails(event) {
        //Clear the details div
        this.clearDetailsDiv();

        //Show the details div
        document.getElementById("ONEUPGRID_details").style.top = "75px";

        //Set the details div state
        this.detailsDivState = 1;

        //Populate the Title div details - title, location, and map div
        document.getElementById("ONEUPGRID_details_title_h1").innerText = event.title;
        document.getElementById("ONEUPGRID_details_title_h2").innerText = event.location1 + ", " + event.location2;

        //Populate the Info Div
        document.getElementById("ONEUPGRID_details_category_div").innerHTML = "<b>Category: </b>" + Utilities.getCategoryStringFromId(event.category);
        document.getElementById("ONEUPGRID_details_cost_div").innerHTML = "<b>Cost: </b>" + event.cost;
        document.getElementById("ONEUPGRID_details_transportation_div").innerHTML = "<b>Getting There: </b>" + event.transportation;
        document.getElementById("ONEUPGRID_details_description_div").innerHTML = event.description;

        //Populate the Tips Div
        var tipsListElement = document.getElementById("ONEUPGRID_details_tips_ul");

        //For each tip
        for (var i = 0; i < this.getEventById(this.selectedEventId).tips.length; i++) {
            var tempLi = document.createElement("li");
            tempLi.innerText = this.getEventById(this.selectedEventId).tips[i];
            tipsListElement.appendChild(tempLi);
        }

        //Populate the Third Party Tip Providers
        this.populateTipsActions();

        //If necessary, populate the website link
        if (this.getEventById(this.selectedEventId).website != null) {
            var websiteButton = document.createElement("div");
            websiteButton.id = "ONEUPGRID_details_website";
            websiteButton.classList.add("ONEUPGRID_details_title_action_div");
            websiteButton.innerText = "View Website";
            document.getElementById("ONEUPGRID_details_title_div").appendChild(websiteButton);
            this.AttachOnClick(websiteButton, "ONEUPGRID_details_actions_link_click");
        }
    };

    function populateTipsActions() {
        //Check to make sure there are more tips
        if (this.getEventById(this.selectedEventId).moreTips.length > 0) {
            //Add in the header text
            var infoText = document.createElement("h1");
            infoText.innerText = "Learn More:";
            document.getElementById("ONEUPGRID_details_tips_actions_div").appendChild(infoText);

            //For each tip provider, show the logo and set the click handler
            for (var i = 0; i < this.getEventById(this.selectedEventId).moreTips.length; i++){
                var tempTipLogo = document.createElement("div");

                //Get the Tip ID
                var tipID = this.getEventById(this.selectedEventId).moreTips[i].tipProvider;

                //Set the ID on the element (needed for the click handler)
                tempTipLogo.id = "ONEUPGRID_details_tip_logo_" + tipID;

                //Set the visual styles
                tempTipLogo.style.backgroundImage = Utilities.getTipProvider(tipID).url;
                tempTipLogo.style.width = Utilities.getTipProvider(tipID).widthPixelString;

                //Set the click handler
                this.AttachOnClick(tempTipLogo, "ONEUPGRID_details_actions_link_click");

                //Append to the parent 
                document.getElementById("ONEUPGRID_details_tips_actions_div").appendChild(tempTipLogo);
            }

        }
    };

    function getEventElementById(id) {
        return document.getElementById("ONEUPGRID_itinerary_event_" + id.toString());
    };

    //Switch the style of the event - used when moving from
    //selected to unselected mode (usually due to tapping on an event
    //or closing the details box)
    function switchEventStyle(element) {
        //This is a hack, but it works: walk through all
        //the classes on the element - if one of the ends in
        //"_selected", we know we've found an element that needs
        //to be changed to non-selected mode (and vice versa)
        var pattern = /_selected$/;
        var selected = false;
        for (var i = 0; i < element.classList.length; i++) {
            if(pattern.test(element.classList[i])){
                selected = true;
                break;
            }
        }

        var baseString = "";
        switch (this.getEventById(element.id.split("_")[3]).day) {
            case "Friday":
                baseString = "ONEUPGRID_itinerary_event_Friday";
                break;
            case "Saturday":
                baseString = "ONEUPGRID_itinerary_event_Saturday";
                break;
            case "Sunday":
                baseString = "ONEUPGRID_itinerary_event_Sunday";
                break;
        }

        if (selected == true) {      
            //The current element is selected - make it unselected
            element.classList.remove(baseString + "_selected");
            element.classList.add(baseString);
        } else {
            //The current element is unselected - make it selected
            element.classList.remove(baseString);
            element.classList.add(baseString + "_selected");
        }
    };

    //Clear the currently selectedEventId and unstyle the event
    function unsetSelectedEventId() {
        //If something was previously selected
        if (this.selectedEventId != null) {
            //Change the event style on the itinerary
            this.switchEventStyle(this.getEventElementById(this.selectedEventId));

            //Reset the map point
            //TODO: Use createPushPinOptions instead
            var pushpinoptions = this.createPushPinOptions(this.selectedEventId, this.getEventById(this.selectedEventId).day, false, true);
            this.map.entities.get(this.getEventById(this.selectedEventId).mappushpinindex).setOptions(pushpinoptions);
        }

        this.selectedEventId = null;
    };

    //Changes the currently selectedId (and sets the style of the events)
    function setSelectedEventId(id) {
        //If the current event ID is not null, we need to
        //reset the style of the currently selected event.
        //If it's null, it means an event wasn't previously selected
        if (this.selectedEventId != null) {
            this.switchEventStyle(this.getEventElementById(this.selectedEventId));

            //TODO: Use createPushPinOptions instead
            var pushpinoptions = this.createPushPinOptions(this.selectedEventId, this.getEventById(this.selectedEventId).day, false, true);
            this.map.entities.get(this.getEventById(this.selectedEventId).mappushpinindex).setOptions(pushpinoptions);
        }

        //Set the selectedEventID to the new id
        this.selectedEventId = id;

        //Set the style of the new element
        this.switchEventStyle(this.getEventElementById(this.selectedEventId));

        //Put the point on the map into selected mode
        //TODO: Use createPushPinOptions instead
        var pushpinoptions = this.createPushPinOptions(this.selectedEventId, this.getEventById(this.selectedEventId).day, true, true);
        this.map.entities.get(this.getEventById(this.selectedEventId).mappushpinindex).setOptions(pushpinoptions);
    };

    //Handles when the user clicks on an event from itinerary view
    function ONEUPGRID_itinerary_event_click(element) {
        var event = this.getEventById(element.id.split("_")[3].toString());

        //Set the current event
        this.setSelectedEventId(element.id.split("_")[3].toString());

        //Show the details
        if (event != null) {
            //Make sure that the mini div is hidden, and the full div is shown
            var full = document.getElementById("ONEUPGRID_details_content_full_div");
            var mini = document.getElementById("ONEUPGRID_details_content_mini_div");

            full.style.opacity = "1";
            full.style.display = "block";
            mini.style.opacity = "0";
            mini.style.display = "none";
  
            document.getElementById("ONEUPGRID_details").style.height = ((window.innerHeight - 80) * .11625 * 4).toString() + "px"

            this.showEventDetails(event);
        } else {
            //TODO: Make the world blow up
        }
    };

    function ONEUPGRID_details_actions_link_click(element) {
        var uriToLaunch = "";

        //Possible Formats Handled:
        //ONEUPGRID_details_tip_logo_#
        //ONEUPGRID_details_website (the ID is implied from the selected event ID -> only one website
        if (element.id.split("_")[2] == "website") {
            //It's a website click
            uriToLaunch = this.getEventById(this.selectedEventId).website;
        } else {
            //It's a logo click
            var tipProviderID = element.id.split("_")[4];
            
            for (var i = 0; i < this.getEventById(this.selectedEventId).moreTips.length; i++){
                if (this.getEventById(this.selectedEventId).moreTips[i].tipProvider.toString() == tipProviderID) {
                    uriToLaunch = this.getEventById(this.selectedEventId).moreTips[i].url;
                }
            }
        }

        // Create a Uri object from a URI string 
        var uri = new Windows.Foundation.Uri(uriToLaunch);

        // Launch the URI
        Windows.System.Launcher.launchUriAsync(uri);
    };

    function positionMapEventZoomView() {
        this.map.setView({
            center: new Microsoft.Maps.Location(this.getEventById(this.selectedEventId).lat, this.getEventById(this.selectedEventId).long),
            zoom: 15
        });
    };

    function ONEUPGRID_details_title_map_click(element) {
        //Center the map on the point
        this.positionMapEventZoomView();

        //Do the generic transition configurations
        this.viewTransition("Map", 2);

        //Show the map
        document.getElementById("ONEUPGRID_map").style.display = "-ms-flexbox";

        //Show the map
        this.showMap();
    };

    function showItinerary() {
        //Hide the Map Nav Buttons
        var buttonArray = [
                    document.getElementById("ONEUPGRID_mapnav_all"),
                    document.getElementById("ONEUPGRID_mapnav_fri"),
                    document.getElementById("ONEUPGRID_mapnav_sat"),
                    document.getElementById("ONEUPGRID_mapnav_sun")
        ];

        WinJS.UI.executeTransition(
            buttonArray,
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
        ).done(
            function() {
                for (var i = 0; i < buttonArray.length; i++) {
                    buttonArray[i].style.display = "none";
                }
            }
        );

        //Hide the map
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_map"),
            [
                {
                    property: "left",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: "0px",
                    to: window.innerWidth.toString() + "px"
                },
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 1,
                    to: 0
                }
            ]
        );

        //Show the itinerary
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_itinerary"),
            [
                {
                    property: "left",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: (-window.innerWidth).toString() + "px",
                    to: "0px"
                },
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 0,
                    to: 1
                }
            ]
        );
    };

    function showMap() {
        //Hide the itinerary
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_itinerary"),
            [
                {
                    property: "left",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: "0px",
                    to: (-window.innerWidth).toString() + "px"
                },
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 1,
                    to: 0
                }
            ]
        );

        //Show the map
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_map"),
            [
                {
                    property: "left",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: window.innerWidth.toString() + "px",
                    to: "0px"
                },
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 0,
                    to: 1
                }
            ]
        ).done(
            function () {
                var buttonArray = [
                    document.getElementById("ONEUPGRID_mapnav_all"),
                    document.getElementById("ONEUPGRID_mapnav_fri"),
                    document.getElementById("ONEUPGRID_mapnav_sat"),
                    document.getElementById("ONEUPGRID_mapnav_sun")
                ];

                //Set the display on each button
                for (var i = 0; i < buttonArray.length; i++) {
                    buttonArray[i].style.opacity = "1";
                    buttonArray[i].style.display = "-ms-flexbox";
                }

                //Animate the opacity
                WinJS.UI.executeTransition(
                    buttonArray,
                    [
                        {
                            property: "opacity",
                            delay: 0,
                            duration: 250,
                            timing: "linear",
                            from: 0,
                            to: 1
                        }
                    ]
                );
            }
        );
    };

    function hide_ONEUPGRID_details_content_mini_nav_div(element, animate) {
        if (animate == true) {
            WinJS.UI.executeTransition(
                element,
                [
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 250,
                        timing: "linear",
                        from: 1,
                        to: 0
                    }
                ]
            ).done(
                function () {
                    //Remove the click handler
                    element.onclick = null;
                    element.style.cursor = "auto";
                }
            );
        } else {
            element.style.opacity = "0";
            element.onclick = null;
            element.style.cursor = "auto";
        }
    };

    function show_ONEUPGRID_details_content_mini_nav_div(element, clickHandler, animate) {
        var self = this;
        if (animate == true) {
            WinJS.UI.executeTransition(
                element,
                [
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 250,
                        timing: "linear",
                        from: 1,
                        to: 1
                    }
                ]
            ).done(
                function () {
                    //Remove the click handler
                    self.AttachOnClick(element, clickHandler);
                    element.style.cursor = "pointer";
                }
            );
        } else {
            element.style.opacity = "1";
            this.AttachOnClick(element, clickHandler);
            element.style.cursor = "pointer";
        }
    };

    function rePopulateMiniDetailsTitleWithAnimation() {
        var self = this;
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details_content_mini_title_div"),
            [
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 1,
                    to: 0
                }
            ]
        ).done(
            function () {
                //Populate the title with new values
                self.populateDetailsMiniDivTitle();

                //Fade in the minibar content
                WinJS.UI.executeTransition(
                    document.getElementById("ONEUPGRID_details_content_mini_title_div"),
                    [
                        {
                            property: "opacity",
                            delay: 0,
                            duration: 250,
                            timing: "linear",
                            from: 0,
                            to: 1
                        }
                    ]
                );
            }
        );
    };

    function ONEUPGRID_details_content_mini_previous_div_click() {
        this.setSelectedEventId(this.selectedEventId - 1);

        //If clicking previous brought us to the first event in the itinerary, we need to hide the previous button
        if (this.selectedEventId == this.currentViewFirstEventId) {
            this.hide_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_previous_div"), true);
        }

        //If clicking the previous button brought us to the second-to-last event in the itinerary, we need to show the next button
        if (this.selectedEventId == (this.currentViewLastEventId - 1)) {
            this.show_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_next_div"), "ONEUPGRID_details_content_mini_next_div_click", true);
        }

        //Fade out the minibar title content
        this.rePopulateMiniDetailsTitleWithAnimation();

        //Reposition the map
        this.positionMapEventZoomView();
    };

    function ONEUPGRID_details_content_mini_next_div_click() {
        this.setSelectedEventId(Number(this.selectedEventId) + 1);

        //If clicking previous brought us to the second event in the itinerary, we need to show the previous button
        if (this.selectedEventId == (this.currentViewFirstEventId + 1)) {
            this.show_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_previous_div"), "ONEUPGRID_details_content_mini_previous_div_click", true);
        }

        //If clicking the previous button brought us to the last event in the itinerary, we need to hide the next button
        if (this.selectedEventId == this.currentViewLastEventId) {
            this.hide_ONEUPGRID_details_content_mini_nav_div(document.getElementById("ONEUPGRID_details_content_mini_next_div"), true);
        }

        //Fade out the minibar title content
        this.rePopulateMiniDetailsTitleWithAnimation();

        //Reposition the map
        this.positionMapEventZoomView();
    };

    function ONEUPGRID_details_content_mini_details_button_click() {
        //Transition from mini to full
        this.transitionDetailsMiniToFull();
    };

    function ONEUPGRID_details_content_mini_directions_button_click() {

    };

    function populateDetailsMiniDivTitle() {
        document.getElementById("ONEUPGRID_details_content_mini_title_h1").innerText = this.getEventById(this.selectedEventId).title;
        document.getElementById("ONEUPGRID_details_content_mini_title_h2").innerText = this.getEventById(this.selectedEventId).location1 + ", " + this.getEventById(this.selectedEventId).location2;
        document.getElementById("ONEUPGRID_details_content_mini_title_h3").innerText = this.getEventById(this.selectedEventId).day
            + " "
            + Utilities.getTimeStringFromNumericValue(this.getEventById(this.selectedEventId).starttime)
            + "-"
            + Utilities.getTimeStringFromNumericValue(this.getEventById(this.selectedEventId).endtime);
    };

    function configureAndPopulateMiniDiv() {
        //Set the details div state to be mini
        this.detailsDivState = 2;

        //Configure the button handlers
        this.AttachOnClick(document.getElementById("ONEUPGRID_details_content_mini_details_button"), "ONEUPGRID_details_content_mini_details_button_click");
        //this.AttachOnClick(document.getElementById("ONEUPGRID_details_content_mini_directions_button"), "ONEUPGRID_details_content_mini_directions_button_click");

        //Configure the Navigation Buttons
        document.getElementById("ONEUPGRID_details_content_mini_previous_div").classList.add("icon-chevron-left");
        document.getElementById("ONEUPGRID_details_content_mini_previous_div").classList.add("icon-2x");
        this.AttachOnClick(document.getElementById("ONEUPGRID_details_content_mini_previous_div"), "ONEUPGRID_details_content_mini_previous_div_click");

        document.getElementById("ONEUPGRID_details_content_mini_next_div").classList.add("icon-chevron-right");
        document.getElementById("ONEUPGRID_details_content_mini_next_div").classList.add("icon-2x");
        this.AttachOnClick(document.getElementById("ONEUPGRID_details_content_mini_next_div"), "ONEUPGRID_details_content_mini_next_div_click");

        //Configure the widths
        document.getElementById("ONEUPGRID_details_content_mini_previous_div").style.width = "75px";
        document.getElementById("ONEUPGRID_details_content_mini_next_div").style.width = "75px";
        var majorDivWidth = (window.innerWidth - 20 - (75 * 2)) / 2; // 20 for the padding on the edges, 67 for each nav div
        document.getElementById("ONEUPGRID_details_content_mini_title_div").style.width = majorDivWidth.toString() + "px";
        document.getElementById("ONEUPGRID_details_content_mini_buttoncontainer_div").style.width = majorDivWidth.toString() + "px";

        //Populate the text
        this.populateDetailsMiniDivTitle();

        //Configure the previous and next buttons
        if (this.selectedEventId == 0) {
            var element = document.getElementById("ONEUPGRID_details_content_mini_previous_div");
            this.hide_ONEUPGRID_details_content_mini_nav_div(element, false);
        } else if (this.selectedEventId == (this.item.eventsList.length - 1)) {
            var element = document.getElementById("ONEUPGRID_details_content_mini_next_div");
            this.hide_ONEUPGRID_details_content_mini_nav_div(element, false);
        }
    }

    function transitionDetailsCloseToMini() {
        this.detailsDivState = 2;

        this.configureAndPopulateMiniDiv();

        //Hide the full div
        document.getElementById("ONEUPGRID_details_content_full_div").style.display = "none";
        document.getElementById("ONEUPGRID_details_content_full_div").style.opacity = "0";

        //Show the mini div
        document.getElementById("ONEUPGRID_details_content_mini_div").style.display = "-ms-flexbox";
        document.getElementById("ONEUPGRID_details_content_mini_div").style.opacity = "1";
        
        //Set the height on the details div
        document.getElementById("ONEUPGRID_details").style.height = "100px";

        //Move the position of the details div
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details"),
            [
                {
                    property: "top",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: document.getElementById("ONEUPGRID_details").style.height.toString() + "px",
                    to: "75px"
                }
            ]
        );
    };

    function transitionDetailsMiniToFull(){
        this.showEventDetails(this.getEventById(this.selectedEventId));

        //Hide the mini div
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details_content_mini_div"),
            [
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 1,
                    to: 0
                }
            ]
        );

        //Resize the details box
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details"),
            [
                {
                    property: "height",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: "100px",
                    to: ((window.innerHeight - 80) * .11625 * 4).toString() + "px"
                }
            ]
        ).done(
            function () {
                //Hide the mini div
                document.getElementById("ONEUPGRID_details_content_mini_div").style.display = "none";

                //Animate in the full div
                document.getElementById("ONEUPGRID_details_content_full_div").style.display = "block";
                WinJS.UI.executeTransition(
                    document.getElementById("ONEUPGRID_details_content_full_div"),
                    [
                        {
                            property: "opacity",
                            delay: 0,
                            duration: 250,
                            timing: "linear",
                            from: 0,
                            to: 1
                        }
                    ]
                );
            }
        );
    }

    //Assumption: We've already set the selected ID to the new one
    function transitionDetailsMiniToMini() {
        this.rePopulateMiniDetailsTitleWithAnimation();

        //Do the right thing with the next and previous arrows
        var element = document.getElementById("ONEUPGRID_details_content_mini_previous_div");
        if (this.selectedEventId == this.currentViewFirstEventId) {
            this.hide_ONEUPGRID_details_content_mini_nav_div(element, false);
        }

        element = document.getElementById("ONEUPGRID_details_content_mini_next_div");
        if (this.selectedEventId == this.currentViewLastEventId) {
            this.hide_ONEUPGRID_details_content_mini_nav_div(element, false);
        }

        this.showMiniDetailsNavArrows();
    };

    function transitionDetailsFullToMini() {
        //Configure and Populate the mini div
        this.configureAndPopulateMiniDiv();

        //Hide the full div
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details_content_full_div"),
            [
                {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: 1,
                    to: 0
                }
            ]
        );

        //Resize the details box
        WinJS.UI.executeTransition(
            document.getElementById("ONEUPGRID_details"),
            [
                {
                    property: "height",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    from: document.getElementById("ONEUPGRID_details").style.height.toString() + "px",
                    to: "100px"
                }
            ]
        ).done(
            function () {
                //Hide the full div
                document.getElementById("ONEUPGRID_details_content_full_div").style.display = "none";

                //Animate in the mini div
                document.getElementById("ONEUPGRID_details_content_mini_div").style.display = "-ms-flexbox";
                WinJS.UI.executeTransition(
                    document.getElementById("ONEUPGRID_details_content_mini_div"),
                    [
                        {
                            property: "opacity",
                            delay: 0,
                            duration: 250,
                            timing: "linear",
                            from: 0,
                            to: 1
                        }
                    ]
                );
            }
        );
    };

    //There are 6 valid transitions
    //1. OPEN->CLOSE (1->0)
    //2. OPEN->MINI  (1->2)
    //3. MINI->OPEN  (2->1)
    //4. MINI->CLOSE (2->0)
    //5. CLOSE->OPEN (0->1)
    //6. CLOSE->MINI (0->2)
    //FinalDetailsState: 0=closed, 1=full, 2=mini
    function transitionDetailsDiv(finalDetailsState, shouldPreserveSelectedId) {
        switch(this.detailsDivState){
            case 0:
                if (finalDetailsState == 1) { //CLOSE->OPEN

                } else if (finalDetailsState == 2) { //CLOSE->MINI
                    this.transitionDetailsCloseToMini();
                }
                break;
            case 1:
                if (finalDetailsState == 0) { //OPEN->CLOSE
                    //If the details drawer is open, close it
                    this.ONEUPGRID_details_close_div_click();
                } else if (finalDetailsState == 2) { //OPEN->MINI
                    this.transitionDetailsFullToMini();
                }
                break;
            case 2:
                if (finalDetailsState == 0) { //MINI->CLOSE
                    //If the details drawer is open, close it
                    this.ONEUPGRID_details_close_div_click(shouldPreserveSelectedId);
                } else if (finalDetailsState == 1) { //MINI->OPEN

                } else if (finalDetailsState == 2) { //MINI->MINI
                    this.transitionDetailsMiniToMini();
                }
                break;
        }
    }

    //FinalDetailsState: 0=closed, 1=full, 2=mini
    function viewTransition(appBarButtonsView, finalDetailsState) {
        //Determine if we are in the map or not
        if (appBarButtonsView == "Map") {
            this.mapInView = true;
        } else {
            this.mapInView = false;
        }

        //Transition Details
        this.transitionDetailsDiv(finalDetailsState, true);

        //Hide App Bar (but don't disable it)
        document.getElementById("theAppBar").winControl.hide();

        //Hide the map button and show the itinerary button
        appBarManager.showOneUpCommands(appBarButtonsView);
    };

    /******************************************************
    *************** CONTROLLER CALLBACKS ******************
    ******************************************************/
    function getActiveItineraryIdString() {
        return this.item.id.toString();
    };

    function getActiveItinerary() {
        return this.item;
    };

    function clearUI() {
        //Hide and disable the app bar
        document.getElementById("theAppBar").winControl.hide();
        document.getElementById("theAppBar").winControl.disabled = true;

        //Clear the one up grid
        document.getElementById("ONEUPGRID").style.opacity = "0";
        document.getElementById("ONEUPGRID").style.display = "none";

        //Clear the details div
        document.getElementById("ONEUPGRID_details").style.opacity = "0";
        document.getElementById("ONEUPGRID_details").style.display = "none";

        //Clear the header div
        document.getElementById("ONEUPGRID_header_who").innerHTML = "";
        document.getElementById("ONEUPGRID_header").style.opacity = "0";
        document.getElementById("ONEUPGRID_header").style.display = "none";

        //Clear the map nav buttons
        var elementIDArray = ["ONEUPGRID_mapnav_all", "ONEUPGRID_mapnav_fri", "ONEUPGRID_mapnav_sat", "ONEUPGRID_mapnav_sun"];
        for (var i = 0; i < elementIDArray.length; i++) {
            document.getElementById(elementIDArray[i]).style.opacity = "0";
            document.getElementById(elementIDArray[i]).style.display = "none";
        }
    };

    function reset() {
        //Clear all of the events off of the grid
        //Note: We need to do this before we clear the member variables
        //because we rely on the count of events from the item
        if (this.item != null) {
            for (var i = 0; i < this.item.eventsList.length; i++) {
                var eventElement = document.getElementById("ONEUPGRID_itinerary_event_" + i.toString());
                document.getElementById("ONEUPGRID_itinerary").removeChild(eventElement);
            }
        }

        //Reset the member variables
        //Note: We intentionally do not reset the map
        this.item = null;
        this.selectedEventId = null;
        this.loadSource = null;
        this.detailsDivState = 0;
        this.northWestBoundingBoxPoint = null;
        this.southEastBoundingBoxPoint = null;
        this.centerPoint = null;
        this.MapState = 0; //0=Not Initialized, 1=Initializing, 2=Initialized
        this.selectedNavButton = "ONEUPGRID_mapnav_all";
        this.mapInView = false;
        this.calculatedPoints = new Object();
        this.calculatedPoints["Friday"] = 0;
        this.calculatedPoints["Saturday"] = 0;
        this.calculatedPoints["Sunday"] = 0;
        this.northWestBoundingBoxPoints = new Object();
        this.southEastBoundingBoxPoints = new Object();
        this.centerPoints = new Object();
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define("oneUpState", { oneUpState: oneUpState });
})();