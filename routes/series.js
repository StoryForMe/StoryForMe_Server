var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('./keyword');
const user = require('./user');
const episode = require('./episode');

router.get('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from SERIES where id=" + req.params.id;
		conn.query(sql, function(err, [series]) {
			conn.release();
			if(err) console.log("err");
			else if(!series) {console.log("no exist series"); res.json({validation: 0});}
			else {
				user.getNickname(series["uid"], (nickname) => {
					keyword.getSeriesKeyWord(req.params.id, (keywords) => {
						episode.getEpisodeList(req.params.id, (episodes) => {
							var result = {
								title: series["title"],
								image: series["image"],
								introduction: series["introduction"],
								writer: nickname,
								uid: series["uid"],
								zzimkkong: series["zzimkkong"],
								coin_num: series["coin_num"],
								coin_full_num: series["coin_full_num"],
								ad_days: series["ad_days"],
								keywords: keywords,
								episodes: episodes
							}
							res.json(result);
						});
					});
				});
			}
	   })
	})
})

router.get('/:id/:login', (req, res) => {
	console.log("이지원 바보");
})

router.post('/', (req, res) => {
	console.log("post series");
	app.getConnectionPool((conn) => {
		var sql = "insert into SERIES SET ?";
		conn.query(sql, req.body, function(err, results, fields) {
			conn.release();
			if(err) console.log(err);
			else
			{
				console.log(results);
				console.log(fields);
				res.json({
					sid: results.insertId
				})
			}
		})
	})
})

module.exports = router;