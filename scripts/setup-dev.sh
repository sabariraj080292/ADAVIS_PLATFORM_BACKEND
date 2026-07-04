#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.local.yml"
LOG_DIR="$SCRIPT_DIR/logs"
STATE_DIR="$SCRIPT_DIR/.state"
STATE_FILE="$STATE_DIR/services.pid"

mkdir -p "$LOG_DIR" "$STATE_DIR"

BUILD_FIRST="${BUILD_FIRST:-0}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_url() {
  local url="$1"
  local timeout="${2:-180}"
  local deadline=$((SECONDS + timeout))
  while (( SECONDS < deadline )); do
    if curl -fsS "$url" | grep -q '"status":"UP"'; then
      return 0
    fi
    sleep 3
  done
  return 1
}

seed_db() {
  local temp_js
  temp_js="$(mktemp)"
  {
    echo "db = db.getSiblingDB('adavis_platform');"
    echo "db.dropDatabase();"
    cat "$REPO_ROOT/docker/init-mongo.js"
  } > "$temp_js"
  docker exec -i adavis-mongodb mongosh "mongodb://admin:Admin123!@localhost:27017/adavis_platform?authSource=admin" --quiet < "$temp_js"
  rm -f "$temp_js"
}

start_service() {
  local name="$1"
  local path="$2"
  local url="$3"
  nohup bash -lc "cd '$REPO_ROOT/$path' && mvn spring-boot:run -DskipTests" > "$LOG_DIR/$name.log" 2>&1 &
  local pid=$!
  echo "$name:$pid" >> "$STATE_FILE"
  if ! wait_for_url "$url" 180; then
    echo "Service $name failed health check. See $LOG_DIR/$name.log" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd mvn
require_cmd java
require_cmd curl

docker compose -f "$COMPOSE_FILE" up -d
if [[ "$BUILD_FIRST" == "1" ]]; then
  mvn -f "$REPO_ROOT/pom.xml" clean install -DskipTests
fi
seed_db

: > "$STATE_FILE"
start_service auth-service services/auth-service http://localhost:9081/actuator/health
start_service mdm-service services/mdm-service http://localhost:9083/actuator/health
start_service license-service services/license-service http://localhost:8082/actuator/health
start_service audit-service services/audit-service http://localhost:8084/actuator/health
start_service api-gateway services/api-gateway http://localhost:9080/actuator/health

echo "Local stack is ready. Logs are under $LOG_DIR"