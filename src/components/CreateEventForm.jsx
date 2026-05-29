import Input from "./Input";

export default function CreateEventForm({ form, onForm, onSubmit }) {
  return (
    <form className="panel form-card" onSubmit={onSubmit}>
      <h2>Crear evento</h2>
      <Input label="Nombre" value={form.name} onChange={(name) => onForm({ ...form, name })} />
      <label>
        Descripción
        <textarea value={form.description} onChange={(event) => onForm({ ...form, description: event.target.value })} />
      </label>
      <div className="form-row">
        <label>
          Tipo
          <select value={form.event_type} onChange={(event) => onForm({ ...form, event_type: event.target.value })}>
            <option value="event">Evento</option>
            <option value="service">Servicio</option>
          </select>
        </label>
        <label>
          Modalidad
          <select value={form.modality} onChange={(event) => onForm({ ...form, modality: event.target.value })}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </label>
      </div>
      <Input label="Lugar" value={form.location} onChange={(location) => onForm({ ...form, location })} />
      <Input label="Inicio" type="datetime-local" value={form.start_datetime} onChange={(start_datetime) => onForm({ ...form, start_datetime })} />
      <Input label="Fin" type="datetime-local" value={form.end_datetime} onChange={(end_datetime) => onForm({ ...form, end_datetime })} required={false} />
      <Input label="Capacidad" type="number" value={form.total_capacity} onChange={(total_capacity) => onForm({ ...form, total_capacity })} />
      <button className="primary" type="submit">Publicar</button>
    </form>
  );
}
