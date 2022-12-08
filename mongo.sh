#!/bin/bash

sudo rm -rf ../oscar-db
mkdir ../oscar-db

docker stop oscar-db && docker rm oscar-db
docker run -d --name oscar-db -p 27017:27017 -v /home/rubis/git/oscar-db:/data/db \
                                             -v /home/rubis/git/oscar-pages/mongod.conf:/etc/mongod.conf \
                                             mongo