var request = require('request');
var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const user = require('../utils/user');
const series = require('../utils/series');

router.get('/login', (req, res) => {
  const options = {
    uri: 'https://kapi.kakao.com/v2/user/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${req.headers.access_token}`
    }
  }
  request(options, function(error, response, body) {
    if(error) {
      res.status(400).json({
        error: "E006",
        error_message: "kakao access token 정보 조회 중 문제 발생"
      })
    } else {
      app.getConnectionPool((conn) => {
      var sql = "select * from USER where kakao_id=" + JSON.parse(body).id;
      conn.query(sql, function(err, [user]) {
        conn.release();
        if(err) {
          res.status(400).json({
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
          console.log(user);
          var result = {
            id: user["id"]
          }
          res.json(result);
        }
      })
    })
  }
  })
})

router.get('/:id/character', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + req.params.id;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(!user) {
        res.status(400).json({
          error: "E001",
          error_message: "존재하지 않는 user"
        })
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
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(!writers) {
        res.status(400).json({
          error: "E001",
          error_message: "존재하지 않는 writer"
        })
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
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(!series_list) {
        res.status(400).json({
          error: "E001",
          error_message: "존재하지 않는 series"
        })
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
            keyword.getSeriesKeyword(res, series_list[index]["id"], getSeriesKeyWordCallback)
          }
          else res.json({ series_list: results })
        }
        keyword.getSeriesKeyword(res, series_list[0]["id"], getSeriesKeyWordCallback)
      }
    })
  })
})
        
router.get('/:id/series', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from SERIES where uid=" + req.params.id;
    conn.query(sql, function(err, seriesList) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
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
            keyword.getSeriesKeyword(res, seriesList[index]["id"], getSeriesKeywordIterCallback)
          }
          else res.json({ series_list: results }) 
        }
        keyword.getSeriesKeyword(res, seriesList[0]["id"], getSeriesKeywordIterCallback)
      }
    })
  })
})

router.get('/:id/read', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from `READ` where uid=" + req.params.id + "oerder by date desc";
    conn.query(sql, function(err, seriesList) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else {
        console.log(seriesList);

        var results = []
        var index = 0

        function getSeriesDataIterCallback(series_data) {
            results.push({
              sid: series_data["sid"],
              chapter: seriesList[index]["recent_episode"],
              image: series_data["image"],
              title: series_data["title"],
              writer: series_data["writer"],
              keywords: series_data["keywords"],
              is_zzimkkong: series_data["is_zzimkkong"]
            })
            if (index < seriesList.length - 1) {
              index++;
              series.getSeriesData(res, seriesList[index]["sid"], req.params.id, getSeriesDataIterCallback)
            }
            else res.json({ series_list: results }) 
        }
        series.getSeriesData(res, seriesList[0]["sid"], req.params.id, getSeriesDataIterCallback)
      }
    })
  })
})

router.get('/:id/keywords', (req, res) => {
  keyword.getUserKeyword(res, req.params.id, (keywords) => {
    var result = {
      keywords: keywords
    }
    res.json(result);
  })
})

router.get('/:id', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + req.params.id;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(!user) {
        res.json({ id: -1 })
      } else {
        keyword.getUserKeyword(res, req.params.id, (keywords) => {
          var result = {
            nickname: user["nickname"],
            introduction: user["introduction"],
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
  const options = {
    uri: 'https://kapi.kakao.com/v2/user/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${req.headers.access_token}`
    }
  }
  request(options, function(error, response, body) {
    if(error) {
      res.status(400).json({
        error: "E006",
        error_message: "kakao access token 정보 조회 중 문제 발생"
      })
    } else {
      console.log(JSON.parse(body))
      app.getConnectionPool((conn) => {
        var sql = "insert into USER SET ?";
        var values = {
          kakao_id: JSON.parse(body).id,
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
            keyword.updateUserKeyword(res, JSON.parse(body).id, null, () => { 
              user.getPostedUser(res, results.insertId, (user) => {
                res.json(user);
              })
            });
          }
          else {
            var kid_list = []
            function getKeywordIdCallback(kid, next_index) {
              kid_list.push(kid)
              if (next_index == req.body.keywords.length)
                keyword.postUserKeyword(res, results.insertId, kid_list, 0, postUserKeywordCallback);
              else
                keyword.getKeywordId(res, req.body.keywords, next_index, getKeywordIdCallback);
            }
            function postUserKeywordCallback(next_index) {
              if (next_index == kid_list.length){
                user.getPostedUser(res, results.insertId, (user) => {
                  res.json(user);
                })
              }
              else keyword.postUserKeyword(res, results.insertId, kid_list, next_index, postUserKeywordCallback);
            }
            keyword.getKeywordId(res, req.body.keywords, 0, getKeywordIdCallback);
          }
        })
      })
    }
  })
})

router.patch('/', (req, res) => {
  if (req.body.id == undefined) {
		res.status(400).json({ 
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
      if(err) {
        console.log("1 : " + err);
        res.status(400).json({ 
          error: "E002",
					error_message: "query 문법 오류"
        });
      }
      else if (results.affectedRows == 0) {
        res.status(400).json({ 
          error: "E001",
					error_message: "해당 유저가 존재하지 않음."
        });
      }
      else if (req.body.keywords == null || req.body.keywords.length == 0) {
        keyword.updateUserKeyword(res, req.body.id, null, () => { 
          user.getPatchedUser(res, req.body.id, (user) => {
            res.json(user);
          })
        });
      }
      else {
        var kid_list = []
        function getKeywordIdCallback(kid, next_index) {
          kid_list.push(kid)
          if (next_index == req.body.keywords.length) 
            keyword.updateUserKeyword(res, req.body.id, kid_list, postUserKeywordCallback);
          else
            keyword.getKeywordId(res, req.body.keywords, next_index, getKeywordIdCallback);
        }
        function postUserKeywordCallback(next_index) {
          if (next_index == kid_list.length) {
            user.getPatchedUser(res, req.body.id, (user) => {
              res.json(user);
            })
          }
          else keyword.postUserKeyword(res, req.body.id, kid_list, next_index, postUserKeywordCallback);
        }
        keyword.getKeywordId(res, req.body.keywords, 0, getKeywordIdCallback);
      }
    })
  })
})

router.delete('/:id', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "delete from USER where id=" + req.params.id;
    conn.query(sql, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if (results.affectedRows == 0) res.json({ result: 0 });
      else res.json({ result: 1 });
    })
  })
})

module.exports = router;