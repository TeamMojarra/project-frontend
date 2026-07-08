import { useState } from "react";

import { formatDate, formatMoney, formatSlot } from "../utils/formatters";
import { eventStatusLabel, eventTypeLabel, modalityLabel } from "../utils/labels";

export default function EventCard({ compact = false, event, user, onReserve }) {
  const isOwner = user?.id === event.created_by;
  const availableCapacity = Number(event.available_capacity || 0);
  const totalCapacity = Number(event.total_capacity || 0);
  const maxPerPurchase = Math.max(1, Number(event.max_tickets_per_purchase || 1));
  const reservationLimit = Math.min(availableCapacity, maxPerPurchase);
  const [quantity, setQuantity] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState(event.service_slots?.[0]?.id || "");
  const isService = event.event_type === "service";
  const serviceSlots = event.service_slots || [];
  const capacityRatio = totalCapacity > 0 ? Math.max(0, Math.min(100, (availableCapacity / totalCapacity) * 100)) : 0;
  const canReserve = Boolean(user) && !isOwner && availableCapacity > 0 && event.status === "available" && (!isService || selectedSlotId);
  const safeQuantity = Math.min(quantity, Math.max(1, reservationLimit));
  const reserveQuantity = isService ? 1 : safeQuantity;

  return (
    <article className={`event-card ${event.status} ${compact ? "compact" : ""}`}>
      <div className={`event-card-visual ${event.image_url ? "has-image" : ""}`}>
        {event.image_url && <img alt="" src={event.image_url} />}
        <div className="event-card-header">
          <span className="event-type-badge">{eventTypeLabel(event.event_type)}</span>
          <span className={`status ${event.status}`}>{eventStatusLabel(event.status)}</span>
        </div>
        <span className="event-mark">{event.name.slice(0, 1)}</span>
      </div>
      <div className="event-card-body">
        <div>
          <h3>{event.name}</h3>
          <p>{event.description || "Sin descripción"}</p>
        </div>
        <div className="event-meta-list">
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{isService ? `${serviceSlots.length} horarios libres` : formatDate(event.start_datetime)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{event.location || "Por confirmar"}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true" />
            <span>{modalityLabel(event.modality)}</span>
          </div>
        </div>
      </div>
      <div className="event-card-footer">
        <div className="capacity-row">
          <span>{isService ? `${availableCapacity} turnos disponibles` : `${availableCapacity}/${totalCapacity} cupos`}</span>
          <span>{formatMoney(event.price)}</span>
        </div>
        <div
          aria-label={`${availableCapacity} de ${totalCapacity} cupos disponibles`}
          aria-valuemax={totalCapacity}
          aria-valuemin="0"
          aria-valuenow={availableCapacity}
          className="capacity-track"
          role="progressbar"
        >
          <span style={{ width: `${capacityRatio}%` }} />
        </div>
        {isOwner ? (
          <button disabled type="button">Tu evento</button>
        ) : (
          <div className="reserve-actions">
            {isService && serviceSlots.length > 0 && (
              <label>
                <span>Horario</span>
                <select value={selectedSlotId} onChange={(event) => setSelectedSlotId(Number(event.target.value))}>
                  {serviceSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{formatSlot(slot.starts_at)}</option>
                  ))}
                </select>
              </label>
            )}
            {!isService && canReserve && reservationLimit > 1 && (
              <label>
                <span>Cantidad</span>
                <select value={safeQuantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {Array.from({ length: reservationLimit }, (_, index) => index + 1).map((amount) => (
                    <option key={amount} value={amount}>{amount} ticket{amount > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </label>
            )}
            <button className="primary" disabled={!canReserve} onClick={() => onReserve(event.id, reserveQuantity, isService ? selectedSlotId : null)} type="button">
              {user ? (isService ? "Reservar turno" : `Reservar ${safeQuantity} cupo${safeQuantity > 1 ? "s" : ""}`) : "Inicia sesión para reservar"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
