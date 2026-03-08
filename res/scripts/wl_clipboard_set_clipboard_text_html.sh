#!/bin/sh
command -v wl-copy >/dev/null 2>&1 || { echo "no wl-copy" >&2; exit 1; }
wl-copy --type text/html < "$1"