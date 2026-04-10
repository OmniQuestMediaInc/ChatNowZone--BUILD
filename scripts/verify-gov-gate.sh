#!/usr/bin/env bash
#
# scripts/verify-gov-gate.sh
#
# Verify that a GOV gate has a valid, CEO-acknowledged clearance record
# in PROGRAM_CONTROL/CLEARANCES/. Intended to be run from the repo root
# (or anywhere — it resolves paths relative to the script location)
# before any directive whose GATE: line names the gate.
#
# Usage:
#   ./scripts/verify-gov-gate.sh <GATE_ID>
#
# Example:
#   ./scripts/verify-gov-gate.sh GOV-FINTRAC
#   ./scripts/verify-gov-gate.sh GOV-AGCO
#
# Exit codes:
#   0 — gate is CLEARED and CEO-acknowledged
#   1 — gate is NOT cleared, or no record exists, or record is malformed
#   2 — usage error
#
# Notes:
# - Reads the latest (lexicographically greatest) clearance file for
#   the gate id. Filenames are <GATE_ID>-YYYY-MM-DD.md so lex order
#   == date order.
# - Parses only the YAML frontmatter between the first two '---' lines.
# - This script is read-only. It never writes or modifies clearance
#   records.
# - AI coding agents MUST NOT modify clearance records in order to
#   make this script pass. See PROGRAM_CONTROL/CLEARANCES/README.md.

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <GATE_ID>" >&2
  echo "Example: $0 GOV-FINTRAC" >&2
  exit 2
fi

GATE_ID="$1"

# Resolve repo root relative to this script so it works from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CLEARANCE_DIR="${REPO_ROOT}/PROGRAM_CONTROL/CLEARANCES"

if [ ! -d "${CLEARANCE_DIR}" ]; then
  echo "FAIL — clearance directory not found: ${CLEARANCE_DIR}" >&2
  exit 1
fi

# Collect candidate clearance files for this gate id.
shopt -s nullglob
CANDIDATES=("${CLEARANCE_DIR}/${GATE_ID}"-*.md)
shopt -u nullglob

if [ "${#CANDIDATES[@]}" -eq 0 ]; then
  echo "FAIL — no clearance record for ${GATE_ID}" >&2
  echo "       expected: ${CLEARANCE_DIR}/${GATE_ID}-YYYY-MM-DD.md" >&2
  echo "       see PROGRAM_CONTROL/CLEARANCES/README.md for the signing contract" >&2
  exit 1
fi

# Pick the lexicographically latest record.
LATEST="$(printf '%s\n' "${CANDIDATES[@]}" | LC_ALL=C sort | tail -n 1)"

# Extract YAML frontmatter between the first two '---' lines.
FRONTMATTER="$(awk '
  /^---[[:space:]]*$/ { count++; next }
  count == 1         { print }
  count >= 2         { exit }
' "${LATEST}")"

if [ -z "${FRONTMATTER}" ]; then
  echo "FAIL — ${LATEST}: missing or empty YAML frontmatter" >&2
  exit 1
fi

# Read a scalar field from the frontmatter. Handles optional quotes
# and trailing '# comment'.
get_field() {
  local key="$1"
  printf '%s\n' "${FRONTMATTER}" | awk -v key="${key}" '
    {
      line = $0
      # Match "<key>:" with optional leading whitespace.
      if (match(line, "^[[:space:]]*" key ":")) {
        value = substr(line, RSTART + RLENGTH)
        # Strip leading whitespace.
        sub(/^[[:space:]]+/, "", value)
        # Strip trailing inline comment.
        sub(/[[:space:]]*#.*$/, "", value)
        # Strip trailing whitespace.
        sub(/[[:space:]]+$/, "", value)
        # Strip surrounding double quotes if present.
        if (value ~ /^".*"$/) {
          value = substr(value, 2, length(value) - 2)
        }
        print value
        exit
      }
    }
  '
}

FILE_GATE_ID="$(get_field gate_id)"
STATUS="$(get_field status)"
ACK="$(get_field ceo_acknowledgment)"

REL_PATH="${LATEST#${REPO_ROOT}/}"

if [ "${FILE_GATE_ID}" != "${GATE_ID}" ]; then
  echo "FAIL — ${REL_PATH}: gate_id is '${FILE_GATE_ID}', expected '${GATE_ID}'" >&2
  exit 1
fi

if [ "${STATUS}" != "CLEARED" ]; then
  echo "FAIL — ${REL_PATH}: status is '${STATUS}', expected 'CLEARED'" >&2
  exit 1
fi

if [ "${ACK}" != "SIGNED" ]; then
  echo "FAIL — ${REL_PATH}: ceo_acknowledgment is '${ACK}', expected 'SIGNED'" >&2
  exit 1
fi

echo "PASS — ${GATE_ID} cleared — evidence: ${REL_PATH}"
exit 0
