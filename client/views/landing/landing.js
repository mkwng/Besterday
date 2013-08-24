/* ==========================================================================
   TEMPLATE: Landing
   ========================================================================== */
// Tasks when Landing is created.



// Tasks when Landing is rendered.
Template.landing.rendered = function() {
  if(typeof runGaq == "function") $.throttle(250, runGaq);
}


// Tasks when Landing is destroyed.



// Events
Template.landing.events({
  'click button.landing-hero-main-cta' : function(e) {
    Session.set("status_signup",true);
  }
});
// Helpers
Template.landing.helpers({

});

