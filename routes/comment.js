const app = require('../app');

exports.getEpisodeCommentNum = (esid, eid) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + eid + " and esid=" + esid;
		conn.query(sql, function(err, comments) {
			if(err) console.log("getEpisodeCommentNum err");
			else return (comments.length);
		})
		conn.release();
	})
}