import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { formatDate } from "../utils/formatters";
import { ticketStatusLabel } from "../utils/labels";

export default function TicketsView({ reservations, tickets }) {
  const [zoomTicket, setZoomTicket] = useState(null);

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
          <span>Reservas activas</span>
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
            <div className="ticket-glow" />
            <div className="ticket-header">
              <strong>Reservent<span>.</span></strong>
              <span className={`status ${ticket.status}`}>{ticketStatusLabel(ticket.status)}</span>
            </div>
            <div className="ticket-body">
              <span className="ticket-label">ACCESO DIGITAL</span>
              <h3>{ticket.event?.name || "Evento"}</h3>
              <p>{ticket.event?.location || "Ubicación por confirmar"}</p>
            </div>
            <div className="ticket-divider"><span /></div>
            <div className="ticket-footer">
              <div>
                <span className="ticket-label">CÓDIGO</span>
                <div className="ticket-code">{ticket.ticket_code}</div>
              </div>
              <TicketQr ticket={ticket} onZoom={setZoomTicket} />
            </div>
            <small>Generado {formatDate(ticket.generated_at)}</small>
          </article>
        ))}
        {tickets.length === 0 && (
          <div className="empty-state empty-card">
            <strong>Todavía no tienes tickets generados.</strong>
            <span>Reserva un evento y confirma el pago simulado para ver tu acceso digital aquí.</span>
          </div>
        )}
      </div>

      {zoomTicket && <QrModal ticket={zoomTicket} onClose={() => setZoomTicket(null)} />}
    </section>
  );
}

function TicketQr({ ticket, onZoom }) {
  const qrUrl = useQrDataUrl(ticket.ticket_code, 160);

  return (
    <button
      aria-label={`Ampliar QR del ticket ${ticket.ticket_code}`}
      className="qr-button"
      onClick={() => onZoom(ticket)}
      type="button"
    >
      {qrUrl ? <img alt="" src={qrUrl} /> : <span />}
    </button>
  );
}

function QrModal({ ticket, onClose }) {
  const qrUrl = useQrDataUrl(ticket.ticket_code, 360);

  return (
    <div className="qr-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="qr-modal panel" role="dialog" aria-modal="true" aria-label="QR ampliado" onClick={(event) => event.stopPropagation()}>
        <div>
          <p className="eyebrow">QR de acceso</p>
          <h2>{ticket.event?.name || "Evento"}</h2>
          <p className="view-copy">Muestra este QR o comparte el código para validar el acceso.</p>
        </div>
        {qrUrl && <img alt={`QR del ticket ${ticket.ticket_code}`} src={qrUrl} />}
        <div className="ticket-code">{ticket.ticket_code}</div>
        <div className="form-actions">
          <button className="primary" onClick={() => navigator.clipboard?.writeText(ticket.ticket_code)} type="button">Copiar código</button>
          <button onClick={onClose} type="button">Cerrar</button>
        </div>
      </section>
    </div>
  );
}

function useQrDataUrl(value, width) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(value, { margin: 1, width, color: { dark: "#020617", light: "#ffffff" } })
      .then((url) => {
        if (mounted) {
          setDataUrl(url);
        }
      })
      .catch(() => {
        if (mounted) {
          setDataUrl("");
        }
      });

    return () => {
      mounted = false;
    };
  }, [value, width]);

  return dataUrl;
}
