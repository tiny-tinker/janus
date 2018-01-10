//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

USERNAME = "theuser";
PASSWORD = "thepassword";

process.env.USERNAME = USERNAME;
process.env.PASSWORD = PASSWORD;


//Require the dev-dependencies
let nconf    = require( 'nconf' );
let chai     = require( 'chai' );
let chaiHttp = require( 'chai-http' );
let app      = require( '../app' );
let should = chai.should();

chai.use( chaiHttp );


describe( 'Lock', () => {

   before( () => {
      //
      nconf.file( './test/test_config.json' );
   });

   after( () => {
      nconf.file( './config.json' );
      nconf.save();
   })

   /*
   * Test the GET state
   */
   describe('GET /api/state', () => {

      it( 'should require authentication', (done) => {
         chai.request( app )
             .get('/api/state')
             .end((err, res) => {
                 res.should.have.status( 401 );
               done();
             });
         
     });

     it( 'should require proper authentication', (done) => {
        chai.request( app )
            .get('/api/state')
            .auth( 'notauser', 'notapassword' )
            .end((err, res) => {
                res.should.have.status( 401 );
              done();
            });
         
     });

     it( 'should return the current lock state', (done) => {
        chai.request( app )
            .get( '/api/state' )
            .auth( USERNAME, PASSWORD )
            .end((err, res) => {
              
                res.should.have.status( 200 );
                res.body.should.have.property('state');
              done();
            });
     });
   });


   describe( 'POST /api/lock', () => {

      it( 'should not freak out if it unlocks the unlocked lock', (done) => {
         chai.request( app )
               .post( '/api/lock' )
               .set('content-type', 'application/json')
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
               .set('content-type', 'application/json')
               .auth( USERNAME, PASSWORD )
               .send( { "action": "lock" } )
               .end( (err, res) => {
                   res.should.have.status( 200 );
                   res.body.should.have.property('state');
                 done();
               });
         });


   });


   describe( 'GET /api/codes', () => {
      it( 'should retrieve the codes', (done) => {

         chai.request( app )
               .get( '/api/codes' )
               .auth( USERNAME, PASSWORD )
               .end( (err, res) => {

                console.log( 'res.body: ' + JSON.stringify( res.body ) );
                   res.should.have.status( 200 );
                   res.body.should.have.property( 'clyde',  '000000' );
                   res.body.should.have.property( 'bonnie', '111111' );
                 done();
               });

      } );


      it( "should retrieve clyde's code", (done) => {

         chai.request( app )
               .get( '/api/codes/clyde' )
               .auth( USERNAME, PASSWORD )
               .end( (err, res) => {
                   res.should.have.status( 200 );
                   res.body.should.have.property( 'clyde', '000000' )
                 done();
               });

      });


      it( "should update clyde's code", (done) => {

         chai.request( app )
               .post( '/api/codes/clyde' )
               .set('content-type', 'application/json')
               .auth( USERNAME, PASSWORD )
               .send( { "code": "333333" } )
               .end( (err, res) => {
                   res.should.have.status( 200 );
                   res.body.should.have.property( 'clyde', '333333' );
                 done();
               });

      });

      it( "should insert a new code", (done) => {

         chai.request( app )
               .post( '/api/codes/bobby' )
               .set('content-type', 'application/json')
               .auth( USERNAME, PASSWORD )
               .send( { "code": "88888" } )
               .end( (err, res) => {
                   res.should.have.status( 200 );
                   res.body.should.have.property( 'bobby', '88888' );
                 done();
               });

      });


      it( "should delete an existing code", (done) => {

         before( () => {
             chai.request( app )
               .post( '/api/codes/bobby' )
               .set('content-type', 'application/json')
               .auth( USERNAME, PASSWORD )
               .send( { "code": "88888" } )
               .end();

            chai.request( app )
               .delete( '/api/codes/bobby' )
               .auth( USERNAME, PASSWORD )
               .end( );

         });


         chai.request( app )
               .get( '/api/codes/bobby' )
               .auth( USERNAME, PASSWORD )
               .end( (err, res) => {
                   res.should.have.status( 404 );
                 done();
               });

      });




   });

    
});





