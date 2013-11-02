var AustralisWidget = require("./xul-manager/australis-widget.js").AustralisWidget;
var TestWidget = require("./test-widget.js").TestWidget;
let Timer = require("timer");

var timer, timeout;

timeout = function () {
  fooWidget.updateWeather();
  
  if (timer) Timer.clearTimeout(timer);
  timer = Timer.setTimeout(timeout, 60 * 60 * 1000);
};


var testWidget = new TestWidget();
var australisWidget = new AustralisWidget(testWidget);
testWidget.prefLoad();


timer = Timer.setTimeout(timeout, 60 * 60 * 1000);


