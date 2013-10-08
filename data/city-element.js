/*********************************************
* City Element
*********************************************/
function cityElement() {
  var pub = {};
  pub.name = '';
  pub.woeid = ''; 
  pub.rank = '';
  pub.image = '';
  pub.temp = '';
  pub.humidity = '';
  pub.vis = '';
  pub.windSpeed = ''; 

  /***************************************
  * redirect the user to the appr. yahoo page 
  ***************************************/
  pub.onClickName = function() {	//redirect the user based on the WOEID
    window.open('http://weather.yahoo.com/_/_/_-'+pub.woeid+'/','_newtab');
  };

  /***************************************
  * Delete the city
  ***************************************/	
  pub.onClickX = function() {		//need to call cityManager to delete self
    cityManager.removeCity(pub.woeid); 
  };

  /***************************************
  * Make the city the current location
  ***************************************/		
  pub.onClickStar = function() {	//need to call cityManager to promote self
    cityManager.promoteToCurrentCity(pub.woeid); 
  };

  /***************************************
  * Update the city weather info
  ***************************************/
  pub.updateWeather = function() {
    self.port.emit("retrieve-forecast", pub.woeid); 
  };

  /***************************************
  * Add Simple Pref Entry
  ***************************************/
  pub.addPrefEntry = function() {
    var s = {rank: pub.rank, woeid: pub.woeid }; 
    self.port.emit("write-to-pref", s);
  };

  /***************************************
  * Create the html to output
  ***************************************/
  pub.outputElement = function(inEdit) {

    var tbl=document.createElement('table');
    if(pub.rank==0) {
      tbl.className="primarycityelement";
    }
    else {
      tbl.className="cityelement";
    }
    tbl.setAttribute('border','0');
    var tbdy=document.createElement('tbody');

    var tr=document.createElement('tr');
    var td=document.createElement('td');
    td.className="iconcolumn";
    var icon=document.createElement('div');
    icon.className="icon";
    icon.style.backgroundImage = "url("+pub.image+")"
    icon.innerHTML="&nbsp"+pub.temp;
    td.appendChild(icon);
    tr.appendChild(td);

    var td=document.createElement('td');
    td.className="namecolumn, link";
    td.appendChild(document.createTextNode(pub.name))
    td.addEventListener('click', pub.onClickName);
    tr.appendChild(td)

    var td=document.createElement('td');
    td.className="invisible";
    if(inEdit){ td.style.display="none"; }
    else { td.style.display=''; }
    td.className="detailcolumn";
    var li1=document.createElement('li');
    li1.innerHTML="Visibility: "+pub.vis+" mi";
    var li2=document.createElement('li');
    li2.innerHTML="Humidity: "+pub.humidity+"%";
    var li3=document.createElement('li');
    li3.innerHTML="Winds: "+pub.windSpeed+" mph";
    td.appendChild(li1);
    td.appendChild(li2);
    td.appendChild(li3);
    tr.appendChild(td);

    var td=document.createElement('td');
    td.className="buttonscolumn; invisible";
    var img1=document.createElement('img');
    if(pub.rank==0) {
      img1.src="star.png"
    }
    else {
      img1.src="staroutline.png"
    }
    img1.width=28;
    img1.addEventListener('click', pub.onClickStar);

    var img2=document.createElement('img');
    img2.src="x.png"
    img2.width=25;
    img2.addEventListener('click', pub.onClickX);
  
    td.appendChild(img1);
    td.appendChild(img2);

    if(inEdit){ td.style.display=''; }
    else { td.style.display="none"; }
    td.className="invisible";

    tr.appendChild(td);
    tbdy.appendChild(tr);
    tbl.appendChild(tbdy);

	return tbl;
  };			

  return pub;
}