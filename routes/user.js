var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');

router.get('/:id/character', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + req.params.id;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log("[USER] get character " + err);
      else if(!user) {
        console.log("no exist user.")
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

router.get('/:id/zzimkkong/writer', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select nickname, profile_image from USER as u join ZZIMKKONG_WRITER as z on u.id=z.wid where uid=" + req.params.id;
    conn.query(sql, function(err, writers) {
      conn.release();
      if(err) console.log("[USER] get zzimkkong writer " + err);
      else if(!writers) {
        console.log("no exist zzimkkong writers.")
      } else {
        result = {
          writers: writers
        }
        res.json(result);
      }
    })
  })
})

router.get('/:id/zzimkkong/series', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select sid, title, recent_update, hits, zzimkkong, episode_num from SERIES as s join ZZIMKKONG_SERIES as z on s.id=z.sid where z.uid=" + req.params.id;
    conn.query(sql, function(err, series) {
      conn.release();
      if(err) console.log("[USER] get zzimkkong series " + err);
      else if(!series) {
        console.log("no exist zzimkkong series.")
      } else {
        keyword.getSeriesKeyword(series["sid"], (keywords) => {
          console.log(series["title"] + " " + keywords);
          series["keywords"] = keywords;
          var result = {
            series: series
          }
          res.json(result);
        })
      }
    })
  })
})

router.get('/:login/:email', (req, res) => {
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

module.exports = router;