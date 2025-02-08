const vertex = `#version 300 es
  in vec2 a_position;
  out vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = vec2((a_position.x + 1.0) / 2.0, (a_position.y + 1.0) / 2.0);
  }`;

const fragment3 = `#version 300 es
precision mediump float;

uniform vec4 resolution;
uniform vec2 mouse;
uniform vec2 threshold;
uniform float pixelRatio;
uniform sampler2D image0;
uniform sampler2D image1;

out vec4 fragColor;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v,2.);
  return mix(m,2.0 - m, step(1.0 ,m));
}

void main() {
  vec2 uv = pixelRatio * gl_FragCoord.xy / resolution.xy;
  vec2 vUv = (uv - vec2(0.5)) * resolution.zw + vec2(0.5);
  vUv.y = 1. - vUv.y;
  vec4 tex1 = texture(image1, mirrored(vUv));
  tex1.r = 1.0 - tex1.r - 0.5;

  vec2 fake3d = vec2(
    vUv.x + tex1.r * mouse.x/threshold.x,
    vUv.y + tex1.r * mouse.y/threshold.y
  );
  fragColor  = texture(image0, mirrored(fake3d));
}`;

// 模糊参考
// https://zonghuan.github.io/xzs-chart/dist/advanceDepth.html
// https://www.codercto.com/a/68341.html

const fake3d = (canvasEl: HTMLCanvasElement) => {
  const gl = canvasEl.getContext('webgl2') as WebGL2RenderingContext;
  if (!gl) {
    alert('😥你的浏览器不支持 WebGL，换一个吧');
    return;
  }
  const program = gl.createProgram()!;

  let animation: number;

  let mouseX = 0;
  let mouseY = 0;

  let mouseTargetX = 0;
  let mouseTargetY = 0;

  let imageAspect = 1;

  let originWidth = 0;
  let originHeight = 0;

  /** 初始化着色器 */
  function createScene() {
    addShader(vertex, gl.VERTEX_SHADER);
    addShader(fragment3, gl.FRAGMENT_SHADER);

    gl.linkProgram(program);
    gl.useProgram(program);

    // create position attrib
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  function addShader(source: string, type: GLenum) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('编译shader失败: ' + gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
  }

  /** 添加图像纹理 */
  function setTexture(originImg: string, depthImg: string, cb: (imgEl: HTMLImageElement) => void) {
    if (!originImg.length || !depthImg.length) return;
    return Promise.all([loadImg(originImg), loadImg(depthImg)])
      .then((imgs) => {
        originWidth = imgs[0].naturalWidth;
        originHeight = imgs[0].naturalHeight;
        imageAspect = originHeight / originWidth;

        const texture0 = useImg(imgs[0]);
        const texture1 = useImg(imgs[1]);

        gl.uniform1i(gl.getUniformLocation(program, 'image0'), 0);
        gl.uniform1i(gl.getUniformLocation(program, 'image1'), 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);

        canvasEl.width = originWidth;
        canvasEl.height = originHeight;
        cb(imgs[0]);

        window.setTimeout(() => {
          console.log('resize');

          gl.uniform4f(
            gl.getUniformLocation(program, 'resolution'),
            originWidth,
            originHeight,
            1,
            1
          );
          gl.uniform1f(gl.getUniformLocation(program, 'pixelRatio'), 1);
          gl.uniform2f(gl.getUniformLocation(program, 'threshold'), 60, 50);
          gl.viewport(0, 0, originWidth, originHeight);
        }, 0);
        return imgs;
      })
      .catch((e) => {
        console.log('图片加载失败', e);
      });
  }

  /** 加载图片 */
  function loadImg(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  }

  /** 使用图片 */
  function useImg(img: HTMLImageElement) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.enable(gl.BLEND); // Enable blending
    gl.depthFunc(gl.LEQUAL); //near things obscure far things
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return texture;
  }

  /** 鼠标交互 */
  function onMouseMove(e: MouseEvent) {
    const halfX = canvasEl.clientWidth / 2;
    const halfY = canvasEl.clientHeight / 2;
    mouseTargetX = (halfX - e.clientX) / halfX;
    mouseTargetY = (halfY - e.clientY) / halfY;
  }

  /** 每帧渲染 */
  function render() {
    mouseX += (mouseTargetX - mouseX) * 0.05;
    mouseY += (mouseTargetY - mouseY) * 0.05;
    gl.uniform2f(gl.getUniformLocation(program, 'mouse'), mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animation = window.requestAnimationFrame(render);
  }

  /** 销毁 */
  function destory() {
    window.cancelAnimationFrame(animation);
    canvasEl.removeEventListener('mousemove', onMouseMove);
  }

  /** 初始化 */
  function init() {
    createScene();
    render();
    canvasEl.addEventListener('mousemove', onMouseMove);
  }

  init();

  return { setTexture, destory };
};

export default fake3d;
