
storyMargin = $(window).width() > 320 ? 40 : 0;
paddingTopTemp = 100;

Template.storytime.created = function() {}


Template.storytime.rendered = function() {
    $("textarea").verticalCenterTextarea(true);
    // $st = $(".story-text");
    // console.log($st[0].clientHeight);
    // if($st[0].clientHeight>$(window).height()-40*2) $st.addClass("scroll");
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
    $(e.currentTarget).siblings(".story").showStory();
  },
  'click a.close' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").showStory();
  },
  "keyup textarea.story-text" : function(e) {
    $("textarea").verticalCenterTextarea();
  },
  'click a.edit' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").edit();
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
  },
  'date_date' : function() {
    if (story && story.date.getDate)
    return story.date.getDate();
  },
  'date_year' : function() {
    if (story && story.date.getFullYear)
    return story.date.getFullYear();
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
    storyMargin = $(window).width() > 320 ? 40 : 0;

    // Opening this. Make sure it's not one that's already open.
    if(!$t.hasClass("expanded") && !$t.hasClass("story")) {

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
        // debugger;
        paddingTopTemp = $ts.position().top;
        Session.set("expanded_story",true);
        // Animation is done. Let's make sure all the text fits, and then hide everything. Then open the real one.
        // if($ts[0].clientHeight>$(window).height()-storyMargin*2) $ts.addClass("scroll");
        $cover.addClass("transition-hide");


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

jQuery.fn.edit = function() {
  $(this).find(".story-text").removeAttr("disabled");
  setTimeout(function() {$($("textarea")[0]).select();},100);
};
jQuery.fn.editDone = function() {
  $(this).find(".story-text").addAttr("disabled");
}







