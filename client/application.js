/* ==========================================================================
   Client
   ========================================================================== */

/*
  Session variables:
    session_user:   User whose stories we're requesting
    session_date:   The date of the story we're requesting
    session_story:  If a story exists for this date, its ID is here.
    show_sidebar:   Whether or not to show the sidebar
    pub_loaded:     Has public data loaded yet?
    user_loaded:    Has user data loaded yet?
*/

// Run this the first time the app is started.
Meteor.startup(function () {
  Session.set('pub_loaded', false); 
  Session.set('user_loaded', false); 

  // Whenever possible, make sure there's a session date and user set.
  Session.set("session_date",incrementDate(new Date(),-1));
  Session.set("session_user",Meteor.userId());

  // Any time any reactive data source changes, run this:
  Deps.autorun(function () {
    console.log("Deps.autorun...");
  });

  // Run this when the data is loaded.
  Meteor.subscribe('pub_data', function(){
    // Set the reactive session as true to indicate that the data have been loaded
    Session.set('pub_loaded', true); 
    Meteor.call("setDate",Session.get("session_user"),Session.get("session_date"));
  });
});


Meteor.subscribe('user_data', function(){
  // Set the reactive session as true to indicate that the data have been loaded
  Session.set('user_loaded', true); 
});



// Routing to the right page.
Meteor.Router.add({
  '/': function() {
    if (Meteor.userId()){
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
    console.log("our parameters: ",user,year,month,date);
    // Session.set('postId', id);
    return 'journal';
  }
});




