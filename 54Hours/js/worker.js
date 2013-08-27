/// <reference group="Dedicated Worker" />

//Import References
importScripts("/js/json2.js");
importScripts("/js/data.js");

//Hash: where_when_howmuch
//where: SF, SEA, BOS, NY
//when: spring, fall, summer, winter
//howmuch: 1, 2, 3

var SearchHashTable = new Object();
SearchHashTable["SF_spring_1"] = [0, 1, 2];
SearchHashTable["SF_spring_2"] = [0, 2, 3];
SearchHashTable["SF_spring_3"] = [0, 1, 3];

SearchHashTable["SF_summer_1"] = [0, 3, 2];
SearchHashTable["SF_summer_2"] = [0, 1, 3];
SearchHashTable["SF_summer_3"] = [0, 1, 2];

SearchHashTable["SF_fall_1"] = [0, 1, 2];
SearchHashTable["SF_fall_2"] = [0, 1, 2];
SearchHashTable["SF_fall_3"] = [0, 1, 2];

SearchHashTable["SF_winter_1"] = [0, 1, 2];
SearchHashTable["SF_winter_2"] = [0, 1, 2];
SearchHashTable["SF_winter_3"] = [0, 1, 2];

SearchHashTable["SEA_spring_1"] = [0, 1, 2];
SearchHashTable["SEA_spring_2"] = [0, 1, 2];
SearchHashTable["SEA_spring_3"] = [0, 1, 2];

SearchHashTable["SEA_summer_1"] = [0, 1, 2];
SearchHashTable["SEA_summer_2"] = [0, 1, 2];
SearchHashTable["SEA_summer_3"] = [0, 1, 2];

SearchHashTable["SEA_fall_1"] = [0, 1, 2];
SearchHashTable["SEA_fall_2"] = [0, 1, 2];
SearchHashTable["SEA_fall_3"] = [0, 1, 2];

SearchHashTable["SEA_winter_1"] = [0, 1, 2];
SearchHashTable["SEA_winter_2"] = [0, 1, 2];
SearchHashTable["SEA_winter_3"] = [0, 1, 2];

SearchHashTable["NY_spring_1"] = [0, 1, 2];
SearchHashTable["NY_spring_2"] = [0, 1, 2];
SearchHashTable["NY_spring_3"] = [0, 1, 2];

SearchHashTable["NY_summer_1"] = [0, 1, 2];
SearchHashTable["NY_summer_2"] = [0, 1, 2];
SearchHashTable["NY_summer_3"] = [0, 1, 2];

SearchHashTable["NY_fall_1"] = [0, 1, 2];
SearchHashTable["NY_fall_2"] = [0, 1, 2];
SearchHashTable["NY_fall_3"] = [0, 1, 2];

SearchHashTable["NY_winter_1"] = [0, 1, 2];
SearchHashTable["NY_winter_2"] = [0, 1, 2];
SearchHashTable["NY_winter_3"] = [0, 1, 2];

SearchHashTable["BOS_spring_1"] = [0, 1, 2];
SearchHashTable["BOS_spring_2"] = [0, 1, 2];
SearchHashTable["BOS_spring_3"] = [0, 1, 2];

SearchHashTable["BOS_summer_1"] = [0, 1, 2];
SearchHashTable["BOS_summer_2"] = [0, 1, 2];
SearchHashTable["BOS_summer_3"] = [0, 1, 2];

SearchHashTable["BOS_fall_1"] = [0, 1, 2];
SearchHashTable["BOS_fall_2"] = [0, 1, 2];
SearchHashTable["BOS_fall_3"] = [0, 1, 2];

SearchHashTable["BOS_winter_1"] = [0, 1, 2];
SearchHashTable["BOS_winter_2"] = [0, 1, 2];
SearchHashTable["BOS_winter_3"] = [0, 1, 2];

onmessage = function (event) {
    switch(event.data.action){
        case "search":
            search(event.data.searchConfigArray);
            break;
        case "load":
            load(event.data.id, event.data.source);
            break;
        case "saveUserData":
            saveUserData(event.data.queue);
            break;
        case "loadUserData":
            loadUserData();
            break;
        case "loadHighlights":
            loadHighlights();
            break;
    }
}

function private_getUserDataFileNameWithExtension() {
    return "localcache.txt";
};

function private_getUserDataPathAndFileNameWithExtension() {
    return "ms-appdata:///local/" + private_getUserDataFileNameWithExtension();
};

function private_getUserDataFileURI() {
    var filepath = private_getUserDataPathAndFileNameWithExtension();
    return (new Windows.Foundation.Uri(filepath));
};

function saveUserData(queue) {
    var uri = private_getUserDataFileURI();

    try{
        //Attempt to read data
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(
            function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (contents) {
                    var fileContentsAsObject = null; //Start assuming an empty file

                    if (contents != "") { //If it isn't empty, save the contents
                        fileContentsAsObject = JSON.parse(contents);
                    }

                    private_applyUserChanges(fileContentsAsObject, queue);
                }, function (err) {
                    //This is the error reading the text
                    postMessage({ event: "saveComplete", hr: false, response: "There was a problem saving your itinerary.  Please try again." });
                });

            }, function (err) {
                //This is the case where we were unable to open the file - assume it's empty
                if (err.number = -2147024894) {
                    private_applyUserChanges(null, queue);
                } else {
                    //This is any other case - consider it a failure
                    postMessage({ event: "saveComplete", hr: false, response: "There was a problem saving your itinerary.  Please try again." });
                }
            }
        ); 
    } catch (err) {
        postMessage({ event: "saveComplete", hr: false, response: "There was a problem saving your itinerary.  Please try again." });
    }
};

function private_applyUserChanges(fileContentsAsObject, queue) {
    var userSavedItineraryArray = [];

    if (fileContentsAsObject != null) {
        userSavedItineraryArray = fileContentsAsObject.savedItineraryIdList;
    }

    //Apply all the actions to the list
    for (var i = 0; i < queue.length; i++) {
        switch (queue[i].actionType) {
            case 0: //Add Case
                //Check to make sure it doesn't already exist
                var alreadyExists = false;
                for (var j = 0; j < userSavedItineraryArray.length; j++) {
                    if (userSavedItineraryArray[i] == queue[i].actionId) {
                        alreadyExists = true;
                        break;
                    }
                }

                //If it doesn't exist, add it
                if (alreadyExists == false) {
                    userSavedItineraryArray.push(queue[i].actionId);
                }
                break;
            case 1: //Remove Case
                for (var j = 0; j < userSavedItineraryArray.length; j++) {
                    //If the current saved ID matches one of the IDs we are going to remove
                    if (userSavedItineraryArray[j] == queue[i].actionId) {
                        userSavedItineraryArray.splice(j, 1);
                    }
                }
                break;
        }
    }

    //Save the contents back to the text file
    var fileNameWithExtension = private_getUserDataFileNameWithExtension();

    var saveToDiskObject = { version: 0.1, savedItineraryIdList: userSavedItineraryArray };

    //Make the object into a JSON string and save it to disk
    var saveToDiskString = JSON.stringify(saveToDiskObject);

    //Open the file
    Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileNameWithExtension, Windows.Storage.CreationCollisionOption.replaceExisting).then(
        function (file) {
            //Save the text string to disk
            Windows.Storage.FileIO.writeTextAsync(file, saveToDiskString).done(
                function () {
                    //Post a message back to the other thread
                    postMessage({ event: "saveComplete", hr: true, response: queue });
                },
                function (err) {
                    postMessage({ event: "saveComplete", hr: false, response: "There was a problem saving your itinerary.  Please try again." });
                }
            );
        },
        function (err) {
            postMessage({ event: "saveComplete", hr: false, response: "There was a problem saving your itinerary.  Please try again." });
        }
    );
};

function getItineraryObjectsFromIds(idArray) {
    var objectsArray = new Array();

    for (var i = 0; i < idArray.length; i++) {
        objectsArray.push(DataSet[Number(idArray[i])]);
    }

    return objectsArray;
};

function loadUserData() {
    var uri = private_getUserDataFileURI();

    try {
        //Attempt to read data
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(
            function (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (contents) {
                    var fileContentsAsObject = null; //Start assuming an empty file

                    if (contents != "") { //If it isn't empty, parse the contents
                        fileContentsAsObject = JSON.parse(contents);
                    }

                    if (fileContentsAsObject == null) {
                        postMessage({ event: "initializeUserDataComplete", hr: true, response: [] });
                    } else {
                        postMessage({ event: "initializeUserDataComplete", hr: true, response: getItineraryObjectsFromIds(fileContentsAsObject.savedItineraryIdList) });
                    }
                }, function (err) {
                    //This is the error reading the text
                    postMessage({ event: "initializeUserDataComplete", hr: false, response: "There was a problem initializing the data." });
                });

            }, function (err) {
                //This is the case where we were unable to open the file - assume it's empty
                if (err.number = -2147024894) {
                    postMessage({ event: "initializeUserDataComplete", hr: true, response: [] });
                } else {
                    //This is any other case - consider it a failure
                    postMessage({ event: "initializeUserDataComplete", hr: false, response: "There was a problem initializing the data." });
                }
            }
        );
    } catch (err) {
        postMessage({ event: "initializeUserDataComplete", hr: false, response: "There was a problem initializing the data." });
    }
};

function load(id, source) {
    var returnItem = null;
    var hrvalue = false;

    //TODO: We need to make this O(1)
    for (var i = 0; i < DataSet.length; i++) {
        if(DataSet[i].id == id){
            returnItem = DataSet[i];
            hrvalue = true;
        }
    }

    postMessage({ event: "loadComplete", hr: hrvalue, source: source, response: returnItem });
};

//private
function getHighlightsArray() {
    var arrayToReturn = new Array();

    for (var i = 0; i < DataSet.length; i++) {
        if (DataSet[i].ishighlight == true) {
            arrayToReturn.push(DataSet[i]);
        }
    }

    return arrayToReturn;
}

function loadHighlights() {  
    postMessage({ event: "loadHighlightsComplete", hr: true, response: getHighlightsArray() });
};

function search(searchTermArray) {
    //SLEEP FOR EFFECT
    var milliseconds = 500;
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
    //SLEEP FOR EFFECT

    //Build Hash
    var searchHash =
        searchTermArray["where"] + "_" +
        searchTermArray["when"] + "_" +
        searchTermArray["howmuch"];

    var candidateItineraries = getItineraryObjectsFromIds(SearchHashTable[searchHash]);
    var itinerariesToReturn = new Array();
    var itineraryMatchCountArray = new Array(candidateItineraries.length);

    //Prepopulate the array
    for (var i = 0; i < itineraryMatchCountArray.length; i++) {
        itineraryMatchCountArray[candidateItineraries[i].id.toString()] = 0;
    }

    //TODO: Replace the array of "what" with a bitmap and then just use OR!!!!
    //Loop through each of the itineraries
    for (var i = 0; i < candidateItineraries.length; i++) {
        //For each itinerary, check each of the who bits
        for (var j = 0; j < searchTermArray["what"].length; j++) {
            //If both of the bits are 1, itinerary is a match
            if (searchTermArray["what"][j] == 1 &&
                candidateItineraries[i].who[j] == 1) {

                //If we haven't found any matches yet for this itinerary, add it to the numbers to return
                if (itineraryMatchCountArray[candidateItineraries[i].id.toString()] == 0) {
                    itinerariesToReturn.push(candidateItineraries[i]);
                }
                
                itineraryMatchCountArray[candidateItineraries[i].id.toString()]++;
            }
        }
    }

    //Order the results being returned by the ones 
    //with the most activity matches
    itinerariesToReturn.sort(
        function (it1, it2) {
            var it1count = itineraryMatchCountArray[it1.id.toString()];
            var it2count = itineraryMatchCountArray[it2.id.toString()];

            return it2count - it1count;
        }
    );

    if (itinerariesToReturn.length > 0) {
        postMessage({ event: "searchComplete", hr: true, response: itinerariesToReturn });
    } else {
        postMessage({ event: "searchComplete", hr: false, response: getHighlightsArray() });
    }
};