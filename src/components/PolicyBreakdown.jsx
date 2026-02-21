function HorizontalBar({ label, count, maxCount, pct }) {
  return (
    <div className="hbar-row">
      <div className="hbar-label">{label}</div>
      <div className="hbar-track">
        <div
          className="hbar-fill hbar-fill--policy"
          style={{ width: `${(count / maxCount) * 100}%` }}
        />
      </div>
      <div className="hbar-stat">
        <span className="hbar-count">{count}</span>
        <span className="hbar-pct">({pct.toFixed(0)}%)</span>
      </div>
    </div>
  );
}

export default function PolicyBreakdown({ policies, totalResponses }) {
  const entries = Object.entries(policies);
  const maxCount = Math.max(1, ...entries.map(([, c]) => c));

  if (entries.length === 0) {
    return <p className="empty-state">No policy preference data yet.</p>;
  }

  return (
    <div className="hbar-list">
      {entries.map(([label, count]) => (
        <HorizontalBar
          key={label}
          label={label}
          count={count}
          maxCount={maxCount}
          pct={totalResponses > 0 ? (count / totalResponses) * 100 : 0}
        />
      ))}
      <p className="hbar-note">
        % of total survey respondents. Respondents could select multiple policies.
      </p>
    </div>
  );
}
