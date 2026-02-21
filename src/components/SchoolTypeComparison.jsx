function pct(n, d) { return d > 0 ? Math.round(n / d * 100) : 0; }

export default function SchoolTypeComparison({ bySchoolType }) {
  const types = Object.entries(bySchoolType)
    .filter(([, d]) => d.totalResponses >= 10)
    .sort(([, a], [, b]) => b.totalResponses - a.totalResponses);

  if (types.length < 2) return null;

  return (
    <div className="school-type-grid">
      {types.map(([type, d]) => {
        const commsTotal = Object.values(d.commsRating).reduce((a, b) => a + b, 0);
        const commsPoor = (d.commsRating['Very poorly'] || 0) + (d.commsRating['Poorly'] || 0);
        const concernsTotal = (d.concernsTopLine.Yes || 0) + (d.concernsTopLine.No || 0);

        return (
          <div key={type} className="school-type-card">
            <div className="school-type-header">
              <h3 className="school-type-name">{type}</h3>
              <span className="school-type-n">n = {d.totalResponses}</span>
            </div>
            <div className="school-type-stats">
              <div className="st-stat">
                <span className="st-pct">{pct(d.anyTooMuch, d.totalResponses)}%</span>
                <span className="st-label">say too much screen time</span>
              </div>
              <div className="st-stat">
                <span className="st-pct">{pct(d.concernsTopLine.Yes, concernsTotal)}%</span>
                <span className="st-label">report concerns about device use</span>
              </div>
              <div className="st-stat">
                <span className="st-pct">{pct(commsPoor, commsTotal)}%</span>
                <span className="st-label">rate school communication as poor</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
