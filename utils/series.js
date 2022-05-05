const app = require('../app');

exports.getCharacter = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select fname, lname from SERIES where sid=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else callback(results[0]["fname"], results[0]["lname"]);
		})
	})
}

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