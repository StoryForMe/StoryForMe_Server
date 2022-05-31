var express = require('express');
var router = express.Router();
const app = require('../app');
const series = require('../utils/series');
const comment = require('../utils/comment');

router.get('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from EPISODE where id=" + req.params.id;
		conn.query(sql, function(err, episode) {
			conn.release();
			if(err) console.log(err);
			else if(!episode) {console.log("no exist episode"); res.json({validation: 0});}
			else {	
				series.updateHits(episode[0]["sid"], (result) => {
					if (result == 1) {
						series.getCharacter(episode[0]["sid"], (fname, lname) => {
							res.json({
								uid: episode[0]["uid"],
								title: episode[0]["title"],
								music: episode[0]["music"],
								image: episode[0]["image"],
								content: episode[0]["content"],
								chapter: episode[0]["chapter"],
								state: episode[0]["state"],
								fname: fname,
								lname: lname
							});
						})
					}
				})
			}
	   })
	})
})

router.get('/:id/comment', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from COMMENT where eid=" + req.params.id;
		conn.query(sql, function(err, comments) {
			conn.release();
			if(err) console.log(err);
			else if(!comments) {console.log("no exist comment"); res.json({validation: 0});}
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
					else comment.getNameIter(comments, next_index, getNameCallback);
				}
				comment.getNameIter(comments, 0, getNameCallback);
			}
	   })
	})
})

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
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
			date: new Date()
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err); 
			else {
				series.updateEpisodeNum(req.params.sid, 1, (result) => {
					res.json({ result: result }); 
				})
			}
		})	
	})
})

router.put('/', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "update EPISODE SET ? where id=" + req.body.id;
		var values = {
			title: req.body.title,
			music: req.body.music,
			content: req.body.content,
			image: req.body.image,
			state: req.body.state,
			date: new Date()
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else { 
				if (results.affectedRows == 0) res.json({ result: 0 }); 
				else res.json({ result: 1 }); 
			}
		})	
		
	})
})

router.put('/state', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "update EPISODE SET state=" + req.body.state + " where id=" + req.body.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 }); 
		})	
		
	})
})

router.delete('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from EPISODE where id=" + req.params.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else {
				series.updateEpisodeNum(req.params.sid, -1, (result) => {
					res.json({ result: result }); 
				})
			}
		})
	})
})

module.exports = router;