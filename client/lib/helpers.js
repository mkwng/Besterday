/* ==========================================================================
   Helpers
   ========================================================================== */

// makeBackground: Sets the background image.

// scrollStory: Using the mousewheel to navigate.

// toggleLoad: This triggers a loading animation.

// centerStory: Vertically center the story.
/*
 * Vertically Center Text In "textarea"
 * Author: Behnam Esmali
 * Source: http://stackoverflow.com/questions/13552655/how-to-vertically-center-text-in-textarea
 */
centerOnce = true; // Incredibly annoying hack to center the type on first load.
$dummy = $(".dummy");
formatDummyText = function(text) {
  if ( !text ) return $("#story").attr("placeholder");
  else return text.replace( /\n$/, '<br>&nbsp;' ).replace( /\n/g, '<br>' );
}
calculateTop = function() {
  var top=0;

    if ($dummy.length) {
      var h = $(window).height()-120;
      top = (h - $dummy.height()) * .5;
    }

  return top;
}
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

  if(force) {console.log("going down."); $(this).css("padding-top",calculateTop());}
  $(this).css({opacity:1});
};


// findStory: Find a story.
findStory = function(user,date) {
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