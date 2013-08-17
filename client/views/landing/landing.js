/* ==========================================================================
   TEMPLATE: Landing
   ========================================================================== */
// Tasks when Landing is created.



// Tasks when Landing is rendered.
Template.landing.rendered = function() {

}


// Tasks when Landing is destroyed.



// Events
Template.landing.events({
  'click a.landing-hero-main-cta' : function(e) {
    e.preventDefault();
    $(".mailchimp").slideDown();
  }
});
// Helpers

