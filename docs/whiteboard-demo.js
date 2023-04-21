function draw() {
  const canvas = document.getElementById("whiteboardCanvas");
  const context = canvas.getContext("2d");

  context.canvas.width = window.innerWidth * 0.9;
  context.canvas.height = window.innerHeight * 0.9;

  // Store the selected rectangle's coordinates and size
  let selectionRect = null;

  // Array of rectangles to be drawn on the canvas
  let rectangles = [];

  var current = {
    //tracks attributes of the current mouse
    color: `hsl(0,0%,0%)`,
    lineWidth: 2,
  };
  var drawing = false;

  // Custom color picker
  const colorSlider = document.getElementById("color-slider");
  const colorPreview = document.getElementById("color-preview");

  colorSlider.addEventListener("input", () => {
    const hue = colorSlider.value;
    const saturation = 100;
    const lightness = 50;
    const hslColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    current.color = hslColor; // Update color variable with new HSL values
    colorPreview.style.backgroundColor = hslColor; // Update preview color
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
    current.color = `hsl(0,0%,100%)`;
    current.lineWidth = 10;
  });
  paintBrushBtn.addEventListener("click", () => {
    current.color = `hsl(0,0%,0%)`;
    current.lineWidth = 2;
  });
  increaseSize.addEventListener("click", () => {
    current.lineWidth += 10;
  });

  // Add a button to copy the selected rectangle
  var copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", () => {
    // If a rectangle is selected, create a copy of it and add it to the rectangles array
    if (selectionRect) {
      rectangles.push({
        x: selectionRect.x + 10,
        y: selectionRect.y + 10,
        width: selectionRect.width,
        height: selectionRect.height,
        color: selectionRect.color,
      });
      // Redraw the canvas with the new rectangle
      drawRectangles();
    }
  });

  // Add a button to delete the selected rectangle
  var deleteBtn = document.getElementById("delete-btn");
  deleteBtn.addEventListener("click", () => {
    // If a rectangle is selected, remove it from the rectangles array and redraw the canvas
    if (selectionRect) {
      rectangles = rectangles.filter((rect) => rect !== selectionRect);
      selectionRect = null;
      drawRectangles();
    }
  });

  //eventlisteners that should track certain mouse movements
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

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
