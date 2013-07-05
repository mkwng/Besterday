
/* ==========================================================================
   TEMPLATE: Page
   ========================================================================== */
// Tasks when Page is created.



// Tasks when Page is rendered.



// Tasks when Page is destroyed.



// Events
// Helpers

/* ==========================================================================
   TEMPLATE: Sidebar
   ========================================================================== */
// Tasks when Sidebar is created.



// Tasks when Sidebar is rendered.



// Tasks when Sidebar is destroyed.



// Bind to Stories collection.



// Events
// Helpers

Template.page.showSidebar = function () {
  return Session.get("show_sidebar");
};

var days = [0,1,2,3,4,5,6];
Template.sidebar.weekThis = function () {


  currently = Session.get("session_date").getDay();


  for(var i = currently;i<=6;i++) {
    var newDate = incrementDate(Session.get("session_date"),i-currently);
    days[i] = findStory(Session.get("session_user"),newDate);
    days[i].prettyDate = prettyDate(newDate);

  }
  for(var i = currently;i>=0;i--) {
    var newDate = incrementDate(Session.get("session_date"),i-currently);
    days[i] = findStory(Session.get("session_user"),newDate);
    days[i].prettyDate = prettyDate(newDate);
  }
  days[currently].active = "active";

  if (! days)
    return []; // party hasn't loaded yet
  return days;
};

Template.sidebar.helpers({

});

Template.sidebar.events({
  'click .sidebar-menu-sub-list-week li': function(e) {
    setDate(Session.get("session_user"),new Date(e.target.getAttribute("data-date")));
    // closeSidebar();
  },
  'click .sidebar-menu-sub-list-week.next':function(e) {
    var newDate = new Date($(".sidebar-menu-sub-list-week.this li").last().find("a").data("date"));
    newDate = incrementDate(new Date(newDate),1);
    setDate(Session.get("session_user"),newDate);
  },
  'click .sidebar-menu-sub-list-week.prev':function(e) {
    var newDate = new Date($(".sidebar-menu-sub-list-week.this li").first().find("a").data("date"));
    newDate = incrementDate(new Date(newDate),-1);
    setDate(Session.get("session_user"),newDate);
  }
});


var sidebarChangeable = true;
var sidebarCleanup;

openSidebar = function () {
  Session.set("show_sidebar", true);
  setTimeout(function() {
    $("#sidebar").animate({"left":0});

    $("#journal").one("click",closeSidebar);
  },0);
};

closeSidebar = function() {
  $("#sidebar").css("left",-330);
  $("#journal").unbind("click",closeSidebar);
  setTimeout(function() {

    Session.set("show_sidebar", false);

  },500);
  $()
}