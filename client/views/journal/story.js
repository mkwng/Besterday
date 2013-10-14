
storytimeLoaded = false;

Template.storytime.created = function() {
  storytimeLoaded = false;
}


Template.storytime.rendered = function() {
  if(!!story && story.hasOwnProperty("_id")) {
    if(sessionId!=story._id) {
      var tempStory = Stories.findOne(sessionId);
      var tempDate = discreteDate(tempStory);
      var tempUser = tempStory.owner;
      setDate(tempUser,tempDate);
    }
  } else {
    if(!!sessionId) {
      var tempStory = Stories.findOne(sessionId);
      var tempDate = discreteDate(tempStory);
      var tempUser = tempStory.owner;
      setDate(tempUser,tempDate);
    }
  }
  storytime_ui();
}


Template.storytime.destroyed = function() {
  storytimeLoaded = false;
}


Template.storytime.story = function() {
  story = findStory(Session.get("session_user"),Session.get("session_date"));
  return story;
}

Template.storytime.edit = function() {
  return Session.get("edit");
}

Template.storytime.events({
  'click a.close' : function(e) {
    e.preventDefault();
    closeStory();
  },
  'click a.edit' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").edit();
  },
  'click a.done' : function(e) {
    e.preventDefault();
    $(e.currentTarget).closest(".story").editDone();
  },
  'click a.upload' : function(e) {
    e.preventDefault();
    uploadPicture(e.target);
  },
  'click a.share' :function(e) {
    if(sessionId) {
      $icon = $("a.share");
      if($icon.hasClass("icon-unlocked")) {
        $icon.css("background-position","0 0").removeClass("icon-unlocked").addClass("icon-lock");
        newPublic=false;
      } else {
        $icon.css("background-position","-378px 0").removeClass("icon-lock").addClass("icon-unlocked");
        newPublic=true;
      }
      Meteor.call("updatePublic",sessionId,newPublic);


    } else {
      // Need a better error here.
      alert("No story to share...");
    }

  },
});
Template.storytime.helpers({
  imgUrl : function() {
    if (!story) return;
    return getImgUrl(story.img);
  },
  'date_month' : function() {
    if (story && story.date.getMonth)
      return monNames[story.date.getMonth()];
    else if(Session.get("session_date"))
      return monNames[Session.get("session_date").month];
    else 
      return "Loading..."
  },
  'date_date' : function() {
    if (story && story.date.getDate)
      return story.date.getDate();
    else if(Session.get("session_date"))
      return Session.get("session_date").date;
    else 
      return "Loading..."
  },
  'date_year' : function() {
    if (story && story.date.getFullYear)
      return story.date.getFullYear();
    else if(Session.get("session_date"))
      return Session.get("session_date").year;
    else 
      return "Loading..."
  },
  'prettyDate' : function() {
    if (!!story.date) {
      if (!!story.date.year) 
        return " " + prettyDate(objectifyDate(story.discreteDate));
      else
        return " yesterday";
    }
    else 
      return "";
  },
  'isOwner' : function() {
    return Meteor.userId() == Session.get("session_user");
  }
});

jQuery.fn.showStory = function(callback) {
  this.each(function() {
    $t = $(this);
    if(!$t.hasClass("expanded") && !$t.hasClass("story")) {
      var toDate = discreteDate(new Date($(this).attr("data-date")));
      setDate(Session.get("session_user"),toDate,true);
      $cover.addClass("visible");
    } else if($t.hasClass("story")) {
      Session.set("expanded_story",false);
      Meteor.Router.to("/user/"+sessionScreenName);
      $cover.removeClass("visible");
    }
    $t.toggleClass("expanded");
    if(typeof callback == "function"){
      callback();
    }
  });
}

closeStory = function() {
  Meteor.Router.to("/user/"+sessionScreenName);
  Session.set("expanded_story",false);
}

jQuery.fn.edit = function() {
  $storyText = $(this).find(".story-text");
  $storyText.attr("data-original",$storyText[0].value).removeAttr("disabled");
  setTimeout(function() {
    $($("textarea")[0]).focus();
    Session.set("edit",true);
    $.debounce(1000,showUploadButton)();
  },10);
};
jQuery.fn.editDone = function() {

  $storyText = $(this).find(".story-text");

  if($storyText[0].value == "") {
    createModal("Oh come on.","There's got to be something.",{close:"Ok, fine"});
    return false;
  } else {
    $storyText.attr("disabled","");
  }

  if(sessionId) {
    Meteor.call("updateText",sessionId,$storyText[0].value);
  } else {
    Meteor.call("createStory",{
      owner: Meteor.userId(),
      date: objectifyDate(Session.get("session_date")),
      discreteDate: Session.get("session_date"),
      created: new Date().getTime(),
      text: $storyText[0].value,
      public: false
    }, function(e,r) {
      console.log(e,r);
      sessionId = r;
    });
  }

  setTimeout(function() {
    Session.set("edit",false);
    // toggleLoad(false,"controls-save");
    updateStats(Meteor.userId());
    // Meteor.Router.to("/user/"+sessionScreenName);

    if(JSON.stringify(Session.get("session_date"))==JSON.stringify(discreteDate(incrementDate(new Date(),-1))) && Meteor.Router.page() == "storytime"){
      createModal("Awesome.","See you tomorrow.",{profile:"Ok"});
    }

  },0);
}

jQuery.fn.editCancel = function() {
  if (Session.get("edit")) {
    $storyText = $(this).find(".story-text");
    Session.set("edit",false);
    $storyText.attr("disabled","").val($storyText.attr("data-original"));
  }
}






