#!/bin/bash

tag=$1

if [ -n $tag ]; then
	tag="dev"
fi

sudo git pull origin master
sudo docker stop remotelab && docker rm remotelab
sudo docker build -t remotelab:$tag ./_docker-node
sudo docker run -d --name remotelab -p 7780:80 --link remotelab_db \
	-v /home/rubis/remotelab:/home/node \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-v /usr/bin/docker:/usr/bin/docker \
	-v /rubis-registry/docker/registry/v2/repositories:/docker-registry/repositories \
	--restart unless-stopped remotelab:$tag
#sudo docker logs -f remotelab
