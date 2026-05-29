import { formatDate } from "../utils/formatters";

export default function TicketsView({ reservations, tickets }) {
  return (
    <section className="panel view-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Accesos digitales</p>
          <h2>Mis tickets</h2>
        </div>
        <span>{tickets.length} tickets</span>
      </div>

      <div className="stats-strip">
        <div>
          <strong>{reservations.length}</strong>
          <span>Reservas</span>
        </div>
        <div>
          <strong>{tickets.filter((ticket) => ticket.status === "active").length}</strong>
          <span>Activos</span>
        </div>
        <div>
          <strong>{tickets.filter((ticket) => ticket.status === "used").length}</strong>
          <span>Usados</span>
        </div>
      </div>

      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <article className="ticket-card" key={ticket.id}>
            <div>
              <span className={`status ${ticket.status}`}>{ticket.status}</span>
              <h3>{ticket.event?.name || "Evento"}</h3>
              <p>{ticket.event?.location || "Ubicación por confirmar"}</p>
            </div>
            <div className="ticket-code">{ticket.ticket_code}</div>
            <small>Generado {formatDate(ticket.generated_at)}</small>
          </article>
        ))}
        {tickets.length === 0 && <p className="empty-state">Todavía no tienes tickets generados.</p>}
      </div>
    </section>
  );
}
