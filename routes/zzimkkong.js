var express = require('express');
var router = express.Router();
const app = require('../app');

router.post('/writer', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "insert into ZZIMKKONG_WRITER SET ?";
    var values = {
      uid: req.body.uid,
      wid: req.body.wid
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) res.json({ result: 0 })
      else {
        res.json({ result: 1 })
      }
    })
  })
})

module.exports = router;