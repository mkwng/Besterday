
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
Template.journal.events({

  'click .media-image' : function (e) {
    e.preventDefault();

    // Need to provide better way of deleting picture...
    if ($(e.target).hasClass("attached") && confirm("Remove picture?")) {
      $(e.target).removeClass("attached");
      // Remove the current picture.
      makeBackground();

      Meteor.call("updateImg",sessionId,"")

    } 

    filepicker.pick({
      mimetypes: ['image/*', 'text/plain'],
      container: 'modal',
      services:['COMPUTER', 'URL', 'FACEBOOK', 'INSTAGRAM', 'FLICKR', 
      'PICASA', 'DROPBOX', 'GMAIL'],
      },
      function(FPFile){
        image = JSON.stringify(FPFile);
        makeBackground(image);

        if(sessionId) {
          Meteor.call("updateImg",sessionId,image);
        } else {
          Meteor.call("createStory",{
            owner: Meteor.userId(),
            date: Session.get("session_date"),
            created: new Date().getTime(),
            text: document.getElementById('story').value,
            img: image,
            public: false
          }, function(e,r) {
            sessionId = r;
          });
        }
      },
      function(FPError){
        console.log(FPError.toString());
        $(e.target).addClass("error");
      }
    );

  }  
});
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
Template.story.rendered = function() {
  Meteor.defer(function() {
  });
}


// Tasks when Story is destroyed.
Template.story.destroyed = function() {}


Template.story.preserve({
  '#story': function (node) { return node.id; }
});


keyupDelay = undefined;
Template.story.events({
  'keyup #story' : function(e) {

    toggleLoad(true);

    // If they're typing a lot, let them finish before updating.
    clearTimeout(keyupDelay);
    keyupDelay = setTimeout(function(e) {

      // Hack to maintain the style
      var css = $("#story").attr("style");

      if(sessionId) {
        Meteor.call("updateText",sessionId,document.getElementById('story').value);
      } else {
        Meteor.call("createStory",{
          owner: Meteor.userId(),
          date: Session.get("session_date"),
          created: new Date().getTime(),
          text: document.getElementById('story').value,
          public: false
        }, function(e,r) {
          sessionId = r;
        });
      }

      setTimeout(function() {
        $("#story").attr("style",css).verticalCenter(true);
        toggleLoad(false);
      },0);

    },1000);
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