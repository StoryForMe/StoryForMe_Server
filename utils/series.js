const app = require('../app');

exports.getEpisodeNum = async (sid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select count(*) from EPISODE where sid=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(results[0]["count(*)"]); 
		})
	})
}