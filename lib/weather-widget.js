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
  

  /****************************************************
  * when press customize button switch to edit view
  ****************************************************/
  function customizeClicked(event) 
  {

    let customizeLabel = document.getElementById("msu-customize-label");
    let textbox = document.getElementById("msu-textbox");
    let addCityButton = document.getElementById("msu-add-city-button");
    
    if(customizeLabel.getAttribute("value") == "Customize")
    {
      customizeLabel.setAttribute("value","Exit Customization");
      textbox.style.display = '';
      addCityButton.style.display = '';
    }
    else
    {
      customizeLabel.setAttribute("value","Customize");
      textbox.style.display = "none";
      addCityButton.style.display = "none";
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
      document.getElementById("msu-weather-badge").setAttribute("badge",cityList[0].temp+" F");
      iconImage = cityList[0].image;
      badgeTemp = cityList[0].temp+" F";
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
    }

    let customizeLabel = document.getElementById("msu-customize-label");
    let cityContainer = document.getElementById("msu-city-container");

    while(cityContainer.hasChildNodes())
    {
      cityContainer.removeChild(cityContainer.firstChild);
    }

    onPrefWrite();

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
      
    if(cityList[i].rank == 0)
    { 
      tbl.setAttribute("class","msu-primary-element"); 
    } 
    else 
    { 
      tbl.setAttribute("class","msu-secondary-element"); 
    } 

    let tr1 = document.createElement("vbox");
      let td1_1 = document.createElement("label");
        td1_1.setAttribute("class","text-link msu-city-label");
        td1_1.href = 'http://weather.yahoo.com/_/_/_-'+cityList[i].woeid+'/';
        td1_1.setAttribute("value",cityList[i].name);

    let tr2 = document.createElement("vbox");
      tr2.align= "center";
        let td2_1 = document.createElement("image");
          td2_1.setAttribute("class","msu-city-image");
          td2_1.setAttribute("src", cityList[i].image);
          td2_1.height = "80px";
          td2_1.width = "180px";
        let td2_2 = document.createElement("label");
          td2_2.setAttribute("value","Current Temperature: "+cityList[i].temp+" F");
          if(cityList[i].temp > 40) {
            td2_2.setAttribute("style","color: red; font-weight: bold;");
          }
          if(cityList[i].temp >= 30 && cityList[i].temp <= 40) {
            td2_2.setAttribute("style","color: purple; font-weight: bold;");
          }
          if(cityList[i].temp < 30) {
            td2_2.setAttribute("style","color: blue; font-weight: bold;");
          }

    let tr3 = document.createElement("vbox");
      let td3_1 = document.createElement("label");
        td3_1.setAttribute("value","Wind Speed: "+ cityList[i].windSpeed + " mph");
        
      let td3_2 = document.createElement("label");
        td3_2.setAttribute("value","Visibility: "+ cityList[i].vis + " mi");
        
      let td3_3 = document.createElement("label");
        td3_3.setAttribute("value","Humidity: "+ cityList[i].humidity + "%");
        

    let tr4 = document.createElement("vbox");
      let temp1 = document.createElement("hbox");
      tr4.align= "center";

      let td4_1 = document.createElement("image");
        td4_1.addEventListener('click', function(){ promoteToFavoriteCity(cityList[i].woeid);});
        td4_1.width = 20;
        if(cityList[i].rank == 0) 
        {
          td4_1.setAttribute("src", data.url("star.png"));
        }
        else 
        {
          td4_1.setAttribute("src", data.url("staroutline.png"));
        }
      let td4_2 = document.createElement("image");
        td4_2.setAttribute("src", data.url("x.png"));
        td4_2.width = 15;
        td4_2.addEventListener('click',function(){ removeCity(cityList[i].woeid);});
   
    tbl.appendChild(tr1);
      tr1.appendChild(td1_1);
    if(inEdit == 0) 
    {
      tbl.appendChild(tr2);
        tr2.appendChild(td2_1);
        tr2.appendChild(td2_2);
      tbl.appendChild(tr3);
          tr3.appendChild(td3_1);
          tr3.appendChild(td3_2);
          tr3.appendChild(td3_3);
    }
    if(inEdit == 1) 
    {
      tbl.appendChild(tr4);
        tr4.appendChild(temp1);
          temp1.appendChild(td4_1);
          temp1.appendChild(td4_2);

    }
	   				
    return tbl;
  }

  
  /****************************************************
  * inject a basic UI into the panel
  ****************************************************/
  function injectUI () 
  {

    let customizeButton = document.createElement("toolbarbutton");
      customizeButton.setAttribute("id", "msu-customize-button");
      customizeButton.addEventListener("click", customizeClicked);
      customizeButton.setAttribute("oncommand", "return false;");

        let customizeLabel = document.createElement("label");
          customizeLabel.setAttribute("id", "msu-customize-label");
          customizeLabel.setAttribute("value","Customize");

        customizeButton.appendChild(customizeLabel);
      view.appendChild(customizeButton);
   
    let cityContainer = document.createElement("vbox");
      cityContainer.setAttribute("id", "msu-city-container");
      cityContainer.align= "center";
      view.appendChild(cityContainer);

    let textbox = document.createElement("textbox");
      textbox.style.display = "none";
      textbox.setAttribute("id", "msu-textbox");
      textbox.setAttribute("placeholder", "Enter Zip/City");
      view.appendChild(textbox);

    let addCityButton = document.createElement("toolbarbutton");
      addCityButton.style.display = "none";
      addCityButton.setAttribute("id", "msu-add-city-button");
      addCityButton.setAttribute("label","Add City");
      addCityButton.addEventListener("click", addCityClicked);
      addCityButton.setAttribute("oncommand", "return false;");
      view.appendChild(addCityButton);

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

      let doc = node.ownerDocument;

      var css = data.url('styles.css');                                                                 // Resource URL to our stylesheet
      let xmlPI = doc.createProcessingInstruction('xml-stylesheet', 'href="'+css+'" type="text/css"');  // Create an XML pi
      doc.insertBefore(xmlPI, doc.firstElementChild);													// Insert instruction 

      let container = doc.createElement("vbox");      													// Container for Items
        container.setAttribute("class","toolbarbutton-badge-container");
        container.align = "start";
        container.pack = "end";
        
      	let badge = doc.createElement("vbox"); 															// Badge
            badge.id = "msu-weather-badge";     
        	badge.setAttribute("class","toolbarbutton-badge");
            badge.setAttribute("badge", badgeTemp);
            badge.align = "left";
      
      	let image = doc.createElement("image");															// Icon Image
            image.id = "msu-weather-image"; 
            image.setAttribute("height","18px");   
            image.setAttribute("width","40px");   
        	image.setAttribute("class","toolbarbutton-icon");
        	image.setAttribute("src", iconImage);

      	let label = doc.createElement("label");															// Icon Label
        	label.setAttribute("class","toolbarbutton-text");
            label.setAttribute("value","Weather");
        
        container.appendChild(badge);
        container.appendChild(image);
        container.appendChild(label);

      node.appendChild(container);
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
