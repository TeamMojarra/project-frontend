import Input from "./Input";

export default function ValidatorForm({ ticketCode, onTicketCode, onSubmit }) {
  return (
    <form className="panel form-card" onSubmit={onSubmit}>
      <h2>Validar ticket</h2>
      <Input label="Código" value={ticketCode} onChange={onTicketCode} placeholder="RSV-ABC123" />
      <button type="submit">Validar</button>
    </form>
  );
}
