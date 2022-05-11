var express = require('express');
var router = express.Router();
const app = require('../app');
const series = require('../utils/series');
const comment = require('../utils/comment');

router.get('/:sid/:eid', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where id=" + req.params.eid + " and sid=" + req.params.sid;
		conn.query(sql, function(err, episode) {
			conn.release();
			if(err) console.log(err);
			else if(!episode) {console.log("no exist episode"); res.json({validation: 0});}
			else {	
				series.getCharacter(req.params.sid, (fname, lname) => {
					res.json({
						title: episode[0]["title"],
						music: episode[0]["music"],
						image: episode[0]["image"],
						content: episode[0]["content"],
						state: episode[0]["state"],
						fname: fname,
						lname: lname
					});
				})
			}
	   })
	})
})

router.get('/:sid/:eid/comment', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + req.params.eid + " and esid=" + req.params.sid;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log(err);
			else if(!comments) {console.log("no exist comment"); res.json({validation: 0});}
			else {
				var _comments = [];
				function getNameCallback(name, _comment, next_index) {
					if (next_index == comments.length) res.json(_comments);
					else {
						_comments.push({
							uid: _comment["uid"],
							name: name,
							content: _comment["content"],
							date: _comment["date"]
						});
						comment.getName(comments, next_index, getNameCallback);
					}
				}
				comment.getName(comments, 0, getNameCallback);
			}
	   })
	})
})

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
		series.getEpisodeNum(req.body.sid, (episode_num) => {
			var sql = "insert into EPISODE SET ?";
			var values = {
				id: episode_num + 1,
				sid: req.body.sid,
				uid: req.body.uid,
				title: req.body.title,
				music: req.body.music,
				content: req.body.content,
				image: req.body.image,
				state: req.body.state,
				hits: 0,
				date: new Date()
			}
			conn.query(sql, values, function(err, results) {
				conn.release();
				if(err) console.log(err);
				else { res.json({ result: 1 }); }
			})	
		})
	})
})

module.exports = router;