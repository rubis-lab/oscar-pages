#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :3
/.novnc/utils/novnc_proxy --vnc localhost:5903 --listen 7780
