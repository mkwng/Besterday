$profileGridInner = undefined;
profileGridLoaded = false;
storyPage = 0;

Template.profile_grid.created = function() {
  profileGridLoaded = false;
}


Template.profile_grid.rendered = function() {
  profile_grid_ui();
}

Template.profile_grid.destroyed = function() {
  profileGridLoaded = false;
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
    var $test = $(Template.profile_grid());
    if ($test.length) {
      $(".profile-grid-inner").append($test);
      // $clamp($test, {clamp: 4});
      $(".profile-grid-inner").packery("appended",$test);

      showGridUi($test);

      storyPage++;
    } else {
      $("a.profile-grid-more").html("No more stories").addClass("disabled");
    }
}


profile_grid_ui = function() {
  $profileGridInner = $(".profile-grid-inner");
  $profileGridInner.widthDivisible();
  // setTimeout(function() {
  //   gridHousekeeping();
  //   setClamp();
  // },4)
}






