"use client";

import { useEffect, useRef } from "react";

export function NoiseOverlay() {
  return <div className="noise-overlay fixed inset-0 pointer-events-none" />;
}

export function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 256;
    canvas.height = 256;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(canvas);

    let frameId: number;
    let frame = 0;
    let running = false;

    const render = () => {
      if (!running) return;
      if (frame % 3 === 0) {
        const imageData = ctx.createImageData(256, 256);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 12;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      frame++;
      frameId = requestAnimationFrame(render);
    };

    function start() {
      if (running) return;
      running = true;
      render();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frameId);
    }

    return () => {
      stop();
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-30"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
