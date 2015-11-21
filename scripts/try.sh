#!/bin/bash

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
    -p 8080:80 \
    -v /home/narfai/tuxdata/docker/nodecluster/app:/app \
    -v /home/narfai/tuxdata/docker/nodecluster/server:/server \
    azsystem/nodecluster:0.0.1 \
    /bin/bash
