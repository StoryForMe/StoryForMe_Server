const app = require('../app');

exports.getEpisodeCommentNum = (esid, eid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + eid + " and esid=" + esid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log("getEpisodeCommentNum err");
			else callback(comments.length);
		})
	})
}