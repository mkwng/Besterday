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
  },
  updatePublic: function(story,public) {
    Stories.update(
      { _id: story},
      {
        $set: {
          public: public
        }
      }
    );
  },
  profileScreenName: function(screenName) {
    Meteor.users.update(
      {_id:this.userId},
      {$set:{"screenName":screenName}}
    );
  }
});

// setDate is the only canonical way to change the date. All other ways are false idols.
setDate = function(user,date) {

  console.log("setDate:",user,prettyDate(date));

  if(typeof Session == "undefined" || typeof user == "undefined" || (user==null || user===false) || typeof date == "undefined") {
    // Meteor.Error(500,"Hold your horses! You got undefined vars.");
    if(!Session.get("session_user") && sessionScreenName) {}
    else {
      console.log("Hold your horses! You got undefined vars.");
    }
    return false;
  }
  // console.log(prettyDate(date),prettyDate(incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) )));
  // console.log(date > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) )
  // Date is outside valid range...) 
  if(date > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) {
    return false;
  }


  dateSetOnce = true; // setDate has been run at least once.

  Session.set("session_date", date);
  Session.set("session_user", user);

  var story = findStory(user,date);

  makeBackground(story.img);

  sessionScreenName = getScreenName(user);
  if (sessionScreenName == undefined) return false;
  sessionId = story._id;
  $("#story").cssPersist("opacity",0).val(story.text).scrollTop(0);
  newDate = true;
  setTimeout(function() {
    $("#story").verticalCenter(true);
  },0);

  Meteor.Router.to('/'+sessionScreenName+'/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());

  return sessionId;
}

