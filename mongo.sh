#!/bin/bash

sudo rm -rf ../remotelab_db
mkdir ../remotelab_db

docker stop remotelab_db && docker rm remotelab_db
docker run -d --name remotelab_db -p 27017:27017 -v /home/rubis/git/remotelab_db:/data/db \
                                                 -v /home/rubis/git/oscar-pages/mongod.conf:/etc/mongod.conf \
                                                 mongo