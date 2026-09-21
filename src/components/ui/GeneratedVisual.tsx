import { useId } from "react";
import type { GeneratedVariant } from "@/content/portfolio";
import { MARK, sPath } from "@/lib/monogram";

/**
 * Placeholder artwork, drawn in the site's own visual language.
 * Replace with real photography / film in content/portfolio.ts.
 */

type Props = { variant: GeneratedVariant; seed?: number; alt: string; className?: string };

function rand(seed: number) {
  let s = seed * 7919 + 17;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function GeneratedVisual({ variant, seed = 1, alt, className = "" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = rand(seed + variant.length * 13);
  const common = `absolute inset-0 h-full w-full ${className}`;

  if (variant === "aperture") {
    const cx = 800 + (seed === 2 ? -120 : seed === 3 ? 160 : 210);
    const cy = 450;
    const R = seed === 3 ? 520 : 360;
    const open = seed === 2 ? 0.18 : seed === 3 ? 0.62 : 0.34;
    const a = R * (0.14 + open * 0.6);
    const blades = 9;
    const rot = r() * 0.6;
    const segs = Array.from({ length: blades }).map((_, i) => {
      const phi = (i / blades) * Math.PI * 2 + rot;
      const alpha = Math.asin(Math.min(0.999, a / R));
      const pts: string[] = [];
      for (let k = 0; k <= 24; k++) {
        const t = alpha + ((Math.PI - 2 * alpha) * k) / 24;
        const lx = Math.cos(t) * R;
        const ly = Math.sin(t) * R;
        // rotate local (+y outward) into direction phi
        const ang = phi - Math.PI / 2;
        pts.push(
          `${(cx + lx * Math.cos(ang) - ly * Math.sin(ang)).toFixed(1)},${(cy + lx * Math.sin(ang) + ly * Math.cos(ang)).toFixed(1)}`,
        );
      }
      return pts.join(" ");
    });
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={common} role="img" aria-label={alt}>
        <defs>
          <radialGradient id={`bg${uid}`} cx={cx / 1600} cy={0.5} r="0.8">
            <stop offset="0" stopColor="#140002" />
            <stop offset="0.5" stopColor="#070707" />
            <stop offset="1" stopColor="#030303" />
          </radialGradient>
          <radialGradient id={`glow${uid}`}>
            <stop offset="0" stopColor="#ffd0d6" />
            <stop offset="0.06" stopColor="#e0112f" />
            <stop offset="0.35" stopColor="#8b0000" stopOpacity="0.55" />
            <stop offset="1" stopColor="#120000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`blade${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#161616" />
            <stop offset="1" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill={`url(#bg${uid})`} />
        <circle cx={cx} cy={cy} r={R * 0.9} fill={`url(#glow${uid})`} />
        {segs.map((pts, i) => (
          <polygon key={i} points={pts} fill={`url(#blade${uid})`} stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" />
        ))}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#0e0e0e" strokeWidth={R * 0.16} />
        <circle cx={cx} cy={cy} r={R * 1.08} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={R * 1.2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path
          d={`M ${cx - R * 1.08} ${cy} A ${R * 1.08} ${R * 1.08} 0 0 1 ${cx - R * 0.2} ${cy - R * 1.06}`}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
        <path
          d={`M ${cx + R * 1.08} ${cy} A ${R * 1.08} ${R * 1.08} 0 0 1 ${cx + R * 0.3} ${cy + R * 1.04}`}
          fill="none"
          stroke="#b00020"
          strokeWidth="3"
          style={{ filter: "drop-shadow(0 0 10px #b00020)" }}
        />
        <circle cx={cx} cy={cy} r="5" fill="#fff" opacity="0.85" />
      </svg>
    );
  }

  if (variant === "anamorphic") {
    const y = seed === 2 ? 520 : seed === 3 ? 390 : 470;
    const x = seed === 2 ? 620 : seed === 3 ? 980 : 900;
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={common} role="img" aria-label={alt}>
        <defs>
          <filter id={`b${uid}`} x="-50%" y="-500%" width="200%" height="1100%">
            <feGaussianBlur stdDeviation="22 5" />
          </filter>
          <filter id={`c${uid}`} x="-50%" y="-500%" width="200%" height="1100%">
            <feGaussianBlur stdDeviation="3 1" />
          </filter>
          <radialGradient id={`src${uid}`}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.15" stopColor="#ff5a6e" />
            <stop offset="0.5" stopColor="#b00020" stopOpacity="0.5" />
            <stop offset="1" stopColor="#b00020" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`floor${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0003" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="#050505" />
        <rect y={y} width="1600" height={900 - y} fill={`url(#floor${uid})`} opacity="0.7" />
        <ellipse cx={x} cy={y} rx="980" ry="10" fill="#b00020" filter={`url(#b${uid})`} opacity="0.9" />
        <ellipse cx={x} cy={y} rx="760" ry="2.2" fill="#ffb3bd" filter={`url(#c${uid})`} opacity="0.85" />
        <ellipse cx={x + 140} cy={y - 60} rx="420" ry="1.5" fill="#b00020" filter={`url(#c${uid})`} opacity="0.35" />
        <ellipse cx={x - 220} cy={y + 90} rx="300" ry="1.2" fill="#b00020" filter={`url(#c${uid})`} opacity="0.25" />
        <circle cx={x} cy={y} r="90" fill={`url(#src${uid})`} />
        {/* letterbox 2.39:1 */}
        <rect width="1600" height="115" fill="#000" />
        <rect y="785" width="1600" height="115" fill="#000" />
        <rect y="115" width="1600" height="1" fill="rgba(255,255,255,0.08)" />
        <rect y="784" width="1600" height="1" fill="rgba(255,255,255,0.08)" />
        {[
          [60, 145],
          [1540, 145],
          [60, 755],
          [1540, 755],
        ].map(([cx2, cy2], i) => (
          <g key={i} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none">
            <path d={`M ${cx2 + (cx2 < 800 ? 0 : 0)} ${cy2} h ${cx2 < 800 ? 28 : -28} M ${cx2} ${cy2} v ${cy2 < 450 ? 28 : -28}`} />
          </g>
        ))}
      </svg>
    );
  }

  if (variant === "timeline") {
    const tracks = [
      [0, 0.18, 0.28, 0.2, 0.34],
      [0.08, 0.3, 0.22, 0.4],
      [0, 0.6, 0.4],
      [0.12, 0.26, 0.26, 0.36],
    ];
    const head = seed === 2 ? 0.62 : seed === 3 ? 0.28 : 0.46;
    const redTrack = seed % 2;
    return (
      <div className={common} role="img" aria-label={alt}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_60%_60%,#160003_0%,#060606_60%,#040404_100%)]" />
        <div className="absolute inset-0 [perspective:1400px]">
          <div
            className="absolute top-1/2 left-1/2 w-[120%] origin-center"
            style={{ transform: `translate(-50%,-50%) rotateX(${seed === 3 ? 48 : 38}deg) rotateZ(${seed === 2 ? -8 : -14}deg)` }}
          >
            <div className="mb-6 flex justify-between border-b border-white/10 pb-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="block h-3 w-px bg-white/25" />
              ))}
            </div>
            {tracks.map((clips, ti) => (
              <div key={ti} className="mb-4 flex gap-2">
                {clips.map((w, ci) =>
                  ci === 0 && w > 0 ? (
                    <span key={ci} style={{ width: `${w * 100}%` }} />
                  ) : (
                    <span
                      key={ci}
                      className="block h-16 rounded-[6px] border border-white/10"
                      style={{
                        width: `${w * 100}%`,
                        background:
                          ti === redTrack && ci === 2
                            ? "linear-gradient(180deg,#b00020,#6a0012)"
                            : ti > 1
                              ? "linear-gradient(180deg,#141414,#0d0d0d)"
                              : "linear-gradient(180deg,#1c1c1c,#111)",
                        boxShadow: ti === redTrack && ci === 2 ? "0 0 40px rgba(176,0,32,0.5)" : undefined,
                      }}
                    />
                  ),
                )}
              </div>
            ))}
            <span
              className="absolute -top-6 -bottom-6 w-[2px] bg-[#ff2a44]"
              style={{ left: `${head * 100}%`, boxShadow: "0 0 24px 4px rgba(176,0,32,0.7)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "frame") {
    const rot = seed === 2 ? -26 : seed === 3 ? 14 : -18;
    return (
      <div className={common} role="img" aria-label={alt}>
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_65%_45%,#1a0003_0%,#070707_55%,#040404_100%)]" />
        <div className="absolute inset-0 [perspective:1600px]">
          <div
            className="absolute top-1/2 left-[56%] aspect-[16/10] w-[min(70%,1100px)] [transform-style:preserve-3d]"
            style={{ transform: `translate(-50%,-50%) rotateY(${rot}deg) rotateX(8deg)` }}
          >
            {[3, 2, 1].map((k) => (
              <div
                key={k}
                className="absolute inset-0 rounded-[10px] border border-white/[0.06]"
                style={{ transform: `translateZ(${-k * 70}px)` }}
              />
            ))}
            <div className="absolute inset-0 overflow-hidden rounded-[10px] border border-white/10 bg-[#0b0b0b] shadow-[0_60px_120px_rgba(0,0,0,0.8),0_0_80px_rgba(176,0,32,0.18)]">
              <div className="flex h-[6%] items-center gap-2 border-b border-white/10 px-[2%]">
                <span className="h-2 w-2 rounded-full bg-[#b00020]" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
              <div className="grid h-[94%] grid-cols-12 gap-[2%] p-[4%]">
                <div className="col-span-7 flex flex-col justify-end gap-[6%]">
                  <span className="block h-[14%] w-[90%] bg-white/85" />
                  <span className="block h-[14%] w-[62%] bg-white/85" />
                  <span className="block h-[3%] w-[70%] bg-white/25" />
                  <span className="block h-[3%] w-[50%] bg-white/25" />
                  <span className="block h-[9%] w-[28%] rounded-full bg-[#b00020]" />
                </div>
                <div className="col-span-5 rounded-[6px] bg-[radial-gradient(60%_60%_at_50%_50%,#b00020_0%,#3a0008_45%,#0b0b0b_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "device") {
    const x = seed === 2 ? 45 : seed === 3 ? 62 : 58;
    const tilt = seed === 2 ? 18 : seed === 3 ? -12 : -22;
    return (
      <div className={common} role="img" aria-label={alt}>
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_60%_55%,#1a0003_0%,#060606_60%,#030303_100%)]" />
        <div className="absolute inset-0 [perspective:1400px]">
          <div
            className="absolute top-1/2 aspect-[9/19] h-[78%] rounded-[44px] border border-white/10 bg-[linear-gradient(160deg,#1a1a1a,#060606)] p-[3.2%] shadow-[0_80px_140px_rgba(0,0,0,0.9)]"
            style={{
              left: `${x}%`,
              transform: `translate(-50%,-50%) rotateY(${tilt}deg) rotateX(6deg)`,
              boxShadow: `${tilt < 0 ? "" : "-"}6px 0 0 -2px rgba(176,0,32,0.6), 0 80px 140px rgba(0,0,0,0.9)`,
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-[#070707]">
              <div className="absolute inset-x-[8%] top-[12%] aspect-square rounded-[22px] bg-[radial-gradient(55%_55%_at_50%_50%,#e0112f_0%,#6a0012_40%,#120000_75%)]" />
              <div className="absolute inset-x-[30%] top-[22%] aspect-square rounded-full border-[3px] border-white/85" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute inset-x-[8%] flex items-center gap-3" style={{ top: `${62 + i * 9}%` }}>
                  <span className={`h-3 w-3 rounded-full ${i === 0 ? "bg-[#b00020]" : "bg-white/20"}`} />
                  <span className="h-1.5 flex-1 rounded bg-white/15" />
                </div>
              ))}
              <div className="absolute inset-x-[8%] bottom-[5%] h-[6%] rounded-full bg-[#b00020]" />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.06)_48%,transparent_56%)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // kinetic
  const S1 = sPath(0);
  const S2 = sPath(MARK.sWidth + MARK.gap * 2 + MARK.oSize);
  const oCx = MARK.sWidth + MARK.gap + 50;
  const scale = seed === 3 ? 9 : seed === 2 ? 6 : 5.2;
  const tx = seed === 3 ? -900 : seed === 2 ? 60 : 180;
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={common} role="img" aria-label={alt}>
      <defs>
        <filter id={`m${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="26 0" />
        </filter>
        <radialGradient id={`kg${uid}`} cx="0.6" cy="0.55" r="0.7">
          <stop offset="0" stopColor="#170003" />
          <stop offset="1" stopColor="#040404" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#kg${uid})`} />
      <g transform={`translate(${tx} ${450 - 50 * scale}) scale(${scale})`} fill="none" strokeWidth={MARK.stroke}>
        {[4, 3, 2, 1].map((k) => (
          <g key={k} transform={`translate(${-k * 9} 0)`} stroke="#b00020" opacity={0.12 * (5 - k)} filter={`url(#m${uid})`}>
            <path d={S1} />
            <circle cx={oCx} cy={50} r={50 - MARK.stroke / 2} />
            <path d={S2} />
          </g>
        ))}
        <g stroke="#f5f5f5">
          <path d={S1} />
          <circle cx={oCx} cy={50} r={50 - MARK.stroke / 2} />
          <path d={S2} />
        </g>
        <circle cx={oCx} cy={50} r={6.5} fill="#b00020" stroke="none" />
      </g>
    </svg>
  );
}
