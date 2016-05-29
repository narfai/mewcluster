#!/bin/bash

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
