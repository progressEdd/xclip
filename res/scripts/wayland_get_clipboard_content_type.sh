#!/bin/sh
command -v wl-paste >/dev/null 2>&1 || { echo "no wl-paste" >&1; exit 1; }
# List available MIME types
wl-paste --list-types