export default function MyEvents({ events }) {
  return (
    <article className="panel compact-panel">
      <h2>Mis eventos</h2>
      {events.map((event) => (
        <p key={event.id}>{event.name}</p>
      ))}
      {events.length === 0 && <p className="muted">No has creado eventos todavía.</p>}
    </article>
  );
}
