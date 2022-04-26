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
					var tmp = {
						title: episode["title"],
						state: episode["state"],
						date: episode["date"],
						image: episode["image"],
						hits: episode["hits"]
					}
					comment.getEpisodeCommentNum(sid, episode["id"], (comment_num) => {
						tmp["comment_num"] = comment_num;
						result.push(tmp);
					});
				}
				console.log(result);
				callback(result);
			}
		})
	})
}