import { useEffect, useEffectEvent, useState } from "react";

import { formatMoney, formatSlot } from "../utils/formatters";
import Input from "./Input";

const PAYMENT_SECONDS = 300;

export default function CheckoutForm({ checkout, feedback, form, onCancel, onExpire, onForm, onSubmit }) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(checkout));
  const handleExpire = useEffectEvent(() => {
    onExpire();
  });

  useEffect(() => {
    if (!checkout) {
      return undefined;
    }

    let expired = false;
    let interval;
    const tick = () => {
      setSecondsLeft(() => {
        const current = getSecondsLeft(checkout);
        if (current <= 0) {
          if (!expired) {
            expired = true;
            window.clearInterval(interval);
            handleExpire();
          }
          return 0;
        }
        if (current <= 1 && !expired) {
          expired = true;
          handleExpire();
          return 0;
        }
        return current;
      });
    };
    tick();
    interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [checkout]);

  if (!checkout) {
    return feedback ? <CheckoutFeedback feedback={feedback} onCancel={onCancel} /> : null;
  }

  const eventName = checkout.event?.name || checkout.reservation?.event?.name || "Evento";
  const quantity = checkout.reservation?.quantity || 1;
  const serviceSlot = checkout.reservation?.service_slot;
  const unitPrice = Number(checkout.event?.price || checkout.reservation?.event?.price || 0);
  const total = unitPrice * quantity;
  const lastDigits = form.card_number.replace(/\D/g, "").slice(-4).padStart(4, "•");
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <section className="checkout-layout">
      <aside className="panel checkout-side-card">
        <p className="eyebrow">Reserva activa</p>
        <h2>{eventName}</h2>
        <div className="checkout-summary">
          <span>Reserva #{checkout.reservation.id}</span>
          <strong>{formatMoney(total)}</strong>
        </div>
        {serviceSlot && <p className="slot-summary">Turno: <strong>{formatSlot(serviceSlot.starts_at)}</strong></p>}
        <p className="slot-summary">{quantity} x {formatMoney(unitPrice)}</p>
        <div className="payment-timer" aria-live="polite">
          <span>Tiempo para pagar</span>
          <strong>{minutes}:{seconds}</strong>
        </div>
        <p className="view-copy">Si el tiempo llega a cero, la reserva se cancela y los cupos vuelven al evento.</p>
      </aside>

      <form className="panel form-card view-panel checkout-panel" onSubmit={onSubmit}>
        <div>
          <p className="eyebrow">Pago simulado</p>
          <h2>Confirmar reserva</h2>
          <p className="form-intro">Completa los datos de tarjeta de prueba y elige si la simulación aprueba o rechaza el pago.</p>
        </div>

        <div className="card-preview" aria-label="Vista previa de tarjeta simulada">
          <span>Reservent Card</span>
          <strong>•••• •••• •••• {lastDigits}</strong>
          <div>
            <small>{form.holder_name || "TITULAR"}</small>
            <small>{form.expiry_date || "MM/AA"}</small>
          </div>
        </div>

        {feedback && <InlineFeedback feedback={feedback} />}

        <Input
          autoComplete="cc-name"
          label="Nombre del titular"
          value={form.holder_name}
          onChange={(holder_name) => onForm({ ...form, holder_name })}
        />
        <Input
          autoComplete="cc-number"
          helper="Puedes usar cualquier número; solo guardamos los últimos 4 dígitos enmascarados."
          label="Número de tarjeta"
          placeholder="4242 4242 4242 4242"
          value={form.card_number}
          onChange={(card_number) => onForm({ ...form, card_number })}
        />
        <div className="form-row">
          <Input
            autoComplete="cc-exp"
            label="Expira"
            placeholder="MM/AA"
            value={form.expiry_date}
            onChange={(expiry_date) => onForm({ ...form, expiry_date })}
          />
          <Input
            autoComplete="cc-csc"
            label="CVC"
            max="9999"
            min="0"
            placeholder="123"
            type="password"
            value={form.cvc}
            onChange={(cvc) => onForm({ ...form, cvc })}
          />
        </div>
        <label>
          <span>Resultado de la simulación</span>
          <select value={form.result} onChange={(event) => onForm({ ...form, result: event.target.value })}>
            <option value="approved">Aprobar pago</option>
            <option value="rejected">Rechazar pago</option>
          </select>
        </label>
        <div className="form-actions">
          <button className="primary" type="submit">Pagar y generar ticket{quantity > 1 ? "s" : ""}</button>
          <button className="link-button" onClick={onCancel} type="button">Cancelar checkout</button>
        </div>
      </form>
    </section>
  );
}

function getSecondsLeft(checkout) {
  if (!checkout?.reservation?.created_at) {
    return PAYMENT_SECONDS;
  }

  const createdAt = new Date(checkout.reservation.created_at).getTime();
  if (Number.isNaN(createdAt)) {
    return PAYMENT_SECONDS;
  }

  const elapsedSeconds = Math.floor((Date.now() - createdAt) / 1000);
  return Math.max(0, PAYMENT_SECONDS - elapsedSeconds);
}

function CheckoutFeedback({ feedback, onCancel }) {
  return (
    <section className="panel checkout-result view-panel">
      <InlineFeedback feedback={feedback} />
      <button className="primary" onClick={onCancel} type="button">Volver a eventos</button>
    </section>
  );
}

function InlineFeedback({ feedback }) {
  return (
    <div className={`checkout-feedback ${feedback.type}`} role="alert">
      <strong>{feedback.title}</strong>
      <span>{feedback.text}</span>
    </div>
  );
}
