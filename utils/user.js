const app = require('../app');

// uid에 해당하는 유저의 닉네임을 가져옴.
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

// uid에 해당하는 유저가 zzimkkong한 작가를 가져옴.
exports.getZzimkkongWriter = (uid, callback) => {
  return app.getConnectionPool((conn) => {
    var sql = "select nickname, profile_image from USER as u join ZZIMKKONG_WRITER as z on u.id=z.wid where uid=" + uid;
    conn.query(sql, function(err, rows) {
      conn.release();
      if(err) console.log("getZzimkkongWriter " + err);
      else {
        var writers = [];
				for (var row of rows) {
					writers.push(row["nickname", "profile_image"]);
				}
				callback(writers);
      }
    })
  })
}