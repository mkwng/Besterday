// Methods
Meteor.methods({
  createStory: function(options) {
    // Insert data validation here.
    var story = Stories.insert(
      {
        owner: this.userId,
        date: options.date,
        created: new Date().getTime(),
        text: options.text,
        img: options.img,
        public: options.public
      }
    );
    return story;
  },
  setDate: function(user,date) {
    // Insert check to see if date is in a valid range.
    Session.set("session_date", date);
    Session.set("session_user", user);

    var story = findStory(user,date);

    // makeBackground(story.img);
    Session.set("session_story", story._id);
    $("#story").val(story.text);
  },
  updateText: function(story,text) {
    // Insert data validation here.
    Stories.update(
      { _id: story},
      {
        $set: {
          text: text
        }
      }
    );
  },
  updateImg: function(story,img) {
    // Insert data validation here.
    Stories.update(
      { _id: story},
      {
        $set: {
          img: img
        }
      }
    );
  }
});