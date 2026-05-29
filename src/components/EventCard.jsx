import { formatDate } from "../utils/formatters";

export default function EventCard({ event, user, onReserve }) {
  const isOwner = user?.id === event.created_by;
  const capacityRatio = Math.max(0, Math.min(100, (event.available_capacity / event.total_capacity) * 100));

  return (
    <article className="event-card">
      <div className="event-card-visual">
        <div className="event-card-header">
          <span className="event-type-badge">{event.event_type}</span>
          <span className={`status ${event.status}`}>{event.status}</span>
        </div>
        <span className="event-mark">{event.name.slice(0, 1)}</span>
      </div>
      <div className="event-card-body">
        <div>
          <h3>{event.name}</h3>
          <p>{event.description || "Sin descripción"}</p>
        </div>
        <div className="event-meta-list">
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{formatDate(event.start_datetime)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{event.location || "Por confirmar"}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{event.modality}</span>
          </div>
        </div>
      </div>
      <div className="event-card-footer">
        <div className="capacity-row">
          <span>{event.available_capacity}/{event.total_capacity} cupos</span>
          <span>{Math.round(capacityRatio)}%</span>
        </div>
        <div className="capacity-track" aria-label={`${event.available_capacity} cupos disponibles`}>
          <span style={{ width: `${capacityRatio}%` }} />
        </div>
        {isOwner ? (
          <button disabled type="button">Tu evento</button>
        ) : (
          <button className="primary" disabled={!user || event.available_capacity < 1} onClick={() => onReserve(event.id)} type="button">
            {user ? "Reservar" : "Inicia sesión"}
          </button>
        )}
      </div>
    </article>
  );
}
