// on click of 'addItem' button
document.getElementById("checkListAdd").onclick = function () {
  // if the input is empty
  if (document.getElementById("checkListTitle").value == "") {
    // do nothing
    return;
  }

  var item = document.createElement("li");
  var input = document.getElementById("checkListTitle");
  item.innerHTML = input.value;
  document.getElementById("checkList").appendChild(item);
  input.value = "";

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
};
