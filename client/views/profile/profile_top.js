
Template.profile_top.helpers({
  displayName : function() {
    return getDisplayName(Session.get("session_user"));
  }
});
