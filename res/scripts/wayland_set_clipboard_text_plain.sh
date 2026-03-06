#!/bin/sh
# Require wl-copy
command -v wl-copy >/dev/null 2>&1 || { echo "no wl-copy" >&1; exit 1; }
# Set clipboard text from file
wl-copy < "$1"