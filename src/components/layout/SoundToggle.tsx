"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

/** Optional sound. Default off; never autoplays. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => sound?.subscribe(setOn), []);

  return (
    <button
      type="button"
      onClick={() => sound?.toggle()}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className={`group flex items-center gap-2.5 py-2 text-bone/70 transition-colors hover:text-bone ${className}`}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0.45, 1, 0.7, 0.3].map((h, i) => (
          <span
            key={i}
            className={`block w-px origin-bottom bg-current ${
              on ? "animate-[eq_1.1s_ease-in-out_infinite] motion-reduce:animate-none" : ""
            }`}
            style={{ height: on ? `${h * 100}%` : "2px", animationDelay: `${i * 0.13}s` }}
          />
        ))}
      </span>
      <span className="label">Sound {on ? "on" : "off"}</span>
    </button>
  );
}
