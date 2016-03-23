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
docker run -t -i --rm \
   --name cluster_test \
   --link nodecluster-redis:redis \
    -p 8080:8080 \
    nodecluster:0.1
#    /bin/bash
#    -v "${SCRIPT_DIR}/server:/server" \
#   -v "${SCRIPT_DIR}/app:/app" \
