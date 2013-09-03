Template.signup.events({
  'keyup #username' : function(e, t) {
    $("input#display").val($('#username')[0].value);
  },
  'submit #signup' : function(e, t) {
  e.preventDefault();
  var email = $('#email')[0].value
    , password = t.find('#password').value
    , username = t.find('#username').value
    , displayname = t.find("#display").value;

    // Trim and validate the input
    var email = trimInput(email);
    if (isValidPassword(password)) {
      // alert("Account creation is temporarily disabled");
      // Then use the Meteor.createUser() function
      Accounts.createUser({username: username, email: email, password : password, profile : {"displayName":displayname}}, function(err){
        if (err) {
          createModal("Something went wrong.",err,{close:"Ok"})
        } else {
          // Success. Account has been created and the user
          // has logged in successfully. 
          setDate(Meteor.userId(),discreteDate(incrementDate(new Date(),-1)));
          updateStats(Meteor.userId());
          Session.set("status_signup",false);
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
