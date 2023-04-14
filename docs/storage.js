var notesArray = [];

let button = document.getElementById("saveButton");

// on page load
window.onload = function () {
  // if local storage does not exist or is empty
  if (!localStorage.notesArray || localStorage.notesArray == "[]") {
    // return
    return;
  }
  // populate the notesArray with the list from local storage
  notesArray = JSON.parse(localStorage.getItem("notesArray"));

  // load the list from local storage
  loadNotes();
};

// on click of 'saveButton' button
document.getElementById("input").addEventListener("blur", function () {
  // if the input is empty, do nothing
  if (document.getElementById("input").value == "") {
    return;
  }
  // the new list string
  var note = document.getElementById("input").value;
  addListItem(note);
});

// function to save a add a new list item
function addListItem(listString) {
  // if the input is empty
  if (listString == "") {
    // do nothing
    return;
  }
  // save the list item to local storage
  saveNote(listString);
  // clear the input
  document.getElementById("input").value = "";
}

// function to save a list item to local storage with one argument, the list string
function saveNote(listString) {
  // get the list from local storage
  var storedNotes = JSON.parse(localStorage.getItem("notesArray"));

  storedNotes.push(listString);
  // save the updated list to local storage
  localStorage.setItem("notesArray", JSON.stringify(storedNotes));
}

// function to load the list from local storage and add it to the page
function loadNotes() {
  // if the list does not exist in local storage or is empty
  if (!localStorage.notesArray || localStorage.notesArray == "[]") {
    return;
  }
  // get the list from local storage
  var storedNotes = JSON.parse(localStorage.getItem("notesArray"));
  
  // for each item in the list
  var str = "";
  for (var i = 0; i < storedNotes.length; i++) {
    // Differentiate between notes with a label for each note i.e. Note 1, Note 2, etc.
    var label = "\n" + "Note " + (i + 1) + ":" + "\n";
    str += label;
    str += storedNotes[i];
  }
  document.getElementById("retrievedNotes").value = str;
}

document.getElementById("clearNotesButton").onclick = function () {
  alert("clearNotesButton clicked");
  // remove everything from notesArray
  var clearedNotes = [];
  // save the updated list to local storage
  localStorage.setItem("notesArray", JSON.stringify(clearedNotes));
  // clear the input
  document.getElementById("retrievedNotes").value = "";
};