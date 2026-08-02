import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Select, Button } from "../../components/ui";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
const STATUS_LABELS = { PRESENT: "Present", ABSENT: "Absent", LATE: "En retard", EXCUSED: "Excuse" };

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get("/classes").then(({ data }) => {
      setClasses(data);
      if (data.length) setClassId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    client.get(`/students?classId=${classId}`).then(({ data }) => {
      setStudents(data);
      setMarks(Object.fromEntries(data.map((s) => [s.id, "PRESENT"])));
    });
    client.get(`/attendance?classId=${classId}&date=${date}`).then(({ data }) => {
      if (data.length) {
        setMarks((prev) => {
          const next = { ...prev };
          data.forEach((a) => (next[a.studentId] = a.status));
          return next;
        });
      }
    });
  }, [classId, date]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await client.post("/attendance/bulk", {
        classId,
        date,
        records: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <PageHeader title="Faire l'appel" subtitle="Enregistrez la presence des eleves pour la journee" />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Classe</label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-56">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-board focus:ring-2 focus:ring-board/20"
          />
        </div>
        <Button onClick={save} disabled={saving || !students.length}>
          {saving ? "Enregistrement..." : "Enregistrer l'appel"}
        </Button>
        {saved && <span className="text-sm text-success">Appel enregistre ✓</span>}
      </div>

      <div className="overflow-hidden rounded-xl2 border border-ink/5 bg-white shadow-card">
        {students.length === 0 && <p className="p-6 text-center text-ink/40">Aucun eleve dans cette classe.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 last:border-0">
            <span className="text-sm font-medium text-ink">{s.firstName} {s.lastName}</span>
            <div className="flex gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setMarks({ ...marks, [s.id]: status })}
                  className={`badge border transition ${
                    marks[s.id] === status
                      ? "border-transparent"
                      : "border-ink/10 bg-transparent text-ink/40 hover:bg-ink/5"
                  } ${marks[s.id] === status ? statusClass(status) : ""}`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function statusClass(status) {
  return (
    {
      PRESENT: "bg-success/10 text-success",
      ABSENT: "bg-danger/10 text-danger",
      LATE: "bg-pencil/20 text-pencil",
      EXCUSED: "bg-info/10 text-info",
    }[status] || ""
  );
}
