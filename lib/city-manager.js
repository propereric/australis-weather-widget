

let WindowManager = require('./window-manager').WindowManager;
const CityElement = require('./city-element').cityElement;
let Prefs = require('./preferences').Preferences;
let pageWorkers = require("sdk/page-worker");


///*********************************************
//* City Manager
//*********************************************/
function cityManager (document) {

    let dom = document;

    let pub = {};

    //let invisibleElements = dom.getElementsByClassName("invisible");          
    let cityContainer = dom.getElementById("city-container");
    let cityInput = dom.getElementById("city-input");
    let addCityBar = dom.getElementById("addcity");
    let cityList = new Array();

    let customizeText = dom.getElementById("customize-text");

    let customizeButton = dom.getElementById("toggle-customize-button");
    customizeButton.addEventListener('click', onToggleEditView);

    let addCityButton = dom.getElementById("add-city-button");
    addCityButton.addEventListener('click', onAddCity);

    console.log("inside");

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
          onGetWoeid(cityList.length-1, String(cityInput.value), 10);
      }

      outputCityElements();

      return false;
    }

    /***************************************
    * Toggle Edit View
    ***************************************/
    function onToggleEditView (event) 
    {	

      if(customizeText.value == "Customize")  
      {
        customizeText.value = "Exit";
        addCityBar.display = '';
      }
      else  
      {
        customizeText.value = "Customize";
        addCityBar.display = "none";
      }

//      //until all bugs figured out this will stay here
//      dom.appendChild(dom.createElement("box"));

      outputCityElements();

      return false;
    }	

    /***************************************
    * Call Update Weather on List, Display
    ***************************************/
    pub.onUpdateWeather = function() 
    {		
      for(i=0;i<cityList.length;i++)
      {
        onGetForecast(i);
      }

      outputCityElements();
    }	

    /***************************************
    * Call on Preference Change
    ***************************************/
    pub.onPrefLoad = function() 
    {
      //load from preferences
      for(i=0;i<5;i++) {
        var x = Prefs.getWOEID({woeid: '', rank: i});
        console.log("this"+x);
        if(x != "-1" && x) {
          cityList[i] = new CityElement();
          cityList[i].rank = i;
          cityList[i].woeid = x;
        }
      }

      outputCityElements();
      pub.onUpdateWeather();
    }

    /***************************************
    * Call on Preference Write
    ***************************************/
    function onPrefWrite () 
    {
      //reset all preferences
      for(i=0;i<5;i++) {
          Prefs.setWOEID({woeid: '', rank: i});
      }

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
      return require("sdk/self").data.url(""+conditionCode+".png");
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
      onPrefWrite();

      for(i=0;i<cityList.length;i++)
      {
        if(customizeText.value == "Exit") 
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
	    var tbl = dom.createElement('box');  
	    tbl.id = i;
	    dom.getElementById(i).style = "background-color: green;";
	    console.log(tbl);
	    console.log(dom.getElementById(i));
	
	    if(cityList[i].rank==0) 
	    { 
	      //tbl.className="primarycityelement"; 
	      tbl.setAttribute('style',"background-color:#C6E2FF; box-shadow: 0px 0px 2px #111161;margin: auto;margin-top: 5px;margin-bottom: 5px; width: 95%; display:block; padding: 3px;");
	    }
	    else 
	    { 
	      //tbl.className="cityelement";
	      tbl.setAttribute("style","margin: auto;margin-bottom: 5px;border-top: 2px solid lightgray; width: 95%; display:block; padding: 3px;"); 
	    }
	
					var td1_1 = dom.createElement('box');
	                //td1_1.className="iconcolumn";
	                td1_1.setAttribute("style","text-align: left; width: 100px;");
	
	    				var div1_1_1 = dom.createElement('box');
	    				div1_1_1.innerHTML = cityList[i].temp;
	                    //div1_1_1.className="icon";
	                    div1_1_1.setAttribute("style","width: 65px;height: 30px;border: 1px solid gray;background-size: 100% 100%;color: #FF5800;font-weight: bold;font-size: 20px; background-color: black;");                    
	
	                    div1_1_1.backgroundImage = "url("+cityList[i].image+")"
	    			var td1_2 = dom.createElement('box');
	                //td1_2.className="namecolumn, link";
	                td1_2.setAttribute("style","text-align: left; width: 100px;word-wrap: break-word;");
	
					td1_2.innerHTML = cityList[i].name;
					td1_2.addEventListener('click', function(){ console.log("open window");});
					
	    		
	    			var td2_1 = dom.createElement('box');
	                //td2_1.className="invisible";
	                td2_1.setAttribute("style","text-align: right; width: 100px;");
	                if(inEdit == 1){ td2_1.display = '';}
	                else { td2_1.display = "none";}
	                td2_1.className="detailcolumn";
	    				var li2_1_1 = dom.createElement('box');
	                    li2_1_1.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_1.innerHTML = "Humidity: "+ cityList[i].humidity + "%";
						var li2_1_2 = dom.createElement('box');
						li2_1_2.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_2.innerHTML = "Visibility: "+ cityList[i].vis;
						var li2_1_3 = dom.createElement('box');
						li2_1_3.setAttribute("style","list-style-type: none;font-size: 10px;");
						li2_1_3.innerHTML = "windspeed: "+ cityList[i].windSpeed + "mph";
						
	    			var td2_2 = dom.createElement('box');
	                //td2_2.className="buttonscolumn; invisible";
					if(inEdit == 1){ td2_2.setAttribute("style","max-width: 10px; display: both;");} 
	    			else { td2_2.setAttribute("style","max-width: 10px; display: none;");} 
	    				var img2_2_1 = dom.createElement('box');
	                    img2_2_1.innerHTML = "Star";
						//if(cityList[i].rank==0) { img2_2_1.src="star.png" }
						//else { img2_2_1.src=require("sdk/self").data.url("staroutline.png");}
						//img2_2_1.width=28; 
	    				img2_2_1.addEventListener('click', function(){ promoteToCurrentCity(cityList[i].woeid);});
	                    img2_2_1.setAttribute("style","background-color: yellow");
						var img2_2_2 = dom.createElement('box');
						img2_2_2.innerHTML = "X";
						//img2_2_2.src= require("sdk/self").data.url("x.png");
	    				//img2_2_2.width=25; 
	    				img2_2_2.addEventListener('click', function(){ removeCity(cityList[i].woeid);});
	                    img2_2_2.setAttribute("style","background-color: red");
	    
		
		tbl.appendChild(td1_1);
			td1_1.appendChild(div1_1_1);
		tbl.appendChild(td1_2);
		tbl.appendChild(td2_1);
			td2_1.appendChild(li2_1_1);
			td2_1.appendChild(li2_1_2);
			td2_1.appendChild(li2_1_3);
		tbl.appendChild(td2_2);
			td2_2.appendChild(img2_2_1);
			td2_2.appendChild(img2_2_2);
					
		return tbl; 
	}
	
	/***************************************
	* Get WOEID
	***************************************/	
	function onGetWoeid (i, cityOrZip, numAllowedFails)
	{
	    cityList[i].name = 'Loading...';
	    cityList[i].woeid = ''; 
	    cityList[i].image = '';
	    cityList[i].temp = '';
	    cityList[i].humidity = '';
	    cityList[i].vis = '';
	    cityList[i].windSpeed = ''; 
	    
	
		var url = "http://where.yahooapis.com/v1/places.q('"+cityOrZip+"')?format=json&appid=[S.acCMXV34GqNtuNg3WK590qQsnmF2LBDx2inBUwRZTU3dlVYrlyBN6hBJaDi4itcg--]"
		  
		var Request = require("sdk/request").Request;
		if(numAllowedFails > 0) {
		  Request({
			    url: url,
			    onComplete: function (response) 
			    {
			      if(response.status === 200) { 
			        let txt = response.text.replace(/<[^>]+>\s*$/,"");
			        let json = JSON.parse(txt);
			        
			        if(json.places.total > 0) {
			          cityList[i].name = json.places.place[0].woeid;
			          cityList[i].woeid = json.places.place[0].woeid;
			          onGetForecast(i);
			        }
			        else {
			          cityList[i].name = "Invalid Input";
			        }
			      }
			      if(response.status === 0) {
			        onGetWoeid(i, cityOrZip, numAllowedFails-1)
			      }
			
			      outputCityElements();
			    } 
	     }).get();
	   }
	}

	/***************************************
	/* Get Forecast
	***************************************/	
	function onGetForecast(i)
	{
	    var url = "http://weather.yahooapis.com/forecastrss?w="+cityList[i].woeid+"&u=f"
	    //var url = "feed://xml.weather.yahoo.com/forecastrss?p=83501";
	
		var Request = require("sdk/request").Request;
	    Request({
	      url: url,
	      onComplete: function (response) 
	      {
	        let txt = response.text;
	         
	        if(response.status == 200) {
	          var x = pageWorkers.Page({
	              contentURL: require("sdk/self").data.url("page_worker.html"),
	              contentScriptFile: [require("sdk/self").data.url("parse_xml.js"),
	                          require("sdk/self").data.url("jquery-2.0.3.min.js")],
	              onMessage: function(wObject) {
	
	                // set stuff
	                if(wObject.region != ""){ cityList[i].name = wObject.city+", "+wObject.region+", "+wObject.country;}
	                else if(wObject.country != "") {cityList[i].name = wObject.city+", "+wObject.country;}
	                else {cityList[i].name = wObject.city;}
	                cityList[i].temp = wObject.temp;
	                cityList[i].humidity = wObject.humidity;
	                cityList[i].vis = wObject.visibility;
	                cityList[i].windSpeed = wObject.windSpeed;
	                cityList[i].image = returnImage(wObject.conditionCode);
	
	                //refresh the display
		            outputCityElements();
	              }
              });

              x.port.emit("Parse", txt);
            }
  			if(response.status != 200){
              cityList[i].name = 'Failed to Retrieve Weather';
            }
            outputCityElements();
	      }
	    }).get();
	}
	
	return pub;
};

exports.cityManager = cityManager;