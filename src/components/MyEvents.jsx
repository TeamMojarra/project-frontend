export default function MyEvents({ events, onCancel, onEdit }) {
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
            <p>{event.status} · {event.available_capacity}/{event.total_capacity} cupos</p>
          </div>
          <div className="event-actions">
            <button onClick={() => onEdit(event)} type="button">Editar</button>
            <button onClick={() => onCancel(event.id)} type="button">Cancelar</button>
          </div>
        </div>
      ))}
      {events.length === 0 && <p className="muted">No has creado eventos todavía.</p>}
    </article>
  );
}
