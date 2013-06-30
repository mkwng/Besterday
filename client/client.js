
/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  Session.set('data_loaded', false); 
  $(window).resize(function() {$("#story").verticalCenter(true);});

var cleanUp;
$(window).bind('mousewheel', function(event) {
    if (event.originalEvent.wheelDelta >= 0) {
        if($(".controls-up").css("top").replace(/[^-\d\.]/g, '')<-50)
          $(".controls-up").css({"top" : "+=1px"});
        else {
          console.log("done");
        }
        clearTimeout(cleanUp);
        cleanUp = setTimeout(function() {
          $(".controls-up").animate({"top":"-100px"});
        },10);
    }
    else {
        if($(".controls-dn").css("bottom").replace(/[^-\d\.]/g, '')<-50)
          $(".controls-dn").css({"bottom" : "+=1px"});
        else {
          console.log("done");
        }
    }
});

});

Meteor.subscribe('default_db_data', function(){
  //Set the reactive session as true to indicate that the data have been loaded
  Session.set('data_loaded', true); 
  if(!Session.get("session_date") && Session.get('data_loaded')) setDate(new Date(new Date().setDate(new Date().getDate() - 1)));
});

/* ==========================================================================
   TEMPLATE: Journal
   ========================================================================== */
var $dummy;

// Bind moviesTemplate to Movies collection
Template.journal.story = function () {
  var story = Stories.findOne(Session.get("session_story"));
  if(story)image = story.img;
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
    $(e.target).verticalCenter();
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
  },
  'click .media-image' : function (e) {
  },
  'click .controls-save' : function (e) {  
    // $(e.target).verticalCenter();
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
        // console.log("Applying style...")
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
  }
});

function setDate(date) {
  nextDate = new Date(new Date().setDate(date.getDate() + 1));
  start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  end = new Date(nextDate.getFullYear(),nextDate.getMonth(),nextDate.getDate());
  Session.set("session_date", date);

  story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}});
  if(story) {
    makeBackground(story.img);
    Session.set("session_story", story._id);
  }
  else {
    makeBackground();
    Session.set("session_story", undefined);
  }
}

function makeBackground(picture) {
  if (typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.url) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = JSON.parse(picture).url;
    else var url = picture;

    getImageLightness(url,function(brightness){
      if(brightness<150) {$("textarea").css("color","#ffffff");console.log("yes");}
      else {$("textarea").css("color","#666666");console.log("no");}
    });

    $(".bg-image").stop().animate({opacity:0},function() {
      var $img = $('<img/>').attr("src",url).one("load", function() {
        $(".bg-image").css("background-image","url("+url+")").animate({opacity:1})
      });
    });
  }
  else $(".bg-image").animate({opacity:0},function() {
    $(".upload").removeClass("attached");
    $(this).css("background-image","none");
    $("textarea").css("color","#666666");
  });
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

    // console.log("hello");
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
  if ( !text ) return 'The best thing that happened was...';
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
        $(this).css("padding-top",top);
      }
   });

  if(force) {$(this).css("padding-top",calculateTop());}
  $(this).css({opacity:1});
};
