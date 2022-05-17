const app = require('../app');

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

// sid에 해당하는 시리즈에 속한 에피소드 개수
exports.getEpisodeNum = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select count(*) from EPISODE where sid=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(results[0]["count(*)"]); 
		})
	})
}

// 옵션에 따라 정렬기준을 다르게 함.
exports.get_series_list_sql = [
	"select * from SERIES order by recent_update",
	"select *, zzimkkong_week + hits_week as week from SERIES order by week",
	"select *, zzimkkong_month + hits_month as month from SERIES order by month",
	"select *, zzimkkong + hits as total from SERIES order by total"
]