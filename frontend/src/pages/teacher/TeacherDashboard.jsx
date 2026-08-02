import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, StatCard } from "../../components/ui";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get("/dashboard/teacher").then(({ data }) => setData(data));
  }, []);

  return (
    <Layout>
      <PageHeader title="Mes classes" subtitle="Vos classes et effectifs pour l'annee en cours" />

      {!data ? (
        <p className="text-ink/50">Chargement...</p>
      ) : data.classes.length === 0 ? (
        <p className="text-ink/50">Aucune classe ne vous est encore assignee.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.classes.map((c) => (
            <div key={c.id} className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card">
              <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
              <p className="text-sm text-ink/50">{c.level}</p>
              <StatCard label="Eleves" value={c._count.students} tone="board" />
              <div className="mt-4 flex gap-3 text-sm font-medium">
                <Link to="/attendance" className="text-board hover:underline">Faire l'appel</Link>
                <Link to="/grades" className="text-board hover:underline">Saisir des notes</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
