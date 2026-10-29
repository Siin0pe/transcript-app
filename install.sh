#!/usr/bin/env bash
# Installe transcript-app sur une VM Debian/Ubuntu vierge (sans Node).
# Usage : ./install.sh [--skip-system]
#   --skip-system  n'installe pas Node (déjà présent, version >= 20.9)
set -euo pipefail

NODE_MAJOR=22
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_SYSTEM=0

for arg in "$@"; do
  case "$arg" in
    --skip-system) SKIP_SYSTEM=1 ;;
    -h|--help) sed -n '2,4p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 1 ;;
  esac
done

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

cd "$APP_DIR"

if [ "$SKIP_SYSTEM" -eq 0 ]; then
  [ -r /etc/debian_version ] || { echo "Script prévu pour Debian/Ubuntu (apt)." >&2; exit 1; }

  node_ok=0
  if command -v node >/dev/null; then
    node -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 20 || (a === 20 && b >= 9) ? 0 : 1)' && node_ok=1
  fi
  if [ "$node_ok" -eq 0 ]; then
    log "Node.js $NODE_MAJOR (NodeSource)"
    $SUDO apt-get update
    $SUDO apt-get install -y ca-certificates curl gnupg
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
  fi
fi

log "Versions"
node -v
npm -v

log "Dépendances npm"
npm ci

log "Build de production"
npm run build

log "Installé. Lancez le site avec : npm start   (http://localhost:3000)"
