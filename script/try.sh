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

SCRIPT_DIR=$(dirname $(realpath $0))

# -t -i --rm : Tag / Interactive / Oneshot
# --name     : Name container
# --link     : Link redis
# -p         : Port mapping
# -v         : Link app volume
# -v         : Link server volume (dev only)
# Set image
# Exec bash


echo "Enter name of mewcluster image & tag"
read mewclusterimage

echo "Enter name of mewcluster container"
read mewclustercontainer

echo "Enter name of redis container"
read redisimage

echo "Enter the path of your application project"
read apppath
apppath="$(pwd)/$apppath"

echo "Run oneshot container with uid : ${UID}"

docker run -t -i --rm \
   --name $mewclustercontainer \
   --link $redisimage:redis \
   -v "$apppath:/app" \
   -e USER_UID=${UID} \
   -p 8080:8080 \
   $mewclusterimage
#chown -R nodecluster:nodecluster /server
#    /bin/bash
