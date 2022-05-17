const app = require('../app');

// uid에 해당하는 유저의 닉네임을 가져옴.
exports.getNickname = (uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if(err) console.log(err);
			else callback(users[0]["nickname"]);
		})
	})
}

exports.getNicknameIter = (uid, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if(err) console.log(err);
			else callback(users[0]["nickname"], index);
		})
	})
}

exports.getIs_zzimkkong = (uid, sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from ZZIMKKONG_SERIES where uid=" + uid + " and sid=" + sid;
		conn.query(sql, function(err, zzimkkongs) {
			conn.release();
			if (err) console.log(err);
			else if(!zzimkkongs) callback(0);
			else callback(1);
		})
	})
}