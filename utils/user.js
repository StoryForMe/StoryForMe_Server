const app = require('../app');

exports.getNickname = (uid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, [row]) {
			conn.release();
			if(err) console.log("getNickname err");
			else callback(row["nickname"]);
		})
	})
}