# Adding embedded/main.py as a service so it runs on startup

Go to the embedded/ folder and run 
`sudo ./servicesetup.sh <user>`
Make sure servicesetup.sh has full permissions (run `chmod +rxw servicesetup.sh`)
user is whatever the name is is in /home/user (assuming you installed AutoEye/ here - if you didnt, go into servicesetup.sh and change the ExecStart line to wherever main.py is)

If it worked, you should see something like this:

autoalert.service - Sensor tracking & communication code
     Loaded: loaded (/etc/systemd/system/autoalert.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2024-02-07 18:01:18 GMT; 415ms ago
   Main PID: 993 (python3)
      Tasks: 1 (limit: 414)
        CPU: 158ms
     CGroup: /system.slice/autoalert.service
             └─993 /usr/bin/python3 /home/embedded/AutoEye/embedded/main.py

check error.log for outputs, add print statements wherever needed, it should be sending to the MQTT broker automatically (if server is up)