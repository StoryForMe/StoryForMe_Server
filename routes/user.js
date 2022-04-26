const app = require('../app');

exports.getNickname = (uid) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, nickname) {
			conn.release();
			if(err) console.log("getNickname err");
			else return (nickname);
		})
	})
}