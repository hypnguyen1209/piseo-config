#!/usr/bin/env bash
# restore.sh — Chạy trên MÁY MỚI: copy config từ repo vào đúng vị trí
# Yêu cầu: đã cài pi (pi coding agent) và Paseo desktop. Dùng Git Bash trên Windows.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy() { # copy <src> <dest>
  if [ -f "$1" ]; then
    mkdir -p "$(dirname "$2")"
    cp "$1" "$2"
    echo "  ✓ $2"
  else
    echo "  ✗ (không có trong repo: $1)"
  fi
}

echo "== Pi =="
copy "$REPO_DIR/pi/settings.json"      "$HOME/.pi/agent/settings.json"
copy "$REPO_DIR/pi/models.json"        "$HOME/.pi/agent/models.json"
copy "$REPO_DIR/pi/models-store.json"  "$HOME/.pi/agent/models-store.json"

echo "== Paseo =="
copy "$REPO_DIR/paseo/config.json"                          "$HOME/.paseo/config.json"
copy "$REPO_DIR/paseo/projects.json"                        "$HOME/.paseo/projects/projects.json"
copy "$REPO_DIR/paseo/workspaces.json"                      "$HOME/.paseo/projects/workspaces.json"
copy "$REPO_DIR/paseo/desktop-settings.json" "$HOME/AppData/Roaming/Paseo/desktop-settings.json"

echo
echo 'Còn lại làm thủ công (xem README.md):'
echo '  1. pi tự cài lại packages trong settings.json khi khởi động.'
echo '  2. Đăng nhập lại pi (auth) và export NINE_ROUTER_KEY.'
echo '  3. Paseo desktop sẽ tự sinh daemon-keypair.json khi chạy lần đầu.'
