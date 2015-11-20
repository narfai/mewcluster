#!/bin/bash
set -e

if [ "$1" = 'redis-server' ]; then
	chown -R redis .
	exec gosu node server.js "$@"
fi

exec "$@"
