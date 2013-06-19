// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

(function( $ ) {
$.fn.wordCount = function() {
    var phrase = alphanumeric(this.val());
    var number = 0;
    var matches = phrase.match(/\b/g);
    if(matches) number = matches.length/2;
    return number;
}
})( jQuery );


/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */
var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
    console.log(time);
    // var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
    var date = time;
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 7 )
        return dayNames[date.getDay()] + ", " + monthNames[date.getMonth()] + " " + date.getDate();
            
    return day_diff == 0 && (
            diff < 60 && "today" ||
            diff < 120 && "today" ||
            diff < 3600 && "today" ||
            diff < 7200 && "today" ||
            diff < 86400 && "today") ||
        day_diff == 1 && "yesterday" ||
        day_diff < 7 && dayNames[date.getDay()];
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" )
    jQuery.fn.prettyDate = function(){
        return this.each(function(){
            var date = prettyDate(this.title);
            if ( date )
                jQuery(this).text( date );
        });
    };