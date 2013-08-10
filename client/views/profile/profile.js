/* ==========================================================================
   TEMPLATE: Shared
   ========================================================================== */
Template.profile.created = function() {}


Template.profile.rendered = function() {
  $(".profile-grid-inner").widthDivisible();
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