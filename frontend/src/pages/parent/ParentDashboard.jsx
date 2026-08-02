import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Badge } from "../../components/ui";

export default function ParentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get("/dashboard/parent").then(({ data }) => setData(data));
  }, []);

  return (
    <Layout>
      <PageHeader title="Mes enfants" subtitle="Suivi scolaire de vos enfants" />

      {!data ? (
        <p className="text-ink/50">Chargement...</p>
      ) : data.children.length === 0 ? (
        <p className="text-ink/50">Aucun enfant n'est encore rattache a votre compte.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.children.map((child) => (
            <Link
              key={child.id}
              to={`/children/${child.id}`}
              className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card transition hover:shadow-lg"
            >
              <p className="font-display text-lg font-semibold text-ink">{child.firstName} {child.lastName}</p>
              <p className="text-sm text-ink/50">{child.class ? `${child.class.name} - ${child.class.level}` : "Classe non assignee"}</p>
              {child.invoices.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-ink/60">{child.invoices.length} facture(s) en attente</span>
                  <Badge status={child.invoices[0].status} />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
