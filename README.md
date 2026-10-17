# ShiftPilot
> Real-Time Dispatch & Field Operations Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Live Demo
**Public URL:** [ShiftPilot Live Demo](#) (Mock URL for CV)

To experience the real-time sync, open these two links in separate browser tabs side-by-side:
- **Dispatcher Demo Login:** `dispatcher@fastdelivery.com` / `password123`
- **Agent Demo Login:** `+962790000001` / `1234`

*Watch the dispatcher board update live as you tap through the agent's task!*

## The Problem
Most SME field operations (delivery, home maintenance, field sales) are coordinated manually via WhatsApp and spreadsheets. Operations teams lack live visibility, audit trails, and data to prevent missed SLAs before the customer complains. 

## Screenshots
*(Add your screenshots here: Dispatch Board, Agent Mobile View, Analytics)*

## Architecture
ShiftPilot uses a real-time event-driven architecture. 
**Key scalability design:** Redis pub/sub horizontally scales the WebSocket broadcast. A status change handled by API instance A broadcasts to Redis, allowing API instance B to instantly push the update to its connected dispatcher clients, eliminating the need for sticky sessions.

## Tech Stack
| Component | Technology | Justification |
|-----------|------------|---------------|
| **Backend** | Java 17, Spring Boot 3 | Robust ecosystem for concurrency and domain-driven state machines. |
| **Database** | PostgreSQL | Relational integrity + Optimistic locking for concurrency control. |
| **Real-time** | WebSockets (STOMP), Redis | Redis Pub/Sub enables horizontal scaling of the WebSocket layer. |
| **Frontend** | React 18, TypeScript | Strongly typed, single codebase serving both dispatcher console and mobile agent view. |
| **State** | TanStack Query, Zustand | WebSocket-driven cache patching for live UI updates. |
| **DevOps** | Docker, AWS (ECS/RDS) | Cloud-native deployment. |

## Features
- **Live Dispatch Board:** Kanban board updating in real time.
- **Agent Mobile App:** Streamlined mobile view for field workers.
- **Rule-based Auto-assignment:** Load-balanced task distribution.
- **SLA Monitor:** Background jobs flag at-risk tasks.
- **Concurrency Safety:** Optimistic locking prevents double-booking.

## Getting Started
Run locally with Docker Compose:
```bash
docker-compose up -d --build
```
The app will be available at `http://localhost:5173`, with the API at `http://localhost:8080`.

## Environment Setup
Copy `.env.example` to `.env` and configure your local Postgres and Redis credentials if running outside of Docker.

## API Documentation
The REST API is documented via OpenAPI/Swagger. (Available at `/swagger-ui.html` in dev mode).
WebSocket subscriptions use STOMP over SockJS.

## Database Schema
The database uses Flyway for migrations. See `backend/src/main/resources/db/migration/V1__init_schema.sql` for the ERD definitions.

## Testing
Comprehensive test suite including unit tests for the State Machine, integration tests using Testcontainers, and a flagship **Playwright two-browser-session real-time E2E test** that asserts the WebSocket sync.

## Security
- BCrypt password hashing.
- Object-level authorization (Agents can only access their assigned tasks).
- Optimistic locking (prevents race conditions).
- JWT auth for REST and WebSocket connections.

## Deployment
Packaged as Docker containers, deployed to AWS (App Runner/ECS + RDS PostgreSQL + ElastiCache Redis). CI/CD via GitHub Actions.

## Roadmap
- Route optimization engine.
- Offline-first Agent PWA.
- Predictive staffing suggestions.

## License
MIT
