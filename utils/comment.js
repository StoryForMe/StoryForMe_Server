const app = require('../app');

// 에피소드 목록을 받아, 각각의 에피소드의 comment 개수를 가져옴.
exports.getEpisodeCommentNum = (esid, episodes, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + episodes[index]["id"] + " and esid=" + esid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log("getEpisodeCommentNum err");
			else callback(comments.length, episodes[index], index + 1);		// 다음 episode의 index를 넘겨줌.
		})
	})
}

// 댓글 작성자 이름 가져옴.
exports.getName = (comments, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from USER where id=" + comments[index]["uid"];
		conn.query(sql, function(err, users) {
			conn.release();
			if (err) console.log(err);
			else callback(users[0]["nickname"], comments[index], index + 1);
		})
	})
}