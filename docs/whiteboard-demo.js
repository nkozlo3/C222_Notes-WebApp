function draw() {
  const canvas = document.getElementById("whiteboardCanvas");
  const context = canvas.getContext("2d");

  context.canvas.width = window.innerWidth * 0.9;
  context.canvas.height = window.innerHeight * 0.9;

  var current = {
    //tracks attributes of the current mouse
    color: "black",
    lineWidth: 2,
  };
  var drawing = false;

  // color picker
  var colorPicker = new window.iro.ColorPicker("#wheelPicker", {
    width: 150,
    color: "rgb(255, 0, 0)",
    borderWidth: 1,
    borderColor: "#fff",
    layout: [
      {
        component: iro.ui.Wheel,
        options: {},
      },
    ],
  });
  colorPicker.on("color:change", function (color1) {
    // change current color to hexwheel
    current.color = color1.hexString;
  });

  //===============COLOR CHANGING / BUTTON STUFF===================//
  var clearBtn = document.getElementById("clear-btn");
  var enableEraserBtn = document.getElementById("eraser-btn");
  var paintBrushBtn = document.getElementById("paintbrush-btn");
  var increaseSize = document.getElementById("brush-size-btn");

  //eventlisteners for buttons
  clearBtn.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
  enableEraserBtn.addEventListener("click", () => {
    current.color = "white";
    current.lineWidth = 10;
  });
  paintBrushBtn.addEventListener("click", () => {
    current.color = "black";
    current.lineWidth = 2;
  });
  increaseSize.addEventListener("click", () => {
    current.lineWidth += 10;
  });

  //eventlisteners that should track certain mouse movements
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  // var colorBtn = document.getElementById("color-btn");
  // function changeColor() {
  //   var c = "#" + Math.floor(Math.random() * 16777215).toString(16); // change line color https://css-tricks.com/snippets/javascript/random-hex-color/
  //   current.color = c;
  //   var existingStyle = colorBtn.getAttribute("style");
  //   colorBtn.setAttribute("style", existingStyle + "; background-color: " + c);
  // }

  //===============DRAW ON MOUSE MOVE STUFF===================//
  function drawLine(x0, y0, x1, y1, color) {
    context.beginPath();
    context.moveTo(x0, y0); //x0, y0 is the starting mouse position
    context.lineTo(x1, y1); //x1, y1 is the ending mouse position
    context.strokeStyle = color;
    context.lineWidth = current.lineWidth;
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

// was trying to integrate this into webgl-demo.js
// //change the color of pixel_brush_color if the the person changes the color on the wheel
// //color picker
// var colorPicker = new window.iro.ColorPicker("#colorPicker", {
//   width: 100,
//   color: "rgb(255, 0, 0)",
//   borderWidth: 1,
//   borderColor: "#fff",
//   layout: [
//     {
//       component: iro.ui.Wheel,
//     },
//   ],
// });
// //event listener
// colorPicker.on("color:change", function (color1) {
//   // change current color to hexwheel
//   pixel_brush_color.color = [color1.r, color1.g, color1.b];
// });
