const res = require('express/lib/response');
const app = require('../app');
const comment = require('./comment');
const { updateSeriesKeyword } = require('./keyword');
const user = require('./user')
const series = require('./series');

// sid에 해당하는 시리즈의 에피소드 정보 목록을 가져옴.
exports.getEpisodeList = (res, sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where sid=" + sid + " order by chapter";
		conn.query(sql, function(err, episodes) {
			conn.release();
			if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else if (episodes.length == 0) callback([]);
			else {
				var result = [];
				var index = 0;
				// episode마다 comment 개수 가져오기. 
				function getCommentNumIterCallback(comment_num) {
					var tmp = {
						eid : episodes[index]["id"],
						title: episodes[index]["title"],
						state: episodes[index]["state"],
						comment_num: comment_num,
						date: episodes[index]["date"],
						image: episodes[index]["image"],
						hits: episodes[index]["hits"],
						chapter: episodes[index]["chapter"]
					}
					result.push(tmp);
					// 마지막 episode면 callback함수 호출
					if (index == episodes.length - 1) callback(result);
					// 마지막 episode가 아니면 다음 에피소드의 comment 개수를 가져옴.
					else comment.getEpisodeCommentNum(episodes[++index]["id"], getCommentNumIterCallback);
				}
				comment.getEpisodeCommentNum(episodes[index]["id"], getCommentNumIterCallback);
			}
		})
	})
}

exports.getEpisodeData = (res, eid, uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where id=" + eid;
		conn.query(sql, function(err, episode_list) {
			conn.release();
			if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else if(episode_list.length == 0) {
				res.status(400).json({ 
					error: "E001",
					error_message: "존재하지 않는 에피소드입니다."
				})
			}
			else {	
				series.updateHits(episode_list[0]["sid"], (result) => {
					if (result == 1) {
						var episode = {
							eid: episode_list[0]["id"],
							wid: episode_list[0]["uid"],
							title: episode_list[0]["title"],
							music: episode_list[0]["music"],
							image: episode_list[0]["image"],
							content: episode_list[0]["content"],
							chapter: episode_list[0]["chapter"],
							state: episode_list[0]["state"],
						}
						series.getCharacter(episode_list[0]["sid"], (fname, lname) => {
							episode["fname"] = fname;
							episode["lname"] = lname;
							if (uid != -1) {
								user.getUserData(uid, (user_data) => {
									if (user_data["is_default_name"] == 0) {
										episode["fname"] = user_data["fname"];
										episode["lname"] = user_data["lname"];
										callback(episode);
									}
									else callback(episode);
								})
							}
							else callback(episode);
						})
					}
				})
			}
	   })
	})
}