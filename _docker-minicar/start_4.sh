#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :4
/.novnc/utils/novnc_proxy --vnc localhost:5904 --listen 7784
