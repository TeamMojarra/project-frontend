const EVENT_STATUS_LABELS = {
  available: "Disponible",
  sold_out: "Agotado",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

const TICKET_STATUS_LABELS = {
  active: "Activo",
  used: "Usado",
  rejected: "Rechazado",
};

const EVENT_TYPE_LABELS = {
  event: "Evento",
  service: "Servicio",
};

const MODALITY_LABELS = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Híbrido",
};

export function eventStatusLabel(status) {
  return EVENT_STATUS_LABELS[status] || status || "Sin estado";
}

export function ticketStatusLabel(status) {
  return TICKET_STATUS_LABELS[status] || status || "Sin estado";
}

export function eventTypeLabel(type) {
  return EVENT_TYPE_LABELS[type] || type || "Evento";
}

export function modalityLabel(modality) {
  return MODALITY_LABELS[modality] || modality || "Modalidad por confirmar";
}

export const EVENT_STATUS_OPTIONS = Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
export const MODALITY_OPTIONS = Object.entries(MODALITY_LABELS).map(([value, label]) => ({ value, label }));
