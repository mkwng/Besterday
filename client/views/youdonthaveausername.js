
Template.youdonthaveausername.helpers({
  loggedIn : function() {
    return Meteor.userId();
  }
});

Template.youdonthaveausername.events({
  'submit #youdonthaveausername' : function(e,t) {
      e.preventDefault();
      // retrieve the input field values
      var username = t.find('#login-username').value;
      if(uniqueScreenName(username)){
        Meteor.call("profileScreenName",username, function() {
          Meteor.Router.to("/");
        });
      } else {
        alert("This screen name is already in use. Pick another.");
      }
  }
});
