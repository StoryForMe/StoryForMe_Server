const app = require('../app');
const comment = require('./comment');

exports.getEpisodeList = (sid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where sid=" + sid;
		conn.query(sql, function(err, episodes) {
			conn.release();
			if(err) console.log("getEpisodeList err");
			else {
				var result = [];
				function getCommentNumCallback(comment_num, episode, next_index) {
					var tmp = {
						id : episode["id"],
						title: episode["title"],
						state: episode["state"],
						comment_num: comment_num,
						date: episode["date"].toStringByFormatting(new Date(), '.'),
						image: episode["image"],
						hits: episode["hits"]
					}
					result.push(tmp);
					if (next_index == episodes.length) {
						console.log(result);
						callback(result);
					}
					else comment.getEpisodeCommentNum(sid, episodes, next_index, getCommentNumCallback);
				}
				comment.getEpisodeCommentNum(sid, episodes, 0, getCommentNumCallback);
			}
		})
	})
}