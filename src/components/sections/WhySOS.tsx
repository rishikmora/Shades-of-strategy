"use client";

import { useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { RevealLines } from "@/components/ui/RevealLines";

const { why } = siteConfig;

/**
 * Two layouts for the trajectory. Points are in the SVG's own units and the
 * nodes are placed at the same coordinates, as percentages.
 */
const LAYOUTS = {
  wide: {
    viewBox: [1000, 520] as const,
    d: "M -10 40 C 120 40, 90 150, 170 160 S 420 330, 500 330 S 760 450, 840 440 S 990 400, 1010 470",
    nodes: [
      [170, 160],
      [500, 330],
      [840, 440],
    ],
  },
  narrow: {
    viewBox: [400, 1000] as const,
    d: "M 200 -10 C 200 80, 80 120, 90 220 S 320 420, 310 520 S 90 700, 110 800 S 210 960, 200 1010",
    nodes: [
      [90, 220],
      [310, 520],
      [110, 800],
    ],
  },
};

function Trajectory({ layout, className }: { layout: keyof typeof LAYOUTS; className: string }) {
  const L = LAYOUTS[layout];
  const [w, h] = L.viewBox;
  return (
    <div data-trajectory={layout} className={`relative ${className}`}>
      <svg
        data-d={L.d}
        data-w={w}
        data-h={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <path data-track d={L.d} fill="none" stroke="rgba(245,245,245,0.08)" strokeWidth={1} />
        <path
          data-path
          d={L.d}
          fill="none"
          stroke="#b00020"
          strokeWidth={1.5}
          style={{ filter: "drop-shadow(0 0 6px rgba(176,0,32,0.9))" }}
        />
      </svg>
      <span
        data-head
        aria-hidden
        className="absolute top-0 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2a44] opacity-0"
        style={{ boxShadow: "0 0 18px 4px rgba(176,0,32,0.9), 0 0 60px 12px rgba(176,0,32,0.35)" }}
      />
      <ol className="absolute inset-0">
        {why.path.map((word, i) => {
          const [x, y] = L.nodes[i];
          const left = (x / w) * 100;
          const top = (y / h) * 100;
          const alignRight = layout === "narrow" ? i === 1 : i === 2;
          return (
            <li
              key={word}
              data-node
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span className="absolute -top-[5px] -left-[5px] block h-2.5 w-2.5 rounded-full border border-bone/40 bg-void">
                <span data-node-core className="absolute inset-[2px] rounded-full bg-red opacity-0" />
              </span>
              <span
                data-node-label
                className={`display absolute top-5 block text-[clamp(2rem,4.6vw,4.6rem)] whitespace-nowrap text-bone/15 ${
                  alignRight ? "right-2" : "left-2"
                }`}
              >
                {word}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function WhySOS() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const observers: ResizeObserver[] = [];
      el.querySelectorAll<HTMLElement>("[data-trajectory]").forEach((box) => {
        const path = box.querySelector<SVGPathElement>("[data-path]");
        const track = box.querySelector<SVGPathElement>("[data-track]");
        const head = box.querySelector<HTMLElement>("[data-head]");
        const svg = box.querySelector<SVGSVGElement>("svg");
        if (!path || !track || !head || !svg || box.offsetParent === null) return;
        const nodes = Array.from(box.querySelectorAll<HTMLElement>("[data-node]"));
        const baseD = svg.dataset.d!;
        const baseW = Number(svg.dataset.w);
        const baseH = Number(svg.dataset.h);

        let len = 1;
        let stops: number[] = [];
        let progress = 0;
        const lit = new Array(nodes.length).fill(false);

        // Lay the path out in real pixels so dashes, the travelling point
        // and the nodes all share one coordinate system.
        const layout = () => {
          const W = box.clientWidth;
          const H = box.clientHeight;
          const sx = W / baseW;
          const sy = H / baseH;
          let i = 0;
          const d = baseD.replace(/-?\d+(\.\d+)?/g, (n) => String(+(Number(n) * (i++ % 2 === 0 ? sx : sy)).toFixed(2)));
          svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
          path.setAttribute("d", d);
          track.setAttribute("d", d);
          len = path.getTotalLength();
          path.style.strokeDasharray = `${len}`;
          stops = nodes.map((n) => {
            const tx = (parseFloat(n.style.left) / 100) * W;
            const ty = (parseFloat(n.style.top) / 100) * H;
            let best = 0;
            let bestD = Infinity;
            for (let k = 0; k <= 240; k++) {
              const p = path.getPointAtLength((k / 240) * len);
              const dd = (p.x - tx) ** 2 + (p.y - ty) ** 2;
              if (dd < bestD) {
                bestD = dd;
                best = k / 240;
              }
            }
            return best;
          });
          update(progress);
        };

        const update = (p: number) => {
          progress = p;
          path.style.strokeDashoffset = `${len * (1 - p)}`;
          const pt = path.getPointAtLength(p * len);
          head.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
          head.style.opacity = p > 0.001 && p < 0.999 ? "1" : "0";
          stops.forEach((s, i) => {
            const on = p >= s - 0.004;
            if (on === lit[i]) return;
            lit[i] = on;
            const node = nodes[i];
            gsap.to(node.querySelector("[data-node-core]"), { opacity: on ? 1 : 0, duration: 0.5 });
            gsap.to(node.querySelector("[data-node-label]"), {
              color: on ? "rgba(245,245,245,1)" : "rgba(245,245,245,0.15)",
              duration: 0.9,
              ease: "power2.out",
            });
          });
        };

        layout();
        const ro = new ResizeObserver(() => layout());
        ro.observe(box);
        observers.push(ro);

        if (reduced) {
          ScrollTrigger.create({ trigger: box, start: "top 70%", once: true, onEnter: () => update(1) });
        } else {
          const state = { p: 0 };
          gsap.to(state, {
            p: 1,
            ease: "none",
            onUpdate: () => update(state.p),
            scrollTrigger: { trigger: box, start: "top 78%", end: "bottom 45%", scrub: 0.8 },
          });
        }
      });
      return () => observers.forEach((o) => o.disconnect());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} aria-labelledby="why-title" className="gutter relative py-[20vh]">
      <RevealLines id="why-title" lines={why.lines} className="display t-xl" />
      <RevealLines
        as="p"
        lines={[why.language]}
        className="display t-lg mt-[10vh] text-right text-bone/90"
      />

      <Trajectory layout="wide" className="mt-[14vh] hidden h-[62vh] min-h-[420px] md:block" />
      <Trajectory layout="narrow" className="mt-[10vh] h-[120vh] md:hidden" />
    </section>
  );
}
