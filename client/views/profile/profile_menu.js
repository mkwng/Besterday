Template.profile_menu.created = function() {}


Template.profile_menu.rendered = function() {}


Template.profile_menu.destroyed = function() {}


Template.profile_menu.events({
  'click .profile-menu-option-logout' : function(e) {
    e.preventDefault();
    Meteor.logout(function(e) {
      if(e) alert(e);
      else {
        sessionId = "";
        sessionScreenname = "";
        user = "";
        story = "";
      }
    });
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
    var error = "";
    var status = "";
    e.preventDefault();

    var email = $('#email').val();
    var displayName = $('#displayName').val();

    var pass = $('#password').val();
    var newPass = $('#password-new').val();
    var conPass = $('#password-confirm').val();
    if (!!pass){
      if(newPass != conPass)
        error+="Your password must match. \n";
      else if(!validatePassword(newPass))
        error+="Your password must be at least 6 characters long \n";
    }

    // There was an error
    if(!!error) {
      createModal("Sorry, there were some errors:",error,{close:"Ok"});
    }
    // Time to actually do stuff.
    else {
      if(!!pass) Accounts.changePassword(pass, newPass, function(e) {
        if(e) alert(e);
      });
      Meteor.call("profileUpdate",{displayName:displayName,email:email});
      createModal("Your account has been updated",status,{close:"Ok"});
      Session.set("edit_account",false);
    }
  },
  'click .icon-menu' : function(e) {
    e.preventDefault();
    $(".profile-menu").toggleClass("active");
  },
  'click .profile-menu-edit-delete a' : function(e) {
    e.preventDefault();
    createModal("Are you sure?","We'll miss you.", {home:"Yes, delete me",close:"Wait, no keep me"})
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
  screenName : function() {
    return getScreenName(Meteor.userId());
  },
  email : function() {
    return Meteor.user().emails[0].address;
  }
});
