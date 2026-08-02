import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export default function RegisterSchool() {
  const { registerSchool } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    schoolName: "",
    adminName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerSchool(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md rounded-xl2 border border-ink/5 bg-white p-8 shadow-card">
        <p className="mb-1 font-display text-xl font-semibold text-ink">Inscrire votre ecole</p>
        <p className="mb-6 text-sm text-ink/50">
          Creez l'espace de gestion de votre ecole primaire en quelques instants.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Nom de l'ecole</label>
            <Input required value={form.schoolName} onChange={set("schoolName")} placeholder="Ecole Les Petits Genies" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Votre nom (directeur / directrice)</label>
            <Input required value={form.adminName} onChange={set("adminName")} placeholder="Moussa Ndiaye" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Email</label>
            <Input type="email" required value={form.email} onChange={set("email")} placeholder="vous@ecole.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Telephone</label>
            <Input value={form.phone} onChange={set("phone")} placeholder="+221 000 00 00" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Mot de passe</label>
            <Input type="password" required minLength={6} value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? "Creation..." : "Creer mon ecole"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          Deja inscrit ?{" "}
          <Link to="/login" className="font-medium text-board hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
