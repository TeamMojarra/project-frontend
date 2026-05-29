import Input from "./Input";

export default function CreateEventForm({ form, isEditing, onCancelEdit, onForm, onSubmit }) {
  return (
    <form className="panel form-card" onSubmit={onSubmit}>
      <h2>{isEditing ? "Editar evento" : "Crear evento"}</h2>
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
      {isEditing && (
        <label>
          Estado
          <select value={form.status} onChange={(event) => onForm({ ...form, status: event.target.value })}>
            <option value="available">Disponible</option>
            <option value="sold_out">Agotado</option>
            <option value="finished">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
      )}
      <button className="primary" type="submit">{isEditing ? "Guardar cambios" : "Publicar"}</button>
      {isEditing && <button className="link-button" onClick={onCancelEdit} type="button">Cancelar edición</button>}
    </form>
  );
}
