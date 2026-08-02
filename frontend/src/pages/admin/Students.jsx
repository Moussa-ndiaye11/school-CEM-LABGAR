import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Modal, Input, Select, Button } from "../../components/ui";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", birthDate: "", gender: "M", classId: "" });
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([client.get("/students"), client.get("/classes")])
      .then(([s, c]) => {
        setStudents(s.data);
        setClasses(c.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/students", form);
      setOpen(false);
      setForm({ firstName: "", lastName: "", birthDate: "", gender: "M", classId: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la creation.");
    }
  }

  return (
    <Layout>
      <PageHeader
        title="Eleves"
        subtitle={`${students.length} eleve(s) inscrit(s)`}
        action={<Button onClick={() => setOpen(true)}>+ Ajouter un eleve</Button>}
      />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Nom", "Classe", "Date de naissance", "Genre", ""]}
          rows={students.map((s) => [
            <td key="n" className="px-4 py-3 font-medium text-ink">
              {s.firstName} {s.lastName}
            </td>,
            <td key="c" className="px-4 py-3">{s.class ? `${s.class.name} (${s.class.level})` : "Non assignee"}</td>,
            <td key="b" className="px-4 py-3">{new Date(s.birthDate).toLocaleDateString("fr-FR")}</td>,
            <td key="g" className="px-4 py-3">{s.gender === "F" ? "Fille" : "Garcon"}</td>,
            <td key="a" className="px-4 py-3">
              <Link to={`/students/${s.id}`} className="text-sm font-medium text-board hover:underline">
                Voir la fiche
              </Link>
            </td>,
          ])}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un eleve">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input required placeholder="Prenom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input
            type="date"
            required
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="M">Garcon</option>
            <option value="F">Fille</option>
          </Select>
          <Select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
            <option value="">Sans classe</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </Select>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full justify-center">
            Enregistrer
          </Button>
        </form>
      </Modal>
    </Layout>
  );
}
