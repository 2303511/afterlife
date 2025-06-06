import React from "react";

export default function StatCard({ label, value, color, trend }) {
    return (
      <div className="card shadow-sm p-3 text-center stat-card">
        <div className="text-muted">{label}</div>
        <h2 className={`fw-bold ${color}`}>{value}</h2>
        {trend && <span className={`text-${trend === 'up' ? 'success' : 'danger'}`}>{trend === 'up' ? '↑' : '↓'}</span>}
      </div>
    );
  }
  