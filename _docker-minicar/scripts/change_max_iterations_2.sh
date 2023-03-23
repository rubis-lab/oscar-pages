#!/bin/bash
echo "    ==================== Current value ===================="
sshpass -p 4542rubis ssh -T -oStrictHostKeyChecking=no rubis@192.168.0.7 grep -r 'max_iterations' /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch

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
                sshpass -p 4542rubis ssh -T -oStrictHostKeyChecking=no rubis@192.168.0.7 << END
                sed -i "43 i\    max_iterations: $VALUE}"  /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
                sed -i "44 d" /home/rubis/git/Autoware_On_Embedded/rubis_ws/src/rubis_autorunner/scripts/minicar_lane_keeping/_minicar_2_localization.launch
END
                break
        fi
done