const STAR =
  "M10 1.35 12.2 6.9l6.05.52-4.6 3.95 1.4 5.9L10 14.55 4.95 17.27l1.4-5.9L1.75 7.42 7.8 6.9 10 1.35z";

export function Stars({
  value,
  size = 16,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const width = size * 5 + 4 * 4;
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const spoken = label ?? `${value} out of 5 stars`;
  return (
    <span
      className="stars"
      role="img"
      aria-label={spoken}
      style={{ ["--sw" as string]: `${width}px`, ["--sh" as string]: `${size}px` }}
    >
      <StarRow />
      <span className="stars-fill" style={{ width: `${pct}%` }}>
        <StarRow />
      </span>
    </span>
  );
}

function StarRow() {
  return (
    <svg viewBox="0 0 116 20" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
      ))}
    </svg>
  );
}
