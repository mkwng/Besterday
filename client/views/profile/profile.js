/* ==========================================================================
   TEMPLATE: Shared
   ========================================================================== */
Template.profile.created = function() {}


Template.profile.rendered = function() {}


Template.profile.destroyed = function() {}

Template.profile.expandedStory = function() {
  return Session.get("expanded_story");
};

Template.profile.events({});


Template.profile.helpers({
});