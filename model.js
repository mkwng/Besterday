
/* ==========================================================================
   Model
   ========================================================================== */

Stories = new Meteor.Collection("stories");

Meteor.methods({
  createStory: function (options) {
    return Stories.insert({
      owner: this.userId,
      date: options.date,
      text: options.text,
      public: options.public
    });
  }
});
