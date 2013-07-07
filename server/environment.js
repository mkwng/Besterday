
// Create behavior.
Accounts.onCreateUser(function(options, user) {
  var i=0;
  function autoVerifyScreenName(screenName) {
    if(Meteor.users.find({"screenName":screenName}).fetch().length){
          console.log("There's already a",screenName);
          screenName = screenName+i;
          return autoVerifyScreenName(screenName);
        }
    else return screenName;
  }
  // We still want the default hook's 'profile' behavior.
  screenName="";
  if (options.profile)
    user.profile = options.profile;
  if (user.services.hasOwnProperty("twitter")) {
    screenName = user.services.twitter.screenName;
  } else if (user.services.hasOwnProperty("facebook")) {
    screenName = user.services.facebook.username;
  }

  user.screenName = autoVerifyScreenName(screenName);

  return user;
});