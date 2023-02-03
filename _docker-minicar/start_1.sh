#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :1
/.novnc/utils/novnc_proxy --vnc localhost:5901 --listen 7781
