Template.profile_menu.created = function() {}


Template.profile_menu.rendered = function() {}


Template.profile_menu.destroyed = function() {}


Template.profile_menu.events({
  'click .profile-menu-option-logout' : function(e) {
    e.preventDefault();
    Meteor.logout();
    createModal("Good bye!","Have the best day ever.",{close:"I will"});
    setTimeout(function() {Meteor.Router.to("/")},500)
  },
  'click .profile-menu-option-export' : function(e) {
    e.preventDefault();
    createModal("Coming soon.","Hang tight while we work on this.",{close:"Ok"});
  },
  'click .profile-menu-option-edit' : function(e) {
    e.preventDefault();
    Session.set("edit_account",true);
  },
  'click .profile-menu-edit-done' : function(e) {
    e.preventDefault();
    var pass = $('#account-password').value;
    // if()
    Session.set("edit_account",false);
  },
  'click .icon-menu' : function(e) {
    e.preventDefault();
    $(".profile-menu").toggleClass("active");
  }
});


Template.profile_menu.helpers({
  'editAccount' : function() {
    return Session.get("edit_account");
  },
  profileImage : function() {
    var img = '/img/profile.png';
    // img = Meteor.user().profileImage
    return img;
  },
  displayName : function() {
    return getDisplayName(Meteor.userId());
  },
});
