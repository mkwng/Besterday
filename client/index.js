
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

Template.page.loggedIn = function () {
  return Meteor.userId();
}

days = [];
Template.sidebar.weekThis = function () {


  currently = Session.get("session_date").getDay();


  for(var i = currently;i<=13;i++) {
    var newDate = incrementDate(Session.get("session_date"),i-currently);
    days[i+7] = findStory(Session.get("session_user"),newDate);
    days[i+7].prettyDate = prettyDate(newDate);
  }
  for(var i = currently;i>=-7;i--) {
    var newDate = incrementDate(Session.get("session_date"),i-currently);
    days[i+7] = findStory(Session.get("session_user"),newDate);
    days[i+7].prettyDate = prettyDate(newDate);
  }
  days[currently+7].active = "active";

  if (! days)
    return []; // party hasn't loaded yet
  return days;
};

Template.sidebar.helpers({
  'day' : function() {
    return this.date.getDate();
  },
  'disabled' : function() {
    return (this.date > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) );
  },
  'month' : function() {
    return monthNames[Session.get("session_date").getMonth()];
  },
  'year' : function() {
    return Session.get("session_date").getFullYear();
  },
  'dateUrl' : function() {
    return "/"+sessionScreenName+"/"+this.date.getFullYear()+"/"+(this.date.getMonth()+1)+"/"+this.date.getDate();
  }
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
  },
  'click .signout' : function(e, tmpl) {
    return Meteor.logout(function() {
      console.log("logging out");
      Session.set("session_user", "");
      Session.set("session_date", incrementDate(new Date(),-1));
      sessionId = "";
      sessionScreenName = "";
      closeSidebar();
      Meteor.Router.to('/');
    });
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