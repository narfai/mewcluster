#!/bin/bash

SCRIPT_DIR=$(dirname $(realpath $0))
#TODO allow to select an application path
# -t -i --rm : Tag / Interactive / Oneshot
# --name     : Name container
# --link     : Link redis
# -p         : Port mapping
# -v         : Link app volume
# -v         : Link server volume (dev only)
# Set image
# Exec bash
docker run -t -i --rm \
   --name cluster_test \
   --link redis_test:redis \
    -p 8080:8080 \
    -v "${SCRIPT_DIR}/app:/app" \
    -v "${SCRIPT_DIR}/server:/server" \
    azsystem/nodecluster:0.1.0 \
    /bin/bash
