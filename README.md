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

# API



# Troubleshooting

## Checking the output from the Arduino

