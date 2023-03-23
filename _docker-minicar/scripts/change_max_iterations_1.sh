#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 grep -r 'max_iterations' /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch

while [ 1 -gt 0 ]
do
        echo "Enter a new value (range: 15 to 30)"
        read VALUE
        if [ `echo "$VALUE > 30" | bc` -eq 1 ]
        then
                echo "Too big value"
        elif [ `echo "$VALUE < 15" | bc` -eq 1 ]
        then
                echo "Too small value"
        else
                sshpass -p nvidia ssh -oStrictHostKeyChecking=no nvidia@192.168.0.8 << END
                sed -i "43 i\    max_iterations: $VALUE}"  /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
                sed -i "44 d" /home/nvidia/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
END
                break
        fi
done