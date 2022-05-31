var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const series = require('../utils/series');

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

router.get('/:id/login', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where kakao_id='" + req.params.id;
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
    var sql = "select * from SERIES as s join ZZIMKKONG_SERIES as z on s.id=z.sid where z.uid=" + req.params.id;
    conn.query(sql, function(err, series_list) {
      conn.release();
      if(err) console.log("[USER] get zzimkkong series " + err);
      else if(!series) {
        console.log("no exist zzimkkong series.")
      } else {
        var results = []
        var index = 0

        function getSeriesKeyWordCallback(keywords) {
          results.push({
            title: series_list[index]["title"],
            keywords: keywords,
            recent_update: series_list[index]["recent_update"],
            hits: series_list[index]["hits"],
            zzimkkong: series_list[index]["zzimkkong"],
            episode_num: series_list[index]["episode_num"]
          })
          if (index < series_list.length - 1) {
            index++;
            keyword.getSeriesKeyword(series_list[index]["id"], getSeriesKeyWordCallback)
          }
          else res.json({ series_list: results })
        }
        keyword.getSeriesKeyword(series_list[0]["id"], getSeriesKeyWordCallback)
      }
    })
  })
})
        

router.get('/:id/series', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from SERIES where uid=" + req.params.id;
    conn.query(sql, function(err, seriesList) {
      conn.release();
      if(err) console.log(err);
      else {
        var results = []
        var index = 0

        function getSeriesKeywordIterCallback(keywords) {
          results.push({
            title: seriesList[index]["title"],
            keywords: keywords,
            recent_update: seriesList[index]["title"],
            hits: seriesList[index]["hits"],
            zzimkkong: seriesList[index]["zzimkkong"],
            episode_num: seriesList[index]["episode_num"]
          })
          if (index < seriesList.length - 1) {
            index++;
            keyword.getSeriesKeyword(seriesList[index]["id"], getSeriesKeywordIterCallback)
          }
          else res.json({ series_list: results }) 
        }
        keyword.getSeriesKeyword(seriesList[0]["id"], getSeriesKeywordIterCallback)
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