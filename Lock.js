// Lock

var Gpio = require('pigpio').Gpio;


var Lock = function( config )  {

    this.doorSide = config.door_side; // The side of the door the lock is on when viewing from the handle side, not the keypad side!


    // doorSide == "right"    
    this.motorLockPin     = config.motorRed;
    this.motorUnlockPin   = config.motorBlack;
    this.sensorInsidePin  = config.sensorBlue;
    this.sensorOutsidePin = config.sensorGreen;

    if( this.doorSide == "left" ) {

        this.motorLockPin     = config.motorBlack;
        this.motorUnlockPin   = config.motorRed;
        this.sensorInsidePin  = config.sensorGreen;
        this.sensorOutsidePin = config.sensorBlue;
    }


    this.motorLock    = new Gpio( this.motorLockPin,   { mode: Gpio.OUTPUT } );
    this.motorUnlock  = new Gpio( this.motorUnlockPin, { mode: Gpio.OUTPUT } );

    this.sensorInside = new Gpio( this.sensorInsidePin, {
                mode: Gpio.INPUT,
                edge: Gpio.EITHER_EDGE
    });
    
    this.sensorOutside = new Gpio( this.sensorOutsidePin, {
                   mode: Gpio.INPUT,
                   edge: Gpio.EITHER_EDGE
    });
    
    
    // Register an interrupt for when the sensor is "pressed"
    // The sensor opposite the handle is the one that gets "pressed"
    this.sensorOutside.on('interrupt', ( level ) => { 
       if( level ) {
          console.log( 'Hello? Outside level: ' + level );
          self.motorLock.digitalWrite( 0 );
       }
    });
    
    this.sensorInside.on('interrupt', ( level ) => { 
       if( level ) {
          console.log( 'Hello? Inside? level: ' + level );
          self.motorUnlock.digitalWrite( 0 );
       }
    });


    var self = this;

    

};

Lock.prototype.lock = function() {
    if( this.getCurrentState() != "error" )
       this.motorLock.digitalWrite( 1 );
};


Lock.prototype.unlock = function() {
    if( this.getCurrentState() != "error" )
        this.motorUnlock.digitalWrite( 1 );
};

Lock.prototype.getCurrentState = function() {

    if( this.sensorInside.digitalRead() ) 
      return "unlocked";
    if( this.sensorOutside.digitalRead() )
      return "locked";

    return "error";
};




module.exports = Lock;

