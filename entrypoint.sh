#!/bin/bash
set -e

if [ "$1" = 'load' ]; then
	exec gosu nodecluster node server.js "$@"
fi

exec "$@"
