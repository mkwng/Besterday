$profileGridInner = undefined;

Template.profile_grid.created = function() {}


Template.profile_grid.rendered = function() {
  pageViews++;
  $profileGridInner = $(".profile-grid-inner");

  // This makes sure the container is evenly divisible and sets the grid
  if (pageViews<=2)
    $profileGridInner.widthDivisible("first");
  $(".profile-grid-stories.img img").css("opacity",0)

  setTimeout(function() {
    gridHousekeeping();
  },1000)


}
gridHousekeeping = function() {
    $profileGridInner.widthDivisible();
    // On load, let's clip all the text so it fits in four lines.
    $(".profile-grid-stories-story").each(function() {
      $(this).attr("data-story",$(this).html());
      $clamp(this, {clamp: 4, useNativeClamp: false});
    });  

    // Make sure the images are positioned correctly and load nicely
    $(".profile-grid-stories.img").imgCover();
    $(".profile-grid-stories.img img").load(function() {
      $(this).closest(".img").imgCover("");
      $(this).css("opacity",1);
    });
}

Template.profile_grid.destroyed = function() {}


Template.profile_grid.stories = function() {
  stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch();
  return stories;
}

Template.profile_grid.events({

  "click a.profile-grid-stories" : function(e) {
    e.preventDefault();
    $(e.currentTarget).showStory();
  },
  "click .profile-grid-more" : function(e) {
    e.preventDefault();
    var $this = $(e.currentTarget);
    if(!!$removedItems) {

      if($this.hasClass("less")){
        $removedItems = $("a.profile-grid-stories").slice(7);
        $(".profile-grid-inner").isotope('remove',$removedItems);
        $this.html("Show more&hellip;").removeClass("fixed");
        $(window).unbind('scroll',stickyLess);
      }
      else{
        $(".profile-grid-inner").append($removedItems).isotope('appended',$removedItems,function() {
          gridHousekeeping();
        });
        $this.html("Show less&hellip;").addClass("fixed");
        $(window).bind('scroll',stickyLess);
      }

      $this.toggleClass("less");
    }
  }
});

Template.profile_grid.helpers({
  imgUrl : function() {
    picture = this.img;
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = jQuery.parseJSON(picture).url;
    else var url = picture; // Phew.

    return url;
  },
  randomClasses : function() {
    var ran = Math.floor(Math.random()*6);
    var classes = ""
    switch(ran){
      case 0:
        classes = "";
        break;
      case 1:
        classes = "alt-1"
        break;
      case 2:
        classes = "alt-2"
        break;
      case 3:
        classes = "alt-2"
        break;
      case 4:
        classes = "alt-3"
        break;
      case 5:
        classes = "alt-4"
        break;
      case 6:
        classes = "alt-5"
        break;
    }
    ran = (Math.random()*8);
    if(ran < 1) classes += !!this.img ? " wide" : " large";
    return classes;
  },
  'date_month' : function() {
    if (this.date.getMonth)
    return monNames[this.date.getMonth()];
  },
  'date_date' : function() {
    if (this.date.getDate)
    return this.date.getDate();
  },
  'date_year' : function() {
    if (this.date.getFullYear)
    return this.date.getFullYear();
  },
  'imgDark' : function() {
    picture = this.img;
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
    if(!this.date.getFullYear) {
      url="#";
    } else {
      url = "/"+sessionScreenName+getDateUrl(this.date);
    }
    return url;
  }
});


isoTimeout = setTimeout(function() {},0);
$removedItems = {};
numCols = 0;
jQuery.fn.widthDivisible = function(callback) {
  clearTimeout(isoTimeout);

  numCols = Math.round(1/($(".profile-grid-stories:not(.wide)").slice(0,1).width()/$(window).width()));

  var width = $(window).width();

  // Force the width of the container to a number evenly divisible by numCols
  if(width%numCols!=0){
    width = Math.floor(width / numCols) * numCols;
  }
  $(this).css("width",width);

  // This is fairly expensive, so setting a timeout so it doesn't run consecutively too many times.
  isoTimeout = setTimeout(function() {
    if (callback=="first") {
      var firstShow = Math.max((numCols - 2) * 2 + 1,5);
      $removedItems = $("a.profile-grid-stories").slice(firstShow).addClass("small").remove();
      var temp = $("a.profile-grid-stories").removeClass("wide large").slice(0,1).addClass("wide");
      $(".profile-grid-inner").isotope({masonry:{columnWidth:width/numCols}});
    }
    else
      $(".profile-grid-inner").isotope({masonry:{columnWidth:width/numCols}});
  },20);

  return $(this);
};


stickyLess = function() {
  $button = $(".profile-grid-more");
  if($(window).scrollTop()+$(window).height()-$button.height()>$(".profile-grid").offset().top+$(".profile-grid").height())
    $button.removeClass("fixed");
  else
    $button.addClass("fixed");
}










