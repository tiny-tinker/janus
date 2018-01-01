const winston    = require( 'winston' );
const nconf      = require( 'nconf' );
const express    = require( 'express' );
const bodyParser = require( 'body-parser' );


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

// Here is where we check on the current state of the lock
// via GPIO pins
nconf.set( 'state', 'unlocked' );


passport.use( new BasicStrategy(
   function( username, password, done ) {
 	if( username != nconf.get('username') || password != nconf.get('password') ) {
 		winston.info( 'Invalid password attempt!' );
 		return done( null, false );
 	}
 	return done( null, username );

  })
);



 
app.set( 'port', nconf.get('api_port') );


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use( require( './routes/index' ) );


var server = app.listen( app.get('port'), function() {
  winston.info( 'Janus listening on ' + app.get('port') );
});


module.exports = server

