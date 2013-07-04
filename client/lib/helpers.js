/* ==========================================================================
   Helpers
   ========================================================================== */

// makeBackground: Sets the background image.
$bgPreload = null;
makeBackground = function(picture) {

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
          $("#story").cssPersist("color","#ffffff");

        },2);
      }
      else {
        setTimeout(function() {
          $("#story").cssPersist("color","#666666");

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
      $("#story").cssPersist("color","#666666");

    },2);
  });

}

// scrollStory: Using the mousewheel to navigate.

// toggleLoad: This triggers a loading animation.
loading = false;
toggleLoad = function(load) {
  if ( typeof load == "undefined" || load ) {
    if (loading == false) {
      // console.log("Updating...");
      loading = true;
    } else {
      // console.log("Still updating...");
    }
  } else {
    // console.log("Done.");
    loading = false;
  }
}

// verticalCenter: Vertically center the story.
centerOnce = true; // Incredibly annoying hack to center the type on first load.
$dummy = $(".dummy");
jQuery.fn.verticalCenter = function(force) {
  $dummy.html(formatDummyText($(this).val()));
  setTimeout(function() { 
    $("#story").cssPersist("padding-top",calculateTop());
  },0);

  // $(this).animate({opacity:1},1000);
  return $(this);
};


// findStory: Find a story.
findStory = function(user,date) {
  if(typeof Stories == "undefined") {Meteor.Error(500,"Trying to find a story without Stories collection.")}

  if(typeof date == "undefined") date = new Date();

  date = new Date(date);
  start = floorDate(date);
  end = floorDate(incrementDate(date,1));

  story = Stories.find({"owner": user,"date":{"$gte": start, "$lt": end}},{sort: {created:-1,date:1}}).fetch();
  if (story.length > 1) {
    if(confirm("Multiple ("+story.length+") stories detected for "+prettyDate(date)+". This is usually our fault. Resolve? No data will be deleted.")) {
      resolveMultiple(story);
      story = Stories.find({"owner": user,"date":{"$gte": start, "$lt": end}},{sort: {created:-1,date:1}}).fetch();
    };
  }
  story = story[0];
  if(story) {return story;}
  else {return {date:date,text:""};}
}
incrementDate = function(date,increment) {
  return new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
}
floorDate = function(date) {
  return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}


jQuery.fn.cssPersist = function(prop,val) {
  journalCss = $(this).attr("style",journalCss).css(prop,val).attr("style");

  return $(this);
}








cleanUp = "";              // Timeout for scrolling navigation
dateChangeable = true;     // Toggle to determine whether it's ok to scroll navigate.
scrollNav = function () {

  function resetScroll() {

    $(".nav-up").animate({"top":"-48px"});
    $(".nav-dn").animate({"bottom":"-48px"},function() {
      $(".nav-up").css({ WebkitTransform: 'rotate(0deg)'});
      $(".nav-dn").css({ WebkitTransform: 'rotate(180deg)'});
      // For Mozilla browser: e.g. Firefox
      $(".nav-up").css({ '-moz-transform': 'rotate(0deg)'});
      $(".nav-dn").css({ '-moz-transform': 'rotate(180deg)'});
      dateChangeable = true;
    });

  }

  function animateReset(date) {
    $(".nav-up").rotate(180);
    $(".nav-dn").rotate(180);
    setTimeout(function() {
      if(setDate(Session.get("session_user"),date)) {
        resetScroll();
      } else {
        animateFail();
      }
    },500);
  }


  jQuery.fn.rotate = function(degree) {
    var d = 0;
    function animation_loop() {
        setTimeout(function() { 
          $(".nav-up").css({ WebkitTransform: 'rotate(' + d + 'deg)'});
          $(".nav-dn").css({ WebkitTransform: 'rotate(' + (180-d) + 'deg)'});
          // For Mozilla browser: e.g. Firefox
          $(".nav-up").css({ '-moz-transform': 'rotate(' + d + 'deg)'});
          $(".nav-dn").css({ '-moz-transform': 'rotate(' + (180-d) + 'deg)'});
          d+=5; 
          if (d <= degree) { animation_loop(); } 
        }, 1);
    };
    animation_loop();

  }

  function animateFail() {
    $(".nav").animate({left:"+=10px"},100,function() {
      $(this).animate({left:"-=20px"},80,function() {
        $(this).animate({left:"+=10px"},70,function() {
          resetScroll();
        })
      })
    });
  }

  $("#journal").bind('mousewheel wheel', function(event) {
    if(event.originalEvent.wheelDelta) delta = event.originalEvent.wheelDelta;
    else delta = -event.originalEvent.deltaY;
    if(dateChangeable) {
        if (delta >= 0) {
            if($(".nav-up").css("top").replace(/[^-\d\.]/g, '')<100){
              $(".nav-up").css({"top" : "+=4px"});
              clearTimeout(cleanUp);
              cleanUp = setTimeout(function() {
                resetScroll();
              },100);
            }
            else {
              clearTimeout(cleanUp);
              dateChangeable = false;
              animateReset( incrementDate(Session.get("session_date"),-1) );
            }
        }
        else {
            if($(".nav-dn").css("bottom").replace(/[^-\d\.]/g, '')<100){
              $(".nav-dn").css({"bottom" : "+=4px"});
              clearTimeout(cleanUp);
              cleanUp = setTimeout(function() {
                resetScroll();
              },100);
            }
            else {
              clearTimeout(cleanUp);
              dateChangeable = false;
              animateReset( incrementDate(Session.get("session_date"),1) );
            }
        }
      }
  });
}


resolveMultiple = function(storyArray) {
  var options = 
      {
        owner: "",
        date: "",
        created: new Date().getTime(),
        text: "",
        img: "",
        public: false
      };

  options.owner = storyArray[0].owner;
  options.date = storyArray[0].date;

  for (var i = 0; i < storyArray.length; i++) {
      //Do something
      if (storyArray[i].created < options.created) options.created = storyArray[i].created
      options.text += " " + storyArray[i].text;
      if (storyArray[i].hasOwnProperty("img") && storyArray[i].img) {
        console.log("this one works.",storyArray[i].img);
        if (storyArray[i].img.indexOf("{") !== -1) {
          console.log("ok, it has a url, saving.");
          options.img = storyArray[i].img;
        }
      }
      Stories.remove(storyArray[i]._id);
  }


  Meteor.call("createStory",options,function(e,r) {console.log(e,r); sessionId = r;});
}








