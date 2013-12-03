let PreferencesService = require("sdk/preferences/service");

Preferences = {
  //use numbers to denote which city they belong to
  numbers: ['One', 'Two', 'Three', 'Four', 'Five'],

  /*************************************************************
  * Used to easily manage different cities preference names
  *************************************************************/
  prefKey: function (object) {
    return "msu.weather.city" + this.numbers[object.rank] + "WOEID";
  },

  /*************************************************************
  * Gets the city's woeid, returns -1 on failure
  *************************************************************/
  getWOEID: function (object) {
    return PreferencesService.get(this.prefKey(object), "-1");
  },

  /*************************************************************
  * Sets a cities woeid preference, resets the prefernce
  * if the value is ''
  *************************************************************/
  setWOEID: function (object) {
    if (object.woeid == '') {
      PreferencesService.reset(this.prefKey(object));
    } else {
      PreferencesService.set(this.prefKey(object), object.woeid.toString());
    }
  },

  /*************************************************************
  * Gets the users preference for Distance units, returns -1
  * on failure
  *************************************************************/
  getDistanceUnit: function() {
    return PreferencesService.get("msu.weather.DistanceUnit", "-1");
  },

  /*************************************************************
  *  Sets the users preference for Distance units
  *************************************************************/
  setDistanceUnit: function (object) {
    PreferencesService.set("msu.weather.DistanceUnit", object);
  },

  /*************************************************************
  * Gets the users preference for Temperature units, returns -1
  * on failure
  *************************************************************/
  getTemperatureUnit: function() {
    return PreferencesService.get("msu.weather.TemperatureUnit", "-1");
  },

  /*************************************************************
  * Sets the users preference for Temperature units
  *************************************************************/
  setTemperatureUnit: function (object) {
    PreferencesService.set("msu.weather.TemperatureUnit", object);
  }
};

exports.Preferences = Preferences;
