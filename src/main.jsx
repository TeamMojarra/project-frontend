import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { apiRequest, clearToken, getToken, setToken } from "./api";
import "./styles.css";

const EMPTY_LOGIN = { email: "", password: "" };
const EMPTY_REGISTER = { name: "", email: "", password: "", confirmPassword: "" };
const EMPTY_EVENT = {
  name: "",
  description: "",
  event_type: "event",
  modality: "presencial",
  location: "",
  start_datetime: "",
  end_datetime: "",
  total_capacity: 30,
};

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [activeView, setActiveView] = useState("events");
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
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
    const data = await run(
      () =>
        apiRequest("/events", {
          method: "POST",
          body: JSON.stringify({
            ...eventForm,
            start_datetime: new Date(eventForm.start_datetime).toISOString(),
            end_datetime: eventForm.end_datetime ? new Date(eventForm.end_datetime).toISOString() : null,
            total_capacity: Number(eventForm.total_capacity),
          }),
        }),
      "Evento creado",
    );

    if (data) {
      setEventForm(EMPTY_EVENT);
      loadEvents();
    }
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

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}
      {loading && <div className="loading-bar" />}

      <section className="content-grid">
        <EventsSection events={events} user={user} onReserve={reserveEvent} />

        {user && (
          <aside className="side-stack">
            <CreateEventForm form={eventForm} onForm={setEventForm} onSubmit={handleCreateEvent} />
            <UserActivity reservations={reservations} tickets={tickets} />
            <ValidatorForm ticketCode={ticketCode} onTicketCode={setTicketCode} onSubmit={validateTicket} />
            <MyEvents events={myEvents} />
          </aside>
        )}
      </section>
    </main>
  );
}

function Header({ user, activeView, onView, onLogout }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => onView("events")} type="button">
        Reservent<span>.</span>
      </button>
      <nav>
        <button className={activeView === "events" ? "active" : ""} onClick={() => onView("events")} type="button">
          Eventos
        </button>
        {user && <button type="button">Mis tickets</button>}
      </nav>
      {user ? (
        <div className="session-pill">
          <span>{getInitials(user.name)}</span>
          <strong>{user.name}</strong>
          <button onClick={onLogout} type="button">Salir</button>
        </div>
      ) : (
        <span className="muted">Invitado</span>
      )}
    </header>
  );
}

function AuthPanel({ user, authMode, loginForm, registerForm, onAuthMode, onLoginForm, onRegisterForm, onLogin, onRegister }) {
  if (user) {
    return (
      <article className="panel auth-summary">
        <span className="avatar-large">{getInitials(user.name)}</span>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <span className="badge">{user.role}</span>
      </article>
    );
  }

  if (authMode === "register") {
    return (
      <form className="panel form-card" onSubmit={onRegister}>
        <h2>Crear cuenta</h2>
        <Input label="Nombre" value={registerForm.name} onChange={(name) => onRegisterForm({ ...registerForm, name })} />
        <Input label="Correo" type="email" value={registerForm.email} onChange={(email) => onRegisterForm({ ...registerForm, email })} />
        <Input label="Contraseña" type="password" value={registerForm.password} onChange={(password) => onRegisterForm({ ...registerForm, password })} />
        <Input label="Confirmar" type="password" value={registerForm.confirmPassword} onChange={(confirmPassword) => onRegisterForm({ ...registerForm, confirmPassword })} />
        <button className="primary" type="submit">Registrarme</button>
        <button className="link-button" onClick={() => onAuthMode("login")} type="button">Ya tengo cuenta</button>
      </form>
    );
  }

  return (
    <form className="panel form-card" onSubmit={onLogin}>
      <h2>Iniciar sesión</h2>
      <Input label="Correo" type="email" value={loginForm.email} onChange={(email) => onLoginForm({ ...loginForm, email })} />
      <Input label="Contraseña" type="password" value={loginForm.password} onChange={(password) => onLoginForm({ ...loginForm, password })} />
      <button className="primary" type="submit">Entrar</button>
      <button className="link-button" onClick={() => onAuthMode("register")} type="button">Crear una cuenta</button>
    </form>
  );
}

function EventsSection({ events, user, onReserve }) {
  return (
    <section className="panel events-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Explorar</p>
          <h2>Eventos disponibles</h2>
        </div>
        <span>{events.length} publicados</span>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <article className="event-card" key={event.id}>
            <div>
              <span className={`status ${event.status}`}>{event.status}</span>
              <h3>{event.name}</h3>
              <p>{event.description || "Sin descripción"}</p>
            </div>
            <dl>
              <div><dt>Fecha</dt><dd>{formatDate(event.start_datetime)}</dd></div>
              <div><dt>Modalidad</dt><dd>{event.modality}</dd></div>
              <div><dt>Cupos</dt><dd>{event.available_capacity}/{event.total_capacity}</dd></div>
            </dl>
            <button disabled={!user || event.available_capacity < 1} onClick={() => onReserve(event.id)} type="button">
              {user ? "Reservar" : "Inicia sesión para reservar"}
            </button>
          </article>
        ))}
        {events.length === 0 && <p className="empty-state">Aún no hay eventos publicados.</p>}
      </div>
    </section>
  );
}

function CreateEventForm({ form, onForm, onSubmit }) {
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
      <Input label="Fin" type="datetime-local" value={form.end_datetime} onChange={(end_datetime) => onForm({ ...form, end_datetime })} />
      <Input label="Capacidad" type="number" value={form.total_capacity} onChange={(total_capacity) => onForm({ ...form, total_capacity })} />
      <button className="primary" type="submit">Publicar</button>
    </form>
  );
}

function UserActivity({ reservations, tickets }) {
  return (
    <article className="panel compact-panel">
      <h2>Actividad</h2>
      <p>{reservations.length} reservas</p>
      <p>{tickets.length} tickets</p>
      <div className="ticket-list">
        {tickets.slice(0, 4).map((ticket) => (
          <span key={ticket.id}>{ticket.ticket_code}</span>
        ))}
      </div>
    </article>
  );
}

function ValidatorForm({ ticketCode, onTicketCode, onSubmit }) {
  return (
    <form className="panel form-card" onSubmit={onSubmit}>
      <h2>Validar ticket</h2>
      <Input label="Código" value={ticketCode} onChange={onTicketCode} placeholder="RSV-ABC123" />
      <button type="submit">Validar</button>
    </form>
  );
}

function MyEvents({ events }) {
  return (
    <article className="panel compact-panel">
      <h2>Mis eventos</h2>
      {events.map((event) => (
        <p key={event.id}>{event.name}</p>
      ))}
      {events.length === 0 && <p className="muted">No has creado eventos todavía.</p>}
    </article>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required={type !== "datetime-local" || label === "Inicio"} />
    </label>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);
