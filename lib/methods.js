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


setDate = function(user,date) {
  if(typeof Session == "undefined" || typeof user == "undefined" || typeof date == "undefined") {
    // Meteor.Error(500,"Hold your horses! You got undefined vars.");
    return false;
  }

  // Date is outside valid range...) 
  if(date > floorDate(new Date())) return 0;

  Session.set("session_date", date);
  Session.set("session_user", user);

  var story = findStory(user,date);

  makeBackground(story.img);

  sessionId = story._id;
  $("#story").cssPersist("opacity",0).val(story.text);
  newDate = true;
  setTimeout(function() {
    $("#story").verticalCenter(true);
  },0);
  return sessionId;
}