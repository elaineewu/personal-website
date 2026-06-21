"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  heading: number;
  turnPhase: number;
  turnFreq: number;
  speed: number;
};

const PARTICLE_COUNT = 48;
const ACCENT = "#5eead4";
const CONNECT_DISTANCE = 170;
const MAX_LINE_OPACITY = 0.2;

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let scrollIdleFrames = 0;
    let elapsed = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const heading = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.18 + 0.08;

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(heading) * speed,
          vy: Math.sin(heading) * speed,
          radius: Math.random() * 1.2 + 1.0,
          opacity: Math.random() * 0.24 + 0.16,
          heading,
          turnPhase: Math.random() * Math.PI * 2,
          turnFreq: Math.random() * 0.0008 + 0.00035,
          speed,
        };
      });
    };

    const wrapParticle = (particle: Particle) => {
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
    };

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastScrollTime, 1);
      const deltaY = window.scrollY - lastScrollY;
      const instant = (deltaY / dt) * 16.67;

      scrollVelocity = scrollVelocity * 0.55 + instant * 0.45;
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      scrollIdleFrames = 0;
    };

    const animate = (time: number) => {
      if (!elapsed) elapsed = time;
      elapsed = time;

      scrollIdleFrames += 1;
      if (scrollIdleFrames > 8) {
        scrollVelocity *= 0.94;
      }

      const windForce = scrollVelocity * 0.035;

      for (const particle of particles) {
        const turn =
          Math.sin(time * particle.turnFreq + particle.turnPhase) * 0.012 +
          Math.cos(time * particle.turnFreq * 0.7 + particle.turnPhase * 1.4) *
            0.008;

        particle.heading += turn;
        particle.vx += Math.cos(particle.heading) * 0.004;
        particle.vy += Math.sin(particle.heading) * 0.004;

        particle.vy += -windForce;
        particle.vx += windForce * 0.05;

        particle.vx *= 0.965;
        particle.vy *= 0.965;

        const currentSpeed = Math.hypot(particle.vx, particle.vy) || 0.001;
        const targetSpeed = particle.speed;
        particle.vx = (particle.vx / currentSpeed) * targetSpeed;
        particle.vy = (particle.vy / currentSpeed) * targetSpeed;

        particle.x += particle.vx;
        particle.y += particle.vy;

        wrapParticle(particle);
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy);

          if (distance < CONNECT_DISTANCE) {
            const fade = 1 - distance / CONNECT_DISTANCE;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = ACCENT;
            ctx.globalAlpha = fade * fade * MAX_LINE_OPACITY;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();

    const onResize = () => {
      resize();
      initParticles();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
