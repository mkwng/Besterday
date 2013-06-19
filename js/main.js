window.hoodie  = new Hoodie()

var today = new Date();
var stories;
var currentStory;
var targetDate = today;
var $login = $("#login");
var $journal = $("#journal");
var $story = $("#story");
var $currentDay = $("#journal label em");
var $account = $(".account");

$(document).ready(function() {
  if(hoodie.account.username) view("journal");
  else view("login");
});



//////////////////////// GLOBAL ////////////////////////

var pageNames = ["login","journal","dashboard"];
// Navigate.
function view(page) {
  switch(page) {
    case "login":
      $journal.fadeOut(function() {
        $account.find(".account-uid span").html("Sign in");
        hoodie.account.signOut();
        $login.fadeIn()
      });
      break;
    case "journal":
      if(hoodie.account.username){
        $account.find(".account-uid span").html(hoodie.account.username);
        stories = loadStories();
        $login.fadeOut(function() {
          loadDay();
          $journal.fadeIn();
        });
      } else displayWarning("Not logged in.");
      break;
    case "dashboard":
      break;
  }
}

hoodie.account.on('unauthenticated', function() {
  view("login");
});

function displayMessage(msg) {
  console.log(msg);
}
function displayWarning(msg) {
  alert(msg);
}


//////////////////////// LOGIN ////////////////////////

// Logging in.
$login.submit(function(e) {
  e.preventDefault();
  hoodie.account.signIn($("#uid").val(),$("#pwd").val())
    .done(function() {
      displayMessage('Hello, ' + hoodie.account.username);
      view("journal");
    })
    .fail(function() {
      displayWarning("Login fail.");
    });
});

// Creating a new account.
$("#create").click(function(e) {
  e.preventDefault();
  hoodie.account.signUp($("#uid").val(),$("#pwd").val())
    .done(function() {
      displayMessage("Account created!");
      $login.submit();
    })
    .fail(function() {
      displayWarning("Could not create account for some reason...");
    });
});


//////////////////////// JOURNAL ////////////////////////

// Submitting a new story to the journal
$journal.submit(function(e) {
  e.preventDefault();

  if(!currentStory.length) {
    hoodie.store.add('story',{
      date:   targetDate,
      text:   $story.val()
    });
    $journal.find("input").attr("value","Update");
  } else {
    hoodie.store.update('story',currentStory[0].id,{
      text:   $story.val()
    });
  }
  $(".disable-cover").stop().fadeIn();
});

// Response once a new story is added
hoodie.store.on('add:story', function() {
  stories = loadStories();
  // console.log(stories);
  displayMessage("New story added.");
  loadStory(targetDate);
  $(".disable-cover").stop().fadeOut();
});
hoodie.store.on('update:story', function() {
  stories = loadStories();
  // console.log(stories);
  displayMessage("Updated a story.");
  loadStory(targetDate);
  $(".disable-cover").stop().fadeOut();
});

// Loads all stories from the logged in user.
function loadStories() {
  var stories;
  hoodie.store.findAll("story").done(function(objects) {
    stories = objects;
  });
  return stories;
}

function loadStory(date) {
  return stories.filter(function(o) {
    var storyDate = new Date(o.date);
    return sameDay(storyDate,date);
  });
}

// This replaces the content of the journal with specified date. If no date, then today.
function loadDay(date) {
  // If there's no date parameter, we assume today.
  targetDate = typeof date=="undefined" ? new Date(today) : new Date(date);
  $currentDay.css("opacity","0").html(prettyDate(targetDate)).stop().animate({"opacity":1});

  // Find if there is already an entry for this date.
  currentStory = loadStory(targetDate);
  if(currentStory.length) {
    // console.log("There is at least one story for this day");
    $journal.find("input").attr("value","Update");
    fillDay(currentStory);
  } else {
    // console.log("No stories for this day");
    $("#story").val("");
    $journal.find("input").attr("value","Save");
  }

  // This actually fills in the DOM elements with the content.
  function fillDay(currentStory) {
    $("#story").val(currentStory[0].text);
  }
}

// Compare two days to see if they're the same
function sameDay(date1,date2) {
    return  date1.getFullYear() == date2.getFullYear() && 
            date1.getMonth() == date2.getMonth() && 
            date1.getDate() == date2.getDate();
}

// Navigating between days
$(".next").click(function() {
  loadDay(targetDate.setDate(targetDate.getDate() + 1));
});
$(".prev").click(function() {
  loadDay(targetDate.setDate(targetDate.getDate() - 1));
});