const app = require('../app');

// uid에 해당하는 유저의 닉네임을 가져옴.
exports.getNickname = (uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, [row]) {
			conn.release();
			if(err) console.log("getNickname err");
			else callback(row["nickname"]);
		})
	})
}