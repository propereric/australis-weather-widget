let PreferencesService = require("sdk/preferences/service");

Preferences = {
  numbers: ['One', 'Two', 'Three', 'Four', 'Five'],

  prefKey: function (object) {
    return "weather.city" + this.numbers[object.rank] + "WOEID";
  },

  getWOEID: function (object) {
    return PreferencesService.get(this.prefKey(object), "-1");
  },

  setWOEID: function (object) {
    if (object.woeid == '') {
      PreferencesService.reset(this.prefKey(object));
    } else {
      PreferencesService.set(this.prefKey(object), object.woeid.toString());
    }
  },

  getDistanceUnit: function() {
    return PreferencesService.get("weather.cityDistanceUnit", "-1");
  },

  setDistanceUnit: function (object) {
    PreferencesService.set("weather.cityDistanceUnit", object);
  },

  getTemperatureUnit: function() {
    return PreferencesService.get("weather.cityTemperatureUnit", "-1");
  },

  setTemperatureUnit: function (object) {
    PreferencesService.set("weather.cityTemperatureUnit", object);
  }
};

exports.Preferences = Preferences;
