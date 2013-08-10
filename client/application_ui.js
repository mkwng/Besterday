
resizeHousekeeping = function() {
    $("#story").cssPersist("width","100%").verticalCenter(true);
    setTimeout(function(){
      $("#story").cssPersist("width","+="+getScrollBarWidth());
    },0);

    if(Meteor.Router.page()=="profile") gridHousekeeping();
}