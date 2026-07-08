import { useState } from "react";

import { formatDate, formatMoney, formatSlot } from "../utils/formatters";
import { eventStatusLabel } from "../utils/labels";

const RESERVATION_STATUS_LABELS = {
  pending_payment: "Pendiente de pago",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  rejected: "Pago fallido",
};

export default function MyEvents({ events, reservationsByEvent = {}, onCancel, onCancelReservation, onEdit }) {
  const [openEventId, setOpenEventId] = useState(null);

  function confirmCancel(event) {
    const shouldCancel = window.confirm(`¿Cancelar "${event.name}"? Esta acción no se puede deshacer.`);
    if (shouldCancel) {
      onCancel(event.id);
    }
  }

  function confirmCancelReservation(reservation) {
    const customer = reservation.user?.name || "este cliente";
    const shouldCancel = window.confirm(`¿Cancelar la reserva de ${customer}? Marca la reserva como reembolsada/cancelada.`);
    if (shouldCancel) {
      onCancelReservation(reservation.id);
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
      {events.map((event) => {
        const reservations = reservationsByEvent[event.id] || [];
        const activeReservations = reservations.filter((reservation) => ["pending_payment", "confirmed"].includes(reservation.status)).length;
        const isOpen = openEventId === event.id;
        return (
          <div className="owned-event" key={event.id}>
            <div>
              <strong>{event.name}</strong>
              <p>{eventStatusLabel(event.status)} · {event.available_capacity}/{event.total_capacity} cupos · {formatMoney(event.price)} · máx. {event.max_tickets_per_purchase || 1} por compra</p>
            </div>
            <div className="event-actions">
              <button onClick={() => onEdit(event)} type="button">Editar</button>
              <button onClick={() => setOpenEventId(isOpen ? null : event.id)} type="button">
                {isOpen ? "Ocultar reservas" : `Ver reservas (${activeReservations})`}
              </button>
              <button className="danger" onClick={() => confirmCancel(event)} type="button">Cancelar</button>
            </div>
            {isOpen && <div className="owned-reservations">
              <strong>Reservas</strong>
              {reservations.length === 0 && <span className="muted">Sin reservas todavía.</span>}
              {reservations.map((reservation) => {
                const canCancel = ["pending_payment", "confirmed"].includes(reservation.status);
                return (
                  <div className="owned-reservation" key={reservation.id}>
                    <div>
                      <span>{reservation.user?.name || "Cliente"}</span>
                      <small>{reservation.user?.email || "Sin email"}</small>
                    </div>
                    <div>
                      <span>{RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}</span>
                      <small>{reservation.service_slot ? formatSlot(reservation.service_slot.starts_at) : `${reservation.quantity} cupo${reservation.quantity > 1 ? "s" : ""}`} · {formatDate(reservation.created_at)}</small>
                    </div>
                    <button className="danger" disabled={!canCancel} onClick={() => confirmCancelReservation(reservation)} type="button">
                      Cancelar/reembolsar
                    </button>
                  </div>
                );
              })}
            </div>}
          </div>
        );
      })}
      {events.length === 0 && (
        <div className="empty-state empty-card">
          <strong>No has creado eventos todavía.</strong>
          <span>Publica tu primer evento para empezar a recibir reservas.</span>
        </div>
      )}
    </article>
  );
}
