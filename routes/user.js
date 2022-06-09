var request = require('request');
var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const series = require('../utils/series');
const user = require('../utils/user');

router.get('/login', (req, res) => {
  const options = {
    uri: 'https://kapi.kakao.com/v2/user/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${req.headers.access_token}`
    }
  }
  request(options, function(error, response, body) {
    app.getConnectionPool((conn) => {
      if(error) {
        res.json({
          error: "E006",
          error_message: "kakao access token 정보 조회 중 문제 발생"
        })
      }
      else {
        if(body) {
          console.log(body);
          console.log(body.id);
        }
        var sql = "select * from USER where kakao_id=" + body["id"];
        console.log(sql);
        conn.query(sql, function(err, user) {
          conn.release();
          if(err) {
            res.json({
              error: "E002",
              error_message: "query 문법 오류"
            })
          }
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
      }
    })
  })
})

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
            sid: seriesList[index]["id"],
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
        res.json({ id: -1 })
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
      else if (req.body.keywords.length == 0) {
        keyword.updateUserKeyword(req.body.id, null, () => { 
          user.getPostedUser(results.insertId, (user) => {
            res.json(user);
          })
        });
      }
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
          if (next_index == kid_list.length){
            user.getPostedUser(results.insertId, (user) => {
              res.json(user);
            })
          }
          else keyword.postUserKeyword(results.insertId, kid_list, next_index, postUserKeywordCallback);
        }
        keyword.getKeywordId(req.body.keywords, 0, getKeywordIdCallback);
      }
    })
  })
})

router.patch('/', (req, res) => {
  if (req.body.id == undefined) {
		res.json({ 
			error: "E005",
			error_message: "수정할 유저의 id 정보가 누락됨."
		})
	}
  app.getConnectionPool((conn) => {
    var sql = "update USER SET ? where id=" + req.body.id;
    var values = {};
		for(var key in req.body) {
			if (key != "id" && key != "keywords") values[key] = req.body[key]
		}
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) console.log(err);
      else if (results.affectedRows == 0) {
        res.json({ 
          error: "E001",
					error_message: "해당 유저가 존재하지 않음."
        });
      }
      else if (req.body.keywords == null || req.body.keywords.length == 0) {
        keyword.updateUserKeyword(req.body.id, null, () => { 
          user.getPatchedUser(req.body.id, (user) => {
            res.json(user);
          })
        });
      }
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
            user.getPatchedUser(req.body.id, (user) => {
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