#!/bin/sh
set -eu

OPTIONS_PATH="/data/options.json"

if [ -f "$OPTIONS_PATH" ]; then
  ATLAS_INSTANCE_ID="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(String(options.atlas_instance_id || 'atlas-home-assistant'));" "$OPTIONS_PATH")"
  ATLAS_ADMIN_HOME_ASSISTANT_URL="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(String(options.home_assistant_url || ''));" "$OPTIONS_PATH")"
  ATLAS_ADMIN_HOME_ASSISTANT_TOKEN="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(String(options.home_assistant_token || ''));" "$OPTIONS_PATH")"
  ATLAS_ADMIN_REMEMBER_HOME_ASSISTANT_TOKEN="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.remember_home_assistant_token === true ? '1' : '0');" "$OPTIONS_PATH")"
  ATLAS_ADMIN_AUTO_CONNECT_EDITOR="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.auto_connect_editor === true ? '1' : '0');" "$OPTIONS_PATH")"
  ATLAS_ADMIN_EDITOR_START_MODE="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); const mode = options.editor_start_mode === 'expert' ? 'expert' : 'simple'; process.stdout.write(mode);" "$OPTIONS_PATH")"
  ATLAS_FILE_STUDIO_ALLOW_ADDONS="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.allow_addons_path === true ? '1' : '0');" "$OPTIONS_PATH")"
  ATLAS_FILE_STUDIO_ALLOW_WWW="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.allow_www_path === true ? '1' : '0');" "$OPTIONS_PATH")"
  ATLAS_FILE_STUDIO_ALLOW_CUSTOM_COMPONENTS="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.allow_custom_components_path === true ? '1' : '0');" "$OPTIONS_PATH")"
  ATLAS_FILE_STUDIO_ALLOW_PARENT_OF_CONFIG="$(node -e "const fs = require('node:fs'); const options = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(options.allow_parent_of_config_path === true ? '1' : '0');" "$OPTIONS_PATH")"
  export ATLAS_INSTANCE_ID
  export ATLAS_ADMIN_HOME_ASSISTANT_URL
  export ATLAS_ADMIN_HOME_ASSISTANT_TOKEN
  export ATLAS_ADMIN_REMEMBER_HOME_ASSISTANT_TOKEN
  export ATLAS_ADMIN_AUTO_CONNECT_EDITOR
  export ATLAS_ADMIN_EDITOR_START_MODE
  export ATLAS_FILE_STUDIO_ALLOW_ADDONS
  export ATLAS_FILE_STUDIO_ALLOW_WWW
  export ATLAS_FILE_STUDIO_ALLOW_CUSTOM_COMPONENTS
  export ATLAS_FILE_STUDIO_ALLOW_PARENT_OF_CONFIG
fi

export ATLAS_HOST="${ATLAS_HOST:-0.0.0.0}"
export ATLAS_APP_HOST="${ATLAS_APP_HOST:-0.0.0.0}"
export ATLAS_APP_PORT="${ATLAS_APP_PORT:-4176}"
export ATLAS_ADMIN_PORT="${ATLAS_ADMIN_PORT:-4175}"
export ATLAS_DEMO_PORT="${ATLAS_DEMO_PORT:-4174}"
export ATLAS_DISTRIBUTION_TARGET="${ATLAS_DISTRIBUTION_TARGET:-home-assistant-app-preview}"

exec node scripts/atlas-app-server.mjs
