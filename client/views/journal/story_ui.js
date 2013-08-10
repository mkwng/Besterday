
storytimeRenderedTimeout = setTimeout(function() {},0);
storyMargin = $(window).width() > 768 ? 40 : $(window).width() > 320 ? 20 : 0;
paddingTopTemp = 100;
uploadButtonTimeout = setTimeout(function() {},0);


storytime_ui = function() {
  $("textarea").verticalCenterTextarea().addClass("animate");
}

Template.storytime.events({
  'keydown textarea.story-text' : function(e) {
     $(".story-buttons.upload").css("opacity","0");
  },
  'keyup textarea.story-text' : function(e) {
    clearTimeout(uploadButtonTimeout);
    uploadButtonTimeout = setTimeout(showUploadButton,1500);
    if (e.which === 27) {
      $(".story").editCancel();
    }
    $("textarea").verticalCenterTextarea();
  },
});

Template.storytime.helpers({
  'copyImgStyle' : function() {
    var imgimg = $(".cover-transition .profile-grid-stories-img").attr("style");
    return imgimg;
  },
  'avgColor' : function() {
    if(!!story.img)
      return getImg(story.img).avgColor;
  },
  'storyColor' : function() {
    if(!!story.img)
      return getImg(story.img).storyColor;
  }
});


showUploadButton = function(){
  $uploadButton =$(".story-buttons.upload");
  if($uploadButton.position().top <90) {
    $uploadButton.addClass("scroll");
  }else{
    $uploadButton.removeClass("scroll");
  }
  $uploadButton.css({
    opacity: $uploadButton.hasClass("attached") ? ".9" : ".08",
    top: parseInt($('textarea.story-text').css("padding-top"),10)-60+"px"
  });
}