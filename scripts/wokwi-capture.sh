#!/usr/bin/env bash
# wokwi-capture.sh — compile + headlessly simulate every project under
# content/wokwi-projects/exp-*/ and write screenshot.png + serial.log to
# public/wokwi-captures/exp-N/.
#
# Author-time only; the static site never invokes this at build time.
# Operator runs `npm run wokwi:capture` (or this script directly) after
# editing any sketch or diagram. The committed captures are what the page
# renders.
#
# Requirements on PATH:
#   - arduino-cli         (compiles .ino to .hex/.elf)
#   - wokwi-cli           (headlessly runs the diagram + firmware on wokwi.com)
# Env:
#   - WOKWI_CLI_TOKEN     (required — get yours at https://wokwi.com/dashboard/ci)
#
# Per-project requirements (under content/wokwi-projects/exp-N-slug/):
#   - <project>.ino       (Arduino sketch — filename must match dir basename)
#   - diagram.json        (Wokwi parts + connections)
#   - wokwi.toml          (points firmware/elf into build/)
#   - meta.json           (optional: { "screenshotPart": "uno", "screenshotTimeMs": 2500, "timeoutMs": 5000 })

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECTS_DIR="$REPO_ROOT/content/wokwi-projects"
CAPTURES_DIR="$REPO_ROOT/public/wokwi-captures"
FQBN="${FQBN:-arduino:avr:uno}"

ONLY=""
for arg in "$@"; do
  case "$arg" in
    --only=*) ONLY="${arg#--only=}" ;;
    -h|--help)
      grep -E '^# ' "$0" | sed 's/^# //'
      exit 0
      ;;
  esac
done

command -v arduino-cli >/dev/null || { echo "ERROR: arduino-cli not on PATH"; exit 1; }
command -v wokwi-cli   >/dev/null || { echo "ERROR: wokwi-cli not on PATH"; exit 1; }
[[ -n "${WOKWI_CLI_TOKEN:-}" ]] || { echo "ERROR: WOKWI_CLI_TOKEN env var unset"; exit 1; }

PASS=0; FAIL=0; SKIP=0
FAILED=()

for proj_dir in "$PROJECTS_DIR"/exp-*; do
  [[ -d "$proj_dir" ]] || continue
  slug=$(basename "$proj_dir")
  num=$(echo "$slug" | grep -oE '^exp-[0-9]+' | cut -d- -f2)

  if [[ -n "$ONLY" && "$ONLY" != "$num" && "$ONLY" != "$slug" ]]; then
    continue
  fi

  echo
  echo "=== $slug (brief $num) ==="

  ino="$proj_dir/${slug}.ino"
  if [[ ! -f "$ino" ]]; then
    echo "  SKIP: missing $ino"
    SKIP=$((SKIP+1))
    continue
  fi
  if [[ ! -f "$proj_dir/diagram.json" ]]; then
    echo "  SKIP: missing diagram.json"
    SKIP=$((SKIP+1))
    continue
  fi

  # Per-project metadata defaults
  screenshot_part="uno"
  screenshot_time_ms=2500
  timeout_ms=5000
  if [[ -f "$proj_dir/meta.json" ]]; then
    screenshot_part=$(python3 -c "import json,sys; print(json.load(open('$proj_dir/meta.json')).get('screenshotPart','uno'))")
    screenshot_time_ms=$(python3 -c "import json,sys; print(json.load(open('$proj_dir/meta.json')).get('screenshotTimeMs',2500))")
    timeout_ms=$(python3 -c "import json,sys; print(json.load(open('$proj_dir/meta.json')).get('timeoutMs',5000))")
  fi

  # Compile
  echo "  [1/2] compile (fqbn=$FQBN)..."
  rm -rf "$proj_dir/build"
  if ! arduino-cli compile --fqbn "$FQBN" \
        --build-path "$proj_dir/build" \
        --output-dir "$proj_dir/build" \
        "$proj_dir" 2>&1 | tail -3; then
    echo "  FAIL: compile failed"
    FAIL=$((FAIL+1))
    FAILED+=("$slug (compile)")
    continue
  fi

  # Capture
  capture_dir="$CAPTURES_DIR/exp-$num"
  mkdir -p "$capture_dir"
  echo "  [2/2] simulate (timeout=${timeout_ms}ms, screenshot @ ${screenshot_time_ms}ms of part='$screenshot_part')..."
  # wokwi-cli exits 42 on timeout (expected for never-ending sketches like Blink);
  # we accept that as success when serial.log + screenshot.png both exist.
  set +e
  wokwi-cli \
    --timeout "$timeout_ms" \
    --serial-log-file "$capture_dir/serial.log" \
    --screenshot-file "$capture_dir/screenshot.png" \
    --screenshot-time "$screenshot_time_ms" \
    --screenshot-part "$screenshot_part" \
    --quiet \
    "$proj_dir" > "$capture_dir/run.log" 2>&1
  rc=$?
  set -e

  if [[ -f "$capture_dir/screenshot.png" && -f "$capture_dir/serial.log" && -s "$capture_dir/screenshot.png" ]]; then
    size=$(stat -c%s "$capture_dir/screenshot.png")
    lines=$(wc -l < "$capture_dir/serial.log")
    echo "  PASS: screenshot ${size}B, serial.log $lines lines (rc=$rc)"
    PASS=$((PASS+1))
  else
    echo "  FAIL: simulation did not produce artifacts (rc=$rc)"
    tail -5 "$capture_dir/run.log" 2>&1 | sed 's/^/    /'
    FAIL=$((FAIL+1))
    FAILED+=("$slug (sim)")
  fi
done

echo
echo "=== summary ==="
echo "  pass:    $PASS"
echo "  fail:    $FAIL"
echo "  skip:    $SKIP"
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "  failed:"
  for f in "${FAILED[@]}"; do echo "    - $f"; done
  exit 1
fi
