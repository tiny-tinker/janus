const winston    = require( 'winston' );
const nconf      = require( 'nconf' );
const express    = require( 'express' );
const http       = require( 'http' );
const SerialPort = require( 'serialport' );
const Lock       = require( './Lock' );

const app = express();

const passport      = require( 'passport' );
const BasicStrategy = require( 'passport-http' ).BasicStrategy;


winston.add( new winston.transports.File({ filename: __dirname + '/logs/main.log' } ) );


if( process.env.NODE_ENV !== "test" ) {
   winston.add( new winston.transports.Console() );
}


if( process.env.DEBUG ) {
  winston.level = 'debug';
  winston.debug( 'Debug enabled' );
}

// Load config from cmd line, ENV, then finally config.json
//codes='[{"name":"travis", "code":"1234"}]'
nconf.argv( { parseValues: true } )
     .env(  { parseValues: true, lowerCase: true } )
     .file( 'config.json' );

var theLock = new Lock( nconf.get( 'lock' ) );

winston.info( 'Got Lock. Status: ' + theLock.getCurrentState() );

// Here is where we check on the current state of the lock
// via GPIO pins
nconf.set( 'state', theLock.getCurrentState() );

passport.use( new BasicStrategy(
   function( username, password, done ) {
 	if( username != nconf.get('api_username') || password != nconf.get('api_password') ) {
 		winston.info( 'Invalid password attempt for user " ' + username + '"!' );
 		return done( null, false );
 	}
 	return done( null, username );

  })
);



 
app.set( 'port', nconf.get('api_port') );

app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );

app.use( require( './routes/index' ) );

app.set( 'theLock', theLock );

var serialPort = new SerialPort( nconf.get( 'serial:port' ), { 
   baudRate: nconf.get( 'serial:baud' )
});


var codeEntry = "";
var firstEntry = false;

// Switches the port into "flowing mode"
serialPort.on('data', processSerialPortData );


http.createServer( app ).listen( app.get('port'), function() {
  winston.info( 'Janus listening on ' + app.get('port') );
});





verifyCode = function( code ) {
    var codes = nconf.get( 'codes' );

	for( c in codes ) {
		if( codes[c] == code )
			return true;
	}
	return false;

}



function processSerialPortData( data ) {
  console.log( 'Received: ' + data );

  firstEntry = !firstEntry;

  char = data.toString().replace( '\r\n', '' );


  // The keypad sends the code twice for some reason, so we
  // skip it. 
  if( !firstEntry ) {
    //console.log( 'Skipping' );
    return;
  }

  if( char == "K" ) {
    if( codeEntry.length == 0 ) {
      // Attempt to lock the lock
      winston.debug( 'Locking!' );
      codeEntry = "";
      theLock.lock();
    }
    else {
      // Then we should try to match the code 
      winston.debug( 'Attempting to match "' + codeEntry + '"' );
      if( verifyCode( codeEntry ) ) {
         winston.debug( '   Match!' );
         theLock.unlock();
      } 
      else {
         winston.debug( '   No match :(' );
      }
      codeEntry = "";

    }
  }

  else if( char == "E" ) {
    codeEntry = "";
    winston.debug( 'Clearing!' );
  }
  else {
     // Otherwise we append 
     codeEntry += char;
  }
  winston.debug('Data: "' + char + '" "' + codeEntry + '" ' + codeEntry.length );
}


