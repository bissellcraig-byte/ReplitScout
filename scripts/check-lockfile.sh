#!/bin/bash
# Guard against the Netlify deploy-breaking lockfile bug.
#
# When `npm install` runs inside Replit, npm bakes the internal Replit firewall
# registry host (package-firewall.replit.local) into every "resolved" tarball URL
# in package-lock.json. Netlify's build servers cannot reach that host, so
# `npm ci` fails at the "Install dependencies" step and production freezes on an
# old deploy.
#
# Usage:
#   bash scripts/check-lockfile.sh        # fail loudly if the bad host is present
#   bash scripts/check-lockfile.sh --fix  # rewrite the bad host to the public npm registry

set -e

LOCKFILE="package-lock.json"
BAD_HOST="http://package-firewall.replit.local/npm/"
GOOD_HOST="https://registry.npmjs.org/"
PATTERN="replit.local"

if [ ! -f "$LOCKFILE" ]; then
  echo "check-lockfile: $LOCKFILE not found — nothing to check."
  exit 0
fi

if ! grep -q "$PATTERN" "$LOCKFILE"; then
  echo "check-lockfile: OK — no '$PATTERN' URLs in $LOCKFILE."
  exit 0
fi

if [ "$1" == "--fix" ]; then
  sed -i "s#${BAD_HOST}#${GOOD_HOST}#g" "$LOCKFILE"
  if grep -q "$PATTERN" "$LOCKFILE"; then
    echo "check-lockfile: ERROR — '$PATTERN' still present after --fix. Inspect $LOCKFILE manually." >&2
    exit 1
  fi
  echo "check-lockfile: fixed — rewrote '$BAD_HOST' to '$GOOD_HOST' in $LOCKFILE."
  echo "check-lockfile: commit the updated $LOCKFILE before pushing."
  exit 0
fi

echo "check-lockfile: ERROR — $LOCKFILE contains '$PATTERN' (Replit-only registry host)." >&2
echo "" >&2
echo "  This WILL break Netlify deploys at the 'Install dependencies' step." >&2
echo "  Netlify cannot reach $BAD_HOST." >&2
echo "" >&2
echo "  Fix it before pushing:" >&2
echo "    npm run fix:lockfile" >&2
echo "" >&2
exit 1
