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
				for(var episode of episodes) {
					comment.getEpisodeCommentNum(sid, episode["id"], (comment_num) => {
						var tmp = {
							title: episode["title"],
							state: episode["state"],
							comment_num: comment_num,
							date: episode["date"],
							image: episode["image"],
							hits: episode["hits"]
						}
						console.log(tmp);
						result.push(tmp);
					});
				}
				console.log(result);
				callback(result);
			}
		})
	})
}