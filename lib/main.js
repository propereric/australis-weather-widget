///* ********
// * Requires
// * ********/
// Chrome
//let {Cc, Ci, Cu, Cr, Cm, components} = require("chrome");
//Cu.import("resource://gre/modules/Services.jsm");
//
// SDK
//let data = require("sdk/self").data;
//
///* ***********
// * Panel Setup
// * ***********/
// Get the window
//var allWindows = Services.wm.getEnumerator(null); // Use the window mediator object to get all windows in the browser
//var browserWindow, // Firefox's top-level "window"
//    thisWindow; // Iterated window
//while (allWindows.hasMoreElements()) {
//    thisWindow = allWindows.getNext();
//    if (typeof(thisWindow.location.href) !== 'undefined' && thisWindow.location.href === 'chrome://browser/content/browser.xul') {
//}
//if (typeof(browserWindow) !== 'undefined') {
//    let panelview = browserWindow.document.createElement("panelview");
//        panelview.className = "testClass";
//        panelview.innerHTML = data.load("test.xul");
