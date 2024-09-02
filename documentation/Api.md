# API Routes for the backend
## UserDevices:

### List
`/UserDevices/List?User=$UserID$`

Type: GET Request  
Return UserDevicesList associated with that UserID  
Expected Status Code: 200 

### Add
`/UserDevices/Add?User=$UserID$&DeviceID=$DeviceID$`

Type: PUT Request  
Links UserDevice with that UserID in database  
Expected Status Code: 201 

## GPS:
`/GPS/GetLatestData?DeviceID=$DeviceID$`

Type: GET Request  
Return GPSData associated with that DeviceID  
Expected Status Code: 200 

## Temperature:

### Latest Data
`/Temperature/GetLatestData?DeviceID=$DeviceID$`

Type: GET Request  
Return Temperature associated with that DeviceID  
Expected Status Code: 200

### Historical Data
`/Temperature/GetHistoricalData?DeviceID=$DeviceID$&StartTime=$StartTime$&EndTime=$EndTime$`

Type: GET Request  
Return Temperature associated with that DeviceID for a given range (in Unix time)  
Expected Status Code: 200 

## AirQuality:
`/Movement/GetLatestData?DeviceID=$DeviceID$`

Type: GET Request  
Return AirQuality Data associated with that DeviceID  
Expected Status Code: 200 

## Notifications:
`/Notifications/AddToken?User=$UserID$&Token=$TokenID$`

Type: PUT Request  
Adds the tokenID of a user to database  
Expected Status Code: 201 

## ParkState:

### Get
`/ParkState/Get?DeviceID=$DeviceID$`

Type: GET Request  
Return the park state of the device 
Expected Status Code: 200 

### Modify
`/ParkState/Modify?DeviceID=$DeviceID$`

Type: PUT Request  
Modify the park state of the device  
Expected Status Code: 201 
