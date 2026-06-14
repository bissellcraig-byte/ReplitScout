#!/bin/bash
set -e

# Scout Content Studio is a static HTML/CSS/JS site with no dependencies
# and no build step (server.js uses only Node built-ins). Nothing to install
# or compile after a merge. This script exists so post-merge setup succeeds.

echo "Post-merge setup: static site, no install or build required."
