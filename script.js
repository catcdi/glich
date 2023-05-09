class BackgroundImage {
  constructor() {
    this.uniforms = {
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

      imageResolution: {
        type: 'v2',
        value: new THREE.Vector2(2048, 1356) },

      texture: {
        type: 't',
        value: null } };


    this.obj = null;
  }
  init(src, callback) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '*';
    loader.load(
    src, tex => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      this.uniforms.texture.value = tex;
      this.obj = this.createObj();
      callback();
    });
  }
  createObj() {
    return new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `attribute vec3 position;
          attribute vec2 uv;

          varying vec2 vUv;

          void main(void) {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
      fragmentShader: `precision highp float;

          uniform vec2 resolution;
          uniform vec2 imageResolution;
          uniform sampler2D texture;

          varying vec2 vUv;

          void main(void) {
            vec2 ratio = vec2(
                min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
                min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
              );

            vec2 uv = vec2(
                vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
              );
            gl_FragColor = texture2D(texture, uv);
          }
        ` }));


  }
  resize() {
    this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }}


class PostEffect {
  constructor(texture) {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0 },

      resolution: {
        type: 'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

      texture: {
        type: 't',
        value: texture } };


    this.obj = this.createObj();
  }
  createObj() {
    return new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `attribute vec3 position;
          attribute vec2 uv;
          
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
      fragmentShader: `precision highp float;
        
          uniform float time;
          uniform vec2 resolution;
          uniform sampler2D texture;
          
          varying vec2 vUv;
          
          float random(vec2 c){
            return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }

          //
          // Description : Array and textureless GLSL 2D/3D/4D simplex
          //               noise functions.
          //      Author : Ian McEwan, Ashima Arts.
          //  Maintainer : ijm
          //     Lastmod : 20110822 (ijm)
          //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
          //               Distributed under the MIT License. See LICENSE file.
          //               https://github.com/ashima/webgl-noise
          //

          vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }

          vec4 permute(vec4 x) {
               return mod289(((x*34.0)+1.0)*x);
          }

          vec4 taylorInvSqrt(vec4 r)
          {
            return 1.79284291400159 - 0.85373472095314 * r;
          }

          float snoise3(vec3 v)
            {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;

          // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            //   x0 = x0 - 0.0 + 0.0 * C.xxx;
            //   x1 = x0 - i1  + 1.0 * C.xxx;
            //   x2 = x0 - i2  + 2.0 * C.xxx;
            //   x3 = x0 - 1.0 + 3.0 * C.xxx;
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
            vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

          // Permutations
            i = mod289(i);
            vec4 p = permute( permute( permute(
                       i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          // Gradients: 7x7 points over a square, mapped onto an octahedron.
          // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            float n_ = 0.142857142857; // 1.0/7.0
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

          //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

          // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                          dot(p2,x2), dot(p3,x3) ) );
            }
                    
          const float interval = 3.0;
          
          void main(void){
            float strength = smoothstep(interval * 0.5, interval, interval - mod(time, interval));
            vec2 shake = vec2(strength * 8.0 + 0.5) * vec2(
              random(vec2(time)) * 2.0 - 1.0,
              random(vec2(time * 2.0)) * 2.0 - 1.0
            ) / resolution;
          
            float y = vUv.y * resolution.y;
            float rgbWave = (
                snoise3(vec3(0.0, y * 0.01, time * 400.0)) * (2.0 + strength * 32.0)
                * snoise3(vec3(0.0, y * 0.02, time * 200.0)) * (1.0 + strength * 4.0)
                + step(0.9995, sin(y * 0.005 + time * 1.6)) * 12.0
                + step(0.9999, sin(y * 0.005 + time * 2.0)) * -18.0
              ) / resolution.x;
            float rgbDiff = (6.0 + sin(time * 500.0 + vUv.y * 40.0) * (20.0 * strength + 1.0)) / resolution.x;
            float rgbUvX = vUv.x + rgbWave;
            float r = texture2D(texture, vec2(rgbUvX + rgbDiff, vUv.y) + shake).r;
            float g = texture2D(texture, vec2(rgbUvX, vUv.y) + shake).g;
            float b = texture2D(texture, vec2(rgbUvX - rgbDiff, vUv.y) + shake).b;
          
            float whiteNoise = (random(vUv + mod(time, 10.0)) * 2.0 - 1.0) * (0.15 + strength * 0.15);
          
            float bnTime = floor(time * 20.0) * 200.0;
            float noiseX = step((snoise3(vec3(0.0, vUv.x * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
            float noiseY = step((snoise3(vec3(0.0, vUv.y * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
            float bnMask = noiseX * noiseY;
            float bnUvX = vUv.x + sin(bnTime) * 0.2 + rgbWave;
            float bnR = texture2D(texture, vec2(bnUvX + rgbDiff, vUv.y)).r * bnMask;
            float bnG = texture2D(texture, vec2(bnUvX, vUv.y)).g * bnMask;
            float bnB = texture2D(texture, vec2(bnUvX - rgbDiff, vUv.y)).b * bnMask;
            vec4 blockNoise = vec4(bnR, bnG, bnB, 1.0);
          
            float bnTime2 = floor(time * 25.0) * 300.0;
            float noiseX2 = step((snoise3(vec3(0.0, vUv.x * 2.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.5);
            float noiseY2 = step((snoise3(vec3(0.0, vUv.y * 8.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.3);
            float bnMask2 = noiseX2 * noiseY2;
            float bnR2 = texture2D(texture, vec2(bnUvX + rgbDiff, vUv.y)).r * bnMask2;
            float bnG2 = texture2D(texture, vec2(bnUvX, vUv.y)).g * bnMask2;
            float bnB2 = texture2D(texture, vec2(bnUvX - rgbDiff, vUv.y)).b * bnMask2;
            vec4 blockNoise2 = vec4(bnR2, bnG2, bnB2, 1.0);
          
            float waveNoise = (sin(vUv.y * 1200.0) + 1.0) / 2.0 * (0.15 + strength * 0.2);
          
            gl_FragColor = vec4(r, g, b, 1.0) * (1.0 - bnMask - bnMask2) + (whiteNoise + blockNoise + blockNoise2 - waveNoise);
          }
        ` }));


  }
  render(time) {
    this.uniforms.time.value += time;
  }
  resize() {
    this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }}


class ConsoleSignature {
  constructor() {
    this.message = `created by yoichi kobayashi`;
    this.url = `http://www.tplh.net`;
    this.show();
  }
  show() {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      const args = [
      `\n%c ${this.message} %c%c ${this.url} \n\n`,
      'color: #fff; background: #222; padding:3px 0;',
      'padding:3px 1px;',
      'color: #fff; background: #47c; padding:3px 0;'];

      console.log.apply(console, args);
    } else if (window.console) {
      console.log(`${this.message} ${this.url}`);
    }
  }}


const debounce = (callback, duration) => {
  var timer;
  return function (event) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback(event);
    }, duration);
  };
};

const canvas = document.getElementById('canvas-webgl');
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas });

const renderBack1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
const sceneBack = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const cameraBack = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const clock = new THREE.Clock();

//
// process for this sketch.
//

const bgImg = new BackgroundImage();
const postEffect = new PostEffect(renderBack1.texture);
const consoleSignature = new ConsoleSignature();

//
// common process
//
const resizeWindow = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cameraBack.aspect = window.innerWidth / window.innerHeight;
  cameraBack.updateProjectionMatrix();
  bgImg.resize();
  postEffect.resize();
  renderBack1.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
};
const render = () => {
  const time = clock.getDelta();
  renderer.render(sceneBack, cameraBack, renderBack1);
  postEffect.render(time);
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};

const on = () => {
  window.addEventListener('resize', debounce(() => {
    resizeWindow();
  }), 1000);
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x111111, 1.0);
  cameraBack.position.set(0, 0, 100);
  cameraBack.lookAt(new THREE.Vector3());

  bgImg.init('data:image/jpeg;base64,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', () => {
    sceneBack.add(bgImg.obj);
    scene.add(postEffect.obj);
  });

  on();
  resizeWindow();
  renderLoop();
};
init();
