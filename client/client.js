
/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  Session.set('data_loaded', false); 
  $(window).resize(function() {$("#story").verticalCenter(true);});

  scrollNav();
  $(document).keyup(function(e) {
    if (e.keyCode == 27 && Session.get("show_sidebar")) {
      closeSidebar();
    }   // esc
  });

});

Meteor.subscribe('default_db_data', function(){
  //Set the reactive session as true to indicate that the data have been loaded
  Session.set('data_loaded', true); 
  if(!Session.get("session_date")) {
    yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    setDate(yesterday);
  }
});

/* ==========================================================================
   TEMPLATE: Journal
   ========================================================================== */
var $dummy;
var cleanUp;
var dateChangeable = true;

// Bind moviesTemplate to Movies collection
Template.journal.story = function () {
  var story = Stories.findOne(Session.get("session_story"));
  if(story){
    image = story.img;
  }
  else {story = new Object();story.text = ""}
  return story;
}; 

Template.journal.rendered = function() {
  Meteor.defer(function () {
    if(typeof $dummy == "undefined" && $(".dummy").length) $dummy = $(".dummy");
    if($("#story").length) $("#story").verticalCenter();
  });
};

Template.journal.events({
  'keyup #story' : function (e) {
    //Hack to maintain the style
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
      Session.set("session_story",Stories.insert(
        {
          owner: Meteor.userId(),
          date: Session.get("session_date"),
          text: document.getElementById('story').value,
          public: false
        }
      ));
    }
    setTimeout(function() {
      $("#story").attr("style",css);
      $(e.target).verticalCenter(true);
    },0);
  },
  'click .media-image' : function (e) {
    e.preventDefault();

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
          Session.set("session_story",Stories.insert(
            {
              owner: Meteor.userId(),
              date: Session.get("session_date"),
              img: image,
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
  'click .controls-save' : function (e) {  
    // $(e.target).verticalCenter();
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
      Session.set("session_story",Stories.insert(
        {
          owner: Meteor.userId(),
          date: Session.get("session_date"),
          text: document.getElementById('story').value,
          public: false
        }
      ));
    }
    setTimeout(function() {$("#story").attr("style",css)},0);
  },
  'click .controls-menu' : function(e) {

    //Hack to maintain the style
    var css = $("#story").attr("style");


    if(!Session.get("show_sidebar")) openSidebar();
    else closeSidebar();

    //Hack to maintain the style
    setTimeout(function() {
      $("#story").attr("style",css);
    },0);
  },
  'click .controls-share' :function(e) {
    if(Session.get("session_story")) {
      var css = $("#story").attr("style");

      $icon = $(".controls-share-icon");

      if($icon.hasClass("unlock")) {
        $icon.css("background-position","0 0").removeClass("unlock").addClass("lock");
        newPublic=false;
      } else {
        $icon.css("background-position","-378px 0").removeClass("lock").addClass("unlock");
        newPublic=true;
      }

      Stories.update(
        { _id: Session.get("session_story")},
        {
          $set: {
            public: newPublic
          }
        }
      );

      setTimeout(function() {$("#story").attr("style",css)},0);
    } else {
      alert("No story to share...");
    }

  }
});

Template.journal.helpers({
  style: function() {
    var style = "";
    var top = 0;
    centering = true;

    if(Session.get("data_loaded") && typeof $dummy != "undefined") {
      if($("#story").length) $("#story").verticalCenter();
      if ($dummy.length) {
        var h = $(window).height()-120;
        top = (h - $dummy.height()) * .5;

      }
    }

    style = "padding-top:"+top+"px";
    return style;
  },
  date: function() {
    if(Session.get("session_date")) return prettyDate(Session.get("session_date"));
    else return "Loading...";
  },
  loggedIn: function() {
    return Meteor.userId;
  },
  locked: function() {
    var locked = "";
    if (Session.get("session_story") && Session.get("data_loaded")) {
      var story = Stories.findOne(Session.get("session_story"));
      if(story) locked = story.public ? "unlock" : "lock";
    }
    return locked;
  }
});

function setDate(date) {
  nextDate = new Date(new Date().setTime(date.getTime() + 24 * 60 * 60 * 1000));
  start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  end = new Date(nextDate.getFullYear(),nextDate.getMonth(),nextDate.getDate());

  if(end < new Date()) {

    Session.set("session_date", date);
    story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}},{"date": 1});
    if(story) {
      makeBackground(story.img);
      Session.set("session_story", story._id);
      $("#story").val(story.text);
    }
    else {
      makeBackground();
      Session.set("session_story", undefined);
      $("#story").val("");
    }
    setTimeout(function() {$("#story").verticalCenter(true);},0)
    return true;
  } else {
    return false;
  }
}

function makeBackground(picture) {
  if (typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.url) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = JSON.parse(picture).url;
    else var url = picture;

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

    $(".bg").stop().animate({opacity:0},function() {
      var $img = $('<img/>').attr("src",url).one("load", function() {
        $(".bg-image").css("background-image","url("+url+")");
        $(".bg").animate({opacity:1})
      });
    });
  }
  else $(".bg").animate({opacity:0},function() {
    setTimeout(function() {
      $(".upload").removeClass("attached");
      $(".bg-image").css("background-image","none");
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

  story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}});
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
 * Ink File Picker
 * Source: https://developers.inkfilepicker.com/docs/web/
 */
 (function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document); 
filepicker.setKey("APd3x3sjxQiJBRAXXWeoMz");


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
