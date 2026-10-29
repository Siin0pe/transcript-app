#!/usr/bin/env bash
set -euo pipefail

NODE_MAJOR=24
RELEASE=v2.0.0
ARCHIVE_URL="https://github.com/Siin0pe/transcript-app/releases/download/$RELEASE/transcript-app.tar.gz"
ARCHIVE_SHA256=6afd413cfed97130fbc1312c42ad72ca8cb148ebcb5a316e1f5fded1396cb804
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dist"

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null; then
  SUDO="sudo"
else
  echo "Lancez ce script en root (su -), sudo n'est pas installé." >&2
  exit 1
fi

[ "$(uname -m)" = "x86_64" ] || { echo "Seules les machines Linux x86_64 sont prises en charge." >&2; exit 1; }

if ! command -v curl >/dev/null || [ ! -e /etc/ssl/certs/ca-certificates.crt ]; then
  echo "Installation de curl et des certificats (apt)"
  $SUDO apt-get update
  $SUDO apt-get install -y --no-install-recommends curl ca-certificates
fi

node_ok() {
  command -v node >/dev/null &&
    node -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 20 || (a === 20 && b >= 9) ? 0 : 1)'
}

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if ! node_ok; then
  base="https://nodejs.org/dist/latest-v${NODE_MAJOR}.x"
  curl -fsSL "$base/SHASUMS256.txt" -o "$tmp/SHASUMS256.txt"
  file="$(awk '/linux-x64\.tar\.gz$/ {print $2}' "$tmp/SHASUMS256.txt")"
  echo "Téléchargement de ${file%-linux-x64.tar.gz}"
  curl -fsSL "$base/$file" -o "$tmp/$file"
  (cd "$tmp" && grep " $file\$" SHASUMS256.txt | sha256sum -c --quiet -)
  $SUDO tar -xzf "$tmp/$file" -C /usr/local/bin --strip-components=2 "${file%.tar.gz}/bin/node"
  rm -f "$tmp/$file"
  hash -r
fi

echo "Téléchargement du site compilé ($RELEASE)"
curl -fsSL "$ARCHIVE_URL" -o "$tmp/transcript-app.tar.gz"
echo "$ARCHIVE_SHA256  $tmp/transcript-app.tar.gz" | sha256sum -c --quiet -
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$tmp/transcript-app.tar.gz" -C "$APP_DIR"

echo "Node $(node -v) installé, site dans $APP_DIR."
echo "Lancez-le avec : cd \"$APP_DIR\" && HOSTNAME=0.0.0.0 node server.js   (port 3000)"
