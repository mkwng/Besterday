// If no story selected, select one.
Meteor.startup(function () {
  Deps.autorun(function () {
    setDate(new Date());
  });
});

// Meteor.subscribe("Stories", function() {
//   console.log("Subscribe successful.");
//   if (!Session.get("session_date")) {
//     setDate(new Date());
//   }
// });

// var image;

// Bind moviesTemplate to Movies collection
Template.journal.story = function () {
  var story = Stories.findOne(Session.get("session_story"));
  if(story){
    image = story.img;
    date = story.date;
  }
  return story;
}; 

Template.journal.helpers({
  date: function() {
    if (typeof Session.get("session_date") == "object") return prettyDate(Session.get("session_date"));
    else return "invalid date";
  },
  loggedIn: function() {
    return Meteor.userId;
  }
});

Template.journal.events({
  'keyup #story' : function (e) {
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
  'click .prev' : function (e) {
    e.preventDefault();

    prevDate = new Date(new Date().setDate(Session.get("session_date").getDate() - 1));

    setDate(prevDate);
  },
  'click .next' : function (e) {
    e.preventDefault();

    tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    nextDate = new Date(new Date().setDate(Session.get("session_date").getDate() + 1));

    if(nextDate < tomorrow) 
      setDate(nextDate);

  },
  'click .upload' : function (e) {
    e.preventDefault();
    console.log($(e.target).hasClass("attached"));
    if ($(e.target).hasClass("attached")) {
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
    } else {
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
          console.log(image);

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
    }
  },
  'click .facebook' : function (e) {
    e.preventDefault();
    console.log("hello");
    makeBackground("/soma.png");
  },
  'click .twitter' : function (e) {
    e.preventDefault();
    console.log("bye");
    makeBackground();
  }
});


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
//////////////////////// GLOBAL /////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function setDate(date) {

  nextDate = new Date(new Date().setDate(date.getDate() + 1));

  start = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  end = new Date(nextDate.getFullYear(),nextDate.getMonth(),nextDate.getDate());

  Session.set("session_date", date);

  story = Stories.findOne({"owner": Meteor.userId(),"date":{"$gte": start, "$lt": end}});
  if(story) {
      Session.set("session_story", story._id);
      makeBackground(story.img);
  } else {
      Session.set("session_story", undefined);
      makeBackground();
  }

}


function makeBackground(picture) {
  if (typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.url) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = JSON.parse(picture).url;
    else var url = picture;

    getImageLightness(url,function(brightness){
      if(brightness<150) $("#journal").find("label").css("color","#ffffff");
      else $("#journal").find("label").css("color","#222222");
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
    $("#journal").find("label").css("color","#222222");
  });
}




/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
//////////////////////// PLUGINS ////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

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
    // var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
    var date = time;
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 7 )
        return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate();
            
    return day_diff == 0 && (
            diff < 60 && "today" ||
            diff < 120 && "today" ||
            diff < 3600 && "today" ||
            diff < 7200 && "today" ||
            diff < 86400 && "today") ||
        day_diff == 1 && "yesterday" ||
        day_diff < 7 && dayNames[date.getDay()];
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" )
    jQuery.fn.prettyDate = function(){
        return this.each(function(){
            var date = prettyDate(this.title);
            if ( date )
                jQuery(this).text( date );
        });
    };




// Image light/dark detection: http://stackoverflow.com/questions/13762864/image-dark-light-detection-client-sided-script
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

// Filepicker.io
(function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document); 
filepicker.setKey("APd3x3sjxQiJBRAXXWeoMz");
