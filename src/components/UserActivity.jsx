export default function UserActivity({ reservations, tickets }) {
  return (
    <article className="panel compact-panel">
      <h2>Actividad</h2>
      <p>{reservations.length} reservas</p>
      <p>{tickets.length} tickets</p>
      <div className="ticket-list">
        {tickets.slice(0, 4).map((ticket) => (
          <span key={ticket.id}>{ticket.ticket_code}</span>
        ))}
      </div>
      {tickets.length === 0 && <p className="muted">Aún no tienes tickets.</p>}
    </article>
  );
}
