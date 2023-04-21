console.log("Pixel ratio:", window.devicePixelRatio);

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
window.addEventListener("wheel", (event) => {
  if (event.ctrlKey == true) {
    zoom_delta = event.deltaY;
    rotate = event.deltaX;
  } else {
    scroll_y = event.deltaY;
    scroll_x = event.deltaX;
  }
});

//button for switching brush types
document.getElementById("brush_tool_button").style.left = "1%";
document.getElementById("brush_tool_button").style.top = "1%";
document.getElementById("brush_tool_button").addEventListener("click", () =>
{
  drawing_tool = !drawing_tool;
});

//button for changing brush color
document.getElementById("color_button").style.left = "1%";
document.getElementById("color_button").style.top = "11%";
document.getElementById("color_button").addEventListener("click", () =>
{
  pixel_brush_color = [Math.random(), Math.random(), Math.random()];
});
document.getElementById("clear_button").style.left = "1%";
document.getElementById("clear_button").style.top = "21%";
document.getElementById("clear_button").addEventListener("click", () =>
{
  stroke_vertex_data = [];
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.viewport(0, 0, frame_buffer_width, frame_buffer_height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  stroke_index = -1;
});

//slider for changing brush size
document.getElementById("myRange").oninput = function()
{
  brush_size = this.value/10;
};

//disable scrolling on mobile devices
document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

//initialize the canvas to the size of the screen
document.getElementById("glcanvas").height = window.innerHeight;
document.getElementById("glcanvas").width = window.innerWidth;

//initialize webgl
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl", {
  antialias: false,
  premultipliedAlpha: false,
});
if (!gl) {
  throw new Error("Webgl is not supported");
}

//initialize cube data
let square_vertex_array = [
  -1, -1, 0, 1, -1, 0, 1, 1, 0,

  -1, -1, 0, 1, 1, 0, -1, 1, 0,
];

let square_uv_array = [
  0, 0, 1, 0, 1, 1,

  0, 0, 1, 1, 0, 1,
];

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

//the geometry of the pencil strokes (cpu)
let stroke_vertex_data = [];

//buffer for the pencil strokes - for webgl (gpu)
let stroke_vertex_buffer = gl.createBuffer();

//vertex shader
let solid_color_VS = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  solid_color_VS,
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
gl.compileShader(solid_color_VS);

//fragment shader
let solid_color_FS = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  solid_color_FS,
  `
precision mediump float;
uniform vec4 color;

void main()
{
  gl_FragColor = color;
}
`
);
gl.compileShader(solid_color_FS);

//link the shader program
let solid_color_shader_program = gl.createProgram();
gl.attachShader(solid_color_shader_program, solid_color_VS);
gl.attachShader(solid_color_shader_program, solid_color_FS);
gl.linkProgram(solid_color_shader_program);

//attributes - these are in the vertex shader
let solid_color_vertex_attrib = gl.getAttribLocation(
  solid_color_shader_program,
  "position"
);
gl.enableVertexAttribArray(solid_color_vertex_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(solid_color_vertex_attrib, 3, gl.FLOAT, false, 0, 0);

//uniforms - these are in the vertex and fragment shader
let solid_color_matrix_uniform = gl.getUniformLocation(
  solid_color_shader_program,
  "matrix"
);
let solid_color_color_uniform = gl.getUniformLocation(
  solid_color_shader_program,
  "color"
);

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

uniform vec2 page_resolution;
uniform vec2 mouse_pos;

void main()
{
  vec2 UV = uv * page_resolution;
  vec3 col = texture2D(u_texture, uv).xyz;
  if(length(UV - mouse_pos) < 4.)
  {
    if(length(UV - mouse_pos) > 3.)
    {
      col = vec3(1) - col;
    }
  }
  gl_FragColor = vec4(col, 1);
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
let sheet_position_attrib = gl.getAttribLocation(
  sheet_shader_program,
  "position"
);
gl.enableVertexAttribArray(sheet_position_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(sheet_position_attrib, 3, gl.FLOAT, false, 0, 0);

let sheet_uv_attrib = gl.getAttribLocation(sheet_shader_program, "uv_coord");
gl.enableVertexAttribArray(sheet_uv_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_uv_buffer);
gl.vertexAttribPointer(sheet_uv_attrib, 2, gl.FLOAT, false, 0, 0);

//uniforms
let sheet_matrix_uniform = gl.getUniformLocation(
  sheet_shader_program,
  "matrix"
);
let sheet_mouse_pos_uniform = gl.getUniformLocation(
  sheet_shader_program,
  "mouse_pos"
);
let sheet_page_resolution_uniform = gl.getUniformLocation(
  sheet_shader_program,
  "page_resolution"
);

//vertex shader
let pixel_drawer_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  pixel_drawer_vertex_shader,
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
gl.compileShader(pixel_drawer_vertex_shader);

//fragment shader
let pixel_drawer_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  pixel_drawer_fragment_shader,
  `
precision mediump float;
uniform vec3 color;
uniform sampler2D u_texture;
uniform vec2 cursor_pos;
uniform vec2 prev_cursor_pos;
uniform bool mouse_down;
uniform float brush_size;

varying vec2 uv;

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
  float dist = sdf_cap(gl_FragCoord.xy, prev_cursor_pos, cursor_pos, brush_size - 0.5);
  dist = 1. - dist;
  dist = clamp(dist, 0., 1.);
  vec3 input_color = texture2D(u_texture, uv).xyz;
  vec3 col = input_color;
  if(mouse_down)
  {
    col = mix(input_color, color, dist);
  }
  gl_FragColor = vec4(col, 1.);
}
`
);
gl.compileShader(pixel_drawer_fragment_shader);

//link the shader program
let pixel_drawer_shader_program = gl.createProgram();
gl.attachShader(pixel_drawer_shader_program, pixel_drawer_vertex_shader);
gl.attachShader(pixel_drawer_shader_program, pixel_drawer_fragment_shader);
gl.linkProgram(pixel_drawer_shader_program);

//attributes - these are in the vertex shader
let pixel_drawer_vertex_attrib = gl.getAttribLocation(
  pixel_drawer_shader_program,
  "position"
);
gl.enableVertexAttribArray(pixel_drawer_vertex_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
gl.vertexAttribPointer(pixel_drawer_vertex_attrib, 3, gl.FLOAT, false, 0, 0);
let pixel_drawer_uv_attrib = gl.getAttribLocation(
  pixel_drawer_shader_program,
  "uv_coord"
);
gl.enableVertexAttribArray(pixel_drawer_uv_attrib);
gl.bindBuffer(gl.ARRAY_BUFFER, square_uv_buffer);
gl.vertexAttribPointer(pixel_drawer_uv_attrib, 2, gl.FLOAT, false, 0, 0);

//uniforms - these are in the vertex and fragment shader
let pixel_drawer_matrix_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "matrix"
);
let pixel_drawer_color_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "color"
);
let pixel_drawer_cursor_pos_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "cursor_pos"
);
let pixel_drawer_prev_cursor_pos_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "prev_cursor_pos"
);
let pixel_drawer_mouse_down_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "mouse_down"
);
let pixel_drawer_brush_size_uniform = gl.getUniformLocation(
  pixel_drawer_shader_program,
  "brush_size"
);

// create render texture
const frame_buffer_width = 800;
const frame_buffer_height = 600;
let pixel_drawing_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, pixel_drawing_texture);
// define size and format of level 0
const level = 0;
const internalFormat = gl.RGBA;
const border = 0;
const format = gl.RGBA;
const type = gl.UNSIGNED_BYTE;
const data = null;
gl.texImage2D(
  gl.TEXTURE_2D,
  level,
  internalFormat,
  frame_buffer_width,
  frame_buffer_height,
  border,
  format,
  type,
  data
);
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
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  attachmentPoint,
  gl.TEXTURE_2D,
  pixel_drawing_texture,
  level
);
gl.clearColor(1, 1, 1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// create a buffere to hold the pixel data from the render texture
let pixel_image_buffer = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, pixel_image_buffer);
// define size and format of level 0
gl.texImage2D(
  gl.TEXTURE_2D,
  level,
  internalFormat,
  frame_buffer_width,
  frame_buffer_height,
  border,
  format,
  type,
  data
);
// set the filtering so we don't need mips
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//deactivate the framebuffer
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//load image
let sheet_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, sheet_texture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array([0, 125, 255, 255])
);
let image = new Image();
image.src = "../data/better.jpg";
image.addEventListener("load", function () {
  // Now that the image has loaded make copy it to the texture.
  gl.bindTexture(gl.TEXTURE_2D, sheet_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  console.log("image loaded");
});

//initialize matrices
let sheet_transform_matrix = mat4.create();
mat4.translate(
  sheet_transform_matrix,
  sheet_transform_matrix,
  [0, 0, 0.999999]
);
mat4.scale(sheet_transform_matrix, sheet_transform_matrix, [
  frame_buffer_width,
  frame_buffer_height,
  1,
]);

let pixel_to_clip = mat4.create();
mat4.scale(pixel_to_clip, pixel_to_clip, [
  canvas.width / 2,
  -canvas.height / 2,
  1,
]);
mat4.translate(pixel_to_clip, pixel_to_clip, [1, -1, 0]);
mat4.invert(pixel_to_clip, pixel_to_clip);

let clip_to_world = mat4.create();
mat4.scale(clip_to_world, clip_to_world, [
  canvas.width / 2,
  canvas.height / 2,
  1,
]);

window.addEventListener(
  "keypress",
  function (e) {
    if (e.key == "1") {
      clip_to_world[12] = 0;
      clip_to_world[13] = 0;
      zoom = 1;
    }
  },
  false
);

let world_to_clip = mat4.create();

//initialize some state for the animation loop
gl.enable(gl.DEPTH_TEST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.clearColor(0.6, 0.65, 0.7, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
let time = 0;
let prev_mouse_down = mouse_down; //useful to know when the mouse starts to draw
let prev_worldspace_mousepos = vec2.create();
let prev_adj = vec2.create();
let worldspace_mousepos = vec2.create();
let drawing_tool = 0;
let pixel_brush_color = [0, 0, 0];
let pixel_cursor = vec2.create();
let prev_pixel_cursor = vec2.create();
let brush_size = 3;
let stroke_index = -1;

//update function
function Update() {
  time += 0.01;

  zoom *= Math.E ** (zoom_delta / 800);

  //scale camera
  clip_to_world[0] = canvas.width * zoom;
  clip_to_world[5] = canvas.height * zoom;
  //translate camera
  clip_to_world[12] += scroll_x * zoom;
  clip_to_world[13] -= scroll_y * zoom;
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

  //brush stroke geometry generation
  let adj = vec2.create();
  vec2.sub(adj, worldspace_mousepos, prev_worldspace_mousepos);
  vec2.normalize(adj,adj);
  vec2.scale(adj,adj,2*brush_size);
  adj = vec2.fromValues(adj[1], -adj[0]);
  let moved =
    Math.abs(worldspace_mousepos[0] - prev_worldspace_mousepos[0]) +
      Math.abs(worldspace_mousepos[1] - prev_worldspace_mousepos[1]) >
    0;
  if (mouse_down && moved && drawing_tool == 1) {
    if (!prev_mouse_down) {
      stroke_index += 1;
      stroke_vertex_data.push([pixel_brush_color.concat(1),[]]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1]);
    } else {
      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[0] + prev_adj[0]);
      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[1] + prev_adj[1]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0] + adj[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1] + adj[1]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0] - adj[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1] - adj[1]);

      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[0] + prev_adj[0]);
      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[1] + prev_adj[1]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[0] - adj[0]);
      stroke_vertex_data[stroke_index][1].push(worldspace_mousepos[1] - adj[1]);
      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[0] - prev_adj[0]);
      stroke_vertex_data[stroke_index][1].push(prev_worldspace_mousepos[1] - prev_adj[1]);
    }
    prev_adj = vec2.clone(adj);
    prev_worldspace_mousepos = vec2.clone(worldspace_mousepos);
  }
  prev_mouse_down = mouse_down;
}

//drawing function
function Draw() {
  //DRAW TO FRAMEBUFFER
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.bindTexture(gl.TEXTURE_2D, pixel_image_buffer);
  //copy framebuffer to texture for a cyclical rendering of pixel brush lines
  gl.copyTexImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    0,
    0,
    frame_buffer_width,
    frame_buffer_height,
    0
  );
  gl.viewport(0, 0, frame_buffer_width, frame_buffer_height);

  //for debugging purposes - if the pixel image isn't fully filled in, bright magenta will show up
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //draw pixel brush strokes
  gl.useProgram(pixel_drawer_shader_program);
  gl.uniform3fv(pixel_drawer_color_uniform, pixel_brush_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
  gl.vertexAttribPointer(pixel_drawer_vertex_attrib, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(pixel_drawer_matrix_uniform, false, mat4.create());
  pixel_cursor = vec2.fromValues(
    (worldspace_mousepos[0] + frame_buffer_width) / 2,
    (worldspace_mousepos[1] + frame_buffer_height) / 2
  );
  gl.uniform2fv(pixel_drawer_cursor_pos_uniform, pixel_cursor);
  gl.uniform2fv(pixel_drawer_prev_cursor_pos_uniform, prev_pixel_cursor);
  gl.uniform1i(
    pixel_drawer_mouse_down_uniform,
    mouse_down && drawing_tool == 0
  );
  gl.uniform1f(pixel_drawer_brush_size_uniform, brush_size);
  prev_pixel_cursor = vec2.fromValues(pixel_cursor[0], pixel_cursor[1]);
  gl.drawArrays(gl.TRIANGLES, 0, square_vertex_array.length / 3);

  //DRAW TO CANVAS (REAL SCREEN)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, pixel_drawing_texture);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(sheet_shader_program);

  gl.uniform2fv(sheet_page_resolution_uniform, [
    frame_buffer_width,
    frame_buffer_height,
  ]);
  gl.uniform2fv(sheet_mouse_pos_uniform, pixel_cursor);

  gl.bindBuffer(gl.ARRAY_BUFFER, square_vertex_buffer);
  gl.vertexAttribPointer(sheet_position_attrib, 3, gl.FLOAT, false, 0, 0);
  let tempyy = mat4.create();
  mat4.multiply(tempyy, world_to_clip, sheet_transform_matrix);
  gl.uniformMatrix4fv(sheet_matrix_uniform, false, tempyy);
  gl.drawArrays(gl.TRIANGLES, 0, square_vertex_array.length / 3);

  gl.useProgram(solid_color_shader_program);
  gl.bindBuffer(gl.ARRAY_BUFFER, stroke_vertex_buffer);

  //render the the vector brush strokes in order of creation
  gl.disable(gl.DEPTH_TEST);
  for(let i = 0 ; i < stroke_vertex_data.length; i++)
  {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(stroke_vertex_data[i][1]),
      gl.DYNAMIC_DRAW
    );
    gl.uniform4fv(solid_color_color_uniform, stroke_vertex_data[i][0]);
    gl.vertexAttribPointer(solid_color_vertex_attrib, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(solid_color_matrix_uniform, false, world_to_clip);
    gl.drawArrays(gl.TRIANGLES, 0, stroke_vertex_data[i][1].length / 2);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);
}

//define the update loop
function FrameUpdate() {
  Update();
  Draw();
  requestAnimationFrame(FrameUpdate);
}

//event listener to correctly resize the webgl canvas
window.addEventListener("resize", () => {
  //update canvas
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  //make sure gl knows the correct dimensions as well - for rendering
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //update the camera matrix to match the new aspect ratio
  pixel_to_clip = mat4.create();
  mat4.scale(pixel_to_clip, pixel_to_clip, [
    canvas.width / 2,
    -canvas.height / 2,
    1,
  ]);
  mat4.translate(pixel_to_clip, pixel_to_clip, [1, -1, 0]);
  mat4.invert(pixel_to_clip, pixel_to_clip);

  //store camera position before
  let temp = [clip_to_world[12], clip_to_world[13], clip_to_world[14]];

  clip_to_world = mat4.create();
  mat4.scale(clip_to_world, clip_to_world, [
    canvas.width / 2,
    canvas.height / 2,
    1,
  ]);
  //recalll camera position
  clip_to_world[12] = temp[0];
  clip_to_world[13] = temp[1];
  clip_to_world[14] = temp[2];
});

//start the update loop
FrameUpdate();
