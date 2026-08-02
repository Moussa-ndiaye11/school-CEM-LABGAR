import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Modal, Input, Select, Button } from "../../components/ui";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [years, setYears] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "", teacherId: "", academicYearId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([client.get("/classes"), client.get("/users?role=TEACHER"), client.get("/academic-years")])
      .then(([c, t, y]) => {
        setClasses(c.data);
        setTeachers(t.data);
        setYears(y.data);
        setForm((f) => ({ ...f, academicYearId: f.academicYearId || y.data.find((yy) => yy.isActive)?.id || "" }));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/classes", form);
      setOpen(false);
      setForm({ name: "", level: "", teacherId: "", academicYearId: form.academicYearId });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la creation.");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette classe ?")) return;
    await client.delete(`/classes/${id}`);
    load();
  }

  return (
    <Layout>
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} classe(s)`}
        action={<Button onClick={() => setOpen(true)}>+ Nouvelle classe</Button>}
      />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Classe", "Niveau", "Enseignant", "Eleves", "Annee scolaire", ""]}
          rows={classes.map((c) => [
            <td key="n" className="px-4 py-3 font-medium text-ink">{c.name}</td>,
            <td key="l" className="px-4 py-3">{c.level}</td>,
            <td key="t" className="px-4 py-3">{c.teacher?.name || "Non assigne"}</td>,
            <td key="s" className="px-4 py-3">{c._count.students}</td>,
            <td key="y" className="px-4 py-3">{c.academicYear?.name}</td>,
            <td key="a" className="px-4 py-3">
              <Button variant="danger" onClick={() => remove(c.id)}>Supprimer</Button>
            </td>,
          ])}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle classe">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input required placeholder="Nom (ex: CE1 A)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required placeholder="Niveau (ex: CE1)" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <Select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
            <option value="">Enseignant non assigne</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select required value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
            <option value="">Annee scolaire...</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </Select>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full justify-center">Enregistrer</Button>
        </form>
      </Modal>
    </Layout>
  );
}
