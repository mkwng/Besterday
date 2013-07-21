Template.profile_header.created = function() {}


Template.profile_header.rendered = function() {}


Template.profile_header.destroyed = function() {}


Template.profile_header.events({});


Template.profile_header.helpers({
  profileImage : function() {
    var img = '/img/profile.png';
    // img = Meteor.user().profileImage
    return img;
  },
  displayName : function() {
    return getDisplayName(Session.get("session_user"));
  },
  memberSince : function() {
    date = incrementDate(new Date(),-1);
    if(Session.get("user_loaded")) {
      var user = Meteor.users.findOne(Session.get("session_user"));
      if(!!user && user.hasOwnProperty("createdAt"))
        date = new Date(user.createdAt);
    }
    return monthNames[date.getMonth()]+" "+date.getFullYear();
  }
});
