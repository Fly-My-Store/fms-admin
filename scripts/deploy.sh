#!/usr/bin/env bash
# git pull + npm install/build + pm2 restart for fms-admin (Next.js).
#
# aaPanel Git → Deploy Script:
#   export PATH=/www/server/nodejs/v20.19.5/bin:$PATH
#   cd /www/wwwroot/admin.flymystore.com/fms-admin && bash ./scripts/deploy.sh
#
# aaPanel already pulled:
#   bash ./scripts/deploy.sh --skip-pull
#
# Optional:
#   FMS_PM2_NAME=admin.flymystore.com
#   FMS_SKIP_PM2=1
#   FMS_SKIP_BUILD=1

set -euo pipefail

cd "$(dirname "$0")/.."

export PATH="/www/server/nodejs/v20.19.5/bin:${PATH:-/usr/bin}"

SKIP_PULL="${FMS_SKIP_PULL:-0}"
SKIP_PM2="${FMS_SKIP_PM2:-0}"
SKIP_BUILD="${FMS_SKIP_BUILD:-0}"
PM2_NAME="${FMS_PM2_NAME:-admin.flymystore.com}"

for arg in "$@"; do
  case "$arg" in
    --skip-pull) SKIP_PULL=1 ;;
    --skip-pm2) SKIP_PM2=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
  esac
done

log() { echo "[deploy-admin] $(date '+%H:%M:%S') $*"; }
die() { echo "[deploy-admin] ERROR: $*" >&2; exit 1; }

NEED_DEPLOY=0
BEFORE_SHA="$(git rev-parse HEAD 2>/dev/null || echo none)"

if [ "$SKIP_PULL" != "1" ]; then
  branch="$(git branch --show-current)"
  log "git pull origin $branch"
  export GIT_TERMINAL_PROMPT=0
  git pull --ff-only origin "$branch" || die "git pull failed"
else
  log "skip pull"
  NEED_DEPLOY=1
fi

AFTER_SHA="$(git rev-parse HEAD 2>/dev/null || echo none)"
if [ "$BEFORE_SHA" != "$AFTER_SHA" ]; then
  NEED_DEPLOY=1
  log "new commits: ${BEFORE_SHA:0:7} → ${AFTER_SHA:0:7}"
fi

if [ "$NEED_DEPLOY" != "1" ]; then
  log "no code changes — done"
  exit 0
fi

if git diff "${BEFORE_SHA}" "${AFTER_SHA}" --name-only 2>/dev/null | grep -qE '^package(-lock)?\.json$'; then
  log "npm install"
  npm install --omit=dev
elif [ "$SKIP_PULL" = "1" ] && git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -qE '^package(-lock)?\.json$'; then
  log "npm install"
  npm install --omit=dev
else
  log "no dependency changes (npm install skipped)"
fi

if [ "$SKIP_BUILD" = "1" ]; then
  log "skip next build"
else
  log "npm run build"
  npm run build
fi

if [ "$SKIP_PM2" = "1" ]; then
  log "skip pm2 restart"
elif ! command -v pm2 >/dev/null 2>&1; then
  log "WARN: pm2 not in PATH — restart from aaPanel"
elif ! pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  log "WARN: pm2 process '$PM2_NAME' not found — start: pm2 start npm --name $PM2_NAME -- start"
else
  log "pm2 restart $PM2_NAME"
  pm2 restart "$PM2_NAME" --update-env
  pm2 save >/dev/null 2>&1 || true
fi

log "done"
