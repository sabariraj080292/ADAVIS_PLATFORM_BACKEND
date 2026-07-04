#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.aws.yml"
ENV_FILE="$REPO_ROOT/.env.aws"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required" >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
else
  docker compose -f "$COMPOSE_FILE" ps
fi

echo "Gateway health check:"
if command -v curl >/dev/null 2>&1; then
  curl -fsS http://localhost/actuator/health || true
elif command -v wget >/dev/null 2>&1; then
  wget -q -O - http://localhost/actuator/health || true
else
  echo "Neither curl nor wget is available for health check."
fi
