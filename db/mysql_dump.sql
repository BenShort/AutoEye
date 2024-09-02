CREATE table UserDevices(
    `User` varchar(100) NOT NULL,
    `DeviceID` varchar(100) NOT NULL,
    `DeviceName` varchar(4096) NOT NULL,
    PRIMARY KEY (`User`,`DeviceID`)
) ENGINE=InnoDB;

CREATE table PushNotification(
    `User` varchar(100) NOT NULL,
    `Token` varchar(512) NOT NULL,
    PRIMARY KEY (`User`,`Token`)
) ENGINE=InnoDB;

CREATE table GPSData(
    `TimeStamp`   int NOT NULL,
    `DeviceID`    varchar(100) NOT NULL,
    `Data`   varchar(4096) NOT NULL,
    PRIMARY KEY (`TimeStamp`,`DeviceID`)
) ENGINE=InnoDB;

CREATE table TemperatureData(
    `TimeStamp`   int NOT NULL,
    `DeviceID`    varchar(100) NOT NULL,
    `Data`   varchar(4096) NOT NULL,
    PRIMARY KEY (`TimeStamp`,`DeviceID`)
) ENGINE=InnoDB;

CREATE table MovementData(
    `TimeStamp`   int NOT NULL,
    `DeviceID`    varchar(100) NOT NULL,
    `Data`   varchar(4096) NOT NULL,
    PRIMARY KEY (`TimeStamp`,`DeviceID`)
) ENGINE=InnoDB;

CREATE table AirQualityData(
    `TimeStamp`   int NOT NULL,
    `DeviceID`    char(100) NOT NULL,
    `Data`   varchar(4096) NOT NULL,
    PRIMARY KEY (`TimeStamp`,`DeviceID`)
) ENGINE=InnoDB;

CREATE table ParkState(
    `DeviceID`    varchar(100) NOT NULL,
    `State`        int NOT NULL,
    PRIMARY KEY (`DeviceID`)
) ENGINE=InnoDB;
