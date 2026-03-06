#!/bin/sh
command -v wl-copy >/dev/null 2>&1 || { echo "no wl-copy" >&1; exit 1; }
wl-copy --type image/png < "$1"