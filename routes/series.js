var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const user = require('../utils/user');
const episode = require('../utils/episode');
const series = require('../utils/series');

router.get('/list/:option/:uid', (req, res) => {
	app.getConnectionPool((conn) => {
		conn.query(series.get_series_list_sql[req.params.option], function(err, series_list) {
			conn.release();
			if(err) console.log("err");
			else if(!series_list) {
				console.log("no exist series"); 
				res.json({ 
					error: "E001",
					error_message: "시리즈가 존재하지 않습니다."
				})
			}
			else {
				results = [];
				// 각각의 시리즈에 대해 필요한 정보들을 가져와서 results에 추가해줌.
				function getNicknameIterCallback(nickname, index) {
					user.getIs_zzimkkong(req.params.uid, series_list[index]["id"], (is_zzimkkong) => {
						keyword.getSeriesKeyword(series_list[index]["id"], (keywords) => {
							results.push({
								id: series_list[index]["id"],
								title: series_list[index]["title"],
								writer: nickname,
								uid: series_list[index]["uid"],
								image: series_list["image"],
								keywords: keywords,
								hits: series_list[index]["hits"],
								zzimkkong: series_list[index]["zzimkkong"],
								episode_num: series_list[index]["episode_num"],
								is_zzimkkong: is_zzimkkong,
								is_end: series_list[index]["is_end"],
								recent_update: series_list[index]["recent_update"]
							});
							if (index < series_list.length - 1)
								user.getNicknameIter(series_list[index + 1]["uid"], index + 1, getNicknameIterCallback)
							else res.json( {series_list: results });
						});
					});
				}
				user.getNicknameIter(series_list[0]["uid"], 0, getNicknameIterCallback)
			}
	   })
	})
})

router.get('/:id', (req, res) => {
	series.getSeriesData(req.params.id, (series_data) => res.json(series_data));
})

router.post('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into SERIES SET ?";
		var values = {
			title: req.body.title,
			image: req.body.image,
			recent_update: new Date(),
			hits: 0,
			hits_week: 0,
			hits_month: 0,
			introduction: req.body.introduction,
			zzimkkong: 0,
			zzimkkong_week: 0,
			zzimkkong_month: 0,
			is_end: 0,
			ad_days: 0,
			coin_num: 0,
			coin_full_num: 0,
			episode_num: 0,
			uid: req.body.uid,
			fname: req.body.fname,
			lname: req.body.lname
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (req.body.keywords.length == 0) res.json({ sid: results.insertId })
			else {
				var kid_list = []
				function getKeywordIdCallback(kid, next_index) {
					kid_list.push(kid)
					if (next_index == req.body.keywords.length) 
						keyword.postSeriesKeyword(results.insertId, kid_list, 0, postSeriesKeywordCallback);
					else 
						keyword.getKeywordId(req.body.keywords, next_index, getKeywordIdCallback);
				}
				function postSeriesKeywordCallback(next_index) {
					if (next_index == kid_list.length) res.json({ sid: results.insertId })
					else keyword.postSeriesKeyword(results.insertId, kid_list, next_index, postSeriesKeywordCallback);
				}
				keyword.getKeywordId(req.body.keywords, 0, getKeywordIdCallback);
			}
		})
	})
})

router.patch('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "update SERIES SET ? where id=" + req.body.id;
		var values = {};
		console.log(req.body);
		for(var key in req.body) {
			if (key != "id" && key != "keywords") {
				values[key] = req.body[key]
			}
		}
		// var values = {
		// 	title: req.body.title,
		// 	introduction: req.body.introduction,
		// 	image: req.body.image,
		// 	fname: req.body.fname,
		// 	lname: req.body.lname
		// }
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else if (req.body.keywords == null || req.body.keywords.length == 0)
				keyword.updateSeriesKeyword(req.body.id, null, () => { 
					series.getSeriesData(req.params.id, (series_data) => res.json(series_data)); 
				})
			else {
				var kid_list = []
				function getKeywordIdCallback(kid, next_index) {
					kid_list.push(kid)
					if (next_index == req.body.keywords.length) 
						keyword.updateSeriesKeyword(req.body.id, kid_list, postSeriesKeywordCallback);
					else 
						keyword.getKeywordId(req.body.keywords, next_index, getKeywordIdCallback);
				}
				function postSeriesKeywordCallback(next_index) {
					if (next_index == kid_list.length) 
						series.getSeriesData(req.params.id, (series_data) => res.json(series_data));
					else keyword.postSeriesKeyword(req.body.id, kid_list, next_index, postSeriesKeywordCallback);
				}
				keyword.getKeywordId(req.body.keywords, 0, getKeywordIdCallback);
			}
		})
	})
})

router.put('/end', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "update SERIES SET is_end=" + req.body.is_end + " where id=" + req.body.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 }); 
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