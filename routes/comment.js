var express = require('express');
var router = express.Router();
const app = require('../app');
const comment = require('../utils/comment')

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into COMMENT SET ?";
		var values = {
			content: req.body.content,
			uid: req.body.uid,
			eid: req.body.eid,
			esid: req.body.esid,
			date: new Date()
		}
		conn.query(sql, values, function(err, results) {
			if(err) console.log(err); 
			else {
				// 방금 새로 만들어진 comment를 response로 보냄.
				sql = "select * from COMMENT where id=" + results.insertId;
				conn.query(sql, function(err, comments) {
					conn.release();
					if (err) console.log(err);
					else {
						comment.getName(comments[0]["uid"], (name) => {
							res.json({
								uid: comments[0]["uid"],
								cid: comments[0]["id"],
								name: name,
								content: comments[0]["content"],
								date: comments[0]["date"]
							})
						})
					}
				})
			}
		})	
	})
})

router.put('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "update COMMENT SET content='" + req.body.content + "' where id=" + req.body.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 });
		})
	})
})

router.delete('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from COMMENT where id=" + req.params.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 }); 
		})
	})
})

module.exports = router;