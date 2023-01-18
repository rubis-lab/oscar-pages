#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :2
/.novnc/utils/novnc_proxy --vnc localhost:5902 --listen 7780
