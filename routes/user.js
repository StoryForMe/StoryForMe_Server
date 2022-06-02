var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const series = require('../utils/series');
const user = require('../utils/user');

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
    var sql = "select * from USER where kakao_id=" + req.params.id;
    conn.query(sql, function(err, user) {
      conn.release();
      if(err) console.log("[USER] login " + err);
      else if(!user) {
        var result = {
          id: -1
        }
        res.json(result);
      } else {
        var result = {
          id: user[0]["id"]
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
            recent_update: seriesList[index]["recent_update"],
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

router.post('/', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "insert into USER SET ?";
    var values = {
      kakao_id: req.body.kakao_id,
      nickname: req.body.nickname,
      fname: req.body.fname,
      lname: req.body.lname,
      profile_image: req.body.profile_image
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) {
        if (err.code == 'ER_DUP_ENTRY') {
          res.json({ 
            error: "E003",
            error_message: "kakao id 중복"
          })
        }
      }
      else if (req.body.keywords.length == 0) res.json({ id: results.insertId })
      else {
        var kid_list = []
        function getKeywordIdCallback(kid, next_index) {
          kid_list.push(kid)
          if (next_index == req.body.keywords.length)
            keyword.postUserKeyword(results.insertId, kid_list, 0, postUserKeywordCallback);
          else
            keyword.getKeywordId(req.body.keywords, next_index, getKeywordIdCallback);
        }
        function postUserKeywordCallback(next_index) {
          if (next_index == kid_list.length) res.json({ id: results.insertId })
          else keyword.postUserKeyword(results.insertId, kid_list, next_index, postUserKeywordCallback);
        }
        keyword.getKeywordId(req.body.keywords, 0, getKeywordIdCallback);
      }
    })
  })
})

router.patch('/', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "update USER SET ? where id=" + req.body.id;
    var values = {
      nickname: req.body.nickname,
      profile_image: req.body.profile_image,
      fname: req.body.fname,
      lname: req.body.lname,
      introduction: req.body.introduction,
      is_default_name: req.body.is_default_name
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) console.log(err);
      else if (results.affectedRows == 0) res.json({ result: 0 });
      else if (req.body.keywords.length == 0)
        keyword.updateUserKeyword(req.body.id, null, () => { res.json({ result: 1 }) });
      else {
        var kid_list = []
        function getKeywordIdCallback(kid, next_index) {
          kid_list.push(kid)
          if (next_index == req.body.keywords.length) 
            keyword.updateUserKeyword(req.body.id, kid_list, postUserKeywordCallback);
          else
            keyword.getKeywordId(req.body.keywords, next_index, getKeywordIdCallback);
        }
        function postUserKeywordCallback(next_index) {
          if (next_index == kid_list.length) {
            user.getUser(req.params.id, (user) => {
              res.json(user);
            })
          }
          else keyword.postUserKeyword(req.body.id, kid_list, next_index, postUserKeywordCallback);
        }
        keyword.getKeywordId(req.body.keywords, 0, getKeywordIdCallback);
      }
    })
  })
})

router.delete('/:id', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "delete from SERIES where id=" + req.params.id;
    conn.query(sql, function(err, results) {
      conn.release();
      if(err) console.log(err);
      else if (results.affectedRows == 0) res.json({ result: 0 });
      else res.json({ result: 1 });
    })
  })
})

module.exports = router;