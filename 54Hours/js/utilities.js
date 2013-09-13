(function () {
    "use strict";

    //Builds the horizontal picture layout for the WHO items
    //associated with this itinerary or search query
    function buildWhoHorizontalLayout(containerElement, whoArray, size) {
        containerElement.innerHTML = "";
        var numberElementsAdded = 0;
        var numberElementsOverflow = 0;

        var sizeString = "45x45";
        if (size != null) {
            sizeString = "70x70";
        }

        var backgroundImageArray = [
            "url('/images/bike_" + sizeString + ".jpg')",
            "url('/images/spa_" + sizeString + ".jpg')",
            "url('/images/kids_" + sizeString + ".jpg')",
            "url('/images/nightlife_" + sizeString + ".jpg')",
            "url('/images/foodie_" + sizeString + ".jpg')",
            "url('/images/sightseeing_" + sizeString + ".jpg')",
            "url('/images/artsculture_" + sizeString + ".jpg')",
            "url('/images/shopping_" + sizeString + ".jpg')"
        ];

        //searchStateObject.whoItemState
        for (var i = 0; i < whoArray.length; i++) {
            //If the item was choosen and we haven't hit the max yet
            if (whoArray[i] == 1 && numberElementsAdded < 3) {
                var tempDiv = document.createElement("div");
                tempDiv.style.backgroundImage = backgroundImageArray[i];
                tempDiv.classList.add("SEARCHGRID_whoHeader");
                if (size == null) {
                    tempDiv.classList.add("SEARCHGRID_whoHeader_45px");
                } else {
                    tempDiv.classList.add("SEARCHGRID_whoHeader_70px");
                }

                containerElement.appendChild(tempDiv);

                numberElementsAdded++;
            }

                //If we've hit the max
            else if (whoArray[i] == 1 && numberElementsAdded >= 3) {
                numberElementsOverflow++;
            }
        }

        //If we have overflow elements
        if (numberElementsOverflow > 0) {
            var tempOverflowDiv = document.createElement("div");
            tempOverflowDiv.className = "SEARCHGRID_whoHeader";

            if (size == null) {
                tempOverflowDiv.classList.add("SEARCHGRID_whoHeader_45px");
            } else {
                tempOverflowDiv.classList.add("SEARCHGRID_whoHeader_70px");
            }

            tempOverflowDiv.innerText = "+" + numberElementsOverflow.toString();
            containerElement.appendChild(tempOverflowDiv);
        }

        //If we didn't add Anything
        if (numberElementsAdded == 0) {
            containerElement.innerText = "All";
        }
    };

    //Returns an author object
    function authorFactory(authorId) {
        switch (authorId) {
            case 0:
                return { id: 0, name: "Taylor", imageUrl: "url('/images/taylor.jpg')" };
        };
    };

    //Category is an integer
    //ACtive, pamper, outdoor, nightlife, foodie, sightseeing, entertainment, shopping
    function getCategoryStringFromId(category) {
        switch (category) {
            case 0:
                return "Active";
            case 1:
                return "Pamper";
            case 2:
                return "Outdoor";
            case 3:
                return "Nightlife";
            case 4:
                return "Foodie";
            case 5:
                return "Sightseeing";
            case 6:
                return "Entertainment";
            case 7:
                return "Shopping";
        };
    };

    function getTipProvider(providerId) {
        switch (providerId) {
            case 0:
                return { url: "url('/images/yelp_logo.png')", widthPixelString: "39px" };
                break;
            case 1:
                return { url: "url('/images/foursquare_logo.png')", widthPixelString: "74px" };
                break;
        };
    };

    function getTimeStringFromNumericValue(numericValue) {
        var isAM = numericValue < 12;

        if (isAM) {
            return numericValue.toString() + "AM";
        } else {
            if ((numericValue - 12) == 0) {
                return "Noon";
            } else {
                return (numericValue - 12).toString() + "PM";
            }
        }
    };

    function getIconClassFromWhatId(whatID) {
        var className = "";

        switch (whatID) {
            case 0: //Active
                className = "icon-compass";
                break;
            case 1: //Pamper
                className = "icon-smile";
                break;
            case 2: //Kids
                className = "icon-puzzle-piece";
                break;
            case 3: //Nightlife
                className = "icon-glass";
                break;
            case 4: //Foodie
                className = "icon-food";
                break;
            case 5: //Sightseeing
                className = "icon-camera";
                break;
            case 6: //Arts and Culture
                className = "icon-film";
                break;
            case 7: //Shopping
                className = "icon-credit-card";
                break;
        }

        return className;
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define(
        "Utilities",
        {
            getTipProvider: getTipProvider,
            getCategoryStringFromId: getCategoryStringFromId,
            buildWhoHorizontalLayout: buildWhoHorizontalLayout,
            authorFactory: authorFactory,
            getTimeStringFromNumericValue: getTimeStringFromNumericValue,
            getIconClassFromWhatId: getIconClassFromWhatId
        });
})();