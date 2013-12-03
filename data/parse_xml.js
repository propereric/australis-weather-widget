

self.port.on("Parse", function(text){
	        
    // get xml and tags from xml using jQuery
    xmlDoc = $.parseXML(text),
    $xml = $( xmlDoc ),
    $location = $xml.find( "yweather\\:location" );
    $wind = $xml.find( "yweather\\:wind" );
    $atmosphere = $xml.find( "yweather\\:atmosphere" );
    $condition = $xml.find( "yweather\\:condition" );

    // return an object that contains all extracted information
    var returnObject = {
      city: $location.attr('city'),
      country: $location.attr('country'),
      region: $location.attr('region'),
      windSpeed: $wind.attr('speed'),
      humidity: $atmosphere.attr('humidity'),
      temp: $condition.attr('temp'),
      visibility: $atmosphere.attr('visibility'),
      conditionCode: $condition.attr('code')
    };

    self.postMessage(returnObject);
});