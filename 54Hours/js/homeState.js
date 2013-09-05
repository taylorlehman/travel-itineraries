(function () {
    "use strict";

    function homeState() {
        //CONTROLLER CALLBACKS
        this.clearUI = clearUI;
        this.shouldEnableAppBar = shouldEnableAppBar;
        this.returnElementsToOriginalPosition = returnElementsToOriginalPosition;
    };

    function returnElementsToOriginalPosition() {
        //NOOP for now
    }

    function shouldEnableAppBar() {
        return true;
    };

    function clearUI() {
        //Hide and disable the app bar
        document.getElementById("theAppBar").winControl.hide();
        document.getElementById("theAppBar").winControl.disabled = true;

        //Hide the start grid
        document.getElementById("STARTGRID").style.opacity = "0";
        document.getElementById("STARTGRID").style.display = "none";
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define("homeState", { homeState: homeState });
})();