FROM nvidia/opengl:1.2-glvnd-runtime-ubuntu18.04
EXPOSE 5901
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

WORKDIR /home/user
RUN apt-get install -y git
RUN mkdir git
WORKDIR /home/user/git
RUN git clone --single-branch -b minicar-docker https://github.com/rubis-lab/Autoware_On_Embedded.git

RUN apt-key del 421C365BD9FF1F717815A3895523BAEEB01FA116
RUN apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654
RUN apt clean
RUN apt update
RUN sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
RUN apt install -y curl
RUN curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | apt-key add -
RUN apt update
RUN apt install -y ros-melodic-desktop-full
RUN echo "source /opt/ros/melodic/setup.bash" >> /home/user/.bashrc
RUN bash -c 'source /home/user/.bashrc'
RUN apt install -y python-rosdep python-rosinstall python-rosinstall-generator python-wstool build-essential python-rosdep
RUN rosdep init

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

WORKDIR /home/user/git/Autoware_On_Embedded/autoware.ai
RUN rosdep update
RUN rosdep install -y --from-paths src --ignore-src --rosdistro=melodic -r
RUN apt-get install libopencv3.2 -y
RUN bash -c 'source /home/user/.bashrc;\
             source /opt/ros/melodic/setup.bash;\
             colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release'

RUN apt-get install ros-melodic-ackermann-msgs ros-melodic-serial ros-melodic-can-msgs software-properties-common -y
RUN apt-add-repository ppa:astuff/kvaser-linux
RUN apt update
RUN apt install -y kvaser-canlib-dev kvaser-drivers-dkms
RUN apt install -y apt-transport-https
RUN sh -c 'echo "deb [trusted=yes] https://s3.amazonaws.com/autonomoustuff-repo/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/autonomoustuff-public.list'
RUN apt update
RUN apt install -y ros-melodic-kvaser-interface

WORKDIR /home/user/git/Autoware_On_Embedded/setup
USER user
RUN mkdir /home/user/Documents
RUN /home/user/git/Autoware_On_Embedded/setup/setup.sh user /home/user/git/Autoware_On_Embedded
USER root
RUN /home/user/git/Autoware_On_Embedded/setup/setup_bashrc.sh user
WORKDIR /home/user/git/Autoware_On_Embedded/rubis_ws/
SHELL ["/bin/bash", "-c"]
RUN source /home/user/.bashrc && source /opt/ros/melodic/setup.bash && source /home/user/git/Autoware_On_Embedded/autoware.ai/install/setup.bash && apt install -y ros-melodic-astuff-sensor-msgs && catkin_make
WORKDIR /home/user/

# ARG WDS_SOCKET_PORT=0
# ARG WDS_SOCKET_HOST=0.0.0.0

WORKDIR /.novnc
RUN wget -qO- https://github.com/novnc/noVNC/archive/v1.3.0.tar.gz | tar xz --strip 1 -C $PWD
RUN mkdir /.novnc/utils/websockify
RUN wget -qO- https://github.com/novnc/websockify/archive/v0.11.0.tar.gz | tar xz --strip 1 -C /.novnc/utils/websockify
RUN ln -s vnc.html index.html

# RUN apt-get install -y xauth

ENV NVIDIA_VISIBLE_DEVICES ${NVIDIA_VISIBLE_DEVICES:-all}
ENV NVIDIA_DRIVER_CAPABILITIES ${NVIDIA_DRIVER_CAPABILITIES:+$NVIDIA_DRIVER_CAPABILITIES,}graphics


RUN apt install -y mesa-utils libgl1-mesa-glx libgl1-mesa-dev libglu1-mesa libglu1-mesa-dev sshpass xterm bc nautilus dconf-editor
RUN apt update
RUN apt upgrade -y

WORKDIR /home/user/Desktop
USER root
RUN rm chromium-browser.desktop exo-terminal-emulator.desktop firefox-browser.desktop gedit.desktop

COPY start_2.sh /start.sh
RUN chmod a+rwx /start.sh

COPY scripts/change_const_look_ahead_distance.sh /home/user/Desktop/change_const_look_ahead_distance.sh
RUN chmod a+rwx /home/user/Desktop/change_const_look_ahead_distance.sh
COPY scripts/change_const_look_ahead_distance_2.sh /home/user/Documents/change_const_look_ahead_distance.sh
RUN chmod a+rwx /home/user/Documents/change_const_look_ahead_distance.sh

COPY scripts/change_error_threshold.sh /home/user/Desktop/change_error_threshold.sh
RUN chmod a+rwx /home/user/Desktop/change_error_threshold.sh
COPY scripts/change_error_threshold_2.sh /home/user/Documents/change_error_threshold.sh
RUN chmod a+rwx /home/user/Documents/change_error_threshold.sh

COPY scripts/change_max_iterations.sh /home/user/Desktop/change_max_iterations.sh
RUN chmod a+rwx /home/user/Desktop/change_max_iterations.sh
COPY scripts/change_max_iterations_2.sh /home/user/Documents/change_max_iterations.sh
RUN chmod a+rwx /home/user/Documents/change_max_iterations.sh

COPY scripts/change_minimum_look_ahead_distance.sh /home/user/Desktop/change_minimum_look_ahead_distance.sh
RUN chmod a+rwx /home/user/Desktop/change_minimum_look_ahead_distance.sh
COPY scripts/change_minimum_look_ahead_distance_2.sh /home/user/Documents/change_minimum_look_ahead_distance.sh
RUN chmod a+rwx /home/user/Documents/change_minimum_look_ahead_distance.sh

COPY scripts/change_steering_angle.sh /home/user/Desktop/change_steering_angle.sh
RUN chmod a+rwx /home/user/Desktop/change_steering_angle.sh
COPY scripts/change_steering_angle_2.sh /home/user/Documents/change_steering_angle.sh
RUN chmod a+rwx /home/user/Documents/change_steering_angle.sh

COPY scripts/change_velocity.sh /home/user/Desktop/change_velocity.sh
RUN chmod a+rwx /home/user/Desktop/change_velocity.sh
COPY scripts/change_velocity_2.sh /home/user/Documents/change_velocity.sh
RUN chmod a+rwx /home/user/Documents/change_velocity.sh

COPY scripts/start_autorunner.sh /home/user/Desktop/start_autorunner.sh
RUN chmod a+rwx /home/user/Desktop/start_autorunner.sh
COPY scripts/start_autorunner_2.sh /home/user/Documents/start_autorunner.sh
RUN chmod a+rwx /home/user/Documents/start_autorunner.sh

COPY scripts/start_control.sh /home/user/Desktop/start_control.sh
RUN chmod a+rwx /home/user/Desktop/start_control.sh
COPY scripts/start_control_2.sh /home/user/Documents/start_control.sh
RUN chmod a+rwx /home/user/Documents/start_control.sh

COPY scripts/start_RVIZ.sh /home/user/Desktop/start_RVIZ.sh
RUN chmod a+rwx /home/user/Desktop/start_RVIZ.sh

RUN rm /opt/ros/melodic/share/rviz/default.rviz
COPY default.rviz /opt/ros/melodic/share/rviz/default.rviz

USER user

RUN echo "gsettings set org.gnome.nautilus.preferences executable-text-activation 'launch'" >> /home/user/.bashrc
CMD ["sh","/start.sh"]