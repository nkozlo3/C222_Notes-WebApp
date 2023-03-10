//keep track of whether the mouse stuff
let mouse_pos = vec2.create();
window.addEventListener("pointermove", (event) => {
  mouse_pos = vec2.fromValues(event.clientX, event.clientY);//{ x: event.clientX, y: event.clientY };
});
let mouse_down = false;
let penpressure = 0;
window.addEventListener("pointerdown", () => {
  mouse_down = true;
});
window.addEventListener("pointerup", () => {
  mouse_down = false;
});
window.addEventListener("pointermove", (event) => {
  penpressure = event.pressure;
});
let scroll_y = 0;
let scroll_x = 0;
let zoom = 1;
let zoom_delta = 0;
let rotate = 0;
window.addEventListener("wheel", (event) =>
{
  if(event.ctrlKey == true)
  {
    zoom_delta = event.deltaY;
    rotate = event.deltaX;
  }
  else
  {
    scroll_y = event.deltaY;
    scroll_x = event.deltaX;
  }
});

//disable scrolling on mobile devices
document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive:false, premultipliedAlpha: false});

//initialize the canvas to the size of the screen
document.getElementById("glcanvas").height = window.innerHeight;
document.getElementById("glcanvas").width = window.innerWidth;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl", { antialias: false });
if (!gl) {
  throw new Error("Webgl is not supported");
}

//initialize cube data
let cube_vertex_data = [
  //front
  0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
  -0.5, -0.5, 0.5,

  //left
  -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5, -0.5,

  //back
  -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5,
  -0.5, 0.5, -0.5, -0.5,

  //right
  0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
  0.5, -0.5, -0.5,

  //top
  0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,

  //bottom
  0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5, -0.5,
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
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(cube_vertex_data),
  gl.STATIC_DRAW
);

let cube_color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cube_color_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(cube_color_data),
  gl.STATIC_DRAW
);

let stroke_data = [];

window.addEventListener('keypress', function (e) {
  if (e.key == ' ')
  {
    stroke_data = [];
  }
}, false);

let pencil_stroke_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pencil_stroke_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(stroke_data),
  gl.STATIC_DRAW
)

//vertex shader
let cube_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  cube_vertex_shader,
  `
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
`
);
gl.compileShader(cube_vertex_shader);

//fragment shader
let cube_frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  cube_frag_shader,
  `
precision mediump float;
varying vec3 vColor;

void main()
{
  gl_FragColor = vec4(vColor, 1);
}
`
);
gl.compileShader(cube_frag_shader);

//link the shader program
let cube_shader_program = gl.createProgram();
gl.attachShader(cube_shader_program, cube_vertex_shader);
gl.attachShader(cube_shader_program, cube_frag_shader);
gl.linkProgram(cube_shader_program);

//attributes - these are in the vertex shader
let cube_pos_attrib_loc = gl.getAttribLocation(cube_shader_program, "position");
gl.enableVertexAttribArray(cube_pos_attrib_loc);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.vertexAttribPointer(cube_pos_attrib_loc, 3, gl.FLOAT, false, 0, 0);

let cube_col_attrib_loc = gl.getAttribLocation(cube_shader_program, "color");
gl.enableVertexAttribArray(cube_col_attrib_loc);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_color_buffer);
gl.vertexAttribPointer(cube_col_attrib_loc, 3, gl.FLOAT, false, 0, 0);

let cube_matrix_uniform = gl.getUniformLocation(cube_shader_program, "matrix");

//creating a second shader program to test rendering multiple================================================================================

//vertex shader
let v_shader_2 = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  v_shader_2,
`
precision mediump float;
attribute vec3 position;
uniform mat4 matrix;

void main()
{
  gl_Position = matrix * vec4(position, 1);
}
`
);
gl.compileShader(v_shader_2);

//fragment shader
let f_shader_2 = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  f_shader_2,
`
precision mediump float;
uniform vec3 color;

void main()
{
  gl_FragColor = vec4(0, 0, 0, 1.);
}
`
);
gl.compileShader(f_shader_2);

//link the shader program
let shader_program_2 = gl.createProgram();
gl.attachShader(shader_program_2, v_shader_2);
gl.attachShader(shader_program_2, f_shader_2);
gl.linkProgram(shader_program_2);

//attributes - these are in the vertex shader
let pos_attrib_loc_2 = gl.getAttribLocation(shader_program_2, "position");
gl.enableVertexAttribArray(pos_attrib_loc_2);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.vertexAttribPointer(pos_attrib_loc_2, 3, gl.FLOAT, false, 0, 0);

let matrix_2 = gl.getUniformLocation(shader_program_2, "matrix");

let color_uniform = gl.getUniformLocation(shader_program_2, "color");

//=========================================================================================

//initialize matrices
let cube_model_mat = mat4.create();
mat4.translate(cube_model_mat, cube_model_mat, [0, 300, 0]);
mat4.scale(cube_model_mat, cube_model_mat, [50,50,1]);

let pixel_to_clip = mat4.create();
mat4.scale(pixel_to_clip, pixel_to_clip, [canvas.width/2,-canvas.height/2,1]);
mat4.translate(pixel_to_clip, pixel_to_clip, [1,-1,0]);
mat4.invert(pixel_to_clip, pixel_to_clip);

let clip_to_world = mat4.create();
mat4.scale(clip_to_world, clip_to_world, [canvas.width/2, canvas.height/2, 1]);

//initialize some state for the animation loop
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.9, 0.9, 0.8, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
let time = 0;
let prev_mouse_down = mouse_down; //useful to know when the mouse starts to draw
let prev_worldspace_mousepos = vec2.create();
let prev_adj = vec2.create();

let world_to_clip = mat4.create();

function Update()
{
  time += 0.01;

  zoom *= Math.E**(zoom_delta/400);

  clip_to_world[0] = canvas.width * zoom;
  clip_to_world[5] = canvas.height * zoom;
  clip_to_world[12] += scroll_x * zoom ;
  clip_to_world[13] -= scroll_y * zoom ;
  scroll_y = 0;
  scroll_x = 0;
  zoom_delta = 0;
  rotate = 0;

  world_to_clip = mat4.create();
  mat4.invert(world_to_clip, clip_to_world);

  let worldspace_mousepos = vec2.clone(mouse_pos);
  vec2.transformMat4(worldspace_mousepos, worldspace_mousepos, pixel_to_clip);
  vec2.transformMat4(worldspace_mousepos, worldspace_mousepos, clip_to_world);

  cube_model_mat[12] = worldspace_mousepos[0];
  cube_model_mat[13] = worldspace_mousepos[1];
  mat4.rotateZ(cube_model_mat, cube_model_mat, 0.02);

  //brush stroke geometry generation
  let adj = vec2.create();
  vec2.sub(adj, worldspace_mousepos, prev_worldspace_mousepos);
  vec2.normalize(adj,adj);
  vec2.scale(adj,adj,3);
  adj = vec2.fromValues(adj[1], -adj[0]);
  let moved = Math.abs(worldspace_mousepos[0] - prev_worldspace_mousepos[0]) + Math.abs(worldspace_mousepos[1] - prev_worldspace_mousepos[1]) > 0;
  if(mouse_down && moved)
  {
    if(stroke_data.length < 6 || !prev_mouse_down)
    {
      stroke_data.push(worldspace_mousepos[0]);
      stroke_data.push(worldspace_mousepos[1]);
      stroke_data.push(worldspace_mousepos[0]);
      stroke_data.push(worldspace_mousepos[1]);
      stroke_data.push(worldspace_mousepos[0]);
      stroke_data.push(worldspace_mousepos[1]);
    }
    else
    {
      stroke_data.push(prev_worldspace_mousepos[0] + prev_adj[0]);
      stroke_data.push(prev_worldspace_mousepos[1] + prev_adj[1]);
      stroke_data.push(worldspace_mousepos[0] + adj[0]);
      stroke_data.push(worldspace_mousepos[1] + adj[1]);
      stroke_data.push(worldspace_mousepos[0] - adj[0]);
      stroke_data.push(worldspace_mousepos[1] - adj[1]);

      stroke_data.push(prev_worldspace_mousepos[0] + prev_adj[0]);
      stroke_data.push(prev_worldspace_mousepos[1] + prev_adj[1]);
      stroke_data.push(worldspace_mousepos[0] - adj[0]);
      stroke_data.push(worldspace_mousepos[1] - adj[1]);
      stroke_data.push(prev_worldspace_mousepos[0] - prev_adj[0]);
      stroke_data.push(prev_worldspace_mousepos[1] - prev_adj[1]);
    }
    prev_adj = vec2.clone(adj);
    prev_worldspace_mousepos = vec2.clone(worldspace_mousepos);
  }
  prev_mouse_down = mouse_down;

  gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(stroke_data),
  gl.STATIC_DRAW
  )
}

function Draw()
{
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shader_program_2);
  gl.enableVertexAttribArray(pos_attrib_loc_2);
  gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
  gl.vertexAttribPointer(pos_attrib_loc_2, 3, gl.FLOAT, false, 0, 0);
  let clipspace_matrix = mat4.create();
  mat4.multiply(clipspace_matrix, world_to_clip, cube_model_mat);
  gl.uniformMatrix4fv(matrix_2, false, clipspace_matrix);
  gl.drawArrays(gl.TRIANGLES, 0, cube_vertex_data.length / 3);

  gl.enableVertexAttribArray(pos_attrib_loc_2);
  gl.bindBuffer(gl.ARRAY_BUFFER, pencil_stroke_buffer);
  gl.vertexAttribPointer(pos_attrib_loc_2, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(matrix_2, false, world_to_clip);
  gl.drawArrays(gl.TRIANGLES, 0, stroke_data.length / 2);
}

//define the update loop
function FrameUpdate()
{
  Update();
  Draw();

  //request to run this function again on the next animation frame
  requestAnimationFrame(FrameUpdate);
}

//event listener to correctly resize the webgl canvas
window.addEventListener("resize", () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  gl.viewport(0, 0, canvas.width, canvas.height);
  pixel_to_clip = mat4.create();
  mat4.scale(pixel_to_clip, pixel_to_clip, [canvas.width/2,-canvas.height/2,1]);
  mat4.translate(pixel_to_clip, pixel_to_clip, [1,-1,0]);
  mat4.invert(pixel_to_clip, pixel_to_clip);

  let temp = [clip_to_world[12],clip_to_world[13],clip_to_world[14]];//preserve camera position
  let old_scale = [clip_to_world[0], clip_to_world[5]];

  clip_to_world = mat4.create();
  mat4.scale(clip_to_world, clip_to_world, [canvas.width/2, canvas.height/2, 1]);
  clip_to_world[12] = temp[0];
  clip_to_world[13] = temp[1];
  clip_to_world[14] = temp[2];
});

//start the animation loop
FrameUpdate();
