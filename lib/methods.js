// Methods
Meteor.methods({
  createStory: function(options) {
    // Insert data validation here.
    var story = Stories.insert(
      {
        owner: this.userId,
        date: options.date,
        created: new Date().getTime(),
        discreteDate: options.discreteDate,
        text: options.text,
        img: options.img,
        public: options.public
      }
    );
    return story;
  },
  updateText: function(story,text) {
    // Insert data validation here.
    if(Stories.findOne({_id: story}).owner != Meteor.userId()) {
      console.warn("Not allowed.");
      return false;
    }
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
    if(Stories.findOne({_id: story}).owner != Meteor.userId()) {
      console.warn("Not allowed.");
      return false;
    }
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
    if(Stories.findOne({_id: story}).owner != Meteor.userId()) {
      console.warn("Not allowed.");
      return false;
    }
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
      {$set:{"username":screenName}}
    );
  },
  updateDiscreteDate: function(story,ddate) {
    Stories.update(
      { _id: story},
      {
        $set: {
          discreteDate: ddate
        }
      }
    );
  },
  profileUpdate: function(options){
    options.displayName = !!options.displayName ? options.displayName : Meteor.user().profile.displayName;
    options.email = !!options.email ? options.email : Meteor.user().emails[0].address;
    Meteor.users.update(
      {_id:this.userId},
      {$set:{
        "profile.displayName":options.displayName,
        "emails":[{address:options.email,verified:false}]
      }}
    );
  }
});

// setDate is the only canonical way to change the date. All other ways are false idols.
setDate = function(user,date,route) {

  if(typeof route == "undefined") route=false;

  // console.log("setDate:",user,prettyDate(objectifyDate(date)));

  if(typeof Session == "undefined" || typeof user == "undefined" || (user==null || user===false) || typeof date == "undefined") {
    // Meteor.Error(500,"Hold your horses! You got undefined vars.");
    if(!Session.get("session_user") && sessionScreenName) {}
    else {
      console.log("Hold your horses! You got undefined vars.");
      // debugger;
    }
    return false;
  }

  // Date is outside valid range...) 
  if(objectifyDate(date) > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) {
    return false;
  }

  if(date.getMonth) {
    console.warn("Legacy date format fed in.");
    discreteDate(date);
  }

  // Update status variables
  dateSetOnce = true; // setDate has been run at least once.
  newDate = true; // I think I can delete this, but I'm not 100% sure.

  Session.set("session_date", date);
  Session.set("session_user", user);

  story = findStory(user,date);

  // Assign session variables
  sessionScreenName = getScreenName(user);
  if (sessionScreenName == undefined) return false;
  sessionId = story._id;

  // Actually do stuff
  if (route) {
    if(story.hasOwnProperty("text")&&!!story.text)
      Meteor.Router.to('/story/'+sessionId);
  }

  // // Visual updates and bug fixes
  // $("#story").cssPersist("opacity",0).val(story.text).scrollTop(0);
  // setTimeout(function() {
  //   $("#story").verticalCenter(true);
  // },0);

  return sessionId;
}

