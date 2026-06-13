import Input from "./Input";

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
    return null;
  }

  if (authMode === "register") {
    return (
      <form className="panel form-card" onSubmit={onRegister}>
        <div>
          <p className="eyebrow">Nuevo usuario</p>
          <h2>Crear cuenta</h2>
          <p className="form-intro">Publica eventos, reserva cupos y valida tickets desde un mismo panel.</p>
        </div>
        <Input autoComplete="name" label="Nombre" value={registerForm.name} onChange={(name) => onRegisterForm({ ...registerForm, name })} />
        <Input autoComplete="email" label="Correo" type="email" value={registerForm.email} onChange={(email) => onRegisterForm({ ...registerForm, email })} />
        <Input helper="Mínimo 8 caracteres, una mayúscula, una minúscula y un número." label="Contraseña" type="password" value={registerForm.password} onChange={(password) => onRegisterForm({ ...registerForm, password })} />
        <Input label="Confirmar contraseña" type="password" value={registerForm.confirmPassword} onChange={(confirmPassword) => onRegisterForm({ ...registerForm, confirmPassword })} />
        <button className="primary" type="submit">Registrarme</button>
        <button className="link-button" onClick={() => onAuthMode("login")} type="button">Ya tengo una cuenta</button>
      </form>
    );
  }

  return (
    <form className="panel form-card" onSubmit={onLogin}>
      <div>
        <p className="eyebrow">Acceso</p>
        <h2>Iniciar sesión</h2>
        <p className="form-intro">Entra para reservar, publicar eventos o validar accesos digitales.</p>
      </div>
      <Input autoComplete="email" label="Correo" type="email" value={loginForm.email} onChange={(email) => onLoginForm({ ...loginForm, email })} />
      <Input autoComplete="current-password" label="Contraseña" type="password" value={loginForm.password} onChange={(password) => onLoginForm({ ...loginForm, password })} />
      <button className="primary" type="submit">Entrar</button>
      <button className="link-button" onClick={() => onAuthMode("register")} type="button">Crear una cuenta</button>
    </form>
  );
}
