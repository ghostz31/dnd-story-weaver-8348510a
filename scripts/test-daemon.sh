#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== Besace Beta-Test Daemon Launcher ==="
echo "Project: $PROJECT_DIR"
echo "Mode: Test (pas d'émulateur Firebase requis)"

cleanup() {
  echo ""
  echo "=== Cleanup ==="
  if [ -n "$VITE_PID" ]; then
    echo "Stopping Vite dev server (PID $VITE_PID)..."
    kill $VITE_PID 2>/dev/null || true
    wait $VITE_PID 2>/dev/null || true
  fi
  echo "Done."
}

trap cleanup EXIT INT TERM

# Start Vite dev server in test mode
echo ""
echo "[1/2] Starting Vite dev server (test mode)..."
cd "$PROJECT_DIR"
VITE_TEST_MODE=true npx vite --port 5173 &
VITE_PID=$!

# Wait for Vite
echo "Waiting for Vite..."
for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Vite dev server ready on http://localhost:5173"
    break
  fi
  if ! kill -0 $VITE_PID 2>/dev/null; then
    echo "ERROR: Vite process died."
    exit 1
  fi
  sleep 1
done

# Run daemon
echo ""
echo "[2/2] Starting beta-test daemon..."
cd "$PROJECT_DIR"
npx tsx tests/e2e/daemon.ts

echo "Daemon exited."
