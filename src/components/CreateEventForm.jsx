import Input from "./Input";
import { EVENT_STATUS_OPTIONS, EVENT_TYPE_OPTIONS, MODALITY_OPTIONS } from "../utils/labels";

const WEEKDAYS = [
  { value: 0, label: "Lun" },
  { value: 1, label: "Mar" },
  { value: 2, label: "Mié" },
  { value: 3, label: "Jue" },
  { value: 4, label: "Vie" },
  { value: 5, label: "Sáb" },
  { value: 6, label: "Dom" },
];

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
      <Input helper="Tarifa por cupo o turno reservado." label="Precio" min="0" type="number" value={form.price} onChange={(price) => onForm({ ...form, price })} />
      <Input
        helper={isService ? "Opcional: fecha visible del servicio; la agenda real se define abajo." : "Obligatorio para eventos con fecha."}
        label={isService ? "Inicio visible opcional" : "Inicio"}
        required={!isService}
        type="datetime-local"
        value={form.start_datetime}
        onChange={(start_datetime) => onForm({ ...form, start_datetime })}
      />
      <Input label="Fin" type="datetime-local" value={form.end_datetime} onChange={(end_datetime) => onForm({ ...form, end_datetime })} required={false} />
      {!isService && (
        <>
          <Input helper="Debe ser mayor a cero." label="Capacidad" min="1" type="number" value={form.total_capacity} onChange={(total_capacity) => onForm({ ...form, total_capacity })} />
          <Input
            helper="Cantidad máxima de tickets que un usuario puede comprar en una sola reserva."
            label="Límite por compra"
            max={form.total_capacity}
            min="1"
            type="number"
            value={form.max_tickets_per_purchase}
            onChange={(max_tickets_per_purchase) => onForm({ ...form, max_tickets_per_purchase })}
          />
        </>
      )}
      {isService && <ServiceScheduleForm form={form} onForm={onForm} />}
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

function ServiceScheduleForm({ form, onForm }) {
  function toggleWeekday(day) {
    const selected = form.schedule_weekdays.includes(day);
    const schedule_weekdays = selected
      ? form.schedule_weekdays.filter((value) => value !== day)
      : [...form.schedule_weekdays, day].sort();
    onForm({ ...form, schedule_weekdays });
  }

  return (
    <section className="service-schedule-box">
      <div>
        <p className="eyebrow">Agenda del servicio</p>
        <h3>Horarios disponibles</h3>
        <p className="form-intro">Define el rango de días y las horas que tus clientes podrán reservar.</p>
      </div>
      <div className="form-row">
        <Input label="Desde" type="date" value={form.schedule_start_date} onChange={(schedule_start_date) => onForm({ ...form, schedule_start_date })} />
        <Input label="Hasta" type="date" value={form.schedule_end_date} onChange={(schedule_end_date) => onForm({ ...form, schedule_end_date })} />
      </div>
      <div className="weekday-picker" aria-label="Días de atención">
        {WEEKDAYS.map((day) => (
          <button
            className={form.schedule_weekdays.includes(day.value) ? "active" : ""}
            key={day.value}
            onClick={() => toggleWeekday(day.value)}
            type="button"
          >
            {day.label}
          </button>
        ))}
      </div>
      <div className="form-row">
        <Input label="Hora inicial" type="time" value={form.schedule_start_time} onChange={(schedule_start_time) => onForm({ ...form, schedule_start_time })} />
        <Input label="Hora final" type="time" value={form.schedule_end_time} onChange={(schedule_end_time) => onForm({ ...form, schedule_end_time })} />
      </div>
      <Input helper="Duración de cada turno en minutos." label="Duración del turno" min="15" type="number" value={form.slot_minutes} onChange={(slot_minutes) => onForm({ ...form, slot_minutes })} />
    </section>
  );
}
