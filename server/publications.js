/* ==========================================================================
   Publishing
   ========================================================================== */

// Publish all public stories.



Meteor.startup(function ()  {
  publish();
});

publish = function() {
  Meteor.publish('stories', function(){
    return Stories.find({$or: [{owner: this.userId},{public:true}]});
  });
  Meteor.publish("users", function () {
    userData = Meteor.users.find({},
                             {fields: {'_id': 1, 'username': 1, 'services': 1, 'createdAt': 1, 'profile': 1}});
    return userData;
  });
}

Meteor.methods({
  publish : function() {
    publish();
  }
});

// Upon user login, publish all stories that belong to the user.