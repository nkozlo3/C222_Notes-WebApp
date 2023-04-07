var notesArray = [];

let button = document.getElementById("saveButton");

// on page load
window.onload = function () {
  // if local storage does not exist or is empty
  if (!localStorage.myNotesArray || localStorage.myNotesArray == "[]") {
    // return
    return;
  }
  // populate the myNotesArray with the list from local storage
  notesArray = JSON.parse(localStorage.getItem("myNotesArray"));
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
  alert(note);
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
  notesArray.push(listString);
  // save the updated list to local storage
  localStorage.setItem("myNotesArray", JSON.stringify(notesArray));
}

// function to load the list from local storage and add it to the page
function loadNotes() {
  // if the list does not exist in local storage or is empty
  if (!localStorage.myNotesArray || localStorage.myNotesArray == "[]") {
    return;
  }
  // TODO: load list neatly using webgl
}
