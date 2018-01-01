//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

USERNAME = "theuser";
PASSWORD = "thepassword";

process.env.USERNAME = USERNAME;
process.env.PASSWORD = PASSWORD;


//Require the dev-dependencies
let chai     = require('chai');
let chaiHttp = require('chai-http');
let app      = require('../app');
let should = chai.should();

chai.use( chaiHttp );


describe( 'Lock', () => {

   /*
   * Test the /GET route
   */
   describe('GET /api/state', () => {

      it( 'should require authentication', (done) => {
         chai.request( app )
             .get('/api/state')
             .end((err, res) => {
                 res.should.have.status(401);
               done();
             });
         
     });

     it( 'should require proper authentication', (done) => {
        chai.request( app )
            .get('/api/state')
            .auth( 'notauser', 'notapassword' )
            .end((err, res) => {
                res.should.have.status(401);
              done();
            });
         
     });

     it( 'should return the current lock state', (done) => {
        chai.request( app )
            .get( '/api/state' )
            .auth( USERNAME, PASSWORD )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('state');
              done();
            });
     });
   });


   describe( 'POST /api/lock', () => {

      it( 'should not freak out if it unlocks the unlocked lock', (done) => {
         chai.request( app )
               .post( '/api/lock' )
               .auth( USERNAME, PASSWORD )
               .send( { "action": "unlock" } )
               .end( (err, res) => {
                   res.should.have.status( 202 );
                   res.body.should.have.property('state');
                 done();
               });
         });


      it( 'should lock the lock', (done) => {
         chai.request( app )
               .post( '/api/lock' )
               .auth( USERNAME, PASSWORD )
               .send( { "action": "lock" } )
               .end( (err, res) => {
                   res.should.have.status( 200 );
                   res.body.should.have.property('state');
                 done();
               });
         });


   });



    
});