import "../../styles/StatsBar.css";

export default function StatsBar({ total, taken, reserved = 0, free }) {
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-label">თავისუფალი</span>
        <span className="stat-value stat-free">{free}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">დაკავებული</span>
        <span className="stat-value stat-taken">{taken}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">დაჯავშნილი</span>
        <span className="stat-value stat-reserved">{reserved}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">სულ</span>
        <span className="stat-value">{total}</span>
      </div>
    </div>
  );
}
