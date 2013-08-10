
jQuery.fn.imgCover = function(container) {
  this.each(function() {

    // Image container
    // Image width
    var screenImage = $(this).find("img");
    if (!screenImage.length) return false;

    $imageContainer = screenImage.parent();

    var theImage = new Image();


    theImage.src = screenImage.attr("src");
    var imageWidth = theImage.width;
    var imageHeight = theImage.height;

    // Container width

    if(typeof container != "undefined") {
      var containerWidth = $(container).width() - 80;
      var containerHeight = $(container).height() - 80;
    } else {
      var containerWidth = $(this).width();
      var containerHeight = $(this).height(); 
    }
    var y;
    var x;

    // Determine if it needs to be stretched horizontally or vertically
    if(imageWidth/imageHeight > containerWidth/containerHeight) {
      y = containerHeight;
      x = imageWidth * containerHeight/imageHeight;
    } else {
      x = containerWidth;
      y = imageHeight * containerWidth/imageWidth;
    }

    var marginX = -1 * (x/4 - containerWidth)/2;
    var marginY = -1 * (y/4 - containerHeight)/2;

    if(typeof container != "undefined") {
      $imageContainer.animate({
        "left":(marginX/containerWidth)*100+"%",
        "right":(marginX/containerWidth)*100+"%",
        "bottom":(marginY/containerHeight)*100+"%",
        "top":(marginY/containerHeight)*100+"%"
      });
      // screenImage.css("opacity","1");
    } else {
      $imageContainer.css({
        "left":(marginX/containerWidth)*100+"%",
        "right":(marginX/containerWidth)*100+"%",
        "bottom":(marginY/containerHeight)*100+"%",
        "top":(marginY/containerHeight)*100+"%"
      });
      // screenImage.css("opacity","1");
    }
    return true;

  });
}

