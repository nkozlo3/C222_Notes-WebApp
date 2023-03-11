//keep track of the mouse stuff
let mouse_pos = vec2.create();
let mouse_down = false;
let penpressure = 0;
window.addEventListener("pointermove", (event) => {
  mouse_pos = vec2.fromValues(event.clientX, event.clientY);
  penpressure = event.pressure;
});
window.addEventListener("pointerdown", () => {
  mouse_down = true;
});
window.addEventListener("pointerup", () => {
  mouse_down = false;
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
document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive:false});

//initialize the canvas to the size of the screen
document.getElementById("glcanvas").height = window.innerHeight;
document.getElementById("glcanvas").width = window.innerWidth;

//initialize webgl
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
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

//buffers
let cube_position_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(cube_vertex_data),
  gl.STATIC_DRAW
);

//the geometry of the pencil strokes
let stroke_data = [];

//buffer for the pencil strokes - for webgl
let pencil_stroke_buffer = gl.createBuffer();

//clear the drawing on spacebar pressed
window.addEventListener('keypress', function (e) {
  if (e.key == ' ')
  {
    stroke_data = [];
  }
}, false);

//vertex shader
let brush_stroke_vert = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  brush_stroke_vert,
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
gl.compileShader(brush_stroke_vert);

//fragment shader
let brush_stroke_fragm = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  brush_stroke_fragm,
`
precision mediump float;
uniform vec3 color;

void main()
{
  gl_FragColor = vec4(color, 1);
}
`
);
gl.compileShader(brush_stroke_fragm);

//link the shader program
let brush_stroke_shader_program = gl.createProgram();
gl.attachShader(brush_stroke_shader_program, brush_stroke_vert);
gl.attachShader(brush_stroke_shader_program, brush_stroke_fragm);
gl.linkProgram(brush_stroke_shader_program);

//attributes - these are in the vertex shader
let pos_attrib_loc_2 = gl.getAttribLocation(brush_stroke_shader_program, "position");
gl.enableVertexAttribArray(pos_attrib_loc_2);
gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
gl.vertexAttribPointer(pos_attrib_loc_2, 3, gl.FLOAT, false, 0, 0);

//uniforms - these are in the vertex and fragment shader
let matrix_uniform = gl.getUniformLocation(brush_stroke_shader_program, "matrix");
let color_uniform = gl.getUniformLocation(brush_stroke_shader_program, "color");

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

let world_to_clip = mat4.create();

//initialize some state for the animation loop
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.9, 0.9, 0.8, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
let time = 0;
let prev_mouse_down = mouse_down; //useful to know when the mouse starts to draw
let prev_worldspace_mousepos = vec2.create();
let prev_adj = vec2.create();

//update function
function Update()
{
  time += 0.01;

  zoom *= Math.E**(zoom_delta/800);

  //scale camera
  clip_to_world[0] = canvas.width * zoom;
  clip_to_world[5] = canvas.height * zoom;
  //translate camera
  clip_to_world[12] += scroll_x * zoom ;
  clip_to_world[13] -= scroll_y * zoom ;
  //reset variables after use
  scroll_y = 0;
  scroll_x = 0;
  zoom_delta = 0;
  rotate = 0;

  //invert camera's transform matrix
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

//drawing function
function Draw()
{
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3fv(color_uniform, [0,0.1,0.3]);

  gl.useProgram(brush_stroke_shader_program);
  gl.enableVertexAttribArray(pos_attrib_loc_2);
  gl.bindBuffer(gl.ARRAY_BUFFER, cube_position_buffer);
  gl.vertexAttribPointer(pos_attrib_loc_2, 3, gl.FLOAT, false, 0, 0);
  let clipspace_matrix = mat4.create();
  mat4.multiply(clipspace_matrix, world_to_clip, cube_model_mat);
  gl.uniformMatrix4fv(matrix_uniform, false, clipspace_matrix);
  gl.drawArrays(gl.TRIANGLES, 0, cube_vertex_data.length / 3);

  gl.enableVertexAttribArray(pos_attrib_loc_2);
  gl.bindBuffer(gl.ARRAY_BUFFER, pencil_stroke_buffer);
  gl.vertexAttribPointer(pos_attrib_loc_2, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(matrix_uniform, false, world_to_clip);
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

  clip_to_world = mat4.create();
  mat4.scale(clip_to_world, clip_to_world, [canvas.width/2, canvas.height/2, 1]);
  clip_to_world[12] = temp[0];
  clip_to_world[13] = temp[1];
  clip_to_world[14] = temp[2];
});

//start the animation loop
FrameUpdate();
