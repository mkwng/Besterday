
// $bg = null;
// $bgImage = null;
// $bgPreload = null;

// makeBackground = function(picture) {

//   console.log("Changing background...");

//   if( !$bg || !$bg.closest("body").length ) $bg = $(".bg");
//   if( !$bgImage || !$bgImage.closest("body").length ) $bgImage = $(".bg-image");

//   function changeBg(url) {
//     $bgImage.css("background-image","url("+url+")");
//     $bg.animate({opacity:1})
//   }

//   // If there's a previous thing happening, let's cancel that.
//   // NOTE! As of 7/2 this is not cancelling. Still broken.
//   if($bgPreload) $bgPreload.unbind("load");

//   if (typeof picture != "undefined"){
//     // Wait, we gotta check if this is a URL or an object, because you can pass either one in.
//     if (typeof picture == "object" && picture.url) var url = picture.url;
//     else if (picture.indexOf("{") !== -1) var url = JSON.parse(picture).url;
//     else var url = picture; // Phew.

//     getImageLightness(url,function(brightness){
//       if(brightness<150) {
//         setTimeout(function() {
//           $("#story").css("color","#ffffff");
//         },2);
//       }
//       else {
//         setTimeout(function() {
//           $("#story").css("color","#666666");
//         },2);
//       }
//     });

//     // Fade it out, once it finishes loading, fade it back in.
//     $bg.stop().animate({opacity:0},function() {
//       $bgPreload = $('<img/>').attr("src",url);
//       $bgPreload.one("load", changeBg(url));
//     });
//   }
//   else $bg.animate({opacity:0},function() {
//     setTimeout(function() {
//       $(".upload").removeClass("attached");
//       $bgImage.css("background-image","none");
//       $("#story").css("color","#666666");
//     },2);
//   });
// }