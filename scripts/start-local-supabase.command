#!/bin/zsh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Checking Docker ==="
if ! docker info >/dev/null 2>&1; then
  echo "Starting Docker Desktop..."
  open -a Docker || true
  for i in {1..60}; do
    docker info >/dev/null 2>&1 && break
    sleep 2
  done
fi
docker info >/dev/null || { echo "Docker is not running."; exit 1; }

echo "=== Starting local Supabase ==="
supabase start

echo "=== Writing .env.local ==="
STATUS_FILE="$(mktemp)"
supabase status -o env > "$STATUS_FILE"
# shellcheck disable=SC1090
source "$STATUS_FILE"
cat > .env.local <<EOF
VITE_SUPABASE_URL=${API_URL}
VITE_SUPABASE_ANON_KEY=${ANON_KEY}
VITE_WHATSAPP_NUMBER=918796729435
EOF

mkdir -p .supabase supabase/functions
{
  echo "ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173"
  echo "GEMINI_MODEL=${GEMINI_MODEL:-gemini-3.5-flash-lite}"
  grep -E '^GEMINI_API_KEY=' .env 2>/dev/null || true
} > supabase/.env
cp supabase/.env supabase/functions/.env

# If the local edge-runtime compose overlay exists, refresh it from live status keys.
if [[ -f .supabase/docker-compose.functions.yml ]]; then
  echo "=== Refreshing edge runtime with local secrets ==="
  PROJECT_ID="$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
  python3 - "$STATUS_FILE" "$PROJECT_ID" <<'PY'
import json, sys
from pathlib import Path
status_path, project_id = sys.argv[1], sys.argv[2]
env = {}
for line in Path(status_path).read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k] = v.strip().strip('"')
gemini = model = ""
if Path(".env").exists():
    for line in Path(".env").read_text().splitlines():
        if line.startswith("GEMINI_API_KEY="):
            gemini = line.split("=", 1)[1]
        if line.startswith("GEMINI_MODEL="):
            model = line.split("=", 1)[1]
model = model or "gemini-3.5-flash-lite"
names = [
    "admin-ops", "assistant-chat", "create-order", "order-lookup", "razorpay-webhook",
    "shipping-serviceability", "shiprocket-webhook", "validate-coupon", "verify-payment", "whatsapp-webhook",
]
funcs = {
    n: {
        "verifyJWT": n not in {"razorpay-webhook", "shiprocket-webhook", "whatsapp-webhook"},
        "entrypointPath": f"supabase/functions/{n}/index.ts",
    }
    for n in names
}
edge = {
    "SUPABASE_URL": "http://kong:8000",
    "SUPABASE_ANON_KEY": env["ANON_KEY"],
    "SUPABASE_SERVICE_ROLE_KEY": env["SERVICE_ROLE_KEY"],
    "SUPABASE_DB_URL": f"postgresql://postgres:postgres@supabase_db_{project_id}:5432/postgres",
    "SUPABASE_INTERNAL_HOST_PORT": "54321",
    "SUPABASE_INTERNAL_JWT_SECRET": env.get("JWT_SECRET", ""),
    "ALLOWED_ORIGINS": "http://localhost:5173,http://127.0.0.1:5173",
    "GEMINI_MODEL": model,
    "SUPABASE_INTERNAL_FUNCTIONS_CONFIG": json.dumps(funcs, separators=(",", ":")),
}
if env.get("PUBLISHABLE_KEY"):
    edge["SUPABASE_INTERNAL_PUBLISHABLE_KEY"] = env["PUBLISHABLE_KEY"]
if env.get("SECRET_KEY"):
    edge["SUPABASE_INTERNAL_SECRET_KEY"] = env["SECRET_KEY"]
if gemini:
    edge["GEMINI_API_KEY"] = gemini
Path(".supabase/edge-runtime.env").write_text("\n".join(f"{k}={v}" for k, v in edge.items()) + "\n")
print("edge-runtime.env ready")
PY
  docker compose -f .supabase/docker-compose.functions.yml up -d --force-recreate
fi

rm -f "$STATUS_FILE"
echo
echo "Studio: ${STUDIO_URL:-http://127.0.0.1:54323}"
echo "API:    ${API_URL}"
echo "App:    http://127.0.0.1:5173"
echo
exec pnpm dev --host 127.0.0.1 --port 5173
