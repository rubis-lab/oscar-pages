#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 grep -r 'wheel_base' /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 2.5 to 3.0)"
        read VALUE
        if [ `echo "$VALUE > 3.0" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 2.5" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 << END
                sed -i "21 i\    <arg name=\"wheel_base\" default=\"$VALUE\" />"  /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
                sed -i "22 d" /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
END
                break
        fi
done