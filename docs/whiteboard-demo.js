(function draw() {
  let canvas = $(".whiteboard")[0];
  let context = canvas.getContext("whiteboardCanvas");
  let current = {
    //tracks attributes of the current mouse
    color: "black",
  };
  let drawing = false;

  //===============COLOR CHANGING / BUTTON STUFF===================//
  var colorBtn = "#color-btn";
  var clearBtn = "#clear-btn";

  function changeColor() {
    current.color = "#" + Math.floor(Math.random() * 16777215).toString(16); // change line color https://css-tricks.com/snippets/javascript/random-hex-color/
    colorBtn.css("border", "5px solid " + current.color); // change the button border color
  }

  function clearBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  colorBtn.on("click", changeColor);
  clearBtn.on("click", clearBoard);

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

  //eventlisteners that should track certain mouse movements
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);
});
