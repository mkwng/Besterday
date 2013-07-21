Template.profile_stats.created = function() {}


Template.profile_stats.rendered = function() {}


Template.profile_stats.destroyed = function() {}


Template.profile_stats.events({});


Template.profile_stats.helpers({
  completion : function() {
    var posts = 0;
    var age = 1;

    if(Session.get("user_loaded")) {
      if(!!user && user.hasOwnProperty("createdAt") && user.hasOwnProperty("profile")) {
        posts = user.profile.hasOwnProperty("posts") ? user.profile.posts : 0;
        age = dayDiff(floorDate(new Date(user.createdAt)),incrementDate(new Date(),-1));
      }
    }
    return Math.min(Math.round(posts/age*100),100)+"%";
  },
  total : function() {
    var posts = 0;

    if(Session.get("user_loaded")) {
      if(!!user && user.hasOwnProperty("profile")) {
        posts = user.profile.hasOwnProperty("posts") ? user.profile.posts : 0;
      }
    }
    return posts;
  },
  currstreak : function() {
    var streak = 0;

    if(Session.get("user_loaded")) {
      if(!!user && user.hasOwnProperty("profile")) {

        var dayOld = new Date(user.profile.lastUpdate.year,user.profile.lastUpdate.month,user.profile.lastUpdate.date);
        var diff = dayDiff(dayOld,new Date());

        if (diff <= 1) streak = user.profile.hasOwnProperty("currstreak") ? user.profile.currstreak : 0;
        else streak = 0;
      }
    }

    return streak;
  },
  beststreak : function() {
    var streak = 0;

    if(Session.get("user_loaded")) {
      if(!!user && user.hasOwnProperty("profile")) {
        streak = user.profile.hasOwnProperty("beststreak") ? user.profile.beststreak : 0;
      }
    }

    return streak;
  },

});





Template.profile_stats_completion.rendered = function() {
  Meteor.defer(function(){
    $(".profile-stats-4.completion .start").removeClass("start");
  });
}
Template.profile_stats_completion.helpers({
  ratio : function() {

    var posts = 0;
    var age = 1;

    if(Session.get("user_loaded")) {
      if(!!user && user.hasOwnProperty("createdAt") && user.hasOwnProperty("profile")) {
        posts = user.profile.hasOwnProperty("posts") ? user.profile.posts : 0;
        age = dayDiff(floorDate(new Date(user.createdAt)),incrementDate(new Date(),-1));
      }
    }

    return 80-Math.round(Math.min(Math.round(posts/age*100),100)*80/100);
  }
});

Template.profile_stats_total.rendered = function() {
  Meteor.defer(function(){
    $(".profile-stats-4.total .start").removeClass("start");
  });
}
Template.profile_stats_total.count = function() {
  var blocks = [];
  var posts = 0;

  if(Session.get("user_loaded")) {
    if(!!user && user.hasOwnProperty("profile")) {
      posts = user.profile.hasOwnProperty("posts") ? user.profile.posts : 0;
    }
  }

  if(posts<40) rate = 1;
  else if(posts<400) rate = 10;
  else if(posts<4000) rate = 100;
  for (var i = posts;i>=0;i-=rate) {
    if(i<rate) blocks.push({num:(i%rate)/rate});
    else blocks.push({num:1});
  }
  return blocks;
}
Template.profile_stats_total.helpers({
});


Template.profile_stats_currstreak.rendered = function() {
  Meteor.defer(function(){
    $(".profile-stats-4.currstreak .start").removeClass("start");
  });
}
Template.profile_stats_beststreak.rendered = function() {
  Meteor.defer(function(){
    $(".profile-stats-4.beststreak .start").removeClass("start");
  });
}












Template.profile_stats_detail.created = function() {}


Template.profile_stats_detail.rendered = function() {}


Template.profile_stats_detail.destroyed = function() {}


Template.profile_stats_detail.events({});


Template.profile_stats_detail.helpers({
  monthAvg : function() {
    return '31.2';
  },
  monthDelta : function() {
    return '7.8%';
  }
});