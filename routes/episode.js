const app = require('../app');

exports.getEpisodeList = (sid) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where sid=" + sid;
		conn.query(sql, function(err, episodes) {
			if(err) console.log("err");
			else {
				var result = [];
				episodes.array.forEach(episode => {
					result.push({
						title: episode.title,
						state: episode.state,
						comment_num: getEpisodeCommentNum(sid, episode.id),
						date: episode.date,
						image: episode.image,
						hits: episode.hits
					})
				});
				return (result);
			}
		})
		conn.release();
	})
}