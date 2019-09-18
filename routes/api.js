/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
// I used shortid for creating _id for replies
const shortid = require('shortid');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    const db = client.db('boards');

    app.route('/api/threads/:board')
      .get((req, res) => {
        const board = req.params.board;
        db.collection(board)
          .find()
          .limit(10)
          .sort({bumped_on: -1})
          .toArray((err, documents) => {
            for (let i = 0; i < documents.length; i++) {
              documents[i].replies.sort((a,b) => {
                return new Date(b.created_on) - new Date(a.created_on);
              })
              documents[i].replies = documents[i].replies.slice(0,3);
              delete documents[i].delete_password;
              delete documents[i].reported;
            }
            res.send(documents);
          });
      })
      .post((req, res) => {
        const board = req.params.board;
        const { text, delete_password } = req.body;
        db.collection(board).insertOne({
          text,
          delete_password,
          created_on: new Date(),
          bumped_on: new Date(),
          reported: false,
          replies: []
        }, (err, result) => {
          if (err) throw err;
          res.redirect(`/b/${board}`);
        });
      })
      .put((req, res) => {
        const board = req.params.board;
        const { thread_id } = req.body;
        db.collection(board).findOneAndUpdate(
          { _id: ObjectId(thread_id) },
          { $set: { reported: true } },
          (err, result) => {
            if (err) throw err;
            res.send('success');
        });
      })
      .delete((req, res) => {
        const board = req.params.board;
        const { thread_id, delete_password } = req.body;
        db.collection(board).findOneAndDelete(
          { _id: ObjectId(thread_id), delete_password: delete_password },
          (err, result) => {
            if (err) throw err;
            if (result.value === null) {
              return res.send('incorrect password');
            }
            res.send('deleted');
          }
        )
      })
    
    app.route('/api/replies/:board')
      .get((req, res) => {
        const board = req.params.board;
        const { thread_id } = req.query;
        // undefined if no thread_id provided
        if (thread_id !== undefined) {
          db.collection(board).findOne(
            {_id: ObjectId(thread_id)},
            (err, result) => {
              res.send(result);
            }
          )
        } else {
          return res.send({error: "no thread id provided"});
        }
      })
      .post((req, res) => {
        const board = req.params.board;
        const { thread_id, text, delete_password } = req.body;
        db.collection(board).findOneAndUpdate(
          { _id: ObjectId(thread_id) },
          {
            $addToSet: {
              replies: {
                _id: shortid.generate(),
                text,
                created_on: new Date(),
                delete_password,
                reported: false
              }
            }, $set: {
              bumped_on: new Date()
            }
          },
          (err, result) => {
            if (err) throw err;
            res.redirect(`/b/${board}/${thread_id}`);
          }
        )
      })
      .put((req, res) => {
        const board = req.params.board;
        const { thread_id, reply_id } = req.body;
        db.collection(board).findOneAndUpdate(
          { _id: ObjectId(thread_id), replies: { $elemMatch: { _id: reply_id } } },
          {
            $set: {
              "replies.$[elem].reported": true
            }
          },
          {
            // This is how to get the position in the replies array
            arrayFilters: [{ "elem._id": reply_id }]
          },
          (err, result) => {
            if (err) throw err;
            if (result.value == null) {
              return res.send('no id found');
            }
            res.send('success');
          }
        )
      })
      .delete((req, res) => {
        const board = req.params.board;
        const { thread_id, reply_id, delete_password } = req.body;
        db.collection(board).findOneAndUpdate(
          { _id: ObjectId(thread_id), replies: { $elemMatch: { _id: reply_id, delete_password: delete_password } } },
          {
            $set: {
              "replies.$[elem].text": '[deleted]'
            }
          },
          {
            arrayFilters: [{ "elem._id": reply_id }]
          },
          (err, result) => {
            if (err) throw err;
            if (result.value == null) {
              return res.send('incorrect password');
            }
            res.send('success');
          }
        )
      })
    
    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  });
};
