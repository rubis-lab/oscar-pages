#!/bin/bash

if [ "$vncpassword" = "" ]
then
    vncpassword="insecure"
fi

printf "$vncpassword\n$vncpassword\nn\n" | vncserver :6
/.novnc/utils/novnc_proxy --vnc localhost:5906 --listen 7786
