#!/bin/sh
# Require wl-paste
command -v wl-paste >/dev/null 2>&1 || { echo "no wl-paste" >&2; exit 1; }
# Get clipboard text without trailing newline
wl-paste --no-newline