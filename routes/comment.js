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
			date: new Date()
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err); 
			else comment.getCommentData(results.insertId, (comment_data) => res.json(comment_data));
		})	
	})
})

router.patch('/', (req, res) => {
	if (req.body.id == undefined) {
		res.json({ 
			error: "E005",
			error_message: "수정할 댓글의 id 정보가 누락됨."
		})
	}
	app.getConnectionPool((conn) => {
		var sql = "update COMMENT SET ? where id=" + req.body.id;
		var values = {};
		for(var key in req.body) {
			if (key != "id") values[key] = req.body[key]
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else if (results.affectedRows == 0) {
				res.json({ 
					error: "E001",
					error_message: "해당 댓글이 존재하지 않음."
				})
			}
			else comment.getCommentData(results.insertId, (comment_data) => res.json(comment_data));
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