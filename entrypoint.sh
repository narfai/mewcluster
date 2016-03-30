#!/bin/bash
set -e

if [ "$1" = 'load' ]; then
	chown -R nodecluster:nodecluster /server
	chown -R nodecluster:nodecluster /app
	gosu nodecluster npm rebuild
	exec gosu nodecluster node server.js "$@"
fi

exec "$@"
