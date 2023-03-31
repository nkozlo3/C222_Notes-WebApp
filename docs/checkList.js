var checkListArray = [];

var listLoaded;
// on page load
window.onload = function () {
  // if local storage does not exist or is empty
  if (!localStorage.checkListArray || localStorage.checkListArray == "[]") {
    // return
    return;
  }
  // populate the checkListArray with the list from local storage
  checkListArray = JSON.parse(localStorage.getItem("checkListArray"));
  // load the list from local storage
  listLoaded = false;
};

// on click of 'newCheckBoxButton' button
document.getElementById("newCheckBoxButton").onclick = function () {
  // load the list from local storage
  if (!listLoaded) {
    loadList();
    listLoaded = true;
  }
};

// on click of 'clearStorage' button
document.getElementById("clearStorage").onclick = function () {
  // clear the list from local storage
  localStorage.clear();
  // clear the list from the page
  document.getElementById("checkList").innerHTML = "";
};

// on click of 'addItem' button
document.getElementById("checkListAdd").onclick = function () {
  // the new list string
  var listString = document.getElementById("checkListTitle").value;
  addListItem(listString);
};

// function to save a add a new list item
function addListItem(listString) {
  // if the input is empty
  if (listString == "") {
    // do nothing
    return;
  }
  // save the list item to local storage
  saveListItem(listString);

  // create a list item
  var item = document.createElement("li");
  item.innerHTML = listString;
  // create a close button
  var close = document.createElement("button");
  // set text for the close button to be an 'X'
  close.innerHTML = "X";
  close.className = "close";
  item.appendChild(close);

  // on click of the close button
  close.onclick = function () {
    // get the index of the list item
    var index = checkListArray.indexOf(listString);
    // remove the list item from the list
    item.remove();
  };

  // add the list item to the list
  document.getElementById("checkList").appendChild(item);
  input.value = "";

  // clear the input
  document.getElementById("checkListTitle").value = "";

  // on click of a list item
  item.onclick = function () {
    // if the item is checked
    if (item.style.textDecoration == "line-through") {
      // uncheck the item
      item.style.textDecoration = "none";
    } else {
      // check the item
      item.style.textDecoration = "line-through";
    }
  };
}

// function to save a list item to local storage with one argument, the list string
function saveListItem(listString) {
  // get the list from local storage
  checkListArray.push(listString);
  // save the updated list to local storage
  localStorage.setItem("checkListArray", JSON.stringify(checkListArray));
}

// function to load the list from local storage and add it to the page
function loadList() {
  // if the list does not exist in local storage or is empty
  if (!localStorage.checkListArray || localStorage.checkListArray == "[]") {
    return;
  }

  // get the list from local storage
  var storedList = JSON.parse(localStorage.checkListArray);
  // for each item in the list
  for (var i = 0; i < storedList.length; i++) {
    // create a list item
    var item = document.createElement("li");
    item.innerHTML = storedList[i];
    // add the list item to the list
    document.getElementById("checkList").appendChild(item);

    // on click of a list item
    item.onclick = function () {
      // if the item is checked
      if (item.style.textDecoration == "line-through") {
        // uncheck the item
        item.style.textDecoration = "none";
      } else {
        // check the item
        item.style.textDecoration = "line-through";
      }
    };
  }
}
