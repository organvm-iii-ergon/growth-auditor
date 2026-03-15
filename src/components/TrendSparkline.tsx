"use client";

interface TrendSparklineProps {
  values: number[];
}

export function TrendSparkline({ values }: TrendSparklineProps) {
  if (values.length < 2) return null;

  const width = 120;
  const height = 32;
  const padding = 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");
  const gradientId = `sparkline-fill-${values.length}-${values[0]}`;

  // Closed polygon for gradient fill (line + bottom edge)
  const fillPoints = `${points[0].split(",")[0]},${height} ${polylinePoints} ${points[points.length - 1].split(",")[0]},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
