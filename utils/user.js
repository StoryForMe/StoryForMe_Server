const app = require('../app');
const keyword = require('./keyword');

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

exports.getUser = (uid, callback)=> {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + uid;
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log(err);
      else {
        keyword.getUserKeyword(uid, (keywords) => {
          var result = {
            id: user["id"],    // id(우리 서버 기준)
            nickname: user["nickname"],
            profile_image: user["profile_image"],
            fname: user["fname"],
            lname: user["lname"],
            keywords: keywords,
            introduction: user["introduction"],
            is_default_name: user["is_default_name"]
          }
          callback(result);
        })
      }
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
			else if(zzimkkongs) callback(zzimkkongs.length);
		})
	})
}