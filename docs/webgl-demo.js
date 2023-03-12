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
let square_vertex_array = [
  -1,-1,0,
  1,-1,0,
  1,1,0,

  -1,-1,0,
  1,1,0,
  -1,1,0,
];

let square_uv_array = [
  0,0,
  1,0,
  1,1,

  0,0,
  1,1,
  0,1,
]

//buffers
let square_vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(square_vertex_array),
  gl.STATIC_DRAW
);

let square_uv_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, square_uv_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(square_uv_array),
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
  if (e.key == '2')
  {
    drawing_tool = !drawing_tool;
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
uniform vec4 color;

void main()
{
  gl_FragColor = color;
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
let brush_stroke_position_attrib = gl.getAttribLocation(brush_stroke_shader_program, "position");
gl.enableVertexAttribArray(brush_stroke_position_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(brush_stroke_position_attrib, 3, gl.FLOAT, false, 0, 0);

//uniforms - these are in the vertex and fragment shader
let brush_stroke_matrix_uniform = gl.getUniformLocation(brush_stroke_shader_program, "matrix");
let brush_stroke_color_uniform = gl.getUniformLocation(brush_stroke_shader_program, "color");


//vertex shader
let sheet_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  sheet_vertex_shader,
`
precision mediump float;
attribute vec3 position;
attribute vec2 uv_coord;
varying vec2 uv;
uniform mat4 matrix;

void main()
{
  gl_Position = matrix * vec4(position, 1);
  uv = uv_coord;
}
`
);
gl.compileShader(sheet_vertex_shader);

//fragment shader
let sheet_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  sheet_fragment_shader,
`
precision mediump float;
varying vec2 uv;
uniform sampler2D u_texture;

void main()
{
  gl_FragColor = vec4(texture2D(u_texture, uv).xyz, 1);
}
`
);
gl.compileShader(sheet_fragment_shader);

//link the shader program
let sheet_shader_program = gl.createProgram();
gl.attachShader(sheet_shader_program, sheet_vertex_shader);
gl.attachShader(sheet_shader_program, sheet_fragment_shader);
gl.linkProgram(sheet_shader_program);

//attributes - these are in the vertex shader
let sheet_position_attrib = gl.getAttribLocation(sheet_shader_program, "position");
gl.enableVertexAttribArray(sheet_position_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(sheet_position_attrib, 3, gl.FLOAT, false, 0, 0);

let sheet_uv_attrib = gl.getAttribLocation(sheet_shader_program, "uv_coord");
gl.enableVertexAttribArray(sheet_uv_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_uv_buffer);
gl.vertexAttribPointer(sheet_uv_attrib, 2, gl.FLOAT, false, 0, 0);

//uniforms
let sheet_matrix_uniform = gl.getUniformLocation(sheet_shader_program, "matrix");












//===================================================================================================================================
//vertex shader
let pixel_sheet_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(pixel_sheet_vertex_shader,
`
precision mediump float;
attribute vec3 position;
attribute vec2 uv_coord;
varying vec2 uv;

uniform mat4 matrix;

void main()
{
  gl_Position = matrix * vec4(position, 1);
  uv = uv_coord;
}
`
);
gl.compileShader(pixel_sheet_vertex_shader);

//fragment shader
let pixel_sheet_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(pixel_sheet_fragment_shader,
`
precision mediump float;
uniform vec3 color;
varying vec2 uv;

uniform vec2 cursor_pos;
uniform vec2 prev_cursor_pos;

float sdf_circle(vec2 p, vec2 c, float r)
{
  return length(p - c) - r;
}

float sdf_cap(vec2 p, vec2 a, vec2 b, float r)
{
  vec2 offset = p - a;
  vec2 line = b - a;
  float t = clamp(dot(offset, line) / dot(line, line), 0., 1.);
  vec2 closest = a + line * t;
  return sdf_circle(p, closest, r);
}

void main()
{
  float dist = sdf_cap(gl_FragCoord.xy, prev_cursor_pos, cursor_pos, 3. - 0.5);
  dist = 1. - dist;
  gl_FragColor = vec4(color, dist);
}
`
);
gl.compileShader(pixel_sheet_fragment_shader);

//link the shader program
let pixel_sheet_shader_program = gl.createProgram();
gl.attachShader(pixel_sheet_shader_program, pixel_sheet_vertex_shader);
gl.attachShader(pixel_sheet_shader_program, pixel_sheet_fragment_shader);
gl.linkProgram(pixel_sheet_shader_program);

//attributes - these are in the vertex shader
let pixel_sheet_vertex_attrib = gl.getAttribLocation(pixel_sheet_shader_program, "position");
gl.enableVertexAttribArray(pixel_sheet_vertex_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(pixel_sheet_vertex_attrib, 3, gl.FLOAT, false, 0, 0);
let pixel_sheet_uv_attrib = gl.getAttribLocation(pixel_sheet_shader_program, "uv_coord");
gl.enableVertexAttribArray(pixel_sheet_uv_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_uv_buffer);
gl.vertexAttribPointer(pixel_sheet_uv_attrib, 2, gl.FLOAT, false, 0, 0);


//uniforms - these are in the vertex and fragment shader
let pixel_sheet_matrix_uniform = gl.getUniformLocation(pixel_sheet_shader_program, "matrix");
let pixel_sheet_color_uniform = gl.getUniformLocation(pixel_sheet_shader_program, "color");
let pixel_sheet_cursor_pos_uniform = gl.getUniformLocation(pixel_sheet_shader_program, "cursor_pos");
let pixel_sheet_prev_cursor_pos_uniform = gl.getUniformLocation(pixel_sheet_shader_program, "prev_cursor_pos");
//================================================================================================================================================
















// create to render to
const frame_buffer_width = canvas.width;
const frame_buffer_height = canvas.height;
const render_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, render_texture);

  // define size and format of level 0
  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  const data = null;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, frame_buffer_width, frame_buffer_height, border, format, type, data);
 
  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  
  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, render_texture, level);


gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//load image
let sheet_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, sheet_texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 125, 255, 255]));
let image = new Image();
image.src = "../data/better.jpg";
image.addEventListener('load', function() {
  // Now that the image has loaded make copy it to the texture.
  gl.bindTexture(gl.TEXTURE_2D, sheet_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  console.log("image loaded");
});

//initialize matrices
let square_model_mat = mat4.create();
mat4.translate(square_model_mat, square_model_mat, [0, 300, 0]);
mat4.scale(square_model_mat, square_model_mat, [50,50,1]);

let sheet_transform_matrix = mat4.create();
mat4.translate(sheet_transform_matrix, sheet_transform_matrix, [0, 0, 0.9]);
mat4.scale(sheet_transform_matrix, sheet_transform_matrix, [canvas.width, canvas.height, 1]);

let pixel_to_clip = mat4.create();
mat4.scale(pixel_to_clip, pixel_to_clip, [canvas.width/2,-canvas.height/2,1]);
mat4.translate(pixel_to_clip, pixel_to_clip, [1,-1,0]);
mat4.invert(pixel_to_clip, pixel_to_clip);

let clip_to_world = mat4.create();
mat4.scale(clip_to_world, clip_to_world, [canvas.width/2, canvas.height/2, 1]);
window.addEventListener('keypress', function (e) {
  if (e.key == '1')
  {
    clip_to_world[12] = 0;
    clip_to_world[13] = 0;
    zoom = 1;
  }
}, false);

let world_to_clip = mat4.create();

//initialize some state for the animation loop
gl.enable(gl.DEPTH_TEST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.clearColor(0.13, 0.15, 0.2, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
let time = 0;
let prev_mouse_down = mouse_down; //useful to know when the mouse starts to draw
let prev_worldspace_mousepos = vec2.create();
let prev_adj = vec2.create();
let worldspace_mousepos = vec2.create();
let drawing_tool = 0;

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

  worldspace_mousepos = vec2.clone(mouse_pos);
  vec2.transformMat4(worldspace_mousepos, worldspace_mousepos, pixel_to_clip);
  vec2.transformMat4(worldspace_mousepos, worldspace_mousepos, clip_to_world);

  square_model_mat[12] = worldspace_mousepos[0];
  square_model_mat[13] = worldspace_mousepos[1];
  mat4.rotateZ(square_model_mat, square_model_mat, 0.02);

  //brush stroke geometry generation
  let adj = vec2.create();
  vec2.sub(adj, worldspace_mousepos, prev_worldspace_mousepos);
  vec2.normalize(adj,adj);
  vec2.scale(adj,adj,6);
  adj = vec2.fromValues(adj[1], -adj[0]);
  let moved = Math.abs(worldspace_mousepos[0] - prev_worldspace_mousepos[0]) + Math.abs(worldspace_mousepos[1] - prev_worldspace_mousepos[1]) > 0;
  if(mouse_down && moved && drawing_tool == 1)
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

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stroke_data), gl.STATIC_DRAW);
}

let pixel_cursor = vec2.create();
let prev_pixel_cursor = vec2.create();
//drawing function
function Draw()
{
  //draw to the framebuffer:
  gl.bindTexture(gl.TEXTURE_2D, sheet_texture);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.viewport(0, 0, frame_buffer_width, frame_buffer_height);

  gl.useProgram(pixel_sheet_shader_program);

  gl.uniform3fv(pixel_sheet_color_uniform, [0.6,1,0.6]);

  gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
  gl.vertexAttribPointer(pixel_sheet_vertex_attrib, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(pixel_sheet_matrix_uniform, false, clip_to_world);
  pixel_cursor = vec2.fromValues((worldspace_mousepos[0] + canvas.width)/2, (worldspace_mousepos[1] + canvas.height)/2);
  gl.uniform2fv(pixel_sheet_cursor_pos_uniform, pixel_cursor);
  gl.uniform2fv(pixel_sheet_prev_cursor_pos_uniform, prev_pixel_cursor);
  prev_pixel_cursor = vec2.fromValues(pixel_cursor[0], pixel_cursor[1]);
  if(mouse_down && drawing_tool == 0)
  {
    gl.drawArrays(gl.TRIANGLES, 0, square_vertex_array.length / 3);
  }

  //draw to the actual screen:

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, render_texture);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(sheet_shader_program);

  gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
  gl.vertexAttribPointer(sheet_position_attrib, 3, gl.FLOAT, false, 0, 0);
  let tempyy = mat4.create();
  mat4.multiply(tempyy, world_to_clip, sheet_transform_matrix);
  gl.uniformMatrix4fv(sheet_matrix_uniform, false, tempyy);
  gl.drawArrays(gl.TRIANGLES, 0, square_vertex_array.length / 3);

  gl.useProgram(brush_stroke_shader_program);
  gl.uniform4fv(brush_stroke_color_uniform, [0,1,1,0.2]);

  gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
  gl.vertexAttribPointer(brush_stroke_position_attrib, 3, gl.FLOAT, false, 0, 0);
  let clipspace_matrix = mat4.create();
  mat4.multiply(clipspace_matrix, world_to_clip, square_model_mat);
  gl.uniformMatrix4fv(brush_stroke_matrix_uniform, false, clipspace_matrix);
  //gl.drawArrays(gl.TRIANGLES, 0, square_vertex_array.length / 3);

  gl.uniform4fv(brush_stroke_color_uniform, [1,0.6,1,1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, pencil_stroke_buffer);
  gl.vertexAttribPointer(brush_stroke_position_attrib, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(brush_stroke_matrix_uniform, false, world_to_clip);
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
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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
