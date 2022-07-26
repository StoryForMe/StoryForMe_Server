var express = require('express');
var router = express.Router();
const app = require('../app');
const series = require('../utils/series');
const comment = require('../utils/comment');
const episode = require('../utils/episode');
const read = require('../utils/read');

router.get('/:eid/comment', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + req.params.eid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) {
				res.status(400).json({
				  error: "E002",
				  error_message: "query 문법 오류"
				})
			}
			else if(comments.length == 0) res.json([]);
			else {
				var _comments = [];
				function getNameCallback(name, _comment, next_index) {
					_comments.push({
						uid: _comment["uid"],
						cid: _comment["id"],
						name: name,
						content: _comment["content"],
						date: _comment["date"]
					});
					if (next_index == comments.length) res.json(_comments);
					else comment.getNameIter(res, comments, next_index, getNameCallback);
				}
				comment.getNameIter(res, comments, 0, getNameCallback);
			}
	   })
	})
})

router.get('/:eid/:uid', (req, res) => {
  console.log("0 " + req.params.uid);
	episode.getEpisodeData(res, req.params.eid, req.params.uid, (episode_data) => {
    console.log("1 " + req.params.uid);
    episode.getEpisodeSid(res, req.params.eid, (sid) => {
      console.log("2 " + req.params.uid);
      read.recordReadInfo(res, req.params.uid, sid, req.params.eid, episode_data["chapter"], new Date(), (result) => {
        console.log("3 " + req.params.uid);
        res.json(episode_data)
      })
    })
  });
})

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
		var date = new Date();
		var sql = "insert into EPISODE SET ?";
		var values = {
			sid: req.body.sid,
			uid: req.body.uid,
			title: req.body.title,
			music: req.body.music,
			content: req.body.content,
			image: req.body.image,
			state: req.body.state,
			chapter: req.body.chapter,
			date: date
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) {
				if (err.code == 'ER_DUP_ENTRY') {
				  res.status(400).json({ 
					error: "E004",
					error_message: "chapter 중복"
				  })
				}
				else {
					res.status(400).json({
					  error: "E002",
					  error_message: "query 문법 오류"
					})
				}
			  }
			else {
				series.updateEpisodeNum(res, req.body.sid, 1, (result) => {
					if (result == 1) 
						series.updateRecentUpdate(res, req.body.sid, date, () => {
							episode.getEpisodeData(res, results.insertId, -1, (episode_data) => res.json(episode_data)); 
						})
				})
			}
		})	
	})
})

router.patch('/', (req,res) => {
	if (req.body.id == undefined) {
		res.status(400).json({ 
			error: "E005",
			error_message: "수정할 에피소드의 id 정보가 누락됨."
		})
	}
	app.getConnectionPool((conn) => {
		var sql = "update EPISODE SET ? where id=" + req.body.id;
		var values = {};
		var date = new Date();
		for(var key in req.body) {
			if (key != "id") values[key] = req.body[key]
		}
		values["date"] = date;
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) {
				res.status(400).json({
				  error: "E002",
				  error_message: "query 문법 오류"
				})
			}
			else { 
				if (results.affectedRows == 0) {
					res.status(400).json({ 
						error: "E001",
						error_message: "해당 에피소드가 존재하지 않음."
					})
				} 
				else {
					episode.getEpisodeSid(req, req.body.id, (sid) => {
						series.updateRecentUpdate(res, sid, date, () => {
							episode.getEpisodeData(res, req.body.id, -1, (episode_data) => res.json(episode_data)); 
						});
					});
				}
			}
		})	
		
	})
})

router.delete('/:eid', (req, res) => {
	app.getConnectionPool((conn) => {
		episode.getEpisodeSid(res, req.params.eid, (sid) => {
			sql = "delete from EPISODE where id=" + req.params.eid;
			conn.query(sql, function(err, results) {
				conn.release();
				if(err) console.log(err);
				else if (results.affectedRows == 0) res.json({ result: 0 }); 
				else {
					series.updateEpisodeNum(res, sid, -1, (result) => {
						res.json({ result: result }); 
					})
				}
			})
		})
	})
})

module.exports = router;