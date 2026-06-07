export default function CircularProgress({ progress = 0, size = 34, strokeWidth = 3.5, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const c = size / 2;

  let strokeColor = '#cbd5e1';
  if (progress === 1) strokeColor = '#34d399';
  else if (progress > 0) strokeColor = '#fbbf24';
  if (color) strokeColor = color;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle className="progress-ring-bg" cx={c} cy={c} r={radius} strokeWidth={strokeWidth} />
      <circle className="progress-ring-fill" cx={c} cy={c} r={radius}
        strokeWidth={strokeWidth} stroke={strokeColor}
        strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
}
