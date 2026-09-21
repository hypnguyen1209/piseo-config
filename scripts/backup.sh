#!/usr/bin/env bash
# backup.sh — Chạy trên MÁY CŨ: copy config hiện tại vào repo rồi commit & push
# Dùng Git Bash trên Windows / bash trên Linux-macOS.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy() { # copy <src> <dest>
  if [ -f "$1" ]; then
    mkdir -p "$(dirname "$2")"
    cp "$1" "$2"
    echo "  ✓ $2"
  else
    echo "  ✗ (không tìm thấy: $1)"
  fi
}

echo "== Pi =="
copy "$HOME/.pi/agent/settings.json"      "$REPO_DIR/pi/settings.json"
copy "$HOME/.pi/agent/models.json"        "$REPO_DIR/pi/models.json"
copy "$HOME/.pi/agent/models-store.json"  "$REPO_DIR/pi/models-store.json"

echo "== Paseo =="
copy "$HOME/.paseo/config.json"                          "$REPO_DIR/paseo/config.json"
copy "$HOME/.paseo/projects/projects.json"               "$REPO_DIR/paseo/projects.json"
copy "$HOME/.paseo/projects/workspaces.json"             "$REPO_DIR/paseo/workspaces.json"
copy "$HOME/AppData/Roaming/Paseo/desktop-settings.json" "$REPO_DIR/paseo/desktop-settings.json"

echo
echo 'Lưu ý: auth.json & daemon-keypair.json chứa secret, được cố tình loại trừ (repo public).'
echo 'Xong. Kiểm tra diff rồi: git add -A && git commit -m "backup $(date +%F)" && git push'
