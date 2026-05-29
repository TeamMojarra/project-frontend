# Reservent - Frontend

Frontend de Reservent construido con React y Vite. Consume la API de `project-backend` para autenticacion, eventos, reservas, tickets digitales y validacion de accesos.

## Requisitos

- Node.js 20 o superior
- Backend disponible en `http://localhost:8000/api` o una URL configurada con `VITE_API_URL`

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Variables de entorno

Puedes cambiar la URL de la API creando un archivo `.env` local:

```env
VITE_API_URL=http://localhost:8000/api
```

## Estructura principal

- `src/App.jsx`: estado principal, navegacion y acciones contra la API.
- `src/api.js`: cliente HTTP y manejo de token JWT.
- `src/components/`: vistas y componentes de interfaz.
- `src/styles.css`: sistema visual premium dark/glass.
