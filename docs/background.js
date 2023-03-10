// on load of the page, clear the textarea
document.getElementById("input").value = "";

// set the background of the page to a light green
document.body.style.backgroundColor = "#d1f2eb";
// slightly darker green:

// create a save drawing button and append it to the body
let button = document.createElement("button");
button.id = "saveDrawing";
button.innerText = "Save Drawing";
button.style.zIndex = 2;
button.style.backgroundColor = "transparent";
button.style.position = "absolute";
button.style.top = "92.35%";
button.style.left = "87.2%";
button.style.width = "5%";
button.style.height = "4%";
button.style.fontSize = "75%";

button.onmouseover = function () {
  button.style.cursor = "pointer";
  button.style.backgroundColor = "#0a908d";
};
button.onmouseout = function () {
  button.style.cursor = "default";
  button.style.backgroundColor = "transparent";
};
document.body.appendChild(button);

// hide the save drawing button
document.getElementById("saveDrawing").style.display = "none";

// create a script element so we only draw when the user wants to
var script = document.createElement("script");
script.src = "webgl-demo.js";

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

document
  .getElementById("newDrawingButton")
  .addEventListener("click", function () {
    document.getElementById("input").style.display = "none";
    document.getElementById("newDrawingButton").style.display = "none";
    document.getElementById("newCheckBoxButton").style.display = "none";
    document.getElementById("saveDrawing").style.display = "block";
    // append the script file "webgl-demo.js" to the body
    document.body.appendChild(script);
  });

document.getElementById("saveDrawing").addEventListener("click", function () {
  // TODO: figure out how to save the drawing as a png. I believe we can use the FileSaver.js library which I imported
  document.getElementById("input").style.display = "block";
  document.getElementById("newDrawingButton").style.display = "block";
  document.getElementById("newCheckBoxButton").style.display = "block";
  document.getElementById("saveDrawing").style.display = "none";
  // remove the script file "webgl-demo.js" from the body
  document.body.removeChild(script);
  // refresh the page to clear the canvas
  location.reload();
});
