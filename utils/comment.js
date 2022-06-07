const app = require('../app');

// 에피소드 목록을 받아, 각각의 에피소드의 comment 개수를 가져옴.
exports.getEpisodeCommentNum = (eid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + eid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log(err);
			else callback(comments.length);		// 다음 episode의 index를 넘겨줌.
		})
	})
}

// 댓글 목록에서 작성자 이름을 하나씩 가져옴.
exports.getNameIter = (comments, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from USER where id=" + comments[index]["uid"];
		conn.query(sql, function(err, users) {
			conn.release();
			if (err) console.log(err);
			else callback(users[0]["nickname"], comments[index], index + 1);
		})
	})
}

exports.getName = (uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from USER where id=" + uid;
		conn.query(sql, function(err, users) {
			conn.release();
			if (err) console.log(err);
			else callback(users[0]["nickname"]);
		})
	})
}

exports.getCommentData = (cid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where id=" + cid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if (err) console.log(err);
			else {
				comment.getName(comments[0]["uid"], (name) => {
					callback({
						cid: comments[0]["id"],
						uid: comments[0]["uid"],
						cid: comments[0]["id"],
						name: name,
						content: comments[0]["content"],
						date: comments[0]["date"]
					})
				})
			}
		})
	})
}