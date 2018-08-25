# janus
The doorkeeper


# Install

```
git clone https://github.com/nomadic-squirrel/janus.git
cd janus
npm install
```

# Configure
The `config.json` file houses all the configuration information as well as the current code store.

```json
{
  "lock_name": "Garage",
  "api_port": 9019,
  "api_username": "user",
  "api_password": "password",
  "lock": {
		"motorRed": 21,
		"motorBlack": 20,
		"sensorGreen": 26,
		"sensorBlue": 19,
		"door_side": "right"
  },
  "serial": {
     "port": "/dev/ttyAMA0",
     "baud": 115200
  },  
  "codes": {
    "clyde": "000000",
    "bonnie": "111111"
  },
  "state": "unlocked"
}
```


I think this might need to be done:
[https://raspberrypi.stackexchange.com/a/47851](https://raspberrypi.stackexchange.com/a/47851)

And this:

https://github.com/node-serialport/node-serialport/issues/1583#issuecomment-399946145

# Starting
Must be run as root! The `pigpio` library needs root access to the GPIO pins. 

# API



# Troubleshooting

## Troubleshooting the arduino

Using `minicom` you can connect directly to the serial port of the arduino to see what's up. 
```bash
minicom -o -D /dev/ttyAMA0 -b 19200
```





## Checking the output from the Arduino

