let PreferencesService = require("sdk/preferences/service");

Preferences = {
  numbers: ['One', 'Two', 'Three', 'Four', 'Five'],

  prefKey: function (object) {
    return "weather.city" + this.numbers[object.rank] + "WOEID";
  },

  getWOEID: function (object) {
    if(PreferenceService.has(this.prefKey(object)) && PreferenceService.isSet(this.prefKey(object))) { 
      return PreferencesService.get(this.prefKey(object)); 
    }
    else { 
      return -1; 
    }
  },

  setWOEID: function (object) {
    if (object.woeid === '') {
      PreferencesService.reset(this.prefKey(object));
    } else {
      PreferencesService.set(this.prefKey(object), object.woeid.toString());
    }
  }
};

exports.Preferences = Preferences;
