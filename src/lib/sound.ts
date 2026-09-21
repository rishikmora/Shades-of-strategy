"use client";

/**
 * Optional ambience, synthesised with Web Audio — no audio files.
 * Off by default. Nothing is created until the visitor turns it on.
 *
 *  - a low drone (A1 + E2) through a slowly breathing low-pass filter
 *  - soft "air" (filtered noise), opening up with scroll speed
 *  - a quiet mechanical shutter tick for moments of emphasis
 */

type Listener = (on: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private air: BiquadFilterNode | null = null;
  private raf = 0;
  private listeners = new Set<Listener>();
  on = false;

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }

  private emit() {
    this.listeners.forEach((l) => l(this.on));
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 8;
    master.connect(limiter).connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 260;
    filter.Q.value = 0.6;
    filter.connect(master);

    const voice = (freq: number, type: OscillatorType, gain: number, detune = 0) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g).connect(filter);
      o.start();
    };
    voice(55, "sine", 0.32);
    voice(55, "sawtooth", 0.035, -6);
    voice(82.41, "triangle", 0.09, 4);
    voice(110, "sine", 0.05, -3);

    // breathing filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    // air
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const air = ctx.createBiquadFilter();
    air.type = "bandpass";
    air.frequency.value = 420;
    air.Q.value = 0.5;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.22;
    noise.connect(air).connect(airGain).connect(master);
    noise.start();

    this.ctx = ctx;
    this.master = master;
    this.filter = filter;
    this.air = air;
  }

  async enable() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    await ctx.resume();
    const g = this.master!.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.5, ctx.currentTime + 2.4);
    this.on = true;
    this.emit();
    this.follow();
  }

  disable() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const g = this.master.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    this.on = false;
    this.emit();
    cancelAnimationFrame(this.raf);
    window.setTimeout(() => {
      if (!this.on) ctx.suspend();
    }, 700);
  }

  toggle() {
    return this.on ? this.disable() : this.enable();
  }

  /** The air opens slightly while the page is moving. */
  private follow() {
    let lastY = window.scrollY;
    let v = 0;
    const loop = () => {
      const y = window.scrollY;
      v += (Math.min(60, Math.abs(y - lastY)) - v) * 0.08;
      lastY = y;
      if (this.air && this.ctx) this.air.frequency.setTargetAtTime(420 + v * 28, this.ctx.currentTime, 0.2);
      if (this.filter && this.ctx) this.filter.Q.setTargetAtTime(0.6 + v * 0.02, this.ctx.currentTime, 0.3);
      if (this.on) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** A quiet two-part shutter tick. */
  shutter() {
    if (!this.on || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const click = (at: number, freq: number, level: number) => {
      const len = Math.floor(ctx.sampleRate * 0.03);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = 1.4;
      const g = ctx.createGain();
      g.gain.value = level;
      src.connect(bp).connect(g).connect(this.master!);
      src.start(ctx.currentTime + at);
    };
    click(0, 2600, 0.35);
    click(0.055, 1700, 0.25);
  }
}

export const sound = typeof window !== "undefined" ? new SoundEngine() : null;
