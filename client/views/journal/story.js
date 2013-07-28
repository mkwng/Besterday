
storytimeRenderedTimeout = setTimeout(function() {},0);
storyMargin = $(window).width() > 768 ? 40 : $(window).width() > 320 ? 20 : 0;
paddingTopTemp = 100;

Template.storytime.created = function() {}


Template.storytime.rendered = function() {
    clearTimeout(storytimeRenderedTimeout);
    storytimeRenderedTimeout = setTimeout(function() {
      $("textarea").verticalCenterTextarea(true);
      $(".story.img img").load(function() {
        $(this).closest(".img").imgCover("");
        $(this).animate({"opacity":1});
      });
      if(Session.get("edit")) $(".story").edit();
    },100);
}


Template.storytime.destroyed = function() {}


Template.storytime.story = function() {
  story = findStory(Session.get("session_user"),Session.get("session_date"));
  return story;
}

Template.storytime.edit = function() {
  return Session.get("edit");
}

Template.storytime.events({
  "click a.cover-area" : function(e) {
    e.preventDefault();
    // $(e.currentTarget).siblings(".story").showStory();
  },
  'click a.close' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").showStory();
  },
  "keyup textarea.story-text" : function(e) {
    if (e.which === 27) {
      $(".story").editCancel();
    }
    $("textarea").verticalCenterTextarea();
  },
  'click a.edit' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").edit();
  },
  'click a.done' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").editDone();
  }
});

Template.storytime.helpers({
  'paddingTopStory' : function() {
    if (!!paddingTopTemp) return paddingTopTemp-4;
    var $temp = $(".cover-transition .profile-grid-stories-story");
    if (!$temp.length) return 120;
    console.log($temp.position().top-4);
    // debugger;
    return $temp.position().top-4;
  },
  'currentStyle' : function() {
    var $temp = $(".cover-transition .profile-grid-stories.story");
    if (!$temp.length) {
      $temp = $('<div class="temp"></div>').css({
        top:storyMargin,
        left:storyMargin,
        width:$(window).width()-storyMargin*2+"px",
        height:$(window).height()-storyMargin*2+"px",
        position:"fixed",
        "z-index":99,
        transform:"translate3d(0,0,0)"
      });
    }
    return $temp.attr("style");
  },
  randomClasses : function() {
    var classes = "";
    $ts = $(".cover-transition .profile-grid-stories.story");
    if ($ts.hasClass("alt-1")) classes += " alt-1";
    if ($ts.hasClass("alt-2")) classes += " alt-2";
    if ($ts.hasClass("alt-3")) classes += " alt-3";
    if ($ts.hasClass("alt-4")) classes += " alt-4";
    if ($ts.hasClass("alt-5")) classes += " alt-5";
    return classes;
  },
  imgUrl : function() {
    if (!story) return;
    picture = story.img;
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = jQuery.parseJSON(picture).url;
    else var url = picture; // Phew.

    return url;
  },
  'date_month' : function() {
    if (story && story.date.getMonth)
      return monNames[story.date.getMonth()];
    else if(Session.get("session_date"))
      return monNames[Session.get("session_date").month];
    else 
      return "Loading..."
  },
  'date_date' : function() {
    if (story && story.date.getDate)
      return story.date.getDate();
    else if(Session.get("session_date"))
      return Session.get("session_date").date;
    else 
      return "Loading..."
  },
  'date_year' : function() {
    if (story && story.date.getFullYear)
      return story.date.getFullYear();
    else if(Session.get("session_date"))
      return Session.get("session_date").year;
    else 
      return "Loading..."
  },
  'imgDark' : function() {
    if (!story) return;
    picture = story.img;
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = jQuery.parseJSON(picture).url;
    else var url = picture; // Phew.
    var storyColor;
    getImageLightness(url,function(brightness){
      if(brightness<150) {
        storyColor = "#ffffff";
      }
      else {
        storyColor = "default";
      }
    });
  },
  'url' : function() {
    var url;
    if(!story.date.getFullYear) {
      url="#";
    } else {
      url = "/"+sessionScreenName+getDateUrl(story.date);
    }
    return url;
  },
  'copyImgStyle' : function() {
    var imgimg = $(".cover-transition .profile-grid-stories-img").attr("style");
    return imgimg;
  }
});

jQuery.fn.showStory = function(callback) {
  if(typeof $cover == "undefined" || !$cover.closest("body").length) {
    $cover = $(".cover-transition");
    if($cover.length) {}
    else{
      $cover = $('<div class="cover-transition"></div>');
      $cover.appendTo("body");
    }
  }

  this.each(function() {
    $t = $(this);
    var w = $(window).width();
    storyMargin = w > 768 ? 40 : w > 320 ? 20 : 0;

    // Opening this. Make sure it's not one that's already open.
    if(!$t.hasClass("expanded") && !$t.hasClass("story")) {

      // Find the date we're going to
      var toDate = discreteDate(new Date($(this).attr("data-date")));

      // Create a new clone that we can animate without messing with the original
      $tc = $t.clone().removeClass("isotope-item").addClass("animate transition").removeAttr("href").css({
        position:"fixed",
        top:$t.offset().top - $(window).scrollTop(),
        left:$t.offset().left,
        "z-index":99,
        transform:"translate3d(0,0,0)"
      }).changeElementType("div");

      // Append that to $cover and animate it. Let's save the previous attributes for animating back.
      $tc.appendTo($cover).css({
        top:storyMargin,
        left:storyMargin,
        width:$(window).width()-storyMargin*2+"px",
        height:$(window).height()-storyMargin*2+"px"
      }).addClass("story no-hover");
      // $tc.attr("data-original",$.param({
      //   top:$t.offset().top - st + "px",
      //   left:$t.offset().left + "px",
      //   width:$t.width(),
      //   height:$t.height()
      // }));

      // We clamped the text to 4 lines previously, let's bring it back here.
      $ts = $tc.find(".profile-grid-stories-story");
      $ts.html($ts.attr("data-story"));

      // DOM element visiblity + sizing housekeeping.
      $t.css("opacity",0);
      $cover.addClass("visible");
      $tc.imgCover("window");

      setTimeout(function() {
        paddingTopTemp = $ts.position().top;

        Session.set("expanded_story",true);


        // Animation is done. Let's make sure all the text fits, and then hide everything. Then open the real one.
        // if($ts[0].clientHeight>$(window).height()-storyMargin*2) $ts.addClass("scroll");
        $cover.addClass("transition-hide");

        setDate(Session.get("session_user"),toDate,true);

        if(typeof callback == "function"){
          callback();
        }
      },500);


    // Closing
    } else if($t.hasClass("story")) {
      // Hide the real one. Bring back the fake one.
      Session.set("expanded_story",false);
      $cover.removeClass("transition-hide");

      $original = $(".expanded");
      if(!$original.length){
        var params = {opacity:0};
      } else {
        var params = {
          top:$original.offset().top - $(window).scrollTop() + "px",
          left:$original.offset().left + "px",
          width:$original.width(),
          height:$original.height()
        }
      }

      $tc = $cover.find(".story").removeClass("no-transition animate");
      setTimeout(function() {
        $cover.removeClass("visible");
        $tc.removeClass("story").css(params);
      },0);
      setTimeout(function() {
        // Animation is done, let's bring back the original, and clean up.
        $(".expanded").css("opacity",1).removeClass("expanded");
        $cover.remove();
        Meteor.Router.to("/user/"+sessionScreenName);
        if(typeof callback == "function"){
          callback();
        }
      },500);
    } else {
      console.log("Nope");
    }

    $t.toggleClass("expanded");
  });
}

editStory = function(ddate) {
  // story = Stories.findOne({owner:Meteor.userId(),discreteDate:ddate});
  // if (!Session.get("override")) {
  //   if(typeof story == "undefined") {
  //     Meteor.Router.to('/story/yesterday');
  //   } else {
  //     Meteor.Router.to('/story/'+story._id+'/edit');
  //   }
  // }
}

jQuery.fn.edit = function() {
  $storyText = $(this).find(".story-text");
  $storyText.attr("data-original",$storyText[0].value).removeAttr("disabled");
  setTimeout(function() {
    $($("textarea")[0]).focus();
    Session.set("edit",true);
  },100);
};
jQuery.fn.editDone = function() {
  $storyText = $(this).find(".story-text").attr("disabled","");

  if(sessionId) {
    Meteor.call("updateText",sessionId,$storyText[0].value);
  } else {
    Meteor.call("createStory",{
      owner: Meteor.userId(),
      date: objectifyDate(Session.get("session_date")),
      discreteDate: Session.get("session_date"),
      created: new Date().getTime(),
      text: $storyText[0].value,
      public: false
    }, function(e,r) {
      console.log(e,r);
      sessionId = r;
    });
  }

  setTimeout(function() {
    Session.set("edit",false);
    // toggleLoad(false,"controls-save");
    updateStats(Meteor.userId());
    // Meteor.Router.to("/user/"+sessionScreenName);

    if(JSON.stringify(Session.get("session_date"))==JSON.stringify(discreteDate(incrementDate(new Date(),-1))) && Meteor.Router.page() == "storytime"){
      createModal("Awesome.","See you tomorrow.",{close:"Ok",profile:"Go to profile"});
    }

  },0);
}
jQuery.fn.editCancel = function() {
  if (Session.get("edit")) {
    $storyText = $(this).find(".story-text");
    Session.set("edit",false);
    $storyText.attr("disabled","").val($storyText.attr("data-original"));
  }
}