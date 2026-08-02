import { useEffect, useState } from "react";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, StatCard } from "../../components/ui";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get("/dashboard").then(({ data }) => setStats(data));
  }, []);

  return (
    <Layout>
      <PageHeader title="Tableau de bord" subtitle="Apercu de la vie de votre ecole aujourd'hui" />

      {!stats ? (
        <p className="text-ink/50">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eleves inscrits" value={stats.studentCount} tone="board" />
          <StatCard label="Classes" value={stats.classCount} tone="pencil" />
          <StatCard label="Enseignants" value={stats.teacherCount} tone="board" />
          <StatCard
            label="Presences du jour"
            value={`${stats.todayAttendance.present} / ${stats.todayAttendance.marked}`}
            hint={`${stats.todayAttendance.absent} absence(s) signalee(s)`}
            tone="success"
          />
          <StatCard label="Factures en attente" value={stats.pendingInvoices} tone="pencil" />
          <StatCard label="Factures en retard" value={stats.overdueInvoices} tone="danger" />
        </div>
      )}
    </Layout>
  );
}
