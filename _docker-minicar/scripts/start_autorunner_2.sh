#!/bin/bash

sshpass -p 4542rubis ssh -oStrictHostKeyChecking=no rubis@192.168.0.7 <<'END'
case $- in
    *i*) ;;
      *) return;;
esac
HISTCONTROL=ignoreboth
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000
shopt -s checkwinsize
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac
if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
source /opt/ros/melodic/setup.bash
export PATH=/usr/local/cuda-10.2/bin:/opt/ros/melodic/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
export LD_LIBRARY_PATH=/usr/local/cuda-10.2/lib:/opt/ros/melodic/lib
export USER_HOME=/home/rubis
source /home/rubis/git/Autoware_On_Embedded/rubis_ws/devel/setup.bash
source /home/rubis/git/Autoware_On_Embedded/autoware.ai/install/setup.bash
alias gb='gedit /home/rubis/.bashrc'
alias sb='source /home/rubis/.bashrc'
alias sa='source /home/rubis/git/Autoware_On_Embedded/autoware.ai/install/setup.bash'
alias sa='source /home/rubis/git/Autoware_On_Embedded/rubis_ws/devel/setup.bash'
alias lglaunch='cd /home/rubis/autoware.ai/autoware_files/lgsvl_file/launch/desktop'
export OPENBLAS_CORETYPE=ARMV8 python3
export ROS_HOSTNAME=192.168.0.7
export ROS_MASTER_URI=http://192.168.0.6:11313/

roslaunch rubis_autorunner minicar_lane_keeping.launch
END                             