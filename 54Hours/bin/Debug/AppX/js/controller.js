(function () {
    "use strict";

    var previousState = null;
    var currentState = null;

    function setCurrentState(newValue) {
        previousState = currentState;
        currentState = newValue;
    };

    function getCurrentState() {
        return currentState;
    };

    function getPreviousState() {
        return previousState;
    };

    //Define the namespace that makes all of this available throughout the application
    WinJS.Namespace.define(
        "Controller",
        {
            setCurrentState: setCurrentState,
            getCurrentState: getCurrentState,
            getPreviousState: getPreviousState
        }
    );
})();