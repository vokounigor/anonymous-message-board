/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('POST to /api/threads/general', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({text: "test text", delete_password: "1234"})
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(Object.keys(res.body), 0);
            done();
          });       
      });
    });
    
    suite('GET', function() {
      test('GET /api/threads/general', function(done) {
        chai.request(server)
          .get('/api/threads/general')
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'res.body should be an array of objects');
            res.body.forEach(item => {
              assert.property(item, '_id');
              assert.property(item, 'text');
              assert.property(item, 'created_on');
              assert.property(item, 'bumped_on');
              assert.property(item, 'replies');
              assert.isArray(item.replies, 'replies should be an array')
            })
          done();
          })
      })
    });
    
    suite('DELETE', function() {
      test('DELETE a thread', function(done){
        // Since I've already deleted the thread, the response will be 'incorrect password'
        chai.request(server)
          .delete('/api/threads/general')
          .send({thread_id: '5d8222ed00b1ce12f8deb40f', delete_password: '2'})
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          })        
      })
    });
    
    suite('PUT', function() {
      test('PUT to /api/threads/general', function(done){
        chai.request(server)
          .put('/api/threads/test')
          .send({thread_id: '5d823dc4cf09d80665063c3f'})
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          })   
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('POST a reply', function(done){
      chai.request(server)
        .post('/api/replies/test')
        .send({text: 'test text', delete_password: '1234', thread_id: '5d823dc4cf09d80665063c3f'})
        .end((err,res) => {
          assert.equal(res.status, 200);
          assert.equal(Object.keys(res.body), 0);
          done();
        })     
      })
    });
    
    suite('GET', function() {
      test('GET a reply', function(done){
      chai.request(server)
        .get('/api/replies/test')
        .query({thread_id: '5d823dc4cf09d80665063c3f'})
        .end((err,res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'text');
          assert.property(res.body, 'delete_password');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          res.body.replies.forEach(item => {
            assert.property(item, '_id');
            assert.property(item, 'text');
            assert.property(item, 'created_on');
            assert.property(item, 'delete_password');
            assert.property(item, 'reported');
          });
          done();
        })       
      })
    });
    
    suite('PUT', function() {
      test('PUT on a reply', function(done) {
      chai.request(server)
        .put('/api/replies/test')
        .send({thread_id: '5d823dc4cf09d80665063c3f', reply_id: 'Des70vvl'})
        .end((err,res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })      
      })
    });
    
    suite('DELETE', function() {
      test('DELETE a reply', function(done){
      chai.request(server)
        .delete('/api/replies/test')
        .send({thread_id: '5d823dc4cf09d80665063c3f', reply_id: 'Des70vvl', delete_password: '1234'})
        .end((err,res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })        
      })
    });
    
  });

});
