//all require goes here for dom-helper etc...
const { Cc, Ci, Cu, Cr, Cm, components } = require('chrome');

var sdkWindows = require('sdk/windows').browserWindows;
var sdkWindowUtils = require('sdk/window/utils');

var DOMHelper = require('./dom-helper').DOMHelper;
var WindowManager = require('./window-manager').WindowManager;
const CityElement = require('./city-element').cityElement;
var Prefs = require('./preferences').Preferences;



///*********************************************
//* City Manager
//*********************************************/
function cityManager () {

    let dom = new DOMHelper();

    //let invisibleElements = dom.getElementsByClassName("invisible");          
    let cityContainer = dom.getElementById("city-container");
    let cityInput = dom.getElementById("city-input");
    let addCityBar = dom.getElementById("addcity");
    let cityList = new Array();

    let customizeButton = dom.getElementById("customize-text");
    customizeButton.addEventListener('click', onToggleEditView);

    let addCityButton = dom.getElementById("add-city-button");
    addCityButton.addEventListener('click', onAddCity);

    /***************************************
    * Promote a city to current location
    ***************************************/
    function promoteToCurrentCity (woeid) 
    { 
      //move the city tht called this to the current location
//      var temp;
//
//      // switch the positions of the current city 
//      // and corresponding rank attributes
//      for(i=0;i<cityList.length;i++)
//      {
//        if(cityList[i].woeid == woeid)
//        {
//          temp = cityList[i];
//          var rank = cityList[i].rank;
//
//          cityList[i] = cityList[0];
//          cityList[i].rank = rank;
//
//          cityList[0] = temp;
//          cityList[0].rank = 0;
//        }
//      }
//
//      outputCityElements();
    }  

    /******************************************
    * Remove a city from the list, reorganize
    ******************************************/
    function removeCity (woeid) 
    {
      //remove city that called this from the list

      console.log("removeCity");

      outputCityElements();
    }  

    /***************************************
    * Send out for WOEID for addition
    ***************************************/
    function onAddCity() 
    {
      if(cityList.length < 5)
      {
          cityList[cityList.length] = new CityElement(this);
          cityList[cityList.length-1].rank = cityList.length-1;
          cityList[cityList.length-1].name = "Loading...";
          cityList[cityList.length-1].onGetWoeid(String(cityInput.value));
      }

      outputCityElements();
    }

    /***************************************
    * Toggle Edit View
    ***************************************/
    function onToggleEditView (event) 
    {	
      if(customizeButton.innerHTML == "Customize")  
      {
        customizeButton.innerHTML = "Exit";
        addCityBar.display = '';
      }
      else  
      {
        customizeButton.innerHTML = "Customize";
        addCityBar.display = "none";
      }

      outputCityElements();
    }	

    /***************************************
    * Call Update Weather on List, Display
    ***************************************/
    function onUpdateWeather () 
    {		
      for(i=0;i<cityList.length;i++)
      {
        //send woeid to get forecast
        //process and set up the element
        cityList[i].name = cityList[i].onGetForecast();
      }

      outputCityElements();
    }	

    /***************************************
    * Call on Preference Change
    ***************************************/
    function onPrefLoad () 
    {
      //load from preferences
      for(i=0;i<5;i++) {
        if(Prefs.getWOEID(i) != -1) {
          cityList[i] = new CityElement(this);
          cityList[i].rank = i;
          cityList[i].name = "Loading...";
          cityList[i].onGetWoeid(String(cityInput.value));
        }
      }

      outputCityElements();
    }

    /***************************************
    * Call on Preference Write
    ***************************************/
    function onPrefWrite () 
    {
      //write to preferences
      for(i=0;i<cityList.length;i++) {
          Prefs.setWOEID({woeid: cityList[i].woeid, rank: cityList[i].rank});
      }
    } 

    /***************************************
    * Return image name for given code
    ***************************************/
    function returnImage (conditionCode) 
    {
      return ""+conditionCode+".png";
    }

    /******************************************
    * Clears all city elements from container
    ******************************************/
    function clearCityContainer () 
    {	
      cityContainer.innerHTML='';
    }

    /******************************************
    * Call output on all elements => container
    ******************************************/
    function outputCityElements () 
    {	
      clearCityContainer();

      for(i=0;i<cityList.length;i++)
      {
        if(customizeButton.innerHTML == "Exit") 
        {
          cityContainer.appendChild(cityList[i].outputElement(1));
        }
        else 
        {
          cityContainer.appendChild(cityList[i].outputElement(0));
        }
      }
    }
};

exports.cityManager = cityManager;