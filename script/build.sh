#!/bin/bash
SCRIPT_DIR=$(dirname $(realpath $0))

echo "Image name and tag :"
read imagename

docker build -t $imagename -f $SCRIPT_DIR/../docker/Dockerfile $SCRIPT_DIR/..
