import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, StatCard } from "../../components/ui";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get("/tenants/stats/overview").then(({ data }) => setStats(data));
  }, []);

  return (
    <Layout>
      <PageHeader title="Vue d'ensemble" subtitle="Etat global de la plateforme Ecole SaaS" />

      {!stats ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Ecoles inscrites" value={stats.totalSchools} tone="board" />
            <StatCard label="Ecoles actives" value={stats.activeSchools} tone="success" />
            <StatCard label="Eleves (toutes ecoles)" value={stats.totalStudents} tone="pencil" />
            <StatCard label="Comptes utilisateurs" value={stats.totalUsers} tone="board" />
          </div>

          <div className="mt-8">
            <h2 className="rule-heading mb-4 font-display text-lg font-semibold text-ink">
              Repartition par offre
            </h2>
            <div className="flex flex-wrap gap-4">
              {stats.byPlan.map((p) => (
                <div key={p.plan} className="rounded-xl2 border border-ink/5 bg-white px-5 py-4 shadow-card">
                  <p className="text-xs uppercase tracking-wide text-ink/50">{p.plan}</p>
                  <p className="font-display text-2xl font-semibold text-board">{p.count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
