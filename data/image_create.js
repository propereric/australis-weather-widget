

self.port.on("Image", function(object){
	        
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var img = document.createElement("img");

    img.onload = function() {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0,0,canvas.width,canvas.height);

      ctx.font="100px Arial";
      ctx.fillStyle = 'red';
      ctx.fillText(object.temp+" F",0,canvas.height,canvas.width,canvas.height);
      ctx.strokeStyle = 'black';
      ctx.strokeText(object.temp+" F",0,canvas.height,canvas.width,canvas.height);
      self.postMessage(canvas.toDataURL());
                    
    };

    img.src = object.image;
});