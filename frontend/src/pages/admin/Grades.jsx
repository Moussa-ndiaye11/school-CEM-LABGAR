import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Select, Input, Button, Table } from "../../components/ui";

const TERMS = ["Trimestre 1", "Trimestre 2", "Trimestre 3"];

export default function Grades() {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState(TERMS[0]);
  const [values, setValues] = useState({});
  const [grades, setGrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get("/classes").then(({ data }) => {
      setClasses(data);
      if (data.length) setClassId(data[0].id);
    });
    client.get("/subjects").then(({ data }) => {
      setSubjects(data);
      if (data.length) setSubjectId(data[0].id);
    });
  }, []);

  useEffect(() => {
    const studentId = searchParams.get("studentId");
    const query = studentId ? `studentId=${studentId}` : classId ? `classId=${classId}` : "";
    if (query) client.get(`/grades?${query}`).then(({ data }) => setGrades(data));
  }, [classId, searchParams]);

  useEffect(() => {
    if (!classId) return;
    client.get(`/students?classId=${classId}`).then(({ data }) => setStudents(data));
  }, [classId]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all(
        Object.entries(values)
          .filter(([, v]) => v !== "" && v !== undefined)
          .map(([studentId, value]) =>
            client.post("/grades", { studentId, subjectId, value, maxValue: 20, term })
          )
      );
      setValues({});
      setSaved(true);
      client.get(`/grades?classId=${classId}`).then(({ data }) => setGrades(data));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <PageHeader title="Notes" subtitle="Saisissez les notes par classe et par matiere" />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Classe</label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-52">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Matiere</label>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-52">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Periode</label>
          <Select value={term} onChange={(e) => setTerm(e.target.value)} className="w-40">
            {TERMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les notes"}
        </Button>
        {saved && <span className="text-sm text-success">Notes enregistrees ✓</span>}
      </div>

      <div className="mb-8 overflow-hidden rounded-xl2 border border-ink/5 bg-white shadow-card">
        {students.length === 0 && <p className="p-6 text-center text-ink/40">Aucun eleve dans cette classe.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-ink/5 px-4 py-3 last:border-0">
            <span className="text-sm font-medium text-ink">{s.firstName} {s.lastName}</span>
            <Input
              type="number"
              min="0"
              max="20"
              step="0.25"
              placeholder="/20"
              value={values[s.id] ?? ""}
              onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
              className="w-24"
            />
          </div>
        ))}
      </div>

      <h2 className="rule-heading mb-4 font-display text-lg font-semibold text-ink">Historique des notes</h2>
      <Table
        columns={["Eleve", "Matiere", "Note", "Periode", "Date"]}
        rows={grades.map((g) => [
          <td key="s" className="px-4 py-3 font-medium">{g.student.firstName} {g.student.lastName}</td>,
          <td key="m" className="px-4 py-3">{g.subject.name}</td>,
          <td key="v" className="px-4 py-3 font-mono">{g.value}/{g.maxValue}</td>,
          <td key="t" className="px-4 py-3">{g.term}</td>,
          <td key="d" className="px-4 py-3">{new Date(g.date).toLocaleDateString("fr-FR")}</td>,
        ])}
      />
    </Layout>
  );
}
