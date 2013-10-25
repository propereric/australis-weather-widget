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

    let customizeText = dom.getElementById("customize-text");

    let customizeButton = dom.getElementById("toggle-customize-button");
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
          onGetWoeid(cityList.length-1, String(cityInput.value));
      }

      outputCityElements();
    }

    /***************************************
    * Toggle Edit View
    ***************************************/
    function onToggleEditView (event) 
    {	
      if(customizeText.innerHTML == "Customize")  
      {
        customizeText.innerHTML = "Exit";
        addCityBar.display = '';
      }
      else  
      {
        customizeText.innerHTML = "Customize";
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
        onGetForecast(i);
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
          cityList[i].woeid = Prefs.getWOEID(i);
        }
      }

      onUpdateWeather();
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
        if(customizeText.innerHTML == "Exit") 
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
	    var tbl = dom.createElement('div'); 
	    if(cityList[i].rank==0) 
	    { 
	      tbl.className="primarycityelement"; 
	      tbl.setAttribute("style","border-radius: 5px;border: 1px solid white;background-color:#C6E2FF;box-shadow: 0px 0px 2px #111161;margin: auto;margin-top: 5px;margin-bottom: 5px; width: 95%; display:block;");
	    }
	    else 
	    { 
	      tbl.className="cityelement";
	      tbl.setAttribute("style","margin: auto;margin-bottom: 5px;border-top: 2px solid lightgray; width: 95%; display:block;"); 
	    }
	    	var tbdy = dom.createElement('div');
	    		var tr1 = dom.createElement('div');
	    			var td1_1 = dom.createElement('div');
	                td1_1.className="iconcolumn";
	                td1_1.setAttribute("style","text-align: left; width: 100px;");
	
	    				var div1_1_1 = dom.createElement('div');
	    				div1_1_1.innerHTML = cityList[i].temp;
	                    div1_1_1.className="icon";
	                    div1_1_1.setAttribute("style","width: 65px;height: 30px;border: 1px solid gray;background-size: 100% 100%;color: #FF5800;font-weight: bold;font-size: 20px; background-color: black;");                    
	
	                    div1_1_1.style.backgroundImage = "url("+cityList[i].image+")"
	    			var td1_2 = dom.createElement('div');
	                td1_2.className="namecolumn, link";
	                td1_2.setAttribute("style","text-align: left; width: 100px;word-wrap: break-word;");
	
					td1_2.innerHTML = cityList[i].name;
					td1_2.addEventListener('click', function(){ });
					
	    		
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
						if(cityList[i].rank==0) { img2_2_1.src="star.png" }
						else { img2_2_1.src="staroutline.png" }
						img2_2_1.width=28; 
	    				img2_2_1.addEventListener('click', function(){ promoteToCurrentCity(cityList[i].woeid)});
	                    img2_2_1.setAttribute("style","background-color: yellow");
						var img2_2_2 = dom.createElement('img');
						img2_2_2.src="x.png" 
	    				img2_2_2.width=25; 
	    				img2_2_2.addEventListener('click', function(){ removeCity(cityList[i].woeid)});
	                    img2_2_2.setAttribute("style","background-color: red");
	    
		tbl.appendChild(tbdy);
			tbdy.appendChild(tr1);
				tr1.appendChild(td1_1);
					td1_1.appendChild(div1_1_1);
				tr1.appendChild(td1_2);
			
	    		tr1.appendChild(td2_1);
					td2_1.appendChild(li2_1_1);
					td2_1.appendChild(li2_1_2);
					td2_1.appendChild(li2_1_3);
				tr1.appendChild(td2_2);
					td2_2.appendChild(img2_2_1);
					td2_2.appendChild(img2_2_2);
					
		return tbl; 
	}
	
	/***************************************
	* Get WOEID
	***************************************/	
	function onGetWoeid (i, cityOrZip)
	{
	    cityList[i].name = 'Loading...';
	    cityList[i].woeid = '1'; 
	    cityList[i].image = 'cloudy.png';
	    cityList[i].temp = '75';
	    cityList[i].humidity = '12';
	    cityList[i].vis = '1';
	    cityList[i].windSpeed = '10'; 
	    
	
		var url = "http://where.yahooapis.com/v1/places.q('"+cityOrZip+"')?format=json&appid=[S.acCMXV34GqNtuNg3WK590qQsnmF2LBDx2inBUwRZTU3dlVYrlyBN6hBJaDi4itcg--]"
		  
		var Request = require("sdk/request").Request;
		Request({
			    url: url,
			    onComplete: function (response) 
			    {
			      let txt = response.text.replace(/<[^>]+>\s*$/,"");
			      let json = JSON.parse(txt);
			      if(response.status === 200) { 
			        cityList[i].name = json.places.place[0].woeid;
			        cityList[i].woeid = json.places.place[0].woeid;
			        outputCityElements();
			        onGetForecast(i);
			      }
			    } 
	     }).get();
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
	
	        //process and set cityList[i] to info
	        
	        // get xml and tags from xml
		    //var xml = txt,
//		    xmlDoc = $.parseXML( xml ),
//		    $xml = $( xmlDoc ),
//		    $location = $xml.find( "yweather\\:location" );
//		    $wind = $xml.find( "yweather\\:wind" );
//		    $atmosphere = $xml.find( "yweather\\:atmosphere" );
//		    $condition = $xml.find( "yweather\\:condition" );
		
		    // get specific attributes from xml
		    //var city = $location.attr('city');
//		    var country = $location.attr('country');
//		    var region = $location.attr('region');
//		    var windSpeed = $wind.attr('speed');
//		    var humidity = $atmosphere.attr('humidity');
//		    var temp = $condition.attr('temp');
//		    var visibility = $atmosphere.attr('visibility');
//		    var conditionCode = $condition.attr('code');
		
		
		    // for the city in Citylist with the given WOEID
		    // set its attributes to that which has been returned
            //if(region != ""){ cityList[i].name = city+", "+region+", "+country;}
//            else if(country != "") {cityList[i].name = city+", "+country;}
//            else {cityList[i].name = city;}
//            cityList[i].temp = temp;
//            cityList[i].humidity = humidity;
//            cityList[i].vis = visibility;
//            cityList[i].windSpeed = windSpeed;
//            cityList[i].image = returnImage(conditionCode);
	         
		
		    // refresh the display
		    console.log(txt);
	        outputCityElements();
	
	
	
	      }
	    }).get();
	}
};

exports.cityManager = cityManager;