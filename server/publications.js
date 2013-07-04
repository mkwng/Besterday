/* ==========================================================================
   Publishing
   ========================================================================== */

// Publish all public stories.



Meteor.startup(function () {
  Meteor.publish('pub_data', function(){
    return Stories.find({});
  });
});


// Upon user login, publish all stories that belong to the user.