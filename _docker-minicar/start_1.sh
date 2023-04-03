#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

echo "export DISPLAY=:0" >> ~/.bashrc
# echo "export ROS_MASTER_URI=http://192.168.0.8:11311/" >> ~/.bashrc
# echo "export ROS_HOSTNAME=127.0.0.1" >> ~/.bashrc

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :1
/.novnc/utils/novnc_proxy --vnc localhost:5901 --listen 7781
