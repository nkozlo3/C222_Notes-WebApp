function draw() {
  const canvas = document.getElementById("whiteboardCanvas");
  const context = canvas.getContext("2d");

  context.canvas.width = window.innerWidth * 0.9;
  context.canvas.height = window.innerHeight * 0.9;

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

  // code for the square fill selection
  const generateSquareBtn = document.getElementById("generate-square-btn");
  const squareFillSelect = document.getElementById("square-fill-select");
  const squareSizeSelect = document.getElementById("square-size-select");
  const squareAmountSelect = document.getElementById("square-amount-select");

  generateSquareBtn.addEventListener("click", () => {
    const squareSize = squareSizeSelect.value;
    const squareFill = squareFillSelect.value;
    const squareAmount = squareAmountSelect.value;
    let squareDimension;

    // Set square dimension based on the selected size
    switch (squareSize) {
      case "small":
        squareDimension = 50;
        break;
      case "medium":
        squareDimension = 100;
        break;
      case "large":
        squareDimension = 200;
        break;
      default:
        squareDimension = 100;
    }
    for (let i = 0; i < squareAmount; i++) {
      drawSquare(context, squareDimension, squareFill);
    }
  });

  function drawSquare(context, dimension, fill) {
    // Generate random x and y coordinates within the canvas
    const x = Math.random() * (context.canvas.width - dimension);
    const y = Math.random() * (context.canvas.height - dimension);

    context.beginPath();
    context.rect(x, y, dimension, dimension);

    if (fill === "filled") {
      context.fillStyle = current.color;
      context.fill();
    }

    context.strokeStyle = current.color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
  }
}

draw();
