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
//        browserWindow = thisWindow;
//        break;
//    }
//}
//
// Put our extension's XUL in the main panel
//if (typeof(browserWindow) !== 'undefined') {
//    // Create a panel view
//    let panelview = browserWindow.document.createElement("panelview");
//        panelview.id = "testId";
//        panelview.className = "testClass";
//        panelview.innerHTML = data.load("test.xul");
//
//    // Inject our panel view into the multiView panel
//    let multiview = browserWindow.document.getElementById("PanelUI-multiView");
//        multiview.appendChild(panelview);
//}


//Require statements
var _ = require("sdk/l10n").get;
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var sp = require("sdk/simple-prefs");
const timer = require("timer");
const Request = require("request").Request;
var main_panel = require("sdk/panel").Panel({
  width:450,
  height: 255,
  contentURL: self.data.url("main_panel.html"),
  contentScriptFile: [self.data.url("city-manager.js"), self.data.url("jquery-2.0.3.min.js"), self.data.url("city-element.js")]
});
var widget = widgets.Widget({
  id: "weather-widget",
  label: "Weather Widget",
  contentURL: self.data.url("thunder.png"),
  panel: main_panel
});

//global timer code to force update every hour
let timeout = timer.setTimeout(updateWeather, 60 * 60000);





/**********************************************
*   Used to return woeid from zip or cityname
**********************************************/
main_panel.port.on("retrieve-woeid", function (cityOrZip) 
{
  var url = "http://where.yahooapis.com/v1/places.q('"+cityOrZip+"')?format=json&appid=[S.acCMXV34GqNtuNg3WK590qQsnmF2LBDx2inBUwRZTU3dlVYrlyBN6hBJaDi4itcg--]"
  
  Request({
    url: url,
    onComplete: function (response) {
      let txt = response.text.replace(/<[^>]+>\s*$/,"");
      let json = JSON.parse(txt);
      main_panel.port.emit("return-woeid", json.places.place[0].woeid);
    }
  }).get();
});

/*****************************************
*   Used to retrieve forecast for woeid
*****************************************/
main_panel.port.on("retrieve-forecast", function (wOEID) 
{
  var url = "http://weather.yahooapis.com/forecastrss?w="+wOEID+"&u=f"
  
  Request({
    url: url,
    onComplete: function (response) {
      let txt = response.text;
      var toSend = { 
        text: txt,
        woeid: wOEID
      }
      main_panel.port.emit("return-forecast", toSend);
    }
  }).get();
});

/************************************************
* function to modify preferences from a message  
************************************************/
main_panel.port.on("write-to-pref", function (object) { setPreference(object.rank, object.woeid); });

/*************************************
*   Used to initiate update on cities
*************************************/
function updateWeather() 
{
    main_panel.port.emit("update-weather", "update");

    if (timeout)
    {
      timer.clearTimeout(timeout);
    }
    timeout = timer.setTimeout(updateWeather, 60 * 60000);
}

/*************************************
*   Checks for next empty pref
*************************************/
function nextEmpty(currentRank)
{
  if(sp.prefs["cityTwoWOEID"] == '' && currentRank < 1){return 1};
  if(sp.prefs["cityThreeWOEID"] == '' && currentRank < 2){return 2};
  if(sp.prefs["cityFourWOEID"] == '' && currentRank < 3){return 3};      
  if(sp.prefs["cityFiveWOEID"] == '' && currentRank < 4){return 4};
  return -1;
}

/*************************************
*   Checks for next non-empty pref
*************************************/
function nextNotEmpty(currentRank)
{
  if(sp.prefs["cityTwoWOEID"] && currentRank < 1){return 1};
  if(sp.prefs["cityThreeWOEID"] && currentRank < 2){return 2};
  if(sp.prefs["cityFourWOEID"] && currentRank < 3){return 3};      
  if(sp.prefs["cityFiveWOEID"] && currentRank < 4){return 4};
  return -1;
}

/****************************************
*   Sets the corresponding pref for rank
****************************************/
function setPreference(rank, woeid)
{
  switch(rank)
    {
      case 0:
        sp.prefs["cityOneWOEID"] = woeid.toString();
        break;
      case 1:
        sp.prefs["cityTwoWOEID"] = woeid.toString();
        break;
      case 2:
        sp.prefs["cityThreeWOEID"] = woeid.toString();
        break;
      case 3:
        sp.prefs["cityFourWOEID"] = woeid.toString();
        break;
      case 4:
        sp.prefs["cityFiveWOEID"] = woeid.toString();
        break;
    }
}

/****************************************
*   Gets the corresponding pref for rank
****************************************/
function getPreference(rank)
{
  switch(rank)
    {
      case 0:
        return sp.prefs["cityOneWOEID"];
        break;
      case 1:
        return sp.prefs["cityTwoWOEID"];
        break;
      case 2:
        return sp.prefs["cityThreeWOEID"];
        break;
      case 3:
        return sp.prefs["cityFourWOEID"];
        break;
      case 4:
        return sp.prefs["cityFiveWOEID"];
        break;
    }
}







/*************************************
*   listens to changes in preferences
*************************************/
sp.on("cityOneWOEID", function ()  
{ 
  var s = {rank: 0, woeid: sp.prefs.cityOneWOEID }; 
  if(sp.prefs.cityOneWOEID){main_panel.port.emit("pref-change", s); }
});
sp.on("cityTwoWOEID", function () 
{ 
  var s = {rank: 1, woeid: sp.prefs.cityTwoWOEID }; 
  if(sp.prefs.cityOneWOEID && sp.prefs.cityTwoWOEID) 
  { main_panel.port.emit("pref-change", s);}
});
sp.on("cityThreeWOEID", function () 
{ 
  var s = {rank: 2, woeid: sp.prefs.cityThreeWOEID }; 
  if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID) 
  { main_panel.port.emit("pref-change", s);}
});
sp.on("cityFourWOEID", function () 
{ 
  var s = {rank: 3, woeid: sp.prefs.cityFourWOEID }; 
  if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID && sp.prefs.cityFourWOEID) 
  { main_panel.port.emit("pref-change", s);}
});
sp.on("cityFiveWOEID", function () 
{ 
  var s = {rank: 4, woeid: sp.prefs.cityFiveWOEID }; 
  if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID && sp.prefs.cityFourWOEID && sp.prefs.cityFifthWOEID) 
  { main_panel.port.emit("pref-change", s);}
});





/***************************************
*    Called on load, install, etc
***************************************/
exports.main = function (options, callbacks)
{
	//loads simple prefs at start-up
	if(sp.prefs.cityOneWOEID) 
	{
	  var s = {rank: 0, woeid: sp.prefs.cityOneWOEID }; main_panel.port.emit("pref-change", s);
	}
	else 
	{ 
	  var x = nextNotEmpty(0);
	  if(x != -1)
	  {
	    setPreference(0, getPreference(x));
	    setPreference(x, '');
	  }
	}
	
	if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID) 
	{
	  var s = {rank: 1, woeid: sp.prefs.cityTwoWOEID }; main_panel.port.emit("pref-change", s);
	}
	else 
	{ 
	  var x = nextNotEmpty(1);
	  if(x != -1)
	  {
	    setPreference(1, getPreference(x));
	    setPreference(x, '');
	  }
	}
	
	if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID) 
	{
	  var s = {rank: 2, woeid: sp.prefs.cityThreeWOEID }; main_panel.port.emit("pref-change", s);
	}
	else 
	{ 
	  var x = nextNotEmpty(2);
	  if(x != -1)
	  {
	    setPreference(2, getPreference(x));
	    setPreference(x, '');
	  }
	}
	
	if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID && sp.prefs.cityFourWOEID) 
	{
	  var s = {rank: 3, woeid: sp.prefs.cityFourWOEID }; main_panel.port.emit("pref-change", s);
	}
	else 
	{ 
	  var x = nextNotEmpty(3);
	  if(x != -1)
	  {
	    setPreference(3, getPreference(x));
	    setPreference(x, '');
	  }
	}
	
	if(sp.prefs.cityTwoWOEID && sp.prefs.cityOneWOEID && sp.prefs.cityThreeWOEID && sp.prefs.cityFourWOEID && sp.prefs.cityFiveWOEID) 
	{
	  var s = {rank: 4, woeid: sp.prefs.cityFiveWOEID }; main_panel.port.emit("pref-change", s);
	}
};

/***************************************
*    Called on Unload
***************************************/
exports.onUnload = function (reason)
{
  
};



/*
Localization cannot be done in content scripts, I tried but it seems we need to find another way
*/
