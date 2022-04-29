var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');

router.get('/:login/:email', (req, res) => {
  console.log("user get login api");
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where login_method=" + req.params.login + " and email='" + req.params.email +"'";
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log("[USER] login " + err);
      else if(!user) {
        var result = {
          id: -1
        }
        res.json(result);
      } else {
        var result = {
          id: user["id"]
        }
        res.json(result);
      }
    })
  })
})

router.get('/:id', (req, res) => {
  console.log("user get api");
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + req.params.id;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log(err);
      else if(!user) {
        console.log("no exist user");
      } else {
        keyword.getUserKeyword(req.params.id, (keywords) => {
          var result = {
            nickname: user["nickname"],
            introduce: user["introduce"],
            profile_image: user["profile_image"],
            fname: user["fname"],
            lname: user["lname"],
            coin: user["coin"],
            keywords: keywords
          }
          res.json(result);
        })
      }
    })
  })
})

router.get('/character/:id', (req, res) => {
  console.log("user get character api");
  app.getConnectionPool((conn) => {
    var sql = "select fname, lname from USER where id=" + req.params.id;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log("[USER] get character " + err);
      else if(!user) {
        console.log("no exist user");
      } else {
        var result = {
          fname: user["fname"],
          lname: user["lname"]
        }
        res.json(result);
      }

    })
  })
})

module.exports = router;