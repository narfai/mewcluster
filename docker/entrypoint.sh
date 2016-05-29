#!/bin/bash

#Copyright 2016 François Cadeillan

#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at

#    http://www.apache.org/licenses/LICENSE-2.0

#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.
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
