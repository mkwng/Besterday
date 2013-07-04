/* ==========================================================================
   Helpers
   ========================================================================== */

// makeBackground: Sets the background image.
$bgPreload = null;
makeBackground = function(picture) {

  console.log("Changing background...", picture);

  if( (typeof $bg == "undefined" && $(".bg").length) || !$bg.closest("body").length ) $bg = $(".bg");
  if( (typeof $bgImage == "undefined" && $(".bg-image").length) || !$bgImage.closest("body").length ) $bgImage = $(".bg-image");

  // If there's a previous thing happening, let's cancel that.
  // NOTE! As of 7/2 this is not cancelling. Still broken.
  if($bgPreload) $bgPreload.unbind("load");

  if (picture && typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = JSON.parse(picture).url;
    else var url = picture; // Phew.

    getImageLightness(url,function(brightness){
      if(brightness<150) {
        setTimeout(function() {
          $("#story").css("color","#ffffff");
        },2);
      }
      else {
        setTimeout(function() {
          $("#story").css("color","#666666");
        },2);
      }
    });

    // Fade it out, once it finishes loading, fade it back in.
    $bg.stop().animate({opacity:0},function() {
      $bgPreload = $('<img/>').attr("src",url);
      $bgPreload.one("load", function() {
        $bgImage.css("background-image","url("+url+")");
        $bg.animate({opacity:1})
      });
    });
  }
  else $bg.animate({opacity:0},function() {
    setTimeout(function() {
      $(".upload").removeClass("attached");
      $bgImage.css("background-image","none");
      $("#story").css("color","#666666");
    },2);
  });

}

// scrollStory: Using the mousewheel to navigate.

// toggleLoad: This triggers a loading animation.
loading = false;
toggleLoad = function(load) {
  if ( typeof load == "undefined" || load ) {
    if (loading == false) {
      console.log("Updating...");
      loading = true;
    } else {
      console.log("Still updating...");
    }
  } else {
    console.log("Done.");
    loading = false;
  }
}

// verticalCenter: Vertically center the story.
centerOnce = true; // Incredibly annoying hack to center the type on first load.
$dummy = $(".dummy");
jQuery.fn.verticalCenter = function(force) {
  $dummy.html(formatDummyText($(this).val()));

  // Bug fix for initial load not taking into account the full height;
  $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
    var top = calculateTop();
      if (centerOnce && top+"px"!=$(this).css("padding-top") && top) {
        centerOnce = false;
        $(this).css("padding-top",top).focus();
      }
   });

  if(force) {$(this).css("padding-top",calculateTop());}
  $(this).animate({opacity:1},1000);
};


// findStory: Find a story.
findStory = function(user,date) {
  if(typeof Stories == "undefined") {Meteor.Error(500,"Trying to find a story without Stories collection.")}

  if(typeof date == "undefined") date = new Date();

  date = new Date(date);
  start = floorDate(date);
  end = floorDate(incrementDate(date,1));

  story = Stories.findOne({"owner": user,"date":{"$gte": start, "$lt": end}},{sort: {created:-1,date:1}});
  if(story) {return story;}
  else {return {date:date,text:""};}
}
incrementDate = function(date,increment) {
  return new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
}
floorDate = function(date) {
  return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}



