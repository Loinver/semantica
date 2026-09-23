#!/usr/bin/env bash
# Starts the Semantica backend, then the Vite dev server.
# Invoked by `pnpm dev` from either the repo root or explorer/.
set -u
cd "$(dirname "$0")"
ROOT=$PWD
EXPLORER=$ROOT/explorer
GRAPH_FILE=${GRAPH_FILE:-$ROOT/demo_graph.json}
BACKEND_PORT=${BACKEND_PORT:-8010}
FRONTEND_PORT=${FRONTEND_PORT:-2000}
BACKEND_PID=""

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
  echo "starting backend on $BACKEND_PORT (graph=$GRAPH_FILE)"
  SEMANTICA_ALLOW_ANONYMOUS=true \
    "$ROOT/.venv/bin/python" -m semantica.explorer \
    --graph "$GRAPH_FILE" --port "$BACKEND_PORT" --no-browser &
  BACKEND_PID=$!
fi

if lsof -nP -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "frontend already listening on $FRONTEND_PORT" >&2
  echo "stop that Vite process and run pnpm dev again so it proxies to $BACKEND_PORT" >&2
  exit 1
fi

echo "starting frontend on $FRONTEND_PORT"
cd "$EXPLORER"
exec env VITE_EXPLORER_API_TARGET="http://127.0.0.1:$BACKEND_PORT" pnpm exec vite --port "$FRONTEND_PORT" --strictPort
