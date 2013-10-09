/*********************************************
* City Manager
*********************************************/
var cityManager = (function () {

    var cityContainer = document.getElementById("city-container");
    var cityInput = document.getElementById("city-input");
    var invisibleElements = document.getElementsByClassName("invisible");
    var addCityBar = document.getElementById("addcity");
    var cityList = new Array();

    var pub = {};
    pub.customizeButton = document.getElementById("customize-text");
    pub.addCityButton = document.getElementById("add-city-button");

    /***************************************
    * Send out for WOEID for addition
    ***************************************/
    pub.onAddCity = function(event) {

      //check if valid, if not don't add ==> error to console
      if(cityInput.value != "")  {
        self.port.emit("retrieve-woeid", cityInput.value);
      }
    };

    /***************************************
    * create new city and add to list
    ***************************************/
    pub.onCreateCity = function(text) 
    {
      if(cityList.length < 5) 
      {
        //create and add it to the list
        cityList[cityList.length] = new cityElement();
        cityList[cityList.length-1].rank = cityList.length-1;
        cityList[cityList.length-1].name = "Loading...";
        cityList[cityList.length-1].woeid = text;
      
        //temporary until forecast is returned, just so user can see it is working
        cityContainer.appendChild(cityList[cityList.length-1].outputElement(1));
        
        //get weather forecast
        pub.onUpdateWeather();
      }
    };


    /***************************************
    * Toggle Edit View
    ***************************************/
    pub.onToggleEditView = function(event) {	
      if(pub.customizeButton.innerHTML == "Customize")  {
        pub.customizeButton.innerHTML = "Exit Customization";
        addCityBar.style.display = '';
      }
      else  {
        pub.customizeButton.innerHTML = "Customize";
        addCityBar.style.display = "none";
      }

      outputCityElements();
    };	

    /***************************************
    * Call Update Weather on List, Display
    ***************************************/
    pub.onUpdateWeather = function() 
    {		
      for(i=0;i<cityList.length;i++)
      {
        cityList[i].updateWeather();
      }
    };	

    /***************************************
    * Pass Weather to Appropriate City
    ***************************************/
    pub.onForecastToCity = function (onReceive) 
    {
      // get the woeid from the parameter
	  var wOEID = onReceive.woeid;
	  
	  // get xml and tags from xml
	  var xml = onReceive.text,
	  xmlDoc = $.parseXML( xml ),
	  $xml = $( xmlDoc ),
	  $location = $xml.find( "yweather\\:location" );
	  $wind = $xml.find( "yweather\\:wind" );
	  $atmosphere = $xml.find( "yweather\\:atmosphere" );
	  $condition = $xml.find( "yweather\\:condition" );
	
	  // get specific attributes from xml
	  var city = $location.attr('city');
	  var country = $location.attr('country');
	  var region = $location.attr('region');
	  var windSpeed = $wind.attr('speed');
	  var humidity = $atmosphere.attr('humidity');
	  var temp = $condition.attr('temp');
	  var visibility = $atmosphere.attr('visibility');
	  var conditionCode = $condition.attr('code');
	
	  // for the city in Citylist with the given WOEID
	  // set its attributes to that which has been returned
	  for(i=0;i<cityList.length;i++)
      {
        if(cityList[i].woeid == wOEID)
        {
          if(region != ""){ cityList[i].name = city+", "+region+", "+country;}
          else {cityList[i].name = city+", "+country;}
          cityList[i].temp = temp;
          cityList[i].humidity = humidity;
          cityList[i].vis = visibility;
          cityList[i].windSpeed = windSpeed;
          cityList[i].image = returnImage(conditionCode);
        }
      }
	
	  // refresh the display
      outputCityElements();
    }

    /***************************************
    * Call on Preference Change
    ***************************************/
    pub.onPrefChange = function (object) 
    {
      // if city element does not already exists for corresponding pref
      // create one, else update existing
      if(cityList.length >= object.rank+1)
      {
        for(i=0;i<cityList.length;i++)
        {
          if(cityList[i].rank == object.rank)
          {
             cityList[i].woeid = object.woeid;
             cityList[i].name = "Loading...";
             pub.onUpdateWeather();
          }
        }
      }
      else
      {
        pub.onCreateCity(object.woeid);
      }

      // refresh the display
      outputCityElements();
    }; 

    /***************************************
    * Promote a city to current location
    ***************************************/
    pub.promoteToCurrentCity = function(woeid) 
    { 
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

      //
      outputCityElements();
    };  

    /******************************************
    * Remove a city from the list, reorganize
    ******************************************/
    pub.removeCity = function(woeid) 
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

      // remove the city element needed to be deleted
      cityList.splice(index,1);

      // fix any problems with ranks, for instance if there is a rank 4 but rank 3
      // is deleted rank 4 should become rank 3
      for(i=0;i<cityList.length;i++)
      {
        if(cityList[i].rank > rank)
        {
          cityList[i].rank = cityList[i].rank - 1;
        }
      }

      outputCityElements();
    };  

    /***************************************
    * Return image name for given code
    ***************************************/
    function returnImage(conditionCode) 
    {
      var imageLink = '';

      if ($.inArray(conditionCode,["3","4","37","38","39","45","47"]) != -1)
	  {
	    imageLink = "thunder.png";
	  }
	  else if ($.inArray(conditionCode,["41","42","43","46","18","16","15","14","13","5","6","7"]) != -1)
	  {
	    imageLink = "snow.png";
	  }
	  else if ($.inArray(conditionCode,["8","9","10","11","12","35","40"]) != -1)
	  {
	    imageLink = "rain.png";
	  }
	  else if (conditionCode == "17")
	  {
		imageLink = "hail.png";
	  }
	  else if ($.inArray(conditionCode,["19","20","21","22","23"]) != -1)
	  {
		imageLink = "fog.png";
	  }
	  else if (conditionCode == "24")
	  {
		imageLink = "wind.png";
	  }
	  else if (conditionCode == "25")
	  {
		imageLink = "cold.png";
	  }
	  else if ($.inArray(conditionCode,["26","27","28","29","30","44"]) != -1)
	  {
		imageLink = "cloud.png";
	  }
	  else if ($.inArray(conditionCode,["33","34"]) != -1)
	  {
		imageLink = "fair.png";
	  }
	  else if ($.inArray(conditionCode,["32","36"]) != -1)
	  {
		imageLink = "sun.png";
	  }
	  else if (conditionCode == "31")
	  {
		imageLink = "clear.png";
	  }
	  else
	  {
	    imageLink = "na.png";
	  }

      return imageLink;
    };

    /******************************************
    * Clears all city elements from container
    ******************************************/
    function clearCityContainer() 
    {	
      //clear the city container of all elements
      cityContainer.innerHTML='';
    };

    /******************************************
    * Call output on all elements => container
    ******************************************/
    function outputCityElements() 
    {	
      clearCityContainer();

      // remove entries in prefs that are no longer used
      // and update teh special prefs to reflect the current 
      for(i=cityList.length;i<5;i++)
      {
        var s = {rank: i, woeid: "" };
        self.port.emit("write-to-pref", s);
      }

      // output all city elements with a flag to indicate whether in an 
      // edit phase or not
      for(i=0;i<cityList.length;i++)
      {
        cityList[i].addPrefEntry();

        if(pub.customizeButton.innerHTML == "Exit Customization") 
        {
          cityContainer.appendChild(cityList[i].outputElement(1));
        }
        else 
        {
          cityContainer.appendChild(cityList[i].outputElement(0));
        }
      }
    };

    return pub;
}());





/****************
* Event Handling
****************/
cityManager.customizeButton.addEventListener('click', cityManager.onToggleEditView); 
cityManager.addCityButton.addEventListener('click', cityManager.onAddCity);

self.port.on("return-woeid", cityManager.onCreateCity);
self.port.on("return-forecast", cityManager.onForecastToCity);
self.port.on("update-weather", cityManager.onUpdateWeather);
self.port.on("pref-change", cityManager.onPrefChange);







