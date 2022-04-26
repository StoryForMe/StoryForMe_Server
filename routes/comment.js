const app = require('../app');

exports.getEpisodeCommentNum = (esid, episodes, index, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + episodes[index]["id"] + " and esid=" + esid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log("getEpisodeCommentNum err");
			else callback(comments.length, episodes[index], index + 1);		// 다음 episode의 index를 넘겨줌.
		})
	})
}