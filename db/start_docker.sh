#!/bin/bash

echo "Trying to Start Docker env"

docker run -p 3306:3306 mysql
