# About Remotelab

Homepage: https://rubis-lab.github.io/oscar-pages/


## Docker for Server

### Start db & server
```shell
cd ~/git/oscar-pages/
./mongo.sh
docker exec -it remotelab_db mongosh
use remotelab
(ctrl+pq)
./run.sh
```

## Docker for Minicar

### How to build image

```shell
cd ~/git/oscar-pages/_docker-minicar
docker build -t minicar-image .
# docker build --no-cache -t minicar-image .
```

### How to start docker

```shell
docker run -d -p 7782:7780 -p 11312:11311 -e vncpassword=vnchost1 --name vnchost1 minicar-image
docker run -d -p 7783:7780 -p 11313:11311 -e vncpassword=vnchost2 --name vnchost2 minicar-image --link remotelab_db
docker run -d -p 7784:7780 -p 11314:11311 -e vncpassword=vnchost3 --name vnchost3 minicar-image
docker run -d -p 7785:7780 -p 11315:11311 -e vncpassword=vnchost4 --name vnchost4 minicar-image
```

### How to go into docker

```shell
docker exec -u 0 -it vnchost1 bash
```

### How to delete docker

```shell
docker stop vnchost2 && docker rm vnchost2
```

## Port fowarding info

build.3rinnovation.com > remotelab.snu.ac.kr:17780 > 192.168.0.6:7780 > remotelab:80
build.3rinnovation.com/vnc1-4 > remotelab.snu.ac.kr:17782-5 > 192.168.0.6:7782-5 > vnchost1-4:7780 > vncserver:5901
build.3rinnovation.com/video > remotelab.snu.ac.kr:17786 > 192.168.0.3:80 
minicar 1-4 > 192.168.0.6:11312-5 > vnchost1-4:11311

## for DEBUG VNC

[http://remotelab.snu.ac.kr:17783](http://remotelab.snu.ac.kr:17783)

[https://build.3rinnovation.com/vnc2/index.html?resize=remote&path=vnc2/websockify](https://build.3rinnovation.com/vnc2/index.html?resize=remote&path=vnc2/websockify)

[https://rubis-lab.github.io/oscar-pages/monitor](https://rubis-lab.github.io/oscar-pages/monitor)