jQuery.fn.showStory = function() {
  this.each(function() {
    $t = $(this);
    if(!$t.hasClass("expanded") && !$t.hasClass("giant-clone")) {
      $tc = $t.clone().removeClass("isotope-item").attr("href","").css({
        position:"fixed",
        top:$t.offset().top - $(window).scrollTop(),
        left:$t.offset().left,
        "z-index":99,
        transform:"translate3d(0,0,0)"
      }).appendTo("body").animate({
        top:"40px",
        left:"40px",
        width:$(window).width()-80+"px",
        height:$(window).height()-80+"px"
      }).addClass("giant-clone").attr("data-original",$.param({
        top:$t.offset().top - $(window).scrollTop(),
        left:$t.offset().left,
        width:$t.width(),
        height:$t.height()
      })).click(function(){$(this).showStory()});
      $t.css("opacity",0.25);
    } else if($t.hasClass("giant-clone")) {
      $tc = $(".giant-clone");
      $tc.animate($.deparam($tc.attr("data-original")),function() {
        $(".profile-grid-stories").css("opacity",1);
        this.remove();
      });
    } else {
      $tc = $(".giant-clone").animate($.deparam($tc.attr("data-original")),function() {
        $t.css("opacity",1);
        this.remove();
      });
    }

    $t.toggleClass("expanded");
  });
}