#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 grep -r 'const_velocity' /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 0 to 1)"
        read VALUE
        if [ `echo "$VALUE > 1" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 0" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 << END
                sed -i "11 i\    <arg name=\"const_velocity\"                value=\"$VALUE\"/>"  /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
                sed -i "12 d" /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
END
                break
        fi
done