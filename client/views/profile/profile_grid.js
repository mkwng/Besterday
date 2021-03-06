$profileGridInner = undefined;
profileGridLoaded = false;
profileGridLoading = false;
storyPage = 0;

Template.profile_grid.created = function() {
  profileGridLoaded = true;
}

Template.profile_grid.rendered = function() {
}

Template.profile_grid.destroyed = function() {
  // profileGridLoaded = false;
}

Template.profile_grid.stories = function(page) {
  page = typeof page != "number" ? storyPage : page;
  stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1},skip:Session.get("pref_gridcount")*page,limit:Session.get("pref_gridcount")}).fetch();
  return stories;
}

Template.profile_grid.events({
  'click a.profile-grid-stories' : function(e) {
    e.preventDefault();
  }
});

Template.profile_grid.helpers({
  imgUrl : function() {
    return getImgUrl(this.img);
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
  }
});




showGrid = function() {
    profileGridLoaded = false;
    var $test = $(Template.profile_grid());

    function go() {
      if(profileGridLoaded == false || typeof $test == "undefined") {
        setTimeout(go,200);
      }
      else {
        if ($test.length) {
          $("a.profile-grid-more").html("Show more")
          $(".profile-grid-inner").append($test);
          $(".profile-grid-inner").packery("appended",$test);
          showGridUi($test);
          storyPage++;
        } else {
          console.log("No more");
          $("a.profile-grid-more").html("No more stories").addClass("disabled");
        }
        profileGridLoaded = true;
      }
    }

    setTimeout(go,200);
}

gridScrollCheck = function() {
  if($(".profile-grid-more").offset().top - winHeight - winTop < 0 && profileGridLoaded)
    showGrid();
}


profile_grid_ui = function() {
  $profileGridInner = $(".profile-grid-inner");
  $profileGridInner.widthDivisible();
  // setTimeout(function() {
  //   gridHousekeeping();
  //   setClamp();
  // },4)
}






