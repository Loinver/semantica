#!/usr/bin/env bash
# Starts the Semantica backend, then the Vite dev server.
# Invoked by `pnpm dev` from either the repo root or explorer/.
set -u
cd "$(dirname "$0")"
ROOT=$PWD
EXPLORER=$ROOT/explorer
GRAPH_FILE=${GRAPH_FILE:-$ROOT/demo_graph.json}
BACKEND_PORT=${BACKEND_PORT:-2010}
FRONTEND_PORT=${FRONTEND_PORT:-2000}
DEV_HOST=${DEV_HOST:-$(ipconfig getifaddr en0 2>/dev/null || true)}
BACKEND_PID=""

if [ -z "$DEV_HOST" ]; then
  echo "could not detect a LAN address; set DEV_HOST explicitly" >&2
  exit 1
fi

if [ ! -x "$ROOT/.venv/bin/python" ]; then
  echo "missing $ROOT/.venv/bin/python — create the venv and install semantica[explorer] first" >&2
  exit 1
fi
if [ ! -f "$GRAPH_FILE" ]; then
  echo "graph file not found: $GRAPH_FILE" >&2
  exit 1
fi

stop_backend() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    BACKEND_PID=""
  fi
}
trap stop_backend EXIT INT TERM

if lsof -nP -iTCP:"$BACKEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "backend already listening on $BACKEND_PORT, reusing it"
else
  echo "starting backend on $DEV_HOST:$BACKEND_PORT (graph=$GRAPH_FILE)"
  SEMANTICA_ALLOW_ANONYMOUS=true \
    EXPLORER_CORS_ORIGINS="http://$DEV_HOST:$FRONTEND_PORT,http://localhost:$FRONTEND_PORT,http://127.0.0.1:$FRONTEND_PORT" \
    "$ROOT/.venv/bin/python" -m semantica.explorer \
    --graph "$GRAPH_FILE" --host 0.0.0.0 --port "$BACKEND_PORT" --no-browser &
  BACKEND_PID=$!
fi

if lsof -nP -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "frontend already listening on $FRONTEND_PORT" >&2
  echo "stop that Vite process and run pnpm dev again so it proxies to $BACKEND_PORT" >&2
  exit 1
fi

echo "starting frontend on localhost and $DEV_HOST:$FRONTEND_PORT"
cd "$EXPLORER"
exec env VITE_EXPLORER_API_TARGET="http://127.0.0.1:$BACKEND_PORT" \
  pnpm exec vite --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort
