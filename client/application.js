/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  Session.set('pub_loaded', false); 
  Session.set('user_loaded', false); 
  Session.set("grid_count", 10);

  // This isn't immediately intuitive, but essentially, run initialize() only when both data sources return.
  Meteor.subscribe('pub_data', function(){
    Session.set('pub_loaded', true); 
    if(Session.get('user_loaded')) initialize();
  });
  Meteor.subscribe('user_data', function(){
    Session.set('user_loaded', true); 
    if(Session.get('pub_loaded')) initialize();
  });

  $(window).resize(function() {
    $("#story").cssPersist("width","100%").verticalCenter(true);
    setTimeout(function(){
      $("#story").cssPersist("width","+="+getScrollBarWidth());
    },0);


    $(".profile-grid-inner").widthDivByFour();
    $(".profile-grid-stories.img").imgCover();

  })

});

Meteor.autorun(function() {
  console.log("Hello autorun!");
});

initialize = function() {
  // We're entering with just the story id?
  if(!!sessionId) {
    story = Stories.findOne(sessionId);
    Session.set("session_date",discreteDate(story));
    Session.set("session_user",story.owner);
  }

  // If no date, default date is yesterday.
  if(!Session.get("session_date")) Session.set("session_date",discreteDate(incrementDate(new Date(),-1)));

  // Still no session user set?
  if(!Session.get("session_user")) {
    var id;
    // We have a screen name, but no user yet? This is from Router.
    if(sessionScreenName) id = getUserId(sessionScreenName);
    else if(Meteor.userId()) id = Meteor.userId();

    // Still no user. Must not be logged in. Re-route to home.
    if(id) Session.set("session_user",id);
    else {
      console.warn("This should not have happened.");
      Meteor.Router.to('/');
    }
  }


  console.log("initialize:",Session.get("session_user"),prettyDate(objectifyDate(Session.get("session_date"))));
  setDate(Session.get("session_user"),Session.get("session_date"));


  // We don't have a story for today yet:
  if((Meteor.userId() && !!!story && Meteor.Router.page() != "landing") | (Meteor.userId() == Session.get("session_user") && Meteor.Router.page() != "landing"))  { 
    story = Stories.findOne({owner:Meteor.userId(),discreteDate:Session.get("session_date")});
    if (story==undefined)
      Meteor.Router.to('/story/today');
  }

  return true;

}

Meteor.Router.beforeRouting = function() {
  Session.set("edit",false);
  Session.set("grid_count", 10);
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
    sessionScreenName = user;
    return 'profile';
  },
  '/story/today':function() {
    Session.set("edit",true);
    return 'journal';
  },
  '/story/:storyId': function(storyId) {
    sessionId = storyId;
    return 'journal';
  },

  '/youdonthaveausername': function() {
    return 'youdonthaveausername';
  }


});


