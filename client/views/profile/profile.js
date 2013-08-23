/* ==========================================================================
   TEMPLATE: Shared
   ========================================================================== */
Template.profile.created = function() {
}


Template.profile.rendered = function() {
  if(typeof runGaq == "function") $.throttle(250, runGaq);
  $(".profile-grid-inner").widthDivisible(function() {
    if(!$(".profile-grid-inner a.profile-grid-stories").length) {
      storyPage = 0;
      showGrid();
    }
  });
}


Template.profile.destroyed = function() {}

Template.profile.expandedStory = function() {
  return Session.get("expanded_story");
};

Template.profile.events({  
  'click .profile-grid-more' : function(e) {
    e.preventDefault();
    showGrid();
  }
});


Template.profile.helpers({
  'isOwner' : function() {
    return Meteor.userId() == Session.get("session_user");
  }
});