#!/bin/sh
# Runs before the template is rendered. Fails with a clear message instead of an nginx syntax error.
set -e

if [ -z "${BACKEND_URL:-}" ]; then
    echo "$0: ERROR: BACKEND_URL is not set (e.g. https://warehouse-backend.onrender.com or http://backend:8080)" >&2
    exit 1
fi

case "$BACKEND_URL" in
    */)
        echo "$0: ERROR: BACKEND_URL must not end with a slash: $BACKEND_URL" >&2
        exit 1
        ;;
esac
