
/*
  Session variables:
    session_user:   User whose stories we're requesting
    session_date:   The date of the story we're requesting
    show_sidebar:   Whether or not to show the sidebar
    pub_loaded:     Has public data loaded yet?
    user_loaded:    Has user data loaded yet?
*/
// Non-reactive session variables.
sessionId = undefined;
sessionScreenName = undefined;
dateSetOnce = false; // Initialize the fact that no date has ever been set.


// http://stackoverflow.com/questions/135448/how-do-i-check-to-see-if-an-object-has-a-property-in-javascript
hasOwnProperty = function(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}