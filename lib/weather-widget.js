var ChromeConstants = require("./xul-manager/chrome-constants.js").ChromeConstants;
var data = require("sdk/self").data;

/****************
Widget Requires
****************/
const CityElement = require('./city-element').cityElement;
let Prefs = require('./preferences').Preferences;
let pageWorkers = require("sdk/page-worker");


function WeatherWidget () {

  let document = null;                  	//holds document
  let view = null;                      	//holds first node
  let cityList = new Array();           	//create array to hold cities
  let iconImage = data.url("icon.png"); 	//default icon 
  let badgeTemp = "";                   	//default temperature to display in badge (shows no badge)
  let tempUnit = "Fahrenheit";
  let distanceUnit = "Imperial";


  /****************************************************
  * change miles to kilometers
  ****************************************************/
  function milesToKilometers(miles) 
  {
    return (miles * 1.6).toFixed(1);
  }

  /****************************************************
  * change fahrenheit to celsius
  ****************************************************/
  function fahrenheitToCelsius(F) 
  {
    return ((F - 32)*(5/9)).toFixed(0);
  }

  /****************************************************
  * when press toggle button to change dist units
  ****************************************************/
  function toggleDistanceClicked(event) 
  {
    let toggleLabel = document.getElementById("msu-toggle-button-distance-label");

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
    event.preventDefault();
  }

  /****************************************************
  * when press toggle button to change temp units
  ****************************************************/
  function toggleTempClicked(event) 
  {
    let toggleLabel = document.getElementById("msu-toggle-button-label");

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
    event.preventDefault();
  }

  /****************************************************
  * when press customize button switch to edit view
  ****************************************************/
  function customizeClicked(event) 
  {

    let customizeLabel = document.getElementById("msu-customize-label");
    let textbox = document.getElementById("msu-textbox");
    let addCityButton = document.getElementById("msu-add-city-button");
    let toggleHolder = document.getElementById("msu-toggle-holder");
    let toggleDistanceHolder = document.getElementById("msu-toggle-distance-holder");
    
    if(customizeLabel.getAttribute("value") == "Customize")
    {
      customizeLabel.setAttribute("value","Exit Customization");
      textbox.style.display = '';
      addCityButton.style.display = '';
      toggleHolder.style.display = '';
      toggleDistanceHolder.style.display = '';
    }
    else
    {
      customizeLabel.setAttribute("value","Customize");
      textbox.style.display = "none";
      addCityButton.style.display = "none";
      toggleHolder.style.display = "none";
      toggleDistanceHolder.style.display = "none";
    }

    outputCityElements();
    event.preventDefault();
  }


  /****************************************************
  * when click add city, create a new city element
  ****************************************************/
  function addCityClicked(event) 
  {
    
    let textbox = document.getElementById("msu-textbox");

    if(cityList.length < 5)  
    {
      cityList[cityList.length] = new CityElement();
      cityList[cityList.length-1].rank = cityList.length-1;
      getWoeid(cityList.length-1, String(textbox.value), 10);
    }

    outputCityElements();
    textbox.value = '';
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


  /****************************************************
  * get the woeid for the zip or city name
  ****************************************************/
  function getWoeid(i, cityOrZip, numAllowedFails) 
  {
    cityList[i].name = 'Loading...';
    cityList[i].woeid = ''; 
    cityList[i].image = returnImage(3200);
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
                cityList[i].image = returnImage(wObject.conditionCode);

                if(i==0) 
                { 
                  if( document )
                  { 
                    onSetIcon();
                  }
                  else 
                  {
                    iconImage = cityList[i].image;
                    badgeTemp = cityList[i].temp+" F";
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
    tempUnit = Prefs.getTemperatureUnit();
    distanceUnit = Prefs.getDistanceUnit();

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
      document.getElementById("msu-weather-image").setAttribute("src",returnIconImage(cityList[0].code));
      document.getElementById("msu-weather-image").setAttribute("style","border: solid 1px gray;");
      if(tempUnit == "Fahrenheit"){ document.getElementById("msu-weather-badge").setAttribute("badge",cityList[0].temp+" F");}
      else { document.getElementById("msu-weather-badge").setAttribute("badge",fahrenheitToCelsius(cityList[0].temp)+" C"); }
      iconImage = cityList[0].image;
      if(tempUnit == "Fahrenheit") { badgeTemp = cityList[0].temp+" F"; }
      else { badgeTemp = fahrenheitToCelsius(cityList[0].temp)+" C"; }
    }
    else 
    {
      document.getElementById("msu-weather-image").setAttribute("src", data.url("icon.png"));
      document.getElementById("msu-weather-image").setAttribute("style","border: none;");
      document.getElementById("msu-weather-badge").setAttribute("badge","");
      iconImage = data.url("icon.png");
      badgeTemp = "";
    }
  }


  /****************************************************
  * return the image for the city elements
  ****************************************************/
  function returnImage(conditionCode) 
  {
    return require("sdk/self").data.url(""+conditionCode+".png");
  }


  /****************************************************
  * return the image for the icon
  ****************************************************/
  function returnIconImage(conditionCode) 
  {
    return require("sdk/self").data.url(""+conditionCode+".png");
  }


  /****************************************************
  * output the city elements
  ****************************************************/
  function outputCityElements() 
  {
    if(document)
    { 
      onSetIcon(); 
      document.getElementById("msu-toggle-button-distance-label").setAttribute("value",distanceUnit);
      document.getElementById("msu-toggle-button-label").setAttribute("value",tempUnit);
    }

    let customizeLabel = document.getElementById("msu-customize-label");
    let cityContainer = document.getElementById("msu-city-container");

    while(cityContainer.hasChildNodes())
    {
      cityContainer.removeChild(cityContainer.firstChild);
    }

    onPrefWrite();//really after each change -> maybe move to multiple locations

    for(i=0;i<cityList.length;i++)
    {
      if(customizeLabel.getAttribute("value") == "Exit Customization") 
      {
        cityContainer.appendChild(outputElement(i, 1));
      }
      else 
      {
        cityContainer.appendChild(outputElement(i, 0));
      }
    }
  }


  /****************************************************
  * generate the code to output city elements
  ****************************************************/
  function outputElement(i, inEdit) 
  {
    let tbl = document.createElement('vbox');
    if(cityList[i].rank == 0){ tbl.setAttribute("class","msu-city-element msu-city-element-primary"); }
    else { tbl.setAttribute("class","msu-city-element msu-city-element-secondary"); }


    let imageHolder = document.createElement("vbox");
    imageHolder.setAttribute("class","msu-city-image-holder");
    imageHolder.align= "center";
        let image = document.createElement("vbox");
        image.setAttribute("class","msu-city-image");
        image.setAttribute("style", "background-image: url("+cityList[i].image+");");
        image.height = "100px";
        image.width = "200px";
        
          let cityName = document.createElement("label");

          if(cityList[i].rank == 0){ cityName.setAttribute("class","text-link msu-city-element-primary msu-city-label"); }
          else { cityName.setAttribute("class","text-link msu-city-element-secondary msu-city-label"); }

          cityName.href = 'http://weather.yahoo.com/_/_/_-'+cityList[i].woeid+'/';
          cityName.setAttribute("value",cityList[i].name);

          let temperature = document.createElement("label");
          if(tempUnit == "Fahrenheit"){ temperature.setAttribute("value",""+cityList[i].temp+" F"); }
          else { temperature.setAttribute("value",fahrenheitToCelsius(cityList[i].temp)+" C"); }
          temperature.setAttribute("class","msu-city-temp");


    let detailHolder = document.createElement("vbox");
    detailHolder.setAttribute("class","msu-city-label-holder");
    detailHolder.align = "left";

      let wind = document.createElement("label");
      wind.setAttribute("class","msu-city-label");
      if(distanceUnit == "Imperial"){ wind.setAttribute("value","Wind Speed: "+ 1*cityList[i].windSpeed + " mph"); }
      else { wind.setAttribute("value","Wind Speed: "+ milesToKilometers(cityList[i].windSpeed) + " km/h"); }
        
      let visibility = document.createElement("label");
      visibility.setAttribute("class","msu-city-label");
      visibility.setAttribute("value","Visibility: "+ cityList[i].vis + " mi");
      if(distanceUnit == "Imperial"){ visibility.setAttribute("value","Visibility: "+ 1*cityList[i].vis + " mi"); }
      else { visibility.setAttribute("value","Visibility: "+ milesToKilometers(cityList[i].vis) + " km"); }
        
      let humidity = document.createElement("label");
      humidity.setAttribute("class","msu-city-label");
      humidity.setAttribute("value","Humidity: "+ cityList[i].humidity + "%");
        

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
   
   
    if(inEdit == 0) {
      tbl.appendChild(imageHolder);
      imageHolder.appendChild(image);
        image.appendChild(cityName);
        image.appendChild(temperature);
        image.appendChild(detailHolder);
          detailHolder.appendChild(wind);
          detailHolder.appendChild(visibility);
          detailHolder.appendChild(humidity);
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
    let customizeButtonHolder = document.createElement("hbox");
      customizeButtonHolder.setAttribute("id","customizebuttonholder");
      customizeButtonHolder.addEventListener("click", customizeClicked);
      customizeButtonHolder.setAttribute("oncommand", "return false;");

      let customizeImage = document.createElement("image");
	    customizeImage.setAttribute("src",data.url("gear.png"));
	    customizeImage.setAttribute("id","customizeimage");
	  customizeButtonHolder.appendChild(customizeImage);

      let customizeButton = document.createElement("toolbarbutton");
        customizeButton.setAttribute("id", "msu-customize-button");
        customizeButton.setAttribute("oncommand", "return false;");
        customizeButton.align = "left";

        let customizeLabel = document.createElement("label");
          customizeLabel.setAttribute("id", "msu-customize-label");
          customizeLabel.setAttribute("value","Customize");

        customizeButton.appendChild(customizeLabel);
      customizeButtonHolder.appendChild(customizeButton);
    view.appendChild(customizeButtonHolder);

    let toggleHolder = document.createElement("hbox");
    toggleHolder.setAttribute("id","msu-toggle-holder");
    toggleHolder.style.display = "none";
    toggleHolder.align = "center";

      let toggleLabel = document.createElement("label");
      toggleLabel.setAttribute("class", "msu-toggle-label");
      toggleLabel.setAttribute("value","Temperature Unit: ");
      
      let toggleButton = document.createElement("label");
      toggleButton.setAttribute("class", "msu-toggle-button");
      toggleButton.setAttribute("id", "msu-toggle-button-label");
      toggleButton.setAttribute("value",tempUnit);
      toggleButton.align = "right";
      toggleButton.addEventListener("click", toggleTempClicked);
    
    toggleHolder.appendChild(toggleLabel);  
    toggleHolder.appendChild(toggleButton);
    view.appendChild(toggleHolder);


    let toggleDistanceHolder = document.createElement("hbox");
    toggleDistanceHolder.setAttribute("id","msu-toggle-distance-holder");
    toggleDistanceHolder.style.display = "none";
    toggleDistanceHolder.align = "center";

      let toggleDistanceLabel = document.createElement("label");
      toggleDistanceLabel.setAttribute("class", "msu-toggle-label");
      toggleDistanceLabel.setAttribute("value","Measurement Unit: ");
      
      let toggleDistanceButton = document.createElement("label");
      toggleDistanceButton.setAttribute("class", "msu-toggle-button");
      toggleDistanceButton.setAttribute("id", "msu-toggle-button-distance-label");
      toggleDistanceButton.setAttribute("value",distanceUnit);
      toggleDistanceButton.align = "center";
      toggleDistanceButton.addEventListener("click", toggleDistanceClicked);
    
    toggleDistanceHolder.appendChild(toggleDistanceLabel);  
    toggleDistanceHolder.appendChild(toggleDistanceButton);
    view.appendChild(toggleDistanceHolder);


    let inputHolder = document.createElement("hbox");
      inputHolder.setAttribute("id","msu-input-holder");

      let textbox = document.createElement("textbox");
        textbox.style.display = "none";
        textbox.setAttribute("id", "msu-textbox");
        textbox.setAttribute("placeholder", "Enter Zip/City");
        inputHolder.appendChild(textbox);

      let addCityButton = document.createElement("toolbarbutton");
        addCityButton.style.display = "none";
        addCityButton.setAttribute("id", "msu-add-city-button");
        addCityButton.setAttribute("label","Add");
        addCityButton.addEventListener("click", addCityClicked);
        addCityButton.setAttribute("oncommand", "return false;");
        inputHolder.appendChild(addCityButton);
 
      view.appendChild(inputHolder);

   
    let cityContainer = document.createElement("vbox");
      cityContainer.setAttribute("id", "msu-city-container");
      cityContainer.align= "center";
      view.appendChild(cityContainer);

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

      node.setAttribute("style","margin: 0px; padding: 0px;");

      let doc = node.ownerDocument;

      var css = data.url('styles.css');                                                                 // Resource URL to our stylesheet
      let xmlPI = doc.createProcessingInstruction('xml-stylesheet', 'href="'+css+'" type="text/css"');  // Create an XML pi
      doc.insertBefore(xmlPI, doc.firstElementChild);													// Insert instruction 

      let container = doc.createElement("vbox");
        container.id = "msu-weather-container";      													// Container for Items
        container.setAttribute("class","toolbarbutton-badge-container");
        container.align = "start";
        container.pack = "end";
        
      	let badge = doc.createElement("vbox"); 															// Badge
            badge.id = "msu-weather-badge";     
        	badge.setAttribute("class","toolbarbutton-badge");
            badge.setAttribute("badge", badgeTemp);
      
      	let image = doc.createElement("image");															// Icon Image
            image.id = "msu-weather-image"; 
            image.setAttribute("height","18px");   
            image.setAttribute("width","40px");   
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
