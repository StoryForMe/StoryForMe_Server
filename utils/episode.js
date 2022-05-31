const app = require('../app');
const comment = require('./comment');

// sid에 해당하는 시리즈의 에피소드 정보 목록을 가져옴.
exports.getEpisodeList = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where sid=" + sid + " order by chapter";
		conn.query(sql, function(err, episodes) {
			conn.release();
			if(err) console.log(err);
			else if (episodes.length == 0) callback([]);
			else {
				var result = [];
				// episode마다 comment 개수 가져오기. 
				function getCommentNumCallback(comment_num, episode, next_index) {
					var tmp = {
						id : episode["id"],
						title: episode["title"],
						state: episode["state"],
						comment_num: comment_num,
						date: episode["date"],
						image: episode["image"],
						hits: episode["hits"]
					}
					result.push(tmp);

					// 마지막 episode면 callback함수 호출
					if (next_index == episodes.length) callback(result);
					// 마지막 episode가 아니면 다음 에피소드의 comment 개수를 가져옴.
					else comment.getEpisodeCommentNum(sid, episodes, next_index, getCommentNumCallback);
				}
				comment.getEpisodeCommentNum(sid, episodes, 0, getCommentNumCallback);
			}
		})
	})
}