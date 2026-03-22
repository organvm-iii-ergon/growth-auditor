"use client";

import React, { useEffect, useRef, useCallback } from "react";

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_touch;
uniform vec3 u_gyro;        // DOMINANT: alpha(compass), beta(tilt fwd/back), gamma(tilt L/R)
uniform float u_lat,u_lon,u_hour,u_speed;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<7;i++){v+=a*noise(p);p=r*p*2.1;a*=.48;}
  return v;
}
float warpedFbm(vec2 p,float t){
  vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
  vec2 r=vec2(fbm(p+4.*q+vec2(1.7+t*.05,9.2)),fbm(p+4.*q+vec2(8.3+t*.03,2.8)));
  return fbm(p+4.*r);
}
vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}
vec3 todPalette(float h){
  if(h<5.)return vec3(.72,.9,.5);
  if(h<8.)return vec3(.06,.95,.8);
  if(h<17.)return vec3(.0,1.,.95);
  if(h<21.)return vec3(.83,.95,.8);
  return vec3(.72,.85,.55);
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
  float t=u_time*u_speed;

  // ═══ GYROSCOPE — PRIMARY INTERACTION ═══
  // gamma: left/right tilt (-90 to 90) → shifts vanishing point horizontally
  // beta: front/back tilt (-180 to 180) → shifts vanishing point vertically + warps depth
  // alpha: compass heading (0-360) → rotates the entire tunnel
  float gyroX = u_gyro.z / 30.;     // gamma → strong horizontal shift
  float gyroY = u_gyro.y / 50.;     // beta → vertical shift
  float gyroRot = u_gyro.x / 180. * 3.14159; // alpha → full rotation mapped to PI

  // Shift the vanishing point based on how user holds the phone
  uv += vec2(gyroX, gyroY);

  // Touch/mouse — secondary, subtle
  vec2 tUV = (u_touch - .5) * 2.;
  float tD = length(uv - tUV);
  uv += (uv - tUV) * (.05 / (tD + .6)) * .04;

  float lonI = u_lon / 180.;
  float latI = u_lat / 90.;

  // Gyroscope rotates the tunnel angle
  float angle = atan(uv.y, uv.x) + gyroRot + lonI * .3;
  float radius = length(uv);
  float depth = .5 / (radius + .008);

  // Beta tilt warps perceived depth — tilt forward = deeper, back = shallower
  depth *= 1. + u_gyro.y * .005;

  vec3 tod = todPalette(u_hour);
  vec3 color = vec3(0.);

  // ═══ STARGATE RADIAL RAYS ═══
  float numRays = 12.;
  float rayAngle = angle * numRays;
  float rays = pow(abs(sin(rayAngle + t * .3)), 8.) * .7;
  rays += pow(abs(sin(rayAngle * 2.3 + t * .5 + 1.)), 12.) * .4;
  rays += pow(abs(sin(rayAngle * .7 - t * .2 + 3.)), 6.) * .3;

  float streak = pow(max(0., 1. - radius * 1.2), .3);
  rays *= streak;

  float grid = abs(sin(depth * 20. + t * 1.5)) * .5 + .5;
  grid *= abs(sin(depth * 8. + angle * 3. + t * .8)) * .5 + .5;
  rays *= (.5 + grid * .5);

  // Gyro gamma shifts which ray colors are dominant
  float rayHue = fract(angle / 6.283 + tod.x + depth * .03 + gyroX * .1);
  vec3 rayColor = hsv2rgb(vec3(rayHue, tod.y, rays * tod.z));

  // Color bands — position influenced by gyroscope
  float band1 = pow(abs(sin(angle * 1. + .5 + gyroRot)), 20.) * smoothstep(.5, .0, radius);
  float band2 = pow(abs(sin(angle * 1. + 2.1 + gyroRot)), 20.) * smoothstep(.5, .0, radius);
  float band3 = pow(abs(sin(angle * 1. + 3.7 + gyroRot)), 20.) * smoothstep(.5, .0, radius);
  rayColor += hsv2rgb(vec3(fract(tod.x), 1., band1 * 1.5));
  rayColor += hsv2rgb(vec3(fract(tod.x + .33), 1., band2 * 1.2));
  rayColor += hsv2rgb(vec3(fract(tod.x + .66), 1., band3 * 1.));

  color += rayColor;

  // ═══ INTERSTELLAR CHURNING FLUID ═══
  // Gyro tilts shift the fluid coordinates — tilting the phone stirs the fluid
  vec2 fluidCoord = uv * 1.5 + vec2(t * .02 + gyroX * .3, t * .015 + gyroY * .2);
  float fluid = warpedFbm(fluidCoord, t);
  float fluid2 = warpedFbm(fluidCoord * 1.3 + vec2(3.1, 7.2), t * .7);

  float fluidMask = smoothstep(.05, .25, radius) * smoothstep(1.2, .4, radius);

  float fluidHue = fract(tod.x - .05 + fluid * .15 + latI * .05);
  float fluidVal = fluid * fluidMask * 1.2 * tod.z + pow(fluid2, .5) * fluidMask * .4;
  vec3 fluidColor = hsv2rgb(vec3(fluidHue, (.7 + fluid2 * .3) * tod.y, fluidVal));

  float swirl = warpedFbm(uv * 2. + vec2(t * .01 + gyroX * .2, -t * .02 + gyroY * .15), t * 1.2);
  float swirlMask = smoothstep(.15, .5, radius) * smoothstep(1.5, .6, radius);
  vec3 swirlColor = hsv2rgb(vec3(fract(tod.x + .1), .8, swirl * swirlMask * .6 * tod.z));

  color += fluidColor + swirlColor;

  // ═══ CENTRAL SINGULARITY ═══
  float core = exp(-radius * 8.) * 1.5;
  float ring = exp(-pow(radius - .08, 2.) * 200.) * .5;
  color += vec3(core + ring);

  // ═══ POST ═══
  float ab = radius * .06;
  color.r *= 1. + ab;
  color.b *= 1. - ab * .5;

  float lum = dot(color, vec3(.299, .587, .114));
  color += color * smoothstep(.5, 1.5, lum) * .3;

  color *= 1. - smoothstep(.7, 1.8, radius) * .4;
  color += (hash(gl_FragCoord.xy + t) - .5) * .015;
  color *= 1. + latI * uv.y * .08;

  gl_FragColor = vec4(clamp(color, 0., 3.), 1.);
}
`;

export default function SpaceTimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(Date.now());
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const touchRef = useRef({ x: 0.5, y: 0.5 });
  const geoRef = useRef({ lat: 0, lon: 0 });
  const speedRef = useRef(1.0);
  const hourRef = useRef(new Date().getHours() + new Date().getMinutes() / 60);
  const permissionRequestedRef = useRef(false);

  // ═══ GYROSCOPE — request permission on iOS, listen everywhere ═══
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      gyroRef.current = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 };
    };

    const requestAndListen = async () => {
      // iOS 13+ requires explicit permission request via user gesture
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (DOE.requestPermission) {
        try {
          const perm = await DOE.requestPermission();
          if (perm === "granted") {
            window.addEventListener("deviceorientation", handler);
          }
        } catch {
          // denied — fall back to desktop interaction
        }
      } else {
        // Android / desktop — no permission needed
        window.addEventListener("deviceorientation", handler);
      }
    };

    // Request on first user interaction (required for iOS)
    const onInteract = () => {
      if (permissionRequestedRef.current) return;
      permissionRequestedRef.current = true;
      requestAndListen();
    };

    window.addEventListener("click", onInteract, { once: false });
    window.addEventListener("touchstart", onInteract, { once: false });

    // Also try immediately (works on Android without gesture)
    requestAndListen();

    return () => {
      window.removeEventListener("deviceorientation", handler);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  // Touch position (mobile primary)
  useEffect(() => {
    const onTouch = (e: TouchEvent) => {
      const tc = e.touches[0];
      if (tc) touchRef.current = { x: tc.clientX / window.innerWidth, y: 1 - tc.clientY / window.innerHeight };
    };
    const onMouse = (e: MouseEvent) => {
      touchRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight };
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => { window.removeEventListener("touchmove", onTouch); window.removeEventListener("mousemove", onMouse); };
  }, []);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => { geoRef.current = { lat: p.coords.latitude, lon: p.coords.longitude }; },
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  // Scroll speed
  useEffect(() => {
    const h = () => { const mx = document.documentElement.scrollHeight - window.innerHeight; speedRef.current = 0.6 + (mx > 0 ? (window.scrollY / mx) * 1.4 : 0); };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Time of day
  useEffect(() => {
    const i = setInterval(() => { hourRef.current = new Date().getHours() + new Date().getMinutes() / 60; }, 60000);
    return () => clearInterval(i);
  }, []);

  // ═══ WebGL ═══
  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(VERT, gl.VERTEX_SHADER), fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime=u("u_time"),uRes=u("u_resolution"),uTouch=u("u_touch"),uGyro=u("u_gyro"),
          uLat=u("u_lat"),uLon=u("u_lon"),uHour=u("u_hour"),uSpeed=u("u_speed");

    startRef.current = Date.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px"; canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize(); window.addEventListener("resize", resize);

    const render = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const g = gyroRef.current, tc = touchRef.current, geo = geoRef.current;
      gl.uniform1f(uTime, elapsed); gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uTouch, tc.x, tc.y); gl.uniform3f(uGyro, g.alpha, g.beta, g.gamma);
      gl.uniform1f(uLat, geo.lat); gl.uniform1f(uLon, geo.lon);
      gl.uniform1f(uHour, hourRef.current); gl.uniform1f(uSpeed, speedRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => { const cleanup = initGL(); return () => cleanup?.(); }, [initGL]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -5, pointerEvents: "none" }} />;
}
