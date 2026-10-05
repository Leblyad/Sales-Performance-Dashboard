---
name: update-containers
description: >-
  Rebuilds or restarts the docker compose services for this repository.
  Use after a frontend or backend task, and for "обнови контейнер",
  "перезапусти контейнер", "пересобери контейнер", "docker compose",
  "update the container", "restart the container", "rebuild the container".
---

# Update containers

## When to use

The user asks to update, rebuild, or restart containers. Also after a frontend task, so http://localhost:5173 serves the new screen, and after a backend task, so the `api` image matches the code.

Run the commands from the repository root, where `docker-compose.yml` is. Do not run `git commit`.

## Which command

- Frontend files only: `docker compose up -d --build frontend`. Do not rebuild `api` or `postgres`.
- Backend files only: `docker compose up -d --build api`. Do not rebuild `frontend` or the Postgres image.
- The image is already current and the user wants a restart: `docker compose restart` and the service name.
- `docker-compose.yml` changed, more than one service changed, or the user asks for the whole stack: `docker compose up -d --build`.

`docker compose down -v` deletes the database volume. Run it only when the user asks to reset the data.

## After the command

1. Run `docker compose ps`.
2. Say which services are up.
3. Frontend: http://localhost:5173. API: http://localhost:8080/health.
