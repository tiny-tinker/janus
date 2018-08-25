const express  = require( 'express' ); 
const winston  = require( 'winston' );
const passport = require( 'passport' );
const nconf    = require( 'nconf' );

var router   = express.Router();

router.all( '/api/*', passport.authenticate('basic', { session: false } ) );

////// LOCK /////// 
router.post( '/api/lock', (req, res) => {

   winston.info( "Received command to '" + req.body.action + "'" );

   var theLock = req.app.get( 'theLock' );
   nconf.set( 'state', theLock.getCurrentState() );


   res.status( 200 );

   // Check to see if it is in error state
   if( nconf.get( 'state' ) == "error" ) {
      winston.error( 'Lock is in error state, could not complete action' );
      res.status( 500 ).json( { "state": "error", "message": "Lock is in error state" })
   } 

   // Check to see if it is already (un)locked
   else if( (req.body.action + "ed") == nconf.get( 'state' ) ) {
      
      nconf.set( 'state', theLock.getCurrentState() );
      res.status(202).json( { "state": nconf.get( 'state' ) } );
   }

   // Otherwise, do the action
   else if( req.body.action == "lock" ) {
      theLock.lock();
      nconf.set( 'state', theLock.getCurrentState() );
      res.json( { "state": nconf.get( 'state' ) } );
   }
   else if( req.body.action == "unlock" ) {
      theLock.unlock();
      nconf.set( 'state', theLock.getCurrentState() );
      res.json( { "state": nconf.get( 'state' ) } );
   }

   // Say what now?
   else {
      res.status( 400 ).json( { "state": "error", "message": "Unknown action '" + req.body.action + "'" });
   }
 


});

router.get( '/api/state', (req, res) => {
   var theLock = req.app.get( 'theLock' );
   nconf.set( 'state', theLock.getCurrentState() );

   res.json( { "state": nconf.get( 'state' ) } );

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
