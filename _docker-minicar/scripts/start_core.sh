#!/bin/bash
xterm -hold -e "bash --rcfile <(echo '. ~/.bashrc; roscore')"