var express = require('express');
var router = express.Router();
const app = require('../app');

router.post('/', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "insert into `READ` SET ?";
    var values = {
      uid: req.body.uid,
      sid: req.body.sid,
      recent_episode: req.body.chapter
    }

    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E001",
          error_message: "존재하지 않는 id가 있음"
        })
      }
      else {
        res.json({ result: 1 })
      }
    })
  })
})

router.delete('/:uid/:sid', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "delete from READ where uid=" + req.params.uid + ' and sid=' + req.params.sid;

    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(results.affectedRows == 0) res.json({ result: 0 })
      else res.json({ result: 1 });
    })
  })
})

module.exports = router;