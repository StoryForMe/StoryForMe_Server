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
					keyword.getSeriesKeyword(req.params.id, (keywords) => {
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
			else {
				var kid_list = []
				function getKeywordIdCallback(kid, next_index) {
					kid_list.push(kid)
					if (next_index == req.body.keywords)
						keyword.postSeriesKeyword(results.insertId, kid_list, 0, postSeriesKeywordCallback);
					else 
						keyword.getKeywordId(req.body.keywords, next_index, getKeywordIdCallback);
				}
				function postSeriesKeywordCallback(next_index) {
					if (next_index == kid_list.length) {
						res.json({
							sid: results.insertId
						})
					}
					else keyword.postSeriesKeyword(sid, kid_list, next_index, postSeriesKeywordCallback);
				}
				keyword.getKeywordId(req.body.keyword, 0, getKeywordIdCallback);
			}
		})
	})
})

module.exports = router;