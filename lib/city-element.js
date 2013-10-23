//all require goes here for dom-helper etc...
const { Cc, Ci, Cu, Cr, Cm, components } = require('chrome');

var sdkWindows = require('sdk/windows').browserWindows;
var sdkWindowUtils = require('sdk/window/utils');

var DOMHelper = require('./dom-helper').DOMHelper;
var WindowManager = require('./window-manager').WindowManager;



/*********************************************
* City Element
*********************************************/
function cityElement(_cM) {

  this.dom = new DOMHelper();
  this.cM = _cM;

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
    window.open('http://weather.yahoo.com/_/_/_-'+this.woeid+'/','_newtab');
};

/***************************************
* Delete the city
***************************************/	
cityElement.prototype.onClickX = function() 
{		
    (this.cM).removeCity(this.woeid); 
};

/***************************************
* Make the city the current location
***************************************/	
cityElement.prototype.onClickStar = function()
{
	(this.cM).promoteToCurrentCity(this.woeid);
}

/***************************************
* Get WOEID
***************************************/	
cityElement.prototype.onGetWoeid = function(cityOrZip)
{
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

///***************************************
//* Update the city weather info
//***************************************/
//cityElement.prototype.updateWeather = function()
//{
//    //call to main and have code here to update
//}
//

cityElement.prototype.outputElement = function(inEdit) 
{     
    var tbl = this.dom.createElement('div'); 
    if(this.rank==0) 
    { 
      tbl.className="primarycityelement"; 
      tbl.setAttribute("style","border-radius: 5px;border: 1px solid white;background-color:#C6E2FF;box-shadow: 0px 0px 2px #111161;margin: auto;margin-top: 5px;margin-bottom: 5px;width: 97%;");
    }
    else 
    { 
      tbl.className="cityelement";
      tbl.setAttribute("style","margin: auto;width: 97%;margin-bottom: 5px;border-top: 2px solid lightgray; width: 180px;"); 
    }
    	var tbdy = this.dom.createElement('div');
    		var tr1 = this.dom.createElement('div');
    			var td1_1 = this.dom.createElement('div');
                td1_1.className="iconcolumn";
                td1_1.setAttribute("style","text-align: left; width: 100px;");

    				var div1_1_1 = this.dom.createElement('div');
    				div1_1_1.innerHTML = this.temp;
                    div1_1_1.className="icon";
                    div1_1_1.setAttribute("style","width: 65px;height: 30px;border: 1px solid gray;background-size: 100% 100%;color: #FF5800;font-weight: bold;font-size: 20px;");                    

                    div1_1_1.style.backgroundImage = "url("+this.image+")"
    			var td1_2 = this.dom.createElement('div');
                td1_2.className="namecolumn, link";
                td1_2.setAttribute("style","text-align: left; width: 100px;word-wrap: break-word;");

				td1_2.innerHTML = this.name;
				td1_2.addEventListener('click', this.onClickName);
				
    		var tr2 = this.dom.createElement('div');
    			var td2_1 = this.dom.createElement('div');
                td2_1.className="invisible";
                if(inEdit == 1){ td2_1.setAttribute("style","text-align: right; width: 100px; display: none;")}
                else { td2_1.setAttribute("style","text-align: right; width: 100px; display: both;")}
                td2_1.className="detailcolumn";
                

    				var li2_1_1 = this.dom.createElement('li');
                    li2_1_1.setAttribute("style","list-style-type: none;font-size: 10px;");
					li2_1_1.innerHTML = "Humidity: "+ this.humidity + "%";
					var li2_1_2 = this.dom.createElement('li');
					li2_1_2.setAttribute("style","list-style-type: none;font-size: 10px;");
					li2_1_2.innerHTML = "Visibility: "+ this.vis;
					var li2_1_3 = this.dom.createElement('li');
					li2_1_3.setAttribute("style","list-style-type: none;font-size: 10px;");
					li2_1_3.innerHTML = "windspeed: "+ this.windSpeed + "mph";
					
    			var td2_2 = this.dom.createElement('div');
                td2_2.className="buttonscolumn; invisible";

				if(inEdit == 1){ td2_2.setAttribute("style","max-width: 10px; display: both;");} 
    			else { td2_2.setAttribute("style","max-width: 10px; display: none;");} 
    				var img2_2_1 = this.dom.createElement('img');
					img2_2_1.innerHTML = "I1";
					if(this.rank==0) { img2_2_1.src="star.png" }
					else { img2_2_1.src="staroutline.png" }
					img2_2_1.width=28; 
    				img2_2_1.addEventListener('click', this.onClickStar);
					var img2_2_2 = this.dom.createElement('img');
					img2_2_2.innerHTML = "I2";
					img2_2_2.src="x.png" 
    				img2_2_2.width=25; 
    				img2_2_2.addEventListener('click', this.onClickX);
    
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

exports.cityElement = cityElement;
