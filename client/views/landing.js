/* ==========================================================================
   TEMPLATE: Landing
   ========================================================================== */
// Tasks when Landing is created.



// Tasks when Landing is rendered.
Template.landing.rendered = function() {
  // makeBackground();
  $window = $(window);
  $window.scroll(function(e) {
    if($window.scrollTop() > 300) $(".landing-hero-example").addClass("active");
    else $(".landing-hero-example").removeClass("active");
  });
}


// Tasks when Landing is destroyed.



// Events
Template.landing.events({

  'click a.cta' : function() {
    $(".landing-hero p").css("left","-100%");
    $("#login").css("left","0");
  }
});
// Helpers

