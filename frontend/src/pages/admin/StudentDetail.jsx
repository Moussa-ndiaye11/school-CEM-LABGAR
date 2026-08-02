import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Badge, Button, Select, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function StudentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [newParent, setNewParent] = useState({ name: "", email: "", phone: "", password: "" });
  const [parentError, setParentError] = useState("");
  const [bulletinTerm, setBulletinTerm] = useState("");
  const [downloading, setDownloading] = useState(false);

  function load() {
    client.get(`/students/${id}`).then(({ data }) => setStudent(data));
    if (user.role === "ADMIN") {
      client.get("/users?role=PARENT").then(({ data }) => setParents(data));
    }
  }

  useEffect(load, [id]);

  async function linkParent() {
    if (!selectedParent) return;
    await client.post(`/students/${id}/parents`, { parentId: selectedParent });
    setSelectedParent("");
    load();
  }

  async function unlinkParent(parentId) {
    await client.delete(`/students/${id}/parents/${parentId}`);
    load();
  }

  async function createAndLinkParent(e) {
    e.preventDefault();
    setParentError("");
    try {
      const { data: created } = await client.post("/users", { ...newParent, role: "PARENT" });
      await client.post(`/students/${id}/parents`, { parentId: created.id });
      setNewParent({ name: "", email: "", phone: "", password: "" });
      load();
    } catch (err) {
      setParentError(err.response?.data?.message || "Erreur lors de la creation du parent.");
    }
  }

  async function downloadBulletin() {
    setDownloading(true);
    try {
      const res = await client.get(`/grades/report-card/${id}/pdf`, {
        params: bulletinTerm ? { term: bulletinTerm } : {},
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulletin-${student.lastName}-${student.firstName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!student) {
    return (
      <Layout>
        <p className="text-ink/50">Chargement...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={student.class ? `${student.class.name} - ${student.class.level}` : "Aucune classe assignee"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
          <h2 className="rule-heading mb-4 font-display text-base font-semibold">Notes recentes</h2>
          <div className="space-y-2">
            {student.grades.length === 0 && <p className="text-sm text-ink/40">Aucune note enregistree.</p>}
            {student.grades.slice(0, 8).map((g) => (
              <div key={g.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                <span>{g.subject.name} <span className="text-ink/40">· {g.term}</span></span>
                <span className="font-mono font-medium">{g.value}/{g.maxValue}</span>
              </div>
            ))}
          </div>
          <Link to={`/grades?studentId=${student.id}`} className="mt-3 inline-block text-sm font-medium text-board hover:underline">
            Voir toutes les notes
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-4">
            <Select value={bulletinTerm} onChange={(e) => setBulletinTerm(e.target.value)} className="w-40">
              <option value="">Toutes periodes</option>
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </Select>
            <Button variant="pencil" onClick={downloadBulletin} disabled={downloading}>
              {downloading ? "Generation..." : "Telecharger le bulletin (PDF)"}
            </Button>
          </div>
        </section>

        <section className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
          <h2 className="rule-heading mb-4 font-display text-base font-semibold">Presences recentes</h2>
          <div className="space-y-2">
            {student.attendances.length === 0 && <p className="text-sm text-ink/40">Aucune presence enregistree.</p>}
            {student.attendances.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                <span>{new Date(a.date).toLocaleDateString("fr-FR")}</span>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
          <h2 className="rule-heading mb-4 font-display text-base font-semibold">Factures</h2>
          <div className="space-y-2">
            {student.invoices.length === 0 && <p className="text-sm text-ink/40">Aucune facture.</p>}
            {student.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                <div>
                  <p>{inv.description}</p>
                  <p className="text-xs text-ink/40">Echeance : {new Date(inv.dueDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium">{inv.amount.toLocaleString("fr-FR")} FCFA</p>
                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {user.role === "ADMIN" && (
          <section className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
            <h2 className="rule-heading mb-4 font-display text-base font-semibold">Parents rattaches</h2>
            <div className="mb-4 space-y-2">
              {student.parents.length === 0 && <p className="text-sm text-ink/40">Aucun parent rattache.</p>}
              {student.parents.map((sp) => (
                <div key={sp.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                  <div>
                    <p>{sp.parent.name}</p>
                    <p className="text-xs text-ink/40">{sp.parent.email}</p>
                  </div>
                  <Button variant="danger" onClick={() => unlinkParent(sp.parent.id)}>
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
                <option value="">Choisir un parent existant...</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </Select>
              <Button onClick={linkParent}>Lier</Button>
            </div>

            <div className="mt-5 border-t border-ink/5 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">
                Ou creer un nouveau compte parent
              </p>
              <form onSubmit={createAndLinkParent} className="grid grid-cols-2 gap-2">
                <Input
                  required
                  placeholder="Nom complet"
                  value={newParent.name}
                  onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
                />
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  value={newParent.email}
                  onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                />
                <Input
                  placeholder="Telephone"
                  value={newParent.phone}
                  onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                />
                <Input
                  required
                  type="password"
                  placeholder="Mot de passe temporaire"
                  value={newParent.password}
                  onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                />
                {parentError && (
                  <p className="col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{parentError}</p>
                )}
                <Button type="submit" className="col-span-2 justify-center">
                  Creer et rattacher
                </Button>
              </form>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
