var express = require('express');
var router = express.Router();
const app = require('../app');

router.get('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from NOTICE";
		conn.query(sql, function(err, notices) {
			conn.release();
			if(err) console.log(err);
			else{
				var result = [];
				for (var notice of notices) {
					result.push({
						id: notice["id"],
						title: notice["title"],
						hits: notice["hits"],
						date: notice["date"]
					});
				}
				res.json({ notice_list: result })
			}
		})
	})
})

router.get('/:id', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from NOTICE where id=" + req.params.id;
		conn.query(sql, function(err, notices) {
			if (err) console.log(err);
			else {
				res.json({
					title: notices[0]["title"],
					content: notices[0]["content"],
					hits: notices[0]["hits"],
					date: notices[0]["date"]
				})
			}
		})
	})
})

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into NOTICE SET ?";
		var values = {
			content: req.body.content,
			title: req.body.title,
			date: new Date(),
			hits: 0
		}
		conn.query(sql, values, function(err, results) {
			if(err) console.log(err); 
			else {
				// 방금 새로 만들어진 notice를 response로 보냄.
				sql = "select * from NOTICE where id=" + results.insertId;
				conn.query(sql, function(err, notices) {
					conn.release();
					if (err) console.log(err);
					else {
						res.json({
							title: notices[0]["title"],
							content: notices[0]["content"],
							hits: notices[0]["hits"],
							date: notices[0]["date"]
						})
					}
				})
			}
		})	
	})
})

router.put('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "update NOTICE SET content='" + req.body.content + "', title='" + req.body.title + "' where id=" + req.body.id;
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
		var sql = "delete from NOTICE where id=" + req.params.id;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 }); 
		})
	})
})


module.exports = router;