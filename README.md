# piseo-config

Backup toàn bộ cấu hình **pi coding agent** (config + plugins + models list) và **Paseo** (config) để đồng bộ giữa các máy.

> ⚠️ **Repo này KHÔNG chứa secret** (API keys, keypair). Xem phần [Bảo mật](#-bảo-mật).

## Cấu trúc repo

```
piseo-config/
├── README.md
├── scripts/
│   ├── backup.sh          # Copy config từ máy vào repo này
│   └── restore.sh         # Copy config từ repo này ra máy
├── pi/                    # ~/.pi/agent/
│   ├── settings.json      # Config chính + danh sách packages/plugins (@pify/*)
│   ├── models.json        # Custom providers & models list (9Router, OpenRouter, ...)
│   └── models-store.json  # Models store của pi
└── paseo/
    ├── config.json              # ~/.paseo/config.json (daemon config)
    ├── projects.json            # ~/.paseo/projects/projects.json (danh sách project)
    ├── workspaces.json          # ~/.paseo/projects/workspaces.json
    └── desktop-settings.json    # ~/AppData/Roaming/Paseo/desktop-settings.json
```

## Những gì được backup

**Pi:**
- `settings.json` — theme, default provider/model, và **danh sách 20 plugins** `@pify/*` (todo, memory, plan-mode, yolo, swarm, workflow, ...). Pi sẽ **tự động cài lại** các packages này từ danh sách trong `settings.json` khi khởi động, nên không cần backup `node_modules`.
- `models.json` — toàn bộ custom providers/models (9Router local proxy, OpenRouter, CMC, MiniMax...).
- `models-store.json` — models store.

**Paseo:**
- `config.json` — daemon listen address, CORS, relay settings.
- `projects.json` / `workspaces.json` — danh sách project & workspace đã mở.
- `desktop-settings.json` — settings của app desktop (release channel, notification...).

## Những gì CỐ TÌNH loại trừ

| File | Lý do |
|---|---|
| `~/.pi/agent/auth.json` | Chứa API keys / token đăng nhập → secret |
| `~/.paseo/daemon-keypair.json` | Keypair của daemon → secret |
| `~/.pi/agent/npm/` | `node_modules` — pi tự cài lại từ `settings.json` |
| `~/.pi/agent/sessions/`, `memory/` | Dữ liệu cá nhân theo máy |
| `~/.paseo/daemon.log`, `*.pid`, `server-id`, `cli-client-id` | File runtime |
| Cache Electron (`~/AppData/Roaming/Paseo/Cache`, ...) | Tự sinh lại |

## 🔐 Bảo mật

Repo **public** nên không chứa bất kỳ secret nào:

- **Pi auth**: đăng nhập lại sau khi restore (`pi` → chạy lệnh login), hoặc tự quản lý auth bên ngoài.
- **`NINE_ROUTER_KEY`**: `pi/models.json` tham chiếu qua biến môi trường `$NINE_ROUTER_KEY` (không chứa key thật). Trên máy mới cần set biến môi trường này, ví dụ thêm vào `~/.bashrc`:

  ```bash
  export NINE_ROUTER_KEY="<key-của-bạn>"
  ```

- **`daemon-keypair.json`**: Paseo tự sinh keypair mới khi chạy daemon lần đầu — không cần restore.

## 📤 Backup (máy cũ)

```bash
git clone https://github.com/hypnguyen1209/piseo-config.git
cd piseo-config
bash scripts/backup.sh          # copy config máy hiện tại vào repo
git add -A
git commit -m "backup $(date +%F)"
git push
```

> Windows: dùng **Git Bash** để chạy script.

## 📥 Restore (máy mới)

1. Cài đặt môi trường:
   - [Git](https://git-scm.com/) + Git Bash (Windows)
   - [pi coding agent](https://github.com/earendil-works/pi-coding-agent) (`npm i -g @earendil-works/pi-coding-agent` hoặc theo docs)
   - [Paseo desktop](https://paseo.sh)

2. Restore config:

   ```bash
   git clone https://github.com/hypnguyen1209/piseo-config.git
   cd piseo-config
   bash scripts/restore.sh
   ```

3. Hoàn tất thủ công:
   - Set `export NINE_ROUTER_KEY="<key>"` (xem [Bảo mật](#-bảo-mật)).
   - Mở `pi` — nó tự cài lại toàn bộ plugins `@pify/*` từ `pi/settings.json`.
   - Đăng nhập lại pi (auth) nếu cần.
   - Mở Paseo desktop — daemon tự sinh `daemon-keypair.json` mới.

## Cập nhật backup định kỳ

Chạy lại `bash scripts/backup.sh` + commit/push mỗi khi thay đổi config (thêm plugin, sửa models...). Script chỉ copy đè file có thay đổi nên an toàn để chạy nhiều lần.
