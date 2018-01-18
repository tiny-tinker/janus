const winston    = require( 'winston' );
const nconf      = require( 'nconf' );
const express    = require( 'express' );
const bodyParser = require( 'body-parser' );
const SerialPort = require( 'serialport' );
const Lock       = require( './Lock' );

const app = express();

const passport      = require( 'passport' );
const BasicStrategy = require( 'passport-http' ).BasicStrategy;


winston.add( new winston.transports.File({ filename: __dirname + '/logs/main.log' } ) );


if( process.env.NODE_ENV !== "test" ) {
   winston.add( new winston.transports.Console() );
}


// Load config from cmd line, ENV, then finally config.json
//codes='[{"name":"travis", "code":"0987"}]'
nconf.argv( { parseValues: true } )
     .env(  { parseValues: true, lowerCase: true } )
     .file( 'config.json' );

var theLock = new Lock( nconf.get( 'lock' ) );


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

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

app.use( require( './routes/index' ) );


app.use( function( req, res, next) {
	req.theLock = theLock;
})


var serialPort = new SerialPort( nconf.get( 'serial:port' ), { 
   baudRate: nconf.get( 'serial:baud' )
});


var codeEntry = "";
var firstEntry = false;

// Switches the port into "flowing mode"
serialPort.on('data', processSerialPortData );




var server = app.listen( app.get('port'), function() {
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
  firstEntry = !firstEntry;

  char = data.toString().replace( '\r\n', '' );


  if( !firstEntry ) {
    //console.log( 'Skipping' );
    return;
  }

  if( char == "K" ) {
    if( codeEntry.length == 0 ) {
      // Attempt to lock the lock
      console.log( 'Locking!' );
      codeEntry = "";
      theLock.lock();
    }
    else {
      // Then we should try to match the code 
      console.log( 'Attempting to match "' + codeEntry + '"' );
      if( verifyCode( codeEntry ) ) {
         console.log( '   Match!' );
         theLock.unlock();
      } 
      else {
         console.log( '   No match :(' );
      }
      codeEntry = "";

    }
  }

  else if( char == "E" ) {
    codeEntry = "";
    console.log( 'Clearing!' );
  }
  else {
     // Otherwise we append 
     codeEntry += char;
  }
  console.log('Data: "' + char + '" "' + codeEntry + '" ' + codeEntry.length );
}





module.exports = server

