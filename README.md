Besterday
=========

An app that lets you record the best parts of every day.


## To install

Install meteorite. Run it.


## Useful global variables to know
**Story Session Variables**

`"session_user"` : The userId of the FOCUSED USER

`"session_date"` : Object with discrete date of FOCUSED DATE


**Session-Dependent Variables**

`sessionScreenname` : The username of the FOCUSED USER

`sessionId` = If exists, ID of FOCUSED STORY

`story` : If exists, FOCUSED STORY object based on the FOCUSED USER and FOCUSED DATE

`user` : If exists, the FOCUSED USER object

None of these variables should ever be set outside of `setDate()`.

Never use database calls to get info outside of `setDate()`, these objects should be enough.


**UI State Session Variables:**

`"state_edit"`

`"state_storytime"`


**Status Session Variables:**

`"status_userdata"`

`"status_storydata"`


**Preferences:**

`"pref_gridcount"`


##Code Style

All aesthetic states go under _ui.js