var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('./keyword');
const user = require('./user');
const episode = require('./episode');

router.get('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from SERIES where id=" + req.params.id;
		conn.query(sql, function(err, series) {
			if(err) console.log("err");
			else if(!series) console.log("no exist series");
			else {
				var _nickname;
				var sql = "select nickname from USER where id=" + series.uid;
				conn.query(sql, function(err, nickname) {
					conn.release();
					if(err) console.log("getNickname err");
					else _nickname = nickname;
				})

				var _keywords;
				var sql = "select content from KEYWORD as k join REPRESENT as r on k.id=r.kid where sid=" + req.params.id;
				conn.query(sql, function(err, keywords) {
					conn.release();
					if(err) console.log("getSeriesKeyWord err");
					else _keywords = keywords;
				})
				
				var _episodes;
				var sql = "select * from EPISODE where sid=" + req.params.id;
				conn.query(sql, function(err, episodes) {
					conn.release();
					if(err) console.log("getEpisodeList err");
					else {
						var result = [];
						for(var episode of episodes) {
							result.push({
								title: episode.title,
								state: episode.state,
								comment_num: comment.getEpisodeCommentNum(sid, episode.id),
								date: episode.date,
								image: episode.image,
								hits: episode.hits
							})
						}
						_episodes = result;
					}
				})

				var result = {
					title: series.title,
					image: series.image,
					introduction: series.introduction,
					writer: _nickname,
					uid: series.uid,
					zzimkkong: series.zzimkkong,
					coin_num: series.coin_num,
					coin_full_num: series.coin_full_num,
					ad_days: series.ad_days,
					keywords: _keywords,
					episodes: _episodes
				}
				res.json(result);
			}
	   })
	   conn.release();
	})
})

module.exports = router;