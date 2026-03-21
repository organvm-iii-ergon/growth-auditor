"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

export default function SpaceTimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let stars: Star[] = [];
      let speed: number = 20;

      class Star {
        x: number;
        y: number;
        z: number;
        pz: number;
        color: p5.Color;

        constructor() {
          this.x = p.random(-p.width * 2, p.width * 2);
          this.y = p.random(-p.height * 2, p.height * 2);
          this.z = p.random(p.width * 2);
          this.pz = this.z;
          
          // Mimic the "Stargate" or "Interstellar" color shifts
          const r = p.random(100, 255);
          const g = p.random(150, 255);
          const b = 255;
          this.color = p.color(r, g, b);
        }

        update() {
          this.z = this.z - speed;
          if (this.z < 1) {
            this.z = p.width * 2;
            this.x = p.random(-p.width * 2, p.width * 2);
            this.y = p.random(-p.height * 2, p.height * 2);
            this.pz = this.z;
          }
        }

        show() {
          let sx = p.map(this.x / this.z, 0, 1, 0, p.width / 2);
          let sy = p.map(this.y / this.z, 0, 1, 0, p.height / 2);

          let r = p.map(this.z, 0, p.width * 2, 8, 0);

          let px = p.map(this.x / this.pz, 0, 1, 0, p.width / 2);
          let py = p.map(this.y / this.pz, 0, 1, 0, p.height / 2);

          this.pz = this.z;

          // Streak effect
          p.stroke(this.color);
          p.strokeWeight(r);
          p.line(px, py, sx, sy);
          
          // Occasional "pulse" stars
          if (p.random(1) > 0.99) {
            p.noStroke();
            p.fill(255, 255, 255, 200);
            p.circle(sx, sy, r * 2);
          }
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style("z-index", "-2");
        for (let i = 0; i < 1200; i++) {
          stars[i] = new Star();
        }
      };

      p.draw = () => {
        // Darker background with more trail for "motion blur" feel
        p.background(3, 7, 20, 40); 
        p.translate(p.width / 2, p.height / 2);
        
        // Speed fluctuates slightly like a warp engine
        speed = 25 + p.sin(p.frameCount * 0.01) * 10;
        
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
        background: "#02050f"
      }} 
    />
  );
}
