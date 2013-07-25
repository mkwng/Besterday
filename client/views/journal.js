
/* ==========================================================================
   TEMPLATE: Journal
   ========================================================================== */
// Tasks when Journal is created.
Template.journal.created = function() {
  Meteor.defer(function() {
    Session.set("show_sidebar",false);
    $dummy = $(".dummy");
    $("#story").cssPersist("width","+="+getScrollBarWidth());
  })
  dateSetOnce = false;
  console.log("created:",Session.get("session_user"),prettyDate(objectifyDate(Session.get("session_date"))));
}


// Tasks when Journal is rendered.
Template.journal.rendered = function() {
  if( $dummy == null || !$dummy.closest("body").length ) $dummy = $(".dummy");
  Meteor.defer(function() {
    // This addresses bug fix #3
    // debugger;
    if(!dateSetOnce) {
      console.log("journal.rendered:",Session.get("session_user"),prettyDate(objectifyDate(Session.get("session_date"))));

      if(!!sessionId) {
        story = Stories.findOne(sessionId);
        Session.set("session_date",discreteDate(story));
        Session.set("session_user",story.owner);
      }

      setDate(Session.get("session_user"),Session.get("session_date"));
    }
    setTimeout(scrollNav,10);
  });
}


// Tasks when Journal is destroyed.
Template.journal.destroyed = function() {
    $dummy = null;
    dateSetOnce = false;
}


// Bind to Stories collection.
Template.journal.story = function() {
  story = findStory(Session.get("session_user"),Session.get("session_date"));
  return story;
}

// Events
publicDelay = setTimeout(function(){},1);
Template.journal.events({

  // 'click .controls-share' :function(e) {
  //   toggleLoad(true,"controls-save");
  //   clearTimeout(publicDelay);
  //   if(sessionId) {

  //     $icon = $(".controls-share-icon");

  //     if($icon.hasClass("unlock")) {
  //       $icon.css("background-position","0 0").removeClass("unlock").addClass("lock animate");
  //       newPublic=false;
  //     } else {
  //       $icon.css("background-position","-378px 0").removeClass("lock").addClass("unlock animate");
  //       newPublic=true;
  //     }

  //     // Let's give the animation some time to complete before updating the server.
  //     publicDelay = setTimeout(function() {
  //       // The animate class has the CSS animation. 
  //       // We need to remove it because otherwise when Meteor rerenders, it will animate again.
  //       $icon.removeClass("animate");  
  //       toggleLoad(false,"controls-save");
  //       Meteor.call("updatePublic",sessionId,newPublic);

  //     },800);

  //   } else {
  //     // Need a better error here.
  //     alert("No story to share...");
  //   }

  // },

  // // Open up the menu...
  // 'click .controls-menu' : function(e) {

  //   if(!Session.get("show_sidebar")) openSidebar();
  //   else closeSidebar();

  // },

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
            date: objectifyDate(Session.get("session_date")),
            discreteDate: Session.get("session_date"),
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

  },
  'click .controls-save': function(e) {
    e.preventDefault();
    toggleLoad(true,"controls-save");

    // If they're typing a lot, let them finish before updating.
    clearTimeout(keyupDelay);
    keyupDelay = setTimeout(function(e) {

      if(sessionId) {
        Meteor.call("updateText",sessionId,document.getElementById('story').value);
      } else {
        Meteor.call("createStory",{
          owner: Meteor.userId(),
          date: objectifyDate(Session.get("session_date")),
          discreteDate: Session.get("session_date"),
          created: new Date().getTime(),
          text: document.getElementById('story').value,
          public: false
        }, function(e,r) {
          console.log(e,r);
          sessionId = r;
        });
      }

      setTimeout(function() {
        $("#story").verticalCenter(true);
        toggleLoad(false,"controls-save");
        updateStats(Meteor.userId());
        Meteor.Router.to("/user/"+sessionScreenName);

      },0);


    },1000);
  },
  'click .edit' : function() {
    // Meteor.Router.to("/story/"+sessionId+"/edit");
  }
});
// Helpers
Template.journal.helpers({
  owner : function() {
    return ownStory();
  },
  edit : function() {
    return (ownStory() && Session.get("edit"));
  }
});

/* ==========================================================================
   TEMPLATE: Story
   ========================================================================== */
// Tasks when Story is created.
Template.story.created = function() {
}


// Tasks when Story is rendered.
journalCss = "";
renderOpacity = true;
Template.story.rendered = function() {
    // See cssPersist() function for explanation.
    $story = $("#story");
    $story.attr("style",journalCss);
    if($story.css("opacity")==0 && renderOpacity) {
      renderOpacity = false;
      $story.animate({opacity:1},1000,function() {
        $(this).cssPersist("opacity",1);
        renderOpacity = true;
      });
    }
}


// Tasks when Story is destroyed.
Template.story.destroyed = function() {
  journalCss = "opacity:0;";
}


Template.story.preserve({
  '#story': function (node) { return node.id; }
});

keyupDelay = undefined;
Template.story.events({
  'keyup #story' : function(e) {

    toggleLoad(true,"controls-save");

    // If they're typing a lot, let them finish before updating.
    clearTimeout(keyupDelay);
    keyupDelay = setTimeout(function(e) {

      if(sessionId) {
        Meteor.call("updateText",sessionId,document.getElementById('story').value);
      } else {
        Meteor.call("createStory",{
          owner: Meteor.userId(),
          date: objectifyDate(Session.get("session_date")),
          discreteDate: Session.get("session_date"),
          created: new Date().getTime(),
          text: document.getElementById('story').value,
          public: false
        }, function(e,r) {
          console.log(e,r);
          sessionId = r;
        });
      }

      setTimeout(function() {
        $("#story").verticalCenter(true);
        toggleLoad(false,"controls-save");

      },0);

    },1000);
  }

});


// Events
// Helpers
Template.story.helpers({
  prettyDate : function() {
    if(Session.get("session_date")) return prettyDate(objectifyDate(Session.get("session_date")),true);
    else return "Loading...";
  },
  owner : function() {
    return ownStory();
  },
  edit : function() {
    return (ownStory() && Session.get("edit"));
  },
  long : function() {
    if ($dummy==null) return false;
    $dummy.html(formatDummyText(this.text));
    return !(calculateTop() >= 0);
  },
  month : function() {
    if(Session.get("session_date")) return monNames[Session.get("session_date").month];
  },
  day : function() {
    if(Session.get("session_date")) return Session.get("session_date").date;
  }
});


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
Template.postControls.events({
  'click .fb': function() {
    alert("Still working on it!");
  },
  'click .tw': function() {
    alert("Still working on it!");
  }
});
// Helpers
Template.postControls.helpers({
  prettyDate : function() {
    if(Session.get("session_date")) return prettyDate(objectifyDate(Session.get("session_date")));
    else return "Loading...";
  },
  edit : function() {
    return (ownStory() && Session.get("edit"));
  },
  formattedUrl : function() {
    if(this.hasOwnProperty("owner")) {
      url = "http://besterday.meteor.com/"+getScreenName(this.owner)+"/"+this.date.getFullYear()+"/"+(this.date.getMonth()+1)+"/"+this.date.getDate();
      return url;
    }
    else
      return "loading..."
  }
});


/* ==========================================================================
   TEMPLATE: Shared
   ========================================================================== */
// Tasks when Story is created.
Template.shared.created = function() {}


// Tasks when Story is rendered.
Template.shared.rendered = function() {}


// Tasks when Story is destroyed.
Template.shared.destroyed = function() {}


Template.shared.events({});

// Events
// Helpers
Template.shared.helpers({
  displayName : function() {
    return getDisplayName();
  },
  screenName : function() {
    return sessionScreenName;
  }
});
// Events
// Helpers
Template.details.helpers({
  displayName : function() {
    return getDisplayName();
  },
  screenName : function() {
    return sessionScreenName;
  }
});