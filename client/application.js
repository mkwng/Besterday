/* ==========================================================================
   Client
   ========================================================================== */

Meteor.startup(function () {
  Session.set('pub_loaded', false); 
  Session.set('user_loaded', false); 

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
    $("#story").verticalCenter(true);
  })

});

Meteor.autorun(function() {
  // Whenever this session variable changes, run this function.
  var message = Session.get('displayMessage');
  if (message) {
    var stringArray = message.split('&amp;');
    // ui.notify(stringArray[0], stringArray[1])
    //   .effect('slide')
    //   .closable();
    alert(stringArray);

    Session.set('displayMessage', null);
  }
});

initialize = function() {
  // If no date, default date is yesterday.
  if(!Session.get("session_date")) Session.set("session_date",incrementDate(new Date(),-1));

  if(!Session.get("session_user")) {
    var id;
    // We have a screen name, but no user yet? This is from Router.
    if(sessionScreenName) id = getUserId(sessionScreenName);
    else if(Meteor.userId()) id = Meteor.userId();

    if(id) Session.set("session_user",id);
    else Meteor.Router.to('/');

    // return false;
  }

  console.log("initialize:",Session.get("session_user"),prettyDate(Session.get("session_date")));
  setDate(Session.get("session_user"),Session.get("session_date"));

  return true;

}




// Routing to the right page.
Meteor.Router.add({
  // Visiting the root page.
  '/': function() {
    // If logged in, set the session to current user.
    if (!(Meteor.userId()==null || Meteor.userId()===false)){
      Session.set("session_user",Meteor.userId());
      console.log("Router:",Session.get("session_user"),prettyDate(Session.get("session_date")));
      dateSetOnce = false;  // Why is this here?
      return 'journal';
    } else {
      return 'landing';
    }
  },

  '/welcome': 'landing',

  '/#': 'journal',

  '/404': function() {
    return 'landing'; 
  },

  '/404#': 'journal',

  '/youdonthaveausername': function() {
    return 'youdonthaveausername';
  },

  '/:user': function(user) {
    console.log("our parameters: ",user);
    sessionScreenName = user;
    return 'journal';
  },

  '/:user/:year/:month/:date': function(user,year,month,date) {
    var toDate = new Date(year,month-1,date);
    if(user=="null" || user==null || user===false) return 'landing';
    if(toDate > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) { // compare to 1 second before midnight
      toDate = incrementDate(new Date(),-1);
    }
    sessionScreenName = user; // We're not looking up userId yet, because data may not be published yet.
    Session.set("session_date",toDate);
    console.log("Router:",Session.get("session_user"),prettyDate(Session.get("session_date")));
    return 'journal';
  },
});


