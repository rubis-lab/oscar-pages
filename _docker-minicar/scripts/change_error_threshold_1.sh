#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p nvidia ssh -T -oStrictHostKeyChecking=no nvidia@192.168.0.8 grep -r 'error_threshold' /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 0.7 to 1.2)"
        read VALUE
        if [ `echo "$VALUE > 1.2" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 0.7" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p nvidia ssh -T -oStrictHostKeyChecking=no nvidia@192.168.0.8 << END
                sed -i "39 i\    error_threshold: $VALUE,"  /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
                sed -i "40 d" /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
END
                break
        fi
done
