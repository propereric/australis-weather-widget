var ChromeConstants = require("./xul-manager/chrome-constants.js").ChromeConstants;
var data = require("sdk/self").data;
//var AttachTo = require("sdk/content/mod").attachTo;
//var Style = require("sdk/stylesheet/style").Style;

/****************
Widget Requires
****************/
const CityElement = require('./city-element').cityElement;
let Prefs = require('./preferences').Preferences;
let pageWorkers = require("sdk/page-worker");


function WeatherWidget () {

  let cityList = new Array();
  let iconImage = require("sdk/self").data.url("icon.png");
  
  function customizeClicked(event) {

    console.log("customizeClicked");

    let customizeButton = document.getElementById("msu-customize-button");
    let textbox = document.getElementById("msu-textbox");
    let addCityButton = document.getElementById("msu-add-city-button");
    
    if(customizeButton.innerHTML == "Customize"){
      customizeButton.innerHTML = "Exit Customization";
      textbox.style.display = '';
      addCityButton.style.display = '';
    }
    else{
      customizeButton.innerHTML = "Customize";
      textbox.style.display = "none";
      addCityButton.style.display = "none";
    }
  
    outputCityElements();
  }


  function addCityClicked(event) {
    
    let textbox = document.getElementById("msu-textbox");

    if(cityList.length < 5)  {

      cityList[cityList.length] = new CityElement();
      cityList[cityList.length-1].rank = cityList.length-1;
      getWoeid(cityList.length-1, String(textbox.value), 10);
    }

    outputCityElements();
    
    textbox.value = '';
  }




  function removeCity(woeid) {

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




  function promoteToFavoriteCity(woeid) {

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




  function getWoeid(i, cityOrZip, numAllowedFails) {

    cityList[i].name = 'Loading...';
    cityList[i].woeid = ''; 
    cityList[i].image = returnImage(3200);
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
		          getForecast(i);
		        }
		        else {
		          cityList[i].name = "Invalid Input";
		        }
		      }
		      if(response.status === 0) {
		        getWoeid(i, cityOrZip, numAllowedFails-1)
		      }
		
		      outputCityElements();
		    } 
      }).get();
    }
  }




  function getForecast(i) {

    var url = "http://weather.yahooapis.com/forecastrss?w="+cityList[i].woeid+"&u=f"
	
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

                if(document) {
                    var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
                    var ctx = canvas.getContext("2d");

                    var img = document.createElementNS("http://www.w3.org/1999/xhtml", "img");

                    img.onload = function() {
                      ctx.drawImage(img, 0, 0, img.width, img.height, 0,0,canvas.width,canvas.height);

                      ctx.font="100px Arial";
                      ctx.fillStyle = 'red';
                      ctx.fillText(cityList[i].temp+" F",0,canvas.height,canvas.width,canvas.height);
                      ctx.strokeStyle = 'black';
                      ctx.strokeText(cityList[i].temp+" F",0,canvas.height,canvas.width,canvas.height);
                      cityList[i].image = canvas.toDataURL();
                      if( i ==0 ){ onSetIcon(); }
                      outputCityElements();
                    };

                    img.src = cityList[i].image;
	            }
	            else {
	            
	              var y = pageWorkers.Page({
                    contentURL: require("sdk/self").data.url("page_worker.html"),
                    contentScriptFile: require("sdk/self").data.url("image_create.js"),
                    onMessage: function(iObject) {
                      cityList[i].image = iObject;
                      if( i == 0 ){ iconImage = iObject }
                    }
                  });

                  y.port.emit("Image", {temp: cityList[i].temp,image: cityList[i].image});

	            }
              }
              });

              x.port.emit("Parse", txt);
            }
  			if(response.status != 200){
              cityList[i].name = 'Failed to Retrieve Weather';
            }
            if(document) { outputCityElements(); }
      }
    }).get();
  }

  function onUpdateWeather() {

    for(i=0;i<cityList.length;i++)
    {
      getForecast(i);
    }
  }


  function onPrefLoad() {
    
    //load from preferences
    for(i=0;i<5;i++) {
      var x = Prefs.getWOEID({woeid: '', rank: i});
      if(x != "-1" && x) {
        cityList[i] = new CityElement();
        cityList[i].rank = i;
        cityList[i].woeid = x;
      }
    }

    onUpdateWeather();
  }


  function onPrefWrite() {
    
    //reset all preferences
    for(i=0;i<5;i++) {
      Prefs.setWOEID({woeid: '', rank: i});
    }

    //write to preferences
    for(i=0;i<cityList.length;i++) {
      Prefs.setWOEID({woeid: cityList[i].woeid, rank: cityList[i].rank});
    }
  }

  
  function onSetIcon() {
    if(cityList.length > 0) {
      document.getElementById("msu-weather-icon").setAttribute("src",cityList[0].image);
      document.getElementById("msu-weather-icon").setAttribute("style","border: solid 1px gray;");
    }
    else {
      document.getElementById("msu-weather-icon").setAttribute("src",require("sdk/self").data.url("icon.png"));
      document.getElementById("msu-weather-icon").setAttribute("style","border: none;");
    }
  }




  function returnImage(conditionCode) {

    return require("sdk/self").data.url(""+conditionCode+".png");
  }




  function outputCityElements() {

    onSetIcon();

    let customizeButton = document.getElementById("msu-customize-button");
    let cityContainer = document.getElementById("msu-city-container");

    cityContainer.innerHTML = '';
    onPrefWrite();

    for(i=0;i<cityList.length;i++)
    {
      if(customizeButton.innerHTML == "Exit Customization") 
      {
        cityContainer.appendChild(outputElement(i, 1));
      }
      else 
      {
        cityContainer.appendChild(outputElement(i, 0));
      }
    }
  }




  function outputElement(i, inEdit) {

    let tbl = document.createElement('vbox'); 
      
    if(cityList[i].rank == 0){ tbl.setAttribute("style","text-align: center; border-radius: 5px;border: 1px solid white;background-color:#C6E2aF; margin-top: 5px; margin-bottom: 15px; box-shadow: 0px 2px 8px #888888; width: 200px"); } /******STYLE*****/
    else { tbl.setAttribute("style","text-align: center; margin-bottom: 15px; border: 1px solid gray; background-color: white; border-radius: 5px; box-shadow: 0px 2px 8px #888888; width: 200px"); } /******STYLE*****/

    let tr1 = document.createElement("vbox");
      let td1_1 = document.createElement("label");
        td1_1.setAttribute("style","font-weight: bold;"); /******STYLE*****/
        td1_1.className = "text-link";
        td1_1.href = 'http://weather.yahoo.com/_/_/_-'+cityList[i].woeid+'/';
        td1_1.innerHTML = cityList[i].name;

    let tr2 = document.createElement("vbox");
      tr2.align= "center";
        let td2_1 = document.createElement("image");
          td2_1.setAttribute("style","border: 1px solid gray;");/******STYLE*****/
          td2_1.setAttribute("src", cityList[i].image);
          td2_1.height = "80px";
          td2_1.width = "180px";
        let td2_2 = document.createElement("label");
          td2_2.innerHTML = "Current Temperature: "+cityList[i].temp+" F";

    let tr3 = document.createElement("vbox");
      let td3_1 = document.createElement("label");
        td3_1.innerHTML = "Humidity: "+ cityList[i].humidity + "%";
      let td3_2 = document.createElement("label");
        td3_2.innerHTML = "Visibility: "+ cityList[i].vis;
      let td3_3 = document.createElement("label");
        td3_3.innerHTML = "Wind Speed: "+ cityList[i].windSpeed + " mph";

    let tr4 = document.createElement("vbox");
      let temp1 = document.createElement("hbox");
      tr4.align= "center";

      let td4_1 = document.createElement("image");
        td4_1.addEventListener('click',function(){ promoteToFavoriteCity(cityList[i].woeid);});
        td4_1.width = 20;
        if(cityList[i].rank == 0) {
          td4_1.setAttribute("src", require("sdk/self").data.url("star.png"));
        }
        else {
          td4_1.setAttribute("src", require("sdk/self").data.url("staroutline.png"));
        }
      let td4_2 = document.createElement("image");
        td4_2.setAttribute("src", require("sdk/self").data.url("x.png"));
        td4_2.width = 15;
        td4_2.addEventListener('click',function(){ removeCity(cityList[i].woeid);});
   
    tbl.appendChild(tr1);
      tr1.appendChild(td1_1);
    if(inEdit == 0) {
      tbl.appendChild(tr2);
        tr2.appendChild(td2_1);
        tr2.appendChild(td2_2);
      tbl.appendChild(tr3);
          tr3.appendChild(td3_1);
          tr3.appendChild(td3_2);
          tr3.appendChild(td3_3);
    }
    if(inEdit == 1) {
      tbl.appendChild(tr4);
        tr4.appendChild(temp1);
          temp1.appendChild(td4_1);
          temp1.appendChild(td4_2);

    }
	   				
    return tbl;
  }



  /******************************
  Manages Widget Defaults etc...
  ******************************/

  let document = null;
  let view = null;

  function injectUI () {

    let customizeButton = document.createElement("toolbarbutton");
      customizeButton.setAttribute('style','margin-bottom: 10px; box-shadow: 0px 3px 8px #888888; background-color: gray; color: white'); /******STYLE*****/
      customizeButton.setAttribute("id", "msu-customize-button");
      customizeButton.innerHTML = "Customize";
      customizeButton.addEventListener("click", customizeClicked);
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
      addCityButton.setAttribute('style','color: white; background-color: gray; border-radius: 7px;');
      addCityButton.style.display = "none"; /******STYLE*****/
      addCityButton.setAttribute("id", "msu-add-city-button");
      addCityButton.innerHTML = "Add City";
      addCityButton.addEventListener("click", addCityClicked);
      view.appendChild(addCityButton);

    outputCityElements();
  }

  return {
    CONFIG: {
        id: "australis-weather-widget",
        label: 'Weather',
        tooltiptext: 'Weather Widget v0.1',
        type: "view",
        viewId: "PanelUI-msu-weather",
        removable: true,
        defaultArea: ChromeConstants.AREA_PANEL()
    },

    widgetCreated: function(node) {

      let doc = node.ownerDocument;
      let img = doc.createElement("image");
        img.setAttribute("class", "toolbarbutton-icon");
        img.id = "msu-weather-icon";
        img.setAttribute("src", iconImage);
        img.setAttribute("width", "55px");
        img.setAttribute("height", "30px");

        let lbl = doc.createElement("label");
        lbl.id = "msu-weather-label";
        lbl.setAttribute("class", "toolbarbutton-label toolbarbutton-text"); 
        lbl.setAttribute("flex", "1");
        lbl.setAttribute("value", "Weather");

        node.appendChild(img);
        node.appendChild(lbl);
    },

    viewShowing: function (doc, theView) {

      // Get the document
      document = doc;

      // Load our stylesheet
      //var css = data.url('test-widget-styles.css'); // Resource URL to our stylesheet
      // let xmlPI = document.createProcessingInstruction("xml-stylesheet", 'hfref="test-widget-styles.css" type="text/css"'); // Create an XML processing instruction for a stylesheet
      // document.insertBefore(xmlPI, document.firstElementChild);

      //Stylesheet.loadSheet(document.parentWindow, css, "agent");
      
      // var style = Style({
      //   source: "#msu-foo-lbl-counter {background-color: red; color: green; }"
      // });
      // attachTo(style, document.parentWindow);
       
      // Set the view
      view = theView;

      // Write our UI to the panelview
      injectUI();
    },

    prefLoad: onPrefLoad,
    updateWeather: onUpdateWeather
  };
}

exports.WeatherWidget = WeatherWidget;
