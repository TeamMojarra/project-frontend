import { formatDate } from "../utils/formatters";

export default function EventCard({ event, user, onReserve }) {
  return (
    <article className="event-card">
      <div>
        <span className={`status ${event.status}`}>{event.status}</span>
        <h3>{event.name}</h3>
        <p>{event.description || "Sin descripción"}</p>
      </div>
      <dl>
        <div>
          <dt>Fecha</dt>
          <dd>{formatDate(event.start_datetime)}</dd>
        </div>
        <div>
          <dt>Modalidad</dt>
          <dd>{event.modality}</dd>
        </div>
        <div>
          <dt>Cupos</dt>
          <dd>{event.available_capacity}/{event.total_capacity}</dd>
        </div>
      </dl>
      <button disabled={!user || event.available_capacity < 1} onClick={() => onReserve(event.id)} type="button">
        {user ? "Reservar" : "Inicia sesión para reservar"}
      </button>
    </article>
  );
}
