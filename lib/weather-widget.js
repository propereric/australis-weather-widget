/*#############################################
#
#  On first glance this file appears extremely
#  large, however alot deals with the dynamic
#  creation of elements, which has little 
#  logic involved. 
#
#############################################*/


var ChromeConstants = require("./xul-manager/chrome-constants.js").ChromeConstants;
var data = require("sdk/self").data;

/****************
Widget Requires
****************/
const CityElement = require('./city-element').cityElement;
let Prefs = require('./preferences').Preferences;
let pageWorkers = require("sdk/page-worker");
let Convert = require('./converter').Converter;
let IconHandler = require('./iconhandler').IconHandler;


function WeatherWidget () {

  let document = null;                  	//holds document
  let view = null;                      	//holds first node
  let cityList = new Array();           	//create array to hold cities
  let iconImage = data.url("icon.png"); 	//default icon 
  let badgeTemp = "";                   	//default temperature to display in badge (shows no badge)
  let tempUnit = "Fahrenheit";				//default units if none in preferences
  let distanceUnit = "Imperial";			//default units if none in preferences

  /****************************************************
  * when press toggle button to change dist units
  ****************************************************/
  function toggleDistanceClicked(event) 
  {
    let toggleLabel = document.getElementById("msu-weather-toggle-button-distance-label");

    if(distanceUnit == "Imperial") 
    { 
      distanceUnit = "Metric";
      toggleLabel.setAttribute("value",distanceUnit);
    }
    else 
    { 
      distanceUnit = "Imperial"; 
      toggleLabel.setAttribute("value",distanceUnit);
    }

    Prefs.setDistanceUnit(distanceUnit);

    outputCityElements();

    //required to keep the panel open
    event.preventDefault(); 
  }

  /****************************************************
  * when press toggle button to change temp units
  ****************************************************/
  function toggleTempClicked(event) 
  {
    let toggleLabel = document.getElementById("msu-weather-toggle-button-label");

    if(tempUnit == "Fahrenheit") 
    { 
      tempUnit = "Celsius";
      toggleLabel.setAttribute("value",tempUnit);
    }
    else 
    { 
      tempUnit = "Fahrenheit"; 
      toggleLabel.setAttribute("value",tempUnit);
    }

    Prefs.setTemperatureUnit(tempUnit);

    outputCityElements();
 
    //required to keep the panel open
    event.preventDefault();
  }

  /****************************************************
  * when press customize button switch to edit view
  ****************************************************/
  function customizeClicked(event) 
  {

    let customizeLabel = document.getElementById("msu-weather-customize-label");
    let textbox = document.getElementById("msu-weather-textbox");
    let addCityButton = document.getElementById("msu-weather-add-city-button");
    let toggleContainer = document.getElementById("msu-weather-toggle-container");
    
    if(customizeLabel.getAttribute("value") == "Customize")
    {
      //show hidden items
      customizeLabel.setAttribute("value","Exit Customization");
      textbox.style.display = '';
      addCityButton.style.display = '';
      toggleContainer.style.display = '';
    }
    else
    {
      //hide items that belong to the edit view
      customizeLabel.setAttribute("value","Customize");
      textbox.style.display = "none";
      addCityButton.style.display = "none";
      toggleContainer.style.display = "none";
    }

    outputCityElements();

    //required to keep the panel open
    event.preventDefault();
  }


  /****************************************************
  * when click add city, create a new city element
  ****************************************************/
  function addCityClicked(event) 
  {
    let textbox = document.getElementById("msu-weather-textbox");

    // if there is less than 5 cities in the list, add another one
    if(cityList.length < 5)  
    {
      cityList[cityList.length] = new CityElement();
      cityList[cityList.length-1].rank = cityList.length-1;
      getWoeid(cityList.length-1, String(textbox.value), 10);
    }

    outputCityElements();

    // reset the textbox to empty on submission
    textbox.value = '';

    // required to stop panel from closing
    event.preventDefault();
  }


  /****************************************************
  * remove the city with the woeid
  ****************************************************/
  function removeCity(woeid) 
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

    // fix any rankings that broke
    for(i=0;i<cityList.length;i++)
    {
      if(cityList[i].rank > rank)
      {
        cityList[i].rank = cityList[i].rank - 1;
      }
    }

    outputCityElements();
  }


  /****************************************************
  * promote the city with the woeid
  ****************************************************/
  function promoteToFavoriteCity(woeid) 
  {
    //move the city that called this to the current location
    var temp;

    // switch the positions of the current city 
    // and corresponding rank attributes
    for(i=0;i<cityList.length;i++)
    {
      if(cityList[i].woeid == woeid)
      {
        switchCities(i);
      }
    }

	//could change how this occurs so that favoritie city's go down one

    outputCityElements();
  }

  
  /****************************************************
  * switch recursively until city appears at the top
  ****************************************************/
  function switchCities(i) 
  {
    var h = i-1;

    // check if invalid 
    if( i!=h 
        && ((i-h) < 2) 
        && ((h-i) < 2) 
        && cityList.length > h 
        && cityList.length > i 
        && (i >= 0) 
        && (h >= 0)) 
    {  
      var temp = cityList[i];
      var rank1 = cityList[h].rank;
      var rank2 = cityList[i].rank;

      cityList[i] = cityList[h];
      cityList[i].rank = rank2;

      cityList[h] = temp;
      cityList[h].rank = rank1;

      //recursively call until city is at top of list
      switchCities(i-1);
    }
    else 
    {
      return;
    }
  }


  /****************************************************
  * get the woeid for the zip or city name
  ****************************************************/
  function getWoeid(i, cityOrZip, numAllowedFails) 
  {
    cityList[i].name = 'Loading...';
    cityList[i].woeid = ''; 
    cityList[i].image = IconHandler.returnImage(3200);
    cityList[i].temp = '';
    cityList[i].humidity = '';
    cityList[i].vis = '';
    cityList[i].windSpeed = ''; 

	var url = "http://where.yahooapis.com/v1/places.q('"+cityOrZip+"')?format=json&appid=[S.acCMXV34GqNtuNg3WK590qQsnmF2LBDx2inBUwRZTU3dlVYrlyBN6hBJaDi4itcg--]"
	  
	var Request = require("sdk/request").Request;
	if(numAllowedFails > 0) 
	{
	  Request(
	  {
		    url: url,
		    onComplete: function (response) 
		    {
		      if(response.status === 200) 
		      { 
		        let txt = response.text.replace(/<[^>]+>\s*$/,"");
		        let json = JSON.parse(txt);
		        
		        if(json.places.total > 0) 
		        {
		          cityList[i].name = json.places.place[0].woeid;
		          cityList[i].woeid = json.places.place[0].woeid;
		          getForecast(i);
		        }
		        else 
		        {
		          cityList[i].name = "Invalid Input";
		        }
		      }
		      if(response.status === 0) {
		        getWoeid(i, cityOrZip, numAllowedFails-1)
		      }
		
		      if(document)
		      { 
		        outputCityElements(); 
		      }
		    } 
      }).get();
    }
  }


  /****************************************************
  * get the forecast for the city
  ****************************************************/
  function getForecast(i) {

    var url = "http://weather.yahooapis.com/forecastrss?w="+cityList[i].woeid+"&u=f"
	
	var Request = require("sdk/request").Request;
    Request(
    {
      url: url,
      onComplete: function (response) 
      {
        let txt = response.text;
         
        if(response.status == 200) 
        {
          var x = pageWorkers.Page(
          {
              contentURL: data.url("page_worker.html"),
              contentScriptFile: [data.url("parse_xml.js"), data.url("jquery-2.0.3.min.js")],
              onMessage: function(wObject) 
              {
                if(wObject.region != "")
                { 
                  cityList[i].name = wObject.city+", "+wObject.region+", "+wObject.country;
                }
                else if(wObject.country != "") 
                {
                  cityList[i].name = wObject.city+", "+wObject.country;
                }
                else 
                {
                  cityList[i].name = wObject.city;
                }

                cityList[i].temp = wObject.temp;
                cityList[i].humidity = wObject.humidity;
                cityList[i].vis = wObject.visibility;
                cityList[i].windSpeed = wObject.windSpeed;
                cityList[i].code = wObject.conditionCode;
                cityList[i].image = IconHandler.returnImage(wObject.conditionCode);

                if(i==0) 
                { 
                  if( document )
                  { 
                    onSetIcon();
                  }
                  else 
                  {
                    iconImage = IconHandler.returnIconImage(cityList[i].code);
                    if(tempUnit == "Celsius") { badgeTemp = Convert.fahrenheitToCelsius(cityList[i].temp)+"°"; }///////
                    else { badgeTemp = cityList[i].temp+"°"; }
                  }
                }
                if( document )
                { 
                  outputCityElements();
                } 
              }
            });

              x.port.emit("Parse", txt);
          }
  	      if(response.status != 200)
          {
            cityList[i].name = 'Failed to Retrieve Weather';
          }
          if(document)
          { 
            outputCityElements(); 
          }
      }
    }).get();
  }


  /****************************************************
  * update all cities' weather
  ****************************************************/
  function onUpdateWeather() {

    // get new forecast for all cities
    for(i=0;i<cityList.length;i++)
    {
      getForecast(i);
    }
  }


  /****************************************************
  * load all preferences from pref.js
  ****************************************************/
  function onPrefLoad() 
  {  
    var tempU = Prefs.getTemperatureUnit();
    if(tempU != "-1") { tempUnit = tempU; }

    var distU = Prefs.getDistanceUnit();
    if(distU != "-1") { distanceUnit = distU; }

    //load from preferences
    for(i=0;i<5;i++) 
    {
      var x = Prefs.getWOEID({woeid: '', rank: i});
      if(x != "-1" && x) 
      {
        cityList[i] = new CityElement();
        cityList[i].rank = i;
        cityList[i].woeid = x;
      }
    }

    onUpdateWeather();
  }


  /****************************************************
  * write to pref.js to save woeid for all cities
  ****************************************************/
  function onPrefWrite() 
  {
    //reset all preferences
    for(i=0;i<5;i++) 
    {
      Prefs.setWOEID({woeid: '', rank: i});
    }

    //write to preferences
    for(i=0;i<cityList.length;i++) 
    {
      Prefs.setWOEID({woeid: cityList[i].woeid, rank: cityList[i].rank});
    }
  }

  
  /****************************************************
  * set the icon 
  ****************************************************/
  function onSetIcon() 
  {
    if(cityList.length > 0) 
    {
      badgeTemp = IconHandler.setToOn(document, cityList[0].code, cityList[0].temp, tempUnit);
      iconImage = cityList[0].image;
    }
    else 
    {
      badgeTemp = IconHandler.setToDefault(document);
      iconImage = data.url("icon.png");
    }
  }


  /****************************************************
  * output the city elements
  ****************************************************/
  function outputCityElements() 
  {
    if(document)
    { 
      onSetIcon(); 
      document.getElementById("msu-weather-toggle-button-distance-label").setAttribute("value",distanceUnit);
      document.getElementById("msu-weather-toggle-button-label").setAttribute("value",tempUnit);
    }

    let customizeLabel = document.getElementById("msu-weather-customize-label");
    let cityContainer = document.getElementById("msu-weather-city-container");

    while(cityContainer.hasChildNodes())
    {
      cityContainer.removeChild(cityContainer.firstChild);
    }

    onPrefWrite();

    for(i=0;i<cityList.length;i++)
    {
      if(customizeLabel.getAttribute("value") == "Exit Customization") 
      {
        cityContainer.appendChild(outputElement(i, 1)); //if in edit view
      }
      else 
      {
        cityContainer.appendChild(outputElement(i, 0)); //if in main view
      }
    }
  }


  /****************************************************
  * generate the code to output city elements
  ****************************************************/
  function outputElement(i, inEdit) 
  {
    //overall box for the city element
    let tbl = document.createElement('vbox');
    if(cityList[i].rank == 0){ tbl.setAttribute("class","msu-weather-city-element msu-weather-city-element-primary"); }
    else { tbl.setAttribute("class","msu-weather-city-element msu-weather-city-element-secondary"); }

    //holds the image that each city has
    let imageHolder = document.createElement("vbox");
    imageHolder.setAttribute("class","msu-weather-city-image-holder");
        let image = document.createElement("vbox");
        image.setAttribute("class","msu-weather-city-image");
        image.setAttribute("style", "background-image: url("+cityList[i].image+");");
        image.height = "112px";
        image.width = "200px";
        
            // the city name (which is a link to yahoo web page)
            let cityName = document.createElement("label");
            if(cityList[i].rank == 0){ cityName.setAttribute("class","text-link msu-weather-city-element-primary msu-weather-city-label"); }
            else { cityName.setAttribute("class","text-link msu-weather-city-element-secondary msu-weather-city-label"); }
            cityName.href = 'http://weather.yahoo.com/_/_/_-'+cityList[i].woeid+'/';
            cityName.setAttribute("value",cityList[i].name);

            // The current temperature for the city
            let temperature = document.createElement("label");
            if(tempUnit == "Fahrenheit"){ temperature.setAttribute("value",""+cityList[i].temp+"°"); }
            else { temperature.setAttribute("value",Convert.fahrenheitToCelsius(cityList[i].temp)+"°"); }
            temperature.setAttribute("class","msu-weather-city-temp");

	// container for the little details such as humidity and wind speed
    let detailHolder = document.createElement("vbox");
    detailHolder.setAttribute("class","msu-weather-city-label-holder");
    detailHolder.align = "center";

      let wind = document.createElement("label");
      wind.setAttribute("class","msu-weather-city-label");
      if(distanceUnit == "Imperial"){ wind.setAttribute("value","Wind Speed: "+ 1*cityList[i].windSpeed + " mph"); }
      else { wind.setAttribute("value","Wind Speed: "+ Convert.milesToKilometers(cityList[i].windSpeed) + " km/h"); }
        
      let visibility = document.createElement("label");
      visibility.setAttribute("class","msu-weather-city-label");
      visibility.setAttribute("value","Visibility: "+ cityList[i].vis + " mi");
      if(distanceUnit == "Imperial"){ visibility.setAttribute("value","Visibility: "+ 1*cityList[i].vis + " mi"); }
      else { visibility.setAttribute("value","Visibility: "+ Convert.milesToKilometers(cityList[i].vis) + " km"); }
        
      let humidity = document.createElement("label");
      humidity.setAttribute("class","msu-weather-city-label");
      humidity.setAttribute("value","Humidity: "+ cityList[i].humidity + "%");
        
	// holds items that only appear in eidt view, such as the x and star
    let editItems = document.createElement("vbox");
      editItems.align= "center";

      let editHolder = document.createElement("hbox");

        let star = document.createElement("image");
        star.addEventListener('click', function(){ promoteToFavoriteCity(cityList[i].woeid);});
        star.width = 20;
        if(cityList[i].rank == 0) 
        {
          star.setAttribute("src", data.url("star.png"));
        }
        else 
        {
          star.setAttribute("src", data.url("staroutline.png"));
        }

        let x = document.createElement("image");
        x.setAttribute("src", data.url("x.png"));
        x.width = 15;
        x.addEventListener('click',function(){ removeCity(cityList[i].woeid);});
   
    //what gets output depends on if we are in edit view or in the main view
    if(inEdit == 0) {
      tbl.appendChild(imageHolder);
      imageHolder.appendChild(image);
        image.appendChild(cityName);
        image.appendChild(temperature);
        image.appendChild(detailHolder);
          detailHolder.appendChild(visibility);
          detailHolder.appendChild(humidity);
          detailHolder.appendChild(wind);
    }
    else {
      tbl.appendChild(imageHolder);
      imageHolder.appendChild(cityName);
      imageHolder.appendChild(editItems);  
        editItems.appendChild(editHolder);
          editHolder.appendChild(star);
          editHolder.appendChild(x);
    }
	   				
    return tbl;
  }

  
  /****************************************************
  * inject a basic UI into the panel
  ****************************************************/
  function injectUI () 
  {
    //create the customize button
    let customizeButtonHolder = document.createElement("hbox");
      customizeButtonHolder.setAttribute("id","msu-weather-customize-button-holder");
      customizeButtonHolder.addEventListener("click", customizeClicked);
      customizeButtonHolder.setAttribute("oncommand", "return false;");

      // image of a gear inside the customize button
      let customizeImage = document.createElement("image");
	    customizeImage.setAttribute("src",data.url("gear.png"));
	    customizeImage.setAttribute("id","msu-weather-customize-image");
	  customizeButtonHolder.appendChild(customizeImage);

      // an actual button for the customize
      let customizeButton = document.createElement("toolbarbutton");
        customizeButton.setAttribute("id", "msu-weather-customize-button");
        customizeButton.setAttribute("oncommand", "return false;");
        customizeButton.align = "left";

        //holds the label for "Customize" and "Exit Customization"
        let customizeLabel = document.createElement("label");
          customizeLabel.setAttribute("id", "msu-weather-customize-label");
          customizeLabel.setAttribute("value","Customize");

        customizeButton.appendChild(customizeLabel);
      customizeButtonHolder.appendChild(customizeButton);
    view.appendChild(customizeButtonHolder);

    // holds the toggle buttons for temperature and distance unit selection
    let toggleContainer = document.createElement("vbox");
    toggleContainer.setAttribute("id","msu-weather-toggle-container");
    toggleContainer.style.display = "none";
    toggleContainer.align = "center";

      // container for just the distance toggle
      let toggleDistanceHolder = document.createElement("hbox");
      toggleDistanceHolder.setAttribute("id","msu-weather-toggle-distance-holder");

        //label for the distance toggle button
        let distanceLabel1 = document.createElement("label");
        distanceLabel1.setAttribute("value","Use");
      
        // the actual disatnce toggle button
        let toggleDistanceButton = document.createElement("label");
        toggleDistanceButton.setAttribute("class", "msu-weather-toggle-button");
        toggleDistanceButton.setAttribute("id", "msu-weather-toggle-button-distance-label");
        toggleDistanceButton.setAttribute("value",distanceUnit);
        toggleDistanceButton.addEventListener("click", toggleDistanceClicked);

        //label for the distance toggle button
        let distanceLabel2 = document.createElement("label");
        distanceLabel2.setAttribute("value","Units");
    
      toggleDistanceHolder.appendChild(distanceLabel1);
      toggleDistanceHolder.appendChild(toggleDistanceButton);
      toggleDistanceHolder.appendChild(distanceLabel2);
      toggleContainer.appendChild(toggleDistanceHolder);

      // container for just the temperature toggle
      let toggleTempHolder = document.createElement("hbox");
      toggleTempHolder.setAttribute("id","msu-weather-toggle-temp-holder");

        //label for the temperature toggle button
        let tempLabel1 = document.createElement("label");
        tempLabel1.setAttribute("value","Use");

        // the actual temp toggle button
        let toggleTempButton = document.createElement("label");
        toggleTempButton.setAttribute("class", "msu-weather-toggle-button");
        toggleTempButton.setAttribute("id", "msu-weather-toggle-button-label");
        toggleTempButton.setAttribute("value",tempUnit);
        toggleTempButton.addEventListener("click", toggleTempClicked);
      
        //label for the temperature toggle button
        let tempLabel2 = document.createElement("label");
        tempLabel2.setAttribute("value","Scale");
    
      toggleTempHolder.appendChild(tempLabel1);
      toggleTempHolder.appendChild(toggleTempButton);  
      toggleTempHolder.appendChild(tempLabel2);
      toggleContainer.appendChild(toggleTempHolder);

    view.appendChild(toggleContainer);
   
    // holds the city elements once they are dynamically added
    let cityContainer = document.createElement("vbox");
      cityContainer.setAttribute("id", "msu-weather-city-container");
      cityContainer.align= "center";
      view.appendChild(cityContainer);

    // container used for alignment of the input elements
    let inputAlign = document.createElement("vbox");
    inputAlign.align = "center";

    let inputHolder = document.createElement("hbox");
      inputHolder.setAttribute("id","msu-weather-input-holder");

      let textbox = document.createElement("textbox");
        textbox.style.display = "none";
        textbox.setAttribute("id", "msu-weather-textbox");
        textbox.setAttribute("placeholder", "Enter Zip/City");
        inputHolder.appendChild(textbox);

      let addCityButton = document.createElement("toolbarbutton");
        addCityButton.style.display = "none";
        addCityButton.setAttribute("id", "msu-weather-add-city-button");
        addCityButton.setAttribute("label","Add");
        addCityButton.addEventListener("click", addCityClicked);
        addCityButton.setAttribute("oncommand", "return false;");
        inputHolder.appendChild(addCityButton);
 
      inputAlign.appendChild(inputHolder);
      view.appendChild(inputAlign);

    // below contains the elements regarding displaying an acknowledgment to yahoo weather
    let acknowledgeCenter = document.createElement("vbox");
    acknowledgeCenter.align = "center";

    	let acknowledgeHolder = document.createElement("hbox");
        	acknowledgeHolder.setAttribute("id","msu-weather-acknowledge-holder");

    		let acknowledgeLabel = document.createElement("label");
        		acknowledgeLabel.setAttribute("value","Powered By: ");
        		acknowledgeLabel.setAttribute("id","msu-weather-acknowledge-label");
    		acknowledgeHolder.appendChild(acknowledgeLabel);

    		let yahooWeatherLabel = document.createElement("label");
        		yahooWeatherLabel.setAttribute("value","Yahoo! Weather");
        		yahooWeatherLabel.setAttribute("id","msu-weather-yahoo-weather-label");
    		acknowledgeHolder.appendChild(yahooWeatherLabel);

		acknowledgeCenter.appendChild(acknowledgeHolder);
	view.appendChild(acknowledgeCenter);

    if(document) 
    { 
      outputCityElements(); 
    }
  }

  return {
    CONFIG: {
        id: "australis-weather-widget",									// Set id of widget 
        label: 'Weather',												// Set 'Weather' as button label
        tooltiptext: 'Weather Widget v0.1',								// Provide text for tooltip
        type: "view",													// Set widget to view
        viewId: "PanelUI-msu-weather",									// Set viewId for panel
        removable: true,												// Allow the widget to be moved
        defaultArea: ChromeConstants.AREA_PANEL()						// Make the Hamburger menu default
    },

    /****************************************************
    * Call when browser starts up
    ****************************************************/
    widgetCreated: function(node) 
    {

      node.setAttribute("style","margin-left: 0px; padding: 0px;");

      let doc = node.ownerDocument;
      // node.setAttribute("type", "badged");
      // node.setAttribute("image", iconImage);

      var css = data.url('styles.css');                                                                 // Resource URL to our stylesheet
      let xmlPI = doc.createProcessingInstruction('xml-stylesheet', 'href="'+css+'" type="text/css"');  // Create an XML pi
      doc.insertBefore(xmlPI, doc.firstElementChild);													// Insert instruction 

      let container = doc.createElement("vbox");
        container.id = "msu-weather-container";      													// Container for Items
        container.setAttribute("class","toolbarbutton-badge-container");
        
      	let badge = doc.createElement("vbox"); 															// Badge
            badge.id = "msu-weather-badge";     
        	badge.setAttribute("class","toolbarbutton-badge");
            badge.setAttribute("badge", badgeTemp);
      
      	let image = doc.createElement("image");															// Icon Image
            image.id = "msu-weather-image"; 
            image.setAttribute("height","18px");   
            image.setAttribute("width","36px");   
        	image.setAttribute("class","toolbarbutton-icon");
        	image.setAttribute("src", iconImage);
        
        container.appendChild(badge);
        container.appendChild(image);

      let label = doc.createElement("label");															// Icon Label
        label.setAttribute("class","toolbarbutton-text");
        label.setAttribute("value","Weather");

      node.appendChild(container);
      node.appendChild(label);

    },

    /****************************************************
    *  call when the panel is opened
    ****************************************************/
    viewShowing: function (doc, theView) 
    {
      document = doc;										// Get the document
      view = theView;										// Set the view
      injectUI();											// Write our UI to the panelview
    },

    prefLoad: onPrefLoad,									// Expose onPrefLoad to main
    updateWeather: onUpdateWeather							// Expose onUpdateWeather to main
  };
}

exports.WeatherWidget = WeatherWidget;						// Export Weather Widget as Module
