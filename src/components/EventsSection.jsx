import EventCard from "./EventCard";

export default function EventsSection({ events, user, onReserve }) {
  return (
    <section className="panel view-panel events-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Explorar</p>
          <h2>Eventos disponibles</h2>
        </div>
        <span>{events.length} publicados</span>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <EventCard event={event} key={event.id} user={user} onReserve={onReserve} />
        ))}
        {events.length === 0 && <p className="empty-state">Aún no hay eventos publicados.</p>}
      </div>
    </section>
  );
}
