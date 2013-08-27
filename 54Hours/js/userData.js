(function () {
    "use strict";

    //VARIABLES
    var itineraryList = new Array();
    var listenerArrayTable = {};
    var currentListenerId = 0;

    //This is an array of objects
    //actionType: 0=Save, 1=Remove
    //actionId: The Id of the item being saved or removed
    var actionQueue = [];
    var savingState = 0; //0 = Not currently attempting a save, 1 = attempting a save

    // 0 = Not initialized
    // 1 = Successfully Initialized
    // 2 = Failed to intialize correctly
    var initializeResult = 0; 

    var worker = new Worker("/js/worker.js");
    worker.onmessage = handleWorkerMessage;

    //PUBLIC
    //Note: the burden here is on the caller to make sure it doesn't
    //register the same listener twice
    function registerListener(itineraryId, callBack) {

        //Check if this itineraryId is in the array
        if (typeof listenerArrayTable[itineraryId.toString()] == "undefined") {
            listenerArrayTable[itineraryId.toString()] = new Array();
        }

        //Once we know the array exists, push the new item onto it
        var listenerId = generateListenerId();
        listenerArrayTable[itineraryId.toString()].push(
            {
                id: listenerId,
                callback: callBack
            }
        );

        return listenerId;
    };

    //PUBLIC
    function deRegisterListener(itineraryId, listenerId) {
        
        //Loop through each item in the array, finding one that matches on
        //listener Id
        for (var i = 0; i < listenerArrayTable[itineraryId.toString()].length; i++) {
            
            //Check to see if they match
            if (listenerArrayTable[itineraryId.toString()][i].id == listenerId) {
                listenerArrayTable[itineraryId.toString()].splice(i, 1);
                break;
            }
        }

    };

    //PRIVATE
    function generateListenerId() {
        var returnId = currentListenerId;
        currentListenerId++;
        return returnId;
    };

    //PRIVATE
    function notifyListeners(itineraryId, property) {
        //Check to make sure there are listeners for this itineraryId
        if (typeof listenerArrayTable[itineraryId.toString()] != "undefined") {
            //Loop through each listener, calling the callback
            for (var i = 0; i < listenerArrayTable[itineraryId.toString()].length; i++) {
                listenerArrayTable[itineraryId.toString()][i].callback(itineraryId, property);
            }
        }
    };

    //PUBLIC
    function getInitializeResultValue() {
        return initializeResult;
    };

    //PRIVATE
    function handleWorkerMessage(event){
        switch (event.data.event){
            case "saveComplete":
                handleSaveComplete(event.data.hr, event.data.response);
                break;
            case "initializeUserDataComplete":
                handleInitializeComplete(event.data.hr, event.data.response);
                break;
        }
    };

    //PRIVATE
    function handleInitializeComplete(hr, response) {
        if (hr == true) {
            itineraryList = response;
            initializeResult = 1; //0=not, 1=success, 2=failure

            appBarManager.populateTopBar(); //Redraw the top bar

        } else {
            //TODO: What UX to show here?
            initializeResult = 2; //0=not, 1=success, 2=failure
        }
    }

    //PRIVATE
    //Returns true if they are equal
    function compareQueueItems(item1, item2) {

        var response = true;

        if (item1.actionType != item2.actionType) {
            response = false;
        }

        if (item1.actionId = item2.actionID) {
            response = false;
        }
        
        return response;
    };

    //PRIVATE
    function handleSaveComplete(hr, response) {
        //True == successfully saved
        if (hr == true) {
            //Remove the items acted on from the queue
            for (var i = 0; i < response.length; i++) {
                for (var j = 0; j < actionQueue.length; j++){
                    if (compareQueueItems(response[i], actionQueue[j]) == true) {
                        actionQueue.splice(j, 1);
                        break;
                    }
                }
            }

            //Check if we need to re-queue a save
            if (actionQueue.length > 0) {
                savingState = 1;
                worker.postMessage({ action: "saveUserData", queue: actionQueue });
            } else {
                savingState = 0;
            }
        } else {
            //TODO: Show the error (toast?)
            savingState = 0;
        }
    };

    //PUBLIC
    function getItineraryList() {
        return itineraryList;
    };

    //PUBLIC
    function addItinerary(tempItinerary) {
        //Check if the itinerary is already in the save list
        if (itineraryNotSaved(tempItinerary.id)) {
            //If not - save it!
            itineraryList.push(tempItinerary);

            //Notify the listeners of the change
            notifyListeners(tempItinerary.id, "saveState");

            //Repopulate the top bar
            appBarManager.addTempItineraryToTopBar(tempItinerary);

            //Repopulate the app bar
            Controller.getCurrentState().configureAppBar();

            //Persist
            QueueSaveAsync(0, tempItinerary.id);
        } else {
            //TODO: Play the flash animation on the item

        }
    };

    //PUBLIC
    function itineraryNotSaved(tempItineraryId) {
        for (var i = 0; i < itineraryList.length; i++) {
            if (itineraryList[i].id == tempItineraryId) {
                return false;
            }
        }

        //If we've gotten here, we haven't saved it yet
        return true;
    };

    //PUBLIC
    function removeItinerary(tempItineraryId) {
        //Remove the element from the array
        for (var i = 0; i < itineraryList.length; i++) {
            if (itineraryList[i].id == tempItineraryId) {
                itineraryList.splice(i, 1);
                break;
            }
        }

        //Notify the listeners of the change
        notifyListeners(tempItineraryId, "saveState");

        //Repopulate the top bar
        appBarManager.removeItineraryFromTopBar(tempItineraryId);

        //Repopulate the app bar
        Controller.getCurrentState().configureAppBar();

        //Persist
        QueueSaveAsync(1, tempItineraryId);
    };

    //PRIVATE
    function QueueSaveAsync(tempActionType, tempItineraryId) {
        //Queue up a save
        actionQueue.push({ actionType: tempActionType, actionId: tempItineraryId });

        //If we are not currently saving anything
        //Note: If saving state is 1, we are currently trying to save something
        //When that save completes, we'll check the queue to see if there is anything
        //else that needs to be processed
        if (savingState == 0) {
            //Attempt to save it
            savingState = 1;
            worker.postMessage({ action: "saveUserData", queue: actionQueue });
        }  
    };

    //PUBLIC
    function initialize() {
        worker.postMessage({ action: "loadUserData" });
    };

    //PUBLIC
    function loadObjectsByIds(tempArray) {
        //Look Up the objects in the list
        var returnArray = new Array();
        for (var i = 0; i < tempArray.length; i++) {
            for (var j = 0; j < itineraryList.length; j++) {
                if (itineraryList[j].id == tempArray[i]) {
                    returnArray.push(itineraryList[j]);
                }
            }
        }

        ///Return objects array
        return returnArray;
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define(
        "userData",
        {
            registerListener: registerListener,
            deRegisterListener: deRegisterListener,
            loadObjectsByIds: loadObjectsByIds,
            getInitializeResultValue: getInitializeResultValue,
            initialize: initialize,
            addItinerary: addItinerary,
            removeItinerary: removeItinerary,
            getItineraryList: getItineraryList,
            itineraryNotSaved: itineraryNotSaved
        }
    );
})();