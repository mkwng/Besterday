Template.profile_stats.created = function() {}


Template.profile_stats.rendered = function() {}


Template.profile_stats.destroyed = function() {}


Template.profile_stats.events({});


Template.profile_stats.helpers({
  completion : function() {
    var posts = 0;
    var age = 1;
    if(Session.get("pub_loaded"))
      posts = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch().length;

    if(Session.get("user_loaded")) {
      var user = Meteor.users.findOne(Session.get("session_user"));
      if(!!user && user.hasOwnProperty("createdAt")) {
        age = dayDiff(user.createdAt,incrementDate(new Date(),-1));
      }
    }
    return Math.round(posts/age*100)+"%";
  },
  total : function() {
    var posts = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch().length;
    return posts;
  },
  currstreak : function() {
    return "0";
  },
  beststreak : function() {
    return '6';
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
    if(Session.get("pub_loaded"))
      posts = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch().length;

    if(Session.get("user_loaded")) {
      var user = Meteor.users.findOne(Session.get("session_user"));

      if(!!user && user.hasOwnProperty("createdAt")) {
        age = dayDiff(user.createdAt,incrementDate(new Date(),-1));
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
  var posts = Stories.find({text:{$ne: ""},owner:Session.get("session_user")},{sort:{created:-1}}).fetch().length;
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