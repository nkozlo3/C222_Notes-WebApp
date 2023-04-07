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

// function to edit a list item
function editListItem(item) {
  var listString = item.innerHTML;
  var input = document.createElement("input");
  input.value = listString;
  item.innerHTML = "";
  item.appendChild(input);
  input.focus();
  input.addEventListener("keypress", function (e) {
    if (e.keyCode === 13) {
      saveListItem(item, input.value);
    }
  });
  input.addEventListener("blur", function () {
    saveListItem(item, input.value);
  });
}

// function to save a list item to local storage with one argument, the list string
function saveListItem(item, listString) {
  if (listString == "") {
    item.remove();
    return;
  }
  item.innerHTML = listString;
  var index = checkListArray.indexOf(listString);
  if (index > -1) {
    checkListArray[index] = listString;
  } else {
    checkListArray.push(listString);
  }
  localStorage.setItem("checkListArray", JSON.stringify(checkListArray));
}

// event listener for dragstart
function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.innerHTML);
  e.dataTransfer.effectAllowed = "move";
}

// event listener for dragover
function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

// event listener for drop
function drop(e) {
  e.preventDefault();
  var data = e.dataTransfer.getData("text/plain");
  e.target.innerHTML = data;
}

// event listener for dragend
function dragEnd(e) {
  // update the checkListArray and local storage accordingly
  var items = document.querySelectorAll("#checkList li");
  checkListArray = [];
  for (var i = 0; i < items.length; i++) {
    checkListArray.push(items[i].innerHTML);
  }
  localStorage.setItem("checkListArray", JSON.stringify(checkListArray));
}

function filterList() {
  // get the keyword from the search input
  var keyword = document.getElementById("searchInput").value.toLowerCase();
  // get all the list items
  var items = document.querySelectorAll("#checkList li");

  // loop through each list item
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    // get the text content of the list item and convert to lowercase
    var text = item.textContent.toLowerCase();
    // if the text content contains the keyword
    if (text.indexOf(keyword) > -1) {
      // show the list item
      item.style.display = "";
    } else {
      // hide the list item
      item.style.display = "none";
    }
  }
}

// function to load the list from local storage and add it to the page
function loadList() {
  // if the list does not exist in local storage or is empty
  if (!localStorage.checkListArray || localStorage.checkListArray == "[]") {
    return;
  }
  
  for (var i = 0; i < storedList.length; i++) {
  var item = document.createElement("li");
  item.innerHTML = storedList[i];
  item.draggable = true; // set the draggable attribute to true
  document.getElementById("checkList").appendChild(item);

  // add event listeners for drag and drop events
  item.addEventListener("dragstart", dragStart);
  item.addEventListener("dragover", dragOver);
  item.addEventListener("drop", drop);
  item.addEventListener("dragend", dragEnd);
  

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
