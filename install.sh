#!/usr/bin/env bash
set -euo pipefail

NODE_MAJOR=24
RELEASE=v2.2.2
ARCHIVE_URL="https://github.com/Siin0pe/transcript-app/releases/download/$RELEASE/transcript-app.tar.gz"
ARCHIVE_SHA256=cbb7a28a5a8999e6f2ec020384a56f5415088bdca58ad3afc6aaacfb2914b64e
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dist"

[ "$(uname -m)" = "x86_64" ] || { echo "Seules les machines Linux x86_64 sont prises en charge." >&2; exit 1; }

if command -v curl >/dev/null; then
  fetch() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null; then
  fetch() { wget -q -O "$2" "$1"; }
else
  echo "Ni curl ni wget n'est installé. En root : apt-get install -y wget ca-certificates" >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Téléchargement du site compilé ($RELEASE)"
fetch "$ARCHIVE_URL" "$tmp/transcript-app.tar.gz"
echo "$ARCHIVE_SHA256  $tmp/transcript-app.tar.gz" | sha256sum -c --quiet -
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$tmp/transcript-app.tar.gz" -C "$APP_DIR"

base="https://nodejs.org/dist/latest-v${NODE_MAJOR}.x"
fetch "$base/SHASUMS256.txt" "$tmp/SHASUMS256.txt"
file="$(awk '/linux-x64\.tar\.gz$/ {print $2}' "$tmp/SHASUMS256.txt")"
echo "Téléchargement de ${file%-linux-x64.tar.gz}"
fetch "$base/$file" "$tmp/$file"
(cd "$tmp" && grep " $file\$" SHASUMS256.txt | sha256sum -c --quiet -)
tar -xzf "$tmp/$file" -C "$APP_DIR" --strip-components=2 "${file%.tar.gz}/bin/node"

echo "Installé dans $APP_DIR (Node $("$APP_DIR/node" -v))."
echo "Lancez le site avec : cd \"$APP_DIR\" && HOSTNAME=0.0.0.0 ./node server.js   (port 3000)"
