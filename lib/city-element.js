//all require goes here for dom-helper etc...
const { Cc, Ci, Cu, Cr, Cm, components } = require('chrome');

var sdkWindows = require('sdk/windows').browserWindows;
var sdkWindowUtils = require('sdk/window/utils');

var DOMHelper = require('./dom-helper').DOMHelper;
var WindowManager = require('./window-manager').WindowManager;



/*********************************************
* City Element
*********************************************/
function cityElement() {

  this.name = '';
  this.woeid = ''; 
  this.rank = '';
  this.image = '';
  this.temp = '';
  this.humidity = '';
  this.vis = '';
  this.windSpeed = ''; 
}

/***************************************
* redirect the user to the appr. yahoo page 
***************************************/
cityElement.prototype.onClickName = function() 
{		
    //window.open('http://weather.yahoo.com/_/_/_-'+this.woeid+'/','_newtab');
};

/***************************************
* Delete the city
***************************************/	
cityElement.prototype.onClickX = function() 
{		
    //(CE.cM).removeCity(CE.woeid); 
};

/***************************************
* Make the city the current location
***************************************/	
cityElement.prototype.onClickStar = function()
{
	//(CE.cM).promoteToCurrentCity(CE.woeid);
}

/***************************************
* Get WOEID
***************************************/	
cityElement.prototype.onGetWoeid = function(cityOrZip)
{
    this.name = 'Test City';
    this.woeid = '1'; 
    this.image = 'cloudy.png';
    this.temp = '75';
    this.humidity = '12';
    this.vis = '1';
    this.windSpeed = '10'; 
    

	var url = "http://where.yahooapis.com/v1/places.q('"+cityOrZip+"')?format=json&appid=[S.acCMXV34GqNtuNg3WK590qQsnmF2LBDx2inBUwRZTU3dlVYrlyBN6hBJaDi4itcg--]"
	  
	var Request = require("sdk/request").Request;
	Request({
		    url: url,
		    onComplete: function (response) 
		    {
		      console.log("complete");
		      let txt = response.text.replace(/<[^>]+>\s*$/,"");
		      let json = JSON.parse(txt);
		      if(response.status === 200)
		      { 
		
		        this.woeid = json.places.place[0].woeid;
		        var url = "http://weather.yahooapis.com/forecastrss?w="+this.woeid+"&u=f"
	
				console.log("inside forcat");
				var Request = require("sdk/request").Request;
			    Request({
			      url: url,
			      onComplete: function (response) 
			      {
			        let txt = response.text;
			        console.log(txt);
			        this.name = txt[4];
			      }
			    }).get(); 
			
		      }
		    } 
     }).get();
}

/***************************************
/* Get Forecast
***************************************/	
cityElement.prototype.onGetForecast = function()
{
    var url = "http://weather.yahooapis.com/forecastrss?w="+this.woeid+"&u=f"
	
	console.log("inside forcat");
	var Request = require("sdk/request").Request;
    Request({
      url: url,
      onComplete: function (response) 
      {
        let txt = response.text;
        console.log(txt);
      }
    }).get();
}

exports.cityElement = cityElement;
