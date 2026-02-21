const COLORS = {
  'Too much': '#b85c4a',
  'Just right': '#4e8c63',
  'Not enough': '#c8834a',
  'No opinion': '#a0a090',
  "I don't know": '#b8b4aa',
};

export default function SentimentBar({ screenTimeSentiment }) {
  const total = Object.values(screenTimeSentiment).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return <p className="empty-state">No sentiment data yet.</p>;
  }

  const segments = Object.entries(screenTimeSentiment).map(([label, count]) => ({
    label,
    count,
    pct: total > 0 ? (count / total) * 100 : 0,
    color: COLORS[label] || '#bdbdbd',
  }));

  return (
    <div className="sentiment-wrap">
      <div className="sentiment-bar" role="img" aria-label="Screen time sentiment breakdown">
        {segments.map(seg => (
          seg.pct > 0 && (
            <div
              key={seg.label}
              className="sentiment-segment"
              style={{ width: `${seg.pct}%`, background: seg.color }}
              title={`${seg.label}: ${seg.count} (${seg.pct.toFixed(1)}%)`}
            />
          )
        ))}
      </div>

      <div className="sentiment-legend">
        {segments.map(seg => (
          <div key={seg.label} className="legend-item">
            <span className="legend-swatch" style={{ background: seg.color }} />
            <span className="legend-label">{seg.label}</span>
            <span className="legend-pct">{seg.pct.toFixed(0)}%</span>
            <span className="legend-count">({seg.count})</span>
          </div>
        ))}
      </div>

      <p className="sentiment-note">
        Counts include responses across all grade bands (K–2, 3–5, 6–8, 9–12).
        A parent with children in multiple bands contributes one response per band.
      </p>
    </div>
  );
}
