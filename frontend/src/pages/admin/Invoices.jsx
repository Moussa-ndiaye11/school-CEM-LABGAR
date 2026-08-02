import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Modal, Input, Select, Button, Badge } from "../../components/ui";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [form, setForm] = useState({ studentId: "", description: "", amount: "", dueDate: "" });
  const [payForm, setPayForm] = useState({ amount: "", method: "MOBILE_MONEY", reference: "" });
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([client.get("/invoices"), client.get("/students")])
      .then(([i, s]) => {
        setInvoices(i.data);
        setStudents(s.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await client.post("/invoices", form);
    setForm({ studentId: "", description: "", amount: "", dueDate: "" });
    setOpen(false);
    load();
  }

  async function handlePay(e) {
    e.preventDefault();
    await client.post(`/invoices/${payModal.id}/payments`, payForm);
    setPayForm({ amount: "", method: "MOBILE_MONEY", reference: "" });
    setPayModal(null);
    load();
  }

  const totalPending = invoices.filter((i) => i.status !== "PAID").reduce((sum, i) => sum + i.amount, 0);

  return (
    <Layout>
      <PageHeader
        title="Facturation"
        subtitle={`${totalPending.toLocaleString("fr-FR")} FCFA en attente de paiement`}
        action={<Button onClick={() => setOpen(true)}>+ Nouvelle facture</Button>}
      />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Eleve", "Description", "Montant", "Echeance", "Statut", ""]}
          rows={invoices.map((inv) => [
            <td key="s" className="px-4 py-3 font-medium">{inv.student.firstName} {inv.student.lastName}</td>,
            <td key="d" className="px-4 py-3">{inv.description}</td>,
            <td key="a" className="px-4 py-3 font-mono">{inv.amount.toLocaleString("fr-FR")} FCFA</td>,
            <td key="e" className="px-4 py-3">{new Date(inv.dueDate).toLocaleDateString("fr-FR")}</td>,
            <td key="st" className="px-4 py-3"><Badge status={inv.status} /></td>,
            <td key="ac" className="px-4 py-3">
              {inv.status !== "PAID" && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPayModal(inv);
                    setPayForm({ amount: inv.amount, method: "MOBILE_MONEY", reference: "" });
                  }}
                >
                  Enregistrer un paiement
                </Button>
              )}
            </td>,
          ])}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle facture">
        <form onSubmit={handleCreate} className="space-y-3">
          <Select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Choisir un eleve...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </Select>
          <Input required placeholder="Description (ex: Frais de scolarite T1)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input required type="number" placeholder="Montant (FCFA)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Button type="submit" className="w-full justify-center">Creer la facture</Button>
        </form>
      </Modal>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Enregistrer un paiement">
        <form onSubmit={handlePay} className="space-y-3">
          <Input required type="number" placeholder="Montant paye" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          <Select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CASH">Especes</option>
            <option value="BANK_TRANSFER">Virement bancaire</option>
            <option value="CARD">Carte bancaire</option>
          </Select>
          <Input placeholder="Reference (optionnel)" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
          <Button type="submit" className="w-full justify-center">Confirmer le paiement</Button>
        </form>
      </Modal>
    </Layout>
  );
}
