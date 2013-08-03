/* ==========================================================================
   Helpers
   ========================================================================== */

createModal = function(message1,message2,actions) {
  var html = '<div class="modal"><div class="modal-content"><p><span>';

  html += message1+"</span><br />";

  if(typeof message2 != "undefined") html += message2;

  html += '<br />';

  if(typeof actions == "object") {
    for(var prop in actions) {
      html += '<a class="modal-button button '+prop+'" href="#">'+actions[prop]+'</a>';
    }
  }

  html += '</p></div></div><div class="modal-overlay"></div>';
  var $modal = $(html);
  $modal.appendTo("body");
  setTimeout(function() {
    $modal.addClass("show");
  },0);
  $modal.find(".close").click(function() {
    $modal.removeClass("show");
    setTimeout(function() {
      $modal.remove();
    },500);
  });
  $modal.find(".profile").click(function() {
    $(".story").showStory();
    Session.set("expanded_story",false);
    Meteor.Router.to('/');
    setTimeout(function() {
      $modal.remove();
    },500);
  });
}


// makeBackground: Sets the background image.
$bgPreload = null;
$bg = undefined;
$bgImage = undefined;
makeBackground = function(picture) {
  if (Meteor.Router.page()!="journal") return false;

  if( !$bg || (typeof $bg == "undefined" && $(".bg").length) || !$bg.closest("body").length ) $bg = $(".bg");
  if( !$bgImage || (typeof $bgImage == "undefined" && $(".bg-image").length) || !$bgImage.closest("body").length ) $bgImage = $(".bg-image");

  // If there's a previous thing happening, let's cancel that.
  if($bgPreload) $bgPreload.unbind("load");

  if (picture && typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = jQuery.parseJSON(picture).url;
    else var url = picture; // Phew.

    toggleLoad(true,"bg");
    var storyColor;
    getImageLightness(url,function(brightness){
      if(brightness<150) {
        storyColor = "#ffffff";
      }
      else {
        storyColor = "#666666";
      }
    });

    // Fade it out, once it finishes loading, fade it back in.
    $bg.stop().animate({opacity:0},function() {


      $bgPreload = $('<img/>').attr("src",url);
      $bgPreload.one("load", function() {
        $bgImage.css("background-image","url("+url+")");
        $("#story").cssPersist("color",storyColor);
        $bg.animate({opacity:1}, function() {

            toggleLoad(false,"bg");

        });
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

// toggleLoad: This triggers a loading animation.
loading = [];
toggleLoad = function(load,target) {
  if(typeof target == "undefined") target = "nothing";

  var $targetEl = $("."+target);

  if ( typeof load == "undefined" || load ) {
    if (!loading[target]) {
      $targetEl.addClass("loading");
      loading[target] = true;
    } else {
      // Don't do anything.
    }
  } else {
    $targetEl.removeClass("loading");
    loading[target] = false;
  }
  return $targetEl;
}

// verticalCenter: Vertically center the story.
$dummy = $(".dummy");
jQuery.fn.verticalCenter = function(force) {
  if(!!$dummy) $dummy.html(formatDummyText($(this).val()));
  setTimeout(function() { 
    $("#story").cssPersist("padding-top",calculateTop());
  },0);

  return $(this);
};


// findStory: Find a story.
findStory = function(user,date) {
  if(typeof Stories == "undefined") {Meteor.Error(500,"Trying to find a story without Stories collection.")}

  if(typeof date == "undefined") date = discreteDate(new Date());

  if(date.getMonth) {
    // console.warn("Finding a legacy date. Timezone issues may occur.")
    date = new Date(date);
    start = floorDate(date);
    end = floorDate(incrementDate(date,1));

    story = Stories.find({"owner": user,"date":{"$gte": start, "$lt": end}},{sort: {created:-1,date:1}}).fetch();
    date = discreteDate(story);
  } else {
    story = Stories.find({"owner": user,"discreteDate":date},{sort: {created:-1,date:1}}).fetch();
    if (!story.length) {
      // console.warn("Nothing here...");
      return findStory(user,objectifyDate(date));
    }
  }

  if (story.length > 1) {
    if(confirm("Multiple ("+story.length+") stories detected for "+prettyDate(date)+". This is usually our fault. Resolve? No data will be deleted.")) {
      resolveMultiple(story);
      story = Stories.find({"owner": user,"discreteDate":date},{sort: {created:-1,date:1}}).fetch();
    };
  }
  story = story[0];
  if(story) {return story;}
  else {return {date:date,text:""};}
}
isStory = function(story) {
  if(!!story && typeof story == "object" && !!story._id) {
    discreteDate(story);
    return story._id;
  } else {
    return false;
  }
}
incrementDate = function(date,increment) {
  if(!!!date) return false;
  if(date.hasOwnProperty("year")) {
    date = objectifyDate(date);
    var newDate = new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
    return discreteDate(date);
  } else {
  return new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
  }
}
floorDate = function(date) {
  return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}
dayDiff = function(first, second) {
  if(first.hasOwnProperty("year")) first = objectifyDate(first); 
  if(second.hasOwnProperty("year")) second = objectifyDate(second); 
  return Math.floor(( second - first ) / 86400000);
}

jQuery.fn.cssPersist = function(prop,val) {
  if($(this).length)
    journalCss = $(this).attr("style",journalCss).css(prop,val).attr("style");

  return $(this);
}



cleanUp = "";              // Timeout for scrolling navigation
dateChangeable = true;     // Toggle to determine whether it's ok to scroll navigate.
$navUp = [];
$navDn = [];
scrollNav = function () {
  // if ($navUp.length && $navUp.closest("body").length) return false;

  // // Bug fixing, because sometimes when the page re renders, we lose it.
  // $("#journal").unbind("mousewheel wheel");
  // $(document).unbind("touchstart touchmove");
  // $navUp = $(".nav-up");
  // $navDn = $(".nav-dn");
  
  // function resetScroll() {
  //   if(!!$bgImage) $bgImage.animate({"top":"0px"});
  //   $("#journal").animate({"border-top-width":"20px","border-bottom-width":"20px","top":"0px","height":"100%"});
  //   $(".nav-up").animate({"top":"-48px"});
  //   $(".nav-dn").animate({"bottom":"-48px"},function() {
  //     $(".nav-up").css({ WebkitTransform: 'rotate(0deg)'});
  //     $(".nav-dn").css({ WebkitTransform: 'rotate(180deg)'});
  //     // For Mozilla browser: e.g. Firefox
  //     $(".nav-up").css({ '-moz-transform': 'rotate(0deg)'});
  //     $(".nav-dn").css({ '-moz-transform': 'rotate(180deg)'});
  //     dateChangeable = true;
  //   });

  // }

  // function animateReset(date) {
  //   $(".nav-up").rotate(180);
  //   $(".nav-dn").rotate(180);
  //   setTimeout(function() {
  //     if(setDate(Session.get("session_user"),date,true)) {
  //       resetScroll();
  //     } else {
  //       animateFail();
  //     }
  //   },500);
  // }


  // jQuery.fn.rotate = function(degree) {
  //   var d = 0;
  //   function animation_loop() {
  //       setTimeout(function() { 
  //         $(".nav-up").css({ WebkitTransform: 'rotate(' + d + 'deg)'});
  //         $(".nav-dn").css({ WebkitTransform: 'rotate(' + (180-d) + 'deg)'});
  //         // For Mozilla browser: e.g. Firefox
  //         $(".nav-up").css({ '-moz-transform': 'rotate(' + d + 'deg)'});
  //         $(".nav-dn").css({ '-moz-transform': 'rotate(' + (180-d) + 'deg)'});
  //         d+=5; 
  //         if (d <= degree) { animation_loop(); } 
  //       }, 1);
  //   };
  //   animation_loop();

  // }

  // function animateFail() {
  //   $(".nav").animate({left:"+=10px"},100,function() {
  //     $(this).animate({left:"-=20px"},80,function() {
  //       $(this).animate({left:"+=10px"},70,function() {
  //         resetScroll();
  //       })
  //     })
  //   });
  // }
  
  // var y;
  // var touchVelocity = 0;
  // $(document).bind("touchstart touchmove", function(e) {  
  //   //Disable scrolling by preventing default touch behaviour  
  //   e.preventDefault();  
  //   var orig = e.originalEvent;  
  //   // Move a div with id "rect"  
  //   var newY = orig.changedTouches[0].pageY;

  //   if(y>newY) {
  //     touchVelocity += 1;
  //     if (touchVelocity%3==0) up();
  //   }
  //   else if(y<newY) {
  //     touchVelocity -= 1     
  //     if (touchVelocity%3==0) dn(); 
  //   }
 
  //   y = newY;
  // }); 

  // up = function() {
  //   if ($story.scrollTop() > 0) return;
  //   else event.preventDefault();
  //   if($(".nav-up").css("top").replace(/[^-\d\.]/g, '')<200){
  //     $(".nav-up").css({"top" : "+=8px"});
  //     $("#journal").css({"border-top-width":"+=2px"});
  //     if(!!$bgImage) $bgImage.css({"top":"+=1px"});
  //     clearTimeout(cleanUp);
  //     cleanUp = setTimeout(function() {
  //       resetScroll();
  //     },100);
  //   }
  //   else {
  //     clearTimeout(cleanUp);
  //     dateChangeable = false;
  //     animateReset( incrementDate(Session.get("session_date"),1) );
  //   }
  // }

  // dn = function() {
  //   if ($story.scrollTop()+$story.innerHeight()<$story[0].scrollHeight) return;
  //   else event.preventDefault();
  //   if($(".nav-dn").css("bottom").replace(/[^-\d\.]/g, '')<200){
  //     $(".nav-dn").css({"bottom" : "+=8px"});
  //     $("#journal").css({"border-bottom-width":"+=2px","top":"-=2px","height":"+=2px"});
  //     if(!!$bgImage) $bgImage.css({"top":"-=1px"});
  //     clearTimeout(cleanUp);
  //     cleanUp = setTimeout(function() {
  //       resetScroll();
  //       $story.scrollTop($story[0].scrollHeight-$story.innerHeight());
  //     },100);
  //   }
  //   else {
  //     clearTimeout(cleanUp);
  //     dateChangeable = false;
  //     animateReset( incrementDate(Session.get("session_date"),-1) );
  //   }
  // }


  // $("#journal").bind('mousewheel wheel', function(event) {

  //   if(!$story.closest("body").length) $story = $("#story");

  //   // console.log($story.scrollTop()+$story.innerHeight(),$story[0].scrollHeight);


  //   if(event.originalEvent.wheelDelta) delta = event.originalEvent.wheelDelta;
  //   else delta = -event.originalEvent.deltaY;
  //   if(dateChangeable) {

  //     if (delta >= 0) up()
  //     else dn()
  //   }
  // });
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


  Meteor.call("createStory",options,function(e,r) {
    console.log(e,r); 
    discreteDate(Stories.findOne(r));
    sessionId = r;
  });
}




getScreenName = function(id) {
  if(!id) {id = Meteor.userId();}
  user = Meteor.users.find(id).fetch()[0];
  if(!user) return;
  if(hasScreenName(user)) name = user.username;
  else return;
  return name;
}
uniqueScreenName = function(name) {
  if(!name) {name = sessionScreenName;}
  return !Meteor.users.find({username:name}).fetch().length;
}
getUserId = function(name) {
  if(!name) {
    if(sessionScreenName) {
      name = sessionScreenName;
    }
    else {
      return false;
    }
  }
  users = Meteor.users.find({username:name}).fetch();
  if(users.length>1) console.log("Warning: Note that there is more than one",name);
  if(users[0] && users[0].hasOwnProperty("_id"))
    return users[0]._id;
  else
    return "";
}
getDisplayName = function(id) {
  if(!id) {id = Meteor.userId();}
  user = Meteor.users.find(id).fetch()[0];
  var name = "";
  if(user!=undefined) {
    if(!user.hasOwnProperty("displayName") || !user.displayName || user.displayName == "null") {
      name = getScreenName(id);
    }

    else {
      name = user.displayName;
    }
  }
  return name;
}
hasScreenName = function(user) {
  if(!user) return false;
  if(!user.hasOwnProperty("username") || !user.username || user.username == "null") {
    Meteor.Router.to("/youdonthaveausername");
    console.log("holdon!!!");
    return false;
  }
  else return true;
}

ownStory = function() {
  return Meteor.userId() == Session.get("session_user");
}

getDateUrl = function(date) {
  if(date.hasOwnProperty("year"))
    return "/"+date.year+"/"+(date.month+1)+"/"+date.date;
  else
    return "/"+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
}

discreteDate = function(story) {
  var ddate = {year:undefined,month:undefined,date:undefined};

  if(story.getMonth) {
    ddate = {year:story.getFullYear(),month:story.getMonth(),date:story.getDate()};
  } else {
    if(story.hasOwnProperty("discreteDate"))
      return story.discreteDate;

    // console.warn("Caution: Legacy post with no discrete date set. Timezone issues possible.");
    var date = new Date(story.date);
    ddate = {year:date.getFullYear(),month:date.getMonth(),date:date.getDate()};

    if(story.owner == Meteor.userId()) {
      Meteor.call("updateDiscreteDate",story._id,ddate);
    }
  }
  return ddate;
}
objectifyDate = function(date) {
  if(!!date){
  if (date.hasOwnProperty("year"))
    return new Date(date.year,date.month,date.date);
  else if(new Date(date))
    return new Date(date);
  }
  console.warn("Not a valid date.");
  return null;
}

updateStats = function(id) {
  if(id != Meteor.userId()){
    console.warn("Foreign update attempt. You can't update other users' stats.");
    return false;
  }
  user = Meteor.users.findOne(id);
  if(!!user) {
    var stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch();
    var currstreak = 1;
    var beststreak = 1;
    var lastUpdate = discreteDate(stories[0]);
    var completion = 1;
    var posts = 1;

    if(!!user.profile) {
      // Last updated
      if (user.profile.hasOwnProperty("lastUpdate"))
        var dayOld = new Date(user.profile.lastUpdate.year,user.profile.lastUpdate.month,user.profile.lastUpdate.date);
        var dayLast = new Date(lastUpdate.year,lastUpdate.month,lastUpdate.date);
        var diff = dayDiff(dayOld,dayLast);

      // Current streak
      var currstreak = user.profile.hasOwnProperty("currstreak") ? user.profile.currstreak : 1;
      if (diff == 1) currstreak++;
      else if (diff > 1) currstreak = 1;

      // Best streak
      var beststreak = user.profile.hasOwnProperty("beststreak") ? user.profile.beststreak : 1;
      if(currstreak>beststreak) beststreak = currstreak;

      // Posts
      if (user.profile.hasOwnProperty("posts") && isFinite(String(user.profile.posts)))
      var posts = stories.length > user.profile.posts ? stories.length : user.profile.posts;

      // Completion
      if(user.hasOwnProperty("createdAt")) {
        var age = dayDiff(user.createdAt,new Date())+1;
      }
      var completion = stories.length / age;
    }

    Meteor.users.update({_id:id}, {$set:{
      "profile.currstreak":currstreak,
      "profile.posts":posts,
      "profile.completion":completion,
      "profile.beststreak":beststreak,
      "profile.lastUpdate":lastUpdate
    }})
  }
  else {
    console.warn("No user found. Could not update");
    return false;
  }

}


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

    if(typeof container != "undefined" && container=="window") {
      var containerWidth = $(window).width() - 80;
      var containerHeight = $(window).height() - 80;
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

    if(typeof container != "undefined" && container=="window") {
      $imageContainer.animate({
        "left":(marginX/containerWidth)*100+"%",
        "right":(marginX/containerWidth)*100+"%",
        "bottom":(marginY/containerHeight)*100+"%",
        "top":(marginY/containerHeight)*100+"%"
      });
      screenImage.css("opacity","1");
    } else {
      $imageContainer.css({
        "left":(marginX/containerWidth)*100+"%",
        "right":(marginX/containerWidth)*100+"%",
        "bottom":(marginY/containerHeight)*100+"%",
        "top":(marginY/containerHeight)*100+"%"
      });
      screenImage.css("opacity","1");
    }
    return true;

  });
}

