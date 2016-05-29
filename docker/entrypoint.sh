#!/bin/bash
set -e

ret=true
getent passwd nodecluster && ret=false
if $ret; then
	useradd -r -m --uid ${USER_UID} nodecluster
fi
npm rebuild
chown nodecluster -R /app
chown nodecluster -R /server


if [ "$1" = 'load' ]; then
	echo "$@"
	# mkdir -p /server/logs
	# chown -R nodecluster:nodecluster /server
	# chown -R nodecluster:nodecluster /app
	# chmod 774 -R /server
	# chmod 774 -R /app
	# gosu nodecluster npm rebuild
	#exec gosu nodecluster
	# Add cluster user
	exec gosu nodecluster node server.js "$@"
else
	echo "exec $@"
	exec "$@"
fi
