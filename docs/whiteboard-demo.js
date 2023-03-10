function draw() {
  const canvas = document.getElementById("whiteboardCanvas");
  const context = canvas.getContext("2d");

  context.canvas.width = window.innerWidth;
  context.canvas.height = window.innerHeight;

  var current = {
    //tracks attributes of the current mouse
    color: "black",
  };
  var drawing = false;

  //===============COLOR CHANGING / BUTTON STUFF===================//
  var colorBtn = document.getElementById("color-btn");
  var clearBtn = document.getElementById("clear-btn");

  //eventlisteners for buttons
  colorBtn.addEventListener("click", changeColor);
  clearBtn.addEventListener("click", clearBoard);

  //eventlisteners that should track certain mouse movements
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  function changeColor() {
    var c = "#" + Math.floor(Math.random() * 16777215).toString(16); // change line color https://css-tricks.com/snippets/javascript/random-hex-color/
    current.color = c;
    var existingStyle = colorBtn.getAttribute("style");
    colorBtn.setAttribute("style", existingStyle + "; background-color: " + c);
  }

  // was going to try setting up a test for this function but getting weird errors with jest
  // saying that the canvas.getContext is null...
  // function changeColorRed() {
  //   current.color = "red";
  //   colorBtn.css("border", "5px solid " + current.color); // change the button border color
  // }

  function clearBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  //===============DRAW ON MOUSE MOVE STUFF===================//
  function drawLine(x0, y0, x1, y1, color) {
    context.beginPath();
    context.moveTo(x0, y0); //x0, y0 is the starting mouse position
    context.lineTo(x1, y1); //x1, y1 is the ending mouse position
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
  }

  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color);
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color);
    current.x = e.clientX;
    current.y = e.clientY;
  }
}

draw();
