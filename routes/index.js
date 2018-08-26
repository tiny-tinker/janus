const express  = require( 'express' ); 
//const winston  = require( 'winston' );
const passport = require( 'passport' );
const nconf    = require( 'nconf' );

var router   = express.Router();

router.all( '/api/*', passport.authenticate('basic', { session: false } ) );


////// LOCK /////// 
router.post( '/api/lock', (req, res) => {
   var winston = req.app.get( 'winston' );

   winston.info( "Received command to '" + req.body.action + "'" );

   var theLock = req.app.get( 'theLock' );
   
   winston.debug( 'The Lock: "' +  JSON.stringify( theLock, null, 3 ) );


   res.status( 200 );

   var state = theLock.getCurrentState();
   winston.info( 'State: ' + state );

   

   // Check to see if it is in error state
   if( state == "error" ) {
      winston.error( 'Lock is in error state, could not complete action' );
      res.status( 500 ).json( { "result": "error", "message": "Lock is in error state" })
   } 

   // Check to see if it is already (un)locked
   else if( (req.body.action + "ed") == state ) {
      
      winston.debug( 'Already ' + req.body.action + "ed" );
      res.status(202).json( { "result": "No change" } );
   }

   // Otherwise, do the action
   else if( req.body.action == "lock" ) {
      theLock.lock();
      res.json( { "result": "OK" } );
   }
   else if( req.body.action == "unlock" ) {
      theLock.unlock();
      res.json( { "result": "OK" } );
   }

   // Say what now?
   else {
      res.status( 400 ).json( { "state": "error", "message": "Unknown action '" + req.body.action + "'" });
   }
 


});

router.get( '/api/state', (req, res) => {
   var winston = req.app.get( 'winston' );

   var theLock = req.app.get( 'theLock' );

   res.json( { "state": theLock.getCurrentState() } );

});

////// LOCK /////// 




////// CODES ////////
router.get( '/api/codes', (req, res) => {
   res.json( nconf.get( 'codes' ) );
});

router.get( '/api/codes/:name', (req, res) => {

   entry = nconf.get( 'codes' )[ req.params.name ];

   if( entry ) {
      res.json( entry );
   }
   else {
      res.status( 404 ).send(); 
   }

});


router.post( '/api/codes/:name', (req, res) => {

   var winston = req.app.get( 'winston' );

   var code = req.body.code;
   if( !code ) {
      code = getRandomCode();
   }


   var codes = nconf.get( 'codes' );

   codes[ req.params.name ] = code;
   nconf.set( 'codes', codes );


   var entry = {};
   entry[ req.params.name ] = code;

   res.status( 200 ).json( entry );

   winston.info( "Updated codes: " + JSON.stringify( nconf.get( 'codes' ) ) );
   nconf.save();

});


router.delete( '/api/codes/:name', (req,res) => {
   var winston = req.app.get( 'winston' );

   var codes = nconf.get( 'codes' );

   var entry = {};
   entry[ req.params.name ] = codes[ req.params.name ];

   delete codes[ req.params.name ];
   nconf.set( 'codes', codes );

   res.status( 200 ).json( entry );

   winston.info( "Updated codes: " + JSON.stringify( nconf.get( 'codes' ) ) );
   nconf.save();
   
});


function getRandomCode() {
   var code = "";
   for( i=0; i<5; i++ ) {
      code += String( Math.floor( Math.random() * 9 ) );	
   }
  return code;
}



////// CODES ////////
module.exports = router;
