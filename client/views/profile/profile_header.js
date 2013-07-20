Template.profile_header.created = function() {}


Template.profile_header.rendered = function() {}


Template.profile_header.destroyed = function() {}


Template.profile_header.events({});


Template.profile_header.helpers({
  profileImage : function() {
    return '/img/profile.png';
  },
  displayName : function() {
    return 'Michael Wang';
  },
  memberSince : function() {
    return 'June 2013';
  }
});
