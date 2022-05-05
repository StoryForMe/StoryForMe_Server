const app = require('../app');

exports.getEpisodeNum = async (sid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select count(*) from EPISODE where sid=" + sid;
		conn.query(sql, function(err, episode_num) {
			conn.release();
			if(err) console.log(err);
			else { callback(episode_num); }
		})
	})
}