#!/bin/sh
command -v wl-paste >/dev/null 2>&1 || { echo "no wl-paste" >&1; exit 1; }
wl-paste --type text/html --no-newline