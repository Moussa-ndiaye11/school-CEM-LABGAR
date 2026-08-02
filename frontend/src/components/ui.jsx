export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="rule-heading font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "board" }) {
  const toneMap = {
    board: "text-board",
    pencil: "text-pencil",
    success: "text-success",
    danger: "text-danger",
  };
  return (
    <div className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${toneMap[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}

const BADGE_STYLES = {
  PRESENT: "bg-success/10 text-success",
  ABSENT: "bg-danger/10 text-danger",
  LATE: "bg-pencil/20 text-pencil",
  EXCUSED: "bg-info/10 text-info",
  PAID: "bg-success/10 text-success",
  PENDING: "bg-pencil/20 text-pencil",
  OVERDUE: "bg-danger/10 text-danger",
  ACTIVE: "bg-success/10 text-success",
  SUSPENDED: "bg-danger/10 text-danger",
};

const BADGE_LABELS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "En retard",
  EXCUSED: "Excuse",
  PAID: "Payee",
  PENDING: "En attente",
  OVERDUE: "En retard",
  ACTIVE: "Active",
  SUSPENDED: "Suspendue",
};

export function Badge({ status }) {
  return (
    <span className={`badge ${BADGE_STYLES[status] || "bg-ink/10 text-ink/60"}`}>
      {BADGE_LABELS[status] || status}
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-lg rounded-xl2 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ columns, rows, emptyLabel = "Aucune donnee." }) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/5 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/5 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink/40">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.015]">
              {row}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-board focus:ring-2 focus:ring-board/20 ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-board focus:ring-2 focus:ring-board/20 ${props.className || ""}`}
    />
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-board text-white hover:bg-board-dark",
    secondary: "bg-ink/5 text-ink hover:bg-ink/10",
    pencil: "bg-pencil text-board hover:bg-pencil-light",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}
