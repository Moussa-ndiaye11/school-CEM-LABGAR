import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-xl2 border border-ink/5 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-board font-display text-lg font-bold text-white">
            E
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-ink">Ecole SaaS</p>
            <p className="text-xs text-ink/50">Connexion a votre espace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Email</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@ecole.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Mot de passe</label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          Votre ecole n'est pas encore inscrite ?{" "}
          <Link to="/register-school" className="font-medium text-board hover:underline">
            Creer une ecole
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-paper p-3 text-xs text-ink/50">
          <p className="mb-1 font-medium text-ink/70">Comptes de demonstration</p>
          <p>Admin : admin@petitsgenies.com / password123</p>
          <p>Enseignant : teacher@petitsgenies.com / password123</p>
          <p>Parent : parent@petitsgenies.com / password123</p>
        </div>
      </div>
    </div>
  );
}
