/* ==========================================================================
   Client
   ========================================================================== */

/*
  Session variables:
    session_user:   User whose stories we're requesting
    session_date:   The date of the story we're requesting
    show_sidebar:   Whether or not to show the sidebar
    pub_loaded:     Has public data loaded yet?
    user_loaded:    Has user data loaded yet?
*/

// Why is this here?
sessionId = undefined;
sessionScreenName = undefined;

// Run this the first time the app is started.
Meteor.startup(function () {
  Session.set('pub_loaded', false); 
  Session.set('user_loaded', false); 

  // Run this when the data is loaded.
  Meteor.subscribe('pub_data', function(){
    // Set the reactive session as true to indicate that the data have been loaded
    Session.set('pub_loaded', true); 
    if(Session.get('user_loaded')) initialize();
  });

  Meteor.subscribe('user_data', function(){
    // Set the reactive session as true to indicate that the data have been loaded
    Session.set('user_loaded', true); 
    if(Session.get('pub_loaded')) initialize();
  });

});

initialize = function() {
  if(!Session.get("session_date")) Session.set("session_date",incrementDate(new Date(),-1));

  if(!Session.get("session_user") && sessionScreenName) Session.set("session_user",getUserId(sessionScreenName));
  else if(!Session.get("session_user")) Session.set("session_user",Meteor.userId());

  console.log("initialize:",Session.get("session_user"),prettyDate(Session.get("session_date")));
  setDate(Session.get("session_user"),Session.get("session_date"));
}




Meteor.Router.beforeRouting = function() {
  // makeBackground();
}
// Routing to the right page.
Meteor.Router.add({
  '/': function() {

    if (!(Meteor.userId()==null || Meteor.userId()===false)){
      Session.set("session_user",Meteor.userId());
      console.log("Router:",Session.get("session_user"),prettyDate(Session.get("session_date")));
      dateSetOnce = false;
      return 'journal';
    } else {
      return 'landing';
    }
  },

  '/welcome': 'landing',

  '/:user': function(user) {
    console.log("our parameters: ",user);
    // Session.set('postId', id);
    return 'journal';
  },

  '/:user/:year/:month/:date': function(user,year,month,date) {
    var toDate = new Date(year,month-1,date);
    if(user=="null" || user==null || user===false) 
      {
        return 'landing';
      } else if(toDate > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) { // compare to 1 second before midnight
        toDate = incrementDate(new Date(),-1);
      }
      sessionScreenName = user;
      Session.set("session_date",toDate);
      console.log("Router:",Session.get("session_user"),prettyDate(Session.get("session_date")));
      return 'journal';
  },
  '/404': 'landing'
});


