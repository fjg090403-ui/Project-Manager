# SaaS Project Manager

Monorepo base para un SaaS de gestion de proyectos tipo Trello/Jira.

## Stack

- Backend: Java 21, Spring Boot 3, Spring Security, JWT, Maven, PostgreSQL, JPA/Hibernate.
- Frontend principal: React + Vite + React Router + Axios + Socket.IO client + Tailwind CSS.
- Panel admin: Angular standalone + Tailwind CSS.
- Realtime: Node.js + Express + Socket.IO.
- Infra local: Docker Compose con PostgreSQL y servicios principales.

## Estructura

```text
saas-project-manager/
|-- backend/
|-- frontend-app/
|-- frontend-admin/
|-- realtime-service/
|-- docker-compose.yml
|-- README.md
`-- .env.example
```

## Cuentas de prueba

El backend inserta datos iniciales si la base de datos esta vacia.

- `admin@example.com` / `password123`
- `manager@example.com` / `password123`
- `member@example.com` / `password123`

## Ejecutar con Docker

```bash
cp .env.example .env
docker compose up --build
```

Servicios:

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Realtime health: `http://localhost:4000/health`
- React app: `http://localhost:8081`
- Angular admin: `http://localhost:8082`

## Ejecutar por separado

PostgreSQL:

```bash
docker compose up postgres
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

React:

```bash
cd frontend-app
npm install
npm run dev
```

Angular admin:

```bash
cd frontend-admin
npm install
npm start
```

Realtime:

```bash
cd realtime-service
npm install
npm run dev
```

## Kanban

La app React incluye una vista Kanban en `/board` con:

- Crear columnas.
- Crear, editar, eliminar y mover tareas.
- Drag and drop entre columnas.
- Asignacion de tareas a usuarios.
- Prioridad `LOW`, `MEDIUM`, `HIGH`.
- Fecha limite.
- Comentarios por tarea.
- Actualizacion en tiempo real mediante Socket.IO para creacion, edicion, movimiento, eliminacion y comentarios.

## Sistema de diseño

Los frontends usan Tailwind CSS con tokens compartidos de color, sombra, radio, tipografia y espaciado. La app React incluye componentes reutilizables para botones, inputs, selects, cards, badges, alertas, skeleton loaders y estados vacios. El admin Angular reutiliza el mismo lenguaje visual desde estilos globales Tailwind.

## API principal

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/users`
- `GET /api/organizations`
- `GET /api/projects`
- `GET /api/boards`
- `GET /api/columns`
- `POST /api/columns`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/move`
- `DELETE /api/tasks/{id}`
- `GET /api/comments`
- `POST /api/comments`
- `GET /api/notifications`

Todas las rutas salvo auth requieren `Authorization: Bearer <token>`.

### Ejemplo de tarea

```json
{
  "title": "Prepare launch checklist",
  "description": "Review production readiness",
  "columnId": 1,
  "assigneeId": 2,
  "priority": "HIGH",
  "dueDate": "2026-07-01"
}
```

## Eventos Socket.IO

El servicio realtime acepta y retransmite:

- `taskCreated`
- `taskUpdated`
- `taskMoved`
- `taskDeleted`
- `commentCreated`
- `notificationCreated`

Tambien soporta `joinBoard` para unirse a la sala `board:<id>`.

## Variables de entorno

No se hardcodean secretos en despliegues reales. Usa `.env.example` como plantilla y cambia `JWT_SECRET`, credenciales de PostgreSQL y origenes CORS antes de publicar.
