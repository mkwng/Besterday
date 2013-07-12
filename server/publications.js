/* ==========================================================================
   Publishing
   ========================================================================== */

// Publish all public stories.



Meteor.startup(function ()  {
  publish();
});

publish = function() {
  Meteor.publish('pub_data', function(){
    console.log("publishing pub_data...");
    // console.log( );
    return Stories.find({$or: [{owner: this.userId},{public:true}]});
  });
  Meteor.publish("user_data", function () {
    console.log("publishing user_data...");
    userData = Meteor.users.find({},
                             {fields: {'_id': 1, 'username': 1, 'services': 1, 'createdAt': 1}});
    return userData;
  });
}

Meteor.methods({
  publish : function() {
    publish();
  }
});

// Upon user login, publish all stories that belong to the user.