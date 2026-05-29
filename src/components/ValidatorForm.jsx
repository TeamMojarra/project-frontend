import Input from "./Input";

export default function ValidatorForm({ ticketCode, onTicketCode, onSubmit }) {
  return (
    <form className="panel form-card view-panel validator-panel" onSubmit={onSubmit}>
      <p className="eyebrow">Control de acceso</p>
      <h2>Validar ticket</h2>
      <p className="view-copy">Ingresa el código único del ticket para marcarlo como utilizado si pertenece a uno de tus eventos.</p>
      <Input label="Código" value={ticketCode} onChange={onTicketCode} placeholder="RSV-ABC123" />
      <button type="submit">Validar</button>
    </form>
  );
}
