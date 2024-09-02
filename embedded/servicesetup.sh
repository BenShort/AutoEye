cat << EOF > /etc/systemd/system/autoalert.service
[Unit]
Description=Sensor tracking & communication code
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/$1/AutoEye/embedded/main.py
User=root
Group=root
Type=simple

[Install]
WantedBy=multi-user.target
EOF

cd soft_uart/
sudo apt-get install raspberrypi-kernel-headers
make
sudo make install
sudo insmod soft_uart.ko

sudo systemctl daemon-reload
sudo systemctl enable autoalert.service
sudo systemctl start autoalert.service
cd ..
sudo systemctl status autoalert.service
