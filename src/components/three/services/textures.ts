"use client";

import * as THREE from "three";
import { MARK, sPath } from "@/lib/monogram";

/** Procedural imagery for the service objects: event prints, screens. */

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string, dot = true) {
  const scale = h / MARK.height;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = MARK.stroke;
  ctx.stroke(new Path2D(sPath(0)));
  ctx.beginPath();
  ctx.arc(MARK.sWidth + MARK.gap + 50, 50, 50 - MARK.stroke / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.stroke(new Path2D(sPath(MARK.sWidth + MARK.gap * 2 + MARK.oSize)));
  if (dot) {
    ctx.fillStyle = "#b00020";
    ctx.beginPath();
    ctx.arc(MARK.sWidth + MARK.gap + 50, 50, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** An event photograph: stage lights, bokeh, a crowd in silhouette. */
export function eventPrint(seed: number) {
  return make(`print-${seed}`, 640, 440, (ctx) => {
    const r = rng(seed + 3);
    const W = 640;
    const H = 440;
    const border = 18;
    ctx.fillStyle = "#e9e6e1";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(border, border, W - border * 2, H - border * 2 - 22);
    ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#050505");
    g.addColorStop(0.55, seed % 2 ? "#1a0204" : "#0d0d0d");
    g.addColorStop(1, "#030303");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // stage light beams
    for (let i = 0; i < 3; i++) {
      const x = W * (0.2 + r() * 0.6);
      const beam = ctx.createLinearGradient(x, 0, x, H * 0.8);
      beam.addColorStop(0, i === 1 ? "rgba(255,255,255,0.35)" : "rgba(176,0,32,0.55)");
      beam.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(x - 6, 0);
      ctx.lineTo(x + 6, 0);
      ctx.lineTo(x + 90 + r() * 60, H * 0.8);
      ctx.lineTo(x - 90 - r() * 60, H * 0.8);
      ctx.fill();
    }
    // bokeh
    for (let i = 0; i < 22; i++) {
      const x = r() * W;
      const y = r() * H * 0.6;
      const rad = 6 + r() * 22;
      const b = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const red = r() > 0.35;
      b.addColorStop(0, red ? "rgba(200,20,40,0.55)" : "rgba(255,255,255,0.35)");
      b.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = b;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // crowd silhouettes
    ctx.fillStyle = "#020202";
    let x = border - 20;
    while (x < W) {
      const w = 36 + r() * 30;
      const top = H * (0.58 + r() * 0.1);
      ctx.beginPath();
      ctx.ellipse(x + w / 2, top, w * 0.28, w * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x, top + w * 0.25, w, H, w * 0.4);
      ctx.fill();
      if (r() > 0.75) {
        ctx.fillRect(x + w * 0.7, top - w * 0.9, 7, w * 0.9);
      }
      x += w * (0.7 + r() * 0.4);
    }
    ctx.restore();
    ctx.fillStyle = "#6f6b66";
    ctx.font = "500 13px Helvetica, Arial, sans-serif";
    ctx.fillText(`SOS  ·  ${String(seed).padStart(3, "0")}`, border, H - 12);
  });
}

/** A phone app screen in the SOS language. */
export function appScreen() {
  return make("app", 600, 1260, (ctx) => {
    const W = 600;
    const H = 1260;
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, W, H);
    // status bar
    ctx.fillStyle = "#9a9a9a";
    ctx.font = "600 26px Helvetica, Arial, sans-serif";
    ctx.fillText("9:41", 48, 70);
    ctx.fillRect(W - 110, 52, 60, 22);
    drawMark(ctx, 48, 130, 34, "#f5f5f5");
    // hero card
    const card = ctx.createLinearGradient(0, 220, 0, 760);
    card.addColorStop(0, "#1c0205");
    card.addColorStop(1, "#070707");
    ctx.fillStyle = card;
    ctx.beginPath();
    ctx.roundRect(40, 220, W - 80, 540, 36);
    ctx.fill();
    const glow = ctx.createRadialGradient(W / 2, 470, 0, W / 2, 470, 220);
    glow.addColorStop(0, "rgba(200,10,40,0.85)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(W / 2, 470, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,245,245,0.9)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(W / 2, 470, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "600 56px Helvetica, Arial, sans-serif";
    ctx.fillText("Your idea,", 76, 700);
    // rows
    for (let i = 0; i < 3; i++) {
      const y = 810 + i * 108;
      ctx.fillStyle = "#121212";
      ctx.beginPath();
      ctx.roundRect(40, y, W - 80, 88, 22);
      ctx.fill();
      ctx.fillStyle = i === 0 ? "#b00020" : "#2a2a2a";
      ctx.beginPath();
      ctx.arc(92, y + 44, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(130, y + 32, 220 - i * 40, 12);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(130, y + 54, 140, 10);
    }
    // cta
    ctx.fillStyle = "#b00020";
    ctx.beginPath();
    ctx.roundRect(40, H - 150, W - 80, 92, 46);
    ctx.fill();
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "600 28px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("START", W / 2, H - 94);
  });
}

/** Website hero for the browser object: quiet blocks, one red point. */
export function webHero() {
  return make("webhero", 1100, 320, (ctx) => {
    const W = 1100;
    const H = 320;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.76, H * 0.52, 0, W * 0.76, H * 0.52, 220);
    glow.addColorStop(0, "rgba(176,0,32,0.55)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    // headline, as two confident bars
    ctx.fillStyle = "#e6e6e6";
    ctx.fillRect(60, 96, 430, 44);
    ctx.fillRect(60, 158, 300, 44);
    ctx.fillStyle = "#5a5a5a";
    ctx.fillRect(60, 236, 240, 8);
    // the O, with its point of view
    ctx.strokeStyle = "rgba(245,245,245,0.9)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(W * 0.76, H * 0.52, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e0112f";
    ctx.beginPath();
    ctx.arc(W * 0.76, H * 0.52, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}
