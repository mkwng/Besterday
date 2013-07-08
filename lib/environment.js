dateSetOnce = false; // Initialize the fact that no date has ever been set.
sessionId = undefined;
sessionScreenName = undefined;


// http://stackoverflow.com/questions/135448/how-do-i-check-to-see-if-an-object-has-a-property-in-javascript
hasOwnProperty = function(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}