jQuery.fn.showStory = function() {
  if(typeof $cover == "undefined" || !$cover.closest("body").length)
    $cover = $('<div class="cover"></div>');
  if (!$cover.closest("body").length)
    $cover.appendTo("body");

  this.each(function() {
    $t = $(this);
    var storyMargin = $(window).width() > 320 ? 40 : 0;

    if(!$t.hasClass("expanded") && !$t.hasClass("giant-clone")) {
      $cover.show();
      var w = $(window).width();
      var h = $(window).height();
      var st = $(window).scrollTop();
      $tc = $t.clone().removeClass("isotope-item").attr("href","").css({
        position:"fixed",
        top:$t.offset().top - st,
        left:$t.offset().left,
        "z-index":99,
        transform:"translate3d(0,0,0)"
      }).appendTo($cover)
      $tc.css({
        top:storyMargin,
        left:storyMargin,
        width:$(window).width()-storyMargin*2+"px",
        height:$(window).height()-storyMargin*2+"px"
      }).addClass("giant-clone no-hover").attr("data-original",$.param({
        top:$t.offset().top - st,
        left:$t.offset().left,
        width:$t.width(),
        height:$t.height()
      })).click(function(){$(this).showStory()});
      $ts = $tc.find(".profile-grid-stories-story");
      $ts.html($ts.attr("data-story"));

      setTimeout(function() {
        if($ts[0].clientHeight>h-storyMargin*2) $ts.addClass("scroll");
      },500);
      $t.css("opacity",0);
      $cover.addClass("visible");

      $tc.imgCover("window");

    } else if($t.hasClass("giant-clone")) {
        $cover.removeClass("visible");
      $tc = $(".giant-clone");
      $tc.removeClass("giant-clone").animate($.deparam($tc.attr("data-original")),200,function() {
        $(".profile-grid-stories").css("opacity",1).removeClass("expanded");
        $(this).remove();
        $cover.hide();
      });
    } else {
        $cover.removeClass("visible");
      $tc = $(".giant-clone").removeClass("giant-clone").animate($.deparam($tc.attr("data-original")),200,function() {
        $t.css("opacity",1);
        $(this).remove();
        $cover.hide();
      });
    }

    $t.toggleClass("expanded");
  });
}







