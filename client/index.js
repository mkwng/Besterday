
/* ==========================================================================
   TEMPLATE: Page
   ========================================================================== */
// Tasks when Page is created.



// Tasks when Page is rendered.



// Tasks when Page is destroyed.



// Events
// Helpers
Template.page.loading = function() {
  return Session.get("loading");
}
Template.page.create = function() {
  return Session.get("status_signup");
}


Template.page.loggedIn = function () {
  return Meteor.userId();
}



/* ==========================================================================
   TEMPLATE: loginForm
   ========================================================================== */

  Template.loginForm.events({

    'submit #login-form' : function(e, t){
      e.preventDefault();
      // retrieve the input field values
      var username = t.find('#login-username').value
        , password = t.find('#login-password').value;

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
      },
      'submit #account-form' : function(e, t) {
      e.preventDefault();
      var email = t.find('#account-email').value
        , password = t.find('#account-password').value
        , username = t.find('#account-username').value;

        // Trim and validate the input
        var email = trimInput(email);
        if (isValidPassword(password)) {
          // alert("Account creation is temporarily disabled");
          // Then use the Meteor.createUser() function
          Accounts.createUser({username: username, email: email, password : password}, function(err){
            if (err) {
              createModal("Something went wrong.",err,{close:"Ok"})
            } else {
              // Success. Account has been created and the user
              // has logged in successfully. 
              createModal("Welcome!","Let's create your first Besterday.",{close:"Ok"})
              setTimeout(function() {Meteor.Router.to("/story/yesterday")},500)
            }
          });
        }


      return false;
    }
  });

  // trim helper
  var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

var isValidPassword = function(val, field) {
    if (val.length >= 6) {
      return true;
    } else {
      Session.set('displayMessage', 'Error &amp; Too short.')
      return false; 
    }
  }
