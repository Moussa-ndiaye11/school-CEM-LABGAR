import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Modal, Input, Button } from "../../components/ui";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client.get("/users?role=TEACHER").then(({ data }) => setTeachers(data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/users", { ...form, role: "TEACHER" });
      setOpen(false);
      setForm({ name: "", email: "", phone: "", password: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la creation.");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce compte enseignant ?")) return;
    await client.delete(`/users/${id}`);
    load();
  }

  return (
    <Layout>
      <PageHeader
        title="Enseignants"
        subtitle={`${teachers.length} enseignant(s)`}
        action={<Button onClick={() => setOpen(true)}>+ Ajouter un enseignant</Button>}
      />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Nom", "Email", "Telephone", ""]}
          rows={teachers.map((t) => [
            <td key="n" className="px-4 py-3 font-medium text-ink">{t.name}</td>,
            <td key="e" className="px-4 py-3">{t.email}</td>,
            <td key="p" className="px-4 py-3">{t.phone || "-"}</td>,
            <td key="a" className="px-4 py-3">
              <Button variant="danger" onClick={() => remove(t.id)}>Supprimer</Button>
            </td>,
          ])}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un enseignant">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input required placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Telephone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            required
            type="password"
            placeholder="Mot de passe temporaire"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full justify-center">Enregistrer</Button>
        </form>
      </Modal>
    </Layout>
  );
}
