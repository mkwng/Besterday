Template.profile_stats.created = function() {}


Template.profile_stats.rendered = function() {}


Template.profile_stats.destroyed = function() {}


Template.profile_stats.events({});


Template.profile_stats.helpers({
  completion : function() {
    return "42%";
  },
  total : function() {
    return "84";
  },
  currstreak : function() {
    return "14";
  },
  beststreak : function() {
    return '23';
  }
});























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