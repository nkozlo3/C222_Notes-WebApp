// listen for the click event on the text area with the id 'input'
document.getElementById("input").addEventListener("click", function () {
  // clear the textarea 
  document.getElementById("input").value = "";
  // hide the buttons with id 'newDrawingButton' and 'newCheckBoxButton'
  document.getElementById("newDrawingButton").style.display = "none";
  document.getElementById("newCheckBoxButton").style.display = "none";

  // create a button element
  let button = document.createElement("button");
  button.id = "save";
  button.innerText = "Save Note";

  // set the style of the button to position it properly, change its color, etc
  button.style.zIndex = 2;
  button.style.backgroundColor = "transparent";
  button.style.position = "absolute";
  button.style.top = "41.35%";
  button.style.left = "55.2%";
  button.style.width = "5%";
  button.style.height = "4%";
  button.style.fontSize = "75%";

  // set the style of the button on hover
  button.onmouseover = function () {
    button.style.cursor = "pointer";
    button.style.backgroundColor = "#0a908d";
  };
  // set the style of the button on mouse out
  button.onmouseout = function () {
    button.style.cursor = "default";
    button.style.backgroundColor = "transparent";
  };

  // append the button to the text area
  document.body.appendChild(button);
});

// when the textarea with id 'input' loses focus, remove the button with id 'save'
document.getElementById("input").addEventListener("blur", function () {
  document.getElementById("save").remove();
  // unhide the buttons with id 'newDrawingButton' and 'newCheckBoxButton'
  document.getElementById("newDrawingButton").style.display = "block";
  document.getElementById("newCheckBoxButton").style.display = "block";
});
