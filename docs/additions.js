const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

let color = '#000000';
ctx.strokeStyle = color;
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    const [x, y] = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.stroke();
    [lastX, lastY] = [x, y];
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
  isDrawing = false;
});

const colors = document.querySelectorAll('.color');
colors.forEach(colorBtn => {
  colorBtn.addEventListener('click', () => {
    color = colorBtn.dataset.color;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  });
});

const eraser = document.querySelector('.eraser');
eraser.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const textbox = document.querySelector('.textbox');
textbox.addEventListener('click', () => {
  const text = prompt('Enter your text:');
  if (text) {
    ctx.fillStyle = color;
    ctx.font = '20px Comic Sans MS';
    ctx.fillText(text, lastX, lastY);
  }
});

const postit = document.querySelector('.square');
postit.addEventListener('click', () => {
  const [x, y] = [lastX, lastY];
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 50, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Comic Sans MS';
  ctx.fillText('Type here', x + 5, y + 25);
  canvas.addEventListener('click', handleClick);
});

function handleClick(event) {
  const [x, y] = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop];
  if (x >= lastX && x <= lastX + 50 && y >= lastY && y <= lastY + 50) {
    canvas.removeEventListener('click', handleClick);
    const text = prompt('Type inside your sticky note:');
    if (text) {
      ctx.fillStyle = color;
      ctx.font = '20px Comic Sans MS';
      ctx.fillText(text, lastX + 5, lastY + 25);
    }
  }
}
