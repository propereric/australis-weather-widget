/*#####################################################################################*
 * Requires
 *#####################################################################################*/
let { Cc, Ci, Cu, Cr, Cm, components } = require("chrome");
let Prefs = require("sdk/preferences/service");
let Timer = require("timer");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/CustomizableUI.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

let FooWidget = require('./foo-widget').Widget;

//Require statements
var _ = require("sdk/l10n").get;
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var prefs = require("sdk/preferences/service");

const timer = require("timer");
const Request = require("request").Request;
var main_panel = require("sdk/panel").Panel({
  width:450,
  height: 260,
  contentURL: self.data.url("main_panel.html"),
  contentScriptFile: [self.data.url("city-manager.js"), self.data.url("jquery-2.0.3.min.js"), self.data.url("city-element.js")]
});
var widget = widgets.Widget({
  id: "weather-widget",
  label: "Weather Widget",
  contentURL: self.data.url("icon.png"),
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
  var numTries = 0; 
  var success = false; 

  do {
	    onComplete: function (response) {
	      let txt = response.text.replace(/<[^>]+>\s*$/,"");
	      let json = JSON.parse(txt);
	      if(response.status != 200){ success = false; numTries = numTries +1; }
	      else { success = true; main_panel.port.emit("return-woeid", json.places.place[0].woeid); }
	    }
	  }).get();
  } while (sucess != true && failCount < 3);
});

/*****************************************
*   Used to retrieve forecast for woeid
*****************************************/
main_panel.port.on("retrieve-forecast", function (wOEID) 
{
  var url = "http://weather.yahooapis.com/forecastrss?w="+wOEID+"&u=f"
  var numTries = 0; 
  var success = false; 

  do {
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
  } while (sucess != true && failCount < 3);
});

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

/************************************************
* function to modify preferences from a message  
************************************************/
main_panel.port.on("write-to-pref", function (object) 
{ 
  var emptyIt = object.woeid == ''
  setPreference(object.rank, object.woeid, emptyIt);
});

/****************************************
*   Sets the corresponding pref for rank
****************************************/
function setPreference(rank, woeid, emptyIt)
{
  if(emptyIt == false)
  {
    switch(rank)
    {
      case 0:
        prefs.set("cityOneWOEID", woeid.toString());
        break;
      case 1:
        prefs.set("cityTwoWOEID", woeid.toString());
        break;
      case 2:
        prefs.set("cityThreeWOEID", woeid.toString());
        break;
      case 3:
        prefs.set("cityFourWOEID", woeid.toString());
        break;
      case 4:
        prefs.set("cityFiveWOEID", woeid.toString());
        break;
    }
  }
  else
  {
    switch(rank)
    {
      case 0:
        prefs.reset("cityOneWOEID");
        break;
      case 1:
        prefs.reset("cityTwoWOEID");
        break;
      case 2:
        prefs.reset("cityThreeWOEID");
        break;
      case 3:
        prefs.reset("cityFourWOEID");
        break;
      case 4:
        prefs.reset("cityFiveWOEID");
        break;
    }
  }
}

/***************************************
*    Called on load, install, etc
***************************************/
exports.main = function (options, callbacks)
{

  if(prefs.has("cityOneWOEID") && prefs.isSet("cityOneWOEID") && prefs.get("cityOneWOEID", "-1") != "-1")
  {
    var s1 = {rank: 0, woeid: prefs.get("cityOneWOEID") }; main_panel.port.emit("pref-load", s1);
  }
  if(prefs.has("cityTwoWOEID") && prefs.isSet("cityTwoWOEID") && prefs.get("cityTwoWOEID", "-1") != "-1")
  {
    var s2 = {rank: 1, woeid: prefs.get("cityTwoWOEID") }; main_panel.port.emit("pref-load", s2);
  }
  if(prefs.has("cityThreeWOEID") && prefs.isSet("cityThreeWOEID") && prefs.get("cityThreeWOEID", "-1") != "-1")
  {
    var s3 = {rank: 2, woeid: prefs.get("cityThreeWOEID") }; main_panel.port.emit("pref-load", s3);
  }
  if(prefs.has("cityFourWOEID") && prefs.isSet("cityFourWOEID") && prefs.get("cityFourWOEID", "-1") != "-1")
  {
    var s4 = {rank: 3, woeid: prefs.get("cityFourWOEID") }; main_panel.port.emit("pref-load", s4);
  }
  if(prefs.has("cityFiveWOEID") && prefs.isSet("cityFiveWOEID") && prefs.get("cityFiveWOEID", "-1") != "-1")
  {
    var s5 = {rank: 4, woeid: prefs.get("cityFiveWOEID") }; main_panel.port.emit("pref-load", s5);
  }
};

/***************************************
*    Called on Unload
***************************************/
exports.onUnload = function (reason)
{
  //main_panel.port.emit("prompt-pref-write");
};
