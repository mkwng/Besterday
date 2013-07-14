Template.dashboard.rendered = function() {
  $dashboard = $(".dashboard");
  $dashboardWeek = $dashboard.find(".dashboard-week").addClass("week-0");
  $dashboardActive = $dashboardWeek.find(".active");

  parentHeight = $dashboard.height();
  dayHeight = $dashboardActive.outerHeight();

  fillNumber = Math.ceil(parentHeight/$dashboardWeek.height());


  // Duplicate week until window is filled
  for(var i=1;i<fillNumber+1;i++) {
    var $newWeek = $dashboardWeek.clone().removeClass("week-0");
    $newWeek.addClass("week-minus-"+i).insertBefore($(".dashboard-week:first")).find("li").removeClass("active");
    var $newWeek = $dashboardWeek.clone().removeClass("week-0");
    $newWeek.addClass("week-plus-"+i).insertAfter($(".dashboard-week:last")).find("li").removeClass("active");
  }

  // Initialize position.
  $dashboard.scrollTop($dashboardActive.position().top - parentHeight/2 + dayHeight/2);


}


fillDays = function() {
  $allDays = $(".dashboard-day");
  var activeDate = new Date($dashboardActive.attr("data-date"));
  activeIndex = $allDays.index($dashboardActive);
  totalDays = $allDays.length;

  for(var i = activeIndex;i>=0;i--) {
    var $this = $allDays.eq(i);
    var thisDate = incrementDate(activeDate,i-activeIndex)
    $this.attr("data-date",thisDate);
    $this.find(".dashboard-date-month").html(monNames[thisDate.getMonth()]);
    $this.find(".dashboard-date-day").html(thisDate.getDate());
  }
  for(var i = activeIndex+1;i<totalDays;i++) {
    var $this = $allDays.eq(i);
    var thisDate = incrementDate(activeDate,i-activeIndex)
    $this.find(".dashboard-date-month").html(monNames[thisDate.getMonth()]);
    $this.find(".dashboard-date-day").html(thisDate.getDate());
  }

  $allDays.unwrap();

}