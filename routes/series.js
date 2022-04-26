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
			else if(!series) console.log("no exist series");
			else {
				var result = {
					title: series["title"],
					image: series["image"],
					introduction: series["introduction"],
					uid: series["uid"],
					zzimkkong: series["zzimkkong"],
					coin_num: series["coin_num"],
					coin_full_num: series["coin_full_num"],
					ad_days: series["ad_days"],
				}
				user.getNickname(series["uid"]).then((nickname) => {
					result["nickname"] = nickname;
					keyword.getSeriesKeyWord(req.params.id).then((keywords) => {
						result["keywords"] = keywords;
						episode.getEpisodeList(req.params.id).then((episodes) => {
							result["episodes"] = episodes;
							console.log(result);
							res.json(result);
						});
					});
				});
				
				
				
			}
	   })
	})
})

module.exports = router;