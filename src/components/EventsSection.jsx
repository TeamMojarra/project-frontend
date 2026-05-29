import { useState } from "react";

import EventCard from "./EventCard";

export default function EventsSection({ events, user, onReserve }) {
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
    <section className="panel view-panel events-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Explorar</p>
          <h2>Eventos</h2>
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
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </div>
      <div className="event-list">
        {visibleEvents.map((event) => (
          <EventCard event={event} key={event.id} user={user} onReserve={onReserve} />
        ))}
        {visibleEvents.length === 0 && <p className="empty-state">No encontramos eventos con esos filtros.</p>}
      </div>
    </section>
  );
}
