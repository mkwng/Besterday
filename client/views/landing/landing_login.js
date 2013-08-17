Template.login.events({
  'submit .login' : function(e, t){
    e.preventDefault();
    // retrieve the input field values
    var username = t.find('#username').value
      , password = t.find('#password').value;

      // Trim and validate your fields here.... 
      // var email = trimInput(email);

      // If validation passes, supply the appropriate fields to the
      // Meteor.loginWithPassword() function.
      Meteor.loginWithPassword(username, password, function(err){
        if (err)
          createModal("Something went wrong.",err,{close:"Ok"})
        else
          // alert("login");
          dateSetOnce = false;
          Meteor.Router.to("/");
      });
       return false; 
    }
});