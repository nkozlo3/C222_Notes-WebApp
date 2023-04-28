const checkListArray = [];

// Load the list from local storage on page load
window.onload = function () {
  const storedList = JSON.parse(localStorage.getItem("checkListArray"));
  if (Array.isArray(storedList) && storedList.length) {
    checkListArray.push(...storedList);
    loadList();
  }
};

// Add a new list item on click of 'newCheckBoxButton' button
document.getElementById("newCheckBoxButton").onclick = function () {
  const input = document.getElementById("checkListTitle");
  const listString = input.value.trim();
  input.value = "";
  addListItem(listString);
};

// Clear the list from local storage and the page on click of 'clearStorage' button
document.getElementById("clearStorage").onclick = function () {
  localStorage.removeItem("checkListArray");
  document.getElementById("checkList").innerHTML = "";
};

// Add a new list item on click of 'addItem' button
document.getElementById("checkListAdd").onclick = function () {
  const input = document.getElementById("checkListTitle");
  const listString = input.value.trim();
  input.value = "";
  addListItem(listString);
};

// Add a new list item
function addListItem(listString) {
  if (listString === "") {
    return;
  }
  checkListArray.push(listString);
  saveListToLocalStorage();
  const item = createListItem(listString);
  document.getElementById("checkList").appendChild(item);
}

// Edit a list item on double click
function editListItem(item) {
  const listString = item.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = listString;
  item.innerHTML = "";
  item.appendChild(input);
  input.focus();
  input.addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {
      saveListItem(item, input.value.trim());
    }
  });
  input.addEventListener("blur", function () {
    saveListItem(item, input.value.trim());
  });
}

// Save a list item to local storage
function saveListItem(item, listString) {
  if (listString === "") {
    item.remove();
    return;
  }
  item.innerHTML = listString;
  const index = checkListArray.indexOf(listString);
  if (index > -1) {
    checkListArray[index] = listString;
  } else {
    checkListArray.push(listString);
  }
  saveListToLocalStorage();
}

// Create a list item element
function createListItem(listString) {
  const item = document.createElement("li");
  item.textContent = listString;
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.className = "close";
  closeButton.onclick = function () {
    const index = checkListArray.indexOf(listString);
    checkListArray.splice(index, 1);
    saveListToLocalStorage();
    item.remove();
  };
  item.appendChild(closeButton);
  item.ondblclick = function () {
    editListItem(item);
  };
  item.onclick = function () {
    item.classList.toggle("checked");
  };
  return item;
}

// Save the current list to local storage
function saveListToLocalStorage() {
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
