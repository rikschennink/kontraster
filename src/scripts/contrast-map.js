/* global document */

function getWebGLContext(canvas) {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  return gl;
}

function createShader(gl, shaderContent, shaderType) {
  const shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderContent);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createShaderProgram(gl, fragmentShader, vertexShader) {
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader);
  gl.attachShader(shaderProgram, vertexShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('Unable to initialize shader.');
  }

  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function createVertexPositionBuffer(gl) {
  const vertexPositionBuffer = gl.createBuffer();
  const vertices = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0,
  ]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  return vertexPositionBuffer;
}

function createTexture(gl, image) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return texture;
}

function createContrastMap(image, imageWithoutText, fragmentShaderContent, vertexShaderContent) {
  const height = image.naturalHeight;
  const width = image.naturalWidth;

  const canvas = document.createElement('canvas');
  canvas.height = height;
  canvas.width = width;

  const gl = getWebGLContext(canvas);
  createVertexPositionBuffer(gl);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  const fragmentShader = createShader(gl, fragmentShaderContent, gl.FRAGMENT_SHADER);
  const vertexShader = createShader(gl, vertexShaderContent, gl.VERTEX_SHADER);
  const shaderProgram = createShaderProgram(gl, fragmentShader, vertexShader);

  const aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

  const aTexturePosition = gl.getAttribLocation(shaderProgram, 'aTexturePosition');

  if (aTexturePosition !== -1) {
    gl.enableVertexAttribArray(aTexturePosition);
    gl.vertexAttribPointer(aTexturePosition, 2, gl.FLOAT, false, 0, 0);
  }

  const imageTexture = createTexture(gl, image);
  const imageWithoutTextTexture = createTexture(gl, imageWithoutText);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uTexture'), 0);
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);

  gl.activeTexture(gl.TEXTURE1);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uReferenceTexture'), 1);
  gl.bindTexture(gl.TEXTURE_2D, imageWithoutTextTexture);

  const uTextureSize = gl.getUniformLocation(shaderProgram, 'uTextureSize');
  gl.uniform2fv(uTextureSize, [width, height]);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return {
    canvas,
    pixels,
  };
}

module.exports = createContrastMap;
