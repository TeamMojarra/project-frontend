import { getInitials } from "../utils/formatters";

export default function Header({ user, activeView, onView, onLogout }) {
  const navItems = [
    { key: "events", label: "Eventos" },
    { key: "create", label: "Crear" },
    { key: "my-events", label: "Mis eventos" },
    { key: "tickets", label: "Tickets" },
    { key: "validate", label: "Validar" },
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="skip-link" href="#main-content">Saltar al contenido</a>
        <button className="brand-button" onClick={() => onView("events")} type="button">
          Reservent<span>.</span>
        </button>
        <nav aria-label="Navegación principal">
          {navItems.map((item) => (
            <button
              aria-current={activeView === item.key ? "page" : undefined}
              className={activeView === item.key ? "active" : ""}
              key={item.key}
              onClick={() => onView(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        {user ? (
          <div className="session-pill">
            <span>{getInitials(user.name)}</span>
            <strong>{user.name}</strong>
            <button onClick={onLogout} type="button">
              Salir
            </button>
          </div>
        ) : (
          <span className="muted">Invitado</span>
        )}
      </div>
    </header>
  );
}
