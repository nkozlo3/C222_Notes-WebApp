// Set up an array of objects to hold the notes in local storage
// Each note will be an object with a title and text property

var notes = [];
// pull the notes from local storage if they exist
if (localStorage.getItem("notes")) {
  notes = JSON.parse(localStorage.getItem("notes"));
}
// else save the notes array to local storage
else {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// add a note to the notes array
function addNote() {
    // get the title and text from the text area
    var title = "ksafjalksdf";
    var text = "document.getElementById(input).value";
    // create a new note object
    var note = {
        title: title,
        text: text
    };
    // add the note to the notes array
    notes.push(note);
    // save the notes array to local storage
    localStorage.setItem("notes", JSON.stringify(notes));
}