
/*
 * Vertically Center Text In "textarea"
 * Author: Behnam Esmali
 * Source: http://stackoverflow.com/questions/13552655/how-to-vertically-center-text-in-textarea
 */
formatDummyText = function(text) {
  if ( !text ) return $("#story").attr("placeholder");
  else return text.replace( /\n$/, '<br>&nbsp;' ).replace( /\n/g, '<br>' );
}
calculateTop = function() {
  var top=0;

    if ($dummy.length) {
      var h = $(window).height()-40;
      top = (h - $dummy.height()) * .5;
    }

  return top;
}


// logRenders: Shows what templates have been rendered, and how many times.
// Via http://projectricochet.com/blog/meteor-js-performance
logRenders = function() {
    _.each(Template, function (template, name) {
      var oldRender = template.rendered;
      var counter = 0;
 
      template.rendered = function () {
        console.log(name, "render count: ", ++counter);
        oldRender && oldRender.apply(this, arguments);
      };
    });
  }


/*
 * Image Light/Dark Detection
 * Author: lostsource
 * Source: http://stackoverflow.com/questions/13762864/image-dark-light-detection-client-sided-script
 */
getImageLightness = function(imageSrc,callback) {
    var img = new Image,
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    src = imageSrc; // insert image url here

    img.crossOrigin = "Anonymous";

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage( img, 0, 0 );
        localStorage.setItem( "savedImageData", canvas.toDataURL("image/png") );
    }
    img.src = src;
    // make sure the load event fires for cached images too
    if ( img.complete || img.complete === undefined ) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }

    // var img = document.createElement("img");
    // img.src = imageSrc;
    img.style.display = "none";
    document.body.appendChild(img);

    var colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));

        callback(brightness);
    }
}



/*
 * Get scrollbar width
 * Author: Alexandre Gomes
 * Source: http://stackoverflow.com/questions/986937/how-can-i-get-the-browsers-scrollbar-sizes
 */
getScrollBarWidth = function() {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  return (w1 - w2);
};


/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */
dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]
// Takes an ISO time and returns a string representing how
// long ago the date represents.
prettyDate = function(date,week){
  if(!date) return false;
  if(week)
    return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate();
  else
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

