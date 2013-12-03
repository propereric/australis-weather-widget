let Convert = require('./converter').Converter;

IconHandler = {

  /****************************************************
  * return the image for the city elements
  ****************************************************/
  returnImage: function(conditionCode) 
  {
    return require("sdk/self").data.url(""+conditionCode+".png");
  },

  /****************************************************
  * return the image for the icon
  ****************************************************/
  returnIconImage: function (conditionCode) 
  {
    return require("sdk/self").data.url("iconImages/"+conditionCode+".png");
  },

  /****************************************************
  * sets the live icon based on the condition code
  * passed in
  ****************************************************/
  setToOn: function (doc, code, temp, unit) 
  {
    if(unit == "Fahrenheit") {
	  doc.getElementById("msu-weather-image").setAttribute("src", require("sdk/self").data.url("iconImages/"+code+".png"));
      doc.getElementById("msu-weather-image").setAttribute("style","border: solid 1px gray;");
      doc.getElementById("msu-weather-badge").setAttribute("badge",temp+"°");
      return temp+"°";
    }
    else {
      doc.getElementById("msu-weather-image").setAttribute("src", require("sdk/self").data.url("iconImages/"+code+".png"));
      doc.getElementById("msu-weather-image").setAttribute("style","border: solid 1px gray;");
      doc.getElementById("msu-weather-badge").setAttribute("badge",Convert.fahrenheitToCelsius(temp)+"°");
      return Convert.fahrenheitToCelsius(temp)+"°";
    }
  },

  /****************************************************
  * sets the live icon to a default image
  ****************************************************/
  setToDefault: function (doc)
  {
    doc.getElementById("msu-weather-image").setAttribute("src", require("sdk/self").data.url("icon.png"));
    doc.getElementById("msu-weather-image").setAttribute("style","border: none;");
    doc.getElementById("msu-weather-badge").setAttribute("badge","");
    return "";
  }

};

exports.IconHandler = IconHandler;