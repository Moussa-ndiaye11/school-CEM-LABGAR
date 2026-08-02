import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../../api/client";
import Layout from "../../components/Layout";
import { PageHeader, Badge, Select, Button } from "../../components/ui";

export default function ParentChildDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [bulletinTerm, setBulletinTerm] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    client.get(`/students/${id}`).then(({ data }) => setStudent(data));
  }, [id]);

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
          <h2 className="rule-heading mb-4 font-display text-base font-semibold">Notes</h2>
          <div className="space-y-2">
            {student.grades.length === 0 && <p className="text-sm text-ink/40">Aucune note enregistree.</p>}
            {student.grades.map((g) => (
              <div key={g.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                <span>{g.subject.name} <span className="text-ink/40">· {g.term}</span></span>
                <span className="font-mono font-medium">{g.value}/{g.maxValue}</span>
              </div>
            ))}
          </div>

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
          <h2 className="rule-heading mb-4 font-display text-base font-semibold">Presences</h2>
          <div className="space-y-2">
            {student.attendances.length === 0 && <p className="text-sm text-ink/40">Aucune presence enregistree.</p>}
            {student.attendances.slice(0, 15).map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-ink/5 pb-2 text-sm last:border-0">
                <span>{new Date(a.date).toLocaleDateString("fr-FR")}</span>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl2 border border-ink/5 bg-white p-5 shadow-card lg:col-span-2">
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
      </div>
    </Layout>
  );
}
