export default function StatCard({ value, label, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}
