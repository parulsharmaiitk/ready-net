export function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = total > 0 ? Math.round(((index + 1) / (total + 1)) * 100) : 0;
  return (
    <>
      <div
        className="progress"
        role="progressbar"
        aria-label="Check-in progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-text" aria-hidden="true">
        {Math.min(index + 1, total)} / {total}
      </span>
    </>
  );
}
