Converter = {

  /****************************************************
  * change miles to kilometers
  ****************************************************/
  milesToKilometers: function (miles) {
	return (miles * 1.6).toFixed(1);
  },

  /****************************************************
  * change fahrenheit to celsius
  ****************************************************/
  fahrenheitToCelsius: function (F) {
    return ((F - 32)*(5/9)).toFixed(0);
  }

};

exports.Converter = Converter;