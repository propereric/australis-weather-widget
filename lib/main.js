/*#####################################################################################*
 * Requires
 *#####################################################################################*/
let { Cc, Ci, Cu, Cr, Cm, components } = require("chrome");
let Prefs = require("sdk/preferences/service");
let Timer = require("timer");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/CustomizableUI.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

let FooWidget = require('./foo-widget').Widget;
let CityManager = require('./city-manager').cityManager;

var timer, timeout, widget, cityManager;

timeout = function () {
  cityManager.onUpdateWeather();
  
  if (timer) Timer.clearTimeout(timer);
  timer = Timer.setTimeout(timeout, 60 * 60 * 1000);
};

exports.main = function (options, callback) {
  widget = new FooWidget();
  CustomizableUI.createWidget(widget);
  cityManager = new CityManager();
  timer = Timer.setTimeout(timeout, 60 * 60 * 1000);
  cityManager.onPrefLoad();
};

exports.onUnload = function (reason) {
  cityManager.onPrefWrite();
};
