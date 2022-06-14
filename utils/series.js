const app = require('../app');
const user = require('./user');
const keyword = require('./keyword');
const episode = require('./episode');
const schedule = require('node-schedule');

// 정기적으로 조회 수 초기화 하는 코드
// const rule = new schedule.RecurrenceRule();
const job = schedule.scheduleJob('1 * * * *', function(){
  console.log("scheduling")
  app.getConnectionPool((conn) => {
    var sql = "update SERIES set hits_week=0, hits_month=0";
    conn.query(sql, function(err, results) {
      conn.release();
      if (err) {
        callback({
          error: "E007",
          error_message: "조회수 초기화 과정에서 error 발생"
        })
      };
    })
  })
});

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

sql_pre = [
	"select * ",
	"select *, zzimkkong_week + hits_week as week ",
	"select *, zzimkkong_month + hits_month as month ",
	"select *, zzimkkong + hits as total "
]
sql_post = [
	" order by recent_update",
	" order by week desc",
	" order by month desc",
	" order by total desc"
]

// 옵션에 따라 정렬기준을 다르게 함.
exports.get_series_list_sql = (option, kid) => {
	var sql; 
	if (kid == -1) sql = sql_pre[option] + "from SERIES" + sql_post[option];
	else sql = sql_pre[option] + "from SERIES as s join REPRESENT as r on s.id=r.sid where kid=" + kid + sql_post[option];
	return (sql);
}


exports.getSeriesData = (sid, callback) => {
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
								sid: series_list[0]["id"],
								title: series_list[0]["title"],
								image: series_list[0]["image"],
								introduction: series_list[0]["introduction"],
								writer: nickname,
								wid: series_list[0]["uid"],
								zzimkkong: series_list[0]["zzimkkong"],
								coin_num: series_list[0]["coin_num"],
								coin_full_num: series_list[0]["coin_full_num"],
								ad_days: series_list[0]["ad_days"],
								keywords: keywords,
								is_end: series_list[0]["is_end"],
								episodes: episodes
							}
							callback(result);
						});
					});
				});
			}
	   })
	})
}