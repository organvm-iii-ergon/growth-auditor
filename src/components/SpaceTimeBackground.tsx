"use client";

import React, { useEffect, useRef, useCallback } from "react";

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

// ═══════════════════════════════════════════════════════════════
// STARGATE + WORMHOLE SHADER
// Mode A: 2001 slit-scan — violent radial rays, grid striations
// Mode B: Interstellar — dense churning fluid dynamics
// Both coexist, blended by depth and time
// ═══════════════════════════════════════════════════════════════
const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_orientation;
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
// Domain warped FBM — creates the churning fluid look
float warpedFbm(vec2 p,float t){
  vec2 q=vec2(fbm(p+vec2(0.,0.)),fbm(p+vec2(5.2,1.3)));
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

  // Sensor warps
  uv+=vec2(u_orientation.z*.003,u_orientation.y*.002);
  vec2 mUV=(u_mouse-.5)*2.;
  float mD=length(uv-mUV);
  uv+=(uv-mUV)*(.08/(mD+.5))*.06;

  float lonI=u_lon/180.;
  float latI=u_lat/90.;

  float angle=atan(uv.y,uv.x)+lonI*.3;
  float radius=length(uv);
  float depth=.5/(radius+.008);

  vec3 tod=todPalette(u_hour);
  vec3 color=vec3(0.);

  // ════════════════════════════════════════
  // MODE A: 2001 STARGATE — RADIAL LIGHT RAYS
  // ════════════════════════════════════════

  // Sharp radial rays from center — the slit-scan photography effect
  float numRays=12.;
  float rayAngle=angle*numRays;
  // Sharp rays with pow() for intensity falloff
  float rays=pow(abs(sin(rayAngle+t*.3)),8.)*.7;
  rays+=pow(abs(sin(rayAngle*2.3+t*.5+1.)),12.)*.4;
  rays+=pow(abs(sin(rayAngle*.7-t*.2+3.)),6.)*.3;

  // Motion blur streaks — radial lines stretching from center
  float streak=pow(max(0.,1.-radius*1.2),.3);
  rays*=streak;

  // Grid/venetian-blind striations across the rays
  float grid=abs(sin(depth*20.+t*1.5))*.5+.5;
  grid*=abs(sin(depth*8.+angle*3.+t*.8))*.5+.5;
  rays*=(.5+grid*.5);

  // Color: each ray gets its own hue based on angle
  float rayHue=fract(angle/6.283+tod.x+depth*.03);
  vec3 rayColor=hsv2rgb(vec3(rayHue,tod.y,rays*tod.z));

  // Extra saturated color bands at different angles
  float band1=pow(abs(sin(angle*1.+.5)),20.)*smoothstep(.5,.0,radius);
  float band2=pow(abs(sin(angle*1.+2.1)),20.)*smoothstep(.5,.0,radius);
  float band3=pow(abs(sin(angle*1.+3.7)),20.)*smoothstep(.5,.0,radius);
  rayColor+=hsv2rgb(vec3(fract(tod.x+.0),1.,band1*1.5));
  rayColor+=hsv2rgb(vec3(fract(tod.x+.33),1.,band2*1.2));
  rayColor+=hsv2rgb(vec3(fract(tod.x+.66),1.,band3*1.));

  color+=rayColor;

  // ════════════════════════════════════════
  // MODE B: INTERSTELLAR — CHURNING FLUID
  // ════════════════════════════════════════

  // Domain-warped FBM creates dense turbulent fluid filling the frame
  vec2 fluidCoord=uv*1.5+vec2(t*.02,t*.015);
  float fluid=warpedFbm(fluidCoord,t);
  float fluid2=warpedFbm(fluidCoord*1.3+vec2(3.1,7.2),t*.7);

  // Fluid is most visible at mid-radius (surrounding the central rays)
  float fluidMask=smoothstep(.05,.25,radius)*smoothstep(1.2,.4,radius);

  // Fluid color — golden/amber dominant (like Interstellar wormhole)
  float fluidHue=fract(tod.x-.05+fluid*.15+latI*.05);
  float fluidSat=.7+fluid2*.3;
  float fluidVal=fluid*fluidMask*1.2*tod.z;
  // Internal luminosity — bright swirls within the fluid
  fluidVal+=pow(fluid2,.5)*fluidMask*.4;

  vec3 fluidColor=hsv2rgb(vec3(fluidHue,fluidSat*tod.y,fluidVal));

  // Green/amber swirls (like Project Hail Mary / Interstellar approach)
  float swirl=warpedFbm(uv*2.+vec2(t*.01,-t*.02),t*1.2);
  float swirlMask=smoothstep(.15,.5,radius)*smoothstep(1.5,.6,radius);
  vec3 swirlColor=hsv2rgb(vec3(fract(tod.x+.1),.8,swirl*swirlMask*.6*tod.z));

  color+=fluidColor+swirlColor;

  // ════════════════════════════════════════
  // CENTRAL SINGULARITY — explosive white core
  // ════════════════════════════════════════
  float core=exp(-radius*8.)*1.5;
  // Secondary glow ring
  float ring=exp(-pow(radius-.08,2.)*200.)*.5;
  color+=vec3(core+ring);

  // ════════════════════════════════════════
  // POST-PROCESSING
  // ════════════════════════════════════════

  // Chromatic aberration — stronger than before
  float ab=radius*.06;
  vec3 shifted=color;
  shifted.r*=1.+ab;
  shifted.b*=1.-ab*.5;
  color=mix(color,shifted,.8);

  // Bloom — brighten already-bright areas
  float lum=dot(color,vec3(.299,.587,.114));
  color+=color*smoothstep(.5,1.5,lum)*.3;

  // Vignette — less aggressive to keep edges vivid
  color*=1.-smoothstep(.7,1.8,radius)*.4;

  // Film grain
  color+=(hash(gl_FragCoord.xy+t)-.5)*.015;

  // Latitude color influence
  color*=1.+latI*uv.y*.08;

  // Clamp to prevent fireflies but keep HDR brightness
  gl_FragColor=vec4(clamp(color,0.,3.),1.);
}
`;

export default function SpaceTimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(Date.now());
  const orientRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const geoRef = useRef({ lat: 0, lon: 0 });
  const speedRef = useRef(1.0);
  const hourRef = useRef(new Date().getHours() + new Date().getMinutes() / 60);

  useEffect(() => {
    const h = (e: DeviceOrientationEvent) => { orientRef.current = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 }; };
    window.addEventListener("deviceorientation", h);
    return () => window.removeEventListener("deviceorientation", h);
  }, []);

  useEffect(() => {
    const m = (e: MouseEvent) => { mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight }; };
    const t = (e: TouchEvent) => { const tc = e.touches[0]; if (tc) mouseRef.current = { x: tc.clientX / window.innerWidth, y: 1 - tc.clientY / window.innerHeight }; };
    window.addEventListener("mousemove", m);
    window.addEventListener("touchmove", t, { passive: true });
    return () => { window.removeEventListener("mousemove", m); window.removeEventListener("touchmove", t); };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => { geoRef.current = { lat: p.coords.latitude, lon: p.coords.longitude }; },
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    const h = () => { const mx = document.documentElement.scrollHeight - window.innerHeight; speedRef.current = 0.6 + (mx > 0 ? (window.scrollY / mx) * 1.4 : 0); };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const i = setInterval(() => { hourRef.current = new Date().getHours() + new Date().getMinutes() / 60; }, 60000);
    return () => clearInterval(i);
  }, []);

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
    const uTime=u("u_time"),uRes=u("u_resolution"),uMouse=u("u_mouse"),uOrient=u("u_orientation"),
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
      const o = orientRef.current, m = mouseRef.current, g = geoRef.current;
      gl.uniform1f(uTime, elapsed); gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, m.x, m.y); gl.uniform3f(uOrient, o.alpha, o.beta, o.gamma);
      gl.uniform1f(uLat, g.lat); gl.uniform1f(uLon, g.lon);
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
