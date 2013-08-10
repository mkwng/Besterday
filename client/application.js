/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  // Session.set("loading", true);
  pageViews = 0;
  Session.set('status_userdata', false); 
  Session.set('status_storydata', false); 

  Session.set("pref_gridcount", 10);

  // This isn't immediately intuitive, but essentially, run initialize() only when both data sources return.
  Meteor.subscribe('stories', function(){
    Session.set('status_storydata', true); 
    if(Session.get('status_userdata')) initialize();
  });
  Meteor.subscribe('users', function(){
    Session.set('status_userdata', true); 
    if(Session.get('status_storydata')) initialize();
  });

  // application_ui();

});



Meteor.autorun(function() {
});

initialize = function() {
  var tempDate,tempUser;
  // We're entering with just the story id?
  if(!!sessionId) {
    story = Stories.findOne(sessionId);
    tempDate = discreteDate(story);
    tempUser = story.owner;
  }

  // If no date, default date is yesterday.
  if(!Session.get("session_date")) tempDate = discreteDate(incrementDate(new Date(),-1));
  else tempDate = Session.get("session_date")

  // Still no session user set?
  if(!Session.get("session_user")) {
    var id;
    // We have a screen name, but no user yet? This is from Router.
    if(sessionScreenName) id = getUserId(sessionScreenName);
    else if(Meteor.userId()) id = Meteor.userId();

    // Still no user. Must not be logged in. Re-route to home.
    if(id) tempUser = id;
    else {
      console.warn("This should not have happened.");
      Meteor.Router.to('/');
    }
  } else tempUser = Session.get("session_user");

  setDate(tempUser,tempDate);


  if(Meteor.userId() && Meteor.userId() == Session.get("session_user") && !Session.get("override")){
    if(typeof story=="undefined") 
      Meteor.Router.to('/story/yesterday');
    else if(!story.hasOwnProperty("text")) 
      Meteor.Router.to('/story/yesterday');
    else if(story.text == "") 
      Meteor.Router.to('/story/yesterday');
  }

  return true;

}

Meteor.Router.beforeRouting = function() {
  Session.set("edit",false);
  // initialize();
}


// Routing to the right page.
Meteor.Router.add({
  // Visiting the root page.
  '/': function() {
    // If logged in, set the session to current user.
    if (!(Meteor.userId()==null || Meteor.userId()===false)){
      Session.set("session_user",Meteor.userId());
      return 'profile';
    } else {
      return 'landing';
    }
  },

  '/404': 'landing',

  '/user/:user': function(user) {
    Session.set("expanded_story",false);
    $(".story").showStory();
    sessionScreenName = user;
    return 'profile';
  },
  '/story/yesterday':function() {
    Session.set("expanded_story",true);
    Session.set("edit",true);
    return 'storytime';
  },
  '/story/:storyId/edit': function(storyId) {
    sessionId = storyId;
    Session.set("expanded_story",true);
    Session.set("edit",true);
    if(Meteor.Router.page()=='profile')
      return 'profile';
    else 
      return 'storytime';
  },
  '/story/:storyId': function(storyId) {
    sessionId = storyId;
    Session.set("expanded_story",true);
    if(Meteor.Router.page()=='profile')
      return 'profile';
    else 
      return 'storytime';
  },

  '/youdonthaveausername': function() {
    return 'youdonthaveausername';
  }


});



application_ui = function() {
  $(window).resize($.throttle( 250, resizeHousekeeping ) )
}


