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
sessionId = "";

// Run this the first time the app is started.
Meteor.startup(function () {
  Session.set('pub_loaded', false); 
  Session.set('user_loaded', false); 

  // Whenever possible, make sure there's a session date and user set.
  if(!Session.get("session_date")) Session.set("session_date",incrementDate(new Date(),-1));
  if(!Session.get("session_user")) Session.set("session_user",Meteor.userId());


  // Run this when the data is loaded.
  Meteor.subscribe('pub_data', function(){
    // Set the reactive session as true to indicate that the data have been loaded
    Session.set('pub_loaded', true); 
    if(Session.get("session_user")) setDate(Session.get("session_user"),Session.get("session_date"));
  });
});


Meteor.subscribe('user_data', function(){
  // Set the reactive session as true to indicate that the data have been loaded
  Session.set('user_loaded', true); 
});



Meteor.Router.beforeRouting = function() {
  // console.log("hello");
}
// Routing to the right page.
Meteor.Router.add({
  '/': function() {

    if (!(Meteor.userId()==null || Meteor.userId()===false)){
      Session.set("session_user",Meteor.userId());
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
    if(user=="null" || user==null || user===false) 
      {
        return 'landing';
      } else {
        Session.set("session_user",user);
        Session.set("session_date",new Date(year,month-1,date));
        return 'journal';
      }
  },
  // { to: 'journal', and: function(user,year,month,date) {
  //   // console.log("our parameters: ",user,year,month,date);
  //   if (user=="null" || user==null || user===false) {
  //     console.log("No user set");
  //     Meteor.Router.to("/");
  //   }
  //   else {
  //     console.log("User:",user);
  //     Session.set("session_date",new Date(year,month-1,date));
  //   }
  // }},
  '/404': 'landing'
});




