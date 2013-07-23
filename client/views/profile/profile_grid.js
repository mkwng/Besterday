$profileGridInner = undefined;

Template.profile_grid.created = function() {}


Template.profile_grid.rendered = function() {
  // $profileGrid = $(".profile-grid").css({"width":"+="+getScrollBarWidth(),"padding-right":getScrollBarWidth()});
  $profileGridInner = $(".profile-grid-inner");
  $profileGridInner.widthDivByFour("first");
  $(".profile-grid-stories.img").imgCover();
  $(".profile-grid-stories.img img").load(function() {
    $(this).closest(".img").imgCover();
  });
}


Template.profile_grid.destroyed = function() {}


Template.profile_grid.stories = function() {
  stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch();
  return stories;
}

Template.profile_grid.events({
  "click .profile-grid-more" : function(e) {
    e.preventDefault();
    var $this = $(e.currentTarget);
    if(!!$removedItems) {

      if($this.hasClass("hide")){
        $removedItems = $(".profile-grid-stories").slice(5);
        $(".profile-grid-inner").isotope('remove',$removedItems);
        $this.html("Show more&hellip;");
      }
      else{
        $(".profile-grid-inner").append($removedItems).isotope('appended',$removedItems,function() {
          // Resize images to fit the grid.
          $(".profile-grid-stories.img").imgCover();
          $(".profile-grid-stories.img img").load(function() {
            $(this).closest(".img").imgCover();
          });
        });
        $this.html("Show less&hellip;");
      }

      $this.toggleClass("hide");
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
jQuery.fn.widthDivByFour = function(callback) {
  clearTimeout(isoTimeout);
  var width = $(window).width();

  if(width%4!=0){
    width = Math.floor(width / 4) * 4;
  }
  $(this).css("width",width);

  isoTimeout = setTimeout(function() {
    if (callback=="first") {
      $removedItems = $(".profile-grid-stories").slice(5).remove();
      $(".profile-grid-stories").removeClass("wide large").slice(0,1).addClass("wide");
      $(".profile-grid-inner").isotope({masonry:{columnWidth:width/4}});
    }
    else
      $(".profile-grid-inner").isotope({masonry:{columnWidth:width/4}});
  },100);

  return $(this);
};

jQuery.fn.imgCover = function() {
  this.each(function() {

    // Image container
    $imageContainer = $(this).find(".profile-grid-stories-img");

    // Image width
    var screenImage = $imageContainer.find("img");

    var theImage = new Image();
    if(!theImage.hasOwnProperty("src")) return false;

    theImage.src = screenImage.attr("src");
    var imageWidth = theImage.width;
    var imageHeight = theImage.height;

    // Container width
    var containerWidth = $(this).width();
    var containerHeight = $(this).height();

    var y;
    var x;

    // Determine if it needs to be stretched horizontally or vertically
    if(imageWidth/imageHeight > containerWidth/containerHeight) {
      y = containerHeight * 1.1;
      x = imageWidth * containerHeight/imageHeight * 1.1;
    } else {
      x = containerWidth * 1.1;
      y = imageHeight * containerWidth/imageWidth * 1.1;
    }

    var marginX = -1 * (x - containerWidth)/2;
    var marginY = -1 * (y - containerHeight)/2;


    $imageContainer.css("margin",marginY+"px "+marginX+"px "+marginY+"px "+marginX+"px");
    return true;

  });
}












