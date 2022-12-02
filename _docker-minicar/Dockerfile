FROM ubuntu:18.04
EXPOSE 8080 5901
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Singapore

RUN apt-get update
RUN apt-get install -y xfce4 xfce4-terminal
RUN apt-get install -y novnc
RUN apt-get install -y tightvncserver websockify
RUN apt-get install -y wget net-tools curl chromium-browser firefox openssh-client git gedit vim
ENV USER root

RUN useradd -ms /bin/bash user
RUN mkdir /.novnc
RUN chown user:user /.novnc

COPY config /home/user
RUN chown -R user:user /home/user

WORKDIR /.novnc
RUN wget -qO- https://github.com/novnc/noVNC/archive/v1.0.0.tar.gz | tar xz --strip 1 -C $PWD
RUN mkdir /.novnc/utils/websockify
RUN wget -qO- https://github.com/novnc/websockify/archive/v0.6.1.tar.gz | tar xz --strip 1 -C /.novnc/utils/websockify
RUN ln -s vnc.html index.html

WORKDIR /home/user
RUN apt-get install -y git
RUN mkdir git
WORKDIR /home/user/git
RUN git clone https://github.com/rubis-lab/Autoware_On_Embedded.git

RUN sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
RUN apt install -y curl
RUN curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | apt-key add -
RUN apt update
RUN apt install -y ros-melodic-desktop-full
RUN echo "source /opt/ros/melodic/setup.bash" >> /home/user/.bashrc
RUN . /home/user/.bashrc
RUN apt install -y python-rosdep python-rosinstall python-rosinstall-generator python-wstool build-essential python-rosdep
RUN rosdep init
USER user
RUN rosdep update
USER root

RUN apt-get update
RUN apt install -y python-catkin-pkg python-rosdep ros-melodic-catkin
RUN apt install -y python3-pip python3-colcon-common-extensions python3-setuptools python3-vcstool
RUN pip3 install -U setuptools

WORKDIR /home/user/
RUN mkdir eigen
WORKDIR /home/user/eigen
RUN wget https://gitlab.com/libeigen/eigen/-/archive/3.3.7/eigen-3.3.7.tar.gz
RUN tar --strip-components=1 -xzvf eigen-3.3.7.tar.gz -C .
RUN mkdir build
WORKDIR /home/user/eigen/build
RUN cmake ..
RUN make
RUN make install
RUN rm /usr/lib/cmake/eigen3/*
RUN cp /usr/local/share/eigen3/cmake/* /usr/lib/cmake/eigen3

WORKDIR /home/user/git/Autoware_On_Embedded/autoware.ai
USER user
RUN rosdep update
WORKDIR /home/user/git/Autoware_On_Embedded/autoware.ai/src
# RUN rosdep install -y --from-paths . --ignore-src --rosdistro=melodic -r
# USER root
# RUN apt-get install libopencv3.2 -y
# RUN colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release

# RUN apt-get install ros-melodic-ackermann-msgs ros-melodic-serial ros-melodic-can-msgs software-properties-common -y
# RUN apt-add-repository ppa:astuff/kvaser-linux
# RUN apt update
# RUN apt install -y kvaser-canlib-dev kvaser-drivers-dkms
# RUN apt install -y apt-transport-https
# RUN sh -c 'echo "deb [trusted=yes] https://s3.amazonaws.com/autonomoustuff-repo/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/autonomoustuff-public.list'
# RUN apt update
# RUN apt install -y ros-melodic-kvaser-interface

# WORKDIR /home/user/git/Autoware_On_Embedded/rubis_ws/src

# WORKDIR /home/user/git/Autoware_On_Embedded/setup
# RUN /home/user/git/Autoware_On_Embedded/setup/setup.sh rubis ~/git/Autoware_On_Embedded
# WORKDIR /home/user/git/Autoware_On_Embedded/rubis_ws/
# RUN apt install -y python-catkin-tools