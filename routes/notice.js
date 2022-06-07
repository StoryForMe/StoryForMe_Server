var express = require('express');
var router = express.Router();
const app = require('../app');

function getNoticeData(nid, callback) {
	app.getConnectionPool((conn) => {
		var sql = "select * from NOTICE where id=" + nid;
		conn.query(sql, function(err, notices) {
			conn.release();
			if (err) console.log(err);
			else {
				callback({
					nid: notices[0]["id"],
					title: notices[0]["title"],
					content: notices[0]["content"],
					hits: notices[0]["hits"],
					date: notices[0]["date"]
				})
			}
		})
	})
}

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

router.get('/:nid', (req,res) => {
	app.getConnectionPool((conn) => {
		var sql = "update NOTICE SET hits = hits + 1 where id=" + req.params.nid;
		conn.query(sql, function(err, notices) {
			conn.release();
			if(err) console.log(err);
			else{
				getNoticeData(req.params.nid, (notice) => res.json(notice));
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
			conn.release();
			if(err) console.log(err); 
			else {
				getNoticeData(results.insertId, (notice) => res.json(notice));
			}
		})	
	})
})

router.patch('/', (req, res) => {
	if (req.body.id == undefined) {
		res.json({ 
			error: "E005",
			error_message: "수정할 공지의 id 정보가 누락됨."
		})
	}
	app.getConnectionPool((conn) => {
		var sql = "update NOTICE SET ? where id=" + req.body.id;
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
					error_message: "해당 공지가 존재하지 않음."
				})
			}
			else getNoticeData(req.body.id, (notice) => res.json(notice));
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