/*********************************************
* City Element
*********************************************/
function cityElement() {

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
    //window.open('http://weather.yahoo.com/_/_/_-'+this.woeid+'/','_newtab');
};



exports.cityElement = cityElement;
