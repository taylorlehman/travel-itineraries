// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    //Always create a oneUpState Object to hold the state of the current one-up view
    var oneUpStateObject = new oneUpState.oneUpState()

    //Always create a resultsState Object to hold the state of the user iterating results
    var resultsStateObject = new resultsState.resultsState(oneUpStateObject);

    //Always create a searchState Object to hold the state of the search
    var searchStateObject = new searchState.searchState(resultsStateObject);

    //Always create a homeState Object
    var homeStateObject = new homeState.homeState();

    //Always create a worker to handle going from highlight->oneUpView
    var workerObject = new Worker("/js/worker.js");
    oneUpStateObject.AttachOnMessage(workerObject, "handleLoad");

    //Also create a worker for loading the highlight data (do we need two here?)
    var homepageWorkerObject = new Worker("/js/worker.js");
    homepageWorkerObject.onmessage = handleHomePageMessage;

    //This array holds the highlight IDs
    //We need this because we use the IDs of the elements to 
    //style each highlight, so we need to store the itinerary IDs
    //seperately
    var highlightIDArray = new Array();

    //Expose these objects globally via a namespace
    WinJS.Namespace.define("AppGlobals", { homeStateObject: homeStateObject, oneUpStateObject: oneUpStateObject, resultsStateObject: resultsStateObject, searchStateObject: searchStateObject });

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            //Load Start screen highlights
            //TODO: Do we need to have some sort of pre-loaded experience?
            homepageWorkerObject.postMessage({ action: "loadHighlights" });

            //Async initialize the user data
            userData.initialize();

            //Before drawing the UX, position the elements
            args.setPromise(WinJS.UI.processAll().then(
                function () {
                    //Configure the app bar
                    appBarManager.configureAppBar();
                    appBarManager.showHomeCommands();
                    Controller.setCurrentState(AppGlobals.homeStateObject);

                    //Configure the different UIs
                    resultsStateObject.configureUI();
                    searchStateObject.configureUI();
                    oneUpStateObject.configureUI();

                    /**********************************************/
                    /************* POSITION ELEMENTS **************/
                    /**********************************************/
                
                    //Configure the navigation buttons
                    //TODO: Move this to be configured via searchState (or something similar)
                    document.getElementById("SEARCHGRID_next_button").style.top = (window.innerHeight - 100).toString() + "px";
                    document.getElementById("SEARCHGRID_next_button").style.left = (window.innerWidth).toString() + "px";

                
                    /**********************************************/
                    /************ SET EVENT HANDLERS **************/
                    /**********************************************/

                    /*********** STARTGRID ************/
                    //document.getElementById("STARTGRID_ss_ny").addEventListener("click", STARTGRID_location_selection_click); //Set the event handlers for the location selection buttons for the start of the search experience
                    //document.getElementById("STARTGRID_ss_sf").addEventListener("click", STARTGRID_location_selection_click); //Set the event handlers for the location selection buttons for the start of the search experience
                    document.getElementById("STARTGRID_ss_se").addEventListener("click", STARTGRID_location_selection_click); //Set the event handlers for the location selection buttons for the start of the search experience
                    //document.getElementById("STARTGRID_ss_ba").addEventListener("click", STARTGRID_location_selection_click); //Set the event handlers for the location selection buttons for the start of the search experience
                    document.getElementById("STARTGRID_hightlight_1").addEventListener("click", STARTGRID_highlight_selection_click);
                    document.getElementById("STARTGRID_hightlight_2").addEventListener("click", STARTGRID_highlight_selection_click);
                    document.getElementById("STARTGRID_hightlight_3").addEventListener("click", STARTGRID_highlight_selection_click);
                    document.getElementById("STARTGRID_hightlight_4").addEventListener("click", STARTGRID_highlight_selection_click);

                    /**********************************************/
                    /*************** INITIALIZE MAP ***************/
                    /**********************************************/
                    document.getElementById("ONEUPGRID_map").style.left = window.innerWidth.toString() + "px";
                    Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: createMap, culture: "en - us", homeRegion: "US" });
                })
            );
        }
    };
    
    /**********************************************/
    /************* STARTGRID EVENTS ***************/
    /**********************************************/

    //Function to handle the selection of a location item from the start screen
    function STARTGRID_location_selection_click(e) {
        var currentElement = e.target;

        var locationIDString = currentElement.id.split("_")[2];
        var locationID = "";

        switch (locationIDString) {
            case "se":
                locationID = "0";
                break;
            case "sf":
                locationID = "1";
                break;
            case "ba":
                locationID = "2";
                break;
            case "ny":
                locationID = "3";
                break;
        };

        searchStateObject.currentLocationSelectionId = locationID;
        searchStateObject.currentLocationSelectionString = currentElement.innerHTML;

        //Reset the controller state
        Controller.setCurrentState(searchStateObject);

        //Hide the start grid
        document.getElementById("STARTGRID").style.opacity = "0";

        //DEBUG
        //searchStateObject.DEBUG_SEARCH_START();
        //DEBUG

        //Configure the Search Grid and Search Content
        document.getElementById("SEARCHGRID_when").classList.add("SEARCHGRID_selected_header_class"); //Highlight the "when" header item since that's where we start
        document.getElementById("SEARCHGRID_where").classList.add("SEARCHGRID_completed_header_class"); //Hightlight thr "where" header item since that's already been selected
        document.getElementById("SEARCHGRID_where").innerHTML = searchStateObject.currentLocationSelectionString;
        searchStateObject.WHENGRID_generateWhenHTML(document.getElementById("SEARCHCONTENT_A"));
        searchStateObject.AttachOnClick(document.getElementById("SEARCHGRID_where"), "SEARCHGRID_header_click");
        searchStateObject.AttachOnClick(document.getElementById("SEARCHGRID_when"), "SEARCHGRID_header_click");
        document.getElementById("SEARCHGRID_where").style.cursor = "pointer";
        document.getElementById("SEARCHGRID_when").style.cursor = "pointer";
        document.getElementById("SEARCHCONTENT_B").left = window.innerWidth.toString() + "px";
        document.getElementById("SEARCHCONTENT_B").style.display = "-ms-flexbox";

        //Show the search grid and search content
        document.getElementById("SEARCHGRID").style.top = "0px";
        document.getElementById("SEARCHCONTENT_A").style.display = "-ms-flexbox";
        document.getElementById("SEARCHCONTENT_A").style.opacity = "1";

        //Hide the home page
        document.getElementById("STARTGRID").style.display = "none";
        document.getElementById("STARTGRID").style.opacity = "0";
    };

    function STARTGRID_highlight_selection_click(event) {
        //Reset the controller state
        Controller.setCurrentState(oneUpStateObject);

        //Hide the start grid
        document.getElementById("STARTGRID").style.opacity = "0";

        //Get the ID of the itinerary to load
        var itineraryToLoad = highlightIDArray[Number(event.target.id.split("_")[2]) - 1];

        //Load the one-up state
        workerObject.postMessage({ action: "load", id: itineraryToLoad, source: 0 });
    };

    function handleHomePageMessage(event) {
        if (event.data.hr == true) {
            //For each highlight returned
            for (var i = 0; i < event.data.response.length; i++) {
                //Populate the HTML
                var element = document.getElementById("STARTGRID_hightlight_" + (i + 1).toString());
                element.firstElementChild.innerText = event.data.response[i].title;
                element.lastElementChild.innerText = event.data.response[i].location;
                element.style.backgroundImage = "url('" + event.data.response[i].highlightBackgroundImageUrl + "')";

                //Save the ID for the click handler
                highlightIDArray.push(event.data.response[i].id);
            }
        } else {
            //TODO: What to do when we are unable to load the highlights?
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    function createMap() {
        oneUpStateObject.mapState = 1; //0=Not Initialized, 1=Initializing, 2=Initialized

        var mapOptions =
        {
            credentials: "Aoo2mcfKeBAisMFXBhFyH1O6YtbVriruvPlr7l7NhStzi3oEJ8VGViDSTJmCitO-",
            height: window.innerHeight,
            width: window.innerWidth
        };

        if (oneUpStateObject.map == null) {
            oneUpStateObject.map = new Microsoft.Maps.Map(document.getElementById("ONEUPGRID_map"), mapOptions);
        }

        oneUpStateObject.MapState = 2; //0=Not Initialized, 1=Initializing, 2=Initialized
    };

    app.start();
})();
