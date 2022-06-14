const app = require('../app');
const keyword = require('./keyword');

// uid에 해당하는 유저의 닉네임을 가져옴.
exports.getNickname = (res, uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else callback(users[0]["nickname"]);
		})
	})
}

exports.getPostedUser = (res, uid, callback)=> {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + uid;
    conn.query(sql, function(err, user) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else {
        keyword.getUserKeyword(uid, (keywords) => {
          var result = {
            id: user[0]["id"],    // id(우리 서버 기준)
            nickname: user[0]["nickname"],
            profile_image: user[0]["profile_image"],
            fname: user[0]["fname"],
            lname: user[0]["lname"],
            keywords: keywords,
          }
          callback(result);
        })
      }
    })
  })
}

exports.getPatchedUser = (res, uid, callback)=> {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where id=" + uid;
    conn.query(sql, function(err, user) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else {
        keyword.getUserKeyword(uid, (keywords) => {
          var result = {
            id: user[0]["id"],    // id(우리 서버 기준)
            nickname: user[0]["nickname"],
            profile_image: user[0]["profile_image"],
            fname: user[0]["fname"],
            lname: user[0]["lname"],
            keywords: keywords,
            introduction: user[0]["introduction"],
            is_default_name: user[0]["is_default_name"]
          }
          callback(result);
        })
      }
    })
  })
}

exports.getNicknameIter = (res, uid, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else callback(users[0]["nickname"], index);
		})
	})
}

exports.getIs_zzimkkong = (res, uid, sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from ZZIMKKONG_SERIES where uid=" + uid + " and sid=" + sid;
		conn.query(sql, function(err, zzimkkongs) {
			conn.release();
			if (err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else if(zzimkkongs) callback(zzimkkongs.length);
		})
	})
}

exports.getUserData = (res, uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if (err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else callback(users[0]);
		})
	})
}