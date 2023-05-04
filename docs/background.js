// on load of the page, clear the textarea
document.getElementById("input").value = "";

// set the background of the page to a light green
document.body.style.backgroundColor = "#d1f2eb";
// slightly darker green:

// hide the non-default divs
document.getElementById("drawingDiv").style.display = "none";
document.getElementById("drawing_overlay").style.display = "none";
document.getElementById("color-preview").style.display = "none";
document.getElementById("checkListDiv").style.display = "none";
// hide the div with id 'drawing_overlay'. We do not want to show this until the user wants to draw
document.getElementById("drawing_overlay").style.display = "none";

// hide the button with id 'saveButton'
document.getElementById("saveButton").style.display = "none";

// create a script element so we only draw when the user wants to
var script = document.createElement("script");
script.src = "webgl-demo.js";

// listen for the click event on the text area with the id 'input'
document.getElementById("input").addEventListener("click", function () {
  // hide the buttons with id 'newDrawingButton' and 'newCheckBoxButton'
  document.getElementById("newDrawingButton").style.display = "none";
  document.getElementById("newCheckBoxButton").style.display = "none";

  // create a button element
  let button = document.getElementById("saveButton");
  // display the button with id 'saveButton'
  button.style.display = "block";
  button.id = "saveButton";
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
  // hide the button with id 'saveButton'
  document.getElementById("saveButton").style.display = "none";
  // unhide the buttons with id 'newDrawingButton' and 'newCheckBoxButton'
  document.getElementById("newDrawingButton").style.display = "block";
  document.getElementById("newCheckBoxButton").style.display = "block";
});

// when we start creating a new drawing:
document
  .getElementById("newDrawingButton")
  .addEventListener("click", function () {
    // hide irrelevant divs
    document.getElementById("defaultDiv").style.display = "none";
    document.getElementById("drawingDiv").style.display = "block";
    document.getElementById("color-preview").style.display = "block";

    // set the div with id 'drawing_overlay' to be visible
    document.getElementById("drawing_overlay").style.display = "block";
    // append the script file "webgl-demo.js" to the body
    document.body.appendChild(script);
  });

document.getElementById("saveDrawing").addEventListener("click", function () {
  // TODO: figure out how to save the drawing so it can be retrieved later
  document.getElementById("defaultDiv").style.display = "block";
  document.getElementById("drawingDiv").style.display = "none";
  document.getElementById("drawing_overlay").style.display = "none";
  // remove the script file "webgl-demo.js" from the body
  document.body.removeChild(script);
  // refresh the page to clear the canvas
  location.reload();
});

document.getElementById("saveCheckList").addEventListener("click", function () {
  document.getElementById("defaultDiv").style.display = "block";
  document.getElementById("checkListDiv").style.display = "none";
});

// when we start creating a new checklist:
document
  .getElementById("newCheckBoxButton")
  .addEventListener("click", function () {
    document.getElementById("defaultDiv").style.display = "none";
    document.getElementById("checkListDiv").style.display = "block";
  });
