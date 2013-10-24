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
      var temp;

      // switch the positions of the current city 
      // and corresponding rank attributes
      for(i=0;i<cityList.length;i++)
      {
        if(cityList[i].woeid == woeid)
        {
          temp = cityList[i];
          var rank = cityList[i].rank;

          cityList[i] = cityList[0];
          cityList[i].rank = rank;

          cityList[0] = temp;
          cityList[0].rank = 0;
        }
      }

      outputCityElements();
    }  

    /******************************************
    * Remove a city from the list, reorganize
    ******************************************/
    function removeCity (woeid) 
    {
      console.log("inside removeCity");

      var rank = 0;
      var index = 0;

      // find the rank and index of the city to be deleted
      for(i=0;i<cityList.length;i++)
      {
        if(cityList[i].woeid == woeid)
        {
          rank = cityList[i].rank;
          index = i;
        }
      }

      cityList.splice(index,1);

      for(i=0;i<cityList.length;i++)
      {
        if(cityList[i].rank > rank)
        {
          cityList[i].rank = cityList[i].rank - 1;
        }
      }

      outputCityElements();
    }  

    /***************************************
    * Send out for WOEID for addition
    ***************************************/
    function onAddCity() 
    {
      if(cityList.length < 5)
      {
          cityList[cityList.length] = new CityElement();
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
          cityList[i] = new CityElement();
          cityList[i].rank = i;
          cityList[i].name = "Loading...";
          cityList[i].woeid = Prefs.getWOEID(i);
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
          cityContainer.appendChild(outputElement(i, 1));
        }
        else 
        {
          cityContainer.appendChild(outputElement(i, 0));
        }
      }
    }

    /*******************************************
    * Generate HTml for City Element
    *******************************************/
    function outputElement(i, inEdit) 
    {     
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

	    var tbl = dom.createElement('div'); 
	    if(cityList[i].rank==0) 
	    { 
	      tbl.className="primarycityelement"; 
	      tbl.setAttribute("style","border-radius: 5px;border: 1px solid white;background-color:#C6E2FF;box-shadow: 0px 0px 2px #111161;margin: auto;margin-top: 5px;margin-bottom: 5px;width: 97%;");
	    }
	    else 
	    { 
	      tbl.className="cityelement";
	      tbl.setAttribute("style","margin: auto;width: 97%;margin-bottom: 5px;border-top: 2px solid lightgray; width: 180px;"); 
	    }
	    	var tbdy = dom.createElement('div');
	    		var tr1 = dom.createElement('div');
	    			var td1_1 = dom.createElement('div');
	                td1_1.className="iconcolumn";
	                td1_1.setAttribute("style","text-align: left; width: 100px;");
	
	    				var div1_1_1 = dom.createElement('div');
	    				div1_1_1.innerHTML = cityList[i].temp;
	                    div1_1_1.className="icon";
	                    div1_1_1.setAttribute("style","width: 65px;height: 30px;border: 1px solid gray;background-size: 100% 100%;color: #FF5800;font-weight: bold;font-size: 20px;");                    
	
	                    div1_1_1.style.backgroundImage = "url("+cityList[i].image+")"
	    			var td1_2 = dom.createElement('div');
	                td1_2.className="namecolumn, link";
	                td1_2.setAttribute("style","text-align: left; width: 100px;word-wrap: break-word;");
	
					td1_2.innerHTML = cityList[i].name;
					td1_2.addEventListener('click', function(){ });
					
	    		var tr2 = dom.createElement('div');
	    			var td2_1 = dom.createElement('div');
	                td2_1.className="invisible";
	                if(inEdit == 1){ td2_1.setAttribute("style","text-align: right; width: 100px; display: none;")}
	                else { td2_1.setAttribute("style","text-align: right; width: 100px; display: both;")}
	                td2_1.className="detailcolumn";
	                
	
	    				var li2_1_1 = dom.createElement('li');
	                    li2_1_1.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_1.innerHTML = "Humidity: "+ cityList[i].humidity + "%";
						var li2_1_2 = dom.createElement('li');
						li2_1_2.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_2.innerHTML = "Visibility: "+ cityList[i].vis;
						var li2_1_3 = dom.createElement('li');
						li2_1_3.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_3.innerHTML = "windspeed: "+ cityList[i].windSpeed + "mph";
						
	    			var td2_2 = dom.createElement('div');
	                td2_2.className="buttonscolumn; invisible";
	
					if(inEdit == 1){ td2_2.setAttribute("style","max-width: 10px; display: both;");} 
	    			else { td2_2.setAttribute("style","max-width: 10px; display: none;");} 
	    				var img2_2_1 = dom.createElement('img');
						img2_2_1.innerHTML = "I1";
						if(cityList[i].rank==0) { img2_2_1.src="star.png" }
						else { img2_2_1.src="staroutline.png" }
						img2_2_1.width=28; 
	    				img2_2_1.addEventListener('click', function(){ promoteToCurrentCity(cityList[i].woeid)});
						var img2_2_2 = dom.createElement('img');
						img2_2_2.innerHTML = "XXXX";
						img2_2_2.src="x.png" 
	    				img2_2_2.width=25; 
	    				img2_2_2.addEventListener('click', function(){ removeCity(cityList[i].woeid)});
	    
		tbl.appendChild(tbdy);
			tbdy.appendChild(tr1);
				tr1.appendChild(td1_1);
					td1_1.appendChild(div1_1_1);
				tr1.appendChild(td1_2);
			tbdy.appendChild(tr2);
	    		tr2.appendChild(td2_1);
					td2_1.appendChild(li2_1_1);
					td2_1.appendChild(li2_1_2);
					td2_1.appendChild(li2_1_3);
				tr2.appendChild(td2_2);
					td2_2.appendChild(img2_2_1);
					td2_2.appendChild(img2_2_2);
					
		return tbl; 
	}
};

exports.cityManager = cityManager;