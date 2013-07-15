Template.dashboard.rendered = function() {
  $dashboard = $(".dashboard");
  $dashboardWeek = $dashboard.find(".dashboard-week").addClass("week-0");
  $dashboardActive = $dashboardWeek.find(".active");

  parentHeight = $dashboard.height();
  dayHeight = $dashboardActive.outerHeight();

  fillNumber = Math.ceil(parentHeight/$dashboardWeek.height());
  activeDate = new Date($dashboardActive.attr("data-date"));
  currentMiddle = 0;


  // Duplicate week until window is filled
  for(var i=1;i<fillNumber+1;i++) {
    var $newWeek = $dashboardWeek.clone().removeClass("week-0");
    $newWeek.addClass("week-minus-"+i).insertBefore($(".dashboard-week:first")).find("li").removeClass("active");
    var $newWeek = $dashboardWeek.clone().removeClass("week-0");
    $newWeek.addClass("week-plus-"+i).insertAfter($(".dashboard-week:last")).find("li").removeClass("active");
  }

  // Initialize position.
  $dashboard.scrollTop($dashboardActive.position().top - parentHeight/2 + dayHeight/2);
  $allDays = $(".dashboard-day");
  currentMiddle = $allDays.index($dashboardActive);

  Meteor.defer(function() {
    $allDays = $(".dashboard-day").fillDay();
    if($allDays.closest(".dashboard-week").length) $allDays.unwrap();
    stroll.bind( '.dashboard' );
    scrollDash();
  });

}

moreDays = function(direction) {
    stroll.unbind( '.dashboard' );
    var $newWeek = $allDays.filter(":lt(7)").clone().removeClass("active");
    currentPos = $dashboard.scrollTop();
    if (direction=="before") {
      currentMiddle+=7;
      $newWeek.addClass("past").insertBefore($(".dashboard-day:first")).fillDay();
      $allDays.slice(-7).remove();
      $dashboard.scrollTop(currentPos + dayHeight*7 + 1);
    }
    else {
      $newWeek.addClass("future").insertAfter($(".dashboard-day:last")).fillDay();
      currentMiddle-=7;
      $allDays.filter(":lt(7)").remove();
      $dashboard.scrollTop(currentPos - dayHeight*7 - 1);
    }

    stroll.bind( '.dashboard' );

}

infoFill = function($e,thisDate) {

  var url;
  // Date is outside valid range...) 
  if(thisDate > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) {
    $e.addClass("disabled").attr("href","#");
  }
  $e.find(".dashboard-date-month").html(monNames[thisDate.getMonth()]);
  $e.find(".dashboard-date-day").html(thisDate.getDate());

  $e
    .attr({"data-date":thisDate,"data-month":monthNames[thisDate.getMonth()]+" "+thisDate.getFullYear()})
    .removeClass("first-of-month disabled loading empty img");
  if (thisDate.getDate()==1) 
    $e.addClass("first-of-month");

  // Is the data loaded yet?
  if(Session.get('pub_loaded')) {

    var blurb = "Loading&hellip;";

    if(thisDate > incrementDate(floorDate(new Date()),-1/(24 * 60 * 60 * 1000) ) ) {
      $e.addClass("disabled");
      url="#";
    } else {
      url = "/"+sessionScreenName+getDateUrl(thisDate);
    }

    var story = findStory(getUserId(sessionScreenName),thisDate);
    if(story.text) {
      blurb = story.text;
    } else {
      $e.addClass("empty");
      blurb = "No story yet."
    }
    if(story.img) {
      $e.addClass("img");
    }


    $e.find(".dashboard-date-month").html(monNames[thisDate.getMonth()]);
    $e.find(".dashboard-date-day").html(thisDate.getDate());
    $e.find(".dashboard-blurb").html("<span>"+dayNames[thisDate.getDay()]+"</span>"+blurb)
      .attr("href",url);

  } else {
    console.log("not yet...");
    // Meteor.setTimeout(infoFill($e,thisDate),10000);
  }


}

jQuery.fn.fillDay = function() {
  $allDays = $(".dashboard-day");

  $(this).each(function(i) {
    diff = $allDays.index(this) - currentMiddle;
    if(diff==0) $(this).addClass("active");
    // debugger;
    var thisDate = incrementDate(activeDate,diff)
    infoFill($(this),thisDate);
  });

  return $(this);

}

scrollDash = function() {
  $dashboard.scroll(function(e) {
    if($(this).scrollTop() == 0) {
      moreDays("before");
    } else if($(this).scrollTop() == this.scrollHeight - $(window).height()) {
      moreDays("after");
    }
  })
}