#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p 4542rubis ssh -T -oStrictHostKeyChecking=no rubis@192.168.0.7 grep -r 'const_lookahead_distance' /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 3.0 to 5.0)"
        read VALUE
        if [ `echo "$VALUE > 5" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 3" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p 4542rubis ssh -T -oStrictHostKeyChecking=no rubis@192.168.0.7 << END
                sed -i "12 i\    <arg name=\"const_lookahead_distance\"      value=\"$VALUE\"/>"  /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
                sed -i "13 d" /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_4_control.launch
END
                break
        fi
done