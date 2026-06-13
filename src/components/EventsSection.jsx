import { useState } from "react";

import { MODALITY_OPTIONS } from "../utils/labels";
import EventCard from "./EventCard";

export default function EventsSection({ compact = false, events, user, onReserve }) {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEvents = events.filter((event) => {
    const matchesQuery = [event.name, event.description, event.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesModality = modality === "all" || event.modality === modality;
    return (!normalizedQuery || matchesQuery) && matchesModality;
  });

  return (
    <section className={`panel view-panel events-panel ${compact ? "compact-events-panel" : ""}`}>
      <div className="section-title">
        <div>
          <p className="eyebrow">Explorar</p>
          <h2>Eventos</h2>
          <p className="view-copy">Encuentra experiencias disponibles, revisa cupos en tiempo real y reserva cuando inicies sesión.</p>
        </div>
        <span>{visibleEvents.length} de {events.length} publicados</span>
      </div>
      <div className="event-toolbar">
        <input
          aria-label="Buscar eventos"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, lugar o descripción"
          value={query}
        />
        <select aria-label="Filtrar por modalidad" onChange={(event) => setModality(event.target.value)} value={modality}>
          <option value="all">Todas las modalidades</option>
          {MODALITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="event-list">
        {visibleEvents.map((event) => (
          <EventCard compact={compact} event={event} key={event.id} user={user} onReserve={onReserve} />
        ))}
        {visibleEvents.length === 0 && (
          <div className="empty-state empty-card">
            <strong>No encontramos eventos con esos filtros.</strong>
            <span>Prueba con otra palabra clave o vuelve a ver todas las modalidades.</span>
            <button onClick={() => { setQuery(""); setModality("all"); }} type="button">Limpiar filtros</button>
          </div>
        )}
      </div>
    </section>
  );
}
