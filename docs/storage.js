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
  for (var i = 0; i < storedNotes.length; i++) {
    // if this item's value is empty, continue to the next item
    if (storedNotes[i] == "") {
      continue;
    }

    // create a new textarea with id 'retrievedNotes'
    var retrievedNotes = document.createElement("textarea");
    retrievedNotes.id = "retrievedNotes" + i;
    retrievedNotes.class = "retrievedNotes";
    retrievedNotes.value = storedNotes[i];
    retrievedNotes.className = "retrievedNotes";
    // add the new textarea to the page
    document.getElementById("notesWrapper").prepend(retrievedNotes);

    // give the textarea an onblur event listener
    retrievedNotes.addEventListener("blur", function () {
      // get the index of the list item
      var index = this.id;

      // if this item's value is not empty
      if (this.value != "") {
        // remove the list item from local storage
        storedNotes.splice(index, 1);
        storedNotes.push(this.value);
      } else {
        storedNotes.splice(index, 1);
      }

      // save the updated list to local storage
      localStorage.setItem("notesArray", JSON.stringify(storedNotes));
    });
  }
}
