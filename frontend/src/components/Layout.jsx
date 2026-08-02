import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  SUPER_ADMIN: [
    { to: "/", label: "Vue d'ensemble" },
    { to: "/schools", label: "Ecoles" },
  ],
  ADMIN: [
    { to: "/", label: "Tableau de bord" },
    { to: "/students", label: "Eleves" },
    { to: "/classes", label: "Classes" },
    { to: "/teachers", label: "Enseignants" },
    { to: "/subjects", label: "Matieres" },
    { to: "/attendance", label: "Presences" },
    { to: "/grades", label: "Notes" },
    { to: "/invoices", label: "Facturation" },
  ],
  TEACHER: [
    { to: "/", label: "Mes classes" },
    { to: "/attendance", label: "Faire l'appel" },
    { to: "/grades", label: "Saisir les notes" },
  ],
  PARENT: [
    { to: "/", label: "Mes enfants" },
    { to: "/parent-invoices", label: "Factures" },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 flex-col justify-between bg-board px-5 py-6 text-white">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pencil font-display text-lg font-bold text-board">
              E
            </div>
            <div>
              <p className="font-display text-lg leading-tight"> GESTION SCOLAIRE</p>
              <p className="text-xs text-board-light/80 opacity-70">Gestion Scolaire</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-board-light font-medium text-white" : "text-white/75 hover:bg-board-light/60"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-white/60">{roleLabel(user.role)}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-3 text-xs font-medium text-pencil hover:underline"
          >
            Se deconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}

function roleLabel(role) {
  return (
    {
      SUPER_ADMIN: "Super administrateur",
      ADMIN: "Administration de l'ecole",
      TEACHER: "Enseignant(e)",
      PARENT: "Parent d'eleve",
    }[role] || role
  );
}
