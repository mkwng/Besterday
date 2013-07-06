/* ==========================================================================
   Publishing
   ========================================================================== */

// Publish all public stories.



Meteor.startup(function () {
  Meteor.publish('pub_data', function(){
    console.log("publishing pub_data...");
    return Stories.find({});
  });
  Meteor.publish("user_data", function () {
    console.log("publishing user_data...");
    userData = Meteor.users.find({},
                             {fields: {'_id': 1, 'screenName': 1, 'services': 1, 'createdAt': 1}});
    return userData;
  });
});


// Upon user login, publish all stories that belong to the user.