import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Table, Badge, Select, Button } from "../../components/ui";

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client.get("/tenants").then(({ data }) => setSchools(data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    await client.patch(`/tenants/${id}`, { status });
    load();
  }

  async function updatePlan(id, plan) {
    await client.patch(`/tenants/${id}`, { plan });
    load();
  }

  return (
    <Layout>
      <PageHeader title="Ecoles inscrites" subtitle="Gerez les abonnements et l'acces de chaque etablissement" />

      {loading ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <Table
          columns={["Ecole", "Eleves", "Utilisateurs", "Offre", "Statut", "Actions"]}
          rows={schools.map((s) => [
            <td key="n" className="px-4 py-3 font-medium text-ink">
              {s.name}
              <p className="text-xs font-normal text-ink/40">{s.slug}</p>
            </td>,
            <td key="st" className="px-4 py-3">{s._count.students}</td>,
            <td key="us" className="px-4 py-3">{s._count.users}</td>,
            <td key="p" className="px-4 py-3">
              <Select value={s.plan} onChange={(e) => updatePlan(s.id, e.target.value)} className="w-32">
                <option value="BASIC">Basique</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </Select>
            </td>,
            <td key="s" className="px-4 py-3"><Badge status={s.status} /></td>,
            <td key="a" className="px-4 py-3">
              {s.status === "ACTIVE" ? (
                <Button variant="danger" onClick={() => updateStatus(s.id, "SUSPENDED")}>
                  Suspendre
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => updateStatus(s.id, "ACTIVE")}>
                  Reactiver
                </Button>
              )}
            </td>,
          ])}
        />
      )}
    </Layout>
  );
}
