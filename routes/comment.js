var express = require('express');
var router = express.Router();
const app = require('../app');

router.post('/', (req,res) => {
	app.getConnectionPool((conn) => {
		series.getEpisodeNum(req.body.sid, (episode_num) => {
			var sql = "insert into COMMENT SET ?";
			var values = {
				content: req.body.content,
				uid: req.body.uid,
				eid: req.body.eid,
				esid: req.body.esid,
				date: new Date()
			}
			conn.query(sql, values, function(err, results) {
				conn.release();
				if(err) console.log(err); 
				else res.json({ result: 1 });
			})	
		})
	})
})

module.exports = router;