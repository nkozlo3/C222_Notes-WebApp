const canvas = document.querySelector('canvas');
const gl = canvas.getContext("webgl", {antialias: false});
if (!gl) {
  throw new Error('webgl is not supported');
}

const vertexData = [
  // Front
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, -.5, 0.5,

  // Left
  -.5, 0.5, 0.5,
  -.5, -.5, 0.5,
  -.5, 0.5, -.5,
  -.5, 0.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, -.5,

  // Back
  -.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, 0.5, -.5,
  0.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, -.5, -.5,

  // Right
  0.5, 0.5, -.5,
  0.5, -.5, -.5,
  0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  0.5, -.5, -.5,

  // Top
  0.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, -.5,

  // Bottom
  0.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, -.5,
];


let colorData = [];
for (let face = 0; face < 6; face++) {
    let faceColor = [Math.random(), Math.random(), Math.random()];
    for (let vertex = 0; vertex < 6; vertex++) {
        colorData.push(...faceColor);
    }
}

//Buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

//Vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main()
{
  vColor = color;
  gl_Position = matrix * vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

//Fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main()
{
  gl_FragColor = vec4(vColor, 1);
}
`);
gl.compileShader(fragmentShader);

//Use these shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

//Attributes - these are in the vertex shader
const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, 'color');
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, 'matrix'),
};

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
  Math.PI/2,
  canvas.width/canvas.height,
  0.03,
  1000
);

const viewMatrix = mat4.create();
mat4.translate(viewMatrix, viewMatrix, [0,0,1]);
mat4.invert(viewMatrix, viewMatrix);

const modelMatrix = mat4.create();
mat4.translate(modelMatrix, modelMatrix, [0,0,-1.5]);

const mvMatrix = mat4.create();

const mvpMatrix = mat4.create();

gl.clearColor(0.4,0.6,.7,1);

//gl.sampleCoverage(0.2, false);
//gl.enable(gl.SAMPLE_COVERAGE);

function animate()
{
  //update
  mat4.rotateZ(modelMatrix, modelMatrix, 0.001);
  mat4.rotateY(modelMatrix, modelMatrix, 0.001);
  mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
  mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

  gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
  
  //draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

  //loop
  requestAnimationFrame(animate);
}
animate();