import { MARK, sPath } from "@/lib/monogram";

type Props = {
  className?: string;
  /** the red point of view inside the O */
  dot?: boolean;
  title?: string;
  strokeClassName?: string;
};

/** The SOS monogram: S · O · S, with a red point of view at the centre. */
export function SOSMark({ className, dot = true, title = "SOS", strokeClassName }: Props) {
  const oCx = MARK.sWidth + MARK.gap + MARK.oSize / 2;
  return (
    <svg
      viewBox={`0 0 ${MARK.width} ${MARK.height}`}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <g stroke="currentColor" strokeWidth={MARK.stroke} className={strokeClassName}>
        <path d={sPath(0)} />
        <circle cx={oCx} cy={50} r={50 - MARK.stroke / 2} />
        <path d={sPath(MARK.sWidth + MARK.gap * 2 + MARK.oSize)} />
      </g>
      {dot && <circle cx={oCx} cy={50} r={6.5} fill="#B00020" />}
    </svg>
  );
}
