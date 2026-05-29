import Input from "./Input";
import { getInitials } from "../utils/formatters";

export default function AuthPanel({
  user,
  authMode,
  loginForm,
  registerForm,
  onAuthMode,
  onLoginForm,
  onRegisterForm,
  onLogin,
  onRegister,
}) {
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
