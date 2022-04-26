const app = require('../app');

exports.getNickname = (uid) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, nickname) {
			if(err) console.log("err");
			else return (nickname);
		})
		conn.release();
	})
}