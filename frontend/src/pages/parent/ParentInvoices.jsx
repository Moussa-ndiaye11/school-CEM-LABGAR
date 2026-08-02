import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Badge } from "../../components/ui";

export default function ParentInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/invoices").then(({ data }) => setInvoices(data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader title="Factures" subtitle="Suivi des frais scolaires de vos enfants" />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Enfant", "Description", "Montant", "Echeance", "Statut"]}
          rows={invoices.map((inv) => [
            <td key="s" className="px-4 py-3 font-medium">{inv.student.firstName} {inv.student.lastName}</td>,
            <td key="d" className="px-4 py-3">{inv.description}</td>,
            <td key="a" className="px-4 py-3 font-mono">{inv.amount.toLocaleString("fr-FR")} FCFA</td>,
            <td key="e" className="px-4 py-3">{new Date(inv.dueDate).toLocaleDateString("fr-FR")}</td>,
            <td key="st" className="px-4 py-3"><Badge status={inv.status} /></td>,
          ])}
        />
      )}
    </Layout>
  );
}
