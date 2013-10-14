/* ==========================================================================
   Helpers
   ========================================================================== */

uploadPicture = function(button) {

  // Need to provide better way of deleting picture...
  if ($(button).hasClass("attached") && confirm("Remove picture?")) {
    $(button).removeClass("attached");
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
      $(button).addClass("error");
    }
  );

}

getImgUrl = function(picture) {
    if (typeof picture == "object" && picture.hasOwnProperty("url")) var url = picture.url;
    else if (picture.indexOf("{") !== -1) var url = jQuery.parseJSON(picture).url;
    else var url = picture; // Phew.
    return url;
}

getImg = function(picture) {
  var img = {url:"",avgColor:"",storyColor:""}
    if (typeof picture == "object" && picture.hasOwnProperty("url")) {
      img.url = picture.url;
      if(picture.hasOwnProperty("avgColor")) 
        img.avgColor = picture.avgColor;
      if(picture.hasOwnProperty("storyColor")) 
        img.storyColor = picture.storyColor;
    }
    else if (picture.indexOf("{") !== -1) {
      img.url = jQuery.parseJSON(picture).url;
      if(picture.hasOwnProperty("avgColor")) 
        img.avgColor = picture.avgColor;
      if(picture.hasOwnProperty("storyColor")) 
        img.storyColor = picture.storyColor;
    }
    else img.url = picture; // Phew.
    return img;
}
destroyModal = function() {
  $modal = $(".modal");
  $modal.removeClass("show");
  setTimeout(function() {
    $modal.remove();
    $(window).unbind("keypress keyup");
  },500);
}
createModal = function(message1,message2,actions) {
  var html = '<div class="modal"><div class="modal-content"><p><span>';

  html += message1+"</span><br />";

  if(typeof message2 != "undefined") html += message2;

  html += '<br />';

  if(typeof actions == "object") {
    for(var prop in actions) {
      html += '<a class="modal-button button '+prop+'" href="#">'+actions[prop]+'</a>';
    }
  }



  html += '</p></div></div><div class="modal-overlay"></div>';
  var $modal = $(html);
  $modal.appendTo("body");
  var $testbutton = $modal.find("a:first").select().focus();
  setTimeout(function() {
    $modal.addClass("show");
    $(window).bind('keypress keyup',function(e) {
      e.preventDefault();
    });
  },0);

  setTimeout(function() {
    $(window).bind('keypress keyup',function(e) {
      e.preventDefault();
      if ( e.keyCode == 13 ) {
        destroyModal();
      }
    });
  },100)



  $modal.find(".close").click(function() {
    destroyModal();
  });
  $modal.find(".home").click(function() {
    Meteor.Router.to('/landing');
    destroyModal();
  });
  $modal.find(".profile").click(function() {
    Session.set("expanded_story",false);
    Meteor.Router.to('/');
    destroyModal();
  });
}

$imgPreload = null;
makeBackground = function(picture) {
  // debugger;
  // If there's a previous thing happening, let's cancel that.
  if($imgPreload) $imgPreload.unbind("load");

  if (picture && typeof picture != "undefined"){
    // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
    if (typeof picture == "object" && picture.hasOwnProperty("url")) 
      var url = picture.url;
    else if (picture.indexOf("{") !== -1) {
      picture = jQuery.parseJSON(picture)
      var url = picture.url;
    }
    else 
      var url = picture; // Phew.


    // toggleLoad(true,"bg");
    var storyColor,avgColor,updateFlag = false;

    if(typeof picture == "object") {
      if (picture.hasOwnProperty("avgColor") && picture.hasOwnProperty("storyColor") ) {
          storyColor = picture.storyColor;
          avgColor = picture.avgColor;
      } else {
        updateFlag = true;
      }
    } 
    if(!!!storyColor && !!!avgColor) {

      getImageLightness(url,function(brightness,avg){
        if(brightness<150) {
          storyColor = "#ffffff";
        }
        else {
          storyColor = "#666666";
        }
        avgColor = avg;

      });
    }

    $story = $(".story, .profile-grid-stories.expanded");
    $storyDiv = $story.find(".story-img, .profile-grid-stories-img");
    $storyImg = $storyDiv.find("img");
    $storyImg.css({opacity:"0",visibility:'hidden'});

    // $storyDiv.stop().animate({opacity:0},function() {


      $imgPreload = $('<img/>').attr("src",url);
      $imgPreload.one("load", function() {
        setTimeout(function() {
          $storyImg.attr("src",url);
          $("textarea.story-text").css({color:storyColor});
          $story.css("background",avgColor).addClass("img").imgCover();
          // $storyDiv.animate({opacity:1}, function() {
          setTimeout(function(){
            $storyImg.css({opacity:"1",visibility:'visible'});
            toggleLoad(false,"bg");
            if(updateFlag && !!sessionId){
              picture["avgColor"] = avgColor;
              picture["storyColor"] = storyColor;
              Meteor.call("updateImg",sessionId,picture);
            }
          },800);
        },100);
      });

  } else {
    $(".story-img").fadeOut(function() {$(this).remove()});
  }
}

// toggleLoad: This triggers a loading animation.
loading = [];
toggleLoad = function(load,target) {
  if(typeof target == "undefined") target = "nothing";

  var $targetEl = $("."+target);

  if ( typeof load == "undefined" || load ) {
    if (!loading[target]) {
      $targetEl.addClass("loading");
      loading[target] = true;
    } else {
      // Don't do anything.
    }
  } else {
    $targetEl.removeClass("loading");
    loading[target] = false;
  }
  return $targetEl;
}

// verticalCenter: Vertically center the story.
$dummy = $(".dummy");
jQuery.fn.verticalCenter = function(force) {
  if(!!$dummy) $dummy.html(formatDummyText($(this).val()));
  setTimeout(function() { 
    $("#story").cssPersist("padding-top",calculateTop());
  },0);

  return $(this);
};


// findStory: Find a story.
findStory = function(user,date) {
  if(typeof Stories == "undefined") {Meteor.Error(500,"Trying to find a story without Stories collection.")}

  if(typeof date == "undefined") date = discreteDate(new Date());

  if(date.getMonth) {
    // console.warn("Finding a legacy date. Timezone issues may occur.")
    date = new Date(date);
    start = floorDate(date);
    end = floorDate(incrementDate(date,1));

    story = Stories.find({"owner": user,"date":{"$gte": start, "$lt": end}},{sort: {created:-1,date:1}}).fetch();
    date = discreteDate(story);
  } else {
    story = Stories.find({"owner": user,"discreteDate":date},{sort: {created:-1,date:1}}).fetch();
    if (!story.length) {
      // console.warn("Nothing here...");
      return findStory(user,objectifyDate(date));
    }
  }

  if (story.length > 1) {
    if(confirm("Multiple ("+story.length+") stories detected for "+date+". This is usually our fault. Resolve? No data will be deleted.")) {
      resolveMultiple(story);
      story = Stories.find({"owner": user,"discreteDate":date},{sort: {created:-1,date:1}}).fetch();
    };
  }
  story = story[0];
  if(story) {return story;}
  else {return {date:date,text:""};}
}
isStory = function(story) {
  if(!!story && typeof story == "object" && !!story._id) {
    discreteDate(story);
    return story._id;
  } else {
    return false;
  }
}
incrementDate = function(date,increment) {
  if(!!!date) return false;
  if(date.hasOwnProperty("year")) {
    date = objectifyDate(date);
    var newDate = new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
    return discreteDate(date);
  } else {
  return new Date(new Date().setTime(date.getTime() + increment * 24 * 60 * 60 * 1000));
  }
}
floorDate = function(date) {
  return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}
dayDiff = function(first, second) {
  if(first.hasOwnProperty("year")) first = objectifyDate(first); 
  if(second.hasOwnProperty("year")) second = objectifyDate(second); 
  return Math.floor(( second - first ) / 86400000);
}

jQuery.fn.cssPersist = function(prop,val) {
  if($(this).length)
    journalCss = $(this).attr("style",journalCss).css(prop,val).attr("style");

  return $(this);
}


scrollNav = function () {
}


resolveMultiple = function(storyArray) {

  var options = 
      {
        owner: "",
        date: "",
        created: new Date().getTime(),
        text: "",
        img: "",
        public: false
      };

  options.owner = storyArray[0].owner;
  options.date = storyArray[0].date;


  for (var i = 0; i < storyArray.length; i++) {
      if (storyArray[i].created < options.created) options.created = storyArray[i].created
      options.text += " " + storyArray[i].text;
      if (storyArray[i].hasOwnProperty("img") && storyArray[i].img) {
        console.log("this one works.",storyArray[i].img);
        if (storyArray[i].img.indexOf("{") !== -1) {
          console.log("ok, it has a url, saving.");
          options.img = storyArray[i].img;
        }
      }
      Stories.remove(storyArray[i]._id);
  }


  Meteor.call("createStory",options,function(e,r) {
    console.log(e,r); 
    discreteDate(Stories.findOne(r));
    sessionId = r;
  });
}


getScreenName = function(id) {
  if(!id) {id = Meteor.userId();}
  user = Meteor.users.find(id).fetch()[0];
  if(!user) return;
  if(hasScreenName(user)) name = user.username;
  else return;
  return name;
}
uniqueScreenName = function(name) {
  if(!name) {name = sessionScreenName;}
  return !Meteor.users.find({username:name}).fetch().length;
}
getUserId = function(name) {
  if(!name) {
    if(sessionScreenName) {
      name = sessionScreenName;
    }
    else {
      return false;
    }
  }
  var users = Meteor.users.find({username:name}).fetch();
  if(users.length>1) console.log("Warning: Note that there is more than one",name);
  if(users[0] && users[0].hasOwnProperty("_id"))
    return users[0]._id;
  else
    return "";
}
getDisplayName = function(id) {
  if(!id) {id = Meteor.userId();}
  var user = Meteor.users.find(id).fetch()[0];
  var name = "";
  if(user!=undefined) {
    if (user.hasOwnProperty("profile")) {
      if(!user.profile.hasOwnProperty("displayName") || !user.profile.displayName || user.profile.displayName == "null") {
        name = getScreenName(id);
      }
      else {
        name = user.profile.displayName;
      }
    }

  }
  return name;
}
hasScreenName = function(user) {
  if(!user) return false;
  if(!user.hasOwnProperty("username") || !user.username || user.username == "null") {
    Meteor.Router.to("/youdonthaveausername");
    console.log("holdon!!!");
    return false;
  }
  else return true;
}

ownStory = function() {
  return Meteor.userId() == Session.get("session_user");
}

getDateUrl = function(date) {
  if(date.hasOwnProperty("year"))
    return "/"+date.year+"/"+(date.month+1)+"/"+date.date;
  else
    return "/"+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
}

discreteDate = function(story) {
  var ddate = {year:undefined,month:undefined,date:undefined};

  if(!!!story) return ddate;

  if(story.getMonth) {
    ddate = {year:story.getFullYear(),month:story.getMonth(),date:story.getDate()};
  } else {
    if(story.hasOwnProperty("discreteDate")) {
      if(!!story.discreteDate)
        return story.discreteDate;
    }

    // console.warn("Caution: Legacy post with no discrete date set. Timezone issues possible.");
    var date = new Date(story.date);
    ddate = {year:date.getFullYear(),month:date.getMonth(),date:date.getDate()};

    if(story.owner == Meteor.userId()) {
      Meteor.call("updateDiscreteDate",story._id,ddate);
    }
  }
  return ddate;
}
objectifyDate = function(date) {
  if(!!date){
  if (date.hasOwnProperty("year"))
    return new Date(date.year,date.month,date.date);
  else if(new Date(date))
    return new Date(date);
  }
  console.warn("Not a valid date.");
  return null;
}

updateStats = function(id) {
  if(id != Meteor.userId()){
    console.warn("Foreign update attempt. You can't update other users' stats.");
    return false;
  }
  user = Meteor.users.findOne(id);
  if(!!user) {
    var stories = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch();
    var currstreak = 1;
    var beststreak = 1;
    var lastUpdate = discreteDate(stories[0]);
    var completion = 1;
    var posts = 1;

    if(!!user.profile) {
      // Last updated

      if (user.profile.hasOwnProperty("lastUpdate")){
        var dayOld = new Date(user.profile.lastUpdate.year,user.profile.lastUpdate.month,user.profile.lastUpdate.date);
        var dayLast = new Date(lastUpdate.year,lastUpdate.month,lastUpdate.date);
        var diff = dayDiff(dayOld,dayLast);
      }

      // Current streak
      var currstreak = user.profile.hasOwnProperty("currstreak") ? user.profile.currstreak : 1;
      if (diff == 1) currstreak++;
      else if (diff > 1) currstreak = 1;

      // Best streak
      var beststreak = user.profile.hasOwnProperty("beststreak") ? user.profile.beststreak : 1;
      if(currstreak>beststreak) beststreak = currstreak;

      // Posts
      if (user.profile.hasOwnProperty("posts") && isFinite(String(user.profile.posts)))
      var posts = stories.length > user.profile.posts ? stories.length : user.profile.posts;

      // Completion
      if(user.hasOwnProperty("createdAt")) {
        var age = dayDiff(user.createdAt,new Date())+1;
      }
      var completion = stories.length / age;
    }

    Meteor.users.update({_id:id}, {$set:{
      "profile.currstreak":currstreak,
      "profile.posts":posts,
      "profile.completion":completion,
      "profile.beststreak":beststreak,
      "profile.lastUpdate":lastUpdate
    }})
  }
  else {
    console.warn("No user found. Could not update");
    return false;
  }

}


validatePassword = function(pass) {
      if(pass.length < 6) {
        // alert("Error: Password must contain at least six characters!");
        // form.pwd1.focus();
        return false;
      } else {
        return true;
      }
}
