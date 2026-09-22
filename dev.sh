#!/usr/bin/env bash
# One-click local dev: Semantica backend (:8010) + Vite frontend (:2000)
#
# Usage:
#   ./dev.sh                        # default graph: demo_graph.json
#   GRAPH_FILE=my_graph.json ./dev.sh
#
# Ctrl+C stops both the frontend and the backend it started.
set -u
cd "$(dirname "$0")"
ROOT=$PWD
GRAPH_FILE=${GRAPH_FILE:-demo_graph.json}
BACKEND_PID=""

if lsof -nP -iTCP:8010 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "OK backend already running on 8010, reusing it"
else
  echo "--> starting backend on 8010 (anonymous mode, graph=$GRAPH_FILE)"
  SEMANTICA_ALLOW_ANONYMOUS=true "$ROOT/.venv/bin/python" -m semantica.explorer \
    --graph "$GRAPH_FILE" --port 8010 --no-browser &
  BACKEND_PID=$!
  ready=""
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if curl -sf http://127.0.0.1:8010/api/health >/dev/null 2>&1; then ready=1; break; fi
    sleep 1
  done
  if [ -n "$ready" ]; then
    echo "OK backend ready on 8010"
  else
    echo "WARN backend still starting up (pid $BACKEND_PID), continuing anyway"
  fi
fi

echo "--> starting Vite dev server on 2000 (press Ctrl+C to stop both)"

stop_backend() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null
  fi
}
trap stop_backend INT TERM

(cd "$ROOT/explorer" && pnpm run dev)
