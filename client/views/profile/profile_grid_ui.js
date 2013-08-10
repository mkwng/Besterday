gridHousekeeping = function() {
    $profileGridInner.widthDivisible();
    // Make sure the images are positioned correctly and load nicely
    $(".profile-grid-stories.img").imgCover();
}
setClamp = function() {
    // On load, let's clip all the text so it fits in four lines.
    $(".profile-grid-stories-story").each(function() {
      $(this).attr("data-story",$(this).html());
      $clamp(this, {clamp: 4, useNativeClamp: false});
    });  
    $(".profile-grid-stories.img img").load(function() {
      $(this).closest(".img").imgCover();
      $(this).css({opacity:1,visibility:"visible"});
    });
}
hideImages = function() {
  setTimeout(function() {
    if(!profileGridLoaded && $(".profile-grid-stories.img img").length) {
      profileGridLoaded = true;
      $(".profile-grid-stories.img img").css({opacity:0});
    }
  },0);
}


isoTimeout = setTimeout(function() {},0);
$removedItems = {};
numCols = 0;
jQuery.fn.widthDivisible = function(callback) {
  clearTimeout(isoTimeout);

  numCols = Math.round(1/($(".profile-grid-stories:not(.wide)").slice(0,1).width()/$(window).width()));

  var width = $(window).width();

  // Force the width of the container to a number evenly divisible by numCols
  if(width%numCols!=0){
    width = Math.floor(width / numCols) * numCols;
  }
  $(this).css("width",width);

  // This is fairly expensive, so setting a timeout so it doesn't run consecutively too many times.
  isoTimeout = setTimeout(function() {
    $(".profile-grid-inner").packery({itemSelector:'.profile-grid-stories',columnWidth:width/numCols});
  },100);

  return $(this);
};


stickyLess = function() {
  $button = $(".profile-grid-more");
  if($(window).scrollTop()+$(window).height()-$button.height()>$(".profile-grid").offset().top+$(".profile-grid").height())
    $button.removeClass("fixed");
  else
    $button.addClass("fixed");
}


Template.profile_grid.helpers({
  randomClasses : function() {
    var ran = Math.floor(Math.random()*6);
    var classes = ""
    switch(ran){
      case 0:
        classes = "";
        break;
      case 1:
        classes = "alt-1"
        break;
      case 2:
        classes = "alt-2"
        break;
      case 3:
        classes = "alt-2"
        break;
      case 4:
        classes = "alt-3"
        break;
      case 5:
        classes = "alt-4"
        break;
      case 6:
        classes = "alt-5"
        break;
    }
    ran = (Math.random()*8);
    if(ran < 1) classes += !!this.img ? " wide" : " large";
    return classes;
  },
  'avgColor' : function() {
    if(!!this.img)
      return getImg(this.img).avgColor;
  },
  'storyColor' : function() {
    if(!!this.img)
      return getImg(this.img).storyColor;
  },
});