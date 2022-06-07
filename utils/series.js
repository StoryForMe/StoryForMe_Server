const app = require('../app');
const user = require('../utils/user');
const keyword = require('../utils/keyword');
const episode = require('../utils/episode');

// sid에 해당하는 시리즈의 주인공이름
exports.getCharacter = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select fname, lname from SERIES where id=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else callback(results[0]["fname"], results[0]["lname"]);
		})
	})
}

exports.updateHits = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "update SERIES set hits=hits+1, hits_month=hits_month+1, hits_week=hits_week+1 where id=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else callback(1);
		})
	})
}

exports.updateEpisodeNum = (sid, num, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "update SERIES set episode_num=episode_num + (" + num + ") where id=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else callback(1);
		})
	})
}

exports.updateZzimkkongNum = (sid, callback) => {
  app.getConnectionPool((conn) => {
    var sql = "update SERIES SET zzimkkong=zzimkkong+1, zzimkkong_month=zzimkkong_month+1, zzimkkong_week=zzimkkong_week+1 where id=" + sid;
    conn.query(sql, function(err, results) {
      conn.release();
      if (err) console.log(err);
      else callback(1)
    })
  })
}

exports.deleteZzimkkongNum = (sid, callback) => {
  app.getConnectionPool((conn) => {
    var sql = "update SERIES SET zzimkkong=zzimkkong-1, zzimkkong_month=zzimkkong_month-1, zzimkkong_week=zzimkkong_week-1 where id=" + sid;
    conn.query(sql, function(err, results) {
      conn.release();
      if (err) console.log(err);
      else callback(1)
    })
  })
}

// 옵션에 따라 정렬기준을 다르게 함.
exports.get_series_list_sql = [
	"select * from SERIES order by recent_update",
	"select *, zzimkkong_week + hits_week as week from SERIES order by week desc",
	"select *, zzimkkong_month + hits_month as month from SERIES order by month desc",
	"select *, zzimkkong + hits as total from SERIES order by total desc"
]

exports.getSeriesData = (sid) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from SERIES where id=" + sid;
		conn.query(sql, function(err, series_list) {
			conn.release();
			if(err) console.log(err);
			else if(series_list.length == 0) {
				console.log("no exist series"); 
				return({ 
					error: "E001",
					error_message: "존재하지 않는 시리즈입니다."
				})
			}
			else {
				user.getNickname(series_list[0]["uid"], (nickname) => {
					keyword.getSeriesKeyword(sid, (keywords) => {
						episode.getEpisodeList(sid, (episodes) => {
							var result = {
								title: series_list[0]["title"],
								image: series_list[0]["image"],
								introduction: series_list[0]["introduction"],
								writer: nickname,
								uid: series_list[0]["uid"],
								zzimkkong: series_list[0]["zzimkkong"],
								coin_num: series_list[0]["coin_num"],
								coin_full_num: series_list[0]["coin_full_num"],
								ad_days: series_list[0]["ad_days"],
								keywords: keywords,
								is_end: series_list[0]["is_end"],
								episodes: episodes
							}
							return (result);
						});
					});
				});
			}
	   })
	})
}