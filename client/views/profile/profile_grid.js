Template.profile_grid.created = function() {}


Template.profile_grid.rendered = function() {
  // $profileGrid = $(".profile-grid").css({"width":"+="+getScrollBarWidth(),"padding-right":getScrollBarWidth()});
  $profileGridInner = $(".profile-grid-inner");
  $profileGridInner.isotope({itemSelector:'.profile-grid-stories'});
}


Template.profile_grid.destroyed = function() {}


Template.profile_grid.stories = function() {
  stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1},limit:Session.get("grid_count")}).fetch();
  return stories;
}

Template.profile_grid.events({});


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
    if(ran < 1) classes += " large";
    else if(ran >7.7) classes += "wide";
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
  }
});
