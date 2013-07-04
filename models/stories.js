/* ==========================================================================
   Stories
   ========================================================================== */

/*
  Each story is represented by a document in the Stories collection:
    owner:   user id
    created: unix timestamp of when this was created
    date:    date this journal entry refers to
    text:    the actual text of the object
    img:     an image object from filepicker OR url
    public:  wheter or not this is publically viewable
*/
Stories = new Meteor.Collection("stories");

// Permissions
Stories.allow({
  // Insert: Not allowed. Must use createStory method.
  // Update: Only allow if you are the owner.
  // Remove: Not allowed. Must use destroyStory method.
  remove: function () {
    // can only remove your own documents
    return true;
  },
});