import { Fragment } from "react";

/**
 * Renders copy where *wrapped words* become the italic serif accent.
 * "WITH A *POINT OF VIEW.*" → WITH A <em>POINT OF VIEW.</em>
 */
export function rich(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Plain text version (for aria-labels, metadata). */
export function plain(text: string) {
  return text.replace(/\*/g, "");
}
