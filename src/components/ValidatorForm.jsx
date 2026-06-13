import Input from "./Input";
import { formatDate } from "../utils/formatters";

export default function ValidatorForm({ result, ticketCode, onTicketCode, onSubmit }) {
  const ticket = result?.ticket;

  return (
    <form className="panel form-card view-panel validator-panel" onSubmit={onSubmit}>
      <p className="eyebrow">Control de acceso</p>
      <h2>Validar ticket</h2>
      <p className="view-copy">Ingresa el código único del ticket para marcarlo como utilizado si pertenece a uno de tus eventos.</p>
      <Input helper="Ejemplo: RSV-ABC123DEFG" label="Código" value={ticketCode} onChange={onTicketCode} placeholder="RSV-ABC123" />
      <button className="primary" type="submit">Validar acceso</button>
      {result && (
        <div className={`validation-result ${result.valid ? "success" : "error"}`}>
          <span>{result.status === "already_used" ? "Ticket ya usado" : result.valid ? "Acceso aprobado" : "Acceso rechazado"}</span>
          <strong>{result.message}</strong>
          {ticket && (
            <dl>
              <div>
                <dt>Evento</dt>
                <dd>{ticket.event?.name || "Evento"}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{ticket.ticket_code}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{ticket.status}</dd>
              </div>
              {ticket.used_at && (
                <div>
                  <dt>Usado</dt>
                  <dd>{formatDate(ticket.used_at)}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </form>
  );
}
