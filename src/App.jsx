import { useEffect, useEffectEvent, useState } from "react";

import { apiRequest, clearToken, getToken, setToken } from "./api";
import AuthPanel from "./components/AuthPanel";
import CheckoutForm from "./components/CheckoutForm";
import CreateEventForm from "./components/CreateEventForm";
import EventsSection from "./components/EventsSection";
import Header from "./components/Header";
import MyEvents from "./components/MyEvents";
import Notice from "./components/Notice";
import TicketsView from "./components/TicketsView";
import ValidatorForm from "./components/ValidatorForm";
import { EMPTY_EVENT, EMPTY_LOGIN, EMPTY_PAYMENT, EMPTY_REGISTER } from "./constants";
import { toDateTimeLocal } from "./utils/formatters";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [activeView, setActiveView] = useState("events");
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [ownerReservations, setOwnerReservations] = useState({});
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [checkout, setCheckout] = useState(null);
  const [checkoutFeedback, setCheckoutFeedback] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [ticketCode, setTicketCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInitialData = useEffectEvent(() => {
    loadEvents();

    if (getToken()) {
      loadSession();
    }
  });

  const refreshDataOnFocus = useEffectEvent(() => {
    loadEvents();
    if (getToken()) {
      loadPrivateData();
    }
  });

  const refreshOwnerReservations = useEffectEvent(() => {
    if (user && activeView === "my-events") {
      loadOwnerReservations();
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    function refreshOnFocus() {
      refreshDataOnFocus();
    }

    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, []);

  useEffect(() => {
    refreshOwnerReservations();
  }, [activeView, events, user]);

  async function run(action, successMessage) {
    setLoading(true);
    setNotice(null);

    try {
      const result = await action();
      if (successMessage) {
        setNotice({ type: "success", text: successMessage });
      }
      return result;
    } catch (error) {
      setNotice({ type: "error", text: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadSession() {
    const currentUser = await run(() => apiRequest("/auth/me"));
    if (currentUser) {
      setUser(currentUser);
      loadPrivateData();
    } else {
      clearToken();
    }
  }

  async function loadEvents() {
    const data = await run(() => apiRequest("/events?include_expired=true"));
    let loadedEvents = [];
    if (data) {
      loadedEvents = await Promise.all(
        data.map(async (event) => {
          if (event.event_type !== "service") {
            return event;
          }
          const slots = await apiRequest(`/events/${event.id}/slots`).catch(() => []);
          return { ...event, service_slots: slots };
        }),
      );
      setEvents(loadedEvents);
    }
    return loadedEvents;
  }

  async function loadPrivateData() {
    const [ticketData, reservationData] = await Promise.all([
      apiRequest("/tickets/my").catch(() => []),
      apiRequest("/reservations/my").catch(() => []),
    ]);
    setTickets(ticketData);
    setReservations(reservationData);
  }

  async function loadOwnerReservations(sourceEvents = events) {
    if (!user) {
      setOwnerReservations({});
      return;
    }

    const ownedEvents = sourceEvents.filter((event) => event.created_by === user.id);
    const entries = await Promise.all(
      ownedEvents.map(async (event) => [
        event.id,
        await apiRequest(`/events/${event.id}/reservations`).catch(() => []),
      ]),
    );
    setOwnerReservations(Object.fromEntries(entries));
  }

  async function handleLogin(event) {
    event.preventDefault();
    const data = await run(() =>
      apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      }),
    );

    if (!data) {
      return;
    }

    setToken(data.access_token);
    setUser(data.user);
    setLoginForm(EMPTY_LOGIN);
    setAuthMode("login");
    setNotice({ type: "success", text: `Bienvenido, ${data.user.name}` });
    loadPrivateData();
  }

  async function handleRegister(event) {
    event.preventDefault();
    const data = await run(
      () =>
        apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: registerForm.name,
            email: registerForm.email,
            password: registerForm.password,
            confirm_password: registerForm.confirmPassword,
          }),
        }),
      "Cuenta creada. Ahora puedes iniciar sesión.",
    );

    if (data) {
      setAuthMode("login");
      setLoginForm({ email: registerForm.email, password: "" });
      setRegisterForm(EMPTY_REGISTER);
    }
  }

  function goToView(view) {
    setActiveView(view);
    setNotice(null);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setTickets([]);
    setReservations([]);
    setOwnerReservations({});
    setCheckout(null);
    setCheckoutFeedback(null);
    setPaymentForm(EMPTY_PAYMENT);
    setValidationResult(null);
    setNotice({ type: "success", text: "Sesión cerrada" });
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    const eventData = buildEventPayload(eventForm, Boolean(editingEventId));
    const data = await run(
      () =>
        apiRequest(editingEventId ? `/events/${editingEventId}` : "/events", {
          method: editingEventId ? "PUT" : "POST",
          body: JSON.stringify(eventData),
        }),
      editingEventId ? "Evento actualizado" : "Evento creado",
    );

    if (data) {
      if (eventForm.event_type === "service") {
        await generateServiceSlots(data.id);
      }
      setEventForm(EMPTY_EVENT);
      setEditingEventId(null);
      loadEvents();
      setActiveView("my-events");
    }
  }

  async function cancelEvent(eventId) {
    const data = await run(
      () => apiRequest(`/events/${eventId}`, { method: "DELETE" }),
      "Evento cancelado",
    );

    if (data) {
      loadEvents();
    }
  }

  async function cancelOwnedReservation(reservationId) {
    const data = await run(
      () => apiRequest(`/reservations/${reservationId}/owner-cancel`, { method: "POST" }),
      "Reserva cancelada. Revisa el reembolso con el cliente.",
    );

    if (data) {
      const loadedEvents = await loadEvents();
      loadOwnerReservations(loadedEvents);
      loadPrivateData();
    }
  }

  function startEditingEvent(event) {
    setEditingEventId(event.id);
    setActiveView("create");
    setEventForm({
      ...EMPTY_EVENT,
      name: event.name,
      description: event.description || "",
      event_type: event.event_type,
      modality: event.modality,
      location: event.location || "",
      image_url: event.image_url || "",
      price: event.price || 0,
      start_datetime: toDateTimeLocal(event.start_datetime),
      end_datetime: toDateTimeLocal(event.end_datetime),
      total_capacity: event.total_capacity,
      max_tickets_per_purchase: event.max_tickets_per_purchase || 1,
      status: event.status,
    });
  }

  function cancelEditingEvent() {
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT);
  }

  async function reserveEvent(eventId, quantity = 1, serviceSlotId = null) {
    if (!user) {
      setNotice({ type: "error", text: "Inicia sesión para reservar cupos." });
      return;
    }

    const latestEvents = await loadEvents();
    const reservation = await run(() =>
      apiRequest("/reservations", {
        method: "POST",
        body: JSON.stringify({ event_id: eventId, quantity, service_slot_id: serviceSlotId }),
      }),
    );

    if (!reservation) {
      return;
    }

    const reservedEvent = latestEvents.find((event) => event.id === eventId) || reservation.event;
    setCheckout({ reservation, event: reservedEvent });
    setCheckoutFeedback(null);
    setPaymentForm({ ...EMPTY_PAYMENT, holder_name: user.name });
    setActiveView("checkout");
    setNotice({ type: "success", text: "Reserva creada. Completa el pago simulado para generar tu ticket." });
    loadPrivateData();
  }

  async function payCheckout(event) {
    event.preventDefault();

    if (!checkout) {
      return;
    }

    const checkoutResult = await run(
      () =>
        apiRequest(`/reservations/${checkout.reservation.id}/pay`, {
          method: "POST",
          body: JSON.stringify(paymentForm),
        }),
      paymentForm.result === "approved" ? "Pago aprobado. Ticket generado." : "Pago rechazado. No se generó ticket.",
    );

    if (checkoutResult) {
      setCheckout(null);
      setPaymentForm(EMPTY_PAYMENT);
      loadEvents();
      loadPrivateData();
      if (paymentForm.result === "approved") {
        setCheckoutFeedback(null);
        setActiveView("tickets");
      } else {
        setCheckoutFeedback({
          type: "error",
          title: "Pago fallido",
          text: "La reserva fue cancelada y los cupos volvieron a estar disponibles.",
        });
        setNotice({ type: "error", text: "Pago fallido. La reserva fue cancelada." });
        setActiveView("checkout");
      }
    }
  }

  function cancelCheckout() {
    if (checkout?.reservation?.id) {
      apiRequest(`/reservations/${checkout.reservation.id}`, { method: "DELETE" })
        .then(() => {
          loadEvents();
          loadPrivateData();
        })
        .catch(() => {});
    }
    setCheckout(null);
    setCheckoutFeedback(null);
    setPaymentForm(EMPTY_PAYMENT);
    setActiveView("events");
  }

  async function expireCheckout() {
    if (!checkout?.reservation?.id) {
      return;
    }

    await apiRequest(`/reservations/${checkout.reservation.id}`, { method: "DELETE" }).catch(() => null);
    setCheckout(null);
    setPaymentForm(EMPTY_PAYMENT);
    setCheckoutFeedback({
      type: "error",
      title: "Tiempo agotado",
      text: "La reserva se canceló porque no se completó el pago dentro del tiempo disponible.",
    });
    setNotice({ type: "error", text: "Tiempo agotado. La reserva fue cancelada." });
    loadEvents();
    loadPrivateData();
  }

  async function generateServiceSlots(eventId) {
    const payload = {
      start_date: eventForm.schedule_start_date,
      end_date: eventForm.schedule_end_date,
      weekdays: eventForm.schedule_weekdays,
      start_time: `${eventForm.schedule_start_time}:00`,
      end_time: `${eventForm.schedule_end_time}:00`,
      slot_minutes: Number(eventForm.slot_minutes),
    };

    if (!payload.start_date || !payload.end_date || payload.weekdays.length === 0) {
      return null;
    }

    return run(
      () =>
        apiRequest(`/events/${eventId}/slots/generate`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      "Agenda de horarios creada",
    );
  }

  async function validateTicket(event) {
    event.preventDefault();
    await validateTicketCode(ticketCode);
  }

  async function validateTicketCode(rawCode) {
    const code = String(rawCode || "").trim();
    if (!code) {
      return;
    }

    const result = await run(() => apiRequest(`/tickets/${code}/validate`, { method: "POST" }));
    if (result) {
      setValidationResult(result);
      setNotice({ type: result.valid ? "success" : "error", text: result.message });
      setTicketCode("");
      loadPrivateData();
    }
  }

  const myEvents = user ? events.filter((event) => event.created_by === user.id) : [];
  const activeTickets = tickets.filter((ticket) => ticket.status === "active").length;
  const viewTitle = getViewTitle(activeView);
  const mainContent = getMainContent({
    activeView,
    events,
    eventForm,
    checkout,
    checkoutFeedback,
    editingEventId,
    myEvents,
    ownerReservations,
    reservations,
    tickets,
    user,
    paymentForm,
    onCancelEvent: cancelEvent,
    onCancelCheckout: cancelCheckout,
    onCheckoutExpire: expireCheckout,
    onCancelOwnedReservation: cancelOwnedReservation,
    onCancelEdit: cancelEditingEvent,
    onEditEvent: startEditingEvent,
    onEventForm: setEventForm,
    onEventSubmit: handleCreateEvent,
    onReserve: reserveEvent,
    onPaymentForm: setPaymentForm,
    onPaymentSubmit: payCheckout,
    onTicketCode: setTicketCode,
    onValidateTicket: validateTicket,
    onValidateTicketCode: validateTicketCode,
    ticketCode,
    validationResult,
  });

  if (!user) {
    return (
      <main className="auth-shell">
        <div className="ambient-orb orb-one" />
        <div className="ambient-orb orb-two" />
        <div className="auth-content">
          <section className="auth-layout" aria-label="Acceso a Reservent">
            <div className="brand-panel">
              <p className="eyebrow">Reservent</p>
              <h1>Reservas memorables con accesos digitales seguros</h1>
              <p>
                Publica eventos, controla cupos, confirma pagos simulados y valida entradas con códigos únicos desde una plataforma centralizada.
              </p>
              <div className="brand-metrics" aria-label="Resumen de la plataforma">
                <span><strong>{events.length}</strong> eventos publicados</span>
                <span><strong>QR</strong> tickets digitales</span>
                <span><strong>24/7</strong> validación</span>
              </div>
            </div>
            <div className="auth-panel-stack">
              <AuthPanel
                user={user}
                authMode={authMode}
                loginForm={loginForm}
                registerForm={registerForm}
                onAuthMode={setAuthMode}
                onLoginForm={setLoginForm}
                onRegisterForm={setRegisterForm}
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
              <Notice notice={notice} loading={loading} />
            </div>
          </section>
          <section className="public-events-preview" aria-label="Vista previa de eventos">
            <EventsSection compact events={events} user={user} onReserve={reserveEvent} />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Header user={user} activeView={activeView} onView={goToView} onLogout={handleLogout} />

      <Notice notice={notice} loading={loading} />

      <section className="app-overview">
        <div>
          <p className="eyebrow">Panel</p>
          <h1>{viewTitle}</h1>
        </div>
        <div className="overview-metrics" aria-label="Resumen de actividad">
          <span><strong>{events.length}</strong> eventos</span>
          <span><strong>{myEvents.length}</strong> propios</span>
          <span><strong>{activeTickets}</strong> tickets activos</span>
        </div>
      </section>

      <section className="workspace" id="main-content">
        {mainContent}
      </section>
    </main>
  );
}

function getViewTitle(activeView) {
  const titles = {
    create: "Crear evento",
    checkout: "Confirmar reserva",
    "my-events": "Mis eventos",
    tickets: "Mis tickets",
    validate: "Validar tickets",
  };

  return titles[activeView] || "Eventos";
}

function buildEventPayload(form, includeStatus) {
  return {
    name: form.name,
    description: form.description,
    image_url: form.image_url || null,
    event_type: form.event_type,
    modality: form.modality,
    location: form.location,
    price: Number(form.price),
    start_datetime: form.start_datetime ? new Date(form.start_datetime).toISOString() : null,
    end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
    total_capacity: Number(form.total_capacity),
    max_tickets_per_purchase: Number(form.max_tickets_per_purchase),
    ...(includeStatus ? { status: form.status } : {}),
  };
}

function getMainContent({
  activeView,
  events,
  eventForm,
  checkout,
  checkoutFeedback,
  editingEventId,
  myEvents,
  ownerReservations,
  reservations,
  tickets,
  user,
  paymentForm,
  onCancelCheckout,
  onCheckoutExpire,
  onCancelOwnedReservation,
  onCancelEdit,
  onCancelEvent,
  onEditEvent,
  onEventForm,
  onEventSubmit,
  onReserve,
  onPaymentForm,
  onPaymentSubmit,
  onTicketCode,
  onValidateTicket,
  onValidateTicketCode,
  ticketCode,
  validationResult,
}) {
  if (activeView === "create" && user) {
    return (
      <CreateEventForm
        form={eventForm}
        isEditing={Boolean(editingEventId)}
        onCancelEdit={onCancelEdit}
        onForm={onEventForm}
        onSubmit={onEventSubmit}
      />
    );
  }

  if (activeView === "checkout" && user) {
    return (
      <CheckoutForm
        checkout={checkout}
        feedback={checkoutFeedback}
        form={paymentForm}
        key={checkout?.reservation?.id || checkoutFeedback?.title || "checkout"}
        onCancel={onCancelCheckout}
        onExpire={onCheckoutExpire}
        onForm={onPaymentForm}
        onSubmit={onPaymentSubmit}
      />
    );
  }

  if (activeView === "my-events" && user) {
    return (
      <MyEvents
        events={myEvents}
        reservationsByEvent={ownerReservations}
        onCancel={onCancelEvent}
        onCancelReservation={onCancelOwnedReservation}
        onEdit={onEditEvent}
      />
    );
  }

  if (activeView === "tickets" && user) {
    return <TicketsView reservations={reservations} tickets={tickets} />;
  }

  if (activeView === "validate" && user) {
    return <ValidatorForm result={validationResult} ticketCode={ticketCode} onScan={onValidateTicketCode} onTicketCode={onTicketCode} onSubmit={onValidateTicket} />;
  }

  return <EventsSection events={events} user={user} onReserve={onReserve} />;
}
