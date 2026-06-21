"use client";

import { useEffect, useRef } from "react";

export function BackgroundBeams() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    class Beam {
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      hue: number;
      alpha: number;
      bw: number;
      bh: number;

      constructor(w: number, h: number) {
        this.bw = w;
        this.bh = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.width = Math.random() * 300 + 100;
        this.hue = Math.random() * 30 + 350;
        this.alpha = Math.random() * 0.08 + 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -this.width) this.x = this.bw + this.width;
        if (this.x > this.bw + this.width) this.x = -this.width;
        if (this.y < -this.width) this.y = this.bh + this.width;
        if (this.y > this.bh + this.width) this.y = -this.width;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 50%, ${this.alpha})`);
        gradient.addColorStop(0.3, `hsla(${this.hue + 30}, 70%, 60%, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue + 60}, 60%, 70%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width, this.y - this.width, this.width * 2, this.width * 2);
      }
    }

    const beams = Array.from({ length: 8 }, () => new Beam(canvas.width, canvas.height));

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      beams.forEach((beam) => {
        beam.update();
        beam.draw(ctx);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
