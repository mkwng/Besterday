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
    if(typeof Session == "undefined" || typeof user == "undefined" || typeof date == "undefined") {
      Meteor.Error(500,"Hold your horses! You got undefined vars. User: "+user+"; Date: "+date);
      return false;
    }
    // Insert check to see if date is in a valid range.
    Session.set("session_date", date);
    Session.set("session_user", user);

    var story = findStory(user,date);

    makeBackground(story.img);

    sessionId = story._id;
    $("#story").css({opacity:0}).val(story.text);
    setTimeout(function() {
      $("#story").verticalCenter(true);
    },0);
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