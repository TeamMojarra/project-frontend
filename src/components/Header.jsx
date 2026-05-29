import { getInitials } from "../utils/formatters";

export default function Header({ user, activeView, onView, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand-button" onClick={() => onView("events")} type="button">
          Reservent<span>.</span>
        </button>
        <nav>
          <button className={activeView === "events" ? "active" : ""} onClick={() => onView("events")} type="button">
            Eventos
          </button>
          {user && (
            <button className={activeView === "create" ? "active" : ""} onClick={() => onView("create")} type="button">
              Crear
            </button>
          )}
          {user && (
            <button className={activeView === "my-events" ? "active" : ""} onClick={() => onView("my-events")} type="button">
              Mis eventos
            </button>
          )}
          {user && (
            <button className={activeView === "tickets" ? "active" : ""} onClick={() => onView("tickets")} type="button">
              Tickets
            </button>
          )}
          {user && (
            <button className={activeView === "validate" ? "active" : ""} onClick={() => onView("validate")} type="button">
              Validar
            </button>
          )}
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
