import { useEffect, useState } from "react";

import { apiRequest, clearToken, getToken, setToken } from "./api";
import AuthPanel from "./components/AuthPanel";
import CreateEventForm from "./components/CreateEventForm";
import EventsSection from "./components/EventsSection";
import Header from "./components/Header";
import MyEvents from "./components/MyEvents";
import Notice from "./components/Notice";
import UserActivity from "./components/UserActivity";
import ValidatorForm from "./components/ValidatorForm";
import { EMPTY_EVENT, EMPTY_LOGIN, EMPTY_REGISTER } from "./constants";
import { toDateTimeLocal } from "./utils/formatters";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [activeView, setActiveView] = useState("events");
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState(null);
  const [ticketCode, setTicketCode] = useState("");
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();

    if (getToken()) {
      loadSession();
    }
  }, []);

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
    const data = await run(() => apiRequest("/events"));
    if (data) {
      setEvents(data);
    }
  }

  async function loadPrivateData() {
    const [ticketData, reservationData] = await Promise.all([
      apiRequest("/tickets/my").catch(() => []),
      apiRequest("/reservations/my").catch(() => []),
    ]);
    setTickets(ticketData);
    setReservations(reservationData);
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

  function handleLogout() {
    clearToken();
    setUser(null);
    setTickets([]);
    setReservations([]);
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
      setEventForm(EMPTY_EVENT);
      setEditingEventId(null);
      loadEvents();
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

  function startEditingEvent(event) {
    setEditingEventId(event.id);
    setEventForm({
      name: event.name,
      description: event.description || "",
      event_type: event.event_type,
      modality: event.modality,
      location: event.location || "",
      start_datetime: toDateTimeLocal(event.start_datetime),
      end_datetime: toDateTimeLocal(event.end_datetime),
      total_capacity: event.total_capacity,
      status: event.status,
    });
  }

  function cancelEditingEvent() {
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT);
  }

  async function reserveEvent(eventId) {
    const reservation = await run(() =>
      apiRequest("/reservations", {
        method: "POST",
        body: JSON.stringify({ event_id: eventId, quantity: 1 }),
      }),
    );

    if (!reservation) {
      return;
    }

    const checkout = await run(
      () =>
        apiRequest(`/reservations/${reservation.id}/pay`, {
          method: "POST",
          body: JSON.stringify({ holder_name: user.name }),
        }),
      "Reserva confirmada y ticket generado",
    );

    if (checkout) {
      loadEvents();
      loadPrivateData();
    }
  }

  async function validateTicket(event) {
    event.preventDefault();
    const code = ticketCode.trim();
    if (!code) {
      return;
    }

    const result = await run(() => apiRequest(`/tickets/${code}/validate`, { method: "POST" }));
    if (result) {
      setNotice({ type: result.valid ? "success" : "error", text: result.message });
      setTicketCode("");
      loadPrivateData();
    }
  }

  const myEvents = user ? events.filter((event) => event.created_by === user.id) : [];
  const mainContent = getMainContent({
    activeView,
    events,
    myEvents,
    reservations,
    tickets,
    user,
    onCancelEvent: cancelEvent,
    onEditEvent: startEditingEvent,
    onReserve: reserveEvent,
  });

  return (
    <main className="app-shell">
      <Header user={user} activeView={activeView} onView={setActiveView} onLogout={handleLogout} />

      <section className="hero">
        <div>
          <p className="eyebrow">Reservent</p>
          <h1>Eventos, reservas y tickets sin enredos.</h1>
          <p className="hero-copy">
            Una interfaz React más clara para consumir la API de Reservent sin el HTML monolítico anterior.
          </p>
        </div>
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
      </section>

      <Notice notice={notice} loading={loading} />

      <section className="content-grid">
        {mainContent}

        {user && (
          <aside className="side-stack">
            <CreateEventForm
              form={eventForm}
              isEditing={Boolean(editingEventId)}
              onCancelEdit={cancelEditingEvent}
              onForm={setEventForm}
              onSubmit={handleCreateEvent}
            />
            <UserActivity reservations={reservations} tickets={tickets} />
            <ValidatorForm ticketCode={ticketCode} onTicketCode={setTicketCode} onSubmit={validateTicket} />
            <MyEvents events={myEvents} onCancel={cancelEvent} onEdit={startEditingEvent} />
          </aside>
        )}
      </section>
    </main>
  );
}

function buildEventPayload(form, includeStatus) {
  return {
    name: form.name,
    description: form.description,
    event_type: form.event_type,
    modality: form.modality,
    location: form.location,
    start_datetime: new Date(form.start_datetime).toISOString(),
    end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
    total_capacity: Number(form.total_capacity),
    ...(includeStatus ? { status: form.status } : {}),
  };
}

function getMainContent({ activeView, events, myEvents, reservations, tickets, user, onCancelEvent, onEditEvent, onReserve }) {
  if (activeView === "my-events" && user) {
    return <MyEvents events={myEvents} onCancel={onCancelEvent} onEdit={onEditEvent} />;
  }

  if (activeView === "tickets" && user) {
    return <UserActivity reservations={reservations} tickets={tickets} />;
  }

  return <EventsSection events={events} user={user} onReserve={onReserve} />;
}
