/*********************************************
* City Element
*********************************************/
function cityElement() {
  var pub = {};
  pub.name = '';
  pub.woeid = '';
  pub.rank = '';
  pub.image = '';
  pub.temp = '';
  pub.humidity = '';
  pub.vis = '';
  pub.windSpeed = '';

  /***************************************
  * redirect the user to the appr. yahoo page
  ***************************************/
  pub.onClickName = function() {	//redirect the user based on the WOEID
    window.open('http://weather.yahoo.com/_/_/_-'+pub.woeid+'/','_newtab');
  };

  /***************************************
  * Delete the city
  ***************************************/	
  pub.onClickX = function() {		//need to call cityManager to delete self
    cityManager.removeCity(pub.woeid);
  };

  /***************************************
  * Make the city the current location
  ***************************************/		
  pub.onClickStar = function() {	//need to call cityManager to promote self
    cityManager.promoteToCurrentCity(pub.woeid);
  };

  /***************************************
  * Update the city weather info
  ***************************************/
  pub.updateWeather = function() {
    self.port.emit("retrieve-forecast", pub.woeid);
  };

  /***************************************
  * Add Simple Pref Entry
  ***************************************/
  pub.addPrefEntry = function() {
    var s = {rank: pub.rank, woeid: pub.woeid };
    self.port.emit("write-to-pref", s);
  };

  /***************************************
  * Create the html to output
  ***************************************/
  pub.outputElement = function(inEdit) {

    var tbl=document.createElement('table');
    if(pub.rank==0) {
      tbl.className="primarycityelement";
    }
    else {
      tbl.className="cityelement";
    }
    tbl.setAttribute('border','0');
    var tbdy=document.createElement('tbody');

    var tr=document.createElement('tr');
    var td=document.createElement('td');
    td.className="iconcolumn";
    var icon=document.createElement('div');
    icon.className="icon";
    icon.style.backgroundImage = "url("+pub.image+")"
    icon.innerHTML="&nbsp"+pub.temp;
    td.appendChild(icon);
    tr.appendChild(td);

    var td=document.createElement('td');
    td.className="namecolumn, link";
    td.appendChild(document.createTextNode(pub.name))
    td.addEventListener('click', pub.onClickName);
    tr.appendChild(td)

    var td=document.createElement('td');
    td.className="invisible";
    if(inEdit){ td.style.display="none"; }
    else { td.style.display=''; }
    td.className="detailcolumn";
    var li1=document.createElement('li');
    li1.innerHTML="Visibility: "+pub.vis+" mi";
    var li2=document.createElement('li');
    li2.innerHTML="Humidity: "+pub.humidity+"%";
    var li3=document.createElement('li');
    li3.innerHTML="Winds: "+pub.windSpeed+" mph";
    td.appendChild(li1);
    td.appendChild(li2);
    td.appendChild(li3);
    tr.appendChild(td);

    var td=document.createElement('td');
    td.className="buttonscolumn; invisible";
    var img1=document.createElement('img');
    if(pub.rank==0) {
      img1.src="star.png"
    }
    else {
      img1.src="staroutline.png"
    }
    img1.width=28;
    img1.addEventListener('click', pub.onClickStar);

    var img2=document.createElement('img');
    img2.src="x.png"
    img2.width=25;
    img2.addEventListener('click', pub.onClickX);
  
    td.appendChild(img1);
    td.appendChild(img2);

    if(inEdit){ td.style.display=''; }
    else { td.style.display="none"; }
    td.className="invisible";

    tr.appendChild(td);
    tbdy.appendChild(tr);
    tbl.appendChild(tbdy);

	return tbl;
  };			

  return pub;
}





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
    pub.onCreateCity = function(text) {

      //check if not already 5 cities, if more ==> error to console
      if(cityList.length > 4) {

      }
      else  {

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
    pub.onUpdateWeather = function() {		
      for(i=0;i<cityList.length;i++)
      {
        cityList[i].updateWeather();
      }
    };	

    /***************************************
    * Pass Weather to Appropriate City
    ***************************************/
    pub.onForecastToCity = function (toReceive) {

	  var wOEID = toReceive.woeid;
	
	  var xml = toReceive.text,
	  xmlDoc = $.parseXML( xml ),
	  $xml = $( xmlDoc ),
	  $location = $xml.find( "yweather\\:location" );
	  $wind = $xml.find( "yweather\\:wind" );
	  $atmosphere = $xml.find( "yweather\\:atmosphere" );
	  $condition = $xml.find( "yweather\\:condition" );
	
	  var city = $location.attr('city');
	  var country = $location.attr('country');
	  var region = $location.attr('region');
	  var windSpeed = $wind.attr('speed');
	  var humidity = $atmosphere.attr('humidity');
	  var temp = $condition.attr('temp');
	  var visibility = $atmosphere.attr('visibility');
	  var conditionCode = $condition.attr('code');
	
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
	
      outputCityElements();
    }

    /***************************************
    * Call on Preference Change
    ***************************************/
    pub.onPrefChange = function (object) {

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

      outputCityElements();
    }; 

    /***************************************
    * Promote a city to current location
    ***************************************/
    pub.promoteToCurrentCity = function(woeid) { //promote the city, demote others
      
      var temp;

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
    };  

    /******************************************
    * Remove a city from the list, reorganize
    ******************************************/
    pub.removeCity = function(woeid) {

      var rank = 0;
      var index = 0;

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
    };  

    /***************************************
    * Return image name for given code
    ***************************************/
    function returnImage(conditionCode) {

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
    function clearCityContainer() {	//clear the city container of all elements
      cityContainer.innerHTML='';
    };

    /******************************************
    * Call output on all elements => container
    ******************************************/
    function outputCityElements() {	//get outputCode on all cities, add to container
      clearCityContainer();

      //remove entries in prefs that are no longer used
      for(i=cityList.length;i<5;i++)
      {
        var s = {rank: i, woeid: "" };
        self.port.emit("write-to-pref", s);
      }

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







