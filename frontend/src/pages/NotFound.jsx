import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper text-center">
      <p className="font-display text-5xl font-semibold text-board">404</p>
      <p className="mt-2 text-ink/60">Cette page n'existe pas.</p>
      <Link to="/" className="mt-4 text-sm font-medium text-board hover:underline">
        Retour a l'accueil
      </Link>
    </div>
  );
}
