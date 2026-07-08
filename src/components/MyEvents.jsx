import { eventStatusLabel } from "../utils/labels";

export default function MyEvents({ events, onCancel, onEdit }) {
  function confirmCancel(event) {
    const shouldCancel = window.confirm(`¿Cancelar "${event.name}"? Esta acción no se puede deshacer.`);
    if (shouldCancel) {
      onCancel(event.id);
    }
  }

  return (
    <article className="panel view-panel compact-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Organización</p>
          <h2>Mis eventos</h2>
        </div>
        <span>{events.length} creados</span>
      </div>
      {events.map((event) => (
        <div className="owned-event" key={event.id}>
          <div>
            <strong>{event.name}</strong>
            <p>{eventStatusLabel(event.status)} · {event.available_capacity}/{event.total_capacity} cupos · máx. {event.max_tickets_per_purchase || 1} por compra</p>
          </div>
          <div className="event-actions">
            <button onClick={() => onEdit(event)} type="button">Editar</button>
            <button className="danger" onClick={() => confirmCancel(event)} type="button">Cancelar</button>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="empty-state empty-card">
          <strong>No has creado eventos todavía.</strong>
          <span>Publica tu primer evento para empezar a recibir reservas.</span>
        </div>
      )}
    </article>
  );
}
