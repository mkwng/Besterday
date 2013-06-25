///////////////////////////////////////////////////////////////////////////////
// Stories

/*
  Each story is represented by a document in the Stories collection:
    owner: user id
    date: date object
    text,img: String
    public: Boolean
*/
// Declare client Movies collection
Stories = new Meteor.Collection("stories");

// Stories.allow({
//   insert: function (userId, story) {
//     return false; // no cowboy inserts -- use createStory method
//   },
//   update: function (userId, story, fields, modifier) {
//     if (userId !== story.owner)
//       return false; // not the owner

//     var allowed = ["text", "img"];
//     if (_.difference(fields, allowed).length)
//       return false; // tried to write to forbidden field

//     // A good improvement would be to validate the type of the new
//     // value of the field (and if a string, the length.) In the
//     // future Meteor will have a schema system to makes that easier.
//     return true;
//   },
//   remove: function (userId, story) {
//     // You can only remove stories that you created.
//     return story.owner === userId;
//   }
// });


var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

Meteor.methods({
  // options should include: title, description, x, y, public
  createStory: function (options) {
  //   check(options, {
  //     text: NonEmptyString,
  //     public: Match.Optional(Boolean)
  //   });

  //   // if (options.title.length > 100)
  //   //   throw new Meteor.Error(413, "Title too long");
  //   // if (options.description.length > 1000)
  //   //   throw new Meteor.Error(413, "Description too long");
  //   if (! this.userId)
  //     throw new Meteor.Error(403, "You must be logged in");

    return Stories.insert({
      // owner: this.userId,
      date: options.date,
      text: options.text,
      img: options.img,
      public: !! options.public,
    });
  }
});




///////////////////////////////////////////////////////////////////////////////
// Users

displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};

