
/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  // On startup, assume that data has not loaded yet.
  Session.set('data_loaded', false); 

  // Let's center the #story on any window resize..
  $(window).resize(function() {$("#story").verticalCenter(true);});

  scrollNav();

  // Escape key will close sidebar, if open.
  $(document).keyup(function(e) {
    if (e.keyCode == 27 && Session.get("show_sidebar")) {
      closeSidebar();
    } 
  });

});

Meteor.subscribe('default_db_data', function(){
  // Set the reactive session as true to indicate that the data have been loaded
  Session.set('data_loaded', true); 

  // Chances are, no date is set so we initialize with yesterday.
  if(!Session.get("session_date")) {
    yesterday = new Date(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000));
    setDate(yesterday);
  } else { // Bug fix: The only time we get a session date, but date isn't set is hot code pushes.
    setDate(Session.get("session_date"));
  }
});

/* ==========================================================================
   TEMPLATE: Journal
   ========================================================================== */
var $dummy;                     // Invisible div that duplicates content of the #journal.
var $bg;
var $bgImage;
var $bgPreload;
var cleanUp;                    // Timeout for scrolling navigation
var dateChangeable = true;      // Toggle to determine whether it's ok to scroll navigate.
var updateDelay;                // Timeout for updating the #story
var publicDelay;                // Timeout so we can animate the share button.

// Bind moviesTemplate to Movies collection
Template.journal.story = function () {
  var story = Stories.findOne(Session.get("session_story"));
  if(story) image = story.img; // To be honest, not sure what this line does.
  else { // No story is found for this ID. Let's put in blank text.
    story = new Object();
    story.text = "";
  }
  return story;
}; 

// As soon as Meteor finishes rendering, let's make sure we center our type.
Template.journal.rendered = function() {
  Meteor.defer(function () {
    if(typeof $dummy == "undefined" && $(".dummy").length) $dummy = $(".dummy");
    if($("#story").length) {$story = $("#story").verticalCenter();}
  });
};

Template.journal.events({
  // The user typed something into #story.
  'keyup #story' : function (e) {
    // If they're typing a lot, let them finish before updating.
    clearTimeout(updateDelay);
    updateDelay = setTimeout(function(e) {

      // Hack to maintain the style
      var css = $("#story").attr("style");

      if(Session.get("session_story")) {
        Stories.update(
          { _id: Session.get("session_story")},
          {
            $set: {
              text: document.getElementById('story').value
            }
          }
        );
      } else {
        var date = Session.get("session_date");
        Session.set("session_story",Stories.insert(
          {
            owner: Meteor.userId(),
            date: new Date(date.getFullYear(),date.getMonth(),date.getDate()),
            created: new Date.getTime(),
            text: document.getElementById('story').value,
            public: false
          }
        ));
      }

      // Hack to maintain the style
      setTimeout(function() {$("#story").attr("style",css).verticalCenter();},0);

    },1000);
  },
  // Uploading an image.
  'click .media-image' : function (e) {
    e.preventDefault();

    // Need to provide better way of deleting picture...
    if ($(e.target).hasClass("attached") && confirm("Remove picture?")) {
      $(e.target).removeClass("attached");
      // Remove the current picture.
      makeBackground();
        Stories.update(
          { "_id": Session.get("session_story")},
          {
            $unset: {
              "img": ""
            }
          }
        );
    } 

    filepicker.pick({
      mimetypes: ['image/*', 'text/plain'],
      container: 'modal',
      services:['COMPUTER', 'URL', 'FACEBOOK', 'INSTAGRAM', 'FLICKR', 
      'PICASA', 'DROPBOX', 'GMAIL'],
      },
      function(FPFile){
        // image = JSON.stringify(FPFile);
        image = JSON.stringify(FPFile);
        makeBackground(image);


        if(Session.get("session_story")) {
          Stories.update(
            { "_id": Session.get("session_story")},
            {
              $set: {
                "img": image
              }
            }
          );
        } else {
        var date = Session.get("session_date");
          Session.set("session_story",Stories.insert(
            {
              owner: Meteor.userId(),
              date: new Date(date.getFullYear(),date.getMonth(),date.getDate()),
              created: new Date.getTime(),
              text: document.getElementById('story').value,
              public: false
            }
          ));
        }
      },
      function(FPError){
        console.log(FPError.toString());
        $(e.target).addClass("error");
      }
    );

  },

  // Honestly, this doesn't do much, because it autosaves on keypress. But we have it anyway.
  'click .controls-save' : function (e) {  

    // Hack to maintain the style
    var css = $("#story").attr("style");

    if(Session.get("session_story")) {
      Stories.update(
        { _id: Session.get("session_story")},
        {
          $set: {
            text: document.getElementById('story').value
          }
        }
      );
    } else {
      var date = Session.get("session_date");
      Session.set("session_story",Stories.insert(
        {
          owner: Meteor.userId(),
          date: new Date(date.getFullYear(),date.getMonth(),date.getDate()),
          created: new Date.getTime(),
          text: document.getElementById('story').value,
          public: false
        }
      ));
    }

    // Hack to maintain the style
    setTimeout(function() {$("#story").attr("style",css);},0);

  },

  // Open up the menu...
  'click .controls-menu' : function(e) {

    //Hack to maintain the style
    var css = $("#story").attr("style");


    if(!Session.get("show_sidebar")) openSidebar();
    else closeSidebar();


    // Hack to maintain the style
    setTimeout(function() {$("#story").attr("style",css);},0);

  },
  'click .controls-share' :function(e) {
    clearTimeout(publicDelay);
    if(Session.get("session_story")) {

      // Hack to maintain the style
      var css = $("#story").attr("style");

      $icon = $(".controls-share-icon");

      if($icon.hasClass("unlock")) {
        $icon.css("background-position","0 0").removeClass("unlock").addClass("lock animate");
        newPublic=false;
      } else {
        $icon.css("background-position","-378px 0").removeClass("lock").addClass("unlock animate");
        newPublic=true;
      }

      // Let's give the animation some time to complete before updating the server.
      publicDelay = setTimeout(function() {
        // The animate class has the CSS animation. 
        // We need to remove it because otherwise when Meteor rerenders, it will animate again.
        $icon.removeClass("animate");  
        Stories.update(
          { _id: Session.get("session_story")},
          {
            $set: {
              public: newPublic
            }
          }
        );

        // Hack to maintain the style
        setTimeout(function() {$("#story").attr("style",css);},0);

      },800);

    } else {
      // Need a better error here.
      alert("No story to share...");
    }

  }
});

Template.journal.helpers({
  // Let's return the date all pretty.
  date: function() {
    if(Session.get("session_date")) return prettyDate(Session.get("session_date"));
    else return "Loading...";
  },
  // Is the user logged in?
  loggedIn: function() {
    return Meteor.userId;
  }
});

function setDate(date) {
  if(Session.get("data_loaded")) {
    // We need to find the lower and upper bound of the times we're searching for:
    nextDate = new Date(new Date().setTime(date.getTime() + 24 * 60 * 60 * 1000));
    start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
    end = new Date(nextDate.getFullYear(),nextDate.getMonth(),nextDate.getDate());

    if(end < new Date()) { // Date is within a valid range...

      // Regardless of whether or not we have a story, we need to make sure the session is on the right date
      Session.set("session_date", date);

      // If multiple results, (Why? How?) find the one that's created the earliest.
      story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}},{sort: {created: 1,date: 1}});
      if(story) {
        makeBackground(story.img);
        Session.set("session_story", story._id);
        $("#story").val(story.text); // A little bug fix, because text inputs are persistent, we need to manually force in the new value.
      }
      else {
        makeBackground();
        Session.set("session_story", undefined);
        $("#story").val(""); // A little bug fix, because text inputs are persistent, we need to clear it out.
      }
      setTimeout(function() {
        if(typeof $dummy == "undefined") console.log("For some reason, Besterday is trying to center the story before the DOM is loaded...");
        else $("#story").verticalCenter(true);
      },0)
      return true;
    } else {
      // I need a better error for trying to go beyond "Yesterday"
      return false;
    }
  } else {
    console.log("For some reason, Besterday is trying to set the date before the data is loaded. Hang tight."); 
    return false;
  }

}

function makeBackground(picture) {

  if(typeof $bg == "undefined" && $(".bg").length) $bg = $(".bg");
  if(typeof $bgImage == "undefined" && $(".bg-image").length) $bgImage = $(".bg-image");

  function changeBg(url) {
    $bgImage.css("background-image","url("+url+")");
    $bg.animate({opacity:1})
  }

  // If there's a previous thing happening, let's cancel that.
  // NOTE! As of 7/2 this is not cancelling. Still broken.
  if($bgPreload) $bgPreload.unbind("load");

  if (typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.url) var url = picture.url;
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
      $bgPreload.one("load", changeBg(url));
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


function scrollNav() {

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
      if (setDate(date)) {
        resetScroll();
      }
      else {
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
    console.log("fail");
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
              animateReset(new Date(new Date().setTime(Session.get("session_date").getTime() - 24 * 60 * 60 * 1000)));
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
              animateReset(new Date(new Date().setTime(Session.get("session_date").getTime() + 24 * 60 * 60 * 1000)));
            }
        }
      }
  });
}

/* ==========================================================================
   TEMPLATE: Sidebar
   ========================================================================== */
var sidebarChangeable = true;
var sidebarCleanup;

var openSidebar = function () {
  Session.set("show_sidebar", true);
  setTimeout(function() {
    $("#sidebar").animate({"left":0});
    scrollSidebar();
    $("#journal").one("click",closeSidebar);
  },1);
};

var closeSidebar = function() {
  $("#sidebar").css("left",-330);
  $("#journal").unbind("click",closeSidebar);
  setTimeout(function() {

    //Hack to maintain the style
    var css = $("#story").attr("style");

    Session.set("show_sidebar", false);

    //Hack to maintain the style
    setTimeout(function() {
      $("#story").attr("style",css);
    },0);

  },500);
  $()
}

Template.page.showSidebar = function () {
  return Session.get("show_sidebar");
};

var days = [0,1,2,3,4,5,6];
Template.sidebar.weekThis = function () {


  currently = Session.get("session_date").getDay();


  for(var i = currently;i<=6;i++) {
    currentTime = new Date(Session.get("session_date")).getTime();
    newTime = new Date(new Date().setTime(currentTime + ((i-currently) * 24 * 60 * 60 * 1000) ));
    newDate = new Date(newTime.getFullYear(),newTime.getMonth(),newTime.getDate());
    days[i] = returnStory(new Date(newDate));
    days[i].prettyDate = prettyDate(newDate);

  }
  for(var i = currently;i>=0;i--) {
    currentTime = new Date(Session.get("session_date")).getTime();
    newTime = new Date(new Date().setTime(currentTime + ((i-currently) * 24 * 60 * 60 * 1000) ));
    newDate = new Date(newTime.getFullYear(),newTime.getMonth(),newTime.getDate());
    days[i] = returnStory(new Date(newDate));
    days[i].prettyDate = prettyDate(newDate);

  }
  days[currently].active = "active";

  if (! days)
    return []; // party hasn't loaded yet
  return days;
};

Template.sidebar.helpers({
  // "active": function() {
  //   return "";
  // },
  // "story": function() {
  //   return "";
  // },
  // "date":function() {
  //   return "hi";
  // }
});

Template.sidebar.events({
  'click .sidebar-menu-sub-list-week li': function(e) {
    setDate(new Date(e.target.getAttribute("data-date")));
    // closeSidebar();
  },
  'click .sidebar-menu-sub-list-week.next':function(e) {
    var newDate = new Date($(".sidebar-menu-sub-list-week.this li").last().find("a").data("date"));

    newDate = new Date(new Date().setTime(newDate.getTime() + 24 * 60 * 60 * 1000));
    setDate(new Date(newDate));
  },
  'click .sidebar-menu-sub-list-week.prev':function(e) {
    var newDate = new Date($(".sidebar-menu-sub-list-week.this li").first().find("a").data("date"));

    newDate = new Date(new Date().setTime(newDate.getTime() - 24 * 60 * 60 * 1000));
    setDate(new Date(newDate));
  }
});

Template.sidebar.rendered = function() {

}

function returnStory(date) {
  date = new Date(date);
  nextDate = new Date(new Date().setTime(date.getTime() + 24 * 60 * 60 * 1000));
  start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  end = new Date(nextDate.getFullYear(),nextDate.getMonth(),nextDate.getDate());

  story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}},{sort: {created: 1,date: 1}});
  if(story) return story;
  else return {date:date};
}

function scrollSidebar() {

  // function resetScroll() {
  //   $("li.sidebar-menu-sub-list-week.next").animate({"max-height":"40px"});
  //   $("li.sidebar-menu-sub-list-week.prev").animate({"max-height":"0px"},function() {
  //     dateChangeable = true;
  //   });
  // }

  // $(".sidebar-menu-sub.list .content").bind('mousewheel', function(event) {
  //   console.log($(this)[0].scrollHeight-$(this).outerHeight() - $(this).scrollTop() < 1);
  //   if(sidebarChangeable) {
  //       if (event.originalEvent.wheelDelta >= 0 && $(this).scrollTop() < 1) {

  //           if($("li.sidebar-menu-sub-list-week.prev").css("max-height").replace(/[^-\d\.]/g, '')<=40){
  //             $("li.sidebar-menu-sub-list-week.prev").css({"max-height" : "+=1px"});
  //             clearTimeout(sidebarCleanup);
  //             sidebarCleanup = setTimeout(function() {
  //               resetScroll();
  //             },100);
  //           }
  //           else {
  //             clearTimeout(sidebarCleanup);
  //             sidebarChangeable = false;
  //             // animateReset(new Date(new Date().setDate(Session.get("session_date").getDate()-1)));
  //           }
  //       }
  //       else if($(this)[0].scrollHeight-$(this).outerHeight() - $(this).scrollTop() < 1) {

  //           if($("li.sidebar-menu-sub-list-week.next").css("max-height").replace(/[^-\d\.]/g, '')<=80){
  //             $("li.sidebar-menu-sub-list-week.next").css({"max-height" : "+=1px"});
  //             clearTimeout(sidebarCleanup);
  //             sidebarCleanup = setTimeout(function() {
  //               resetScroll();
  //             },100);
  //           }
  //           else {
  //             clearTimeout(sidebarCleanup);
  //             sidebarChangeable = false;
  //             // animateReset(new Date(new Date().setDate(Session.get("session_date").getDate()-1)));
  //           }
  //       }
  //     }
  // });
}

/* ==========================================================================
   PLUGINS
   ========================================================================== */

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */
var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
    var date = time;
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 7 )
        return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate();
            
    return day_diff == 0 && (
            diff < 86400 && "today") ||
        day_diff == 1 && "yesterday" ||
        day_diff < 7 && dayNames[date.getDay()];
}


/*
 * Image Light/Dark Detection
 * Author: lostsource
 * Source: http://stackoverflow.com/questions/13762864/image-dark-light-detection-client-sided-script
 */
function getImageLightness(imageSrc,callback) {
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
 * Vertically Center Text In "textarea"
 * Author: Behnam Esmali
 * Source: http://stackoverflow.com/questions/13552655/how-to-vertically-center-text-in-textarea
 */
var centerOnce = true; // Incredibly annoying hack to center the type on first load.

function formatDummyText(text) {
  if ( !text ) return 'What was the best thing that happened to you?';
  else return text.replace( /\n$/, '<br>&nbsp;' ).replace( /\n/g, '<br>' );
}
function calculateTop() {
  var top=0;
  if(Session.get("data_loaded") && typeof $dummy != "undefined") {
    if ($dummy.length) {
      var h = $(window).height()-120;
      top = (h - $dummy.height()) * .5;
    }
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

  if(force) {$(this).css("padding-top",calculateTop());}
  $(this).css({opacity:1});
};
