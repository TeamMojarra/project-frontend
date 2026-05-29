import { getInitials } from "../utils/formatters";

export default function Header({ user, activeView, onView, onLogout }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => onView("events")} type="button">
        Reservent<span>.</span>
      </button>
      <nav>
        <button className={activeView === "events" ? "active" : ""} onClick={() => onView("events")} type="button">
          Eventos
        </button>
        {user && <button type="button">Mis tickets</button>}
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
    </header>
  );
}
