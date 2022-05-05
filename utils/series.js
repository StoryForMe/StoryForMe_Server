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