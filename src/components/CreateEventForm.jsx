import Input from "./Input";
import { EVENT_STATUS_OPTIONS, EVENT_TYPE_OPTIONS, MODALITY_OPTIONS } from "../utils/labels";

export default function CreateEventForm({ form, isEditing, onCancelEdit, onForm, onSubmit }) {
  const isService = form.event_type === "service";

  return (
    <form className="panel form-card view-panel" onSubmit={onSubmit}>
      <div>
        <p className="eyebrow">Organización</p>
        <h2>{isEditing ? "Editar evento" : "Crear evento"}</h2>
        <p className="form-intro">Define la información que verán tus asistentes antes de reservar.</p>
      </div>
      <Input label="Nombre" helper="Usa un nombre concreto y reconocible." value={form.name} onChange={(name) => onForm({ ...form, name })} />
      <Input
        helper="Pega una URL pública https:// para reemplazar la imagen genérica."
        label="Imagen del evento"
        placeholder="https://images.unsplash.com/..."
        required={false}
        type="url"
        value={form.image_url}
        onChange={(image_url) => onForm({ ...form, image_url })}
      />
      <label>
        <span>Descripción</span>
        <textarea value={form.description} onChange={(event) => onForm({ ...form, description: event.target.value })} />
        <small>Explica la experiencia, requisitos o beneficios principales.</small>
      </label>
      <div className="form-row">
        <label>
          <span>Tipo</span>
          <select value={form.event_type} onChange={(event) => onForm({ ...form, event_type: event.target.value })}>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Modalidad</span>
          <select value={form.modality} onChange={(event) => onForm({ ...form, modality: event.target.value })}>
            {MODALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <Input label="Lugar" value={form.location} onChange={(location) => onForm({ ...form, location })} />
      <Input
        helper={isService ? "Opcional: deja vacío si el servicio no tiene una fecha definida." : "Obligatorio para eventos con fecha."}
        label={isService ? "Inicio opcional" : "Inicio"}
        required={!isService}
        type="datetime-local"
        value={form.start_datetime}
        onChange={(start_datetime) => onForm({ ...form, start_datetime })}
      />
      <Input label="Fin" type="datetime-local" value={form.end_datetime} onChange={(end_datetime) => onForm({ ...form, end_datetime })} required={false} />
      <Input helper="Debe ser mayor a cero." label="Capacidad" min="1" type="number" value={form.total_capacity} onChange={(total_capacity) => onForm({ ...form, total_capacity })} />
      {isEditing && (
        <label>
          <span>Estado</span>
          <select value={form.status} onChange={(event) => onForm({ ...form, status: event.target.value })}>
            {EVENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      )}
      <button className="primary" type="submit">{isEditing ? "Guardar cambios" : "Publicar"}</button>
      {isEditing && <button className="link-button" onClick={onCancelEdit} type="button">Cancelar edición</button>}
    </form>
  );
}
