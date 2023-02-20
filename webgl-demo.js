//track mouse position
let mouse_pos = { x: undefined, y: undefined };
window.addEventListener('pointermove', (event) => {
  mouse_pos = { x: event.clientX, y: event.clientY };
});

document.getElementById("glcanvas").height = window.innerHeight;
document.getElementById("glcanvas").width = window.innerWidth;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext("webgl", {antialias: false});
if (!gl) {
  throw new Error('Webgl is not supported');
}

//initialize cube data
let cube_vertex_data = [
  //front
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  -.5, -.5, 0.5,

  //left
  -.5, 0.5, 0.5,
  -.5, -.5, 0.5,
  -.5, 0.5, -.5,
  -.5, 0.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, -.5,

  //back
  -.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, 0.5, -.5,
  0.5, 0.5, -.5,
  -.5, -.5, -.5,
  0.5, -.5, -.5,

  //right
  0.5, 0.5, -.5,
  0.5, -.5, -.5,
  0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
  0.5, -.5, 0.5,
  0.5, -.5, -.5,

  //top
  0.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, 0.5,
  -.5, 0.5, 0.5,
  0.5, 0.5, -.5,
  -.5, 0.5, -.5,

  //bottom
  0.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, 0.5,
  -.5, -.5, 0.5,
  0.5, -.5, -.5,
  -.5, -.5, -.5,
];
let cube_color_data = [];
for (let face = 0; face < 6; face++) {
    let faceColor = [Math.random(), Math.random(), Math.random()];
    for (let vertex = 0; vertex < 6; vertex++) {
        cube_color_data.push(...faceColor);
    }
}

//buffers
let cube_position_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_vertex_data), gl.STATIC_DRAW);

let cube_color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cube_color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_color_data), gl.STATIC_DRAW);

//vertex shader
let cube_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(cube_vertex_shader, `
precision mediump float;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main()
{
  vColor = color;
  //outputs to clip-space?
  gl_Position = matrix * vec4(position, 1);
}
`);
gl.compileShader(cube_vertex_shader);

//fragment shader
let cube_frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(cube_frag_shader, `
precision mediump float;
varying vec3 vColor;

void main()
{
  gl_FragColor = vec4(vColor, 1);
}
`);
gl.compileShader(cube_frag_shader);

//link the shader program
let cube_shader_program = gl.createProgram();
gl.attachShader(cube_shader_program, cube_vertex_shader);
gl.attachShader(cube_shader_program, cube_frag_shader);
gl.linkProgram(cube_shader_program);

//attributes - these are in the vertex shader
let cube_pos_attrib_loc = gl.getAttribLocation(cube_shader_program, 'position');
gl.enableVertexAttribArray(cube_pos_attrib_loc);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.vertexAttribPointer(cube_pos_attrib_loc, 3, gl.FLOAT, false, 0, 0);

let cube_col_attrib_loc = gl.getAttribLocation(cube_shader_program, 'color');
gl.enableVertexAttribArray(cube_col_attrib_loc);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_color_buffer);
gl.vertexAttribPointer(cube_col_attrib_loc, 3, gl.FLOAT, false, 0, 0);

let cube_matrix_uniform = gl.getUniformLocation(cube_shader_program, 'matrix');

//creating a second shader program to test rendering multiple================================================================================

//vertex shader
let v_shader_2 = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(v_shader_2, `
precision mediump float;
attribute vec3 position;
uniform mat4 matrix;

void main()
{
  gl_Position = matrix * vec4(position, 1);
}
`);
gl.compileShader(v_shader_2);

//fragment shader
let f_shader_2 = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(f_shader_2, `
precision mediump float;

void main()
{
  gl_FragColor = vec4(1, 0., 0.5, 1);
}
`);
gl.compileShader(f_shader_2);

//link the shader program
let shader_program_2 = gl.createProgram();
gl.attachShader(shader_program_2, v_shader_2);
gl.attachShader(shader_program_2, f_shader_2);
gl.linkProgram(shader_program_2);

//attributes - these are in the vertex shader
let pos_attrib_loc_2 = gl.getAttribLocation(shader_program_2, 'position');
gl.enableVertexAttribArray(pos_attrib_loc_2);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.vertexAttribPointer(pos_attrib_loc_2, 3, gl.FLOAT, false, 0, 0);

let matrix_2 = gl.getUniformLocation(shader_program_2, 'matrix');

//=========================================================================================

//initialize matrices
let cube_model_mat = mat4.create();
mat4.translate(cube_model_mat, cube_model_mat, [0,0,-3]);

let mouse_model_matr = mat4.create();
mat4.translate(mouse_model_matr, mouse_model_matr, [0,0,-3]);
mat4.scale(mouse_model_matr,mouse_model_matr, [0.5,0.5,0.5]);

//perspective matrix - gives proper 3D perspective when rendering
let camera_proj_mat = mat4.create();
mat4.perspective(camera_proj_mat, Math.PI/2, canvas.width/canvas.height, 0.03, 1000);

//camera view matrix - represents the actual transform of the camera
let camera_view_mat = mat4.create();
mat4.translate(camera_view_mat, camera_view_mat, [0,0,0]);

//these are used every frame to convert vertices from world space to clip space
let current_MV_matr = mat4.create();
let currentMVP_matr = mat4.create();

//initialize some state
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.8, 0.9, .82, 1);
let time = 0;

//define the animation loop
function animate()
{
  //update
  time += 0.01;

  //rotate cube model
  mat4.rotateZ(cube_model_mat, cube_model_mat, Math.sin(time*3)*0.03 + 0.004);
  mat4.rotateY(cube_model_mat, cube_model_mat, Math.sin(time*2)*0.03 + 0.004);
  mat4.rotateX(cube_model_mat, cube_model_mat, Math.sin(time*5)*0.03 + 0.004);

  //rotate small cube model
  mat4.rotateY(mouse_model_matr, mouse_model_matr, 0.06);
  mat4.rotateX(mouse_model_matr, mouse_model_matr, 0.06);

  //set the position of the cube model to move in a circle
  cube_model_mat[12] = Math.cos(time);
  cube_model_mat[13] = Math.sin(time);

  //set the position of the small cube to match the mouse position
  mouse_model_matr[12] = (mouse_pos.x/canvas.width - 0.5) * (canvas.width/canvas.height) * 6;
  mouse_model_matr[13] = (-mouse_pos.y/canvas.height + 0.5) * 6;

  //===============DRAWING STUFF===================//
  gl.clear(gl.COLOR_BUFFER_BIT);

  //get inverse of camera view matrix
  let temp_camera_mat = mat4.create();
  mat4.invert(temp_camera_mat, camera_view_mat);

  gl.useProgram(cube_shader_program);

  //use matrices to go from world space to clipspace
  mat4.multiply(current_MV_matr, temp_camera_mat, cube_model_mat);
  mat4.multiply(currentMVP_matr, camera_proj_mat, current_MV_matr);

  //tell webgl to use these matrices when rendering the object
  gl.uniformMatrix4fv(cube_matrix_uniform, false, currentMVP_matr);
  
  //draw this object with current selected shader program
  gl.drawArrays(gl.TRIANGLES, 0, cube_vertex_data.length / 3);

  gl.useProgram(shader_program_2);

  //use matrices to go from world space to clipspace
  mat4.multiply(current_MV_matr, temp_camera_mat, mouse_model_matr);
  mat4.multiply(currentMVP_matr, camera_proj_mat, current_MV_matr);

  //tell webgl to use these matrices when rendering the object
  gl.uniformMatrix4fv(matrix_2, false, currentMVP_matr);

  //draw this object with current selected shader program
  gl.drawArrays(gl.TRIANGLES, 0, cube_vertex_data.length / 3);

  //request to run this function again on the next animation frame
  requestAnimationFrame(animate);
}

//event listener to correctly resize the webgl canvas
window.addEventListener('resize', () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  gl.viewport(0, 0, canvas.width, canvas.height);
  mat4.perspective(camera_proj_mat, Math.PI/2, canvas.width/canvas.height, 0.03, 1000);
});

//start the animation loop
animate();