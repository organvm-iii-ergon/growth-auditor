"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

export default function SpaceTimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let stars: Star[] = [];
      let speed: number;

      class Star {
        x: number;
        y: number;
        z: number;
        pz: number;

        constructor() {
          this.x = p.random(-p.width, p.width);
          this.y = p.random(-p.height, p.height);
          this.z = p.random(p.width);
          this.pz = this.z;
        }

        update() {
          this.z = this.z - speed;
          if (this.z < 1) {
            this.z = p.width;
            this.x = p.random(-p.width, p.width);
            this.y = p.random(-p.height, p.height);
            this.pz = this.z;
          }
        }

        show() {
          p.fill(255);
          p.noStroke();

          let sx = p.map(this.x / this.z, 0, 1, 0, p.width);
          let sy = p.map(this.y / this.z, 0, 1, 0, p.height);

          let r = p.map(this.z, 0, p.width, 12, 0);
          // p.ellipse(sx, sy, r, r);

          let px = p.map(this.x / this.pz, 0, 1, 0, p.width);
          let py = p.map(this.y / this.pz, 0, 1, 0, p.height);

          this.pz = this.z;

          p.stroke(100, 150, 255, p.map(this.z, 0, p.width, 255, 0));
          p.strokeWeight(r);
          p.line(px, py, sx, sy);
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style("z-index", "-2");
        for (let i = 0; i < 800; i++) {
          stars[i] = new Star();
        }
      };

      p.draw = () => {
        speed = 15;
        p.background(5, 10, 25, 50); // Slight trail effect
        p.translate(p.width / 2, p.height / 2);
        for (let i = 0; i < stars.length; i++) {
          stars[i].update();
          stars[i].show();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: -2, 
        pointerEvents: "none",
        background: "#050a19"
      }} 
    />
  );
}
