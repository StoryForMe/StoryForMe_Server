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
				for(var [i, episode] of episodes.entries()) {
					comment.getEpisodeCommentNum(sid, episode["id"], (comment_num) => {
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
						if (i == episodes.length - 1)
						{
							console.log(result);
							callback(result);
						}
					});
				}
				
			}
		})
	})
}