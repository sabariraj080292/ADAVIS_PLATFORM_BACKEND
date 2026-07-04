#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.aws.yml"
ENV_FILE="$REPO_ROOT/.env.aws"
STARTUP_TIMEOUT_SECONDS="${STARTUP_TIMEOUT_SECONDS:-180}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for post-deploy health checks" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.aws.example to .env.aws and update values." >&2
  exit 1
fi

required_dockerfiles=(
  "$REPO_ROOT/services/api-gateway/Dockerfile"
  "$REPO_ROOT/services/auth-service/Dockerfile"
  "$REPO_ROOT/services/mdm-service/Dockerfile"
  "$REPO_ROOT/services/iiot-service/Dockerfile"
  "$REPO_ROOT/services/license-service/Dockerfile"
  "$REPO_ROOT/services/audit-service/Dockerfile"
)

for dockerfile in "${required_dockerfiles[@]}"; do
  if [ ! -f "$dockerfile" ]; then
    echo "Missing Dockerfile: $dockerfile" >&2
    echo "Ensure Dockerfiles are committed to git and available on this host." >&2
    exit 1
  fi
done

required_keys=(
  JWT_SECRET
  MONGODB_URI
  REDIS_HOST
  REDIS_PORT
  KAFKA_BOOTSTRAP_SERVERS
  CORS_ALLOWED_ORIGINS
)

for key in "${required_keys[@]}"; do
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d'=' -f2- || true)"
  if [ -z "$value" ]; then
    echo "Missing required key in .env.aws: $key" >&2
    exit 1
  fi

  if [[ "$value" == REPLACE_* ]]; then
    echo "Placeholder value detected for $key. Update .env.aws before deployment." >&2
    exit 1
  fi
done

jwt_secret="$(grep -E '^JWT_SECRET=' "$ENV_FILE" | tail -n 1 | cut -d'=' -f2- || true)"
if [ "${#jwt_secret}" -lt 32 ]; then
  echo "JWT_SECRET must be at least 32 characters." >&2
  exit 1
fi

echo "Validating docker compose configuration..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

echo "Building and starting Adavis Platform (AWS profile)..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "Waiting for API gateway health..."
deadline=$((SECONDS + STARTUP_TIMEOUT_SECONDS))
until curl -fsS http://localhost/actuator/health >/dev/null 2>&1; do
  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "Gateway did not become healthy within ${STARTUP_TIMEOUT_SECONDS}s." >&2
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
    exit 1
  fi
  sleep 3
done

echo "Deployment is healthy. Use scripts/status-aws.sh to inspect details."
