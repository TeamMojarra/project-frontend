import Input from "./Input";

export default function CheckoutForm({ checkout, form, onCancel, onForm, onSubmit }) {
  if (!checkout) {
    return null;
  }

  const eventName = checkout.event?.name || checkout.reservation?.event?.name || "Evento";

  return (
    <form className="panel form-card view-panel checkout-panel" onSubmit={onSubmit}>
      <div>
        <p className="eyebrow">Pago simulado</p>
        <h2>Confirmar reserva</h2>
        <p className="form-intro">
          Tu cupo para <strong>{eventName}</strong> queda confirmado solo cuando el pago simulado sea aprobado.
        </p>
      </div>

      <div className="checkout-summary">
        <span>Reserva #{checkout.reservation.id}</span>
        <strong>1 cupo</strong>
      </div>

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
      <label>
        <span>Resultado de la simulación</span>
        <select value={form.result} onChange={(event) => onForm({ ...form, result: event.target.value })}>
          <option value="approved">Aprobar pago</option>
          <option value="rejected">Rechazar pago</option>
        </select>
      </label>
      <div className="form-actions">
        <button className="primary" type="submit">Pagar y generar ticket</button>
        <button className="link-button" onClick={onCancel} type="button">Cancelar checkout</button>
      </div>
    </form>
  );
}
