# BusPass Management

Spring Boot 4 / Java 21 backend, React/Vite frontend, and PostgreSQL.

## Run locally with Docker Compose

Docker Desktop (or Docker Engine with the Compose plugin) is required. From the repository root:

```powershell
Copy-Item .env.example .env
# Set DOCKERHUB_USERNAME to your Docker Hub namespace in .env if you want Compose image names under it.
docker compose up --build -d
docker compose ps
```

Compose builds the backend and frontend images from this checkout, so it does not need published images. The `postgres_data` named volume preserves database data when containers are stopped or recreated.

Stop the stack with `docker compose down`. This keeps the database volume. Do not add `-v` if you want to preserve the data.

## URLs

Defaults from `.env.example`:

- Frontend: <http://localhost:3001>
- Backend API: <http://localhost:8082/BusPass/>
- Swagger UI: <http://localhost:3001/swagger-ui/index.html> (also available at <http://localhost:8082/swagger-ui/index.html>)
- PostgreSQL host port: `5433`

The React/Vite app in `frontend-react/` is served by Nginx, which proxies `/BusPass`, `/v3/api-docs`, and `/swagger-ui/` to the backend service. The Vite development proxy remains configured for `http://localhost:8081`.

## Images and GitHub Actions

Images published by the workflow (replace `<dockerhub-username>` with the Docker Hub namespace):

- `<dockerhub-username>/soataskworkspace-backend:latest` and `:<commit-sha>`
- `<dockerhub-username>/soataskworkspace-frontend:latest` and `:<commit-sha>`

`.github/workflows/main.yml` builds and validates the backend, frontend, Compose configuration, and both Docker images on pull requests to `main` and pushes to `main`. It publishes images only for pushes to `main`. Add repository Actions secrets named `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (a Docker Hub access token) to enable publishing. No credentials belong in `.env.example` or source control.

## Build without Docker

```powershell
cd backend; .\mvnw.cmd -B verify; cd ..
cd frontend-react; npm ci; npm run build; cd ..
```
