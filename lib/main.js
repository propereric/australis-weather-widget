var AustralisWidget = require("./xul-manager/australis-widget.js").AustralisWidget;
var WeatherWidget = require("./weather-widget.js").WeatherWidget;
let Timer = require("timer");

var timer, timeout;

timeout = function () {
  weatherWidget.updateWeather();
  
  if (timer) Timer.clearTimeout(timer);
  timer = Timer.setTimeout(timeout, 60 * 60 * 1000);
};

initialize = function () {
  var australisWidget = new AustralisWidget(weatherWidget);
  timer = Timer.setTimeout(timeout, 60 * 60 * 1000);
}

// weather widget is initialized before the icon is added to the browser
var weatherWidget = new WeatherWidget();
weatherWidget.prefLoad();

//wait some time before initializing to load icon
Timer.setTimeout(initialize, 900);


