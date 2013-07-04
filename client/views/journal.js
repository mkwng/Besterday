
/* ==========================================================================
   TEMPLATE: Journal
   ========================================================================== */
// Tasks when Journal is created.
Template.journal.created = function() {
  Meteor.defer(function() {
    $dummy = $(".dummy");
  })
}


// Tasks when Journal is rendered.
Template.journal.rendered = function() {
  if( !$dummy.closest("body").length ) $dummy = $(".dummy");
}


// Tasks when Journal is destroyed.
Template.journal.destroyed = function() {
    $dummy = null;
}


// Bind to Stories collection.
Template.journal.story = function() {
  return findStory(Meteor.userId(),Session.get("session_date"));
}

// Events
// Helpers
Template.journal.helpers({
  'owner' : function() {
    if(Meteor.userId() == Session.get("session_user")) return true;
    else return false;
  }
});

/* ==========================================================================
   TEMPLATE: Story
   ========================================================================== */
// Tasks when Story is created.
Template.story.created = function() {}


// Tasks when Story is rendered.
Template.story.rendered = function() {}


// Tasks when Story is destroyed.
Template.story.destroyed = function() {}


Template.story.events({
  'keyup #story' : function(e) {
    // Hack to maintain the style
    var css = $("#story").attr("style");

    if(Session.get("session_story")) {
      Meteor.call("updateText",Session.get("session_story"),document.getElementById('story').value);
    } else {
      Meteor.call("createStory",{
        owner: Meteor.userId(),
        date: Session.get("session_date"),
        created: new Date().getTime(),
        text: document.getElementById('story').value,
        public: false
      }, function(e,r) {
        Session.set("session_story",r);
      });
    }

      setTimeout(function() {$("#story").attr("style",css).verticalCenter(true);},0);
  }
});


// Events
// Helpers


/* ==========================================================================
   TEMPLATE: Post Controls
   ========================================================================== */
// Tasks when Story is created.
Template.postControls.created = function() {}


// Tasks when Story is rendered.
Template.postControls.rendered = function() {}


// Tasks when Story is destroyed.
Template.postControls.destroyed = function() {}


Template.postControls.events({});

// Events
// Helpers