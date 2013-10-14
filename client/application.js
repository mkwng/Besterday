/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  // Session.set("loading", true);
  pageViews = 0;
  Session.set('status_userdata', false); 
  Session.set('status_storydata', false); 

  Session.set("pref_gridcount", 8);

  // This isn't immediately intuitive, but essentially, run initialize() only when both data sources return.
  Meteor.subscribe('stories', function(){
    Session.set('status_storydata', true); 
    if(Session.get('status_userdata')) initialize();
  });
  Meteor.subscribe('users', function(){
    Session.set('status_userdata', true); 
    if(Session.get('status_storydata')) initialize();
  });

  application_ui();

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
  if(!!!tempDate) {
    if(!Session.get("session_date")) tempDate = discreteDate(incrementDate(new Date(),-1));
    else tempDate = Session.get("session_date")    
  }

  // Still no session user set?
  if(!!!tempUser) {
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
  }

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

gaqTimeout = setTimeout(function() {},0);
Meteor.Router.beforeRouting = function() {
  Session.set("edit",false);
  clearTimeout(gaqTimeout);
  gaqTimeout = setTimeout(function() {
    runGaq();
  },500);
  // initialize();
}


// Routing to the right page.
Meteor.Router.add({
  // Visiting the root page.
  '/': function() {
    document.title = "Besterday";
    Session.set("expanded_story",false);
    // If logged in, set the session to current user.
    if (!(Meteor.userId()==null || Meteor.userId()===false)){
      setDate(Meteor.userId(),discreteDate(incrementDate(new Date(),-1)));
      return 'profile';
    } else {
      return 'landing';
    }
  },

  '/404': 'landing',

  '/user/:user': function(user) {
    document.title = "Besterday - "+user+"'s Profile";
    Session.set("expanded_story",false);
    sessionScreenName = user;
    return 'profile';
  },
  '/story/yesterday':function() {
    document.title = "Besterday - Yesterday";
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
    document.title = "Besterday - Story";
    sessionId = storyId;
    Session.set("expanded_story",true);
    if(Meteor.Router.page()=='profile')
      return 'profile';
    else 
      return 'storytime';
  },

  '/youdonthaveausername': function() {
    document.title = "Please select a username.";
    return 'youdonthaveausername';
  }


});


winHeight = $(window).height();
winTop = 0;
application_ui = function() {
  $(window).resize(function() {
    winHeight = $(window).height(); 
  });
  $(window).scroll(function() {
    winTop = $(window).scrollTop();
  });
  $(window).resize( $.throttle( 250, resizeHousekeeping ) );
  $(window).scroll( $.throttle( 250, gridScrollCheck ) );
}


