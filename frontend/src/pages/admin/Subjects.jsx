import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Modal, Input, Button } from "../../components/ui";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client.get("/subjects").then(({ data }) => setSubjects(data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await client.post("/subjects", { name });
    setName("");
    setOpen(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette matiere ?")) return;
    await client.delete(`/subjects/${id}`);
    load();
  }

  return (
    <Layout>
      <PageHeader
        title="Matieres"
        subtitle={`${subjects.length} matiere(s) au programme`}
        action={<Button onClick={() => setOpen(true)}>+ Nouvelle matiere</Button>}
      />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Matiere", ""]}
          rows={subjects.map((s) => [
            <td key="n" className="px-4 py-3 font-medium text-ink">{s.name}</td>,
            <td key="a" className="px-4 py-3">
              <Button variant="danger" onClick={() => remove(s.id)}>Supprimer</Button>
            </td>,
          ])}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle matiere">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input required placeholder="Nom de la matiere" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" className="w-full justify-center">Enregistrer</Button>
        </form>
      </Modal>
    </Layout>
  );
}
