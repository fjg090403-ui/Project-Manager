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
