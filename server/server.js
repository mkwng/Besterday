// Seed the movie database with a few movies
Meteor.startup(function () {
  Meteor.publish('default_db_data', function(){
    return Stories.find({});
  });
});

  // Stories.update(
  //   {"owner" : undefined},
  //   {
  //     $set: {
  //       "owner": "sEF9vKF7e5qdCPRWh"
  //     }
  //   }
  // );

