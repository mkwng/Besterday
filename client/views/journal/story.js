jQuery.fn.showStory = function() {
  if(typeof $cover == "undefined" || !$cover.closest("body").length)
    $cover = $('<div class="cover"></div>');
  if (!$cover.closest("body").length)
    $cover.appendTo("body");

  this.each(function() {
    $t = $(this);
    if(!$t.hasClass("expanded") && !$t.hasClass("giant-clone")) {
      $cover.show();
      $tc = $t.clone().removeClass("isotope-item").attr("href","").css({
        position:"fixed",
        top:$t.offset().top - $(window).scrollTop(),
        left:$t.offset().left,
        "z-index":99,
        transform:"translate3d(0,0,0)"
      }).appendTo($cover).css({
        top:"40px",
        left:"40px",
        width:$(window).width()-80+"px",
        height:$(window).height()-80+"px"
      }).addClass("giant-clone no-hover").attr("data-original",$.param({
        top:$t.offset().top - $(window).scrollTop(),
        left:$t.offset().left,
        width:$t.width(),
        height:$t.height()
      })).click(function(){$(this).showStory()});
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