#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 grep -r 'minimum_lookahead_distance' /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 0.9 to 1.3)"
        read VALUE
        if [ `echo "$VALUE > 1.3" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 0.9" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 << END
                sed -i "10 i\    <arg name=\"minimum_lookahead_distance\"      value=\"$VALUE\"/>"  /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
                sed -i "11 d" /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
END
                break
        fi
done